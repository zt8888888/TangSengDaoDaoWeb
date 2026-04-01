<template>
  <ElDialog
    v-model="dialogVisible"
    :title="type === 'deposit' ? '人工存入' : '人工取出'"
    width="500px"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="用户名" prop="username">
        <ElInput 
          v-model="formData.username" 
          placeholder="请输入用户名" 
          @blur="handleUserCheck" 
        />
      </ElFormItem>
      
      <ElFormItem v-if="userInfo" label="当前余额">
        <div class="text-sm text-gray-600">
          <p>活期余额: {{ userInfo.current_amount || 0 }}</p>
          <p>定期余额: {{ userInfo.fixed_amount || 0 }}</p>
          <p>余额宝总额: {{ userInfo.total_amount || 0 }}</p>
        </div>
      </ElFormItem>

      <template v-if="type === 'deposit'">
        <ElFormItem label="产品" prop="product_id">
          <ElSelect v-model="formData.product_id" placeholder="请选择存入产品" style="width: 100%">
            <ElOption
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>
        </ElFormItem>
      </template>

      <template v-else>
        <ElFormItem label="取出类型" prop="withdrawType">
          <ElSelect v-model="formData.withdrawType" placeholder="请选择类型" style="width: 100%">
            <ElOption label="随存随取 (活期)" value="current" />
            
          </ElSelect>
        </ElFormItem>
      </template>

      <ElFormItem label="金额" prop="amount">
        <ElInputNumber 
          v-model="formData.amount" 
          :min="0" 
          :precision="2" 
          style="width: 100%" 
          placeholder="请输入金额"
        />
      </ElFormItem>

      <ElFormItem label="备注" prop="remark">
        <ElInput v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { adminDeposit, adminWithdraw, fetchUserInfo, fetchProductOptions } from '@/api/yebao'

const props = defineProps<{
  visible: boolean
  type: 'deposit' | 'withdraw'
}>()

const emit = defineEmits(['update:visible', 'submit'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const userInfo = ref<any>(null)
const productOptions = ref<any[]>([])

const formData = ref({
  username: '',
  product_id: undefined as number | undefined,
  amount: 0,
  withdrawType: 'current',
  remark: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  product_id: [{ required: true, message: '请选择产品', trigger: 'change' }],
  withdrawType: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const fetchProducts = async () => {
  try {
    const res = await fetchProductOptions()
    productOptions.value = res || []
  } catch (error) {
    console.error(error)
  }
}

const handleUserCheck = async () => {
  if (!formData.value.username) return
  try {
    const res = await fetchUserInfo(formData.value.username)
    userInfo.value = res
  } catch (error) {

    userInfo.value = null
  }
}


watch(() => props.type, (val) => {
  if (val === 'deposit') {
    fetchProducts()
  }
}, { immediate: true })

watch(() => props.visible, (val) => {
  if (val) {
    formData.value = {
      username: '',
      product_id: undefined,
      amount: 0,
      withdrawType: 'current',
      remark: ''
    }
    userInfo.value = null
    if (props.type === 'deposit') {
      fetchProducts()
    }
  }
})

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (props.type === 'deposit') {
          await adminDeposit({
            username: formData.value.username,
            product_id: formData.value.product_id!,
            amount: formData.value.amount,
            remark: formData.value.remark
          })
        } else {
          await adminWithdraw({
            username: formData.value.username,
            amount: formData.value.amount,
            type: formData.value.withdrawType,
            remark: formData.value.remark
          })
        }
        ElMessage.success('操作成功')
        emit('submit')
        handleClose()
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
