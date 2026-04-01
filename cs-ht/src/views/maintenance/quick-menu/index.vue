<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus, Check, Close, Rank, Edit } from '@element-plus/icons-vue'
import { VueDraggable } from 'vue-draggable-plus'
import { 
  fetchQuickMenuList, 
  deleteQuickMenu, 
  toggleQuickMenuStatus, 
  saveQuickMenuSort, 
  batchDeleteQuickMenu,
  QuickMenu 
} from '@/api/maintenance-quick-menu'
import QuickMenuDialog from './modules/QuickMenuDialog.vue'

defineOptions({ name: 'QuickMenuManage' })

const loading = ref(false)
const menuList = ref<QuickMenu[]>([])
const selectedItems = ref<number[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentMenu = ref<QuickMenu>()

onMounted(() => {
  fetchList()
})

async function fetchList() {
  loading.value = true
  try {
    const res = await fetchQuickMenuList({ limit: 999 })
    menuList.value = res.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openDialog(type: 'add' | 'edit', row?: QuickMenu) {
  dialogType.value = type
  currentMenu.value = row
  dialogVisible.value = true
}

function toggleSelect(id: number) {
  const index = selectedItems.value.indexOf(id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(id)
  }
}

function selectAll() {
  if (selectedItems.value.length === menuList.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = menuList.value.map(m => m.id)
  }
}

async function handleToggleStatus(row: QuickMenu) {
  try {
    await toggleQuickMenuStatus(row.id)
    fetchList()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

async function handleDelete(row: QuickMenu) {
  try {
    await ElMessageBox.confirm('确定删除该菜单?', '提示', { type: 'warning' })
    await deleteQuickMenu(row.id)
    fetchList()
  } catch (e) {}
}

async function batchRemove() {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要删除的菜单')
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedItems.value.length} 个菜单?`, '提示', { type: 'warning' })
    await batchDeleteQuickMenu(selectedItems.value)
    selectedItems.value = []
    fetchList()
  } catch (e) {}
}

async function saveSort() {
  const sortData = menuList.value.map((m, idx) => ({ id: m.id, sort: idx }))
  try {
    await saveQuickMenuSort(sortData)
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

function getLinkTypeText(type: number) {
  return type === 1 ? '内部' : '外部'
}
</script>

<template>
  <div class="app-container">
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold">快捷菜单管理</span>
          <el-checkbox 
            v-if="menuList.length > 0"
            :model-value="selectedItems.length === menuList.length && menuList.length > 0"
            :indeterminate="selectedItems.length > 0 && selectedItems.length < menuList.length"
            @change="selectAll"
          >
            全选
          </el-checkbox>
          <span v-if="selectedItems.length > 0" class="text-sm text-gray-500">
            已选 {{ selectedItems.length }} 项
          </span>
        </div>
        <div class="flex gap-2">
          <el-button type="danger" @click="batchRemove" :disabled="selectedItems.length === 0">
            <el-icon class="mr-1"><Delete /></el-icon> 批量删除
          </el-button>
          <el-button type="primary" @click="openDialog('add')">
            <el-icon class="mr-1"><Plus /></el-icon> 添加菜单
          </el-button>
          <el-button type="success" @click="saveSort">
            <el-icon class="mr-1"><Check /></el-icon> 保存排序
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card>
      <div class="tip-bar mb-4">
        <el-alert type="info" :closable="false">
          <template #title>
            拖拽菜单卡片可调整显示顺序，调整后点击"保存排序"生效
          </template>
        </el-alert>
      </div>

      <div v-loading="loading" class="menu-container">
        <VueDraggable
          v-model="menuList"
          class="menu-grid"
          ghost-class="ghost"
        >
          <div 
            v-for="item in menuList" 
            :key="item.id" 
            class="menu-card" 
            :class="{ selected: selectedItems.includes(item.id), disabled: item.status === 0 }"
          >
            <div class="menu-cover">
              <img v-if="item.icon" :src="item.icon" />
              <div v-else class="placeholder">{{ item.name?.[0] }}</div>
              <div class="select-checkbox">
                <el-checkbox 
                  :model-value="selectedItems.includes(item.id)" 
                  @change="toggleSelect(item.id)"
                  @click.stop
                />
              </div>
              <div class="action-btns">
                <div class="action-btn edit-btn" @click.stop="openDialog('edit', item)">
                  <el-icon><Edit /></el-icon>
                </div>
                <div class="action-btn delete-btn" @click.stop="handleDelete(item)">
                  <el-icon><Close /></el-icon>
                </div>
              </div>
              <div class="drag-handle">
                <el-icon><Rank /></el-icon>
              </div>
              <div v-if="item.status === 0" class="status-badge">已禁用</div>
            </div>
            <div class="menu-info">
              <div class="menu-name">{{ item.name }}</div>
              <div class="menu-meta">
                <el-tag size="small" :type="item.link_type === 1 ? 'primary' : 'warning'">
                  {{ getLinkTypeText(item.link_type) }}
                </el-tag>
                <el-switch 
                  :model-value="item.status === 1" 
                  size="small"
                  @change="handleToggleStatus(item)"
                  @click.stop
                />
              </div>
            </div>
          </div>
        </VueDraggable>

        <el-empty v-if="!loading && menuList.length === 0" description="暂无快捷菜单，点击上方按钮添加" />
      </div>
    </el-card>

    <QuickMenuDialog
      v-model="dialogVisible"
      :type="dialogType"
      :data="currentMenu"
      @submit="fetchList"
    />
  </div>
</template>

<style scoped>
.menu-container {
  min-height: 300px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.menu-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  transition: all 0.2s;
}

.menu-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.menu-card:active {
  cursor: grabbing;
}

.menu-card.disabled {
  opacity: 0.6;
}

.menu-card.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.menu-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f5f5f5;
}

.menu-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
}

.menu-cover .placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.select-checkbox {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 2;
}

.action-btns {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.menu-card:hover .action-btns {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
}

.edit-btn {
  background: rgba(64, 158, 255, 0.9);
}

.delete-btn {
  background: rgba(255, 0, 0, 0.8);
}

.drag-handle {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.menu-card:hover .drag-handle {
  opacity: 1;
}

.status-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  border-radius: 4px;
}

.menu-info {
  padding: 8px;
}

.menu-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}

.menu-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
