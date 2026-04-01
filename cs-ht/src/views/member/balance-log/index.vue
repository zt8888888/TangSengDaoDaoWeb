<template>
  <div class="app-container">
    <el-card shadow="never">
      
      <el-form :model="searchParams" inline class="mb-4 search-form">
        <el-form-item label="类型">
          <el-select v-model="searchParams.type" placeholder="全部" clearable style="width: 160px">
            <el-option label="全部" value="" />
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <el-form-item label="用户名">
          <el-input v-model="searchParams.username" placeholder="输入用户名" clearable @keyup.enter="handleSearch" style="width: 150px" />
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

      
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" sortable />
        <el-table-column prop="trano" label="单号" width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" align="center" />
        <el-table-column prop="typename" label="类型名称" width="120" align="center">
          <template #default="{ row }">
            <el-tag effect="plain">{{ row.typename }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120" align="center">
          <template #default="{ row }">
            <span :class="Number(row.amount) >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
              {{ Number(row.amount).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="amountbefor" label="变动前" width="120" align="center">
          <template #default="{ row }">
            {{ Number(row.amountbefor).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="amountafter" label="变动后" width="120" align="center">
          <template #default="{ row }">
            {{ Number(row.amountafter).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="oddtime_text" label="时间" width="170" align="center" />
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
import { fetchBalanceLog, type BalanceLogItem, type BalanceLogSearchParams } from '@/api/member'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

const loading = ref(false)
const tableData = ref<BalanceLogItem[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const searchParams = reactive<BalanceLogSearchParams>({
  username: '',
  type: '',
  trano: '',
  sDate: '',
  eDate: ''
})

const dateRange = ref<[string, string] | null>(null)

const typeOptions = [

  { value: 'order', label: '代购' },
  { value: 'cancel', label: '撤单' },
  { value: 'reward', label: '返奖' },
  { value: 'rollback', label: '后台撤单' },

  { value: 'yeb_dq', label: '余额宝定期' },
  { value: 'yeb_hq', label: '余额宝活期' },
  { value: 'yeb_lixi', label: '余额宝利息' },
  { value: 'yuebao_claim', label: '利息宝收益' },

  { value: 'fanshui', label: '每日加奖' },
  { value: 'jinjishenhe', label: '晋级奖励' },
  { value: '晋级奖励', label: '晋级奖励(旧)' },
  { value: 'yongjinshenhe', label: '代理返点' },
  { value: '代理佣金', label: '代理佣金' },
  { value: 'xima', label: '洗码' },
  { value: '返水', label: '返水' },
  { value: 'point', label: '积分' },

  { value: 'activity_bindcard', label: '绑定银行赠送' },
  { value: 'activity_cz', label: '充值活动' },
  { value: 'activity_czzs', label: '充值赠送活动' },
  { value: 'activity_rxf', label: '日消费赠送' },
  { value: 'activity_rks', label: '日亏损赠送' },
  { value: 'activity_yxf', label: '月消费赠送' },
  { value: 'activity_yks', label: '月亏损赠送' },
  { value: '活动奖励', label: '活动奖励' },
  { value: '签到奖励', label: '签到奖励' },

  { value: 'recharge', label: '充值' },
  { value: 'withdraw', label: '提现' },
  { value: 'withdraw_reject', label: '提现退回' },
  { value: 'withdraw_cancel', label: '提现取消' },
  { value: 'adminadd', label: '管理员加' },
  { value: 'adminjian', label: '管理员减' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetchBalanceLog({
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
  searchParams.type = ''
  searchParams.trano = ''
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
