
<template>
  <div class="member-group-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="openGroupDialog('add')">
              <template #icon>
                <ArtSvgIcon icon="ri:add-line" />
              </template>
              添加会员组
            </ElButton>
          </ElSpace>
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

    
    <GroupDialog
      v-model:visible="groupDialogVisible"
      :type="groupDialogType"
      :data="currentGroupData"
      @submit="refreshData"
    />

    
    <LimitDialog
      v-model:visible="limitDialogVisible"
      :group-id="currentGroupData.groupid"
      :group-name="currentGroupData.groupname"
      @submit="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchMemberGroupList, deleteMemberGroup, MemberGroup } from '@/api/member'
  import GroupDialog from './modules/GroupDialog.vue'
  import LimitDialog from './modules/LimitDialog.vue'
  import { ElMessageBox, ElMessage } from 'element-plus'

  defineOptions({ name: 'MemberGroup' })


  const groupDialogVisible = ref(false)
  const groupDialogType = ref<'add' | 'edit'>('add')
  const limitDialogVisible = ref(false)
  const currentGroupData = ref<Partial<MemberGroup>>({})

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchMemberGroupList,
      apiParams: {
        page: 1,
        limit: 20
      },
      columnsFactory: () => [
        { prop: 'groupid', label: 'ID', width: 80, sortable: true, align: 'center' },
        {
          prop: 'groupname',
          label: '组名称',
          width: 150,
          align: 'center',
          formatter: (row: MemberGroup) => {
            return h(
              'span',
              {
                class: 'text-primary cursor-pointer hover:underline',
                onClick: () => openGroupDialog('edit', row)
              },
              row.groupname
            )
          }
        },
        { prop: 'shengjiedu', label: '晋级打码', width: 120, align: 'center' },
        { prop: 'jjje', label: '晋级奖金', width: 120, align: 'center' },
        { prop: 'free_withdraw_times', label: '免费提现', width: 100, align: 'center' },
        { prop: 'fanshui', label: '反水设置', align: 'center' },
        {
          prop: 'operation',
          label: '操作',
          width: 280,
          fixed: 'right',
          align: 'center',
          formatter: (row: MemberGroup) =>
            h('div', [
              h(
                ElButton,
                {
                  type: 'primary',
                  link: true,
                  size: 'small',
                  onClick: () => openLimitDialog(row)
                },
                () => '限额设置'
              ),
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => openGroupDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDelete(row)
              })
            ])
        }
      ]
    }
  })



  const openGroupDialog = (type: 'add' | 'edit', row?: MemberGroup) => {
    groupDialogType.value = type
    currentGroupData.value = row ? { ...row } : {}
    groupDialogVisible.value = true
  }



  const openLimitDialog = (row: MemberGroup) => {
    currentGroupData.value = { ...row }
    limitDialogVisible.value = true
  }



  const handleDelete = (row: MemberGroup) => {
    ElMessageBox.confirm('您确认删除该会员组吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }).then(async () => {
      try {
        await deleteMemberGroup(row.groupid)
        ElMessage.success('已删除!')
        refreshData()
      } catch (error) {
        console.error(error)
      }
    })
  }
</script>

<style scoped>
.text-primary {
  color: var(--el-color-primary);
}
</style>
