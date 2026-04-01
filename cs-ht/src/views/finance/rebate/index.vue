<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="返水比例" name="tier">
        <TierConfig />
      </el-tab-pane>
      <el-tab-pane label="反水记录" name="records">
        <RebateRecords />
      </el-tab-pane>
      <el-tab-pane label="统计报表" name="report">
        <RebateReport />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TierConfig from './components/TierConfig.vue'
import RebateRecords from './components/RebateRecords.vue'
import RebateReport from './components/RebateReport.vue'

const activeTab = ref('tier')
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
