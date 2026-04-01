<template>
  <div class="p-4">
    <div class="mb-4 bg-box p-4 rounded-lg shadow-sm">
      
      <div class="flex flex-wrap gap-6 mb-4 text-sm" v-if="stats">
        <div class="bg-hover-color px-4 py-2 rounded-md border-full-d">
          <span class="text-g-500">总投注：</span>
          <span class="font-bold text-lg">{{ stats.total_bet }}</span>
        </div>
        <div class="bg-hover-color px-4 py-2 rounded-md border-full-d">
          <span class="text-g-500">总派彩：</span>
          <span class="text-success font-bold text-lg">{{ stats.total_win }}</span>
        </div>
        <div class="bg-hover-color px-4 py-2 rounded-md border-full-d">
          <span class="text-g-500">总盈亏：</span>
          <span :class="Number(stats.total_profit) >= 0 ? 'text-success' : 'text-danger'" class="font-bold text-lg">
            {{ stats.total_profit }}
          </span>
        </div>
      </div>

      <el-form :inline="true" :model="searchForm" class="flex-1">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="用户名" clearable style="width: 140px" />
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="searchForm.platform" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="item in platformOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="searchForm.order_no" placeholder="订单号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 340px"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleSyncRecords" :loading="syncing">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            同步投注记录
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="bg-box p-4 rounded-lg shadow-sm">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column prop="order_no" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" align="center" />
        <el-table-column prop="platform" label="平台" width="100" align="center">
          <template #default="{ row }">
            <el-tag effect="plain">{{ row.platform }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="game_name" label="游戏名称" min-width="150" align="center" />
        
        <el-table-column prop="bet_amount" label="投注金额" width="120" align="right">
          <template #default="{ row }">
            <span class="font-mono">{{ row.bet_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="valid_bet" label="有效投注" width="120" align="right">
          <template #default="{ row }">
            <span class="font-mono">{{ row.valid_bet }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="win_amount" label="派彩金额" width="120" align="right">
          <template #default="{ row }">
            <span class="font-mono font-bold text-success">{{ row.win_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="盈亏" width="120" align="right">
          <template #default="{ row }">
            <span :class="Number(row.profit) >= 0 ? 'text-success' : 'text-danger'" class="font-mono font-bold">
              {{ row.profit }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="bet_time" label="投注时间" width="170" align="center" sortable />
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  fetchBetList,
  fetchBetStatusOptions,
  syncBetRecords,
  type GameBet
} from '@/api/game-record'
import { ElMessage } from 'element-plus'
import { fetchPlatformOptions, type PlatformOption } from '@/api/game-platform'

const loading = ref(false)
const syncing = ref(false)
const tableData = ref<GameBet[]>([])
const platformOptions = ref<PlatformOption[]>([])
const statusOptions = ref<{value: string, label: string}[]>([])
const stats = ref<any>(null)

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const searchForm = reactive({
  username: '',
  platform: '',
  order_no: '',
  status: '',
  start_time: '',
  end_time: ''
})

const dateRange = ref<[string, string] | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchBetList({
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    })
    tableData.value = res.list
    pagination.total = res.total
    stats.value = res.stats
  } finally {
    loading.value = false
  }
}

const loadOptions = async () => {
  try {
    const [platforms, statuses] = await Promise.all([
      fetchPlatformOptions(),
      fetchBetStatusOptions()
    ])
    platformOptions.value = platforms || []
    statusOptions.value = statuses || [
      { value: 'pending', label: '未结算' },
      { value: 'settled', label: '已结算' },
      { value: 'cancelled', label: '已取消' }
    ]
  } catch (error) {
    console.error(error)
  }
}

const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    searchForm.start_time = val[0]
    searchForm.end_time = val[1]
  } else {
    searchForm.start_time = ''
    searchForm.end_time = ''
  }
}

const getStatusType = (status: string) => {
  if (status === 'settled') return 'success'
  if (status === 'cancelled') return 'info'
  return 'warning'
}

const getStatusLabel = (status: string) => {
  const opt = statusOptions.value.find(o => o.value === status)
  return opt ? opt.label : status
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const resetSearch = () => {
  searchForm.username = ''
  searchForm.platform = ''
  searchForm.order_no = ''
  searchForm.status = ''
  searchForm.start_time = ''
  searchForm.end_time = ''
  dateRange.value = null
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pagination.limit = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadData()
}

const handleSyncRecords = async () => {
  syncing.value = true
  try {
    const params: any = {}
    if (searchForm.start_time && searchForm.end_time) {
      params.start_time = searchForm.start_time
      params.end_time = searchForm.end_time
    }
    const res = await syncBetRecords(params)
    if (res.code === 0) {
      ElMessage.success(`同步完成: 新增 ${res.data?.synced || 0} 条, 更新 ${res.data?.updated || 0} 条`)
      loadData()
    } else {
      ElMessage.error(res.msg || '同步失败')
    }
  } catch (e: any) {
    ElMessage.error(e.message || '同步失败')
  } finally {
    syncing.value = false
  }
}

onMounted(() => {
  loadData()
  loadOptions()
})
</script>
