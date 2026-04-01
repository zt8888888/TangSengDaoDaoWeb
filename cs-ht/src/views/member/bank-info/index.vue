<template>
  <div class="app-container">
    <el-card shadow="never">
      
      <el-form :model="searchParams" inline class="mb-4 search-form">
        <el-form-item label="状态">
          <el-select v-model="searchParams.state" placeholder="全部" clearable style="width: 160px">
            <el-option label="全部" value="" />
            <el-option label="审核中" :value="0" />
            <el-option label="已审" :value="1" />
            <el-option label="驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchParams.username" placeholder="输入用户名" clearable @keyup.enter="handleSearch" style="width: 160px" />
        </el-form-item>
        <el-form-item label="绑定姓名">
          <el-input v-model="searchParams.accountname" placeholder="输入绑定姓名" clearable @keyup.enter="handleSearch" style="width: 160px" />
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
        </el-form-item>
      </el-form>

      
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="username" label="用户名" width="120" align="center" sortable />
        <el-table-column prop="accountname" label="开户姓名" width="120" align="center" sortable />
        <el-table-column prop="bankname" label="开户银行" width="150" align="center" sortable />
        <el-table-column prop="bankbranch" label="开户网点" width="150" align="center" sortable />
        <el-table-column prop="bankaddress" label="开户地址" min-width="200" align="center" sortable />
        <el-table-column prop="banknumber" label="银行卡号" width="180" align="center" sortable />
        <el-table-column prop="state" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.state === 0" type="warning">审核中</el-tag>
            <el-tag v-else-if="row.state === 1" type="success">已审</el-tag>
            <el-tag v-else-if="row.state === 2" type="danger">驳回</el-tag>
            <span v-else>{{ row.state }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
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
      title="编辑银行信息"
      width="600px"
      append-to-body
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="开户姓名" prop="accountname">
          <el-input v-model="form.accountname" placeholder="请输入开户姓名" />
        </el-form-item>
        <el-form-item label="开户银行" prop="bankname">
          <el-input v-model="form.bankname" placeholder="请输入开户银行" />
        </el-form-item>
        <el-form-item label="开户网点" prop="bankbranch">
          <el-input v-model="form.bankbranch" placeholder="请输入开户网点" />
        </el-form-item>
        <el-form-item label="开户地址" prop="bankaddress">
          <el-input v-model="form.bankaddress" placeholder="请输入开户地址" />
        </el-form-item>
        <el-form-item label="银行卡号" prop="banknumber">
          <el-input v-model="form.banknumber" placeholder="请输入银行卡号" />
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="form.state" placeholder="请选择状态">
            <el-option label="审核中" :value="0" />
            <el-option label="已审" :value="1" />
            <el-option label="驳回" :value="2" />
          </el-select>
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
import { fetchBankList, updateBank, deleteBank, type BankInfo, type BankSearchParams } from '@/api/bank-info'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<BankInfo[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const searchParams = reactive<BankSearchParams>({
  state: '',
  username: '',
  accountname: ''
})

const dialogVisible = ref(false)
const formRef = ref()
const form = reactive<Partial<BankInfo>>({
  id: undefined,
  username: '',
  accountname: '',
  bankname: '',
  bankbranch: '',
  bankaddress: '',
  banknumber: '',
  state: 0
})

const rules = {
  accountname: [{ required: true, message: '请输入开户姓名', trigger: 'blur' }],
  bankname: [{ required: true, message: '请输入开户银行', trigger: 'blur' }],
  banknumber: [{ required: true, message: '请输入银行卡号', trigger: 'blur' }],
  state: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetchBankList({
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
  searchParams.state = ''
  searchParams.username = ''
  searchParams.accountname = ''
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

const handleEdit = (row: BankInfo) => {
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row: BankInfo) => {
  ElMessageBox.confirm('确定删除该银行信息吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteBank(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        await updateBank(form)
        ElMessage.success('修改成功')
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
