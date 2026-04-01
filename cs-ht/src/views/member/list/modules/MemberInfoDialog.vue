<template>
  <ElDialog
    v-model="visible"
    title="会员资料"
    width="600px"
  >
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="会员ID">{{ member.id }}</ElDescriptionsItem>
      <ElDescriptionsItem label="用户名">{{ member.username }}</ElDescriptionsItem>
      <ElDescriptionsItem label="真实姓名">{{ member.userbankname }}</ElDescriptionsItem>
      <ElDescriptionsItem label="会员组">{{ member.groupname }}</ElDescriptionsItem>
      <ElDescriptionsItem label="上级">{{ member.parent_username }}</ElDescriptionsItem>
      <ElDescriptionsItem label="类型">{{ member.proxy_text }}</ElDescriptionsItem>
      <ElDescriptionsItem label="余额">{{ Number(member.balance || 0).toFixed(3) }}</ElDescriptionsItem>
      <ElDescriptionsItem label="积分">{{ member.point }}</ElDescriptionsItem>
      <ElDescriptionsItem label="余额宝">{{ Number(member.yebmoney || 0).toFixed(3) }}</ElDescriptionsItem>
      <ElDescriptionsItem label="洗码余额">{{ Number(member.xima || 0).toFixed(3) }}</ElDescriptionsItem>
      <ElDescriptionsItem label="登录时间">{{ member.logintime_text }}</ElDescriptionsItem>
      <ElDescriptionsItem label="登录来源">{{ member.loginsource }}</ElDescriptionsItem>
      <ElDescriptionsItem label="在线状态">{{ member.isonline_text }}</ElDescriptionsItem>
      <ElDescriptionsItem label="账号状态">{{ member.islock === 1 ? '冻结' : '正常' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="手机">
        <template #default>
          <ElTag :type="security.phoneBind ? 'success' : 'info'">{{ security.phoneBind ? security.phone : '未绑定' }}</ElTag>
          <ElButton v-if="security.phoneBind" type="warning" link @click="onUnbindPhone">解除绑定</ElButton>
        </template>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="邮箱">
        <template #default>
          <ElTag :type="security.emailBind ? 'success' : 'info'">{{ security.emailBind ? security.email : '未绑定' }}</ElTag>
          <ElButton v-if="security.emailBind" type="warning" link @click="onUnbindEmail">解除绑定</ElButton>
        </template>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="Google验证器">
        <template #default>
          <ElTag :type="security.googleBind ? 'success' : 'info'">{{ security.googleBind ? '已绑定' : '未绑定' }}</ElTag>
          <ElButton v-if="security.googleBind" type="danger" link @click="onResetGoogle">重置</ElButton>
        </template>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="资金密码">
        <template #default>
          <ElTag :type="security.hasFundPwd ? 'success' : 'info'">{{ security.hasFundPwd ? '已设置' : '未设置' }}</ElTag>
          <ElButton type="warning" link @click="$emit('open-reset-fund-pwd', member)">重置</ElButton>
        </template>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="密保问题">
        <template #default>
          <ElTag :type="security.hasQuestion ? 'success' : 'info'">{{ security.hasQuestion ? '已设置' : '未设置' }}</ElTag>
          <ElButton v-if="security.hasQuestion" type="danger" link @click="onResetQuestion">重置</ElButton>
        </template>
      </ElDescriptionsItem>
    </ElDescriptions>
    <template #footer>
      <ElButton @click="visible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Member } from '@/api/member'
import { fetchMemberSecurityInfo, resetMemberGoogle, unbindMemberPhone, unbindMemberEmail, resetMemberQuestion, type MemberSecurityInfo } from '@/api/member'
import { ElMessageBox, ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  member: Partial<Member>
}>()

const emit = defineEmits(['update:modelValue', 'open-reset-fund-pwd'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const security = ref<MemberSecurityInfo>({
  id: 0, username: '', phone: '', phoneBind: false, email: '', emailBind: false, googleBind: false, hasFundPwd: false, hasQuestion: false
})

const loadSecurity = async () => {
  if (!props.member?.id) return
  try {
    const res = await fetchMemberSecurityInfo(props.member.id)
    if (res) {
      security.value = res
    }
  } catch (e) {
    console.error('加载安全信息失败', e)
  }
}

watch(visible, (val) => { if (val) loadSecurity() })

const confirm = (title: string) => ElMessageBox.confirm(title, '提示', { type: 'warning' })

const onResetGoogle = async () => {
  if (!props.member?.id) return
  await confirm('确定要重置该用户的Google验证器吗？')
  const res = await resetMemberGoogle(props.member.id)
  if ((res as any).code === 0) { ElMessage.success('已重置'); loadSecurity() }
}
const onUnbindPhone = async () => {
  if (!props.member?.id) return
  await confirm('确定要解除该用户的手机绑定吗？')
  const res = await unbindMemberPhone(props.member.id)
  if ((res as any).code === 0) { ElMessage.success('已解除'); loadSecurity() }
}
const onUnbindEmail = async () => {
  if (!props.member?.id) return
  await confirm('确定要解除该用户的邮箱绑定吗？')
  const res = await unbindMemberEmail(props.member.id)
  if ((res as any).code === 0) { ElMessage.success('已解除'); loadSecurity() }
}
const onResetQuestion = async () => {
  if (!props.member?.id) return
  await confirm('确定要重置该用户的密保问题吗？')
  const res = await resetMemberQuestion(props.member.id)
  if ((res as any).code === 0) { ElMessage.success('已重置'); loadSecurity() }
}
</script>
