<template>
  <div class="rebate-records">
    
    <el-card class="mb-4">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable>
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable>
            <el-option label="玩家反水" value="daily" />
            <el-option label="代理反水" value="vendor" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-row :gutter="16" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="今日发放" :value="stats.today?.total || 0" prefix="¥" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="今日笔数" :value="stats.today?.count || 0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="待领取" :value="stats.totalPending || 0" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="本月累计" :value="stats.month?.total || 0" prefix="¥" />
        </el-card>
      </el-col>
    </el-row>

    
    <el-card>
      <template #header>
        <div class="card-header">
          <span>反水记录列表</span>
          <div class="header-tips">
            <el-tag type="info" size="small">用户可领取，24小时未领自动发放</el-tag>
          </div>
        </div>
      </template>

      <el-table 
        :data="list" 
        v-loading="loading" 
        border
      >
        <el-table-column prop="trano" label="订单号" width="180" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="groupname" label="VIP等级" width="80" />
        <el-table-column prop="type_label" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'daily' ? 'primary' : 'success'" size="small">
              {{ row.type_label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="touzhuedu" label="投注额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.touzhuedu?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="bili" label="比例" width="80" align="center">
          <template #default="{ row }">
            {{ row.bili }}%
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="反水金额" width="120" align="right">
          <template #default="{ row }">
            <span class="text-primary">¥{{ row.amount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="oddtime" label="时间" width="160" />
        <el-table-column prop="shenhe" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.shenhe)" size="small">
              {{ getStatusText(row.shenhe) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper mt-4">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchRebateList, fetchRebateStats, auditRebate, batchAuditRebate,
  type RebateRecord, type RebateStats
} from '@/api/rebate'

const loading = ref(false)
const list = ref<RebateRecord[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const selectedIds = ref<number[]>([])

const stats = ref<RebateStats>({
  today: { total: 0, count: 0, pending: 0 },
  month: { total: 0, count: 0 },
  totalPending: 0
})

const searchForm = reactive({
  username: '',
  status: '' as string | number,
  type: '',
  dateRange: [] as string[]
})

const getStatusText = (status: number) => {
  const map: Record<number, string> = { 0: '待领取', 1: '已发放', 2: '已取消' }
  return map[status] || '未知'
}

const getStatusType = (status: number): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const map: Record<number, 'warning' | 'success' | 'danger' | 'info'> = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: page.value,
      pageSize: pageSize.value
    }
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.status !== '') params.status = searchForm.status
    if (searchForm.type) params.type = searchForm.type
    if (searchForm.dateRange?.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    const data = await fetchRebateList(params)
    if (data) {
      list.value = data.list || []
      total.value = data.total || 0
    }
  } catch (e) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const data = await fetchRebateStats()
    if (data) {
      stats.value = data
    }
  } catch (e) {
    console.error('加载统计失败', e)
  }
}

const resetSearch = () => {
  searchForm.username = ''
  searchForm.status = ''
  searchForm.type = ''
  searchForm.dateRange = []
  page.value = 1
  loadData()
}

const handleSelectionChange = (rows: RebateRecord[]) => {
  selectedIds.value = rows.filter(r => r.shenhe === 0).map(r => r.id)
}

const auditHandler = async (id: number, action: 'pass' | 'reject') => {
  const actionText = action === 'pass' ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定要${actionText}该反水申请吗？`, '提示', {
      type: 'warning'
    })

    await auditRebate(id, action)
    ElMessage.success(`已${actionText}`)
    loadData()
    loadStats()
  } catch (e) {

  }
}

const batchAuditHandler = async (action: 'pass' | 'reject') => {
  if (!selectedIds.value.length) return

  const actionText = action === 'pass' ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(`确定要批量${actionText}选中的 ${selectedIds.value.length} 条记录吗？`, '提示', {
      type: 'warning'
    })

    const result = await batchAuditRebate(selectedIds.value, action)
    ElMessage.success(`已处理 ${result?.count || 0} 条记录`)
    loadData()
    loadStats()
  } catch (e) {

  }
}

onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style scoped>
.rebate-records {
  padding: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.text-primary {
  color: #409eff;
  font-weight: 500;
}
.text-gray-400 {
  color: #c0c4cc;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
