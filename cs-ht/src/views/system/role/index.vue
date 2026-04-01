<template>
  <div class="p-4">
    <div class="mb-4 bg-box p-4 rounded-lg shadow-sm">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <el-button type="primary" @click="handleAdd">
            <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            新增角色
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
        <el-table-column prop="name" label="角色名称" min-width="150" align="center" />
        <el-table-column prop="desc" label="描述" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" align="center" />
        
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="warning" 
              plain
              @click="handlePermission(row)"
            >权限</el-button>
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
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="desc">
          <el-input v-model="form.desc" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
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

    
    <el-dialog
      v-model="permDialogVisible"
      title="分配权限"
      width="600px"
      destroy-on-close
    >
      <div class="h-[400px] overflow-y-auto">
        <el-tree
          ref="permTreeRef"
          :data="permTreeData"
          :props="{ label: 'label', children: 'children' }"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defaultCheckedKeys"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePermSubmit" :loading="permSubmitting">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type TreeInstance } from 'element-plus'
import {
  fetchRoleList,
  createRole,
  updateRole,
  deleteRole,
  fetchRuleTree,
  saveRoleRules,
  fetchRoleRuleIds,
  type AdminRole
} from '@/api/system-admin'

const loading = ref(false)
const tableData = ref<AdminRole[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const dialogVisible = ref(false)
const permDialogVisible = ref(false)
const permSubmitting = ref(false)
const permTreeData = ref<any[]>([])
const defaultCheckedKeys = ref<number[]>([])
const currentRoleId = ref(0)
const permTreeRef = ref<TreeInstance>()

const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: 0,
  name: '',
  desc: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchRoleList({
      page: pagination.page,
      limit: pagination.limit
    })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pagination.limit = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadData()
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.id = 0
  form.name = ''
  form.desc = ''
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: AdminRole) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.desc = row.desc || ''
  form.status = row.status
  dialogVisible.value = true
}

const handlePermission = async (row: AdminRole) => {
  currentRoleId.value = row.id
  permDialogVisible.value = true
  permTreeData.value = []
  defaultCheckedKeys.value = []

  try {

    const [treeRes, idsRes] = await Promise.all([
      fetchRuleTree(row.id),
      fetchRoleRuleIds(row.id)
    ])

    console.log('Tree Response:', treeRes)

    let treeData: any[] = []
    if (Array.isArray(treeRes)) {
      treeData = treeRes
    } else if (treeRes && Array.isArray(treeRes.data)) {
      treeData = treeRes.data
    } else if (treeRes && Array.isArray(treeRes.list)) {
      treeData = treeRes.list
    } else if (treeRes && Array.isArray(treeRes.tree)) {
      treeData = treeRes.tree
    } else {

        console.warn('Unknown tree format', treeRes)
    }

    if (treeData.length > 0 && !treeData[0].children && (treeData[0].pid !== undefined || treeData[0].parent_id !== undefined)) {
       console.log('Converting flat list to tree...')
       treeData = listToTree(treeData)
    }

    permTreeData.value = treeData

    let finalIds: number[] = []

    console.log('Role Rules IDs:', idsRes)

    let rawIds: any = idsRes

    if (rawIds && typeof rawIds === 'object' && 'data' in rawIds && Array.isArray(rawIds.data)) {
      rawIds = rawIds.data
    }

    if (rawIds && typeof rawIds === 'object' && 'list' in rawIds && Array.isArray(rawIds.list)) {
      rawIds = rawIds.list
    }

    if (rawIds && typeof rawIds === 'object' && 'rule_ids' in rawIds && Array.isArray(rawIds.rule_ids)) {
      rawIds = rawIds.rule_ids
    }

    if (Array.isArray(rawIds)) {
      finalIds = rawIds.map((id: any) => Number(id))
    } else {
      console.warn('Unexpected idsRes format, defaulting to empty:', rawIds)
      finalIds = []
    }

    if (treeRes && (treeRes.checked_keys || treeRes.checkedIds)) {
      const keys = treeRes.checked_keys || treeRes.checkedIds
      if (Array.isArray(keys)) {
        finalIds = keys.map((id: any) => Number(id))
      }
    }

    const isLeaf = (id: number, nodes: any[]): boolean => {
      for (const node of nodes) {
        if (node.id === id) {
          return !node.children || node.children.length === 0
        }
        if (node.children && node.children.length > 0) {
          if (isLeaf(id, node.children)) return true
        }
      }
      return false
    }

    const leafIds = finalIds.filter(id => isLeaf(id, permTreeData.value))
    defaultCheckedKeys.value = leafIds

  } catch (error) {
    console.error(error)
    ElMessage.error('获取权限数据失败')
  }
}

const handlePermSubmit = async () => {
  if (!permTreeRef.value) return
  permSubmitting.value = true
  try {

    const checkedKeys = permTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = permTreeRef.value.getHalfCheckedKeys()
    const allKeys = [...checkedKeys, ...halfCheckedKeys]

    await saveRoleRules({
      role_id: currentRoleId.value,
      rule_ids: allKeys.map(Number)
    })

    ElMessage.success('权限保存成功')
    permDialogVisible.value = false
  } catch (error) {
    console.error(error)
  } finally {
    permSubmitting.value = false
  }
}

const handleDelete = (row: AdminRole) => {
  ElMessageBox.confirm(`确定要删除角色 ${row.name} 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteRole(row.id)
    loadData()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (dialogType.value === 'add') {
          await createRole(form)
        } else {
          await updateRole(form)
        }
        dialogVisible.value = false
        loadData()
      } finally {
        submitting.value = false
      }
    }
  })
}

const listToTree = (list: any[]) => {
  const map: Record<number, any> = {}
  const roots: any[] = []

  list.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })

  list.forEach(item => {

    if (item.pid === 0) {
      roots.push(map[item.id])
    } else {
      const parent = map[item.pid]
      if (parent) {
        parent.children.push(map[item.id])
      } else {

      }
    }
  })

  return roots
}

onMounted(() => {
  loadData()
})
</script>
