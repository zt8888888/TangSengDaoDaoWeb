<template>
  <div class="app-container">
    <el-card shadow="never">
      
      <el-form :model="searchParams" inline class="mb-4 search-form">
        <el-form-item label="状态">
          <el-select v-model="searchParams.state" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="待处理" :value="0" />
            <el-option label="确认中" :value="1" />
            <el-option label="成功" :value="2" />
            <el-option label="失败" :value="3" />
            <el-option label="已取消" :value="4" />
            <el-option label="超时" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYYMMDD"
            @change="handleDateChange"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="金额">
          <div class="flex items-center">
            <el-input v-model="searchParams.sAmout" placeholder="最小金额" style="width: 100px" />
            <span class="mx-2">-</span>
            <el-input v-model="searchParams.eAmout" placeholder="最大金额" style="width: 100px" />
          </div>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchParams.username" placeholder="输入用户名" clearable @keyup.enter="handleSearch" style="width: 140px" />
        </el-form-item>
        <el-form-item label="单号">
          <el-input v-model="searchParams.trano" placeholder="输入单号" clearable @keyup.enter="handleSearch" style="width: 180px" />
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

      
      <el-table v-loading="loading" :data="tableData" border stripe show-summary :summary-method="getSummaries">
        <el-table-column prop="trano" label="平台单号" width="200" align="center" sortable show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" align="center" sortable />
        <el-table-column prop="paytype" label="支付账号" width="120" align="center" sortable />
        <el-table-column prop="paytypetitle" label="存款方式" width="120" align="center" sortable />
        <el-table-column prop="oldaccountmoney" label="充值前" width="120" align="center" sortable>
          <template #default="{ row }">
            {{ Number(row.oldaccountmoney || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="160" align="center" sortable>
          <template #default="{ row }">
            <template v-if="row.paytype === 'USDT' && row.actualamount && row.actualamount != row.amount">
              <span class="text-gray-400">{{ Number(row.amount || 0).toFixed(0) }}U</span>
              <span class="mx-1">→</span>
              <span class="text-red-500 font-medium">{{ Number(row.actualamount || 0).toFixed(2) }}</span>
            </template>
            <span v-else class="text-red-500 font-medium">{{ Number(row.actualamount || row.amount || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="newaccountmoney" label="充值后" width="120" align="center" sortable>
          <template #default="{ row }">
            {{ Number(row.newaccountmoney || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="isauto_text" label="类型" width="100" align="center" sortable />
        <el-table-column prop="oddtime" label="时间" width="160" align="center" sortable />
        <el-table-column prop="state" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.state === 0" type="warning">待处理</el-tag>
            <el-tag v-else-if="row.state === 1" type="info">确认中</el-tag>
            <el-tag v-else-if="row.state === 2" type="success">成功</el-tag>
            <el-tag v-else-if="row.state === 3" type="danger">失败</el-tag>
            <el-tag v-else-if="row.state === 4" type="danger">已取消</el-tag>
            <el-tag v-else-if="row.state === 5" type="warning">超时</el-tag>
            <span v-else>{{ row.state }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.state === 0 || row.state === 1" size="small" type="primary" @click="handleApprove(row)">审核</el-button>
            <el-button v-if="row.state === 0 || row.state === 1" size="small" type="danger" @click="handleReject(row)">拒绝</el-button>
            <el-button v-if="row.state !== 2" size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      
      <div class="mt-4 p-4 bg-box border-full-d rounded text-sm flex flex-wrap gap-6" v-if="statistics">
        <div class="text-g-700">页面成功：<strong class="text-warning">{{ Number(statistics.page_success_amount || 0).toFixed(0) }}</strong> 元</div>
        <div class="text-g-700">总充值：<strong class="text-warning">{{ Number(statistics.total_amount || 0).toFixed(0) }}</strong> ({{ statistics.total_count }}笔)</div>
        <div class="text-g-700">自动充值：<strong class="text-warning">{{ Number(statistics.auto_amount || 0).toFixed(0) }}</strong> ({{ statistics.auto_count }}笔)</div>
        <div class="text-g-700">手动充值：<strong class="text-warning">{{ Number(statistics.manual_amount || 0).toFixed(0) }}</strong> ({{ statistics.manual_count }}笔)</div>
        <div class="text-g-700">共有数据：<strong class="text-warning">{{ pagination.total }}</strong> 条</div>
      </div>

      
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchRechargeList, approveRecharge, rejectRecharge, deleteRecharge, type Recharge, type RechargeSearchParams, type RechargeStatistics } from '@/api/finance'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
import { socketEmitter } from '@/utils/websocket'

const loading = ref(false)
const tableData = ref<Recharge[]>([])
const statistics = ref<RechargeStatistics>()
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const searchParams = reactive<RechargeSearchParams>({
  state: '',
  sDate: '',
  eDate: '',
  sAmout: '',
  eAmout: '',
  username: '',
  trano: ''
})

const dateRange = ref<[string, string] | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetchRechargeList({
      page: pagination.page,
      limit: pagination.limit,
      ...searchParams
    })
    tableData.value = res.list
    pagination.total = res.total
    statistics.value = res.statistics
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
  searchParams.state = ''
  searchParams.sDate = ''
  searchParams.eDate = ''
  searchParams.sAmout = ''
  searchParams.eAmout = ''
  searchParams.username = ''
  searchParams.trano = ''
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

const handleApprove = (row: Recharge) => {
  ElMessageBox.confirm('确定要审核通过该充值申请吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await approveRecharge(row.id)
    ElMessage.success('审核成功')
    fetchData()
  })
}

const handleReject = (row: Recharge) => {
  ElMessageBox.prompt('请输入拒绝原因（可选）', '拒绝充值申请', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '拒绝原因',
    type: 'warning'
  }).then(async ({ value }) => {
    await rejectRecharge(row.id, value || '')
    ElMessage.success('已拒绝')
    fetchData()
  })
}

const handleDelete = (row: Recharge) => {
  ElMessageBox.confirm('确定要删除该充值记录吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteRecharge(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const getSummaries = () => []

const onNewDeposit = () => {
  if (pagination.page === 1) {
    fetchData()
  }
}

onMounted(() => {
  fetchData()
  socketEmitter.on('finance_new_deposit', onNewDeposit)
})

onUnmounted(() => {
  socketEmitter.off('finance_new_deposit', onNewDeposit)
})
</script>

<style scoped>
.search-form .el-form-item {
  margin-bottom: 10px;
  margin-right: 10px;
}
</style>
