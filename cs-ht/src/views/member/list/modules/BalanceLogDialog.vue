<template>
  <ElDialog
    v-model="visible"
    title="账变记录"
    width="1200px"
    class="art-custom-dialog"
  >
    <div class="h-[500px]">
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchBalanceLog } from '@/api/member'

const props = withDefaults(defineProps<{
  modelValue: boolean
  memberId: number
}>(), {
  memberId: 0
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const {
  columns,
  data,
  loading,
  pagination,
  getData,
  handleSizeChange,
  handleCurrentChange
} = useTable({
  core: {
    apiFn: fetchBalanceLog,
    apiParams: {
      uid: props.memberId
    },
    immediate: false,
    columnsFactory: () => [
      { prop: 'id', label: 'ID', width: 70, align: 'center' },
      { prop: 'trano', label: '单号', width: 140, align: 'center' },
      { prop: 'username', label: '用户名', width: 100, align: 'center' },
      { prop: 'typename', label: '类型', width: 100, align: 'center' },
      { prop: 'amount', label: '金额', width: 100, align: 'center',
        formatter: (row: any) => {
          const amount = parseFloat(row.amount || 0)
          return amount.toFixed(2)
        }
      },
      { prop: 'amountbefor', label: '变动前', width: 100, align: 'center',
        formatter: (row: any) => parseFloat(row.amountbefor || 0).toFixed(2)
      },
      { prop: 'amountafter', label: '变动后', width: 100, align: 'center',
        formatter: (row: any) => parseFloat(row.amountafter || 0).toFixed(2)
      },
      { prop: 'remark', label: '备注', minWidth: 180, align: 'center' },
      { prop: 'oddtime_text', label: '时间', width: 150, align: 'center' }
    ]
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.memberId) {

        getData({ uid: props.memberId })
    }
  }
)
</script>
