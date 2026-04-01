<template>
  <ElDialog
    v-model="dialogVisible"
    :title="'限额设置' + (groupName ? ' - ' + groupName : '')"
    width="600px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" label-width="120px">
      
      <ElFormItem label="单注最低" prop="min_bet">
        <ElInput v-model="formData.min_bet" placeholder="请输入单注最低限额" />
      </ElFormItem>
      <ElFormItem label="单注最高" prop="max_bet">
        <ElInput v-model="formData.max_bet" placeholder="请输入单注最高限额" />
      </ElFormItem>
      <ElFormItem label="单期最高" prop="max_issue">
        <ElInput v-model="formData.max_issue" placeholder="请输入单期最高限额" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">保存</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { saveMemberGroupLimit, getMemberGroupLimit } from '@/api/member'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    groupId?: number
    groupName?: string
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formData = reactive({
    min_bet: '',
    max_bet: '',
    max_issue: ''
  })


  watch(
    () => props.visible,
    async (visible) => {
      if (visible && props.groupId) {
        try {



           formData.min_bet = ''
           formData.max_bet = ''
           formData.max_issue = ''
        } catch (e) {
          console.error(e)
        }
      }
    }
  )

  const handleSubmit = async () => {
    try {
      await saveMemberGroupLimit({ ...formData, groupid: props.groupId })
      ElMessage.success('限额设置已保存')
      dialogVisible.value = false
      emit('submit')
    } catch (error) {
      console.error(error)
    }
  }
</script>
