<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus, Check, Close, Rank } from '@element-plus/icons-vue'
import request from '@/utils/http'
import { VueDraggable } from 'vue-draggable-plus'
import { useDebounceFn } from '@vueuse/core'

interface Game {
  id: number
  game_id: string
  name: string
  platform: string
  type: string
  icon?: string
  cover?: string
  hot: number
  hot_sort: number
}

interface Platform {
  code: string
  name: string
}

const loading = ref(false)
const hotGames = ref<Game[]>([])
const selectedGames = ref<number[]>([])
const searchKeyword = ref('')
const searchPlatform = ref('')
const searchResults = ref<Game[]>([])
const searching = ref(false)
const showSearchDialog = ref(false)
const platforms = ref<Platform[]>([])

const typeLabels: Record<string, string> = {
  slot: '电子',
  live: '真人',
  fish: '捕鱼',
  chess: '棋牌',
  sport: '体育',
  lottery: '彩票',
  esport: '电竞',
  blockchain: '区块链',
  mini: '小游戏',
  special: '特色游戏'
}

onMounted(() => {
  fetchHotGames()
  fetchPlatforms()
})

async function fetchHotGames() {
  loading.value = true
  try {
    const res = await request.get<any>({
      url: '/app/admin/api/game/hot-games',
      returnFullResponse: true
    })
    hotGames.value = res.data?.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function fetchPlatforms() {
  try {
    const res = await request.get<any>({
      url: '/app/admin/api/game/platform-list',
      params: { limit: 999 },
      returnFullResponse: true
    })
    platforms.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

const debouncedSearch = useDebounceFn(() => {
  searchGames()
}, 300)

watch([searchKeyword, searchPlatform], () => {
  debouncedSearch()
})

async function searchGames() {
  if (!searchKeyword.value.trim() && !searchPlatform.value) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    const res = await request.get<any>({
      url: '/app/admin/api/game/search-games',
      params: { 
        keyword: searchKeyword.value, 
        platform: searchPlatform.value,
        limit: 50 
      },
      returnFullResponse: true
    })
    searchResults.value = (res.data?.list || []).filter(
      (g: Game) => !hotGames.value.some(h => h.id === g.id)
    )
  } catch (e) {
    console.error(e)
  } finally {
    searching.value = false
  }
}

async function addToHot(game: Game) {
  try {
    await request.post({
      url: '/app/admin/api/game/add-hot-game',
      data: { id: game.id }
    })
    hotGames.value.push({ ...game, hot: 1, hot_sort: hotGames.value.length })
    searchResults.value = searchResults.value.filter(g => g.id !== game.id)
    ElMessage.success('已添加到热门')
  } catch (e) {
    console.error(e)
  }
}

async function removeFromHot(game: Game) {
  try {
    await request.post({
      url: '/app/admin/api/game/remove-hot-game',
      data: { id: game.id }
    })
    hotGames.value = hotGames.value.filter(g => g.id !== game.id)
    selectedGames.value = selectedGames.value.filter(id => id !== game.id)
    ElMessage.success('已移除')
  } catch (e) {
    console.error(e)
  }
}

function toggleSelect(gameId: number) {
  const index = selectedGames.value.indexOf(gameId)
  if (index > -1) {
    selectedGames.value.splice(index, 1)
  } else {
    selectedGames.value.push(gameId)
  }
}

function selectAll() {
  if (selectedGames.value.length === hotGames.value.length) {
    selectedGames.value = []
  } else {
    selectedGames.value = hotGames.value.map(g => g.id)
  }
}

async function batchRemove() {
  if (selectedGames.value.length === 0) {
    ElMessage.warning('请先选择要删除的游戏')
    return
  }
  try {
    await request.post({
      url: '/app/admin/api/game/batch-remove-hot-games',
      data: { ids: selectedGames.value }
    })
    hotGames.value = hotGames.value.filter(g => !selectedGames.value.includes(g.id))
    ElMessage.success(`已移除 ${selectedGames.value.length} 个游戏`)
    selectedGames.value = []
  } catch (e) {
    console.error(e)
  }
}

async function saveSort() {
  const sortData = hotGames.value.map((g, idx) => ({ id: g.id, sort: idx }))
  try {
    await request.post({
      url: '/app/admin/api/game/save-hot-sort',
      data: { games: sortData }
    })
    ElMessage.success('排序已保存')
  } catch (e) {
    console.error(e)
  }
}

function openSearchDialog() {
  searchKeyword.value = ''
  searchPlatform.value = ''
  searchResults.value = []
  showSearchDialog.value = true
}
</script>

<template>
  <div class="app-container">
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold">热门游戏管理</span>
          <el-checkbox 
            v-if="hotGames.length > 0"
            :model-value="selectedGames.length === hotGames.length && hotGames.length > 0"
            :indeterminate="selectedGames.length > 0 && selectedGames.length < hotGames.length"
            @change="selectAll"
          >
            全选
          </el-checkbox>
          <span v-if="selectedGames.length > 0" class="text-sm text-gray-500">
            已选 {{ selectedGames.length }} 项
          </span>
        </div>
        <div class="flex gap-2">
          <el-button type="danger" @click="batchRemove" :disabled="selectedGames.length === 0">
            <el-icon class="mr-1"><Delete /></el-icon> 批量删除
          </el-button>
          <el-button type="primary" @click="openSearchDialog">
            <el-icon class="mr-1"><Plus /></el-icon> 添加热门游戏
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
            拖拽游戏卡片可调整显示顺序，调整后点击"保存排序"生效
          </template>
        </el-alert>
      </div>

      <div v-loading="loading" class="hot-games-container">
        <VueDraggable
          v-model="hotGames"
          class="game-grid"
          ghost-class="ghost"
        >
          <div v-for="element in hotGames" :key="element.id" class="game-card" :class="{ selected: selectedGames.includes(element.id) }">
            <div class="game-cover">
              <img v-if="element.cover || element.icon" :src="element.cover || element.icon" />
              <div v-else class="placeholder">{{ element.name?.[0] }}</div>
              <div class="select-checkbox">
                <el-checkbox 
                  :model-value="selectedGames.includes(element.id)" 
                  @change="toggleSelect(element.id)"
                  @click.stop
                />
              </div>
              <div class="remove-btn" @click.stop="removeFromHot(element)">
                <el-icon><Close /></el-icon>
              </div>
              <div class="drag-handle">
                <el-icon><Rank /></el-icon>
              </div>
            </div>
            <div class="game-info">
              <div class="game-name">{{ element.name }}</div>
              <div class="game-meta">
                <el-tag size="small">{{ element.platform }}</el-tag>
                <el-tag size="small" type="info">{{ typeLabels[element.type] || element.type }}</el-tag>
              </div>
            </div>
          </div>
        </VueDraggable>

        <el-empty v-if="!loading && hotGames.length === 0" description="暂无热门游戏，点击上方按钮添加" />
      </div>
    </el-card>

    <el-dialog v-model="showSearchDialog" title="添加热门游戏" width="800px">
      <div class="search-box mb-4 flex gap-3">
        <el-select
          v-model="searchPlatform"
          placeholder="选择平台"
          clearable
          filterable
          style="width: 180px"
        >
          <el-option
            v-for="p in platforms"
            :key="p.code"
            :label="p.name"
            :value="p.code"
          />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="输入游戏名称搜索"
          clearable
          style="flex: 1"
        />
      </div>

      <div class="search-results">
        <el-table :data="searchResults" max-height="400" v-loading="searching">
          <el-table-column prop="game_id" label="游戏代码" width="150" />
          <el-table-column prop="name" label="游戏名称" min-width="150" />
          <el-table-column prop="platform" label="平台" width="100" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              {{ typeLabels[row.type] || row.type }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="addToHot(row)">添加</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!searching && searchResults.length === 0 && searchKeyword" description="未找到游戏" />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.hot-games-container {
  min-height: 300px;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.game-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  transition: all 0.2s;
}

.game-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.game-card:active {
  cursor: grabbing;
}

.game-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f5f5f5;
}

.game-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-cover .placeholder {
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
  color: #999;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(255, 0, 0, 0.8);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.game-card:hover .remove-btn {
  opacity: 1;
}

.game-card.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.select-checkbox {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 2;
}

.game-card:hover .select-checkbox {
  display: block;
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

.game-card:hover .drag-handle {
  opacity: 1;
}

.game-info {
  padding: 8px;
}

.game-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.game-meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>

