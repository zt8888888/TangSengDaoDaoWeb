<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="1000px"
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
          label-width="80px"
        >
          <ElFormItem label="标题" prop="title">
            <ElInput 
              v-model="form[lang.code].title" 
              :placeholder="lang.code === 'zh-hans' ? '请输入公告标题' : `请输入${lang.name}标题（选填）`" 
            />
          </ElFormItem>
          <ElFormItem label="内容" prop="content">
            <WangEditor v-model="form[lang.code].content" style="height: 350px" />
          </ElFormItem>
        </ElForm>
      </ElTabPane>
    </ElTabs>
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
import { createNotice, updateNotice, Notice } from '@/api/maintenance-notice'
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
  data?: Notice
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const title = computed(() => (props.type === 'add' ? '添加公告' : '编辑公告'))
const formRefs = ref<Record<string, any>>({})
const loading = ref(false)
const activeLang = ref('zh-hans')

const setFormRef = (el: any, code: string) => {
  if (el) formRefs.value[code] = el
}

const createEmptyForm = () => {
  const result: Record<string, { title: string; content: string }> = {}
  languages.forEach(lang => {
    result[lang.code] = { title: '', content: '' }
  })
  return result
}

const form = reactive<Record<string, { title: string; content: string }>>({
  ...createEmptyForm(),
  id: 0 as any
})

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
}

watch(
  () => props.data,
  (val) => {
    if (val && props.type === 'edit') {
      (form as any).id = val.id
      form['zh-hans'].title = val.title || ''
      form['zh-hans'].content = val.content || ''
      languages.forEach(lang => {
        if (lang.suffix) {
          const titleKey = `title${lang.suffix}` as keyof Notice
          const contentKey = `content${lang.suffix}` as keyof Notice
          form[lang.code].title = (val as any)[titleKey] || ''
          form[lang.code].content = (val as any)[contentKey] || ''
        }
      })
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const resetForm = () => {
  (form as any).id = 0
  languages.forEach(lang => {
    form[lang.code] = { title: '', content: '' }
  })
}

const handleClosed = () => {
  Object.values(formRefs.value).forEach(ref => {
    if (ref?.resetFields) ref.resetFields()
  })
  resetForm()
  activeLang.value = 'zh-hans'
}

const handleSubmit = async () => {
  const mainFormRef = formRefs.value['zh-hans']
  if (!mainFormRef) return
  
  await mainFormRef.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const submitData: any = {
          title: form['zh-hans'].title,
          content: form['zh-hans'].content
        }
        
        languages.forEach(lang => {
          if (lang.suffix) {
            submitData[`title${lang.suffix}`] = form[lang.code].title || ''
            submitData[`content${lang.suffix}`] = form[lang.code].content || ''
          }
        })
        
        if (props.type === 'add') {
          await createNotice(submitData)
        } else {
          await updateNotice({ id: (form as any).id, ...submitData })
        }
        emit('submit')
        visible.value = false
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
