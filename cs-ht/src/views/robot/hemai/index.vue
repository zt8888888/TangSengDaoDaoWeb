<template>
  <div class="robot-hemai-page art-full-height">
    <ElCard class="art-table-card" shadow="never">
      
      <div class="search-form-container" id="art-table-header">
        <ElForm :model="searchParams" inline class="search-form">
          <ElFormItem label="是否机器人">
            <ElSelect v-model="searchParams.isnb" style="width: 100px">
              <ElOption label="全部" :value="999" />
              <ElOption label="是" :value="1" />
              <ElOption label="否" :value="0" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="彩种">
            <ElSelect v-model="searchParams.cpname" style="width: 150px" clearable placeholder="全部">
              <ElOption label="全部" value="" />
              <ElOption
                v-for="item in lotteryList"
                :key="item.name"
                :label="item.title"
                :value="item.name"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="期号">
            <ElInput v-model="searchParams.qihao" placeholder="输入期号" style="width: 150px" />
          </ElFormItem>

          <ElFormItem label="单号">
            <ElInput v-model="searchParams.trano" placeholder="输入单号" style="width: 180px" />
          </ElFormItem>

          <ElFormItem label="时间">
            <ElDatePicker
              v-model="searchParams.sDate"
              type="date"
              placeholder="开始时间"
              value-format="YYYYMMDD"
              style="width: 140px"
            />
            <span class="mx-2">-</span>
            <ElDatePicker
              v-model="searchParams.eDate"
              type="date"
              placeholder="结束时间"
              value-format="YYYYMMDD"
              style="width: 140px"
            />
          </ElFormItem>

          <ElFormItem label="用户名">
            <ElInput v-model="searchParams.username" placeholder="输入用户名" style="width: 120px" />
          </ElFormItem>

          <ElFormItem label="状态">
            <ElSelect v-model="searchParams.status" style="width: 100px">
              <ElOption label="全部" :value="999" />
              <ElOption label="未开奖" :value="0" />
              <ElOption label="中奖" :value="1" />
              <ElOption label="未中奖" :value="-1" />
              <ElOption label="撤单" :value="-2" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="排序">
            <ElSelect v-model="searchParams.listorder" style="width: 120px">
              <ElOption label="默认" :value="0" />
              <ElOption label="时间大到小" :value="1" />
              <ElOption label="时间小到大" :value="2" />
              <ElOption label="金额大到小" :value="3" />
              <ElOption label="金额小到大" :value="4" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem>
            <ElButton type="primary" @click="refreshData">
              <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
              搜索
            </ElButton>
            <ElButton @click="resetSearch">
              <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
              重置
            </ElButton>
          </ElFormItem>
        </ElForm>
      </div>

      
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    
    <HeMaiDetailDialog
      v-model="detailVisible"
      :detail="currentDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import { useTable } from '@/hooks/core/useTable'
import { fetchHeMaiList, HeMaiItem } from '@/api/robot-hemai'
import { fetchGetActiveLotteryList } from '@/api/lottery'
import { ElButton, ElTag } from 'element-plus'
import HeMaiDetailDialog from './modules/HeMaiDetailDialog.vue'

defineOptions({ name: 'RobotHeMai' })

const searchParams = reactive({
  page: 1,
  limit: 20,
  isnb: 999,
  cpname: '',
  qihao: '',
  trano: '',
  sDate: '',
  eDate: '',
  username: '',
  status: 999,
  listorder: 0
})

const lotteryList = ref<any[]>([])
const detailVisible = ref(false)
const currentDetail = ref<HeMaiItem>({} as HeMaiItem)

const loadLotteryList = async () => {
  try {
    const res = await fetchGetActiveLotteryList()

    if (Array.isArray(res)) {
      lotteryList.value = res
    } else if (res && res.list) {
      lotteryList.value = res.list
    }
  } catch (e) {
    console.error(e)
  }
}

const {
  columns,
  data,
  loading,
  pagination,
  refreshData,
  handleSizeChange,
  handleCurrentChange
} = useTable({
  core: {
    apiFn: fetchHeMaiList,
    apiParams: searchParams,
    paginationKey: {
      current: 'page',
      size: 'limit'
    },
    columnsFactory: () => [
      { prop: 'trano', label: '单号', width: 180, align: 'center', fixed: 'left' },
      { prop: 'username', label: '用户名', width: 120, align: 'center' },
      { prop: 'cptitle', label: '彩票名称', width: 120, align: 'center' },
      { prop: 'expect', label: '期号', width: 150, align: 'center' },
      { prop: 'playtitle', label: '玩法', width: 120, align: 'center' },
      { prop: 'itemcount', label: '注数', width: 80, align: 'center' },
      { prop: 'mode', label: '奖金/赔率', width: 100, align: 'center' },
      { prop: 'amount', label: '金额', width: 100, align: 'center' },
      { prop: 'amountafter', label: '投注后金额', width: 120, align: 'center' },
      { prop: 'okamount', label: '中奖金额', width: 100, align: 'center' },
      { prop: 'okcount', label: '中奖注数', width: 80, align: 'center' },
      { prop: 'beishu', label: '中奖倍数', width: 80, align: 'center' },
      { prop: 'yjf', label: '元/角/分', width: 100, align: 'center' },
      {
        prop: 'tzcode',
        label: '号码',
        width: 120,
        align: 'center',
        formatter: (row: HeMaiItem) => {
          const code = row.tzcode || ''
          if (code.length <= 20) {
            return h('span', { class: 'text-primary cursor-pointer', onClick: () => handleDetail(row) }, code)
          }
          return h('u', { class: 'text-primary cursor-pointer', onClick: () => handleDetail(row) }, '查看')
        }
      },
      { prop: 'opencode', label: '开奖号', width: 120, align: 'center', formatter: (row: HeMaiItem) => row.opencode || '-' },
      { prop: 'type', label: '类型', width: 80, align: 'center' },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        align: 'center',
        formatter: (row: HeMaiItem) => {

          const raw = Number(row.status_raw)
          let color = '#333'
          if (raw === 1) color = 'green'
          else if (raw === -1) color = 'red'
          else if (raw === -2) color = '#666'

          return h('span', { style: { color } }, row.status)
        }
      },
      { prop: 'oddtime', label: '投注时间', width: 160, align: 'center' },
      {
        prop: 'action',
        label: '操作',
        width: 80,
        fixed: 'right',
        align: 'center',
        formatter: (row: HeMaiItem) =>
          h(
            ElButton,
            {
              size: 'small',
              onClick: () => handleDetail(row)
            },
            () => '详情'
          )
      }
    ]
  }
})

onMounted(() => {
  loadLotteryList()
  refreshData()
})

const resetSearch = () => {
  Object.assign(searchParams, {
    isnb: 999,
    cpname: '',
    qihao: '',
    trano: '',
    sDate: '',
    eDate: '',
    username: '',
    status: 999,
    listorder: 0
  })
  refreshData()
}

const handleDetail = (row: HeMaiItem) => {
  currentDetail.value = row
  detailVisible.value = true
}
</script>

<style scoped>
.search-form-container {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}
.mx-2 {
  margin: 0 0.5rem;
}
</style>
