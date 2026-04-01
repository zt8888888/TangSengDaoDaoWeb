<template>
  <ElDialog
    v-model="visible"
    title="登录设备"
    width="800px"
  >
    <ElTable :data="devices" border stripe v-loading="loading">
      <ElTableColumn prop="browser_type" label="浏览器" width="140" />
      <ElTableColumn prop="os_type" label="操作系统" width="80" />
      <ElTableColumn prop="os_version" label="系统版本" width="100" />
      <ElTableColumn prop="device_brand" label="设备品牌" width="80" />
      <ElTableColumn prop="device_model" label="设备型号" width="140" />
      <ElTableColumn prop="ip" label="IP" width="130" />
      <ElTableColumn prop="ip_region" label="IP地区" min-width="150" />
      <ElTableColumn prop="last_login_at" label="登录时间" width="160" />
      <ElTableColumn label="状态" width="80">
        <template #default="{ row }">
          <ElTag v-if="row.is_current" type="success" size="small">当前</ElTag>
        </template>
      </ElTableColumn>
    </ElTable>
    <template #footer>
      <ElButton @click="visible = false">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import request from '@/utils/http'

const props = withDefaults(defineProps<{
  modelValue: boolean
  memberId: number
}>(), {
  memberId: 0
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const devices = ref<any[]>([])

const loadDevices = async () => {
  if (!props.memberId) return
  loading.value = true
  try {
    const res: any = await request.get({
      url: '/app/admin/member/devices',
      params: { id: props.memberId }
    })
    let list = []
    if (res?.data?.data?.list) {
      list = res.data.data.list
    } else if (res?.data?.list) {
      list = res.data.list
    } else if (res?.list) {
      list = res.list
    }
    devices.value = list
  } catch (e) {}
  loading.value = false
}

watch(() => props.modelValue, (val) => {
  if (val) loadDevices()
})
</script>
