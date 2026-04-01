<template>
  <ElRow :gutter="20" class="flex flex-wrap">
    <ElCol v-for="(item, index) in statList" :key="index" :sm="12" :md="8" :lg="4">
      <div class="art-card relative flex flex-col justify-center h-32 px-5 mb-5 max-sm:mb-4">
        <span class="text-g-600 text-sm">{{ item.label }}</span>
        <div class="flex items-baseline mt-2">
          <span v-if="item.prefix" class="text-lg text-g-700 mr-1">{{ item.prefix }}</span>
          <ArtCountTo
            class="text-2xl font-bold"
            :class="item.valueClass"
            :target="item.value"
            :duration="1500"
            :separator="item.separator"
          />
          <span v-if="item.suffix" class="text-sm text-g-600 ml-1">{{ item.suffix }}</span>
        </div>
        <div class="flex items-center mt-2" v-if="item.change !== undefined">
          <span class="text-xs text-g-500">环比</span>
          <span
            class="ml-1 text-xs font-semibold"
            :class="item.change >= 0 ? 'text-success' : 'text-danger'"
          >
            {{ item.change >= 0 ? '+' : '' }}{{ item.change }}%
          </span>
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  const props = defineProps<{
    data?: Api.Statistics.ProfitStats | null
    loading?: boolean
  }>()

  interface StatItem {
    label: string
    value: number
    prefix?: string
    suffix?: string
    separator?: string
    change?: number
    valueClass?: string
  }

  const statList = computed<StatItem[]>(() => {
    if (!props.data) return []


    const data = props.data as any

    return [
      {
        label: '投注总额',
        value: props.data.totalBet,
        prefix: '¥',
        separator: ',',
        change: data.totalBetChange ?? 0
      },
      {
        label: '中奖总额',
        value: props.data.totalPrize,
        prefix: '¥',
        separator: ',',
        change: data.totalPrizeChange ?? 0
      },
      {
        label: '返水总额',
        value: props.data.totalRebate,
        prefix: '¥',
        separator: ',',
        change: data.totalRebateChange ?? 0
      },
      {
        label: '活动支出',
        value: props.data.totalActivity,
        prefix: '¥',
        separator: ',',
        change: data.totalActivityChange ?? 0
      },
      {
        label: '净盈亏',
        value: props.data.netProfit,
        prefix: '¥',
        separator: ',',
        change: data.netProfitChange ?? 0,
        valueClass: 'text-success'
      },
      {
        label: '盈亏率',
        value: props.data.profitRate,
        suffix: '%',
        change: data.profitRateChange ?? 0,
        valueClass: 'text-warning'
      }
    ]
  })
</script>
