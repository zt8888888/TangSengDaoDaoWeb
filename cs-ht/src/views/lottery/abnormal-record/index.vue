<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { fetchGetActiveLotteryList } from '@/api/lottery'
import { fetchAnomalyRecordList } from '@/api/game'

defineOptions({
  name: 'AbnormalRecord'
})

const loading = ref(false)
const lotteryList = ref<any[]>([])
const tableData = ref<any[]>([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  limit: 20,
  cpname: '',
  username: '',
  shijiancha: 130
})


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

    const res: any = await fetchAnomalyRecordList(params)

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


const formatAmount = (row: any) => {
    return row.amount ? parseFloat(row.amount).toFixed(2) : '0.00'
}
const formatOkAmount = (row: any) => {
    return row.okamount ? parseFloat(row.okamount).toFixed(2) : '0.00'
}

onMounted(() => {
  getLotteryList()
  getList()
})
</script>

<template>
  <div class="p-4">
    
    <el-card shadow="hover" class="mb-4">
      <el-form :inline="true" :model="queryParams" class="flex flex-wrap gap-2">
        <el-form-item label="彩种">
          <el-select v-model="queryParams.cpname" placeholder="全部" clearable filterable class="!w-40" @change="handleSearch">
             <el-option label="全部" value="" />
            <el-option v-for="item in lotteryList" :key="item.name" :label="item.title" :value="item.name" />
          </el-select>
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="输入用户名" clearable class="!w-40" @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item label="时间差距">
          <el-input v-model="queryParams.shijiancha" placeholder="输入时间差距(秒)" clearable class="!w-40" @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card shadow="hover">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="orderno" label="单号" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" align="center" />
        <el-table-column prop="lottery_name" label="彩票名称" width="120" align="center" />
        <el-table-column prop="expect" label="期号" width="120" align="center" />
        <el-table-column prop="play_name" label="玩法" width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="amount" label="投注金额" width="120" align="center" :formatter="formatAmount" />
        <el-table-column prop="okamount" label="中奖金额" width="120" align="center" :formatter="formatOkAmount" />
        
        <el-table-column label="状态" width="100" align="center">
             <template #default="{ row }">
                <span :class="row.status_class">{{ row.status_text }}</span>
             </template>
        </el-table-column>

        <el-table-column prop="oddtime_text" label="投注时间" width="160" align="center" />
        <el-table-column prop="opentime_text" label="出奖时间" width="160" align="center" />
        
        <el-table-column prop="time_diff" label="时间差(秒)" width="120" align="center">
            <template #default="{ row }">
                <span :class="{
                    'text-red-500 font-bold': row.time_diff <= 30,
                    'text-orange-500 font-bold': row.time_diff > 30 && row.time_diff <= 60,
                    'text-gray-800': row.time_diff > 60
                }">
                    {{ row.time_diff }}
                </span>
            </template>
        </el-table-column>
      </el-table>
      
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[20, 50, 100, 200]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @change="getList"
          @size-change="getList"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.text-red-500 {
    color: #FF5722;
}
.text-orange-500 {
    color: #ff9800; /* Closest to Orange */
}
.text-gray-800 {
    color: #333;
}
.font-bold {
    font-weight: bold;
}

/* CSS Classes from 1.md/response */
:deep(.c-green) {
    color: #5FB878;
}
:deep(.c-red) {
    color: #FF5722;
}
:deep(.c-333) {
    color: #333;
}
:deep(.c-666) {
    color: #666;
}
</style>
