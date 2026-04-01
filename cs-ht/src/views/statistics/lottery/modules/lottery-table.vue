<template>
  <div class="art-card h-96 p-5 mb-5 max-sm:mb-4" v-loading="loading">
    <div class="art-card-header mb-4">
      <div class="title">
        <h4>详细数据</h4>
        <p>各彩种投注盈亏明细</p>
      </div>
    </div>
    <div class="h-full overflow-hidden pb-8" v-if="tableData && tableData.length > 0">
      <ElTable :data="tableData" style="width: 100%" height="100%">
        <ElTableColumn prop="lotteryName" label="彩种名称" />
        <ElTableColumn prop="betCount" label="投注笔数" align="center" />
        <ElTableColumn prop="userCount" label="投注人数" align="center" />
        <ElTableColumn prop="betAmount" label="投注金额" align="right">
          <template #default="{ row }"> ¥{{ row.betAmount.toLocaleString() }} </template>
        </ElTableColumn>
        <ElTableColumn prop="prizeAmount" label="中奖金额" align="right">
          <template #default="{ row }"> ¥{{ row.prizeAmount.toLocaleString() }} </template>
        </ElTableColumn>
        <ElTableColumn prop="profitAmount" label="盈亏金额" align="right">
          <template #default="{ row }">
            <span :class="row.profitAmount >= 0 ? 'text-success' : 'text-danger'">
              ¥{{ row.profitAmount.toLocaleString() }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="profitRate" label="盈亏率" align="right">
          <template #default="{ row }"> {{ row.profitRate }}% </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <ElEmpty v-else-if="!loading" description="暂无数据" :image-size="80" class="h-full flex-cc" />
  </div>
</template>

<script setup lang="ts">
  const props = withDefaults(defineProps<{
    data?: Api.Statistics.LotteryStats['list']
    loading?: boolean
  }>(), {
    loading: false
  })

  const tableData = computed(() => props.data || [])
</script>
