<template>
  <div class="app-container">
    <el-card shadow="never">
      
      <div class="mb-4 grid grid-cols-4 gap-4">
        <div class="stat-card bg-blue-50 dark:bg-blue-900/20">
          <div class="stat-label">今日发放</div>
          <div class="stat-value text-blue-600">{{ stats.today_amount }} 元</div>
          <div class="stat-sub">{{ stats.today_count }} 次</div>
        </div>
        <div class="stat-card bg-green-50 dark:bg-green-900/20">
          <div class="stat-label">累计发放</div>
          <div class="stat-value text-green-600">{{ stats.total_amount }} 元</div>
        </div>
        <div class="stat-card bg-orange-50 dark:bg-orange-900/20">
          <div class="stat-label">待领取</div>
          <div class="stat-value text-orange-600">{{ stats.pending_amount }} 元</div>
        </div>
        <div class="stat-card bg-purple-50 dark:bg-purple-900/20">
          <div class="stat-label">等级数量</div>
          <div class="stat-value text-purple-600">{{ tableData.length }} 个</div>
        </div>
      </div>

      
      <div class="mb-4 flex justify-between">
        <el-button type="primary" @click="handleAdd">
          <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            添加等级
        </el-button>
        <el-button @click="fetchData">
          <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            刷新
        </el-button>
      </div>

      
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="level_id" label="等级ID" width="80" align="center" />
        <el-table-column prop="level_name" label="等级名称" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.level_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="required_points" label="所需积分" width="120" align="center">
          <template #default="{ row }">
            {{ Number(row.required_points).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="reward_amount" label="晋级奖励" width="120" align="center">
          <template #default="{ row }">
            <span class="text-orange-600 font-medium">{{ Number(row.reward_amount).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="daily_withdraw_limit" label="日提现限额" width="120" align="center">
          <template #default="{ row }">
            {{ Number(row.daily_withdraw_limit).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="rebate_rate" label="返水比例" width="100" align="center">
          <template #default="{ row }">
            {{ (Number(row.rebate_rate) * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" align="center" />
        <el-table-column prop="is_enabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_enabled === 1 ? 'success' : 'info'">
              {{ row.is_enabled === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加等级' : '编辑等级'" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="等级ID" prop="level_id">
              <el-input-number v-model="form.level_id" :min="1" :max="99" :disabled="dialogType === 'edit'" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="等级名称" prop="level_name">
              <el-input v-model="form.level_name" placeholder="如：VIP1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所需积分" prop="required_points">
              <el-input-number v-model="form.required_points" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="晋级奖励" prop="reward_amount">
              <el-input-number v-model="form.reward_amount" :min="0" :precision="2" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日提现限额" prop="daily_withdraw_limit">
              <el-input-number v-model="form.daily_withdraw_limit" :min="0" :precision="2" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="返水比例" prop="rebate_rate">
              <el-input-number v-model="form.rebate_rate" :min="0" :max="1" :step="0.001" :precision="4" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort_order">
              <el-input-number v-model="form.sort_order" :min="0" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="is_enabled">
              <el-radio-group v-model="form.is_enabled">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  fetchLevelConfigList,
  saveLevelConfig,
  deleteLevelConfig,
  fetchStats,
  type LevelConfig,
  type LevelRewardStats
} from '@/api/levelReward'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<LevelConfig[]>([])
const stats = ref<LevelRewardStats>({
  today_amount: '0.00',
  today_count: 0,
  total_amount: '0.00',
  pending_amount: '0.00'
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  level_id: 1,
  level_name: '',
  required_points: 0,
  reward_amount: 0,
  daily_withdraw_limit: 0,
  rebate_rate: 0,
  sort_order: 0,
  is_enabled: 1,
  remark: ''
})

const rules = {
  level_id: [{ required: true, message: '请输入等级ID', trigger: 'blur' }],
  level_name: [{ required: true, message: '请输入等级名称', trigger: 'blur' }],
  required_points: [{ required: true, message: '请输入所需积分', trigger: 'blur' }],
  reward_amount: [{ required: true, message: '请输入晋级奖励', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await fetchLevelConfigList()
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await fetchStats()
    if (res) {
      stats.value = res
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.id = 0
  form.level_id = tableData.value.length + 1
  form.level_name = `VIP${tableData.value.length + 1}`
  form.required_points = 0
  form.reward_amount = 0
  form.daily_withdraw_limit = 0
  form.rebate_rate = 0
  form.sort_order = tableData.value.length + 1
  form.is_enabled = 1
  form.remark = ''
  dialogVisible.value = true
}

const handleEdit = (row: LevelConfig) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.level_id = row.level_id
  form.level_name = row.level_name
  form.required_points = row.required_points
  form.reward_amount = row.reward_amount
  form.daily_withdraw_limit = row.daily_withdraw_limit
  form.rebate_rate = row.rebate_rate
  form.sort_order = row.sort_order
  form.is_enabled = row.is_enabled
  form.remark = row.remark || ''
  dialogVisible.value = true
}

const handleDelete = (row: LevelConfig) => {
  ElMessageBox.confirm(`确定要删除等级 "${row.level_name}" 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteLevelConfig(row.id)
    fetchData()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await saveLevelConfig(form)
        dialogVisible.value = false
        fetchData()
        loadStats()
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchData()
  loadStats()
})
</script>

<style scoped>
.stat-card {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}
.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
}
.stat-sub {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
