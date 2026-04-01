<template>
  <div class="p-4">
    <div class="mb-4 bg-box p-4 rounded-lg shadow-sm">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <el-button type="primary" @click="handleAdd">
            <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            新增管理员
          </el-button>
        </div>
        <el-button @click="loadData">
          <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            刷新
        </el-button>
      </div>
    </div>

    <div class="bg-box p-4 rounded-lg shadow-sm">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" sortable />
        <el-table-column prop="username" label="用户名" min-width="120" align="center" />
        <el-table-column prop="nickname" label="昵称" min-width="120" align="center" />
        <el-table-column label="角色" min-width="120" align="center">
          <template #default="{ row }">
            {{ row.role_names_text || row.role_name || getRoleName(row.role_id) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status !== undefined ? row.status : row.state"
              :active-value="0"
              :inactive-value="1"
              @change="(val) => handleStatusChange(row, val as number)"
            />
          </template>
        </el-table-column>
        <el-table-column label="最后登录时间" width="180" align="center">
          <template #default="{ row }">
            {{ row.login_at_text || row.login_at || row.last_login_time || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ row.created_at || row.createtime || row.create_time || row.add_time || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              plain
              @click="handleEdit(row)"
            >编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              plain
              @click="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增管理员' : '编辑管理员'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="角色" prop="role_id">
          <el-select v-model="form.role_id" placeholder="请选择角色" class="w-full">
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="不修改请留空" show-password />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">启用</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  fetchAdminList,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminStatus,
  fetchRoleOptions,
  type AdminUser,
  type RoleOption
} from '@/api/system-admin'

const loading = ref(false)
const tableData = ref<AdminUser[]>([])
const roleOptions = ref<RoleOption[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: 0,
  username: '',
  nickname: '',
  role_id: undefined as number | undefined,
  password: '',
  status: 1
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  role_id: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchAdminList({
      page: pagination.page,
      limit: pagination.limit
    })
    console.log('Admin User List Response:', res)
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const res = await fetchRoleOptions()
    roleOptions.value = res
  } catch (error) {
    console.error(error)
  }
}

const getRoleName = (roleId: number) => {
  if (!roleId) return ''
  const role = roleOptions.value.find(r => r.id === roleId)
  return role ? role.name : ''
}

const handleSizeChange = (val: number) => {
  pagination.limit = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadData()
}

const handleStatusChange = async (row: AdminUser, val: number) => {
  try {
    await updateAdminStatus(row.id, val)
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = val === 1 ? 0 : 1
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.id = 0
  form.username = ''
  form.nickname = ''
  form.role_id = undefined
  form.password = ''
  form.status = 0
  dialogVisible.value = true
}

const handleEdit = (row: AdminUser) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.username = row.username
  form.nickname = row.nickname
  form.role_id = (row as any).role_ids?.[0] || row.role_id
  form.password = ''
  form.status = row.status
  dialogVisible.value = true
}

const handleDelete = (row: AdminUser) => {
  ElMessageBox.confirm(`确定要删除管理员 ${row.username} 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteAdmin(row.id)
    loadData()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const data: any = { ...form }
        if (!data.password) delete data.password
        if (data.role_id) {
          data.role_ids = [data.role_id]
        }

        if (dialogType.value === 'add') {
          if (!data.password) {
             ElMessage.warning('请输入密码')
             submitting.value = false
             return
          }
          await createAdmin(data)
        } else {
          await updateAdmin(data)
        }
        dialogVisible.value = false
        loadData()
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
  loadRoles()
})
</script>