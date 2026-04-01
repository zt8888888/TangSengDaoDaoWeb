<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchGetGameCategoryList,
  fetchSaveGameCategory,
  fetchSetGameCategoryStatus,
  fetchUpdateGameCategorySort,
  fetchDeleteGameCategory
} from '@/api/lottery'

interface CategoryItem {
  id: number
  code: string
  name: string
  name_en: string
  name_zh_hant: string
  name_vi: string
  name_th: string
  name_ja: string
  name_ko: string
  name_id: string
  name_ms: string
  name_hi: string
  name_es: string
  name_pt: string
  icon: string
  path: string
  sort: number
  status: number
}

const langFields = [
  { field: 'name', label: '简体中文', required: true },
  { field: 'name_en', label: '英语' },
  { field: 'name_zh_hant', label: '繁体中文' },
  { field: 'name_vi', label: '越南语' },
  { field: 'name_th', label: '泰语' },
  { field: 'name_ja', label: '日语' },
  { field: 'name_ko', label: '韩语' },
  { field: 'name_id', label: '印尼语' },
  { field: 'name_ms', label: '马来语' },
  { field: 'name_hi', label: '印地语' },
  { field: 'name_es', label: '西班牙语' },
  { field: 'name_pt', label: '葡萄牙语' }
]

const loading = ref(false)
const tableData = ref<CategoryItem[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const formData = reactive<Record<string, any>>({
  id: 0,
  code: '',
  name: '',
  name_en: '',
  name_zh_hant: '',
  name_vi: '',
  name_th: '',
  name_ja: '',
  name_ko: '',
  name_id: '',
  name_ms: '',
  name_hi: '',
  name_es: '',
  name_pt: '',
  icon: 'apps-o',
  path: '',
  sort: 0,
  status: 1
})

const iconOptions = [
  { label: '趋势图标', value: 'chart-trending-o' },
  { label: '桌面图标', value: 'desktop-o' },
  { label: '应用图标', value: 'apps-o' },
  { label: '邀请图标', value: 'invitation' },
  { label: '火焰图标', value: 'fire-o' },
  { label: '奖牌图标', value: 'medal-o' },
  { label: '链接图标', value: 'link-o' }
]

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const res = await fetchGetGameCategoryList()

    tableData.value = res?.list || []
  } catch (e) {
    console.error('加载分类失败:', e)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  dialogTitle.value = '新增分类'
  Object.assign(formData, { 
    id: 0, code: '', name: '', 
    name_en: '', name_zh_hant: '', name_vi: '', name_th: '',
    name_ja: '', name_ko: '', name_id: '', name_ms: '',
    name_hi: '', name_es: '', name_pt: '',
    icon: 'apps-o', path: '', sort: 0, status: 1 
  })
  dialogVisible.value = true
}

function handleEdit(row: CategoryItem) {
  dialogTitle.value = '编辑分类'
  Object.assign(formData, row)
  dialogVisible.value = true
}

async function handleSave() {
  if (!formData.code || !formData.name) return ElMessage.warning('请填写分类代码和名称')
  try {
    await fetchSaveGameCategory({ ...formData, path: formData.path || `/lotteryMore?type=${formData.code}` })
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } catch (e) { console.error(e) }
}

async function handleStatusChange(row: CategoryItem, status: number | string | boolean) {
  try {
    await fetchSetGameCategoryStatus({ id: row.id, status: Number(status) })
    ElMessage.success('操作成功')
  } catch (e) { row.status = status === 1 ? 0 : 1 }
}

async function handleSortChange(row: CategoryItem, sort: number | undefined) {
  try {
    await fetchUpdateGameCategorySort({ id: row.id, sort: sort ?? 0 })
  } catch (e) { console.error(e) }
}

function handleDelete(row: CategoryItem) {
  ElMessageBox.confirm(`确定删除【${row.name}】？`, '提示', { type: 'warning' }).then(async () => {
    await fetchDeleteGameCategory(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}
</script>

<template>
  <div class="app-container">
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <div class="text-lg font-bold">游戏分类管理</div>
        <el-button type="primary" @click="handleAdd">
          <span class="i-ri:add-line mr-1"></span> 新增分类
        </el-button>
      </div>
      <div class="text-sm text-gray-500 mt-2">管理首页游戏分类导航，控制显示状态和排序</div>
    </el-card>

    <el-card>
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="sort" label="游戏类型" width="120" align="center" />
        <el-table-column prop="name" label="游戏大类名称" min-width="150" align="center" />
        <el-table-column label="排序" width="120" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.sort" :min="0" :max="100" size="small" controls-position="right" @change="(val) => handleSortChange(row, val)" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="启用状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="(val) => handleStatusChange(row, val)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="分类代码" required>
          <el-input v-model="formData.code" placeholder="如: slot, live, chess" :disabled="formData.id > 0" />
        </el-form-item>
        
        <el-divider content-position="left">多语言名称</el-divider>
        
        <el-row :gutter="16">
          <el-col :span="12" v-for="lang in langFields" :key="lang.field">
            <el-form-item :label="lang.label" :required="lang.required">
              <el-input v-model="formData[lang.field]" :placeholder="lang.label" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">其他设置</el-divider>
        
        <el-form-item label="图标">
          <el-select v-model="formData.icon" placeholder="选择图标">
            <el-option v-for="item in iconOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="跳转路径">
          <el-input v-model="formData.path" placeholder="如: /slot, /lotteryMore?type=live" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
