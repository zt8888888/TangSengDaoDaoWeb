
<template>
  <div class="yeb-config-page art-full-height">
    <ElCard class="config-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>利息宝规则配置</span>
          <ElButton type="primary" :loading="saving" @click="handleSave">
            <template #icon>
              <ArtSvgIcon icon="ri:save-line" />
            </template>
            保存配置
          </ElButton>
        </div>
      </template>

      <ElForm
        ref="formRef"
        :model="configForm"
        :rules="rules"
        label-width="120px"
        v-loading="loading"
      >
        <ElRow :gutter="20">
          <ElCol :span="12">
            <ElFormItem label="结算周期" prop="settle_cycle">
              <ElInput v-model="configForm.settle_cycle" placeholder="例如：1小时">
                <template #append>
                  <ElInputNumber
                    v-model="configForm.settle_cycle_hours"
                    :min="1"
                    :max="24"
                    controls-position="right"
                    style="width: 100px"
                  />
                  小时
                </template>
              </ElInput>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="年利率" prop="annual_rate">
              <ElInput v-model="configForm.annual_rate" placeholder="例如：4%">
                <template #append>
                  <ElInputNumber
                    v-model="configForm.annual_rate_value"
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :precision="4"
                    controls-position="right"
                    style="width: 120px"
                  />
                  (小数)
                </template>
              </ElInput>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="最低转入金额" prop="min_amount">
              <ElInputNumber
                v-model="configForm.min_amount"
                :min="1"
                :max="100000"
                controls-position="right"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="利息封顶" prop="max_interest">
              <ElInput v-model="configForm.max_interest" placeholder="例如：不限制 或 1000" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="领取时间" prop="claim_time">
              <ElSelect v-model="configForm.claim_time" style="width: 100%">
                <ElOption label="实时领取" value="实时领取" />
                <ElOption label="隔天领取" value="隔天领取" />
                <ElOption label="每周领取" value="每周领取" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="稽核倍数" prop="audit_multiple">
              <ElInputNumber
                v-model="configForm.audit_multiple"
                :min="0"
                :max="100"
                controls-position="right"
                style="width: 100%"
              />
              <div class="form-tip">投注流水要求倍数，0表示无需流水</div>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="收益发放方式" prop="auto_claim">
              <ElRadioGroup v-model="configForm.auto_claim">
                <ElRadio :label="0">手动领取</ElRadio>
                <ElRadio :label="1">自动发放</ElRadio>
              </ElRadioGroup>
              <div class="form-tip">手动领取：收益累计到待领取，用户点击领取；自动发放：直接转入余额</div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElCard>

    
    <ElCard class="preview-card" shadow="never">
      <template #header>
        <span>前端显示预览</span>
      </template>
      <div class="rules-preview">
        <div class="rule-item">
          <span class="label">1、收益介绍：</span>
          <span>存入利息宝金额，至少满足一个完整周期才能产生利息，若中途提前转出则该周期不计算收益。</span>
        </div>
        <div class="rule-item">
          <span class="label">2、结算周期：</span>
          <span>当前利息的结算周期为<b>{{ configForm.settle_cycle }}</b>；</span>
        </div>
        <div class="rule-item">
          <span class="label">3、年利率：</span>
          <span>当前年利率为<b>{{ configForm.annual_rate }}</b>；</span>
        </div>
        <div class="rule-item">
          <span class="label">4、转入门槛：</span>
          <span>每次转入金额必须≥<b>{{ configForm.min_amount }}</b>；</span>
        </div>
        <div class="rule-item">
          <span class="label">5、利息封顶：</span>
          <span>当前利息封顶为<b>{{ configForm.max_interest }}</b>；</span>
        </div>
        <div class="rule-item">
          <span class="label">6、领取时间：</span>
          <span>当前为<b>{{ configForm.claim_time }}</b>；</span>
        </div>
        <div class="rule-item">
          <span class="label">7、稽核倍数：</span>
          <span>当前稽核倍数为<b>{{ configForm.audit_multiple }}倍</b>（投注流水要求）；</span>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { fetchConfig, saveConfig, type YebConfig } from '@/api/yebao'

defineOptions({ name: 'YebConfig' })

const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)

const configForm = reactive<YebConfig>({
  settle_cycle: '1小时',
  settle_cycle_hours: 1,
  annual_rate: '4%',
  annual_rate_value: 0.04,
  min_amount: 20,
  max_interest: '不限制',
  claim_time: '隔天领取',
  audit_multiple: 1,
  auto_claim: 0
})

const rules: FormRules = {
  settle_cycle: [{ required: true, message: '请输入结算周期', trigger: 'blur' }],
  annual_rate: [{ required: true, message: '请输入年利率', trigger: 'blur' }],
  min_amount: [{ required: true, message: '请输入最低转入金额', trigger: 'blur' }],
  max_interest: [{ required: true, message: '请输入利息封顶', trigger: 'blur' }],
  claim_time: [{ required: true, message: '请选择领取时间', trigger: 'change' }],
  audit_multiple: [{ required: true, message: '请输入稽核倍数', trigger: 'blur' }]
}

const loadConfig = async () => {
  loading.value = true
  try {
    const res = await fetchConfig()
    if (res && res.data) {
      Object.assign(configForm, res.data)
    }
  } catch (error) {
    console.error('加载配置失败', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    await saveConfig(configForm)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="scss">
.yeb-config-page {
  padding: 20px;
}

.config-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}

.preview-card {
  .rules-preview {
    .rule-item {
      padding: 8px 0;
      border-bottom: 1px dashed #eee;
      font-size: 14px;
      color: #666;

      &:last-child {
        border-bottom: none;
      }

      .label {
        color: #333;
        font-weight: 500;
      }

      b {
        color: #409eff;
      }
    }
  }
}
</style>
