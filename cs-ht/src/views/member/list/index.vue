<template>
  <div class="member-list-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      
      <div class="search-form-container" id="art-table-header">
        <ElForm :model="searchParams" inline class="search-form">
          
          <ElFormItem>
            <ElButton type="primary" @click="openDialog('add')">
              <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
              添加会员
            </ElButton>
          </ElFormItem>

          
          <ElFormItem label="排序">
            <ElSelect v-model="searchParams.ordertype" style="width: 150px">
              <ElOption label="默认排序" :value="0" />
              <ElOption label="注册时间低到高" :value="1" />
              <ElOption label="彩票返点高到低" :value="2" />
              <ElOption label="彩票返点低到高" :value="3" />
              <ElOption label="账户金额高到低" :value="4" />
              <ElOption label="账户金额低到高" :value="5" />
              <ElOption label="洗码余额高到低" :value="8" />
              <ElOption label="洗码余额低到高" :value="9" />
              <ElOption label="登陆时间高到低" :value="16" />
              <ElOption label="登陆时间低到高" :value="17" />
              <ElOption label="在线时间高到低" :value="18" />
              <ElOption label="在线时间低到高" :value="19" />
            </ElSelect>
          </ElFormItem>

          
          <ElFormItem label="会员组">
            <ElSelect v-model="searchParams.groupid" style="width: 120px">
              <ElOption label="全部" :value="0" />
              <ElOption
                v-for="g in groupList"
                :key="g.groupid"
                :label="g.groupname"
                :value="g.groupid"
              />
            </ElSelect>
          </ElFormItem>

          
          <ElFormItem label="类型">
            <ElSelect v-model="searchParams.proxy" style="width: 100px">
              <ElOption label="全部" :value="999" />
              <ElOption label="代理" :value="1" />
              <ElOption label="会员" :value="0" />
            </ElSelect>
          </ElFormItem>

          
          <ElFormItem label="内部">
            <ElSelect v-model="searchParams.isnb" style="width: 100px">
              <ElOption label="全部" :value="999" />
              <ElOption label="是" :value="1" />
              <ElOption label="否" :value="0" />
            </ElSelect>
          </ElFormItem>

          
          <ElFormItem label="用户名">
            <ElInput v-model="searchParams.username" placeholder="输入用户名" style="width: 120px" />
          </ElFormItem>
          <ElFormItem label="姓名">
            <ElInput v-model="searchParams.userbankname" placeholder="输入姓名" style="width: 120px" />
          </ElFormItem>
          <ElFormItem label="昵称">
            <ElInput v-model="searchParams.nickname" placeholder="输入昵称" style="width: 120px" />
          </ElFormItem>
          <ElFormItem label="登陆IP">
            <ElInput v-model="searchParams.loginip" placeholder="输入登陆IP" style="width: 120px" />
          </ElFormItem>

          
          <ElFormItem>
            <ElCheckbox v-model="searchParams.isonline" :true-label="1" :false-label="0">在线</ElCheckbox>
          </ElFormItem>

          
          <ElFormItem label="注册时间">
            <ElDatePicker
              v-model="searchParams.sDate"
              type="date"
              placeholder="开始时间"
              value-format="YYYYMMDD"
              style="width: 140px"
            />
            <span class="mx-2">-</span>
            <ElDatePicker
              v-model="searchParams.eDate"
              type="date"
              placeholder="结束时间"
              value-format="YYYYMMDD"
              style="width: 140px"
            />
          </ElFormItem>

          
          <ElFormItem label="金额">
            <ElInput v-model="searchParams.sAmount" placeholder="最小" style="width: 100px" />
            <span class="mx-2">-</span>
            <ElInput v-model="searchParams.eAmount" placeholder="最大" style="width: 100px" />
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

    
    <MemberDialog
      v-model="dialogVisible"
      :type="dialogType"
      :data="currentMember"
      :group-list="groupList"
      @submit="refreshData"
    />

    
    <AdjustDialog
      v-model="adjustDialogVisible"
      :type="adjustType"
      :member-id="currentMember.id!"
      :current-value="adjustCurrentValue"
      @submit="refreshData"
    />

    
    <MemberInfoDialog
      v-model="infoDialogVisible"
      :member="currentMember"
    />

    
    <MemberDevicesDialog
      v-model="devicesDialogVisible"
      :member-id="currentMember.id!"
    />

    
    <BalanceLogDialog
      v-model="logDialogVisible"
      :member-id="currentMember.id!"
    />

    
    <ChildrenDialog
      v-model="childrenDialogVisible"
      :member-id="currentMember.id!"
    />

    
    <WithdrawAccountDialog
      v-model="withdrawAccountDialogVisible"
      :member-id="currentMember.id!"
      :member-username="currentMember.username"
    />

    <ElDialog v-model="gameBalanceDialogVisible" title="游戏余额" width="500px">
      <div v-loading="gameBalanceLoading">
        <div class="mb-4 text-lg font-bold">总余额: {{ gameBalanceTotal }}</div>
        <ElTable :data="gameBalanceList" border size="small" v-if="gameBalanceList.length">
          <ElTableColumn prop="platform_name" label="平台" />
          <ElTableColumn prop="balance" label="余额" />
          <ElTableColumn prop="updated_at" label="更新时间" width="160" />
        </ElTable>
        <div v-else class="text-center text-gray-400 py-4">暂无游戏余额</div>
      </div>
      <template #footer>
        <ElButton @click="gameBalanceDialogVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="handleRecallAll" :loading="recallLoading" :disabled="!gameBalanceList.length">一键回收</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import {
  fetchMemberList,
  deleteMember,
  kickMember,
  lockMember,
  fetchMemberGroupList,
  Member,
  MemberGroup
} from '@/api/member'
import { ElButton, ElTag, ElSwitch, ElMessageBox, ElMessage, ElDialog, ElTable, ElTableColumn } from 'element-plus'
import request from '@/utils/http'
import MemberDialog from './modules/MemberDialog.vue'
import AdjustDialog from './modules/AdjustDialog.vue'
import MemberInfoDialog from './modules/MemberInfoDialog.vue'
import MemberDevicesDialog from './modules/MemberDevicesDialog.vue'
import BalanceLogDialog from './modules/BalanceLogDialog.vue'
import ChildrenDialog from './modules/ChildrenDialog.vue'
import WithdrawAccountDialog from './modules/WithdrawAccountDialog.vue'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

defineOptions({ name: 'MemberList' })

const searchParams = reactive({
  page: 1,
  limit: 20,
  ordertype: 0,
  groupid: 0,
  proxy: 999,
  isnb: 999,
  username: '',
  userbankname: '',
  nickname: '',
  loginip: '',
  isonline: 0,
  sDate: '',
  eDate: '',
  sAmount: '',
  eAmount: ''
})

const groupList = ref<MemberGroup[]>([])

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentMember = ref<Partial<Member>>({})

const adjustDialogVisible = ref(false)
const adjustType = ref<'balance' | 'point' | 'xima'>('balance')
const adjustCurrentValue = ref(0)

const infoDialogVisible = ref(false)
const devicesDialogVisible = ref(false)
const logDialogVisible = ref(false)
const childrenDialogVisible = ref(false)
const withdrawAccountDialogVisible = ref(false)
const gameBalanceDialogVisible = ref(false)
const gameBalanceLoading = ref(false)
const gameBalanceTotal = ref('0.00')
const gameBalanceList = ref<any[]>([])
const recallLoading = ref(false)

const loadGroups = async () => {
  try {
    const res = await fetchMemberGroupList({ page: 1, limit: 100 })
    if (res && res.list) {
      groupList.value = res.list
    }
  } catch {
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
    apiFn: fetchMemberList,
    apiParams: searchParams,
    paginationKey: {
      current: 'page',
      size: 'limit'
    },
    columnsFactory: () => [
      { prop: 'id', label: 'ID', sortable: true, align: 'center' },
      {
        prop: 'groupname',
        label: '会员组',
        width: 100,
        align: 'center',
        formatter: (row: Member) => h(ElTag, { type: 'info' }, () => row.groupname)
      },
      {
        prop: 'username',
        label: '用户名',
        width: 120,
        align: 'center',
        formatter: (row: Member) =>
          h(
            'span',
            {
              class: 'text-primary cursor-pointer hover:underline',
              onClick: () => openDialog('edit', row)
            },
            row.username
          )
      },
      { prop: 'userbankname', label: '姓名', width: 100, align: 'center' },
      { prop: 'parent_username', label: '上线', width: 100, align: 'center' },
      {
        prop: 'proxy_text',
        label: '类型',
        width: 80,
        align: 'center',
        formatter: (row: Member) => h(ElTag, { type: 'info' }, () => row.proxy_text)
      },
      {
        prop: 'balance',
        label: '金额',
        width: 120,
        align: 'center',
        formatter: (row: Member) =>
          h(
            'span',
            {
              class: 'text-primary cursor-pointer hover:underline',
              onClick: () => handleEditBalance(row)
            },
            Number(row.balance || 0).toFixed(3)
          )
      },
      { prop: 'yebmoney', label: '余额宝', width: 100, align: 'center' },
      {
        prop: 'xima',
        label: '洗码余额',
        width: 120,
        align: 'center',
        formatter: (row: Member) =>
          h(
            'span',
            {
              class: 'text-primary cursor-pointer hover:underline',
              onClick: () => handleEditXima(row)
            },
            Number(row.xima || 0).toFixed(3)
          )
      },
      { prop: 'logintime_text', label: '登陆时间', width: 160, align: 'center' },
      { prop: 'loginsource', label: '登陆来源', width: 100, align: 'center' },
      {
        prop: 'isonline_text',
        label: '状态',
        width: 80,
        align: 'center',
        formatter: (row: Member) =>
          h(
            ElTag,
            { type: row.isonline_text === '在线' ? 'success' : 'info' },
            () => row.isonline_text
          )
      },
      {
        prop: 'islock',
        label: '封禁',
        width: 80,
        align: 'center',
        formatter: (row: Member) =>
          h(ElSwitch, {
            modelValue: row.islock === 1,
            inlinePrompt: true,
            onChange: (val: any) => handleLockChange(row, !val)
          })
      },
      {
        prop: 'info',
        label: '资料',
        minWidth: 360,
        fixed: 'right',
        align: 'center',
        formatter: (row: Member) =>
          h('div', { class: 'flex justify-center gap-2' }, [
            h(ElButton, { size: 'small', onClick: () => handleInfo(row) }, () => '资料'),
            h(ElButton, { size: 'small', onClick: () => handleDevices(row) }, () => '设备'),
            h(ElButton, { size: 'small', onClick: () => handleBalanceLog(row) }, () => '帐变'),
            h(ElButton, { size: 'small', onClick: () => handleChildren(row) }, () => '下级'),
            h(ElButton, { size: 'small', onClick: () => handleWithdrawAccount(row) }, () => '提现账户')
          ])
      },
      {
        prop: 'action',
        label: '操作',
        width: 240,
        fixed: 'right',
        align: 'center',
        formatter: (row: Member) =>
          h('div', { class: 'flex justify-center gap-2 flex-wrap' }, [
            h(ElButton, { class: 'btn-edit', size: 'small', onClick: () => openDialog('edit', row) }, () => '编辑'),
            h(ElButton, { class: 'btn-delete', size: 'small', onClick: () => handleDelete(row) }, () => '删'),
            h(ElButton, { class: 'btn-kick', size: 'small', onClick: () => handleKick(row) }, () => '踢'),
            h(ElButton, { type: 'warning', size: 'small', onClick: () => handleGameBalance(row) }, () => '游戏余额')
          ])
      }
    ]
  }
})

onMounted(() => {
  loadGroups()
})

const resetSearch = () => {
    Object.assign(searchParams, {
        ordertype: 0,
        groupid: 0,
        proxy: 999,
        isnb: 999,
        username: '',
        userbankname: '',
        nickname: '',
        loginip: '',
        isonline: 0,
        sDate: '',
        eDate: '',
        sAmount: '',
        eAmount: ''
    })
    refreshData()
}

const openDialog = (type: 'add' | 'edit', row?: Member) => {
  dialogType.value = type
  currentMember.value = row ? { ...row } : {}
  dialogVisible.value = true
}

const handleEditBalance = (row: Member) => {
  currentMember.value = row
  adjustType.value = 'balance'
  adjustCurrentValue.value = Number(row.balance || 0)
  adjustDialogVisible.value = true
}

const handleEditXima = (row: Member) => {
  currentMember.value = row
  adjustType.value = 'xima'
  adjustCurrentValue.value = Number(row.xima || 0)
  adjustDialogVisible.value = true
}

const handleInfo = (row: Member) => {
  currentMember.value = row
  infoDialogVisible.value = true
}

const handleDevices = (row: Member) => {
  currentMember.value = row
  devicesDialogVisible.value = true
}

const handleBalanceLog = (row: Member) => {
  currentMember.value = row
  logDialogVisible.value = true
}

const handleChildren = (row: Member) => {
  currentMember.value = row
  childrenDialogVisible.value = true
}

const handleWithdrawAccount = (row: Member) => {
  currentMember.value = row
  withdrawAccountDialogVisible.value = true
}

const handleGameBalance = async (row: Member) => {
  currentMember.value = row
  gameBalanceDialogVisible.value = true
  gameBalanceLoading.value = true
  gameBalanceList.value = []
  gameBalanceTotal.value = '0.00'
  try {
    const res = await request.get<any>({
      url: '/app/admin/api/game/user-game-balance',
      params: { uid: row.id },
      returnFullResponse: true
    })
    gameBalanceList.value = res.data?.list || []
    gameBalanceTotal.value = res.data?.total || '0.00'
  } catch (e) {
    console.error(e)
  } finally {
    gameBalanceLoading.value = false
  }
}

const handleRecallAll = async () => {
  if (!currentMember.value.id) return
  recallLoading.value = true
  try {
    await request.post({
      url: '/app/admin/api/game/transfer-recall-all',
      data: { uid: currentMember.value.id },
      showSuccessMessage: true
    })
    handleGameBalance(currentMember.value as Member)
    refreshData()
  } catch (e) {
    console.error(e)
  } finally {
    recallLoading.value = false
  }
}

const handleDelete = (row: Member) => {
  ElMessageBox.confirm(`确认删除会员【${row.username}】吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteMember(row.id)
      ElMessage.success('已删除!')
      refreshData()
    } catch (e) {}
  })
}

const handleKick = (row: Member) => {
  ElMessageBox.confirm(`确认踢出会员【${row.username}】吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await kickMember(row.id)
      ElMessage.success('已踢出!')
    } catch (e) {}
  })
}

const handleLockChange = async (row: Member, val: boolean) => {
    const newLockState = val ? 0 : 1
    try {
        await lockMember(row.id, newLockState)
        row.islock = newLockState
        ElMessage.success(val ? '已解锁' : '已锁定')
    } catch {
        refreshData()
    }
}

</script>

<style scoped>
.search-form-container {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}
.search-form .el-form-item {
  margin-bottom: 12px;
  margin-right: 12px;
}

/* Custom Button Styles - 使用主题变量 */
:deep(.btn-edit) {
  background-color: var(--art-success) !important;
  border-color: var(--art-success) !important;
  color: #fff !important;
}
:deep(.btn-edit:hover) {
  background-color: var(--el-color-success-dark-2) !important;
  border-color: var(--el-color-success-dark-2) !important;
}

:deep(.btn-delete) {
  background-color: var(--art-error) !important;
  border-color: var(--art-error) !important;
  color: #fff !important;
}
:deep(.btn-delete:hover) {
  background-color: var(--el-color-error-dark-2) !important;
  border-color: var(--el-color-error-dark-2) !important;
}

:deep(.btn-kick) {
  background-color: var(--art-warning) !important;
  border-color: var(--art-warning) !important;
  color: #fff !important;
}
:deep(.btn-kick:hover) {
  background-color: var(--el-color-warning-dark-2) !important;
  border-color: var(--el-color-warning-dark-2) !important;
}
</style>
