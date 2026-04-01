<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchSavePlay, fetchGetPlayDetail } from '@/api/lottery'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  playId: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const formRef = ref()

const form = reactive({
  id: 0,
  typeid: '',
  playid: '',
  title: '',
  rate: 0,
  maxprize: 0,
  totalzs: 0,
  minxf: 0,
  maxxf: 0,
  isopen: 1
})

const rules = {
  rate: [{ required: true, message: '请输入赔率', trigger: 'blur' }],
  minxf: [{ required: true, message: '请输入最小下注', trigger: 'blur' }],
  maxxf: [{ required: true, message: '请输入最大下注', trigger: 'blur' }]
}

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.playId) {
      loadData()
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

async function loadData() {
  loading.value = true
  try {
    const res = await fetchGetPlayDetail(props.playId)
    if (res) {
      Object.assign(form, res)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        await fetchSavePlay(form)
        ElMessage.success('保存成功')
        visible.value = false
        emit('success')
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="编辑玩法"
    width="550px"
    append-to-body
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="玩法ID">
        <el-input v-model="form.playid" disabled />
      </el-form-item>

      <el-form-item label="玩法名称">
        <el-input v-model="form.title" disabled />
      </el-form-item>

      <el-form-item label="赔率" prop="rate">
        <el-input-number v-model="form.rate" :precision="4" :step="0.01" :min="0" style="width: 100%" />
      </el-form-item>

      <el-form-item label="最高奖金" prop="maxprize">
        <el-input-number v-model="form.maxprize" :min="0" style="width: 100%" />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="最小下注" prop="minxf">
            <el-input-number v-model="form.minxf" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大下注" prop="maxxf">
            <el-input-number v-model="form.maxxf" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="总注数">
        <el-input-number v-model="form.totalzs" :min="0" disabled style="width: 100%" />
      </el-form-item>

      <el-form-item label="状态">
        <el-switch
          v-model="form.isopen"
          :active-value="1"
          :inactive-value="0"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>
