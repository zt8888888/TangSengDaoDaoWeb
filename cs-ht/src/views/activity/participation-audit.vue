<template>
  <div class="participation-audit">
    <el-card shadow="never">
      <template #header>
        <span>活动参与记录审核</span>
      </template>

      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="活动">
          <el-select v-model="searchForm.activity_id" placeholder="选择活动" clearable style="width: 200px">
            <el-option
              v-for="item in activityOptions"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已拒绝" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="输入用户名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      
      <div class="batch-actions" v-if="selectedIds.length > 0">
        <span>已选择 {{ selectedIds.length }} 条记录</span>
        <el-button type="success" size="small" @click="handleBatchAudit(1)">批量通过</el-button>
        <el-button type="danger" size="small" @click="handleBatchAudit(2)">批量拒绝</el-button>
      </div>

      
      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="activityTitle" label="活动名称" width="150" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="levelName" label="档位" width="150" />
        <el-table-column prop="conditionValue" label="条件值" width="150">
          <template #default="{ row }">
            {{ row.conditionValue || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="rewardAmount" label="奖励金额" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.applyTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP" width="120" />
        <el-table-column prop="auditAdmin" label="审核人" width="100">
          <template #default="{ row }">
            {{ row.auditAdmin || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="auditRemark" label="审核备注" min-width="150">
          <template #default="{ row }">
            {{ row.auditRemark || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button link type="success" size="small" @click="handleAudit(row, 1)">通过</el-button>
              <el-button link type="danger" size="small" @click="handleAudit(row, 2)">拒绝</el-button>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    
    <el-dialog
      v-model="auditDialogVisible"
      :title="auditStatus === 1 ? '审核通过' : '审核拒绝'"
      width="500px"
    >
      <el-form :model="auditForm" label-width="80px">
        <el-form-item label="备注">
          <el-input
            v-model="auditForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchParticipationList, auditParticipation } from '@/api/activity-reward'
import { fetchActivityList, type Activity } from '@/api/activity'
import dayjs from 'dayjs'

const loading = ref(false)
const submitting = ref(false)
const auditDialogVisible = ref(false)
const tableData = ref([])
const activityOptions = ref<Activity[]>([])
const selectedIds = ref<number[]>([])
const auditStatus = ref(1)
const currentAuditIds = ref<number[]>([])

const searchForm = reactive({
  activity_id: undefined,
  status: '',
  username: ''
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const auditForm = reactive({
  remark: ''
})

onMounted(() => {
  loadActivityOptions()
  loadData()
})

const loadActivityOptions = async () => {
  try {
    const res = await fetchActivityList({ limit: 100 })
    activityOptions.value = res.list
  } catch (error) {
    console.error('加载活动列表失败:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...searchForm
    }
    const res = await fetchParticipationList(params)
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.activity_id = undefined
  searchForm.status = ''
  searchForm.username = ''
  pagination.page = 1
  loadData()
}

const handleSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.filter(row => row.status === 0).map(row => row.id)
}

const handleAudit = (row: any, status: number) => {
  auditStatus.value = status
  currentAuditIds.value = [row.id]
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const handleBatchAudit = (status: number) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要审核的记录')
    return
  }

  auditStatus.value = status
  currentAuditIds.value = selectedIds.value
  auditForm.remark = ''
  auditDialogVisible.value = true
}

const submitAudit = async () => {
  submitting.value = true
  try {
    await auditParticipation({
      ids: currentAuditIds.value,
      status: auditStatus.value,
      remark: auditForm.remark
    })
    ElMessage.success('审核成功')
    auditDialogVisible.value = false
    selectedIds.value = []
    loadData()
  } catch (error) {
    ElMessage.error('审核失败')
  } finally {
    submitting.value = false
  }
}

const getStatusType = (status: number) => {
  const types: ('warning' | 'success' | 'danger' | 'info')[] = ['warning', 'success', 'danger']
  return types[status] || 'info'
}

const formatTime = (timestamp: number) => {
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped lang="scss">
.participation-audit {
  .search-form {
    margin-bottom: 20px;
  }

  .batch-actions {
    margin-bottom: 15px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;

    span {
      margin-right: 10px;
      color: #666;
    }
  }
}
</style>


