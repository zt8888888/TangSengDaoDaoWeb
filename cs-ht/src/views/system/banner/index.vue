<template>
  <div class="p-4">
    <div class="mb-4 bg-box p-4 rounded-lg shadow-sm">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <el-button type="primary" @click="handleAdd">
            <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            添加轮播图
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="!selection.length">
            <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />批量删除
          </el-button>
        </div>
        <el-button @click="loadData">
          <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            刷新
        </el-button>
      </div>
    </div>

    <div class="bg-box p-4 rounded-lg shadow-sm">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" sortable />
        <el-table-column label="图片" width="180" align="center">
          <template #default="{ row }">
            <el-image 
              v-if="row.url" 
              :src="row.url" 
              class="h-16 w-auto rounded object-contain bg-g-50" 
              :preview-src-list="[row.url]"
              preview-teleported
              fit="contain"
            />
            <span v-else class="text-g-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题/备注" min-width="150" align="center" />
        <el-table-column prop="type" label="类型" width="120" align="center" sortable>
          <template #default="{ row }">
            <el-tag :type="row.type === 0 ? 'info' : row.type === 1 ? 'warning' : 'success'">
              {{ row.type === 0 ? '全部' : row.type === 1 ? 'PC端' : 'APP端' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="link" label="跳转链接" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(row, val as number)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="listorder" label="排序" width="100" align="center" sortable>
          <template #default="{ row }">
            <el-input-number 
              v-model="row.listorder" 
              :min="0" 
              size="small" 
              controls-position="right"
              class="!w-20"
              @change="() => handleSortChange(row)"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              plain
              @click="handleEdit(row)"
            >修改</el-button>
            <el-button 
              size="small" 
              type="danger" 
              plain
              @click="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加轮播图' : '修改轮播图'"
      width="900px"
      destroy-on-close
    >
      <el-tabs v-model="activeLang" type="card">
        <el-tab-pane 
          v-for="lang in languages" 
          :key="lang.code" 
          :label="lang.name" 
          :name="lang.code"
        >
          <el-form
            :ref="(el: any) => setFormRef(el, lang.code)"
            :model="langForms[lang.code]"
            :rules="lang.code === 'zh-hans' ? rules : {}"
            label-width="100px"
          >
            <el-form-item label="标题/备注" prop="title">
              <el-input 
                v-model="langForms[lang.code].title" 
                :placeholder="lang.code === 'zh-hans' ? '请输入标题或备注' : `请输入${lang.name}标题（选填）`" 
              />
            </el-form-item>
            <el-form-item v-if="lang.code === 'zh-hans'" label="类型" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio :label="0">全部</el-radio>
                <el-radio :label="1">PC端</el-radio>
                <el-radio :label="2">APP端</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="轮播图片" prop="url">
              <div class="w-full">
                <div class="flex gap-2 mb-2">
                  <el-input 
                    v-model="langForms[lang.code].url" 
                    :placeholder="lang.code === 'zh-hans' ? '请输入图片URL或点击上传' : `请输入${lang.name}图片URL（选填）`" 
                    class="flex-1" 
                  />
                  <el-button type="primary" @click="triggerUpload(lang.code)">
                    <ArtSvgIcon icon="ri:upload-line" class="mr-1" />上传
                  </el-button>
                </div>
                <div v-if="langForms[lang.code].url" class="h-32 w-full bg-g-50 rounded flex items-center justify-center border border-g-300 overflow-hidden">
                  <img :src="langForms[lang.code].url" class="h-full object-contain" />
                </div>
              </div>
            </el-form-item>
            <el-form-item label="跳转链接" prop="link">
              <el-input 
                v-model="langForms[lang.code].link" 
                :placeholder="lang.code === 'zh-hans' ? '请输入点击跳转链接（选填）' : `请输入${lang.name}跳转链接（选填）`" 
              />
            </el-form-item>
            <el-form-item v-if="lang.code === 'zh-hans'" label="排序" prop="listorder">
              <el-input-number v-model="form.listorder" :min="0" controls-position="right" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <input type="file" ref="fileInputRef" style="display: none" accept="image/*" @change="handleFileChange" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  fetchBannerList,
  createBanner,
  updateBanner,
  deleteBanner,
  deleteAllBanner,
  updateBannerOrder,
  updateBannerStatus,
  type Banner
} from '@/api/system-banner'
import { uploadImage } from '@/api/common'

const languages = [
  { code: 'zh-hans', name: '简体中文', suffix: '' },
  { code: 'zh-hant', name: '繁体中文', suffix: '_zh_hant' },
  { code: 'en', name: '英语', suffix: '_en' },
  { code: 'ja', name: '日语', suffix: '_ja' },
  { code: 'ko', name: '韩语', suffix: '_ko' },
  { code: 'vi', name: '越南语', suffix: '_vi' },
  { code: 'th', name: '泰语', suffix: '_th' },
  { code: 'id', name: '印尼语', suffix: '_id' },
  { code: 'ms', name: '马来语', suffix: '_ms' },
  { code: 'hi', name: '印地语', suffix: '_hi' },
  { code: 'es', name: '西班牙语', suffix: '_es' },
  { code: 'pt', name: '葡萄牙语', suffix: '_pt' },
]

const loading = ref(false)
const tableData = ref<Banner[]>([])
const selection = ref<Banner[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})


const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRefs = ref<Record<string, any>>({})
const activeLang = ref('zh-hans')
const currentUploadLang = ref('zh-hans')

const setFormRef = (el: any, code: string) => {
  if (el) formRefs.value[code] = el
}

const form = reactive({
  id: 0,
  type: 0,
  listorder: 0
})

const createEmptyLangForm = () => {
  const result: Record<string, { title: string; url: string; link: string }> = {}
  languages.forEach(lang => {
    result[lang.code] = { title: '', url: '', link: '' }
  })
  return result
}

const langForms = reactive<Record<string, { title: string; url: string; link: string }>>(createEmptyLangForm())

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  url: [{ required: true, message: '请上传图片', trigger: 'change' }]
}


const fileInputRef = ref<HTMLInputElement>()
const triggerUpload = (langCode: string) => {
  currentUploadLang.value = langCode
  fileInputRef.value?.click()
}

const handleFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  try {
    ElMessage.info('上传中...')
    const res = await uploadImage(files[0])
    langForms[currentUploadLang.value].url = res.url
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchBannerList({
      page: pagination.page,
      limit: pagination.limit
    })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (val: Banner[]) => {
  selection.value = val
}

const handleSizeChange = (val: number) => {
  pagination.limit = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadData()
}

const handleSortChange = async (row: Banner) => {
  try {
    await updateBannerOrder([{ id: row.id, listorder: row.listorder || 0 }])
    ElMessage.success('排序更新成功')
  } catch (error) {
    loadData()
  }
}

const handleStatusChange = async (row: Banner, val: number) => {
  try {
    await updateBannerStatus(row.id, val)
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = val === 1 ? 0 : 1
  }
}

const resetForms = () => {
  form.id = 0
  form.type = 0
  form.listorder = 0
  languages.forEach(lang => {
    langForms[lang.code] = { title: '', url: '', link: '' }
  })
  activeLang.value = 'zh-hans'
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForms()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.type = row.type ?? 0
  form.listorder = row.listorder || 0
  
  langForms['zh-hans'].title = row.title || ''
  langForms['zh-hans'].url = row.url || ''
  langForms['zh-hans'].link = row.link || ''
  
  languages.forEach(lang => {
    if (lang.suffix) {
      langForms[lang.code].title = row[`title${lang.suffix}`] || ''
      langForms[lang.code].url = row[`image${lang.suffix}`] || ''
      langForms[lang.code].link = row[`link${lang.suffix}`] || ''
    }
  })
  
  activeLang.value = 'zh-hans'
  dialogVisible.value = true
}

const handleDelete = (row: Banner) => {
  ElMessageBox.confirm('确定要删除该轮播图吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteBanner(row.id)
    loadData()
  })
}

const handleBatchDelete = () => {
  if (!selection.value.length) return
  ElMessageBox.confirm(`确定要删除选中的 ${selection.value.length} 项吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteAllBanner(selection.value.map(item => item.id))
    loadData()
  })
}

const handleSubmit = async () => {
  const mainFormRef = formRefs.value['zh-hans']
  if (!mainFormRef) return
  
  await mainFormRef.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        const submitData: Record<string, any> = {
          id: form.id,
          title: langForms['zh-hans'].title,
          url: langForms['zh-hans'].url,
          link: langForms['zh-hans'].link,
          type: form.type,
          listorder: form.listorder
        }
        
        languages.forEach(lang => {
          if (lang.suffix) {
            submitData[`title${lang.suffix}`] = langForms[lang.code].title || ''
            submitData[`image${lang.suffix}`] = langForms[lang.code].url || ''
            submitData[`link${lang.suffix}`] = langForms[lang.code].link || ''
          }
        })
        
        if (dialogType.value === 'add') {
          await createBanner(submitData)
        } else {
          await updateBanner(submitData)
        }
        dialogVisible.value = false
        loadData()
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>
