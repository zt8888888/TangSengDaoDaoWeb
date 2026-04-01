<template>
  <div class="notice-manage-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      
      <div class="search-form-container" id="art-table-header">
        <ElForm :model="searchParams" inline class="search-form">
          <ElFormItem label="公告标题">
            <ElInput v-model="searchParams.title" placeholder="请输入公告标题" style="width: 200px" />
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
              添加公告
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

    
    <NoticeDialog
      v-model="dialogVisible"
      :type="dialogType"
      :data="currentNotice"
      @submit="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchNoticeList, deleteNotice, Notice } from '@/api/maintenance-notice'
import { ElButton, ElMessageBox, ElMessage } from 'element-plus'
import NoticeDialog from './modules/NoticeDialog.vue'

defineOptions({ name: 'NoticeManage' })

const searchParams = reactive({
  page: 1,
  limit: 20,
  title: ''
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentNotice = ref<Notice>()

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
    apiFn: fetchNoticeList,
    apiParams: searchParams,
    paginationKey: {
      current: 'page',
      size: 'limit'
    },
    columnsFactory: () => [
      { prop: 'id', label: 'ID', width: 80, align: 'center', sortable: true },
      { prop: 'title', label: '公告标题', minWidth: 300, align: 'center' },
      { prop: 'content', label: '公告内容', minWidth: 300, align: 'center', showOverflowTooltip: true },
      { prop: 'create_time', label: '发布时间', width: 180, align: 'center' },
      {
        prop: 'action',
        label: '操作',
        width: 150,
        fixed: 'right',
        align: 'center',
        formatter: (row: Notice) =>
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
  searchParams.title = ''
  refreshData()
}

const openDialog = (type: 'add' | 'edit', row?: Notice) => {
  dialogType.value = type
  currentNotice.value = row ? { ...row } : undefined
  dialogVisible.value = true
}

const handleDelete = (row: Notice) => {
  ElMessageBox.confirm(`确定删除公告【${row.title}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteNotice(row.id)
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
