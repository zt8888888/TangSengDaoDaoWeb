<template>
  <div class="art-card h-96 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header mb-4">
      <div class="title">
        <h4>佣金发放趋势</h4>
        <p>近30天佣金支出统计</p>
      </div>
    </div>
    <ArtBarChart
      height="calc(100% - 50px)"
      :data="chartData"
      :xAxisData="xAxisData"
      :showLegend="true"
      :showAxisLine="false"
      barWidth="40%"
    />
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    data?: Api.Statistics.TrendData | null
  }>()

  const chartData = computed(() => {
    if (!props.data) return []
    return props.data.series.map(item => ({
      ...item,
      itemStyle: { color: 'var(--el-color-warning)' }
    }))
  })

  const xAxisData = computed(() => {
    if (!props.data) return []
    return props.data.xAxis
  })
</script>
