<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchPlatformList, updatePlatformStatus } from '@/api/game-platform'
import { fetchGetGameCategoryList } from '@/api/lottery'
import request from '@/utils/http'

interface Platform {
  id: number
  code: string
  name: string
  name_en?: string
  name_zh_hant?: string
  name_vi?: string
  name_th?: string
  name_ja?: string
  name_ko?: string
  name_id?: string
  name_ms?: string
  name_hi?: string
  name_es?: string
  name_pt?: string
  status: string
  sort: number
  icon?: string
  banner?: string
  mobile_icon?: string
  mobile_banner?: string
  categories?: { code: string; name: string }[]
}

interface Category {
  id: number
  code: string
  name: string
  status: number
}

const router = useRouter()
const loading = ref(false)
const syncLoading = ref(false)
const platforms = ref<Platform[]>([])
const allCategories = ref<Category[]>([])
const editDialogVisible = ref(false)
const editForm = ref<Partial<Platform>>({})

const categoryDialogVisible = ref(false)
const categoryEditPlatform = ref<Platform | null>(null)
const categoryConfigs = ref<Record<string, { enabled: boolean; display_name: string; banner: string; mobile_banner: string; status: string; sort: number }>>({})

const currentPage = ref(1)
const pageSize = ref(20)
const searchKeyword = ref('')
const filterCategory = ref('')
const selectedPlatforms = ref<Platform[]>([])

const filteredPlatforms = computed(() => {
  let result = platforms.value
  
  if (filterCategory.value) {
    result = result.filter(p => p.categories?.some(c => c.code === filterCategory.value))
  }
  
  if (!searchKeyword.value.trim()) return result
  const keyword = searchKeyword.value.trim().toLowerCase()
  return platforms.value.filter(p =>
    p.name.toLowerCase().includes(keyword) ||
    p.code.toLowerCase().includes(keyword)
  )
})

const paginatedTotal = computed(() => filteredPlatforms.value.length)

const displayPlatforms = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredPlatforms.value.slice(start, start + pageSize.value)
})

onMounted(async () => {
  await loadCategories()
  await loadPlatforms()
})

async function loadCategories() {
  try {
    const res = await fetchGetGameCategoryList()
    const list = res?.list || []
    allCategories.value = list.filter((c: Category) => c.code !== 'hot' && c.status === 1)
  } catch (e) {
    console.error(e)
  }
}

async function loadPlatforms() {
  loading.value = true
  try {
    const res = await fetchPlatformList({ page: 1, limit: 200 })
    platforms.value = res?.list || res?.data?.list || []
    
    try {
      const catRes = await request.get<any>({
        url: '/app/admin/api/game/platform-category-list'
      })
      const allRelations = catRes?.list || []
      
      const categoryMap: Record<string, { code: string; name: string }[]> = {}
      for (const rel of allRelations) {
        const code = rel.platform_code
        if (!categoryMap[code]) categoryMap[code] = []
        categoryMap[code].push({
          code: rel.category_code,
          name: rel.category_name || rel.category_code
        })
      }
      
      for (const p of platforms.value) {
        p.categories = categoryMap[p.code] || []
      }
    } catch (catErr) {
      console.error('加载分类关系失败:', catErr)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleEditCategories(row: Platform) {
  categoryEditPlatform.value = row
  
  const configs: Record<string, any> = {}
  for (const cat of allCategories.value) {
    configs[cat.code] = { enabled: false, display_name: '', banner: '', mobile_banner: '', status: 'online', sort: 0 }
  }
  
  try {
    const res = await request.get<any>({
      url: '/app/admin/api/game/platform-category-list',
      params: { platform_code: row.code }
    })
    const list = res?.list || []
    for (const item of list) {
      if (configs[item.category_code]) {
        configs[item.category_code] = {
          enabled: true,
          display_name: item.display_name || '',
          banner: item.banner || '',
          mobile_banner: item.mobile_banner || '',
          status: item.status || 'online',
          sort: item.sort || 0
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
  
  categoryConfigs.value = configs
  categoryDialogVisible.value = true
}

async function handleSaveCategories() {
  if (!categoryEditPlatform.value) return
  
  const categories = Object.entries(categoryConfigs.value)
    .filter(([_, cfg]) => cfg.enabled)
    .map(([code, cfg]) => ({
      code,
      display_name: cfg.display_name,
      banner: cfg.banner,
      mobile_banner: cfg.mobile_banner,
      status: cfg.status,
      sort: cfg.sort
    }))
  
  try {
    await request.post({
      url: '/app/admin/api/game/platform-category-batch',
      data: {
        platform_code: categoryEditPlatform.value.code,
        categories
      }
    })
    
    categoryEditPlatform.value.categories = categories.map(c => ({
      code: c.code,
      name: allCategories.value.find(cat => cat.code === c.code)?.name || c.code
    }))
    
    categoryDialogVisible.value = false
    ElMessage.success('分类配置已保存')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

function handleCategoryBannerUpload(catCode: string, field: 'banner' | 'mobile_banner') {
  return (response: any) => {
    if (response.code === 0 && response.data?.url) {
      categoryConfigs.value[catCode][field] = response.data.url
      ElMessage.success('上传成功')
    }
  }
}

function handleSearch() {
  currentPage.value = 1
}

function handleReset() {
  searchKeyword.value = ''
  filterCategory.value = ''
  currentPage.value = 1
}

async function handleStatusChange(row: Platform, status: string) {
  try {
    await updatePlatformStatus(row.id, status)
    row.status = status
    ElMessage.success('状态更新成功')
  } catch (e) {
    console.error(e)
  }
}

function goToGameManage(platform: Platform) {
  router.push(`/lottery/game-list/${platform.code}`)
}

async function handleSyncNGGames() {
  const platform = platforms.value.length > 0 ? platforms.value[0].code : ''
  if (!platform) return ElMessage.warning('没有可用平台')

  ElMessageBox.confirm(
    `确定从NG接口同步游戏数据？`,
    '同步确认',
    { type: 'warning' }
  ).then(async () => {
    syncLoading.value = true
    try {
      const res = await request.post<any>({
        url: '/app/admin/api/game/sync-ng-games',
        data: { platType: platform.toLowerCase() }
      })
      ElMessage.success(res?.count ? `同步成功，共 ${res.count} 个游戏` : '同步完成')
    } catch (e: any) {
      ElMessage.error(e.message || '同步失败')
    } finally {
      syncLoading.value = false
    }
  })
}

function handleEdit(row: Platform) {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

async function handleSave() {
  if (!editForm.value.id) return

  try {
    await request.post({
      url: '/app/admin/api/game/update-platform',
      data: {
        id: editForm.value.id,
        name: editForm.value.name,
        name_en: editForm.value.name_en,
        name_zh_hant: editForm.value.name_zh_hant,
        name_vi: editForm.value.name_vi,
        name_th: editForm.value.name_th,
        name_ja: editForm.value.name_ja,
        name_ko: editForm.value.name_ko,
        name_id: editForm.value.name_id,
        name_ms: editForm.value.name_ms,
        name_hi: editForm.value.name_hi,
        name_es: editForm.value.name_es,
        name_pt: editForm.value.name_pt,
        icon: editForm.value.icon,
        banner: editForm.value.banner,
        mobile_icon: editForm.value.mobile_icon,
        mobile_banner: editForm.value.mobile_banner,
        sort: editForm.value.sort
      }
    })
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    const index = platforms.value.findIndex(p => p.id === editForm.value.id)
    if (index !== -1) {
      platforms.value[index] = { ...platforms.value[index], ...editForm.value }
    }
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

function handleSelectionChange(selection: Platform[]) {
  selectedPlatforms.value = selection
}

async function handleBatchDelete() {
  if (selectedPlatforms.value.length === 0) return ElMessage.warning('请选择平台')

  ElMessageBox.confirm(
    `确定删除选中的 ${selectedPlatforms.value.length} 个平台？`,
    '批量删除',
    { type: 'warning' }
  ).then(async () => {
    try {
      for (const p of selectedPlatforms.value) {
        await request.post({ url: '/app/admin/api/game/delete-platform', data: { id: p.id } })
      }
      ElMessage.success('删除成功')
      platforms.value = platforms.value.filter(p => !selectedPlatforms.value.includes(p))
      selectedPlatforms.value = []
    } catch (e: any) {
      ElMessage.error(e.message || '删除失败')
    }
  })
}

async function handleDelete(row: Platform) {
  ElMessageBox.confirm(`确定删除平台【${row.name}】？`, '删除确认', { type: 'warning' }).then(async () => {
    try {
      await request.post({ url: '/app/admin/api/game/delete-platform', data: { id: row.id } })
      ElMessage.success('删除成功')
      platforms.value = platforms.value.filter(p => p.id !== row.id)
    } catch (e: any) {
      ElMessage.error(e.message || '删除失败')
    }
  })
}

async function handleLogoUpload(row: Platform, response: any) {
  if (response.code === 0 && response.data?.url) {
    row.icon = response.data.url
    await request.post({
      url: '/app/admin/api/game/update-platform',
      data: { id: row.id, icon: response.data.url }
    })
    ElMessage.success('Logo更新成功')
  }
}

function handleUploadSuccess(field: keyof Platform) {
  return (response: any) => {
    if (response.code === 0 && response.data?.url) {
      (editForm.value as any)[field] = response.data.url
      ElMessage.success('上传成功')
    }
  }
}

function handleUploadError() {
  ElMessage.error('上传失败')
}
</script>

<template>
  <div class="app-container">
    <el-card class="mb-4">
      <el-form :inline="true">
        <el-form-item label="分类">
          <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 140px" @change="handleSearch">
            <el-option v-for="cat in allCategories" :key="cat.code" :label="cat.name" :value="cat.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="searchKeyword" placeholder="平台名称/代码" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="warning" :loading="syncLoading" @click="handleSyncNGGames">同步NG游戏</el-button>
          <el-button type="danger" :disabled="selectedPlatforms.length === 0" @click="handleBatchDelete">
            批量删除 ({{ selectedPlatforms.length }})
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table v-loading="loading" :data="displayPlatforms" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="code" label="平台代码" width="120" align="center" />
        <el-table-column label="Logo" width="80" align="center">
          <template #default="{ row }">
            <el-upload action="/app/admin/upload/image" :show-file-list="false" :on-success="(res) => handleLogoUpload(row, res)" :on-error="handleUploadError" accept="image/*">
              <el-image v-if="row.icon" :src="row.icon" style="width: 40px; height: 40px; cursor: pointer" fit="contain" />
              <div v-else class="logo-placeholder"><span class="i-ri:image-add-line text-xl text-gray-400"></span></div>
            </el-upload>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="平台名称" width="150" align="center" />
        <el-table-column label="支持分类" min-width="200" align="center">
          <template #default="{ row }">
            <div class="category-cell" @click="handleEditCategories(row)">
              <template v-if="row.categories?.length">
                <el-tag v-for="cat in row.categories" :key="cat.code" size="small" class="mr-1 mb-1">{{ cat.name }}</el-tag>
              </template>
              <el-button v-else type="primary" link size="small">点击配置</el-button>
              <span class="edit-icon i-ri:edit-line ml-2"></span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-select v-model="row.status" size="small" @change="(val) => handleStatusChange(row, val)">
              <el-option label="在线" value="online" />
              <el-option label="维护" value="maintain" />
              <el-option label="下线" value="offline" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column label="横幅" width="120" align="center">
          <template #default="{ row }">
            <el-image v-if="row.mobile_banner || row.banner" :src="row.mobile_banner || row.banner" style="width: 80px; height: 35px" fit="cover" :preview-src-list="[row.mobile_banner || row.banner]" preview-teleported />
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link @click="goToGameManage(row)">游戏</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-between items-center mt-4">
        <span class="text-gray-500">共 {{ paginatedTotal }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="paginatedTotal"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑平台" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="平台代码">
          <el-input v-model="editForm.code" disabled />
        </el-form-item>
        <el-form-item label="中文名称">
          <el-input v-model="editForm.name" placeholder="请输入中文名称" />
        </el-form-item>
        <el-divider content-position="left">多语言名称</el-divider>
        <el-form-item label="英文名称">
          <el-input v-model="editForm.name_en" placeholder="English" />
        </el-form-item>
        <el-form-item label="繁体中文">
          <el-input v-model="editForm.name_zh_hant" placeholder="繁體中文" />
        </el-form-item>
        <el-form-item label="越南语">
          <el-input v-model="editForm.name_vi" placeholder="Tiếng Việt" />
        </el-form-item>
        <el-form-item label="泰语">
          <el-input v-model="editForm.name_th" placeholder="ภาษาไทย" />
        </el-form-item>
        <el-form-item label="日语">
          <el-input v-model="editForm.name_ja" placeholder="日本語" />
        </el-form-item>
        <el-form-item label="韩语">
          <el-input v-model="editForm.name_ko" placeholder="한국어" />
        </el-form-item>
        <el-form-item label="印尼语">
          <el-input v-model="editForm.name_id" placeholder="Bahasa Indonesia" />
        </el-form-item>
        <el-form-item label="马来语">
          <el-input v-model="editForm.name_ms" placeholder="Bahasa Melayu" />
        </el-form-item>
        <el-form-item label="印地语">
          <el-input v-model="editForm.name_hi" placeholder="हिन्दी" />
        </el-form-item>
        <el-form-item label="西班牙语">
          <el-input v-model="editForm.name_es" placeholder="Español" />
        </el-form-item>
        <el-form-item label="葡萄牙语">
          <el-input v-model="editForm.name_pt" placeholder="Português" />
        </el-form-item>
        <el-divider content-position="left">图片设置</el-divider>
        <el-form-item label="PC图标">
          <div class="flex items-center gap-2">
            <el-image v-if="editForm.icon" :src="editForm.icon" style="width: 60px; height: 60px" fit="contain" />
            <el-upload action="/app/admin/upload/image" :show-file-list="false" :on-success="handleUploadSuccess('icon')" :on-error="handleUploadError" accept="image/*">
              <el-button size="small">上传</el-button>
            </el-upload>
            <el-input v-model="editForm.icon" placeholder="图标URL" style="flex: 1" />
          </div>
        </el-form-item>
        <el-form-item label="PC横幅">
          <div class="flex items-center gap-2">
            <el-image v-if="editForm.banner" :src="editForm.banner" style="width: 100px; height: 50px" fit="cover" />
            <el-upload action="/app/admin/upload/image" :show-file-list="false" :on-success="handleUploadSuccess('banner')" :on-error="handleUploadError" accept="image/*">
              <el-button size="small">上传</el-button>
            </el-upload>
            <el-input v-model="editForm.banner" placeholder="横幅URL" style="flex: 1" />
          </div>
        </el-form-item>
        <el-form-item label="H5图标">
          <div class="flex items-center gap-2">
            <el-image v-if="editForm.mobile_icon" :src="editForm.mobile_icon" style="width: 60px; height: 60px" fit="contain" />
            <el-upload action="/app/admin/upload/image" :show-file-list="false" :on-success="handleUploadSuccess('mobile_icon')" :on-error="handleUploadError" accept="image/*">
              <el-button size="small">上传</el-button>
            </el-upload>
            <el-input v-model="editForm.mobile_icon" placeholder="图标URL" style="flex: 1" />
          </div>
        </el-form-item>
        <el-form-item label="H5横幅">
          <div class="flex items-center gap-2">
            <el-image v-if="editForm.mobile_banner" :src="editForm.mobile_banner" style="width: 100px; height: 50px" fit="cover" />
            <el-upload action="/app/admin/upload/image" :show-file-list="false" :on-success="handleUploadSuccess('mobile_banner')" :on-error="handleUploadError" accept="image/*">
              <el-button size="small">上传</el-button>
            </el-upload>
            <el-input v-model="editForm.mobile_banner" placeholder="横幅URL" style="flex: 1" />
          </div>
        </el-form-item>
        <el-divider content-position="left">其他设置</el-divider>
        <el-form-item label="排序">
          <el-input-number v-model="editForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="categoryDialogVisible" title="配置平台分类" width="700px">
      <div class="mb-4">
        <span class="text-gray-500">平台：</span>
        <span class="font-bold">{{ categoryEditPlatform?.name }} ({{ categoryEditPlatform?.code }})</span>
      </div>
      <div class="category-config-list">
        <div v-for="cat in allCategories" :key="cat.code" class="category-config-item">
          <div class="category-header">
            <el-checkbox v-model="categoryConfigs[cat.code].enabled">
              <span class="font-medium">{{ cat.name }}</span>
            </el-checkbox>
          </div>
          <div v-if="categoryConfigs[cat.code]?.enabled" class="category-detail">
            <el-form :inline="true" label-width="80px" size="small">
              <el-form-item label="显示名称">
                <el-input v-model="categoryConfigs[cat.code].display_name" placeholder="留空用默认" style="width: 120px" />
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="categoryConfigs[cat.code].status" style="width: 90px">
                  <el-option label="在线" value="online" />
                  <el-option label="维护" value="maintain" />
                  <el-option label="下线" value="offline" />
                </el-select>
              </el-form-item>
              <el-form-item label="排序">
                <el-input-number v-model="categoryConfigs[cat.code].sort" :min="0" style="width: 100px" />
              </el-form-item>
            </el-form>
            <el-form :inline="true" label-width="80px" size="small">
              <el-form-item label="H5横幅">
                <div class="flex items-center gap-2">
                  <el-image v-if="categoryConfigs[cat.code].mobile_banner" :src="categoryConfigs[cat.code].mobile_banner" style="width: 80px; height: 35px" fit="cover" />
                  <el-upload action="/app/admin/upload/image" :show-file-list="false" :on-success="handleCategoryBannerUpload(cat.code, 'mobile_banner')" :on-error="handleUploadError" accept="image/*">
                    <el-button size="small">上传</el-button>
                  </el-upload>
                  <el-input v-model="categoryConfigs[cat.code].mobile_banner" placeholder="横幅URL" style="width: 180px" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCategories">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.logo-placeholder {
  width: 40px;
  height: 40px;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.logo-placeholder:hover {
  border-color: #409eff;
}
.category-cell {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.category-cell:hover .edit-icon {
  opacity: 1;
}
.edit-icon {
  opacity: 0;
  transition: opacity 0.2s;
  color: #409eff;
}
.category-config-list {
  max-height: 400px;
  overflow-y: auto;
}
.category-config-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}
.category-config-item:last-child {
  margin-bottom: 0;
}
.category-header {
  margin-bottom: 8px;
}
.category-detail {
  padding-left: 24px;
  border-left: 2px solid #409eff;
}
</style>
