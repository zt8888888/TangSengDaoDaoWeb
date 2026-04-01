<template>
  <div class="app-container">
    <el-card shadow="never">
      
      <el-form :model="searchParams" inline class="mb-4 search-form">
        <el-form-item label="登陆时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleDateChange"
            style="width: 340px"
          />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchParams.username" placeholder="输入用户名" clearable @keyup.enter="handleSearch" style="width: 160px" />
        </el-form-item>
        <el-form-item label="登陆IP">
          <el-input v-model="searchParams.loginip" placeholder="输入登陆IP" clearable @keyup.enter="handleSearch" style="width: 160px" />
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
        <el-table-column prop="id" label="ID" width="80" align="center" sortable />
        <el-table-column prop="username" label="用户名" width="150" align="center" sortable />
        <el-table-column prop="type" label="类型" width="120" align="center" sortable />
        <el-table-column prop="info" label="备注" min-width="200" align="center" sortable show-overflow-tooltip />
        <el-table-column prop="ip" label="IP" width="150" align="center" sortable />
        <el-table-column prop="iparea" label="IP所属地" width="180" align="center" sortable />
        <el-table-column prop="time_text" label="时间" width="180" align="center" sortable />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchLoginLogList, type LoginLog, type LoginLogSearchParams } from '@/api/login-log'

const loading = ref(false)
const tableData = ref<LoginLog[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const searchParams = reactive<LoginLogSearchParams>({
  username: '',
  loginip: '',
  sDate: '',
  eDate: ''
})

const dateRange = ref<[string, string] | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetchLoginLogList({
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

const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    searchParams.sDate = val[0]
    searchParams.eDate = val[1]
  } else {
    searchParams.sDate = ''
    searchParams.eDate = ''
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchParams.username = ''
  searchParams.loginip = ''
  searchParams.sDate = ''
  searchParams.eDate = ''
  dateRange.value = null
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
