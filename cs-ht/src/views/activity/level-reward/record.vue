<template>
  <div class="app-container">
    <el-card shadow="never">
      
      <el-form :model="searchParams" inline class="mb-4 search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchParams.username" placeholder="输入用户名" clearable @keyup.enter="handleSearch" style="width: 150px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
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
        <el-table-column prop="order_no" label="订单号" width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" align="center" />
        <el-table-column label="等级变化" width="180" align="center">
          <template #default="{ row }">
            <span class="text-gray-500">{{ row.from_level_name || '-' }}</span>
            <i class="ri-arrow-right-line mx-2 text-blue-500"></i>
            <span class="text-orange-600 font-medium">{{ row.to_level_name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reward_amount" label="奖励金额" width="120" align="center">
          <template #default="{ row }">
            <span class="text-orange-600 font-medium">{{ Number(row.reward_amount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="balance_before" label="领取前余额" width="120" align="center">
          <template #default="{ row }">
            {{ Number(row.balance_before).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="balance_after" label="领取后余额" width="120" align="center">
          <template #default="{ row }">
            {{ Number(row.balance_after).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="claim_time" label="领取时间" width="170" align="center" />
        <el-table-column prop="gmt_create" label="创建时间" width="170" align="center" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
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
import {
  fetchRecordList,
  fetchStatusOptions,
  type LevelRewardRecord,
  type RecordListParams,
  type StatusOption
} from '@/api/levelReward'

const loading = ref(false)
const tableData = ref<LevelRewardRecord[]>([])
const statusOptions = ref<StatusOption[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const searchParams = reactive<RecordListParams>({
  username: '',
  status: '',
  start_date: '',
  end_date: ''
})

const dateRange = ref<[string, string] | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetchRecordList({
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

const loadStatusOptions = async () => {
  try {
    const res = await fetchStatusOptions()
    if (Array.isArray(res)) {
      statusOptions.value = res
    }
  } catch (error) {

    statusOptions.value = [
      { value: 0, label: '待领取' },
      { value: 1, label: '已领取' },
      { value: 2, label: '已过期' }
    ]
  }
}

const getStatusType = (status: number) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'info'
    default: return 'info'
  }
}

const getStatusText = (status: number) => {
  const option = statusOptions.value.find(o => o.value === status)
  return option ? option.label : '未知'
}

const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    searchParams.start_date = val[0]
    searchParams.end_date = val[1]
  } else {
    searchParams.start_date = ''
    searchParams.end_date = ''
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchParams.username = ''
  searchParams.status = ''
  searchParams.start_date = ''
  searchParams.end_date = ''
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
  loadStatusOptions()
  fetchData()
})
</script>

<style scoped>
.search-form .el-form-item {
  margin-bottom: 10px;
  margin-right: 10px;
}
</style>
