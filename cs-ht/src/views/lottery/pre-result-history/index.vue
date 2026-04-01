<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import { fetchGetActiveLotteryList, fetchGetPreResultHistory } from '@/api/lottery'

defineOptions({
  name: 'PreResultHistory'
})

const router = useRouter()
const loading = ref(false)
const currentLottery = ref('')
const lotteryList = ref<any[]>([])
const tableData = ref<any[]>([])
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})


const getLotteryList = async () => {
  try {
    const res = await fetchGetActiveLotteryList()
    if (Array.isArray(res)) {
       lotteryList.value = res.filter((item: any) => item.issys == 1)
    } else if (res.data) {
       lotteryList.value = (res.data || []).filter((item: any) => item.issys == 1)
    }


    if (lotteryList.value.length > 0) {
      currentLottery.value = lotteryList.value[0].name
      loadData()
    }
  } catch (error) {
    console.error(error)
  }
}


const loadData = async () => {
  if (!currentLottery.value) return

  loading.value = true
  try {
    const params = {
      page: pagination.value.current,
      limit: pagination.value.pageSize,
      lottery_name: currentLottery.value
    }
    const res = await fetchGetPreResultHistory(params)


    if (Array.isArray(res)) {
      tableData.value = res
      pagination.value.total = res.length
    }

    else if (res && res.list) {
      tableData.value = res.list
      pagination.value.total = res.total || res.list.length || 0
    }

    else if (res && res.code === 0) {
      const list = Array.isArray(res.data) ? res.data : (res.data?.list || [])
      tableData.value = list
      pagination.value.total = res.data?.total || list.length || 0
    } else {

      ElMessage.error(res.msg || '获取历史记录失败')
    }
  } catch (error) {
    console.error(error)

  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  loadData()
}

const handlePageChange = (val: number) => {
  pagination.value.current = val
  loadData()
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  getLotteryList()
})
</script>

<template>
  <div class="p-4 flex flex-col gap-4">
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center gap-2">
          <el-button link @click="goBack">
            <el-icon><Back /></el-icon>
            返回
          </el-button>
          <span class="font-medium">预开奖修改历史</span>
        </div>
      </template>

      <div class="mb-4 flex items-center gap-4">
        <span class="text-gray-600">彩种筛选:</span>
        <el-select
          v-model="currentLottery"
          placeholder="请选择彩种"
          class="!w-52"
          filterable
          @change="handleSearch"
        >
          <el-option
            v-for="item in lotteryList"
            :key="item.name"
            :label="item.title"
            :value="item.name"
          />
        </el-select>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="lottery_title" label="彩种名称" width="150" align="center">
           <template #default="{ row }">
              {{ row.lottery_title || row.name }}
           </template>
        </el-table-column>
        <el-table-column prop="expect" label="期号" width="150" align="center" />
        <el-table-column prop="opencode" label="开奖号码" min-width="200" align="center" />
        <el-table-column prop="opentime" label="开奖时间" width="180" align="center" />
        <el-table-column prop="admin" label="操作人" width="120" align="center" />
        <el-table-column prop="create_time" label="操作时间" width="180" align="center" />
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          layout="total, prev, pager, next"
          :total="pagination.total"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>