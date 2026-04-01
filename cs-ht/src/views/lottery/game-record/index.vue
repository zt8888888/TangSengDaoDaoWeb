<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete } from '@element-plus/icons-vue'
import { fetchGetActiveLotteryList } from '@/api/lottery'
import { fetchGameRecordList, fetchCancelBet } from '@/api/game'

defineOptions({
  name: 'GameRecord'
})

const loading = ref(false)
const lotteryList = ref<any[]>([])
const tableData = ref<any[]>([])
const total = ref(0)
const refreshTimer = ref<any>(null)

const queryParams = reactive({
  page: 1,
  limit: 20,
  isnb: '',
  cpname: '',
  expect: '',
  orderno: '',
  username: '',
  status: '',
  start_time: '',
  end_time: '',
  refresh: 0
})

const contentDialogVisible = ref(false)
const currentContent = ref('')
const currentOrderNo = ref('')

const getLotteryList = async () => {
  try {
    const res = await fetchGetActiveLotteryList()
    if (Array.isArray(res)) {
      lotteryList.value = res
    } else if (res.data && Array.isArray(res.data)) {
      lotteryList.value = res.data
    } else if (res.data) {

        lotteryList.value = Object.values(res.data)
    }
  } catch (error) {
    console.error(error)
  }
}

const getList = async () => {
  loading.value = true
  try {

    const params: any = { ...queryParams }

    Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
            delete params[key]
        }
    })

    delete params.refresh

    const res: any = await fetchGameRecordList(params)

    if (res && Array.isArray(res.data)) {
       tableData.value = res.data
       total.value = res.count || res.total || 0
    } else if (Array.isArray(res)) {
       tableData.value = res
       total.value = res.length
    } else if (res && res.list) {
        tableData.value = res.list
        total.value = res.total || 0
    } else {
       tableData.value = []
       total.value = 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  getList()
}

const handleRefresh = () => {

    getList()
}

const handleAutoRefreshChange = (val: number) => {
    if (refreshTimer.value) {
        clearInterval(refreshTimer.value)
        refreshTimer.value = null
    }
    if (val > 0) {
        refreshTimer.value = setInterval(() => {
            getList()
        }, val * 1000)
        ElMessage.success(`已开启自动刷新：${val}秒`)
    }
}

const handleCancelBet = (row: any) => {
  ElMessageBox.confirm('确认撤单吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await fetchCancelBet({ id: row.id })
      ElMessage.success('撤单成功')
      getList()
    } catch (error) {
      console.error(error)
    }
  })
}

const showContent = (row: any) => {
    currentOrderNo.value = row.orderno
    currentContent.value = formatBetContent(row)
    contentDialogVisible.value = true
}

const formatBetContent = (row: any) => {
    const content = row.betcontent || ''

    const playId = row.play_id || row.playid || ''

    if (playId === 'xy28_combined' || (content.startsWith('[') && content.includes('playid'))) {
        try {
            const items = JSON.parse(content)
            if (Array.isArray(items)) {
                return items.map((item: any) => `${item.title || item.label || item.playid}${item.amount}`).join(' / ')
            }
        } catch (e) {

        }
    }
    return row.play_name || content
}

const formatAmount = (row: any) => {
    return row.amount ? parseFloat(row.amount).toFixed(2) : '0.00'
}
const formatWinAmount = (row: any) => {
    return row.winamount ? parseFloat(row.winamount).toFixed(2) : '0.00'
}

onMounted(() => {
  getLotteryList()
  getList()
})

onUnmounted(() => {
    if (refreshTimer.value) {
        clearInterval(refreshTimer.value)
    }
})
</script>

<template>
  <div class="p-4">
    
    <el-card shadow="hover" class="mb-4">
      <el-form :inline="true" :model="queryParams" class="flex flex-wrap gap-2">
        <el-form-item label="内部">
          <el-select v-model="queryParams.isnb" placeholder="全部" clearable class="!w-24" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="彩种">
          <el-select v-model="queryParams.cpname" placeholder="全部" clearable filterable class="!w-40" @change="handleSearch">
             <el-option label="全部" value="" />
            <el-option v-for="item in lotteryList" :key="item.name" :label="item.title" :value="item.name" />
          </el-select>
        </el-form-item>

        <el-form-item label="期号">
          <el-input v-model="queryParams.expect" placeholder="期号" clearable class="!w-32" @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item label="单号">
          <el-input v-model="queryParams.orderno" placeholder="单号" clearable class="!w-40" @keyup.enter="handleSearch" />
        </el-form-item>
        
        <el-form-item label="用户">
          <el-input v-model="queryParams.username" placeholder="用户名" clearable class="!w-32" @keyup.enter="handleSearch" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable class="!w-32" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="未开奖" value="0" />
            <el-option label="中奖" value="1" />
            <el-option label="未中奖" value="-1" />
            <el-option label="撤单" value="-2" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间">
           <el-date-picker
            v-model="queryParams.start_time"
            type="datetime"
            placeholder="开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="!w-44"
          />
          <span class="mx-2">-</span>
          <el-date-picker
            v-model="queryParams.end_time"
            type="datetime"
            placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="!w-44"
          />
        </el-form-item>

        <el-form-item label="自动刷新">
             <el-select v-model="queryParams.refresh" placeholder="关闭" class="!w-28" @change="handleAutoRefreshChange">
                <el-option label="关闭" :value="0" />
                <el-option label="5秒" :value="5" />
                <el-option label="10秒" :value="10" />
                <el-option label="30秒" :value="30" />
             </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card shadow="hover">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="orderno" label="单号" width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" align="center" />
        <el-table-column prop="lottery_name" label="彩票名称" width="120" align="center" />
        <el-table-column prop="expect" label="期号" width="120" align="center" />
        <el-table-column prop="play_name" label="玩法" width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="betcount" label="注数" width="80" align="center" />
        <el-table-column prop="odds" label="奖金/赔率" width="100" align="center" />
        <el-table-column prop="amount" label="金额" width="100" align="center" :formatter="formatAmount" />
        <el-table-column prop="after_balance" label="投注后金额" width="120" align="center">
             <template #default="{ row }">
                {{ row.after_balance ? parseFloat(row.after_balance).toFixed(2) : '0.00' }}
             </template>
        </el-table-column>
        <el-table-column prop="winamount" label="中奖金额" width="100" align="center" :formatter="formatWinAmount" />
        <el-table-column prop="wincount" label="中奖注数" width="100" align="center" />
        <el-table-column prop="multiple" label="中奖倍数" width="100" align="center" />
        <el-table-column prop="mode_text" label="元/角/分" width="80" align="center" />
        
        <el-table-column prop="betcontent" label="号码" min-width="150" align="center">
            <template #default="{ row }">
                <span v-if="formatBetContent(row).length > 15" 
                      class="text-primary cursor-pointer" 
                      @click="showContent(row)">
                    {{ formatBetContent(row).substring(0, 15) }}...
                </span>
                <span v-else>{{ formatBetContent(row) }}</span>
            </template>
        </el-table-column>

        <el-table-column prop="opencode" label="开奖号" width="120" align="center" show-overflow-tooltip />
        <el-table-column prop="type_text" label="类型" width="80" align="center" />
        
        <el-table-column label="状态" width="100" align="center">
             <template #default="{ row }">
                <el-tag v-if="row.isdraw == 1" type="success">中奖</el-tag>
                <el-tag v-else-if="row.isdraw == -1" type="info">未中奖</el-tag>
                <el-tag v-else-if="row.isdraw == -2" type="info" class="line-through text-gray-400">撤单</el-tag>
                <el-tag v-else>未开奖</el-tag>
             </template>
        </el-table-column>

        <el-table-column prop="bettime" label="投注时间" width="160" align="center" />
        
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
                v-if="row.isdraw == 0" 
                link 
                type="danger" 
                :icon="Delete" 
                @click="handleCancelBet(row)"
            >
                撤单
            </el-button>
            <span v-else>---</span>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @change="getList"
          @size-change="getList"
        />
      </div>
    </el-card>

    
    <el-dialog
      v-model="contentDialogVisible"
      :title="'单号: ' + currentOrderNo"
      width="400px"
    >
      <div class="whitespace-pre-wrap break-words">
        {{ currentContent }}
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.text-primary {
    color: var(--el-color-primary);
}
.line-through {
    text-decoration: line-through;
}
.text-gray-400 {
    color: #9ca3af;
}
</style>
