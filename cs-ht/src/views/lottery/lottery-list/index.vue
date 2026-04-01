<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchGetLotteryList,
  fetchSetLotteryStatus,
  fetchDeleteLottery
} from '@/api/lottery'
import EditLottery from './components/EditLottery.vue'


interface LotteryItem {
  id: number
  name: string
  title: string
  typeid: string
  typeid_name?: string
  ftitle: string
  expecttime: number
  ftime: number
  qishu: number
  issys: number
  issd: number
  closetime1: string
  closetime2: string
  isopen: number
  iswh: number
  sort: number
  lotterytype: number
  periods?: number
}

const loading = ref(false)
const tableData = ref<LotteryItem[]>([])
const total = ref(0)

const queryParams = reactive({
  current: 1,
  size: 20,
  typeid: '',
  status: '',
  lotterytype: '',
  keyword: ''
})


const stats = reactive({
  total: 0,
  active: 0,
  maintenance: 0,
  disabled: 0
})


const editVisible = ref(false)
const currentLotteryId = ref(0)


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

const statusOptions = [
  { label: '启用', value: '1' },
  { label: '禁用', value: '0' }
]

const typeOptions = [
  { label: '系统彩', value: '1' },
  { label: '第三方', value: '2' }
]

onMounted(() => {
  fetchData()
})

async function fetchData() {
  loading.value = true
  console.log('[LotteryList] 开始请求, 参数:', JSON.stringify(queryParams))
  try {
    const res = await fetchGetLotteryList(queryParams)
    console.log('[LotteryList] 请求成功, 响应:', res)
    tableData.value = (res.list || []) as unknown as LotteryItem[]
    total.value = res.total || 0


    if (res.stats) {
      stats.total = res.stats.total || 0
      stats.active = res.stats.active || 0
      stats.maintenance = res.stats.maintenance || 0
      stats.disabled = res.stats.disabled || 0
    } else {
      stats.total = res.total || 0
    }
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
  queryParams.status = ''
  queryParams.lotterytype = ''
  queryParams.keyword = ''
  handleSearch()
}

function handleEdit(row: LotteryItem) {
  currentLotteryId.value = row.id
  editVisible.value = true
}

function handleAdd() {
  currentLotteryId.value = 0
  editVisible.value = true
}

async function handleStatusChange(row: LotteryItem, field: string, value: any) {
  try {
    await fetchSetLotteryStatus({ id: row.id, field, value })
    ElMessage.success('操作成功')

    if (field === 'isopen') row.isopen = value
    if (field === 'iswh') row.iswh = value
  } catch (error) {

    ;(row as any)[field] = value === 1 ? 0 : 1
    console.error(error)
  }
}

function handleDelete(row: LotteryItem) {
  ElMessageBox.confirm(`确定删除彩种【${row.title}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await fetchDeleteLottery(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
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
    
    <el-row :gutter="20" class="mb-4">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>全部彩种</span>
              <el-tag type="info">Total</el-tag>
            </div>
          </template>
          <div class="card-value">{{ stats.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>已启用</span>
              <el-tag type="success">Active</el-tag>
            </div>
          </template>
          <div class="card-value">{{ stats.active }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>维护中</span>
              <el-tag type="warning">Maintenance</el-tag>
            </div>
          </template>
          <div class="card-value">{{ stats.maintenance }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>已停用</span>
              <el-tag type="danger">Disabled</el-tag>
            </div>
          </template>
          <div class="card-value">{{ stats.disabled }}</div>
        </el-card>
      </el-col>
    </el-row>

    
    <el-card class="mb-4">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="彩种分类">
          <el-select v-model="queryParams.typeid" placeholder="全部分类" clearable style="width: 140px">
            <el-option
              v-for="item in lotteryTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="彩种类型">
          <el-select v-model="queryParams.lotterytype" placeholder="全部类型" clearable style="width: 120px">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input v-model="queryParams.keyword" placeholder="彩种名称/标识" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <span class="i-ri:search-line mr-1"></span> 查询
          </el-button>
          <el-button @click="handleReset">
            <span class="i-ri:refresh-line mr-1"></span> 重置
          </el-button>
          <el-button type="success" @click="handleAdd">
            <span class="i-ri:add-line mr-1"></span> 新增彩种
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card>
      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="typeid" label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag>{{ formatType(row.typeid) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="彩种名称" min-width="120" align="center" />
        <el-table-column prop="name" label="标识" width="120" align="center" />
        <el-table-column prop="ftime" label="停投间隔" width="100" align="center">
          <template #default="{ row }">
            {{ row.ftime }}秒
          </template>
        </el-table-column>
        <el-table-column prop="ftitle" label="简介" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="lotterytype" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.lotterytype == 1 ? 'primary' : 'warning'">
              {{ row.lotterytype == 1 ? '系统彩' : '第三方' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qishu" label="期数" width="80" align="center" />
        <el-table-column prop="iswh" label="维护" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.iswh"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              active-text="维护"
              inactive-text="正常"
              @change="(val) => handleStatusChange(row, 'iswh', val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="isopen" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isopen"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              @change="(val) => handleStatusChange(row, 'isopen', val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="info" size="small" @click="$router.push(`/lottery/play-list?typeid=${row.typeid}`)">
                玩法
              </el-button>
              <el-button type="warning" size="small" @click="$router.push(`/lottery/result-list?name=${row.name}`)">
                开奖
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
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

    
    <EditLottery
      v-model="editVisible"
      :lottery-id="currentLotteryId"
      @success="onEditSuccess"
    />
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
</style>
