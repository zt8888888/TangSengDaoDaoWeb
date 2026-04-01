<template>
  <div class="p-4">
    <div class="mb-4 bg-box p-4 rounded-lg shadow-sm">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <el-button type="primary" @click="handleAdd">
            <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            添加语言
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
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="code" label="语言代码" width="120" align="center" />
        <el-table-column prop="name" label="语言名称" width="150" align="center" />
        <el-table-column prop="native_name" label="原生名称" width="150" align="center" />
        <el-table-column prop="short_name" label="简称" width="80" align="center" />
        <el-table-column label="图标" width="100" align="center">
          <template #default="{ row }">
            <el-image 
              v-if="row.icon" 
              :src="row.icon" 
              class="h-8 w-8 rounded object-contain" 
              fit="contain"
            />
            <span v-else class="text-g-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="row.is_default === 1"
              @change="(val: number) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="默认语言" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.is_default === 1" type="success">默认</el-tag>
            <el-button v-else size="small" @click="handleSetDefault(row)" :disabled="row.status !== 1">
              设为默认
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" align="center">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.sort" 
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
            >编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              plain
              :disabled="row.is_default === 1"
              @click="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加语言' : '编辑语言'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="语言代码" prop="code">
          <el-input 
            v-model="form.code" 
            placeholder="如: zh-CN, en-US" 
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="语言名称" prop="name">
          <el-input v-model="form.name" placeholder="如: 简体中文, English" />
        </el-form-item>
        <el-form-item label="原生名称" prop="native_name">
          <el-input v-model="form.native_name" placeholder="如: 简体中文, English" />
        </el-form-item>
        <el-form-item label="简称" prop="short_name">
          <el-input v-model="form.short_name" placeholder="如: 中, EN" maxlength="10" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <div class="w-full">
            <div class="flex gap-2 mb-2">
              <el-input v-model="form.icon" placeholder="图标URL" class="flex-1" />
              <el-button type="primary" @click="triggerUpload">上传</el-button>
            </div>
            <div v-if="form.icon" class="h-16 w-16 bg-g-50 rounded flex items-center justify-center border">
              <img :src="form.icon" class="h-full object-contain" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <input type="file" ref="fileInputRef" style="display: none" accept="image/*" @change="handleFileChange" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import request from '@/utils/http'
import { uploadImage } from '@/api/common'

interface Language {
  id: number
  code: string
  name: string
  native_name: string
  short_name: string
  icon: string
  sort: number
  status: number
  is_default: number
}

interface ApiResponse<T = any> {
  list: T[]
  total: number
}

const loading = ref(false)
const tableData = ref<Language[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const fileInputRef = ref<HTMLInputElement>()

const form = reactive({
  id: 0,
  code: '',
  name: '',
  native_name: '',
  short_name: '',
  icon: '',
  sort: 0,
  status: 1
})

const rules = {
  code: [{ required: true, message: '请输入语言代码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入语言名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get<ApiResponse<Language>>({ url: '/app/admin/api/language/list' })
    tableData.value = res.list || []
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async (row: Language, val: number) => {
  try {
    await request.post({ url: '/app/admin/api/language/set-status', data: { id: row.id, status: val } })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = val === 1 ? 0 : 1
  }
}

const handleSetDefault = async (row: Language) => {
  try {
    await request.post({ url: '/app/admin/api/language/set-default', data: { id: row.id } })
    ElMessage.success('设置成功')
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSortChange = async (row: Language) => {
  try {
    await request.post({ url: '/app/admin/api/language/update-sort', data: { id: row.id, sort: row.sort } })
    ElMessage.success('排序更新成功')
  } catch (error) {
    loadData()
  }
}

const resetForm = () => {
  form.id = 0
  form.code = ''
  form.name = ''
  form.native_name = ''
  form.short_name = ''
  form.icon = ''
  form.sort = 0
  form.status = 1
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Language) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.code = row.code
  form.name = row.name
  form.native_name = row.native_name || ''
  form.short_name = row.short_name || ''
  form.icon = row.icon || ''
  form.sort = row.sort || 0
  form.status = row.status
  dialogVisible.value = true
}

const handleDelete = (row: Language) => {
  ElMessageBox.confirm('确定要删除该语言吗？', '提示', { type: 'warning' }).then(async () => {
    await request.post({ url: '/app/admin/api/language/delete', data: { id: row.id } })
    ElMessage.success('删除成功')
    loadData()
  })
}

const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  try {
    ElMessage.info('上传中...')
    const res = await uploadImage(files[0])
    form.icon = res.url
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        await request.post({ url: '/app/admin/api/language/save', data: form })
        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
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
