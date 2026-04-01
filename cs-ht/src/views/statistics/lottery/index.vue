<template>
  <div class="statistics-lottery" v-loading="loading">
    
    <div class="art-card p-5 mb-5 max-sm:mb-4">
      <ElForm :inline="true" :model="queryParams" class="flex flex-wrap gap-2">
        <ElFormItem label="时间范围" class="!mb-0">
          <ElDatePicker
            v-model="queryParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :shortcuts="shortcuts"
          />
        </ElFormItem>
        <ElFormItem label="彩种选择" class="!mb-0">
          <ElSelect v-model="queryParams.lotteryId" placeholder="全部彩种" class="w-40" clearable>
            <ElOption label="全部" value="" />
            <ElOption v-for="item in lotteryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem class="!mb-0">
          <ElButton type="primary" @click="handleSearch" :loading="loading">查询</ElButton>
          <ElButton @click="resetSearch">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </div>

    
    <ElRow :gutter="20">
      <ElCol :xl="8" :lg="8" :xs="24">
        <BetPie :data="lotteryStats?.pieData" :loading="loading" />
      </ElCol>
      <ElCol :xl="16" :lg="16" :xs="24">
        <BetTimeAnalysis :data="lotteryStats?.peakHours" :loading="loading" />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :xl="16" :lg="16" :xs="24">
        <LotteryTable :data="lotteryStats?.list" :loading="loading" />
      </ElCol>
      <ElCol :xl="8" :lg="8" :xs="24">
        <ElRow :gutter="20">
          <ElCol :span="24">
            <HotPlay :data="lotteryStats?.hotPlay" :loading="loading" />
          </ElCol>
          <ElCol :span="24">
            <BigWinList :data="lotteryStats?.bigWins" :loading="loading" />
          </ElCol>
        </ElRow>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import LotteryTable from './modules/lottery-table.vue'
  import BetPie from './modules/bet-pie.vue'
  import HotPlay from './modules/hot-play.vue'
  import BetTimeAnalysis from './modules/bet-time-analysis.vue'
  import BigWinList from './modules/big-win-list.vue'
  import { fetchLotteryStats } from '@/api/statistics'

  defineOptions({ name: 'StatisticsLottery' })

  const queryParams = reactive({
    dateRange: [] as string[],
    lotteryId: ''
  })

  const loading = ref(false)
  const lotteryStats = ref<Api.Statistics.LotteryStats | null>(null)


  const lotteryOptions = ref([
    { label: '幸运28', value: '1' },
    { label: '北京快三', value: '2' },
    { label: '重庆时时彩', value: '3' }
  ])

  const shortcuts = [
    { text: '今天', value: () => {
      const today = new Date()
      return [today, today]
    }},
    { text: '最近一周', value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }},
    { text: '最近一个月', value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }}
  ]

  const getLotteryStats = async () => {
    try {
      loading.value = true
      const params: Api.Statistics.LotteryParams = {}
      if (queryParams.dateRange?.length === 2) {
        params.startDate = queryParams.dateRange[0]
        params.endDate = queryParams.dateRange[1]
      }
      if (queryParams.lotteryId) {
        params.lotteryType = queryParams.lotteryId
      }
      lotteryStats.value = await fetchLotteryStats(params)
    } catch (error) {
      console.error('获取彩种统计失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    getLotteryStats()
  }

  const resetSearch = () => {
    queryParams.dateRange = []
    queryParams.lotteryId = ''
    getLotteryStats()
  }

  onMounted(() => {
    getLotteryStats()
  })
</script>
