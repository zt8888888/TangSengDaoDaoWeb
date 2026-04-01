<template>
  <ElDialog v-model="visible" title="详情" width="600px">
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem label="单号">{{ detail.trano }}</ElDescriptionsItem>
      <ElDescriptionsItem label="用户名">{{ detail.username }}</ElDescriptionsItem>
      <ElDescriptionsItem label="彩种">{{ detail.cptitle }}</ElDescriptionsItem>
      <ElDescriptionsItem label="期号">{{ detail.expect }}</ElDescriptionsItem>
      <ElDescriptionsItem label="玩法">{{ detail.playtitle }}</ElDescriptionsItem>
      <ElDescriptionsItem label="号码">
        <div class="break-all">{{ detail.tzcode }}</div>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="金额">{{ detail.amount }}</ElDescriptionsItem>
      <ElDescriptionsItem label="中奖金额">{{ detail.okamount }}</ElDescriptionsItem>
      <ElDescriptionsItem label="状态">
        <span :style="{ color: getStatusColor(detail.status_raw) }">{{ detail.status }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="投注时间">{{ detail.oddtime }}</ElDescriptionsItem>
      
    </ElDescriptions>
    <template #footer>
      <ElButton @click="visible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { HeMaiItem } from '@/api/robot-hemai'
import { ElDialog, ElDescriptions, ElDescriptionsItem, ElButton } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  detail: HeMaiItem
}>()

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const getStatusColor = (status: number) => {
  if (status === 1) return 'green'
  if (status === -1) return 'red'
  if (status === -2) return '#666'
  return '#333'
}
</script>

<style scoped>
.break-all {
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
