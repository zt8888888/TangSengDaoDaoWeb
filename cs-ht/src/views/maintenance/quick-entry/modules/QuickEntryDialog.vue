<template>
  <ElDialog
    v-model="visible"
    :title="type === 'add' ? '添加入口' : '编辑入口'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="form.name" placeholder="中文名称" />
      </ElFormItem>
      <ElFormItem label="英文">
        <ElInput v-model="form.name_en" placeholder="English" />
      </ElFormItem>
      <ElFormItem label="越南语">
        <ElInput v-model="form.name_vi" placeholder="Tiếng Việt" />
      </ElFormItem>
      <ElFormItem label="泰语">
        <ElInput v-model="form.name_th" placeholder="ภาษาไทย" />
      </ElFormItem>
      <ElFormItem label="马来语">
        <ElInput v-model="form.name_ms" placeholder="Bahasa Melayu" />
      </ElFormItem>
      <ElFormItem label="图标">
        <div class="icon-upload-area">
          <div class="icon-preview" v-if="form.icon">
            <img :src="form.icon" />
            <div class="icon-actions">
              <el-button type="danger" size="small" circle @click="form.icon = ''">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
          <el-upload
            v-else
            class="icon-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
            accept="image/*"
          >
            <div class="upload-trigger">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <span>上传</span>
            </div>
          </el-upload>
          <ElInput v-model="form.icon" placeholder="或输入图标URL" style="margin-top: 8px;" />
        </div>
      </ElFormItem>
      <ElFormItem label="链接类型" prop="link_type">
        <ElRadioGroup v-model="form.link_type">
          <ElRadio :value="1">内部页面</ElRadio>
          <ElRadio :value="2">外部链接</ElRadio>
          <ElRadio :value="3">客服</ElRadio>
          <ElRadio :value="4">更多弹窗</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="链接地址" v-if="form.link_type === 1 || form.link_type === 2">
        <ElInput v-model="form.link" :placeholder="form.link_type === 1 ? '如 /vip' : '如 https://...'" />
      </ElFormItem>
      <ElFormItem label="排序">
        <ElInputNumber v-model="form.sort" :min="0" :max="9999" />
      </ElFormItem>
      <ElFormItem label="状态">
        <ElSwitch v-model="form.status" :active-value="1" :inactive-value="0" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit" :loading="submitting">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { createQuickEntry, updateQuickEntry, QuickEntry } from '@/api/maintenance-quick-entry'
import { uploadImage } from '@/api/common'

const props = defineProps<{
  modelValue: boolean
  type: 'add' | 'edit'
  data?: QuickEntry
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  id: 0,
  name: '',
  name_en: '',
  name_vi: '',
  name_th: '',
  name_ms: '',
  icon: '',
  link_type: 1,
  link: '',
  sort: 0,
  status: 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  link_type: [{ required: true, message: '请选择链接类型', trigger: 'change' }]
}

watch(() => props.modelValue, (val) => {
  if (val && props.type === 'edit' && props.data) {
    Object.assign(form, props.data)
  } else if (val && props.type === 'add') {
    resetForm()
  }
})

const resetForm = () => {
  form.id = 0
  form.name = ''
  form.name_en = ''
  form.name_vi = ''
  form.name_th = ''
  form.name_ms = ''
  form.icon = ''
  form.link_type = 1
  form.link = ''
  form.sort = 0
  form.status = 1
}

const handleClose = () => {
  formRef.value?.resetFields()
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片不能超过2MB')
    return false
  }
  return true
}

const handleUpload = async (options: UploadRequestOptions) => {
  try {
    const res = await uploadImage(options.file as File)
    if (res.url) {
      form.icon = res.url
      ElMessage.success('上传成功')
    }
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (props.type === 'add') {
        await createQuickEntry(form)
      } else {
        await updateQuickEntry(form)
      }
      visible.value = false
      emit('submit')
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style scoped>
.icon-upload-area {
  width: 100%;
}

.icon-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

.icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.icon-preview .icon-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.icon-preview:hover .icon-actions {
  opacity: 1;
}

.icon-uploader {
  width: 80px;
  height: 80px;
}

.icon-uploader :deep(.el-upload) {
  width: 100%;
  height: 100%;
}

.upload-trigger {
  width: 80px;
  height: 80px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.upload-trigger:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 24px;
  color: #8c939d;
}

.upload-trigger span {
  font-size: 12px;
  color: #8c939d;
  margin-top: 4px;
}
</style>

