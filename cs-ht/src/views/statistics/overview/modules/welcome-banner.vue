<template>
  <ArtBasicBanner
    class="justify-center !h-40 mb-5 max-sm:!pt-6 max-sm:!h-36 max-sm:mb-4"
    title="数据统计中心"
    boxStyle="!bg-theme/10"
    titleColor="var(--art-gray-900)"
    :decoration="false"
    :meteorConfig="{
      enabled: true,
      count: 8
    }"
    :buttonConfig="{
      show: false,
      text: ''
    }"
  >
    <div class="flex items-center mt-4 gap-8">
      <div class="text-center">
        <p class="text-2xl font-bold text-theme">
          <ArtCountTo v-if="onlineCount > 0" :target="onlineCount" :duration="1500" />
          <span v-else>{{ onlineCount }}</span>
        </p>
        <p class="mt-1 text-sm text-g-600">实时在线</p>
      </div>
      <div class="w-px h-10 bg-g-400"></div>
      <div class="text-center">
        <p class="text-2xl font-bold text-success">
          <ArtCountTo :target="data?.todayProfit || 0" :duration="1500" prefix="¥" separator="," />
        </p>
        <p class="mt-1 text-sm text-g-600">今日盈亏</p>
      </div>
      <div class="w-px h-10 bg-g-400"></div>
      <div class="text-center">
        <p class="text-2xl font-bold text-warning">
          <ArtCountTo :target="data?.platformBalance || 0" :duration="1500" prefix="¥" separator="," />
        </p>
        <p class="mt-1 text-sm text-g-600">平台余额</p>
      </div>
    </div>
  </ArtBasicBanner>
</template>

<script setup lang="ts">
  const props = defineProps<{
    data?: Api.Statistics.OverviewStats | null
  }>()

  const onlineCount = computed(() => {
    return props.data?.onlineCount ?? 0
  })
</script>
