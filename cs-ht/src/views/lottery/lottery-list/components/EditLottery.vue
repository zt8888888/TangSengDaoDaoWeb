<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fetchSaveLottery, fetchGetLotteryDetail } from '@/api/lottery'
import { uploadImage } from '@/api/common'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  lotteryId: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const formRef = ref()

const form = reactive({
  id: 0,
  title: '',
  name: '',
  typeid: '',
  icon: '',
  ftitle: '',
  expecttime: 0,
  ftime: 0,
  qishu: 0,
  issys: 1,
  issd: 0,
  is_hot: 0,
  closetime1: '',
  closetime2: '',
  sort: 0,
  isopen: 1
})

const handleUpload = async (file: File) => {
  try {
    const res = await uploadImage(file)
    if (res.url) {
      form.icon = res.url
      ElMessage.success('上传成功')
    }
  } catch (e) {
    ElMessage.error('上传失败')
  }
  return false
}

const rules = {
  title: [{ required: true, message: '请输入彩种名称', trigger: 'blur' }],
  name: [{ required: true, message: '请输入彩种代码', trigger: 'blur' }],
  typeid: [{ required: true, message: '请选择或输入所属分类', trigger: 'change' }],
  expecttime: [{ required: true, message: '请输入开奖间隔', trigger: 'blur' }],
  ftime: [{ required: true, message: '请输入封盘时间', trigger: 'blur' }]
}


const lotteryTypes = [
  { label: '时时彩', value: 'ssc' },
  { label: '快三', value: 'k3' },
  { label: '11选5', value: 'x5' },
  { label: '快乐彩', value: 'keno' },
  { label: '幸运28', value: 'xy28' },
  { label: 'PK10', value: 'pk10' },
  { label: '动物彩', value: 'dwc' },
  { label: '低频彩', value: 'dpc' },
  { label: '六合彩', value: 'lhc' }
]

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.lotteryId) {
      loadData()
    } else if (val) {

      resetForm()
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

async function loadData() {
  loading.value = true
  try {
    const res = await fetchGetLotteryDetail(props.lotteryId)
    if (res) {
      Object.assign(form, res)
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  if (formRef.value) {
    formRef.value.resetFields()
  }

  form.id = 0
  form.icon = ''
  form.issys = 1
  form.issd = 0
  form.is_hot = 0
  form.isopen = 1
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        await fetchSaveLottery(form)
        ElMessage.success('保存成功')
        visible.value = false
        emit('success')
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="form.id ? '编辑彩种' : '新增彩种'"
    width="600px"
    append-to-body
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="彩种名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入彩种名称" />
      </el-form-item>

      <el-form-item label="彩种代码" prop="name">
        <el-input v-model="form.name" placeholder="如: dwc1, pk101" :disabled="!!form.id" />
        <span v-if="!form.id" class="text-gray-400 text-xs">新增后不可修改</span>
      </el-form-item>

      <el-form-item label="所属分类" prop="typeid">
        <el-select v-model="form.typeid" placeholder="选择或输入分类" style="width: 100%" filterable allow-create default-first-option>
          <el-option
            v-for="item in lotteryTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span class="text-gray-400 text-xs">可自定义输入新分类，如: dwc</span>
      </el-form-item>

      <el-form-item label="彩种简介" prop="ftitle">
        <el-input
          v-model="form.ftitle"
          type="textarea"
          :rows="3"
          placeholder="请输入彩种简介"
        />
      </el-form-item>

      <el-form-item label="彩种图标">
        <div class="icon-upload-row">
          <el-upload
            class="icon-uploader"
            :show-file-list="false"
            :before-upload="handleUpload"
            accept="image/*"
          >
            <img v-if="form.icon" :src="form.icon" class="icon-preview" />
            <el-icon v-else class="icon-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <el-input v-model="form.icon" placeholder="或输入图标URL" style="flex:1; margin-left: 12px;" />
        </div>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开奖间隔" prop="expecttime">
            <el-input-number v-model="form.expecttime" :min="0" style="width: 100%" />
            <span class="text-gray-400 text-xs ml-2">分钟</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="封盘时间" prop="ftime">
            <el-input-number v-model="form.ftime" :min="0" style="width: 100%" />
            <span class="text-gray-400 text-xs ml-2">秒</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="每日期数" prop="qishu">
            <el-input-number v-model="form.qishu" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="数据来源">
            <el-switch
              v-model="form.issys"
              :active-value="1"
              :inactive-value="0"
              active-text="系统彩"
              inactive-text="第三方"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手动开奖">
            <el-switch
              v-model="form.issd"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="热门彩种">
            <el-switch
              v-model="form.is_hot"
              :active-value="1"
              :inactive-value="0"
              active-text="是"
              inactive-text="否"
            />
            <span class="text-gray-400 text-xs ml-2">开启后显示在首页热门彩种</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="休市时间1">
            <el-time-picker
              v-model="form.closetime1"
              value-format="HH:mm:ss"
              placeholder="开始时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="休市时间2">
            <el-time-picker
              v-model="form.closetime2"
              value-format="HH:mm:ss"
              placeholder="结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.icon-upload-row {
  display: flex;
  align-items: center;
}
.icon-uploader {
  width: 80px;
  height: 80px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.icon-uploader:hover {
  border-color: #409eff;
}
.icon-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.icon-preview {
  width: 80px;
  height: 80px;
  object-fit: contain;
}
</style>
