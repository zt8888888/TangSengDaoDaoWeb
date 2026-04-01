<template>
  <div class="data-clear-page art-full-height">
    <ElCard class="art-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>数据清理</span>
          <ElTag type="danger" effect="plain" class="ml-2">谨慎操作：数据清理后无法恢复</ElTag>
        </div>
      </template>

      <ElTable :data="clearItems" border style="width: 100%">
        <ElTableColumn prop="title" label="数据项目" width="200" align="center" />
        
        <ElTableColumn label="清理条件" align="left">
          <template #default="{ row }">
            <div class="condition-wrapper">
              
              <div v-if="row.type === ClearType.USER_INACTIVE" class="flex items-center">
                账户金额低于
                <ElInputNumber 
                  v-model="row.params.amount" 
                  :min="0" 
                  :max="100"
                  controls-position="right"
                  size="small"
                  class="mx-2 w-24"
                />
                元，且
                <ElInputNumber 
                  v-model="row.params.days" 
                  :min="30" 
                  controls-position="right"
                  size="small"
                  class="mx-2 w-24"
                />
                天未登录
              </div>

              
              <div v-else-if="row.type === ClearType.USER_REGISTER" class="flex items-center">
                注册
                <ElInputNumber 
                  v-model="row.params.days" 
                  :min="7" 
                  controls-position="right"
                  size="small"
                  class="mx-2 w-24"
                />
                天未登录
              </div>

              
              <div v-else-if="row.type === ClearType.USER_TEST" class="flex items-center">
                内部测试账户
                <ElCheckbox v-model="row.params.is_inner" :true-label="1" :false-label="0" class="ml-2">
                  全部
                </ElCheckbox>
              </div>

              
              <div v-else-if="row.type === ClearType.LOTTERY_RESULT" class="flex items-center">
                清理
                <ElInputNumber 
                  v-model="row.params.days" 
                  :min="1" 
                  controls-position="right"
                  size="small"
                  class="mx-2 w-24"
                />
                天前的开奖数据
              </div>

              
              <div v-else-if="row.type === ClearType.BET_RECORD" class="flex items-center">
                清理
                <ElInputNumber 
                  v-model="row.params.days" 
                  :min="30" 
                  controls-position="right"
                  size="small"
                  class="mx-2 w-24"
                />
                天前，类型为
                <ElSelect v-model="row.params.state" size="small" class="mx-2 w-32">
                  <ElOption label="全部" :value="999" />
                  <ElOption label="未开奖" :value="0" />
                  <ElOption label="撤单" :value="-2" />
                </ElSelect>
                的投注数据
              </div>

              
              <div v-else-if="row.type === ClearType.RECHARGE_RECORD" class="flex items-center">
                清理
                <ElInputNumber 
                  v-model="row.params.days" 
                  :min="30" 
                  controls-position="right"
                  size="small"
                  class="mx-2 w-24"
                />
                天前，类型为
                <ElSelect v-model="row.params.state" size="small" class="mx-2 w-32">
                  <ElOption label="全部" :value="999" />
                  <ElOption label="未审核" :value="0" />
                  <ElOption label="取消" :value="-1" />
                </ElSelect>
                的充值数据
              </div>

              
              <div v-else-if="row.type === ClearType.WITHDRAW_RECORD" class="flex items-center">
                清理
                <ElInputNumber 
                  v-model="row.params.days" 
                  :min="30" 
                  controls-position="right"
                  size="small"
                  class="mx-2 w-24"
                />
                天前，类型为
                <ElSelect v-model="row.params.state" size="small" class="mx-2 w-32">
                  <ElOption label="全部" :value="999" />
                  <ElOption label="未审核" :value="0" />
                  <ElOption label="退回/取消" :value="-1" />
                </ElSelect>
                的提款数据
              </div>

              
              <div v-else class="flex items-center">
                清理
                <ElInputNumber 
                  v-model="row.params.days" 
                  :min="7" 
                  controls-position="right"
                  size="small"
                  class="mx-2 w-24"
                />
                天前的数据
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="150" align="center">
          <template #default="{ row }">
            <ElButton type="danger" :loading="row.loading" @click="handleClear(row)">
              清理
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  ElCard,
  ElTable,
  ElTableColumn,
  ElButton,
  ElTag,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElCheckbox,
  ElMessageBox,
  ElMessage
} from 'element-plus'
import { ClearType, clearData, ClearParams } from '@/api/maintenance-clear'

defineOptions({ name: 'DataClear' })

interface ClearItem {
  type: ClearType
  title: string
  params: Partial<ClearParams>
  loading: boolean
}

const clearItems = ref<ClearItem[]>([
  {
    type: ClearType.USER_INACTIVE,
    title: '会员账号清理',
    params: { amount: 1, days: 60 },
    loading: false
  },
  {
    type: ClearType.USER_REGISTER,
    title: '未活跃账号清理',
    params: { days: 15 },
    loading: false
  },
  {
    type: ClearType.USER_TEST,
    title: '内部账号清理',
    params: { is_inner: 1 },
    loading: false
  },
  {
    type: ClearType.LOTTERY_RESULT,
    title: '开奖数据清理',
    params: { days: 2 },
    loading: false
  },
  {
    type: ClearType.BET_RECORD,
    title: '投注数据清理',
    params: { days: 60, state: 999 },
    loading: false
  },
  {
    type: ClearType.RECHARGE_RECORD,
    title: '充值数据清理',
    params: { days: 45, state: 999 },
    loading: false
  },
  {
    type: ClearType.WITHDRAW_RECORD,
    title: '提款数据清理',
    params: { days: 45, state: 999 },
    loading: false
  },
  {
    type: ClearType.BALANCE_LOG,
    title: '账变数据清理',
    params: { days: 45 },
    loading: false
  },
  {
    type: ClearType.MEMBER_LOG,
    title: '会员日志清理',
    params: { days: 7 },
    loading: false
  },
  {
    type: ClearType.ADMIN_LOG,
    title: '管理员日志清理',
    params: { days: 7 },
    loading: false
  }
])

const handleClear = (item: ClearItem) => {
  ElMessageBox.confirm(`确定要执行【${item.title}】吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定清理',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger'
  }).then(async () => {
    item.loading = true
    try {
      await clearData({
        type: item.type,
        ...item.params
      })
      ElMessage.success('清理任务已提交')
    } catch (e) {

    } finally {
      item.loading = false
    }
  }).catch(() => {})
}
</script>

<style scoped>
.condition-wrapper {
  font-size: 14px;
  color: var(--el-text-color-regular);
}
.ml-2 { margin-left: 0.5rem; }
.mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
.w-24 { width: 6rem; }
.w-32 { width: 8rem; }
</style>
