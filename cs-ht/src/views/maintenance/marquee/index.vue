<template>
  <div class="marquee-manage-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      
      <div class="search-form-container" id="art-table-header">
        <ElForm :model="searchParams" inline class="search-form">
          <ElFormItem label="内容">
            <ElInput v-model="searchParams.content" placeholder="请输入内容关键词" style="width: 200px" />
          </ElFormItem>
          
          <ElFormItem label="状态">
            <ElSelect v-model="searchParams.status" placeholder="全部" style="width: 120px" clearable>
              <ElOption label="启用" :value="1" />
              <ElOption label="禁用" :value="0" />
            </ElSelect>
          </ElFormItem>
          
          <ElFormItem>
            <ElButton type="primary" @click="refreshData">
              <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
              搜索
            </ElButton>
            <ElButton @click="resetSearch">
              <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
              重置
            </ElButton>
          </ElFormItem>

          <div style="float: right">
            <ElButton type="primary" @click="openDialog('add')">
              <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
              添加跑马灯
            </ElButton>
          </div>
        </ElForm>
      </div>

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

    <MarqueeDialog
      v-model="dialogVisible"
      :type="dialogType"
      :data="currentMarquee"
      @submit="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchMarqueeList, deleteMarquee, toggleMarqueeStatus, Marquee } from '@/api/maintenance-marquee'
import { ElButton, ElMessageBox, ElMessage, ElSwitch } from 'element-plus'
import MarqueeDialog from './modules/MarqueeDialog.vue'

defineOptions({ name: 'MarqueeManage' })

const searchParams = reactive({
  page: 1,
  limit: 20,
  content: '',
  status: '' as number | string
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentMarquee = ref<Marquee>()

const {
  columns,
  data,
  loading,
  pagination,
  refreshData,
  handleSizeChange,
  handleCurrentChange
} = useTable({
  core: {
    apiFn: fetchMarqueeList,
    apiParams: searchParams,
    paginationKey: {
      current: 'page',
      size: 'limit'
    },
    columnsFactory: () => [
      { prop: 'id', label: 'ID', width: 80, align: 'center', sortable: true },
      { 
        prop: 'content', 
        label: '跑马灯内容', 
        minWidth: 400, 
        align: 'left', 
        showOverflowTooltip: true,
        formatter: (row: Marquee) => {
          const content = row.content || ''
          return content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
        }
      },
      { prop: 'sort', label: '排序', width: 80, align: 'center' },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        align: 'center',
        formatter: (row: Marquee) =>
          h(ElSwitch, {
            modelValue: row.status === 1,
            onChange: () => handleToggleStatus(row)
          })
      },
      { prop: 'add_time', label: '创建时间', width: 180, align: 'center' },
      {
        prop: 'action',
        label: '操作',
        width: 150,
        fixed: 'right',
        align: 'center',
        formatter: (row: Marquee) =>
          h('div', { class: 'flex justify-center gap-2' }, [
            h(
              ElButton,
              {
                size: 'small',
                onClick: () => openDialog('edit', row)
              },
              () => '编辑'
            ),
            h(
              ElButton,
              {
                type: 'danger',
                size: 'small',
                onClick: () => handleDelete(row)
              },
              () => '删除'
            )
          ])
      }
    ]
  }
})

onMounted(() => {
  refreshData()
})

const resetSearch = () => {
  searchParams.content = ''
  searchParams.status = ''
  refreshData()
}

const openDialog = (type: 'add' | 'edit', row?: Marquee) => {
  dialogType.value = type
  currentMarquee.value = row ? { ...row } : undefined
  dialogVisible.value = true
}

const handleToggleStatus = async (row: Marquee) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await toggleMarqueeStatus(row.id, newStatus)
    refreshData()
  } catch (e) {
  }
}

const handleDelete = (row: Marquee) => {
  ElMessageBox.confirm(`确定删除该跑马灯吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMarquee(row.id)
      ElMessage.success('删除成功')
      refreshData()
    } catch (e) {
    }
  })
}
</script>

<style scoped>
.search-form-container {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}
</style>

