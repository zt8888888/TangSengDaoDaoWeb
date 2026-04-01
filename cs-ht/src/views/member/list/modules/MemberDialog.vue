<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="600px"
    @closed="handleClosed"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <ElFormItem label="会员组" prop="groupid">
        <ElSelect v-model="form.groupid" placeholder="请选择会员组">
          <ElOption
            v-for="item in groupList"
            :key="item.groupid"
            :label="item.groupname"
            :value="item.groupid"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="form.username" :disabled="type === 'edit'" />
      </ElFormItem>
      <ElFormItem label="密码" prop="password" v-if="type === 'add'">
        <ElInput v-model="form.password" type="password" show-password />
      </ElFormItem>
       <ElFormItem label="密码" prop="password" v-else>
        <ElInput v-model="form.password" type="password" placeholder="不修改请留空" show-password />
      </ElFormItem>
      <ElFormItem label="姓名" prop="userbankname">
        <ElInput v-model="form.userbankname" />
      </ElFormItem>
      <ElFormItem label="昵称" prop="nickname">
        <ElInput v-model="form.nickname" />
      </ElFormItem>
      <ElFormItem label="类型" prop="proxy">
        <ElRadioGroup v-model="form.proxy">
          <ElRadio :label="0">会员</ElRadio>
          <ElRadio :label="1">代理</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="资金密码" prop="fundPassword" v-if="type === 'edit'">
        <ElInput v-model="form.fundPassword" type="password" placeholder="不修改请留空，清空则删除资金密码" show-password />
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
import { ref, computed, watch, nextTick } from 'vue'
import { Member, MemberGroup } from '@/api/member'
import { createMember, updateMember, resetFundPassword } from '@/api/member'


const props = defineProps<{
  modelValue: boolean
  type: 'add' | 'edit'
  data?: Partial<Member>
  groupList: MemberGroup[]
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const title = computed(() => (props.type === 'add' ? '添加会员' : '编辑会员'))

const formRef = ref()
const loading = ref(false)
const form = ref<any>({
  groupid: undefined,
  username: '',
  password: '',
  userbankname: '',
  nickname: '',
  proxy: 0,
  fundPassword: ''
})

const rules = computed(() => ({
  groupid: [{ required: true, message: '请选择会员组', trigger: 'change' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: props.type === 'add', message: '请输入密码', trigger: 'blur' }]
}))

watch(
  () => props.data,
  (val) => {
    if (val && props.type === 'edit') {
      form.value = { ...val, password: '', fundPassword: '' }
    } else {
      form.value = {
        groupid: undefined,
        username: '',
        password: '',
        userbankname: '',
        nickname: '',
        proxy: 0,
        fundPassword: ''
      }
    }
  },
  { immediate: true }
)

const handleClosed = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const formData = { ...form.value }
        if (props.type === 'add') {
          await createMember(formData)
          emit('submit')
        } else {

          if (formData.fundPassword !== undefined && formData.fundPassword !== '') {
            await resetFundPassword({ id: formData.id, password: formData.fundPassword })
          }

          const { fundPassword, ...editData } = formData
          await updateMember(editData)
          emit('submit')
        }
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
