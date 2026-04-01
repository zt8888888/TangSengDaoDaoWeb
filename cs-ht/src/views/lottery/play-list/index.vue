<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { fetchGetPlayList, fetchSetPlayStatus, fetchSavePlay } from '@/api/lottery'
import EditPlay from './components/EditPlay.vue'

interface PlayItem {
  id: number
  typeid: string
  playid: string
  title: string
  rate: number
  maxprize: number
  totalzs: number
  minxf: number
  maxxf: number
  isopen: number
}

const route = useRoute()
const loading = ref(false)
const tableData = ref<PlayItem[]>([])
const total = ref(0)

const queryParams = reactive({
  current: 1,
  size: 20,
  typeid: '',
  isopen: '',
  keyword: ''
})


const editVisible = ref(false)
const currentPlayId = ref(0)


const lotteryTypes = [
  { label: '快三', value: 'k3' },
  { label: '时时彩', value: 'ssc' },
  { label: 'PK10', value: 'pk10' },
  { label: '快乐彩', value: 'keno' },
  { label: '11选5', value: 'x5' },
  { label: '低频彩', value: 'dpc' },
  { label: '六合彩', value: 'lhc' },
  { label: '幸运28', value: 'xy28' }
]

const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]

onMounted(() => {
  if (route.query.typeid) {
    queryParams.typeid = route.query.typeid as string
  }
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const res = await fetchGetPlayList(queryParams)
    tableData.value = (res.list || res.data || []) as unknown as PlayItem[]
    total.value = res.total || res.count || 0
  } catch (error) {
    console.error(error)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.current = 1
  fetchData()
}

function handleReset() {
  queryParams.typeid = ''
  queryParams.isopen = ''
  queryParams.keyword = ''
  handleSearch()
}

function handleEdit(row: PlayItem) {
  currentPlayId.value = row.id
  editVisible.value = true
}

async function handleStatusChange(row: PlayItem, value: number) {
  try {
    await fetchSetPlayStatus({ id: row.id, isopen: value })
    ElMessage.success('操作成功')
    row.isopen = value
  } catch (error) {
    row.isopen = value === 1 ? 0 : 1
    console.error(error)
  }
}

async function handleCellEdit(row: PlayItem, field: string, value: any) {
  try {
    await fetchSavePlay({ id: row.id, field, value })
    ElMessage.success('保存成功')
  } catch (error) {
    console.error(error)
    fetchData()
  }
}

function handleSizeChange(val: number) {
  queryParams.size = val
  fetchData()
}

function handleCurrentChange(val: number) {
  queryParams.current = val
  fetchData()
}

function onEditSuccess() {
  fetchData()
}

function formatType(typeid: string) {
  const find = lotteryTypes.find(item => item.value === typeid)
  return find ? find.label : typeid
}
</script>

<template>
  <div class="app-container">
    
    <el-card class="mb-4" shadow="hover">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="彩种分类">
          <el-select 
            v-model="queryParams.typeid" 
            placeholder="全部" 
            clearable 
            style="width: 160px"
            @change="handleSearch"
          >
            <el-option
              v-for="item in lotteryTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.isopen" placeholder="全部" clearable style="width: 120px" @change="handleSearch">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input 
            v-model="queryParams.keyword" 
            placeholder="玩法名称 / ID" 
            clearable 
            style="width: 220px"
            @keyup.enter="handleSearch" 
          >
            <template #prefix>
              <span class="i-ri:search-line text-gray-400"></span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <span class="i-ri:search-line mr-1"></span>查询
          </el-button>
          <el-button @click="handleReset">
            <span class="i-ri:refresh-line mr-1"></span>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card shadow="hover">
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="typeid" label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag effect="plain">{{ formatType(row.typeid) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="playid" label="玩法ID" width="100" align="center" />
        <el-table-column prop="title" label="玩法名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-medium text-gray-700">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rate" label="赔率" width="140" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.rate"
              :precision="4"
              :step="0.01"
              :min="0"
              size="small"
              controls-position="right"
              style="width: 110px"
              @change="(val) => handleCellEdit(row, 'rate', val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="maxprize" label="最高奖金" width="140" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.maxprize"
              :min="0"
              size="small"
              controls-position="right"
              style="width: 110px"
              @change="(val) => handleCellEdit(row, 'maxprize', val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="totalzs" label="总注数" width="100" align="center" />
        <el-table-column label="限额设置 (最小 - 最大)" width="240" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <el-input-number
                v-model="row.minxf"
                :min="0"
                size="small"
                :controls="false"
                placeholder="Min"
                style="width: 80px"
                @change="(val) => handleCellEdit(row, 'minxf', val)"
              />
              <span class="text-gray-400">-</span>
              <el-input-number
                v-model="row.maxxf"
                :min="0"
                size="small"
                :controls="false"
                placeholder="Max"
                style="width: 80px"
                @change="(val) => handleCellEdit(row, 'maxxf', val)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="isopen" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isopen"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              active-text="启"
              inactive-text="禁"
              style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              @change="(val) => handleStatusChange(row, val as number)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <span class="i-ri:edit-line mr-1"></span>编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    
    <EditPlay
      v-model="editVisible"
      :play-id="currentPlayId"
      @success="onEditSuccess"
    />
  </div>
</template>

<style scoped>
:deep(.el-input-number .el-input__wrapper) {
  padding-left: 8px;
  padding-right: 8px;
}
</style>
