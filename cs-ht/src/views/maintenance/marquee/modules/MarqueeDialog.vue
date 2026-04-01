<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="900px"
    :append-to-body="true"
    @closed="handleClosed"
  >
    <ElTabs v-model="activeLang" type="card">
      <ElTabPane 
        v-for="lang in languages" 
        :key="lang.code" 
        :label="lang.name" 
        :name="lang.code"
      >
        <ElForm
          :ref="(el: any) => setFormRef(el, lang.code)"
          :model="form[lang.code]"
          :rules="lang.code === 'zh-hans' ? rules : {}"
          label-width="100px"
        >
          <ElFormItem label="内容" prop="content">
            <WangEditor v-model="form[lang.code].content" height="250px" />
          </ElFormItem>
        </ElForm>
      </ElTabPane>
    </ElTabs>

    <ElForm
      ref="mainFormRef"
      :model="mainForm"
      label-width="100px"
      style="margin-top: 20px"
    >
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="mainForm.sort" :min="0" :max="9999" />
        <span style="margin-left: 10px; color: #999">数值越大越靠前</span>
      </ElFormItem>

      <ElFormItem label="状态" prop="status">
        <ElSwitch v-model="mainForm.status" :active-value="1" :inactive-value="0" />
      </ElFormItem>

      <ElFormItem label="生效时间">
        <ElDatePicker
          v-model="mainForm.start_time"
          type="datetime"
          placeholder="开始时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 200px"
        />
        <span style="margin: 0 10px">至</span>
        <ElDatePicker
          v-model="mainForm.end_time"
          type="datetime"
          placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 200px"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleSubmit">
        确定
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { createMarquee, updateMarquee, Marquee } from '@/api/maintenance-marquee'
import WangEditor from '@/components/core/forms/art-wang-editor/index.vue'

const languages = [
  { code: 'zh-hans', name: '简体中文', suffix: '' },
  { code: 'zh-hant', name: '繁体中文', suffix: '_zh_hant' },
  { code: 'en', name: '英语', suffix: '_en' },
  { code: 'ja', name: '日语', suffix: '_ja' },
  { code: 'ko', name: '韩语', suffix: '_ko' },
  { code: 'vi', name: '越南语', suffix: '_vi' },
  { code: 'th', name: '泰语', suffix: '_th' },
  { code: 'id', name: '印尼语', suffix: '_id' },
  { code: 'ms', name: '马来语', suffix: '_ms' },
  { code: 'hi', name: '印地语', suffix: '_hi' },
  { code: 'es', name: '西班牙语', suffix: '_es' },
  { code: 'pt', name: '葡萄牙语', suffix: '_pt' },
]

const props = defineProps<{
  modelValue: boolean
  type: 'add' | 'edit'
  data?: Marquee
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const title = computed(() => (props.type === 'add' ? '添加跑马灯' : '编辑跑马灯'))
const formRefs = ref<Record<string, any>>({})
const mainFormRef = ref<any>(null)
const loading = ref(false)
const activeLang = ref('zh-hans')

const setFormRef = (el: any, code: string) => {
  if (el) formRefs.value[code] = el
}

const createEmptyForm = () => {
  const result: Record<string, { content: string }> = {}
  languages.forEach(lang => {
    result[lang.code] = { content: '' }
  })
  return result
}

const form = reactive<Record<string, { content: string }>>({
  ...createEmptyForm(),
  id: 0 as any
})

const mainForm = reactive({
  sort: 0,
  status: 1,
  start_time: '',
  end_time: ''
})

const rules = {
  content: [{ required: true, message: '请输入跑马灯内容', trigger: 'blur' }]
}

watch(
  () => props.data,
  (val) => {
    if (val && props.type === 'edit') {
      (form as any).id = val.id
      form['zh-hans'].content = val.content || ''
      languages.forEach(lang => {
        if (lang.suffix) {
          const contentKey = `content${lang.suffix}` as keyof Marquee
          form[lang.code].content = (val as any)[contentKey] || ''
        }
      })
      mainForm.sort = val.sort || 0
      mainForm.status = val.status ?? 1
      mainForm.start_time = val.start_time || ''
      mainForm.end_time = val.end_time || ''
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const resetForm = () => {
  (form as any).id = 0
  languages.forEach(lang => {
    form[lang.code] = { content: '' }
  })
  mainForm.sort = 0
  mainForm.status = 1
  mainForm.start_time = ''
  mainForm.end_time = ''
}

const handleClosed = () => {
  Object.values(formRefs.value).forEach(ref => {
    if (ref?.resetFields) ref.resetFields()
  })
  mainFormRef.value?.resetFields()
  resetForm()
  activeLang.value = 'zh-hans'
}

const handleSubmit = async () => {
  const langFormRef = formRefs.value['zh-hans']
  if (!langFormRef) return
  
  try {
    await langFormRef.validate()
    await mainFormRef.value?.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const submitData: any = {
      content: form['zh-hans'].content,
      sort: mainForm.sort,
      status: mainForm.status,
      start_time: mainForm.start_time || '',
      end_time: mainForm.end_time || ''
    }
    
    languages.forEach(lang => {
      if (lang.suffix) {
        submitData[`content${lang.suffix}`] = form[lang.code].content || ''
      }
    })
    
    if (props.type === 'add') {
      await createMarquee(submitData)
    } else {
      await updateMarquee({ id: (form as any).id, ...submitData })
    }
    emit('submit')
    visible.value = false
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style>
.w-e-modal {
  z-index: 99999 !important;
}
.w-e-bar-item-menus-container {
  z-index: 99999 !important;
}
.w-e-drop-panel {
  z-index: 99999 !important;
}
.w-e-text-container [data-slate-editor] {
  min-height: 180px;
}
.w-e-modal .babel-container {
  max-height: 400px;
  overflow-y: auto;
}
</style>

