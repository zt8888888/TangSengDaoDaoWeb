<template>
  <div class="robot-manage-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      
      <div class="search-form-container" id="art-table-header">
        <ElForm :model="searchParams" inline class="search-form">
          <ElFormItem label="用户名">
            <ElInput v-model="searchParams.username" placeholder="请输入用户名" style="width: 200px" />
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
            <ElButton type="primary" @click="openAddDialog">
              <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
              添加机器人
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

    
    <RobotDialog
      v-model="dialogVisible"
      :group-list="groupList"
      @submit="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchRobotList, deleteRobot, Robot } from '@/api/robot'
import { fetchMemberGroupList, MemberGroup } from '@/api/member'
import { ElButton, ElMessageBox, ElMessage, ElTag } from 'element-plus'
import RobotDialog from './modules/RobotDialog.vue'

defineOptions({ name: 'RobotManage' })


const searchParams = reactive({
  page: 1,
  limit: 20,
  username: ''
})


const groupList = ref<MemberGroup[]>([])
const dialogVisible = ref(false)


const loadGroups = async () => {
  try {
    const res = await fetchMemberGroupList({ page: 1, limit: 100 })
    if (res && res.list) {
      groupList.value = res.list
    }
  } catch (e) {
    console.error(e)
  }
}


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
    apiFn: fetchRobotList,
    apiParams: searchParams,
    paginationKey: {
      current: 'page',
      size: 'limit'
    },
    columnsFactory: () => [
      { prop: 'id', label: 'ID', width: 80, sortable: true, align: 'center' },
      { prop: 'username', label: '用户名', width: 150, align: 'center' },
      {
        prop: 'balance',
        label: '余额',
        width: 120,
        align: 'center',
        formatter: (row: Robot) => parseFloat(String(row.balance)).toFixed(2)
      },
      { prop: 'groupid', label: '会员组', width: 120, align: 'center' },
      {
        prop: 'isonline',
        label: '在线状态',
        width: 100,
        align: 'center',
        formatter: (row: Robot) => {

          const isOnline = String(row.isonline) === '在线' || row.isonline === 1 || (row.isonline_raw === 1)
          return h(
            'span',
            { style: { color: isOnline ? 'green' : 'red' } },
            String(row.isonline)
          )
        }
      },
      { prop: 'regtime', label: '注册时间', minWidth: 180, align: 'center' },
      {
        prop: 'action',
        label: '操作',
        width: 100,
        fixed: 'right',
        align: 'center',
        formatter: (row: Robot) =>
          h(
            ElButton,
            {
              type: 'danger',
              size: 'small',
              onClick: () => handleDelete(row)
            },
            () => '删除'
          )
      }
    ]
  }
})

onMounted(() => {
  loadGroups()
})

const resetSearch = () => {
  searchParams.username = ''
  refreshData()
}

const openAddDialog = () => {
  dialogVisible.value = true
}

const handleDelete = (row: Robot) => {
  ElMessageBox.confirm(`确定删除该机器人账号【${row.username}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRobot(row.id)
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
