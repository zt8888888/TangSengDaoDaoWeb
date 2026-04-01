<template>
  <div class="chat28-robot-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      
      <div class="search-form-container" id="art-table-header">
        <ElForm :model="searchParams" inline class="search-form">
          <ElFormItem label="用户名/昵称">
            <ElInput v-model="searchParams.username" placeholder="请输入" style="width: 180px" clearable />
          </ElFormItem>
          <ElFormItem label="状态">
            <ElSelect v-model="searchParams.status" placeholder="全部" style="width: 120px" clearable>
              <ElOption label="正常" value="normal" />
              <ElOption label="禁用" value="locked" />
            </ElSelect>
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
            <ElButton type="success" @click="openBatchRechargeDialog">
              <template #icon><ArtSvgIcon icon="ri:money-cny-circle-line" /></template>
              批量充值
            </ElButton>
            <ElButton type="warning" @click="openBatchCreateDialog">
              <template #icon><ArtSvgIcon icon="ri:group-line" /></template>
              批量创建
            </ElButton>
            <ElButton type="primary" @click="openAddDialog">
              <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
              添加机器人
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
      v-model="dialogVisible"
      :title="isEdit ? '编辑机器人' : '添加机器人'"
      width="500px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <ElFormItem label="用户名" prop="username" v-if="!isEdit">
          <ElInput v-model="formData.username" placeholder="请输入用户名" />
        </ElFormItem>
        <ElFormItem label="昵称" prop="nickname">
          <ElInput v-model="formData.nickname" placeholder="请输入昵称" />
        </ElFormItem>
        <ElFormItem label="头像" prop="face">
          <ElInput v-model="formData.face" placeholder="请输入头像URL" />
        </ElFormItem>
        <ElFormItem label="余额" prop="balance">
          <ElInputNumber v-model="formData.balance" :min="0" :max="999999" style="width: 100%" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="formData.islock">
            <ElRadio :label="0">正常</ElRadio>
            <ElRadio :label="1">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">确定</ElButton>
      </template>
    </ElDialog>

    
    <ElDialog
      v-model="batchCreateVisible"
      title="批量创建机器人"
      width="450px"
      destroy-on-close
    >
      <ElForm ref="batchFormRef" :model="batchFormData" :rules="batchRules" label-width="100px">
        <ElFormItem label="用户名前缀" prop="prefix">
          <ElInput v-model="batchFormData.prefix" placeholder="例如: robot_" />
        </ElFormItem>
        <ElFormItem label="创建数量" prop="count">
          <ElInputNumber v-model="batchFormData.count" :min="1" :max="100" style="width: 100%" />
        </ElFormItem>
        <ElFormItem label="初始余额" prop="balance">
          <ElInputNumber v-model="batchFormData.balance" :min="0" :max="999999" style="width: 100%" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="batchCreateVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleBatchCreate" :loading="batchCreating">确定创建</ElButton>
      </template>
    </ElDialog>

    
    <ElDialog
      v-model="batchRechargeVisible"
      title="批量充值"
      width="450px"
      destroy-on-close
    >
      <ElAlert type="info" :closable="false" style="margin-bottom: 16px">
        将为余额低于阈值的机器人自动充值
      </ElAlert>
      <ElForm ref="rechargeFormRef" :model="rechargeFormData" label-width="120px">
        <ElFormItem label="余额阈值">
          <ElInputNumber v-model="rechargeFormData.min_balance" :min="0" :max="99999" style="width: 100%" />
          <div class="form-tip">余额低于此值的机器人将被充值</div>
        </ElFormItem>
        <ElFormItem label="充值金额">
          <ElInputNumber v-model="rechargeFormData.amount" :min="1" :max="999999" style="width: 100%" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="batchRechargeVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleBatchRecharge" :loading="recharging">确定充值</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { ElButton, ElMessageBox, ElTag, FormInstance } from 'element-plus'
import {
  fetchRobotList,
  createRobot,
  updateRobot,
  deleteRobot,
  batchCreateRobot,
  batchRechargeRobot,
  ChatRobot
} from '@/api/chat28'

defineOptions({ name: 'Chat28Robot' })

const searchParams = reactive({
  page: 1,
  limit: 20,
  username: '',
  status: ''
})

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
    apiFn: fetchRobotList,
    apiParams: searchParams,
    paginationKey: {
      current: 'page',
      size: 'limit'
    },
    columnsFactory: () => [
      { prop: 'id', label: 'ID', width: 80, sortable: true, align: 'center' },
      { prop: 'username', label: '用户名', width: 150, align: 'center' },
      { prop: 'nickname', label: '昵称', width: 150, align: 'center' },
      {
        prop: 'face',
        label: '头像',
        width: 80,
        align: 'center',
        formatter: (row: ChatRobot) => {
          if (row.face) {
            return h('img', {
              src: row.face,
              style: { width: '32px', height: '32px', borderRadius: '50%' }
            })
          }
          return h('span', { style: { color: '#999' } }, '无')
        }
      },
      {
        prop: 'balance',
        label: '余额',
        width: 120,
        align: 'center',
        formatter: (row: ChatRobot) => '¥' + parseFloat(String(row.balance)).toFixed(2)
      },
      {
        prop: 'islock',
        label: '状态',
        width: 100,
        align: 'center',
        formatter: (row: ChatRobot) =>
          h(
            ElTag,
            { type: row.islock === 0 ? 'success' : 'danger', size: 'small' },
            () => row.islock_text
          )
      },
      { prop: 'regtime', label: '注册时间', width: 180, align: 'center' },
      { prop: 'logintime', label: '最后登录', width: 180, align: 'center' },
      {
        prop: 'action',
        label: '操作',
        width: 150,
        fixed: 'right',
        align: 'center',
        formatter: (row: ChatRobot) =>
          h('div', [
            h(
              ElButton,
              { type: 'primary', size: 'small', onClick: () => openEditDialog(row) },
              () => '编辑'
            ),
            h(
              ElButton,
              { type: 'danger', size: 'small', onClick: () => handleDelete(row) },
              () => '删除'
            )
          ])
      }
    ]
  }
})

const resetSearch = () => {
  searchParams.username = ''
  searchParams.status = ''
  refreshData()
}

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const defaultFormData = {
  id: 0,
  username: '',
  nickname: '',
  face: '',
  balance: 10000,
  islock: 0
}

const formData = reactive({ ...defaultFormData })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(formData, defaultFormData)
  dialogVisible.value = true
}

const openEditDialog = (row: ChatRobot) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    face: row.face,
    balance: row.balance,
    islock: row.islock
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      if (isEdit.value) {
        await updateRobot(formData)
      } else {
        await createRobot(formData)
      }
      dialogVisible.value = false
      refreshData()
    } catch (e) {
      console.error(e)
    } finally {
      submitting.value = false
    }
  })
}

const handleDelete = (row: ChatRobot) => {
  ElMessageBox.confirm(`确定删除机器人【${row.nickname || row.username}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRobot(row.id)
      refreshData()
    } catch (e) {
      console.error(e)
    }
  })
}

const batchCreateVisible = ref(false)
const batchCreating = ref(false)
const batchFormRef = ref<FormInstance>()

const batchFormData = reactive({
  prefix: 'robot_',
  count: 10,
  balance: 10000
})

const batchRules = {
  prefix: [{ required: true, message: '请输入前缀', trigger: 'blur' }],
  count: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

const openBatchCreateDialog = () => {
  batchFormData.prefix = 'robot_'
  batchFormData.count = 10
  batchFormData.balance = 10000
  batchCreateVisible.value = true
}

const handleBatchCreate = async () => {
  if (!batchFormRef.value) return

  await batchFormRef.value.validate(async (valid) => {
    if (!valid) return

    batchCreating.value = true
    try {
      await batchCreateRobot(batchFormData)
      batchCreateVisible.value = false
      refreshData()
    } catch (e) {
      console.error(e)
    } finally {
      batchCreating.value = false
    }
  })
}

const batchRechargeVisible = ref(false)
const recharging = ref(false)
const rechargeFormRef = ref<FormInstance>()

const rechargeFormData = reactive({
  min_balance: 1000,
  amount: 10000
})

const openBatchRechargeDialog = () => {
  rechargeFormData.min_balance = 1000
  rechargeFormData.amount = 10000
  batchRechargeVisible.value = true
}

const handleBatchRecharge = async () => {
  recharging.value = true
  try {
    await batchRechargeRobot(rechargeFormData)
    batchRechargeVisible.value = false
    refreshData()
  } catch (e) {
    console.error(e)
  } finally {
    recharging.value = false
  }
}
</script>

<style scoped>
.search-form-container {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>


