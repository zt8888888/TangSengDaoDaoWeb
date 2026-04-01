<template>
  <div class="chat28-message-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      
      <div class="search-form-container" id="art-table-header">
        <ElForm :model="searchParams" inline class="search-form">
          <ElFormItem label="彩种">
            <ElSelect v-model="searchParams.lottery_code" placeholder="全部" style="width: 150px" clearable>
              <ElOption
                v-for="item in lotteryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="用户名">
            <ElInput v-model="searchParams.username" placeholder="请输入" style="width: 150px" clearable />
          </ElFormItem>
          <ElFormItem label="消息类型">
            <ElSelect v-model="searchParams.message_type" placeholder="全部" style="width: 120px" clearable>
              <ElOption label="投注" value="bet" />
              <ElOption label="文字" value="text" />
              <ElOption label="系统" value="system" />
              <ElOption label="开奖" value="result" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="日期">
            <ElDatePicker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
              @change="handleDateChange"
            />
          </ElFormItem>
          
          <ElFormItem>
            <ElButton type="primary" @click="refreshData">
              <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
              搜索
            </ElButton>
            <ElButton @click="resetSearch">
              <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
              重置
            </ElButton>
          </ElFormItem>

          <div style="float: right">
            <ElButton type="success" @click="openSendDialog">
              <template #icon><ArtSvgIcon icon="ri:send-plane-line" /></template>
              发送系统消息
            </ElButton>
          </div>
        </ElForm>
      </div>

      
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    
    <ElDialog
      v-model="sendDialogVisible"
      title="发送系统消息"
      width="500px"
      destroy-on-close
    >
      <ElForm ref="sendFormRef" :model="sendFormData" :rules="sendRules" label-width="80px">
        <ElFormItem label="彩种" prop="lottery_code">
          <ElSelect v-model="sendFormData.lottery_code" placeholder="请选择" style="width: 100%">
            <ElOption
              v-for="item in lotteryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="内容" prop="content">
          <ElInput
            v-model="sendFormData.content"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容"
            maxlength="500"
            show-word-limit
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="sendDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSend" :loading="sending">发送</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { ElButton, ElMessageBox, ElTag, FormInstance } from 'element-plus'
import {
  fetchMessageList,
  deleteMessage,
  sendSystemMessage,
  fetchLotteryOptions,
  ChatMessage,
  LotteryOption
} from '@/api/chat28'

defineOptions({ name: 'Chat28Message' })

const lotteryOptions = ref<LotteryOption[]>([])

const dateRange = ref<[string, string] | null>(null)

const searchParams = reactive({
  page: 1,
  limit: 20,
  lottery_code: '',
  username: '',
  message_type: '',
  sDate: '',
  eDate: ''
})

const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    searchParams.sDate = val[0]
    searchParams.eDate = val[1]
  } else {
    searchParams.sDate = ''
    searchParams.eDate = ''
  }
}

const getMessageTypeColor = (type: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const colors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    bet: 'success',
    text: 'info',
    system: 'warning',
    result: 'danger'
  }
  return colors[type] || 'info'
}

const {
  columns,
  data,
  loading,
  pagination,
  refreshData,
  handleSizeChange,
  handleCurrentChange
} = useTable({
  core: {
    apiFn: fetchMessageList,
    apiParams: searchParams,
    paginationKey: {
      current: 'page',
      size: 'limit'
    },
    columnsFactory: () => [
      { prop: 'id', label: 'ID', width: 80, sortable: true, align: 'center' },
      { prop: 'lottery_code', label: '彩种', width: 100, align: 'center' },
      { prop: 'issue', label: '期号', width: 140, align: 'center' },
      {
        prop: 'user_name',
        label: '用户',
        width: 120,
        align: 'center',
        formatter: (row: ChatMessage) => {
          if (row.is_system) {
            return h(ElTag, { type: 'warning', size: 'small' }, () => '系统')
          }
          return row.user_name
        }
      },
      {
        prop: 'message_type',
        label: '类型',
        width: 100,
        align: 'center',
        formatter: (row: ChatMessage) =>
          h(
            ElTag,
            { type: getMessageTypeColor(row.message_type), size: 'small' },
            () => row.message_type_text
          )
      },
      {
        prop: 'content',
        label: '内容',
        minWidth: 200,
        showOverflowTooltip: true
      },
      { prop: 'created_at', label: '时间', width: 180, align: 'center' },
      {
        prop: 'action',
        label: '操作',
        width: 100,
        fixed: 'right',
        align: 'center',
        formatter: (row: ChatMessage) =>
          h(
            ElButton,
            {
              type: 'danger',
              size: 'small',
              onClick: () => handleDelete(row)
            },
            () => '删除'
          )
      }
    ]
  }
})

const loadLotteryOptions = async () => {
  try {
    const res = await fetchLotteryOptions()
    if (res) {
      lotteryOptions.value = res
    }
  } catch (e) {
    console.error(e)
  }
}

const resetSearch = () => {
  searchParams.lottery_code = ''
  searchParams.username = ''
  searchParams.message_type = ''
  searchParams.sDate = ''
  searchParams.eDate = ''
  dateRange.value = null
  refreshData()
}

const handleDelete = (row: ChatMessage) => {
  ElMessageBox.confirm('确定删除该消息吗？删除后将同步撤回聊天室消息', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMessage(row.id)
      refreshData()
    } catch (e) {
      console.error(e)
    }
  })
}

const sendDialogVisible = ref(false)
const sending = ref(false)
const sendFormRef = ref<FormInstance>()

const sendFormData = reactive({
  lottery_code: '',
  content: ''
})

const sendRules = {
  lottery_code: [{ required: true, message: '请选择彩种', trigger: 'change' }],
  content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }]
}

const openSendDialog = () => {
  sendFormData.lottery_code = lotteryOptions.value[0]?.value || ''
  sendFormData.content = ''
  sendDialogVisible.value = true
}

const handleSend = async () => {
  if (!sendFormRef.value) return

  await sendFormRef.value.validate(async (valid) => {
    if (!valid) return

    sending.value = true
    try {
      await sendSystemMessage(sendFormData)
      sendDialogVisible.value = false
      refreshData()
    } catch (e) {
      console.error(e)
    } finally {
      sending.value = false
    }
  })
}

onMounted(() => {
  loadLotteryOptions()
})
</script>

<style scoped>
.search-form-container {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}
</style>


