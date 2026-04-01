<template>
  <div class="im-group-message-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search-form-container" id="art-table-header">
        <ElForm :model="searchParams" inline class="search-form">
          <ElFormItem label="群聊">
            <ElSelect v-model="searchParams.group_id" placeholder="全部" style="width: 150px" clearable filterable>
              <ElOption v-for="item in groupOptions" :key="item.value" :label="item.label" :value="item.value" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="发送者">
            <ElInput v-model="searchParams.sender_name" placeholder="请输入" style="width: 150px" clearable />
          </ElFormItem>
          <ElFormItem label="消息类型">
            <ElSelect v-model="searchParams.message_type" placeholder="全部" style="width: 120px" clearable>
              <ElOption label="文字" value="text" />
              <ElOption label="图片" value="image" />
              <ElOption label="语音" value="voice" />
              <ElOption label="视频" value="video" />
              <ElOption label="文件" value="file" />
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
            <ElButton type="danger" @click="handleBatchDelete" :disabled="!selectedIds.length">
              <template #icon><ArtSvgIcon icon="ri:delete-bin-line" /></template>
              批量删除
            </ElButton>
          </div>
        </ElForm>
      </div>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        row-key="id"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { ElButton, ElMessageBox, ElTag, ElAvatar, ElImage } from 'element-plus'
import {
  fetchGroupMessageList,
  deleteGroupMessage,
  batchDeleteGroupMessage,
  fetchGroupOptions,
  ImGroupMessage
} from '@/api/im'

defineOptions({ name: 'ImGroupMessage' })

const groupOptions = ref<{ value: number; label: string }[]>([])
const dateRange = ref<[string, string] | null>(null)
const selectedIds = ref<number[]>([])

const searchParams = reactive({
  page: 1,
  limit: 20,
  group_id: '' as number | string,
  sender_name: '',
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
  const colors: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary' | ''> = {
    text: 'info',
    image: 'success',
    voice: 'warning',
    video: 'danger',
    file: ''
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
    apiFn: fetchGroupMessageList,
    apiParams: searchParams,
    paginationKey: { current: 'page', size: 'limit' },
    columnsFactory: () => [
      { type: 'selection', width: 50, align: 'center' },
      { prop: 'id', label: 'ID', width: 80, sortable: true, align: 'center' },
      { prop: 'group_name', label: '群聊', width: 150 },
      {
        prop: 'sender_avatar',
        label: '发送者',
        width: 180,
        formatter: (row: ImGroupMessage) =>
          h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
            h(ElAvatar, { src: row.sender_avatar, size: 32 }),
            h('span', row.sender_name)
          ])
      },
      {
        prop: 'message_type',
        label: '类型',
        width: 80,
        align: 'center',
        formatter: (row: ImGroupMessage) =>
          h(ElTag, { type: getMessageTypeColor(row.message_type), size: 'small' }, () => row.message_type_text)
      },
      {
        prop: 'content',
        label: '内容',
        minWidth: 200,
        formatter: (row: ImGroupMessage) => {
          if (row.message_type === 'image') {
            return h(ElImage, {
              src: row.content,
              style: 'width: 60px; height: 60px;',
              fit: 'cover',
              previewSrcList: [row.content]
            })
          }
          return h('span', { class: 'text-ellipsis' }, row.content)
        }
      },
      { prop: 'created_at', label: '发送时间', width: 180, align: 'center' },
      {
        prop: 'action',
        label: '操作',
        width: 100,
        fixed: 'right',
        align: 'center',
        formatter: (row: ImGroupMessage) =>
          h(ElButton, { type: 'danger', size: 'small', onClick: () => handleDelete(row) }, () => '删除')
      }
    ]
  }
})

const handleSelectionChange = (rows: ImGroupMessage[]) => {
  selectedIds.value = rows.map(r => r.id)
}

const resetSearch = () => {
  searchParams.group_id = ''
  searchParams.sender_name = ''
  searchParams.message_type = ''
  searchParams.sDate = ''
  searchParams.eDate = ''
  dateRange.value = null
  refreshData()
}

const handleDelete = (row: ImGroupMessage) => {
  ElMessageBox.confirm('确定删除该消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteGroupMessage(row.id)
    refreshData()
  })
}

const handleBatchDelete = () => {
  if (!selectedIds.value.length) return
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条消息吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await batchDeleteGroupMessage(selectedIds.value)
    selectedIds.value = []
    refreshData()
  })
}

const loadGroupOptions = async () => {
  try {
    const res = await fetchGroupOptions()
    if (res) {
      groupOptions.value = res
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadGroupOptions()
})
</script>

<style scoped>
.search-form-container {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}
.text-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
