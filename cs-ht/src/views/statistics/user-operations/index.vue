<template>
  <div class="user-operations">
    <div class="art-card p-0 mb-5 max-sm:mb-4">
      <ElTabs v-model="activeTab" class="demo-tabs">
        <ElTabPane label="玩家分析" name="player">
          <div class="p-5">
            
            <UserIndex />
          </div>
        </ElTabPane>
        <ElTabPane label="代理分析" name="agent">
          <div class="p-5">
            
            <TeamIndex />
          </div>
        </ElTabPane>
      </ElTabs>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'

  const UserIndex = defineAsyncComponent(() => import('../user/index.vue'))
  const TeamIndex = defineAsyncComponent(() => import('../team/index.vue'))

  defineOptions({ name: 'UserOperations' })

  const activeTab = ref('player')
</script>

<style scoped>
:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}
:deep(.el-tabs__header) {
  margin-bottom: 0;
}
</style>
