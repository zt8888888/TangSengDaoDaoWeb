<template>
  <div class="rebate-report">
    
    <el-card class="mb-4">
      <el-form inline>
        <el-form-item label="统计周期">
          <el-select v-model="days" @change="loadData">
            <el-option label="近7天" :value="7" />
            <el-option label="近15天" :value="15" />
            <el-option label="近30天" :value="30" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData" :loading="loading">刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card class="mb-4">
      <template #header>
        <span>反水发放趋势</span>
      </template>
      <div ref="trendChartRef" style="height: 300px;"></div>
    </el-card>

    <el-row :gutter="16">
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>按类型分布</span>
          </template>
          <div ref="categoryChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>按VIP等级分布</span>
          </template>
          <div ref="vipChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    
    <el-card class="mt-4">
      <template #header>
        <span>每日明细</span>
      </template>
      <el-table :data="trendData" border>
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="count" label="笔数" width="100" align="center" />
        <el-table-column prop="amount" label="发放金额" align="right">
          <template #default="{ row }">
            ¥{{ row.amount?.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchRebateReport, type RebateReportData } from '@/api/rebate'
import * as echarts from 'echarts'

const loading = ref(false)
const days = ref(7)
const trendData = ref<{ date: string; count: number; amount: number }[]>([])

const trendChartRef = ref<HTMLElement | null>(null)
const categoryChartRef = ref<HTMLElement | null>(null)
const vipChartRef = ref<HTMLElement | null>(null)

let trendChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let vipChart: echarts.ECharts | null = null

const loadData = async () => {
  loading.value = true
  try {
    const data = await fetchRebateReport(days.value)

    if (data) {
      trendData.value = data.trend || []
      renderTrendChart(data.trend || [])
      renderCategoryChart(data.byCategory || [])
      renderVipChart(data.byVip || [])
    }
  } catch (e) {
    ElMessage.error('加载报表失败')
  } finally {
    loading.value = false
  }
}

const renderTrendChart = (data: { date: string; amount: number; count: number }[]) => {
  if (!trendChartRef.value) return

  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['发放金额', '笔数']
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date)
    },
    yAxis: [
      { type: 'value', name: '金额(元)' },
      { type: 'value', name: '笔数' }
    ],
    series: [
      {
        name: '发放金额',
        type: 'bar',
        data: data.map(d => d.amount),
        itemStyle: { color: '#409eff' }
      },
      {
        name: '笔数',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(d => d.count),
        itemStyle: { color: '#67c23a' }
      }
    ]
  })
}

const renderCategoryChart = (data: { category: string; total: number }[]) => {
  if (!categoryChartRef.value) return

  if (!categoryChart) {
    categoryChart = echarts.init(categoryChartRef.value)
  }

  const categoryNames: Record<string, string> = {
    'daily': '每日反水',
    'realperson': '真人',
    'fish': '捕鱼',
    'electron': '电子',
    'lottery': '彩票',
    'sport': '体育',
    'chess': '棋牌',
    'esport': '电竞'
  }

  categoryChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: data.map(d => ({
          name: categoryNames[d.category] || d.category,
          value: parseFloat(d.total as any) || 0
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

const renderVipChart = (data: { groupname: string; total: number; cnt: number }[]) => {
  if (!vipChartRef.value) return

  if (!vipChart) {
    vipChart = echarts.init(vipChartRef.value)
  }

  vipChart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0]
        return `${p.name}<br/>金额: ¥${p.value}<br/>笔数: ${data[p.dataIndex]?.cnt || 0}`
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.groupname)
    },
    yAxis: {
      type: 'value',
      name: '金额(元)'
    },
    series: [
      {
        type: 'bar',
        data: data.map(d => parseFloat(d.total as any) || 0),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  })
}

const handleResize = () => {
  trendChart?.resize()
  categoryChart?.resize()
  vipChart?.resize()
}

onMounted(async () => {
  await nextTick()
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  categoryChart?.dispose()
  vipChart?.dispose()
})
</script>

<style scoped>
.rebate-report {
  padding: 0;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
