<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/http'

const uploadUrl = '/app/admin/upload/image'
const uploading = ref(false)

function handleUploadSuccess(response: any, field: 'icon' | 'cover') {
  if (response.code === 0 && response.data?.url) {
    formData[field] = response.data.url
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.msg || '上传失败')
  }
  uploading.value = false
}

function handleUploadError() {
  ElMessage.error('上传失败')
  uploading.value = false
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  uploading.value = true
  return true
}

interface Game {
  id: number
  game_id: string
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
  platform: string
  type: string
  icon?: string
  cover?: string
  hot: number
  new: number
  status: string
  sort: number
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const platform = computed(() => route.params.platform as string)
const platformName = ref('')

const tableData = ref<Game[]>([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  limit: 10,
  platform: '',
  keyword: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增游戏')
const formData = reactive({
  id: 0,
  game_id: '',
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
  platform: '',
  type: '',
  icon: '',
  cover: '',
  hot: 0,
  new: 0,
  status: 'online',
  sort: 0
})

onMounted(() => {
  queryParams.platform = platform.value
  platformName.value = platform.value + '游戏管理'
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const res = await request.get<any>({
      url: '/app/admin/api/game/game-list',
      params: queryParams,
      returnFullResponse: true
    })
    tableData.value = res.data?.list || res.list || []
    total.value = res.count || res.data?.total || 0
  } catch (e) {
    console.error('加载游戏列表失败:', e)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.page = 1
  fetchData()
}

function handleAdd() {
  dialogTitle.value = '新增游戏'
  Object.assign(formData, {
    id: 0,
    game_id: '',
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
    platform: platform.value,
    type: '',
    icon: '',
    cover: '',
    hot: 0,
    new: 0,
    status: 'online',
    sort: 0
  })
  dialogVisible.value = true
}

function handleEdit(row: Game) {
  dialogTitle.value = '编辑游戏'
  Object.assign(formData, row)
  dialogVisible.value = true
}

async function handleSave() {
  if (!formData.game_id || !formData.name) {
    return ElMessage.warning('请填写游戏ID和名称')
  }
  try {
    await request.post({
      url: '/app/admin/api/game/game-save',
      data: formData
    })
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    console.error(e)
  }
}

async function handleStatusChange(row: Game, status: string) {
  try {
    await request.post({
      url: '/app/admin/api/game/game-status',
      data: { id: row.id, status }
    })
    ElMessage.success('操作成功')
    row.status = status
  } catch (e) {
    row.status = status === 'online' ? 'offline' : 'online'
  }
}

async function handleHotChange(row: Game, hot: number) {
  try {
    await request.post({
      url: '/app/admin/api/game/game-hot',
      data: { id: row.id, hot }
    })
    row.hot = hot
  } catch (e) {
    row.hot = hot === 1 ? 0 : 1
  }
}

function handleDelete(row: Game) {
  ElMessageBox.confirm(`确定删除游戏【${row.name}】？`, '提示', { type: 'warning' }).then(async () => {
    await request.post({ url: '/app/admin/api/game/game-delete', data: { id: row.id } })
    ElMessage.success('删除成功')
    fetchData()
  })
}

function handleSizeChange(val: number) {
  queryParams.limit = val
  fetchData()
}

function handleCurrentChange(val: number) {
  queryParams.page = val
  fetchData()
}

function goBack() {
  router.push('/lottery/game-list')
}
</script>

<template>
  <div class="app-container">
    
    <el-card class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <el-button @click="goBack">
            <span class="i-ri:arrow-left-line mr-1"></span> 返回
          </el-button>
          <span class="text-lg font-bold">{{ platformName }}</span>
        </div>
        <el-button type="primary" @click="handleAdd">
          <span class="i-ri:add-line mr-1"></span> 批量新增
        </el-button>
      </div>
    </el-card>

    
    <el-card class="mb-4">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="游戏名称">
          <el-input v-model="queryParams.keyword" placeholder="游戏代码/名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="queryParams.keyword = ''; handleSearch()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card>
      <el-table v-loading="loading" :data="tableData" border stripe table-layout="auto">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="game_id" label="游戏代码" width="150" align="center" />
        <el-table-column prop="name" label="游戏名称" align="center" show-overflow-tooltip />
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.sort" :min="0" size="small" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="热门推荐" width="100" align="center">
          <template #default="{ row }">
            <el-switch :model-value="row.hot === 1" @change="(val) => handleHotChange(row, val ? 1 : 0)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-between items-center mt-4">
        <span class="text-gray-500">共 {{ total }} 条</span>
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="游戏代码" required>
          <el-input v-model="formData.game_id" placeholder="游戏唯一标识" />
        </el-form-item>
        <el-form-item label="中文名称" required>
          <el-input v-model="formData.name" placeholder="游戏中文名称" />
        </el-form-item>
        <el-divider content-position="left">多语言名称</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="英文">
              <el-input v-model="formData.name_en" placeholder="请输入英文名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="繁体中文">
              <el-input v-model="formData.name_zh_hant" placeholder="请输入繁体中文名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="越南语">
              <el-input v-model="formData.name_vi" placeholder="请输入越南语名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="泰语">
              <el-input v-model="formData.name_th" placeholder="请输入泰语名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="日语">
              <el-input v-model="formData.name_ja" placeholder="请输入日语名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="韩语">
              <el-input v-model="formData.name_ko" placeholder="请输入韩语名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="印尼语">
              <el-input v-model="formData.name_id" placeholder="请输入印尼语名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="马来语">
              <el-input v-model="formData.name_ms" placeholder="请输入马来语名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="印地语">
              <el-input v-model="formData.name_hi" placeholder="请输入印地语名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="西班牙语">
              <el-input v-model="formData.name_es" placeholder="请输入西班牙语名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="葡萄牙语">
              <el-input v-model="formData.name_pt" placeholder="请输入葡萄牙语名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">其他设置</el-divider>
        <el-form-item label="游戏类型">
          <el-input v-model="formData.type" placeholder="如: slot, live" />
        </el-form-item>
        <el-form-item label="游戏图标">
          <div class="flex items-start gap-4">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="(res: any) => handleUploadSuccess(res, 'icon')"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
              accept="image/*"
            >
              <img v-if="formData.icon" :src="formData.icon" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <el-input v-model="formData.icon" placeholder="或输入图片URL" style="flex:1" />
          </div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="formData.status" active-value="online" inactive-value="offline" active-text="上线" inactive-text="下线" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.avatar {
  width: 80px;
  height: 80px;
  object-fit: cover;
}
</style>
