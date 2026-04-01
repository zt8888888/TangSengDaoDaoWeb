<template>
  <div class="app-container">
    <el-card shadow="never">
      
      <el-form :model="searchParams" inline class="mb-4 search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchParams.username" placeholder="输入用户名" clearable @keyup.enter="handleSearch" style="width: 160px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            添加链接
          </el-button>
        </el-form-item>
      </el-form>

      
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" sortable />
        <el-table-column prop="username" label="用户名" width="150" align="center" />
        <el-table-column prop="type" label="注册类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.type === 1" type="warning">代理</el-tag>
            <el-tag v-else type="info">会员</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total_count" label="总次数" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.total_count === -1">不限</span>
            <span v-else>{{ row.total_count }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="used_count" label="使用次数" width="120" align="center" />
        <el-table-column prop="template" label="使用模版" width="150" align="center" />
        <el-table-column prop="created_at" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" min-width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleCopy(row)">复制链接</el-button>
            <el-button size="small" type="warning" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      
      <div class="mt-5 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加链接' : '编辑链接'"
      width="500px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="注册类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">代理</el-radio>
            <el-radio :label="0">会员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="使用次数" prop="total_count">
          <el-input-number v-model="form.total_count" :min="-1" placeholder="-1为不限" />
          <span class="ml-2 text-gray-400 text-xs">(-1 表示不限次数)</span>
        </el-form-item>
        <el-form-item label="使用模版" prop="template">
          <el-input v-model="form.template" placeholder="请输入模版名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchAgentLinkList, saveAgentLink, deleteAgentLink, type AgentLink, type AgentLinkSearchParams } from '@/api/agent-link'

const toClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {

    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}
const loading = ref(false)
const submitting = ref(false)
const tableData = ref<AgentLink[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const searchParams = reactive<AgentLinkSearchParams>({
  username: ''
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref()
const form = reactive<Partial<AgentLink>>({
  id: undefined,
  username: '',
  type: 1,
  total_count: -1,
  template: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  type: [{ required: true, message: '请选择注册类型', trigger: 'change' }],
  total_count: [{ required: true, message: '请输入使用次数', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetchAgentLinkList({
      page: pagination.page,
      limit: pagination.limit,
      ...searchParams
    })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchParams.username = ''
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pagination.limit = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  fetchData()
}

const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    id: undefined,
    username: '',
    type: 1,
    total_count: -1,
    template: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: AgentLink) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row: AgentLink) => {
  ElMessageBox.confirm('确定删除该链接吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteAgentLink(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleCopy = async (row: AgentLink) => {
  if (!row.url) {
    ElMessage.warning('链接地址为空')
    return
  }
  try {
    await toClipboard(row.url)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        await saveAgentLink(form)
        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
        dialogVisible.value = false
        fetchData()
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.search-form .el-form-item {
  margin-bottom: 10px;
  margin-right: 10px;
}
</style>
