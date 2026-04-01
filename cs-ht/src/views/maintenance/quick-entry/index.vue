<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus, Check, Close, Rank, Edit } from '@element-plus/icons-vue'
import { VueDraggable } from 'vue-draggable-plus'
import { 
  fetchQuickEntryList, 
  deleteQuickEntry, 
  saveQuickEntrySort,
  QuickEntry 
} from '@/api/maintenance-quick-entry'
import QuickEntryDialog from './modules/QuickEntryDialog.vue'

defineOptions({ name: 'QuickEntryManage' })

const loading = ref(false)
const entryList = ref<QuickEntry[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const currentEntry = ref<QuickEntry>()

const linkTypeMap: Record<number, string> = {
  1: '内部页面',
  2: '外部链接',
  3: '客服',
  4: '更多弹窗'
}

onMounted(() => {
  fetchList()
})

async function fetchList() {
  loading.value = true
  try {
    const res = await fetchQuickEntryList()
    entryList.value = res.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openDialog(type: 'add' | 'edit', row?: QuickEntry) {
  dialogType.value = type
  currentEntry.value = row
  dialogVisible.value = true
}

async function handleDelete(row: QuickEntry) {
  try {
    await ElMessageBox.confirm('确定删除该入口?', '提示', { type: 'warning' })
    await deleteQuickEntry(row.id)
    fetchList()
  } catch (e) {}
}

async function saveSort() {
  const sortData = entryList.value.map((m, idx) => ({ id: m.id, sort: idx }))
  try {
    await saveQuickEntrySort(sortData)
  } catch (e) {
    ElMessage.error('保存失败')
  }
}
</script>

<template>
  <div class="app-container">
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold">金刚区配置</span>
          <span class="text-sm text-gray-500">首页固定快捷入口（客服/VIP/关于/更多）</span>
        </div>
        <div class="flex gap-2">
          <el-button type="primary" @click="openDialog('add')">
            <el-icon class="mr-1"><Plus /></el-icon> 添加入口
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
            拖拽卡片可调整显示顺序，调整后点击"保存排序"生效。链接类型说明：客服=打开客服、更多弹窗=展开快捷菜单
          </template>
        </el-alert>
      </div>

      <div v-loading="loading" class="entry-container">
        <VueDraggable
          v-model="entryList"
          class="entry-grid"
          ghost-class="ghost"
        >
          <div 
            v-for="item in entryList" 
            :key="item.id" 
            class="entry-card"
            :class="{ disabled: item.status === 0 }"
          >
            <div class="entry-cover">
              <img v-if="item.icon" :src="item.icon" />
              <div v-else class="placeholder">{{ item.name?.[0] }}</div>
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
            <div class="entry-info">
              <div class="entry-name">{{ item.name }}</div>
              <div class="entry-meta">
                <el-tag size="small" :type="item.link_type === 3 ? 'success' : item.link_type === 4 ? 'warning' : 'primary'">
                  {{ linkTypeMap[item.link_type] || '内部' }}
                </el-tag>
              </div>
            </div>
          </div>
        </VueDraggable>

        <el-empty v-if="!loading && entryList.length === 0" description="暂无数据，点击上方按钮添加" />
      </div>
    </el-card>

    <QuickEntryDialog
      v-model="dialogVisible"
      :type="dialogType"
      :data="currentEntry"
      @submit="fetchList"
    />
  </div>
</template>

<style scoped>
.entry-container {
  min-height: 200px;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.entry-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  transition: all 0.2s;
}

.entry-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.entry-card:active {
  cursor: grabbing;
}

.entry-card.disabled {
  opacity: 0.6;
}

.entry-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f5f5f5;
}

.entry-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 16px;
}

.entry-cover .placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #26a17b 0%, #1a8f6e 100%);
  color: #fff;
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

.entry-card:hover .action-btns {
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

.entry-card:hover .drag-handle {
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

.entry-info {
  padding: 8px;
}

.entry-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
  text-align: center;
}

.entry-meta {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

