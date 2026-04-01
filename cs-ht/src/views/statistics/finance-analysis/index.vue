<template>
  <div class="finance-analysis">
    <div class="art-card p-0 mb-5 max-sm:mb-4">
      <ElTabs v-model="activeTab" class="demo-tabs">
        <ElTabPane label="资金流水" name="flow">
          <div class="p-5">
            
            <FinanceIndex />
          </div>
        </ElTabPane>
        <ElTabPane label="平台盈亏" name="profit">
          <div class="p-5">
            
            <ProfitIndex />
          </div>
        </ElTabPane>
      </ElTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'

  const FinanceIndex = defineAsyncComponent(() => import('../finance/index.vue'))
  const ProfitIndex = defineAsyncComponent(() => import('../profit/index.vue'))

  defineOptions({ name: 'FinanceAnalysis' })

  const activeTab = ref('flow')
</script>

<style scoped>
:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}
:deep(.el-tabs__header) {
  margin-bottom: 0;
}
</style>
