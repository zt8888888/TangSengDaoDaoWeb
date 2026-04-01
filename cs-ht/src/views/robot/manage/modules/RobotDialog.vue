<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="500px"
    @closed="handleClosed"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <ElFormItem label="会员组" prop="groupid">
        <ElSelect v-model="form.groupid" placeholder="请选择会员组" style="width: 100%">
          <ElOption
            v-for="item in groupList"
            :key="item.groupid"
            :label="item.groupname"
            :value="item.groupid"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="form.username" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="密码" prop="password">
        <ElInput v-model="form.password" type="password" show-password placeholder="请输入密码" />
      </ElFormItem>
      <ElFormItem label="昵称" prop="nickname">
        <ElInput v-model="form.nickname" placeholder="请输入昵称" />
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
import { createRobot } from '@/api/robot'
import { MemberGroup } from '@/api/member'

const props = defineProps<{
  modelValue: boolean
  groupList: MemberGroup[]
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const title = '添加机器人'
const formRef = ref()
const loading = ref(false)

const form = reactive({
  groupid: undefined,
  username: '',
  password: '',
  nickname: ''
})

const rules = {
  groupid: [{ required: true, message: '请选择会员组', trigger: 'change' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleClosed = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.groupid = undefined
  form.username = ''
  form.password = ''
  form.nickname = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        await createRobot({ ...form })
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
