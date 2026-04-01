<template>
  <div class="art-card h-96 p-5 mb-5 max-sm:mb-4" v-loading="loading">
    <div class="art-card-header mb-4">
      <div class="title">
        <h4>大额中奖榜</h4>
        <p>近期高额中奖记录</p>
      </div>
    </div>
    <div class="h-full overflow-hidden pb-8" v-if="tableData && tableData.length > 0">
      <ElTable :data="tableData" style="width: 100%" height="100%">
        <ElTableColumn prop="username" label="用户账号" show-overflow-tooltip />
        <ElTableColumn prop="lotteryName" label="彩种" width="100" align="center" />
        <ElTableColumn label="玩法" width="100" align="center">
          <template #default="{ row }">
            {{ row.playTitle || row.playName }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="prizeAmount" label="中奖金额" align="right">
          <template #default="{ row }">
            <span class="text-danger font-bold">¥{{ row.prizeAmount.toLocaleString() }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="time" label="时间" align="right" width="80" />
      </ElTable>
    </div>
    <ElEmpty v-else-if="!loading" description="暂无数据" :image-size="80" class="h-full flex-cc" />
  </div>
</template>

<script setup lang="ts">
  const props = withDefaults(defineProps<{
    data?: any[]
    loading?: boolean
  }>(), {
    loading: false
  })

  const tableData = computed(() => props.data || [])
</script>
