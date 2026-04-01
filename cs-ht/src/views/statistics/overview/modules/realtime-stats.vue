<template>
  <div class="art-card h-80 p-5 mb-5 max-sm:mb-4" v-loading="loading">
    <div class="art-card-header">
      <div class="title">
        <h4>实时动态</h4>
        <p>
          <span class="inline-block w-2 h-2 rounded-full bg-success mr-1 animate-pulse"></span>
          实时更新中
        </p>
      </div>
      <ElButton size="small" :icon="Refresh" circle @click="emit('refresh')" />
    </div>

    <div class="h-9/10 mt-3 overflow-hidden" v-if="list && list.length > 0">
      <ElScrollbar>
        <div
          v-for="(item, index) in list"
          :key="index"
          class="flex items-center py-3 border-b border-g-200 last:border-b-0"
        >
          <div
            class="size-8 rounded-lg flex-cc mr-3"
            :class="getTypeStyle(item.type).bg"
          >
            <ArtSvgIcon
              :icon="getTypeStyle(item.type).icon"
              class="text-sm"
              :class="getTypeStyle(item.type).color"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-g-800 truncate">{{ item.content }}</p>
            <p class="text-xs text-g-500 mt-0.5">{{ item.time }}</p>
          </div>
          <span
            class="text-sm font-medium"
            :class="item.amount > 0 ? 'text-success' : 'text-danger'"
          >
            {{ item.amount > 0 ? '+' : '' }}{{ formatMoney(item.amount) }}
          </span>
        </div>
      </ElScrollbar>
    </div>
    <ElEmpty v-else-if="!loading" description="暂无实时数据" :image-size="60" class="h-4/5 flex-cc" />
  </div>
</template>

<script setup lang="ts">
  import { Refresh } from '@element-plus/icons-vue'

  const props = withDefaults(defineProps<{
    list?: Api.Statistics.RealtimeItem[]
    loading?: boolean
  }>(), {
    loading: false
  })

  const emit = defineEmits(['refresh'])

  const getTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; color: string; icon: string }> = {
      recharge: { bg: 'bg-success/10', color: 'text-success', icon: 'ri:wallet-3-line' },
      withdraw: { bg: 'bg-warning/10', color: 'text-warning', icon: 'ri:bank-card-line' },
      bet: { bg: 'bg-info/10', color: 'text-info', icon: 'ri:game-line' },
      win: { bg: 'bg-danger/10', color: 'text-danger', icon: 'ri:gift-line' }
    }
    return styles[type] || styles.recharge
  }

  const formatMoney = (amount: number) => {
    return '¥' + Math.abs(amount).toLocaleString()
  }
</script>
