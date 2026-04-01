<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh, Delete, Edit } from '@element-plus/icons-vue'
import {
  fetchGetActiveLotteryList,
  fetchGetResultList,
  fetchAddResult,
  fetchEditResult,
  fetchDeleteResult,
  fetchResetResult
} from '@/api/lottery'

defineOptions({
  name: 'ResultList'
})

const loading = ref(false)
const lotteryList = ref<any[]>([])
const tableData = ref<any[]>([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  limit: 20,
  lottery_id: '',
  expect: ''
})


const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref()
const formData = reactive({
  id: 0,
  lottery_id: '',
  expect: '',
  opencode: '',
  opentime: ''
})

const formRules = {
  lottery_id: [{ required: true, message: '请选择彩种', trigger: 'change' }],
  expect: [{ required: true, message: '请输入期号', trigger: 'blur' }],
  opencode: [{ required: true, message: '请输入开奖号码', trigger: 'blur' }],
  opentime: [{ required: true, message: '请选择开奖时间', trigger: 'change' }]
}


const getLotteryList = async () => {
  try {
    const res = await fetchGetActiveLotteryList()

    if (Array.isArray(res)) {
      lotteryList.value = res
    } else if (res.data && Array.isArray(res.data)) {
      lotteryList.value = res.data
    } else if (res.data) {
        lotteryList.value = Object.values(res.data)
    }
  } catch (error) {
    console.error(error)
  }
}


const getList = async () => {
  loading.value = true
  try {

    const params: Record<string, any> = { ...queryParams }
    if (!params.lottery_id) delete params.lottery_id
    if (!params.expect) delete params.expect

    const res: any = await fetchGetResultList(params)



    if (Array.isArray(res)) {
       tableData.value = res
       total.value = res.length
    } else if (res && Array.isArray(res.list)) {
       tableData.value = res.list
       total.value = res.total || res.list.length || 0
    } else if (res && Array.isArray(res.data)) {
       tableData.value = res.data
       total.value = res.total || 0
    } else {

       tableData.value = []
       total.value = 0
    }
  } catch (error) {
    console.error(error)

  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  getList()
}

const handleResetQuery = () => {
  queryParams.lottery_id = ''
  queryParams.expect = ''
  handleSearch()
}

const handleAdd = () => {
  dialogType.value = 'add'
  formData.id = 0
  formData.lottery_id = ''
  formData.expect = ''
  formData.opencode = ''
  formData.opentime = ''
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'

  formData.id = row.id
  formData.lottery_id = row.lottery_id
  formData.expect = row.expect
  formData.opencode = row.opencode
  formData.opentime = row.opentime
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const api = dialogType.value === 'add' ? fetchAddResult : fetchEditResult
        await api(formData)

        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
        dialogVisible.value = false
        getList()
      } catch (error) {
        console.error(error)
      }
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除该开奖记录吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await fetchDeleteResult({ id: row.id })
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error(error)
    }
  })
}

const handleResetResult = (row: any) => {
  ElMessageBox.confirm('重置开奖将对未开奖的投注重新开奖，确定吗？', '警告', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await fetchResetResult({ id: row.id })
      ElMessage.success('重置成功')
      getList()
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  getLotteryList()
  getList()
})
</script>

<template>
  <div class="p-4">
    
    <el-card shadow="hover" class="mb-4">
      <el-form :inline="true" :model="queryParams" class="flex flex-wrap gap-2">
        <el-form-item label="彩种">
          <el-select v-model="queryParams.lottery_id" placeholder="全部彩种" clearable class="!w-48" @change="handleSearch">
            <el-option v-for="item in lotteryList" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="期号">
          <el-input v-model="queryParams.expect" placeholder="输入期号" clearable class="!w-48" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleResetQuery">重置</el-button>
          <el-button type="primary" plain :icon="Plus" @click="handleAdd">添加开奖</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card shadow="hover">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="lottery_name" label="彩种" width="150" align="center" />
        <el-table-column prop="expect" label="期号" width="150" align="center" />
        <el-table-column prop="opencode" label="开奖号码" min-width="280" align="center" />
        <el-table-column prop="opentime" label="开奖时间" width="180" align="center" />
        <el-table-column prop="source_text" label="来源" width="100" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" :icon="Refresh" @click="handleResetResult(row)">重置</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @change="getList"
          @size-change="getList"
        />
      </div>
    </el-card>

    
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加开奖' : '编辑开奖'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="彩种" prop="lottery_id">
          <el-select 
            v-model="formData.lottery_id" 
            placeholder="请选择彩种" 
            style="width: 100%" 
            :disabled="dialogType === 'edit'"
            filterable
          >
            <el-option v-for="item in lotteryList" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="期号" prop="expect">
          <el-input v-model="formData.expect" placeholder="请输入期号" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="开奖号码" prop="opencode">
          <el-input v-model="formData.opencode" placeholder="请输入开奖号码" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="开奖时间" prop="opentime">
          <el-date-picker
            v-model="formData.opentime"
            type="datetime"
            placeholder="选择开奖时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
</style>
