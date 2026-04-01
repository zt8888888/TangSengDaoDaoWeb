<template>
  <div class="p-4">
    
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-lg font-bold text-g-800 pl-2 border-l-4 border-primary">商户信息</h2>
      <el-button type="primary" size="large" @click="refreshAllBalances" :loading="balanceLoading">
        <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />一键刷新所有余额
      </el-button>
    </div>

    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" v-loading="loading">
      <div 
        v-for="item in tableData" 
        :key="item.id" 
        class="bg-box rounded-xl shadow-sm border-full-d hover:shadow-md transition-shadow duration-300 overflow-hidden group"
      >
        
        <div class="px-5 py-4 border-b-d flex justify-between items-center bg-hover-color">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {{ item.code.charAt(0) }}
            </div>
            <div>
              <div class="font-bold text-g-800 leading-tight">{{ item.name }}</div>
              <div class="text-xs text-g-400 font-mono mt-0.5">{{ item.code }}</div>
            </div>
          </div>
          <el-tag :type="getStatusType(item.status)" effect="plain" round size="small">
            {{ getStatusName(item.status) }}
          </el-tag>
        </div>

        
        <div class="p-5">
          <div class="flex justify-between items-start mb-4">
            <div class="text-g-500 text-sm">商户余额</div>
            <div v-if="item.hot === 1" class="text-danger text-xs flex items-center bg-danger/10 px-2 py-0.5 rounded-full">
              <ArtSvgIcon icon="ri:fire-fill" class="mr-1" />HOT
            </div>
          </div>
          
          <div class="flex items-end justify-between mb-2">
            <div class="text-2xl font-bold text-g-900 tracking-tight">
              <span class="text-base align-top mr-0.5 text-g-400">¥</span>
              {{ item.balance !== undefined ? Number(item.balance).toLocaleString() : '-' }}
            </div>
            <el-button 
              type="primary" 
              circle 
              plain 
              :loading="item.balanceLoading"
              @click="refreshSingleBalance(item)"
              class="group-hover:bg-primary group-hover:text-white transition-colors"
            >
              <i class="ri-refresh-line text-lg"></i>
            </el-button>
          </div>
          
          <div class="h-px bg-g-200 my-4"></div>

          <div class="flex justify-between items-center text-sm">
            <div class="flex items-center text-g-500">
              <i class="ri-gamepad-line mr-1.5"></i>
              <span>{{ getTypeName(item.type) }}</span>
            </div>
            <div class="text-g-400 text-xs">
              排序: {{ item.sort }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
    <el-empty v-if="!loading && tableData.length === 0" description="暂无商户数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchPlatformList,
  fetchPlatformBalance,
  fetchAllPlatformBalances,
  fetchPlatformTypeOptions,
  fetchPlatformStatusOptions,
  type GamePlatform,
  type PlatformOption
} from '@/api/game-platform'

const loading = ref(false)
const balanceLoading = ref(false)
const tableData = ref<any[]>([])
const typeOptions = ref<PlatformOption[]>([])
const statusOptions = ref<PlatformOption[]>([])

const loadData = async () => {
  loading.value = true
  try {

    const res = await fetchPlatformList({
      page: 1,
      limit: 100
    })
    tableData.value = res.list.map(item => ({ ...item, balanceLoading: false }))
  } finally {
    loading.value = false
  }
}

const loadOptions = async () => {
  try {
    const [types, statuses] = await Promise.all([
      fetchPlatformTypeOptions(),
      fetchPlatformStatusOptions()
    ])
    typeOptions.value = types || [
      { value: 'live', label: '真人视讯' },
      { value: 'slot', label: '电子游戏' },
      { value: 'chess', label: '棋牌游戏' },
      { value: 'sport', label: '体育投注' },
      { value: 'lottery', label: '彩票游戏' },
      { value: 'fishing', label: '捕鱼游戏' }
    ]
    statusOptions.value = statuses || [
      { value: 'online', label: '正常' },
      { value: 'offline', label: '下线' },
      { value: 'maintenance', label: '维护中' }
    ]
  } catch (error) {
    console.error(error)
  }
}

const getTypeName = (value: string) => {
  const opt = typeOptions.value.find(o => o.value === value)
  return opt ? opt.label : value
}

const getStatusName = (value: string) => {
  const opt = statusOptions.value.find(o => o.value === value)
  return opt ? opt.label : value
}

const getStatusType = (value: string) => {
  if (value === 'online') return 'success'
  if (value === 'maintenance') return 'warning'
  return 'info'
}

const refreshSingleBalance = async (row: any) => {
  row.balanceLoading = true
  try {
    const res = await fetchPlatformBalance(row.code)
    if (res && res.balance !== undefined) {
      row.balance = res.balance
      ElMessage.success(`${row.name} 余额已更新`)
    }
  } catch (e) {

  } finally {
    row.balanceLoading = false
  }
}

const refreshAllBalances = async () => {
  balanceLoading.value = true
  try {
    const res = await fetchAllPlatformBalances()
    if (Array.isArray(res)) {

      res.forEach((item: any) => {
        const row = tableData.value.find(r => r.code === item.code)
        if (row) row.balance = item.balance
      })
      ElMessage.success('所有平台余额已更新')
    }
  } catch (e) {
    console.error(e)
  } finally {
    balanceLoading.value = false
  }
}

onMounted(() => {
  loadData()
  loadOptions()
})
</script>
