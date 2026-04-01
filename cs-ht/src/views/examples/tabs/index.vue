
<template>
  <div class="page-content">
    <h3 class="mb-5 text-xl font-normal">标签页操作</h3>

    
    <ElCard class="mb-7.5" header="修改标签标题" shadow="never">
      <div class="flex gap-2">
        <ElInput
          v-model="newTabTitle"
          placeholder="请输入新的标签页标题"
          clearable
          class="!max-w-75"
        />

        <ElButton type="primary" @click="handleUpdateTabTitle" :disabled="!newTabTitle.trim()">
          修改
        </ElButton>
        <ElButton @click="handleResetTabTitle"> 重置 </ElButton>
      </div>
    </ElCard>

    
    <ElCard class="mb-7.5" header="获取标签页信息" shadow="never">
      <div class="mb-4">
        <p class="m-0 mb-2 text-sm text-g-600"> 当前标签页信息：{{ currentTab }} </p>
      </div>
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElButton type="success" plain @click="handleGetCurrentTabTitle(routePath)">
            获取当前标签页信息
          </ElButton>
        </ElCol>
      </ElRow>
    </ElCard>

    
    <ElCard class="mb-7.5" header="关闭标签页" shadow="never">
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElButton type="danger" plain @click="handleCloseTab(routePath)"> 关闭当前标签 </ElButton>
          <ElButton type="warning" plain @click="handleCloseOthersTab(routePath)">
            关闭其他标签
          </ElButton>
          <ElButton type="danger" plain @click="handleCloseAllTab"> 关闭所有标签 </ElButton>
        </ElCol>
      </ElRow>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useWorktabStore } from '@/store/modules/worktab'
  import { WorkTab } from '@/types'

  defineOptions({ name: 'TabsExample' })

  const worktabStore = useWorktabStore()
  const currentTab = ref<WorkTab | null>(null)
  const newTabTitle = ref('')
  const routePath = '/examples/tabs'

  const handleUpdateTabTitle = (): void => {
    const trimmedTitle = newTabTitle.value.trim()
    if (trimmedTitle) {
      worktabStore.updateTabTitle(routePath, trimmedTitle)
      ElMessage.success('标签页标题已更新')
    }
  }

  const handleResetTabTitle = (): void => {
    worktabStore.resetTabTitle(routePath)
    newTabTitle.value = ''
    ElMessage.success('标签页标题已重置')
  }

  const handleGetCurrentTabTitle = (path: string): void => {
    const tab = worktabStore.getTabTitle(path)
    if (tab) {
      currentTab.value = tab
      ElMessage.success('已获取标签页信息')
    } else {
      ElMessage.warning('未找到标签信息')
    }
  }

  const handleCloseTab = (path: string): void => {
    worktabStore.removeTab(path)
  }

  const handleCloseOthersTab = (path: string): void => {
    worktabStore.removeOthers(path)
  }

  const handleCloseAllTab = (): void => {
    worktabStore.removeAll()
  }
</script>
