
<template>
  <div class="statistics-overview">
    
    <WelcomeBanner :data="overviewData" />

    
    <StatCards :data="overviewData!" v-loading="cardsLoading" v-if="overviewData" />
    <div v-else-if="cardsLoading" class="art-card h-32 mb-5 flex-cc">
      <ElIcon class="is-loading"><Loading /></ElIcon>
      <span class="ml-2 text-g-500">加载统计数据中...</span>
    </div>

    
    <ElRow :gutter="20">
      <ElCol :xl="12" :lg="12" :xs="24">
        <TrendChart :data="rechargeTrendData" :loading="chartLoading" @update:days="getRechargeTrend" />
      </ElCol>
      <ElCol :xl="12" :lg="12" :xs="24">
        <BetTrendChart :data="betTrendData" :loading="chartLoading" />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :xl="16" :lg="16" :xs="24">
        <UserGrowthChart :data="userGrowthData" :loading="chartLoading" />
      </ElCol>
      <ElCol :xl="8" :lg="8" :xs="24">
        <RealtimeStats :list="realtimeData" :loading="realtimeLoading" @refresh="getRealtimeStats" />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { Loading } from '@element-plus/icons-vue'
  import WelcomeBanner from './modules/welcome-banner.vue'
  import StatCards from './modules/stat-cards.vue'
  import TrendChart from './modules/trend-chart.vue'
  import BetTrendChart from './modules/bet-trend-chart.vue'
  import UserGrowthChart from './modules/user-growth-chart.vue'
  import RealtimeStats from './modules/realtime-stats.vue'
  import {
    fetchOverviewStats,
    fetchRechargeTrend,
    fetchBetTrend,
    fetchUserGrowth,
    fetchRealtimeStats
  } from '@/api/statistics'
  import { socketEmitter, isConnected } from '@/utils/websocket'

  defineOptions({ name: 'StatisticsOverview' })

  const overviewData = ref<Api.Statistics.OverviewStats | null>(null)
  const rechargeTrendData = ref<Api.Statistics.TrendData | null>(null)
  const betTrendData = ref<Api.Statistics.TrendData | null>(null)
  const userGrowthData = ref<Api.Statistics.TrendData | null>(null)
  const realtimeData = ref<Api.Statistics.RealtimeItem[]>([])

  const cardsLoading = ref(false)
  const chartLoading = ref(false)
  const realtimeLoading = ref(false)


  const getOverviewStats = async () => {
    try {
      cardsLoading.value = true
      overviewData.value = await fetchOverviewStats()
    } catch (error) {
      console.error('获取统计概况失败:', error)
    } finally {
      cardsLoading.value = false
    }
  }


  const getRechargeTrend = async (days = 7) => {
    try {
      chartLoading.value = true
      rechargeTrendData.value = await fetchRechargeTrend({ days })
    } catch (error) {
      console.error('获取充提趋势失败:', error)
    } finally {
      chartLoading.value = false
    }
  }


  const getBetTrend = async () => {
    try {
      betTrendData.value = await fetchBetTrend({ days: 7 })
    } catch (error) {
      console.error('获取投注趋势失败:', error)
    }
  }


  const getUserGrowth = async () => {
    try {
      userGrowthData.value = await fetchUserGrowth()
    } catch (error) {
      console.error('获取用户增长失败:', error)
    }
  }


  const getRealtimeStats = async () => {
    try {
      realtimeLoading.value = true
      const res = await fetchRealtimeStats()
      if (res) {
        realtimeData.value = res.map(item => ({
          ...item,
          content: item.content || (item.username ? `用户 ${item.username} ${item.type} ${item.amount}` : '未知动态')
        }))
      }
    } catch (error) {
      console.error('获取实时动态失败:', error)
    } finally {
      realtimeLoading.value = false
    }
  }


  const handleSocketMessage = {
    stats_realtime: (payload: any) => {

      let content = payload.content
      if (!content && payload.username) {
        const typeMap: Record<string, string> = {
          recharge: '充值',
          withdraw: '提现',
          bet: '投注',
          win: '中奖'
        }
        const typeName = typeMap[payload.type] || payload.type
        content = `用户 ${payload.username} ${typeName} ${payload.amount}`
      }


      const newItem: Api.Statistics.RealtimeItem = {
        type: payload.type || 'recharge',
        content: content || '未知动态',
        time: payload.time || new Date().toLocaleTimeString(),
        amount: payload.amount || 0
      }
      realtimeData.value.unshift(newItem)

      if (realtimeData.value.length > 20) {
        realtimeData.value.pop()
      }
    },
    stats_realtime_init: (payload: any[]) => {
      if (Array.isArray(payload)) {
        realtimeData.value = payload.map(item => {
          let content = item.content
          if (!content && item.username) {
            const typeMap: Record<string, string> = {
              recharge: '充值',
              withdraw: '提现',
              bet: '投注',
              win: '中奖'
            }
            const typeName = typeMap[item.type] || item.type
            content = `用户 ${item.username} ${typeName} ${item.amount}`
          }
          return {
            type: item.type || 'recharge',
            content: content || '未知动态',
            time: item.time || '',
            amount: item.amount || 0
          }
        })
        realtimeLoading.value = false
      }
    },
    stats_overview: (payload: any) => {
      console.log('[Overview] Received stats_overview:', payload)
      if (!overviewData.value) {

        overviewData.value = {
          todayRegister: 0,
          todayRegisterChange: 0,
          todayActive: 0,
          todayActiveChange: 0,
          todayRecharge: 0,
          todayRechargeChange: 0,
          todayWithdraw: 0,
          todayWithdrawChange: 0,
          todayBet: 0,
          todayBetChange: 0,
          todayPrize: 0,
          todayPrizeChange: 0,
          todayProfit: 0,
          todayProfitChange: 0,
          platformBalance: 0,
          onlineCount: 0
        }
      }
      Object.assign(overviewData.value, payload)
      cardsLoading.value = false
    },
    stats_online: (payload: any) => {
      if (overviewData.value && typeof payload.count === 'number') {
        overviewData.value.onlineCount = payload.count
      }
    }
  }

  onMounted(() => {

    getOverviewStats()
    getRealtimeStats()
    getRechargeTrend()
    getBetTrend()
    getUserGrowth()


    Object.entries(handleSocketMessage).forEach(([event, handler]) => {
      socketEmitter.on(event as any, handler as any)
    })
  })

  onUnmounted(() => {

    Object.entries(handleSocketMessage).forEach(([event, handler]) => {
      socketEmitter.off(event as any, handler as any)
    })
  })
</script>
