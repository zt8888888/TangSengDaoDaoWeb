<template>
  <div class="im-group-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <div class="search-form-container" id="art-table-header">
        <ElForm :model="searchParams" inline class="search-form">
          <ElFormItem label="群名称">
            <ElInput v-model="searchParams.name" placeholder="请输入" style="width: 150px" clearable />
          </ElFormItem>
          <ElFormItem label="群主">
            <ElInput v-model="searchParams.owner_name" placeholder="请输入" style="width: 150px" clearable />
          </ElFormItem>
          <ElFormItem label="状态">
            <ElSelect v-model="searchParams.status" placeholder="全部" style="width: 120px" clearable>
              <ElOption label="正常" :value="1" />
              <ElOption label="禁用" :value="0" />
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
            <ElButton type="success" @click="openCreateDialog">
              <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
              创建群聊
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

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <ElFormItem label="群名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入群名称" maxlength="50" />
        </ElFormItem>
        <ElFormItem label="群头像" prop="avatar">
          <ElInput v-model="formData.avatar" placeholder="请输入头像URL" />
        </ElFormItem>
        <ElFormItem label="群公告" prop="notice">
          <ElInput v-model="formData.notice" type="textarea" :rows="3" placeholder="请输入群公告" maxlength="500" />
        </ElFormItem>
        <ElFormItem label="最大人数" prop="max_members">
          <ElInputNumber v-model="formData.max_members" :min="10" :max="1000" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">确定</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="membersDialogVisible" title="群成员" width="700px" destroy-on-close>
      <ElTable :data="groupMembers" v-loading="loadingMembers">
        <ElTableColumn prop="username" label="用户名" width="120" />
        <ElTableColumn prop="nickname" label="昵称" width="120" />
        <ElTableColumn prop="role_text" label="角色" width="80">
          <template #default="{ row }">
            <ElTag :type="row.role === 'owner' ? 'danger' : row.role === 'admin' ? 'warning' : 'info'" size="small">
              {{ row.role_text }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="joined_at" label="加入时间" width="180" />
        <ElTableColumn label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <ElButton
              v-if="row.role !== 'owner'"
              type="danger"
              size="small"
              @click="handleRemoveMember(row)"
            >
              移除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { ElButton, ElMessageBox, ElTag, ElAvatar, FormInstance } from 'element-plus'
import {
  fetchGroupList,
  createGroup,
  updateGroup,
  deleteGroup,
  toggleGroupStatus,
  fetchGroupMembers,
  removeGroupMember,
  ImGroup,
  ImGroupMember
} from '@/api/im'

defineOptions({ name: 'ImGroup' })

const searchParams = reactive({
  page: 1,
  limit: 20,
  name: '',
  owner_name: '',
  status: '' as number | string
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
    apiFn: fetchGroupList,
    apiParams: searchParams,
    paginationKey: { current: 'page', size: 'limit' },
    columnsFactory: () => [
      { prop: 'id', label: 'ID', width: 80, sortable: true, align: 'center' },
      {
        prop: 'avatar',
        label: '头像',
        width: 80,
        align: 'center',
        formatter: (row: ImGroup) =>
          h(ElAvatar, { src: row.avatar, size: 40 })
      },
      { prop: 'name', label: '群名称', width: 150 },
      { prop: 'owner_name', label: '群主', width: 120, align: 'center' },
      { prop: 'member_count', label: '成员数', width: 100, align: 'center' },
      { prop: 'max_members', label: '最大人数', width: 100, align: 'center' },
      {
        prop: 'status',
        label: '状态',
        width: 80,
        align: 'center',
        formatter: (row: ImGroup) =>
          h(ElTag, { type: row.status === 1 ? 'success' : 'danger', size: 'small' }, () => row.status_text)
      },
      { prop: 'notice', label: '群公告', minWidth: 150, showOverflowTooltip: true },
      { prop: 'created_at', label: '创建时间', width: 180, align: 'center' },
      {
        prop: 'action',
        label: '操作',
        width: 220,
        fixed: 'right',
        align: 'center',
        formatter: (row: ImGroup) =>
          h('div', { class: 'table-actions' }, [
            h(ElButton, { type: 'primary', size: 'small', onClick: () => openEditDialog(row) }, () => '编辑'),
            h(ElButton, { type: 'info', size: 'small', onClick: () => openMembersDialog(row) }, () => '成员'),
            h(ElButton, { type: row.status === 1 ? 'warning' : 'success', size: 'small', onClick: () => handleToggleStatus(row) }, () => row.status === 1 ? '禁用' : '启用'),
            h(ElButton, { type: 'danger', size: 'small', onClick: () => handleDelete(row) }, () => '删除')
          ])
      }
    ]
  }
})

const resetSearch = () => {
  searchParams.name = ''
  searchParams.owner_name = ''
  searchParams.status = ''
  refreshData()
}

const dialogVisible = ref(false)
const dialogTitle = ref('创建群聊')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const formData = reactive({
  name: '',
  avatar: '',
  notice: '',
  max_members: 200
})

const formRules = {
  name: [{ required: true, message: '请输入群名称', trigger: 'blur' }]
}

const openCreateDialog = () => {
  editingId.value = null
  dialogTitle.value = '创建群聊'
  formData.name = ''
  formData.avatar = ''
  formData.notice = ''
  formData.max_members = 200
  dialogVisible.value = true
}

const openEditDialog = (row: ImGroup) => {
  editingId.value = row.id
  dialogTitle.value = '编辑群聊'
  formData.name = row.name
  formData.avatar = row.avatar
  formData.notice = row.notice
  formData.max_members = row.max_members
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (editingId.value) {
        await updateGroup({ id: editingId.value, ...formData })
      } else {
        await createGroup(formData)
      }
      dialogVisible.value = false
      refreshData()
    } finally {
      submitting.value = false
    }
  })
}

const handleToggleStatus = (row: ImGroup) => {
  const action = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确定${action}该群聊吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await toggleGroupStatus(row.id)
    refreshData()
  })
}

const handleDelete = (row: ImGroup) => {
  ElMessageBox.confirm('确定删除该群聊吗？删除后所有消息将被清除', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteGroup(row.id)
    refreshData()
  })
}

const membersDialogVisible = ref(false)
const groupMembers = ref<ImGroupMember[]>([])
const loadingMembers = ref(false)
const currentGroupId = ref<number>(0)

const openMembersDialog = async (row: ImGroup) => {
  currentGroupId.value = row.id
  membersDialogVisible.value = true
  loadingMembers.value = true
  try {
    const res = await fetchGroupMembers(row.id)
    groupMembers.value = res?.list || []
  } finally {
    loadingMembers.value = false
  }
}

const handleRemoveMember = (member: ImGroupMember) => {
  ElMessageBox.confirm(`确定将 ${member.username} 移出群聊吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await removeGroupMember(currentGroupId.value, member.user_id)
    const res = await fetchGroupMembers(currentGroupId.value)
    groupMembers.value = res?.list || []
    refreshData()
  })
}
</script>

<style scoped>
.search-form-container {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}
.table-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
