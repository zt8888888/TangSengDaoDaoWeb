<template>
  <div class="agent-commission-container">
    
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="代理ID">
          <el-input v-model="searchForm.agentId" placeholder="请输入代理ID" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="待领取" :value="1" />
            <el-option label="已领取" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card class="agent-list-card">
      <template #header>
        <div class="card-header">
          <span>代理列表</span>
          <el-input 
            v-model="agentSearch" 
            placeholder="搜索代理账号" 
            style="width: 200px; margin-left: auto;"
            clearable
            @keyup.enter="fetchAgents"
          >
            <template #append>
              <el-button @click="fetchAgents">搜索</el-button>
            </template>
          </el-input>
        </div>
      </template>
      <el-table :data="agentList" stripe max-height="300">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="代理账号" width="120" />
        <el-table-column prop="subCount" label="下级人数" width="100" />
        <el-table-column prop="totalPerformance" label="总业绩" width="120">
          <template #default="{ row }">{{ formatMoney(row.totalPerformance) }}</template>
        </el-table-column>
        <el-table-column prop="totalCommission" label="总佣金" width="120">
          <template #default="{ row }">
            <span class="text-success">{{ formatMoney(row.totalCommission) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pendingCommission" label="待领取" width="100">
          <template #default="{ row }">
            <span class="text-warning">{{ formatMoney(row.pendingCommission) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="regtime" label="注册时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" type="primary" @click="viewAgentDetail(row)">详情</el-button>
              <el-button size="small" type="danger" @click="removeAgent(row)">取消代理</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ formatMoney(stats.totalCommission) }}</div>
          <div class="stat-label">累计佣金</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value success">{{ formatMoney(stats.claimed) }}</div>
          <div class="stat-label">已领取</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value warning">{{ formatMoney(stats.pending) }}</div>
          <div class="stat-label">待领取</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.agentCount }}</div>
          <div class="stat-label">代理人数</div>
        </el-card>
      </el-col>
    </el-row>

    
    <el-card>
      <template #header>
        <div class="card-header">
          <span>代理佣金记录</span>
          <el-button type="primary" size="small" @click="handleExport">导出</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="agentUsername" label="代理账号" width="120" />
        <el-table-column prop="subCount" label="下级人数" width="100" />
        <el-table-column prop="performance" label="业绩金额" width="120">
          <template #default="{ row }">
            {{ formatMoney(row.performance) }}
          </template>
        </el-table-column>
        <el-table-column prop="rate" label="返佣比例" width="100">
          <template #default="{ row }">
            {{ row.rate }}%
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="佣金金额" width="120">
          <template #default="{ row }">
            <span class="text-success">{{ formatMoney(row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 2 ? 'success' : 'warning'">
              {{ row.status === 2 ? '已领取' : '待领取' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="settleDate" label="结算日期" width="120" />
        <el-table-column prop="claimedAt" label="领取时间" width="160" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 1" 
              type="primary" 
              size="small" 
              @click="handleManualClaim(row)"
            >
              手动发放
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>代理系统配置</span>
          <el-button type="primary" size="small" @click="saveSettings">保存设置</el-button>
        </div>
      </template>
      <el-form :model="settingsForm" label-width="140px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="代理模式">
              <el-select v-model="settingsForm.agentMode" style="width: 100%">
                <el-option label="一级净盈利" value="一级净盈利" />
                <el-option label="多级净盈利" value="多级净盈利" />
                <el-option label="有效投注" value="有效投注" />
                <el-option label="流水模式" value="流水模式" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结算周期">
              <el-select v-model="settingsForm.settlementCycle" style="width: 100%">
                <el-option label="日结" value="daily" />
                <el-option label="周结" value="weekly" />
                <el-option label="月结" value="monthly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结算日期">
              <el-input-number v-model="settingsForm.settlementDay" :min="1" :max="28" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">有效会员门槛</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最低充值金额">
              <el-input-number v-model="settingsForm.validRecharge" :min="0" :step="10" style="width: 100%">
                <template #suffix>元</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="最低投注流水">
              <el-input-number v-model="settingsForm.validBet" :min="0" :step="100" style="width: 100%">
                <template #suffix>元</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="稽核倍数">
              <el-input-number v-model="settingsForm.auditMultiple" :min="0" :max="10" :precision="1" style="width: 100%">
                <template #suffix>倍</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">防刷限制</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="同IP日注册限制">
              <el-input-number v-model="settingsForm.ipLimit" :min="1" :max="50" style="width: 100%">
                <template #suffix>个</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="同设备注册限制">
              <el-input-number v-model="settingsForm.deviceLimit" :min="1" :max="20" style="width: 100%">
                <template #suffix>个</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button type="success" @click="handleSettlement">执行结算</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    
    <el-card class="rate-config-card">
      <template #header>
        <div class="card-header">
          <span>返佣比例配置</span>
          <el-button type="primary" size="small" @click="showRateDialog = true">编辑配置</el-button>
        </div>
      </template>
      <el-table :data="rateList" stripe>
        <el-table-column prop="effectiveCount" label="有效人数" />
        <el-table-column prop="performance" label="业绩要求">
          <template #default="{ row }">
            {{ formatMoney(row.performance) }}
          </template>
        </el-table-column>
        <el-table-column prop="rate" label="返佣比例">
          <template #default="{ row }">
            {{ row.rate }}%
          </template>
        </el-table-column>
        <el-table-column prop="commission" label="返佣示例">
          <template #default="{ row }">
            {{ formatMoney(row.commission) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    
    <el-dialog v-model="showRateDialog" title="编辑返佣比例配置" width="600px">
      <el-form :model="rateForm" label-width="100px">
        <el-form-item 
          v-for="(item, index) in rateForm.rates" 
          :key="index"
          :label="`等级${index + 1}`"
        >
          <el-row :gutter="10">
            <el-col :span="6">
              <el-input-number v-model="item.effectiveCount" :min="1" placeholder="有效人数" />
            </el-col>
            <el-col :span="8">
              <el-input-number v-model="item.performance" :min="0" placeholder="业绩要求" />
            </el-col>
            <el-col :span="6">
              <el-input-number v-model="item.rate" :min="0" :max="100" placeholder="比例%" />
            </el-col>
            <el-col :span="4">
              <el-button type="danger" size="small" @click="removeRate(index)">删除</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addRate">添加等级</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRateConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { agentCommissionApi, type CommissionRecord, type RateConfig } from '@/api/agent-commission'

const searchForm = reactive({
  agentId: '',
  status: '',
  dateRange: []
})

const stats = reactive({
  totalCommission: 0,
  claimed: 0,
  pending: 0,
  agentCount: 0
})

const tableData = ref<CommissionRecord[]>([])
const loading = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const rateList = ref<RateConfig[]>([])
const showRateDialog = ref(false)
const rateForm = reactive({
  rates: [] as any[]
})

const settingsForm = reactive({
  agentMode: '一级净盈利',
  settlementCycle: 'monthly',
  settlementDay: 1,
  validRecharge: 100,
  validBet: 500,
  auditMultiple: 1,
  ipLimit: 5,
  deviceLimit: 3
})

const agentSearch = ref('')
const agentList = ref<any[]>([])

const formatMoney = (val: any) => {
  const num = parseFloat(val) || 0
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await agentCommissionApi.getList({
      agentId: searchForm.agentId,
      status: searchForm.status as any,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    tableData.value = res?.list || []
    pagination.total = res?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await agentCommissionApi.getStats()
    if (res) {
      Object.assign(stats, res)
    }
  } catch (e) {
    console.error(e)
  }
}

const fetchRates = async () => {
  try {
    const res = await agentCommissionApi.getRates()
    if (res) {
      rateList.value = res.list || []
      rateForm.rates = JSON.parse(JSON.stringify(rateList.value))
    }
  } catch (e) {
    console.error(e)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.agentId = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchData()
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleManualClaim = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认手动发放佣金 ${formatMoney(row.amount)} 元给代理 ${row.agentUsername}？`, '确认发放')
    await agentCommissionApi.manualClaim({ id: row.id })
    ElMessage.success('发放成功')
    fetchData()
    fetchStats()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e?.message || '发放失败')
    }
  }
}

const addRate = () => {
  rateForm.rates.push({
    effectiveCount: rateForm.rates.length + 1,
    performance: 0,
    rate: 0
  })
}

const removeRate = (index: number) => {
  rateForm.rates.splice(index, 1)
}

const saveRateConfig = async () => {
  try {
    await agentCommissionApi.saveRates({ rates: rateForm.rates })
    ElMessage.success('保存成功')
    showRateDialog.value = false
    fetchRates()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  }
}

const fetchSettings = async () => {
  try {
    const res = await agentCommissionApi.getSettings()
    if (res) {
      Object.assign(settingsForm, res)
    }
  } catch (e) {
    console.error(e)
  }
}

const saveSettings = async () => {
  try {
    await agentCommissionApi.saveSettings(settingsForm as any)
    ElMessage.success('设置保存成功')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  }
}

const handleSettlement = async () => {
  try {
    await ElMessageBox.confirm('确认执行佣金结算？此操作将为所有代理生成佣金记录', '确认结算')
    const res = await agentCommissionApi.settlement()
    ElMessage.success(`结算完成，共生成 ${res?.count || 0} 条记录`)
    fetchData()
    fetchStats()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e?.message || '结算失败')
    }
  }
}

const fetchAgents = async () => {
  try {
    const res = await agentCommissionApi.getAgentList({ search: agentSearch.value })
    agentList.value = res?.list || []
  } catch (e) {
    console.error(e)
  }
}

const viewAgentDetail = (row: any) => {
  ElMessage.info(`查看代理 ${row.username} 的详情`)

}

const removeAgent = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认取消 ${row.username} 的代理资格？`, '确认操作')
    await agentCommissionApi.removeAgent({ id: row.id })
    ElMessage.success('已取消代理资格')
    fetchAgents()
    fetchStats()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e?.message || '操作失败')
    }
  }
}

onMounted(() => {
  fetchData()
  fetchStats()
  fetchRates()
  fetchSettings()
  fetchAgents()
})
</script>

<style scoped lang="scss">
.agent-commission-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 16px;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
  
  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #333;
    
    &.success {
      color: #67c23a;
    }
    
    &.warning {
      color: #e6a23c;
    }
  }
  
  .stat-label {
    font-size: 14px;
    color: #999;
    margin-top: 8px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.text-success {
  color: #67c23a;
  font-weight: 500;
}

.text-warning {
  color: #e6a23c;
  font-weight: 500;
}

.agent-list-card {
  margin-bottom: 16px;
}

.settings-card {
  margin-top: 16px;
}

.rate-config-card {
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>
