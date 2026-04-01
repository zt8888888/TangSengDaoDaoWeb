<template>
  <div class="art-card h-96 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header mb-4">
      <div class="title">
        <h4>通道统计</h4>
        <p>各支付通道充值数据</p>
      </div>
    </div>
    <div class="h-full overflow-hidden pb-8">
      <ElTable :data="tableData" style="width: 100%" height="100%">
        <ElTableColumn prop="name" label="通道名称" show-overflow-tooltip />
        <ElTableColumn prop="count" label="充值笔数" align="center" />
        <ElTableColumn prop="amount" label="充值金额" align="right">
          <template #default="{ row }"> ¥{{ row.amount.toLocaleString() }} </template>
        </ElTableColumn>
        <ElTableColumn prop="rate" label="成功率" align="right">
          <template #default="{ row }">
            <span :class="row.rate >= 90 ? 'text-success' : 'text-warning'"> {{ row.rate }}% </span>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    data?: Api.Statistics.FinanceStats | null
    loading?: boolean
  }>()

  const tableData = computed(() => {
    if (!props.data) return []

    return props.data.channels.map(item => ({
      ...item,
      rate: item.successRate
    }))
  })
</script>
