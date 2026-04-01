<template>
  <div class="p-4">
    <div class="mb-4 bg-box p-4 rounded-lg shadow-sm">
      <div class="flex justify-between items-center">
        <el-button type="primary" @click="handleAdd">
          <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
          添加弹窗标签
        </el-button>
        <el-button @click="loadData">
          <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
          刷新
        </el-button>
      </div>
    </div>

    <div class="bg-box p-4 rounded-lg shadow-sm">
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标签标题" min-width="120" align="center" />
        <el-table-column label="图片" width="120" align="center">
          <template #default="{ row }">
            <el-image v-if="row.image" :src="row.image" :preview-src-list="[row.image]" fit="cover" style="width: 80px; height: 60px;" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="跳转类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.jump_type === 'none'" type="info">不跳转</el-tag>
            <el-tag v-else-if="row.jump_type === 'url'" type="primary">外部链接</el-tag>
            <el-tag v-else-if="row.jump_type === 'route'" type="success">内部路由</el-tag>
            <el-tag v-else-if="row.jump_type === 'activity'" type="warning">活动页</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="jump_url" label="跳转地址" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="(val) => handleStateChange(row, val as number)" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit" :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '添加弹窗标签' : '编辑弹窗标签'" width="550px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="标签标题" prop="title">
          <el-input v-model="form.title" placeholder="如: 长期活动、通道公告" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <div class="w-full">
            <div class="flex gap-2 mb-2">
              <el-input v-model="form.image" placeholder="图片地址" class="flex-1" />
              <el-button type="primary" @click="triggerUpload">
                <ArtSvgIcon icon="ri:upload-line" class="mr-1" />上传
              </el-button>
            </div>
            <div v-if="form.image" class="h-40 w-full bg-gray-50 rounded flex items-center justify-center border border-gray-300 overflow-hidden">
              <img :src="form.image" class="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="跳转类型" prop="jump_type">
          <el-radio-group v-model="form.jump_type">
            <el-radio label="none">不跳转</el-radio>
            <el-radio label="url">外部链接</el-radio>
            <el-radio label="route">内部路由</el-radio>
            <el-radio label="activity">活动页</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.jump_type === 'url' || form.jump_type === 'route'" label="跳转地址" prop="jump_url">
          <el-input v-model="form.jump_url" :placeholder="form.jump_type === 'url' ? 'https://example.com' : '/activity'" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
          <span class="ml-2 text-gray-400">数值越大越靠前</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
import { fetchActivityPopupList, createActivityPopup, updateActivityPopup, deleteActivityPopup, setActivityPopupState, type ActivityPopup } from '@/api/activity-popup'
import { uploadImage } from '@/api/common'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

const loading = ref(false)
const tableData = ref<ActivityPopup[]>([])
const pagination = reactive({ page: 1, limit: 20, total: 0 })

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const fileInputRef = ref<HTMLInputElement>()

const form = reactive({
  id: 0,
  title: '',
  image: '',
  jump_type: 'none' as 'none' | 'url' | 'route' | 'activity',
  jump_url: '',
  sort: 0,
  status: 1
})

const rules = {
  title: [{ required: true, message: '请输入标签标题', trigger: 'blur' }],
  image: [{ required: true, message: '请上传图片', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchActivityPopupList({ page: pagination.page, limit: pagination.limit })
    tableData.value = res.data || []
    pagination.total = res.count || 0
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => { pagination.limit = val; loadData() }
const handleCurrentChange = (val: number) => { pagination.page = val; loadData() }

const handleStateChange = async (row: ActivityPopup, val: number) => {
  try {
    await setActivityPopupState(row.id, val)
    ElMessage.success('状态更新成功')
  } catch {
    row.status = val === 1 ? 0 : 1
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.id = 0
  form.title = ''
  form.image = ''
  form.jump_type = 'none'
  form.jump_url = ''
  form.sort = 0
  form.status = 1
  dialogVisible.value = true
}

const handleEdit = (row: ActivityPopup) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.title = row.title
  form.image = row.image
  form.jump_type = row.jump_type
  form.jump_url = row.jump_url
  form.sort = row.sort
  form.status = row.status
  dialogVisible.value = true
}

const triggerUpload = () => { fileInputRef.value?.click() }

const handleFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  try {
    ElMessage.info('上传中...')
    const res = await uploadImage(files[0])
    form.image = res.url
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const handleDelete = (row: ActivityPopup) => {
  ElMessageBox.confirm(`确定要删除 "${row.title}" 吗？`, '提示', { type: 'warning' }).then(async () => {
    await deleteActivityPopup(row.id)
    ElMessage.success('删除成功')
    loadData()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (dialogType.value === 'add') {
          await createActivityPopup(form)
          ElMessage.success('添加成功')
        } else {
          await updateActivityPopup(form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        loadData()
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => { loadData() })
</script>

