<template>
  <div class="art-card h-96 p-5 mb-5 max-sm:mb-4" v-loading="loading">
    <div class="art-card-header mb-4">
      <div class="title">
        <h4>通道成功率趋势</h4>
        <p>近30天各通道成功率变化</p>
      </div>
    </div>
    <template v-if="chartData && chartData.length > 0">
      <ArtLineChart
        height="calc(100% - 50px)"
        :data="chartData"
        :xAxisData="xAxisData"
        :showLegend="true"
        :smooth="true"
      />
    </template>
    <ElEmpty v-else-if="!loading" description="暂无数据" :image-size="80" class="h-full flex-cc" />
  </div>
</template>

<script setup lang="ts">
  const props = withDefaults(defineProps<{
    data?: Api.Statistics.TrendData | null
    loading?: boolean
  }>(), {
    loading: false
  })

  const chartData = computed(() => {
    if (!props.data || !props.data.series) return []
    return props.data.series
  })

  const xAxisData = computed(() => {
    if (!props.data) return []
    return props.data.xAxis
  })
</script>
