<template>
  <div class="p-4">
    <div class="mb-4 bg-box p-4 rounded-lg shadow-sm">
      
      <div class="flex flex-wrap gap-6 mb-4 text-sm" v-if="statistics">
        <div class="bg-hover-color px-4 py-2 rounded-md border-full-d">
          <span class="text-g-500">总提款：</span>
          <span class="text-warning font-bold text-lg">{{ statistics.total_amount || '0.00' }}</span>
          <span class="text-g-500 ml-1">元</span>
          <span class="text-g-400 mx-2">|</span>
          <span class="font-bold">{{ statistics.total_count || 0 }}</span>
          <span class="text-g-500 ml-1">笔</span>
        </div>
        <div class="bg-hover-color px-4 py-2 rounded-md border-full-d">
          <span class="text-g-500">页面成功：</span>
          <span class="text-success font-bold text-lg">{{ statistics.success_amount || '0.00' }}</span>
          <span class="text-g-500 ml-1">元</span>
        </div>
      </div>

      
      <el-form :inline="true" :model="searchForm" class="flex flex-wrap items-center">
        <el-form-item label="状态">
          <el-select v-model="searchForm.state" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="未审核" :value="0" />
            <el-option label="已完成" :value="1" />
            <el-option label="退回" :value="2" />
            <el-option label="取消" :value="3" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间">
          <div class="flex items-center">
            <el-date-picker
              v-model="searchForm.sDate"
              type="date"
              placeholder="开始时间"
              value-format="YYYYMMDD"
              style="width: 140px"
            />
            <span class="mx-2">-</span>
            <el-date-picker
              v-model="searchForm.eDate"
              type="date"
              placeholder="结束时间"
              value-format="YYYYMMDD"
              style="width: 140px"
            />
          </div>
        </el-form-item>

        <el-form-item label="金额">
          <div class="flex items-center">
            <el-input v-model="searchForm.sAmout" placeholder="最小金额" style="width: 100px" />
            <span class="mx-2">-</span>
            <el-input v-model="searchForm.eAmout" placeholder="最大金额" style="width: 100px" />
          </div>
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="输入用户名" clearable style="width: 150px" />
        </el-form-item>

        <el-form-item label="单号">
          <el-input v-model="searchForm.trano" placeholder="输入单号" clearable style="width: 180px" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            重置
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
        size="small"
      >
        <el-table-column prop="trano" label="平台单号" min-width="180" sortable show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" min-width="120" sortable />
        <el-table-column prop="accountname" label="姓名" min-width="100" sortable />
        <el-table-column prop="paytype" label="支付方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.paytype === 'bank'" type="primary" size="small">银行卡</el-tag>
            <el-tag v-else-if="row.paytype === 'usdt'" type="warning" size="small">USDT</el-tag>
            <el-tag v-else-if="row.paytype === 'alipay'" size="small" class="!bg-cyan-500 !text-white !border-cyan-500">支付宝</el-tag>
            <el-tag v-else-if="row.paytype === 'wechat'" type="success" size="small">微信</el-tag>
            <span v-else>{{ row.paytypename || row.paytype || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bankname" label="银行/渠道" min-width="120" sortable show-overflow-tooltip />
        <el-table-column prop="banknumber" label="账号/地址" min-width="180" sortable show-overflow-tooltip />
        <el-table-column label="收款码" width="80" align="center">
          <template #default="{ row }">
            <el-image 
              v-if="row.qr_code" 
              :src="row.qr_code" 
              :preview-src-list="[row.qr_code]"
              fit="cover"
              style="width: 40px; height: 40px; cursor: pointer;"
              preview-teleported
            />
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="amount" label="金额" min-width="100" sortable align="right">
          <template #default="{ row }">
            <div v-if="row.paytype === 'usdt'" class="text-xs">
              <div class="font-bold">¥{{ row.amount }}</div>
              <div class="text-gray-400">(扣款)</div>
            </div>
            <span v-else class="font-bold">{{ row.amount }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="actualamount" label="实到金额" min-width="120" sortable align="right">
          <template #default="{ row }">
            <div v-if="row.paytype === 'usdt'" class="text-xs">
              <div class="text-green-600 font-bold">{{ row.actualamount }} USDT</div>
              <div class="text-gray-400" v-if="row.remark">{{ row.remark.match(/汇率 [\d.]+/) ? row.remark.match(/汇率 [\d.]+/)[0] : '' }}</div>
            </div>
            <span v-else class="text-green-600 font-bold">{{ row.actualamount }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="fee" label="手续费" min-width="80" sortable align="right" />
        
        <el-table-column label="变更前后" min-width="140" align="center">
          <template #default="{ row }">
            <div class="text-xs">
              <div>前: {{ row.oldaccountmoney }}</div>
              <div>后: {{ row.newaccountmoney }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="oddtime" label="时间" min-width="160" sortable />
        
        <el-table-column prop="state" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.state === 0" type="warning">未审核</el-tag>
            <el-tag v-else-if="row.state === 1" type="success">已完成</el-tag>
            <el-tag v-else-if="row.state === 2" type="danger">退回</el-tag>
            <el-tag v-else-if="row.state === 3" type="info">取消</el-tag>
            <span v-else>{{ row.state }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <div v-if="row.state === 0">
              <el-button 
                size="small" 
                type="primary" 
                plain
                @click="handleApprove(row)"
              >通过</el-button>
              <el-button 
                size="small" 
                type="danger" 
                plain
                @click="handleReject(row)"
              >退回</el-button>
            </div>
            <span v-else class="text-g-400 text-xs">已处理</span>
          </template>
        </el-table-column>
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
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchWithdrawList,
  approveWithdraw,
  rejectWithdraw,
  type Withdraw,
  type WithdrawStatistics
} from '@/api/finance-withdraw'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
import { socketEmitter } from '@/utils/websocket'

const loading = ref(false)
const tableData = ref<Withdraw[]>([])
const statistics = ref<WithdrawStatistics>()

const searchForm = reactive({
  state: '' as string | number,
  sDate: '',
  eDate: '',
  sAmout: '',
  eAmout: '',
  username: '',
  trano: ''
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchWithdrawList({
      ...searchForm,
      page: pagination.page,
      limit: pagination.limit
    })
    tableData.value = res.list
    pagination.total = res.total
    statistics.value = res.statistics
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const resetSearch = () => {
  searchForm.state = ''
  searchForm.sDate = ''
  searchForm.eDate = ''
  searchForm.sAmout = ''
  searchForm.eAmout = ''
  searchForm.username = ''
  searchForm.trano = ''
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

const handleApprove = (row: Withdraw) => {
  ElMessageBox.confirm(
    '确定通过该提现申请吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await approveWithdraw(row.id)

      loadData()
    } catch (error) {

    }
  })
}

const handleReject = (row: Withdraw) => {
  ElMessageBox.confirm(
    '确定退回该提现申请吗？金额将退还给用户',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await rejectWithdraw(row.id)

      loadData()
    } catch (error) {

    }
  })
}

const onNewWithdraw = () => {
  if (pagination.page === 1) {
    loadData()
  }
}

onMounted(() => {
  loadData()
  socketEmitter.on('finance_new_withdraw', onNewWithdraw)
})

onUnmounted(() => {
  socketEmitter.off('finance_new_withdraw', onNewWithdraw)
})
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 12px;
  margin-right: 12px;
}
</style>
