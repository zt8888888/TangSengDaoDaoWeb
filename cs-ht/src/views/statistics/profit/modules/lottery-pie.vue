<template>
  <div class="art-card h-96 p-5 mb-5 max-sm:mb-4" v-loading="loading">
    <div class="art-card-header mb-4">
      <div class="title">
        <h4>彩种盈亏占比</h4>
        <p>各彩种贡献分布</p>
      </div>
    </div>
    <template v-if="pieData && pieData.length > 0">
      <ArtRingChart
        height="calc(100% - 50px)"
        :data="pieData"
        :showLegend="true"
        :radius="['40%', '70%']"
        :center="['50%', '50%']"
      />
    </template>
    <ElEmpty v-else-if="!loading" description="暂无数据" :image-size="80" class="h-full flex-cc" />
  </div>
</template>

<script setup lang="ts">
  const props = withDefaults(defineProps<{
    data?: { name: string; value: number }[]
    loading?: boolean
  }>(), {
    loading: false
  })

  const pieData = computed(() => props.data || [])
</script>
