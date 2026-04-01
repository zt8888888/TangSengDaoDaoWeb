<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加会员组' : '编辑会员组'"
    width="500px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <ElFormItem label="组名称" prop="groupname">
        <ElInput v-model="formData.groupname" placeholder="请输入组名称" />
      </ElFormItem>
      <ElFormItem label="头衔" prop="touhan">
        <ElInput v-model="formData.touhan" placeholder="请输入头衔" />
      </ElFormItem>
      <ElFormItem label="晋级打码" prop="shengjiedu">
        <ElInput v-model="formData.shengjiedu" type="number" placeholder="升级需要的打码量">
          <template #append>元</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="晋级奖金" prop="jjje">
        <ElInput v-model="formData.jjje" type="number" placeholder="升级可获得的奖金">
          <template #append>元</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="免手续费提现" prop="free_withdraw_times">
        <ElInput v-model="formData.free_withdraw_times" type="number" placeholder="每日免手续费提现次数">
          <template #append>次/日</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="周打码要求" prop="weekly_betting">
        <ElInput v-model="formData.weekly_betting" type="number" placeholder="每周打码要求">
          <template #append>元</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="周俘奖金" prop="weekly_bonus">
        <ElInput v-model="formData.weekly_bonus" type="number" placeholder="周俘奖金">
          <template #append>元</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="月打码要求" prop="monthly_betting">
        <ElInput v-model="formData.monthly_betting" type="number" placeholder="每月打码要求">
          <template #append>元</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="月俘奖金" prop="monthly_bonus">
        <ElInput v-model="formData.monthly_bonus" type="number" placeholder="月俘奖金">
          <template #append>元</template>
        </ElInput>
      </ElFormItem>
      <ElFormItem label="反水设置" prop="fanshui">
        <ElInput v-model="formData.fanshui" placeholder="请输入反水设置" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { MemberGroup, createMemberGroup, updateMemberGroup } from '@/api/member'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    data?: Partial<MemberGroup>
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

  const dialogType = computed(() => props.type)


  const formRef = ref<FormInstance>()


  const formData = reactive<Partial<MemberGroup>>({
    groupname: '',
    touhan: '',
    shengjiedu: '',
    jjje: '',
    free_withdraw_times: '',
    weekly_betting: '',
    weekly_bonus: '',
    monthly_betting: '',
    monthly_bonus: '',
    fanshui: ''
  })


  const rules: FormRules = {
    groupname: [
      { required: true, message: '请输入组名称', trigger: 'blur' }
    ]
  }



  const initFormData = () => {
    if (props.type === 'edit' && props.data) {
      Object.assign(formData, props.data)
    } else {
      Object.assign(formData, {
        groupname: '',
        touhan: '',
        shengjiedu: '',
        jjje: '',
        free_withdraw_times: '',
        weekly_betting: '',
        weekly_bonus: '',
        monthly_betting: '',
        monthly_bonus: '',
        fanshui: ''
      })
    }
  }



  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    }
  )



  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (dialogType.value === 'add') {
            await createMemberGroup(formData)
            ElMessage.success('添加成功')
          } else {

             if (props.data?.groupid) {
                await updateMemberGroup({ ...formData, groupid: props.data.groupid })
                ElMessage.success('修改成功')
             }
          }
          dialogVisible.value = false
          emit('submit')
        } catch (error) {
          console.error(error)
        }
      }
    })
  }
</script>
