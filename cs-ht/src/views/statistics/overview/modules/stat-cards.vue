<template>
  <ElRow :gutter="20" class="flex flex-wrap">
    <ElCol v-for="(item, index) in statList" :key="index" :sm="12" :md="6" :lg="6" :xl="3">
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
          <span class="text-xs text-g-500">较昨日</span>
          <span
            class="ml-1 text-xs font-semibold"
            :class="item.change >= 0 ? 'text-success' : 'text-danger'"
          >
            {{ item.change >= 0 ? '+' : '' }}{{ item.change }}%
          </span>
        </div>
        <div
          class="absolute top-0 bottom-0 right-4 m-auto size-11 rounded-xl flex-cc"
          :class="item.iconBg"
        >
          <ArtSvgIcon :icon="item.icon" class="text-lg" :class="item.iconClass" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  interface StatItem {
    label: string
    value: number
    prefix?: string
    suffix?: string
    separator?: string
    change?: number
    icon: string
    iconBg: string
    iconClass: string
    valueClass?: string
  }

  const props = defineProps<{
    data: Api.Statistics.OverviewStats
  }>()

  const statList = computed<StatItem[]>(() => {
    if (!props.data) return []

    return [
      {
        label: '今日注册',
        value: props.data.todayRegister,
        change: props.data.todayRegisterChange,
        icon: 'ri:user-add-line',
        iconBg: 'bg-primary/10',
        iconClass: 'text-primary'
      },
      {
        label: '今日活跃',
        value: props.data.todayActive,
        change: props.data.todayActiveChange,
        icon: 'ri:user-heart-line',
        iconBg: 'bg-success/10',
        iconClass: 'text-success'
      },
      {
        label: '今日充值',
        value: props.data.todayRecharge,
        prefix: '¥',
        separator: ',',
        change: props.data.todayRechargeChange,
        icon: 'ri:wallet-3-line',
        iconBg: 'bg-warning/10',
        iconClass: 'text-warning'
      },
      {
        label: '今日提现',
        value: props.data.todayWithdraw,
        prefix: '¥',
        separator: ',',
        change: props.data.todayWithdrawChange,
        icon: 'ri:bank-card-line',
        iconBg: 'bg-danger/10',
        iconClass: 'text-danger'
      },
      {
        label: '今日投注',
        value: props.data.todayBet,
        prefix: '¥',
        separator: ',',
        change: props.data.todayBetChange,
        icon: 'ri:game-line',
        iconBg: 'bg-info/10',
        iconClass: 'text-info'
      },
      {
        label: '今日派奖',
        value: props.data.todayPrize,
        prefix: '¥',
        separator: ',',
        change: props.data.todayPrizeChange,
        icon: 'ri:gift-line',
        iconBg: 'bg-purple-500/10',
        iconClass: 'text-purple-500'
      },
      {
        label: '今日盈亏',
        value: props.data.todayProfit,
        prefix: '¥',
        separator: ',',
        change: props.data.todayProfitChange,
        icon: 'ri:line-chart-line',
        iconBg: 'bg-success/10',
        iconClass: 'text-success',
        valueClass: 'text-success'
      },
      {
        label: '平台余额',
        value: props.data.platformBalance,
        prefix: '¥',
        separator: ',',
        icon: 'ri:safe-2-line',
        iconBg: 'bg-theme/10',
        iconClass: 'text-theme'
      }
    ]
  })
</script>
