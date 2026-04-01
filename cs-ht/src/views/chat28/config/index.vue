<template>
  <div class="chat28-config-page art-full-height">
    
    <ElRow :gutter="16" class="stats-row">
      <ElCol :span="6">
        <ElCard shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ stats.robot_count }}</div>
              <div class="stat-label">机器人数量</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ stats.today_messages }}</div>
              <div class="stat-label">今日消息</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">{{ stats.today_bets }}</div>
              <div class="stat-label">今日投注</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.today_amount }}</div>
              <div class="stat-label">今日金额</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    
    <ElCard class="bot-config-card" shadow="never" style="margin-bottom: 16px;">
      <template #header>
        <div class="card-header">
          <span>账单/开奖推送机器人配置</span>
        </div>
      </template>
      <ElForm :model="botConfig" label-width="140px" v-loading="botConfigLoading">
        <ElRow :gutter="24">
          <ElCol :span="12">
            <ElFormItem label="机器人名称">
              <ElInput v-model="botConfig.robot_name" placeholder="如：金海岸" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="机器人头像">
              <ElInput v-model="botConfig.robot_avatar" placeholder="头像URL地址">
                <template #append>
                  <ElButton @click="previewAvatar" :disabled="!botConfig.robot_avatar">预览</ElButton>
                </template>
              </ElInput>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="24">
          <ElCol :span="6">
            <ElFormItem label="账单推送">
              <ElSwitch v-model="botConfig.bill_enabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="开奖推送">
              <ElSwitch v-model="botConfig.result_enabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="封盘提示">
              <ElSwitch v-model="botConfig.sealed_notice_enabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="开奖前提示">
              <ElSwitch v-model="botConfig.draw_notice_enabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElDivider content-position="left">消息文字配置</ElDivider>
        <ElRow :gutter="24">
          <ElCol :span="12">
            <ElFormItem label="封盘前倒计时">
              <ElInput v-model="botConfig.msg_pre_sealed" placeholder="{seconds}会被替换为秒数" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="封盘线提示">
              <ElInput v-model="botConfig.msg_sealed_line" placeholder="{robot_name}会被替换为机器人名" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="24">
          <ElCol :span="12">
            <ElFormItem label="禁言提示">
              <ElInput v-model="botConfig.msg_no_talk" placeholder="封盘时的禁言提示" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="开奖前提示">
              <ElInput v-model="botConfig.msg_draw_coming" placeholder="{lottery_name}会被替换为彩种名" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem>
          <ElButton type="primary" @click="handleSaveBotConfig" :loading="savingBotConfig">
            <template #icon><ArtSvgIcon icon="ri:save-line" /></template>
            保存配置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      
      <div class="search-form-container" id="art-table-header">
        <ElForm inline class="search-form">
          <ElFormItem>
            <ElButton type="primary" @click="refreshData">
              <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
              刷新
            </ElButton>
          </ElFormItem>

          <div style="float: right">
            <ElButton type="primary" @click="openAddDialog">
              <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
              添加配置
            </ElButton>
          </div>
        </ElForm>
      </div>

      
      <ElTable :data="configList" v-loading="loading" stripe>
        <ElTableColumn prop="id" label="ID" width="80" align="center" />
        <ElTableColumn prop="name" label="配置名称" width="150" align="center" />
        <ElTableColumn prop="lottery_codes" label="参与彩种" min-width="150" align="center">
          <template #default="{ row }">
            <ElTag v-for="code in row.lottery_codes_arr" :key="code" size="small" style="margin: 2px">
              {{ code }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="下注金额" width="150" align="center">
          <template #default="{ row }">
            {{ row.min_bet_amount }} - {{ row.max_bet_amount }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="每期下注数" width="120" align="center">
          <template #default="{ row }">
            {{ row.bet_count_min }} - {{ row.bet_count_max }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="is_enabled" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElSwitch
              :model-value="row.is_enabled === 1"
              @change="handleToggle(row)"
              active-text="启用"
              inactive-text="禁用"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updated_at" label="更新时间" width="180" align="center" />
        <ElTableColumn label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <ElButton type="primary" size="small" @click="openEditDialog(row)">编辑</ElButton>
            <ElButton type="danger" size="small" @click="handleDelete(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑配置' : '添加配置'"
      width="600px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <ElFormItem label="配置名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入配置名称" />
        </ElFormItem>
        <ElFormItem label="参与彩种" prop="lottery_codes_arr">
          <ElSelect v-model="formData.lottery_codes_arr" multiple placeholder="请选择彩种" style="width: 100%">
            <ElOption
              v-for="item in lotteryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="最小下注金额" prop="min_bet_amount">
          <ElInputNumber v-model="formData.min_bet_amount" :min="1" :max="10000" />
        </ElFormItem>
        <ElFormItem label="最大下注金额" prop="max_bet_amount">
          <ElInputNumber v-model="formData.max_bet_amount" :min="1" :max="100000" />
        </ElFormItem>
        <ElFormItem label="最小下注间隔(秒)" prop="bet_interval_min">
          <ElInputNumber v-model="formData.bet_interval_min" :min="1" :max="300" />
        </ElFormItem>
        <ElFormItem label="最大下注间隔(秒)" prop="bet_interval_max">
          <ElInputNumber v-model="formData.bet_interval_max" :min="1" :max="600" />
        </ElFormItem>
        <ElFormItem label="每期最少下注" prop="bet_count_min">
          <ElInputNumber v-model="formData.bet_count_min" :min="0" :max="50" />
        </ElFormItem>
        <ElFormItem label="每期最多下注" prop="bet_count_max">
          <ElInputNumber v-model="formData.bet_count_max" :min="1" :max="100" />
        </ElFormItem>
        <ElFormItem label="启用状态">
          <ElSwitch v-model="formData.is_enabled" :active-value="1" :inactive-value="0" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import {
  fetchConfigList,
  createConfig,
  updateConfig,
  toggleConfig,
  deleteConfig,
  fetchStats,
  fetchLotteryOptions,
  fetchBotConfig,
  saveBotConfig,
  RobotConfig,
  Chat28Stats,
  LotteryOption,
  BotConfig
} from '@/api/chat28'

defineOptions({ name: 'Chat28Config' })

const stats = ref<Chat28Stats>({
  robot_count: 0,
  today_messages: 0,
  today_bets: 0,
  today_amount: 0,
  config_enabled: false
})

const configList = ref<RobotConfig[]>([])
const loading = ref(false)

const lotteryOptions = ref<LotteryOption[]>([])

const botConfig = reactive<BotConfig>({
  robot_name: '',
  robot_avatar: '',
  bill_enabled: 1,
  result_enabled: 1,
  sealed_notice_enabled: 1,
  draw_notice_enabled: 1,
  msg_pre_sealed: '',
  msg_sealed_line: '',
  msg_no_talk: '',
  msg_draw_coming: ''
})
const botConfigLoading = ref(false)
const savingBotConfig = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const defaultFormData = {
  id: 0,
  name: '',
  lottery_codes_arr: [] as string[],
  min_bet_amount: 10,
  max_bet_amount: 500,
  bet_interval_min: 30,
  bet_interval_max: 120,
  bet_count_min: 1,
  bet_count_max: 5,
  is_enabled: 0
}

const formData = reactive({ ...defaultFormData })

const rules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  lottery_codes_arr: [{ required: true, message: '请选择彩种', trigger: 'change' }]
}

const loadStats = async () => {
  try {
    const res = await fetchStats()
    if (res) {
      stats.value = res
    }
  } catch (e) {
    console.error(e)
  }
}

const refreshData = async () => {
  loading.value = true
  try {
    const res = await fetchConfigList()
    if (res && res.list) {
      configList.value = res.list
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadLotteryOptions = async () => {
  try {
    const res = await fetchLotteryOptions()
    if (res) {
      lotteryOptions.value = res
    }
  } catch (e) {
    console.error(e)
  }
}

const loadBotConfig = async () => {
  botConfigLoading.value = true
  try {
    const res = await fetchBotConfig()
    if (res) {
      Object.assign(botConfig, res)
    }
  } catch (e) {
    console.error(e)
  } finally {
    botConfigLoading.value = false
  }
}

const handleSaveBotConfig = async () => {
  savingBotConfig.value = true
  try {
    await saveBotConfig(botConfig)
  } catch (e) {
    console.error(e)
  } finally {
    savingBotConfig.value = false
  }
}

const previewAvatar = () => {
  if (botConfig.robot_avatar) {
    window.open(botConfig.robot_avatar, '_blank')
  }
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(formData, defaultFormData)
  dialogVisible.value = true
}

const openEditDialog = (row: RobotConfig) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    lottery_codes_arr: row.lottery_codes_arr || [],
    min_bet_amount: row.min_bet_amount,
    max_bet_amount: row.max_bet_amount,
    bet_interval_min: row.bet_interval_min,
    bet_interval_max: row.bet_interval_max,
    bet_count_min: row.bet_count_min,
    bet_count_max: row.bet_count_max,
    is_enabled: row.is_enabled
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const data = {
        ...formData,
        lottery_codes: formData.lottery_codes_arr
      }

      if (isEdit.value) {
        await updateConfig(data)
      } else {
        await createConfig(data)
      }

      dialogVisible.value = false
      refreshData()
      loadStats()
    } catch (e) {
      console.error(e)
    } finally {
      submitting.value = false
    }
  })
}

const handleToggle = async (row: RobotConfig) => {
  try {
    await toggleConfig(row.id)
    refreshData()
    loadStats()
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = (row: RobotConfig) => {
  ElMessageBox.confirm(`确定删除配置【${row.name}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteConfig(row.id)
      refreshData()
      loadStats()
    } catch (e) {
      console.error(e)
    }
  })
}

onMounted(() => {
  loadStats()
  refreshData()
  loadLotteryOptions()
  loadBotConfig()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 16px;
}

.bot-config-card .card-header {
  font-weight: 600;
  font-size: 15px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.search-form-container {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}
</style>


