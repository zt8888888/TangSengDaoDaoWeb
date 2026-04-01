<template>
  <div class="art-card h-96 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header mb-4">
      <div class="title">
        <h4>团队业绩趋势</h4>
        <p>近30天团队充值与投注对比</p>
      </div>
    </div>
    <ArtLineChart
      height="calc(100% - 50px)"
      :data="chartData"
      :xAxisData="xAxisData"
      :showLegend="true"
      :smooth="true"
      :showArea="true"
    />
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    data?: Api.Statistics.TrendData | null
  }>()

  const chartData = computed(() => {
    if (!props.data) return []
    return props.data.series
  })

  const xAxisData = computed(() => {
    if (!props.data) return []
    return props.data.xAxis
  })
</script>
