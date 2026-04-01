<template>
  <div class="statistics-user">
    
    <UserCards :data="userStats" :loading="loading" />

    
    <ElRow :gutter="20">
      <ElCol :xl="16" :lg="16" :xs="24">
        <ActiveChart :data="activeTrend" :loading="loading" />
      </ElCol>
      <ElCol :xl="8" :lg="8" :xs="24">
        <RetentionCard :data="retentionData" :loading="retentionLoading" />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :xl="16" :lg="16" :xs="24">
        <UserValueAnalysis :data="valueAnalysisData" :loading="valueLoading" />
      </ElCol>
      <ElCol :xl="8" :lg="8" :xs="24">
        <DeviceDistribution :data="deviceData" :loading="deviceLoading" />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import UserCards from './modules/user-cards.vue'
  import ActiveChart from './modules/active-chart.vue'
  import RetentionCard from './modules/retention-card.vue'
  import UserValueAnalysis from './modules/user-value-analysis.vue'
  import DeviceDistribution from './modules/device-distribution.vue'
  import { fetchUserStats, fetchRetention, fetchValueAnalysis, fetchDeviceDistribution } from '@/api/statistics'

  defineOptions({ name: 'StatisticsUser' })

  const loading = ref(false)
  const retentionLoading = ref(false)
  const valueLoading = ref(false)
  const deviceLoading = ref(false)

  const userStats = ref<Api.Statistics.UserStats | null>(null)
  const retentionData = ref<Api.Statistics.RetentionData | null>(null)
  const valueAnalysisData = ref<Api.Statistics.ValueAnalysisData | null>(null)
  const deviceData = ref<Api.Statistics.DeviceDistributionData | null>(null)


  const activeTrend = computed<Api.Statistics.TrendData | null>(() => {
    if (!userStats.value?.growthTrend) return null
    const trend = userStats.value.growthTrend
    return {
      xAxis: trend.map(item => item.date),
      series: [
        { name: '新增用户', data: trend.map(item => item.newUsers) },
        { name: '活跃用户', data: trend.map(item => item.activeUsers) }
      ]
    }
  })

  const getUserStats = async () => {
    try {
      loading.value = true
      userStats.value = await fetchUserStats({})
    } catch (error) {
      console.error('获取用户统计失败:', error)
    } finally {
      loading.value = false
    }
  }

  const getRetention = async () => {
    try {
      retentionLoading.value = true
      retentionData.value = await fetchRetention()
    } catch (error) {
      console.error('获取留存率失败:', error)
    } finally {
      retentionLoading.value = false
    }
  }

  const getValueAnalysis = async () => {
    try {
      valueLoading.value = true
      valueAnalysisData.value = await fetchValueAnalysis()
    } catch (error) {
      console.error('获取用户价值分析失败:', error)
    } finally {
      valueLoading.value = false
    }
  }

  const getDeviceDistribution = async () => {
    try {
      deviceLoading.value = true
      deviceData.value = await fetchDeviceDistribution()
    } catch (error) {
      console.error('获取设备分布失败:', error)
    } finally {
      deviceLoading.value = false
    }
  }

  onMounted(() => {
    getUserStats()
    getRetention()
    getValueAnalysis()
    getDeviceDistribution()
  })
</script>
