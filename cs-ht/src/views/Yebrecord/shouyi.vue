
<template>
  <div class="yeb-record-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      
      <div v-if="stats" class="mb-4 p-4 bg-hover-color rounded border-full-d flex gap-8 text-sm">
        <div>
          <span class="text-g-500">累计收益：</span>
          <span class="font-bold text-lg text-success">+{{ stats.total_interest || 0 }}</span>
        </div>
        <div>
          <span class="text-g-500">今日存入：</span>
          <span class="font-bold text-lg">{{ stats.today_deposit || 0 }}</span>
        </div>
        <div>
          <span class="text-g-500">今日取出：</span>
          <span class="font-bold text-lg">{{ stats.today_withdraw || 0 }}</span>
        </div>
        <div>
          <span class="text-g-500">今日收益：</span>
          <span class="font-bold text-lg text-warning">{{ stats.today_interest || 0 }}</span>
        </div>
        <div>
          <span class="text-g-500">进行中金额：</span>
          <span class="font-bold text-lg">{{ stats.running_amount || 0 }}</span>
        </div>
      </div>

      
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="refreshData"
        @search="handleSearch"
      >
        <template #search>
          <ElInput
            v-model="searchParams.username"
            placeholder="用户名"
            clearable
            class="w-40"
            @input="handleSearch"
          />
          <ElSelect
            v-model="searchParams.type"
            placeholder="类型"
            clearable
            class="w-32"
            @change="handleSearch"
          >
            <ElOption label="存入" value="deposit" />
            <ElOption label="取出" value="withdraw" />
            <ElOption label="收益发放" value="interest" />
            <ElOption label="领取收益" value="claim" />
            <ElOption label="定期结算" value="settle" />
          </ElSelect>
        </template>
      </ArtTableHeader>

      
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElTag, ElInput, ElSelect, ElOption } from 'element-plus'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { useTable } from '@/hooks/core/useTable'
import {
  fetchRecordList,
  fetchOverview,
  deleteRecord,
  type YebRecord,
  type YebRecordSearchParams
} from '@/api/yebao'

defineOptions({ name: 'YebRecord' })

const searchParams = reactive<YebRecordSearchParams>({
  username: '',
  type: undefined
})

const stats = ref<any>({})

const fetchStats = async () => {
  try {
    stats.value = await fetchOverview()
  } catch (error) {
    console.error(error)
  }
}

const {
  columns,
  columnChecks,
  data,
  loading,
  pagination,
  handleSizeChange,
  handleCurrentChange,
  refreshData
} = useTable({
  core: {
    apiFn: fetchRecordList,
    apiParams: searchParams,
    columnsFactory: () => [
      { prop: 'id', label: 'ID', width: 80, sortable: true, align: 'center' },
      { prop: 'username', label: '用户名', width: 120, align: 'center' },
      {
        prop: 'type_text',
        label: '类型',
        width: 100,
        align: 'center',
        formatter: (row: any) => {

          const val = row.type_text || row.type
          const map: Record<string, { type: string; label: string }> = {
            deposit: { type: 'primary', label: '存入' },
            withdraw: { type: 'warning', label: '取出' },
            interest: { type: 'success', label: '收益' },
            income: { type: 'success', label: '收益' },
            claim: { type: 'success', label: '领取' },
            settle: { type: 'info', label: '结算' },
            '存入': { type: 'primary', label: '存入' },
            '取出': { type: 'warning', label: '取出' },
            '收益发放': { type: 'success', label: '收益' },
            '领取收益': { type: 'success', label: '领取' },
            '定期结算': { type: 'info', label: '结算' }
          }
          const item = map[val] || { type: 'primary', label: val }
          return h(ElTag, { type: item.type as any }, () => item.label)
        }
      },
      { prop: 'amount', label: '变动金额', width: 120, align: 'center' },
      { prop: 'before_yebao', label: '变动前', width: 120, align: 'center' },
      { prop: 'after_yebao', label: '变动后', width: 120, align: 'center' },
      { prop: 'createtime_text', label: '时间', width: 180, align: 'center' },
      { prop: 'remark', label: '备注', minWidth: 200, align: 'center' },
      {
        prop: 'operation',
        label: '操作',
        width: 100,
        fixed: 'right',
        align: 'center',
        formatter: (row: YebRecord) =>
          h('div', [
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => handleDelete(row)
            })
          ])
      }
    ]
  }
})

const handleSearch = () => {
  refreshData()

}

const handleDelete = (row: YebRecord) => {
  ElMessageBox.confirm('确认删除该记录吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await deleteRecord(row.id)
      ElMessage.success('删除成功')
      handleSearch()
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  fetchStats()
})
</script>
