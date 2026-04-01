<template>
  <div class="p-4 min-h-[calc(100vh-100px)] relative pb-20">
    
    <div class="bg-box rounded-lg shadow-sm p-4 mb-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-g-800">首页开奖配置</h2>
          <p class="text-sm text-g-500 mt-1">配置H5首页显示的彩种及顺序</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-g-500">最大显示数量：</span>
          <el-input-number 
            v-model="maxDisplay" 
            :min="1" 
            :max="20" 
            size="small"
            @change="handleMaxChange"
          />
        </div>
      </div>
    </div>

    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      
      <div class="bg-box rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-g-700 flex items-center gap-2">
            <i class="ri-list-check text-primary"></i>
            可选彩种
          </h3>
          <el-button type="primary" size="small" @click="selectAll" :disabled="loading">
            全选
          </el-button>
        </div>
        
        <div class="space-y-2 max-h-[500px] overflow-y-auto">
          <div 
            v-for="lottery in availableLotteries" 
            :key="lottery.name"
            class="flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:border-primary"
            :class="lottery.selected ? 'bg-primary/10 border-primary' : 'bg-g-50 border-full-d'"
            @click="toggleLottery(lottery)"
          >
            <div class="flex items-center gap-3">
              <el-checkbox 
                v-model="lottery.selected" 
                @click.stop
                @change="handleCheckChange(lottery)"
              />
              <div>
                <div class="font-medium text-g-800">{{ lottery.title }}</div>
                <div class="text-xs text-g-500">{{ lottery.name }} · {{ getTypeName(lottery.typeid) }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <el-tag 
                :type="lottery.isopen ? 'success' : 'info'" 
                size="small"
              >
                {{ lottery.isopen ? '已开启' : '已关闭' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      
      <div class="bg-box rounded-lg shadow-sm p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-g-700 flex items-center gap-2">
            <i class="ri-sort-asc text-warning"></i>
            已选彩种（拖拽排序）
          </h3>
          <el-button type="danger" size="small" plain @click="clearAll" :disabled="loading || selectedLotteries.length === 0">
            清空
          </el-button>
        </div>

        <div v-if="selectedLotteries.length === 0" class="text-center py-10 text-g-400">
          <i class="ri-inbox-line text-4xl"></i>
          <p class="mt-2">请从左侧选择要显示的彩种</p>
        </div>

        <VueDraggable 
          v-else
          v-model="selectedLotteries" 
          :animation="200"
          handle=".drag-handle"
          class="space-y-2"
          @end="handleDragEnd"
        >
          <div 
            v-for="(element, index) in selectedLotteries"
            :key="element.name"
            class="flex items-center justify-between p-3 rounded-lg bg-g-50 border border-full-d group hover:border-primary"
          >
              <div class="flex items-center gap-3">
                <div class="drag-handle cursor-move text-g-400 group-hover:text-primary">
                  <i class="ri-drag-move-2-line text-lg"></i>
                </div>
                <span class="w-6 h-6 flex items-center justify-center bg-primary text-white text-xs rounded-full font-bold">
                  {{ index + 1 }}
                </span>
                <div>
                  <div class="font-medium text-g-800">{{ element.title }}</div>
                  <div class="text-xs text-g-500">{{ element.name }}</div>
                </div>
              </div>
              <el-button 
                type="danger" 
                size="small" 
                circle 
                plain
                @click="removeLottery(element)"
              >
                <ArtSvgIcon icon="ri:close-line" />
              </el-button>
            </div>
        </VueDraggable>

        <div v-if="selectedLotteries.length > maxDisplay" class="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
          <p class="text-sm text-warning">
            <ArtSvgIcon icon="ri:alert-line" class="mr-1" />
            已选 {{ selectedLotteries.length }} 个，超过最大显示数量 {{ maxDisplay }}，仅显示前 {{ maxDisplay }} 个
          </p>
        </div>
      </div>
    </div>

    
    <div class="fixed bottom-0 left-0 right-0 bg-box border-t border-full-d p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-center gap-4 z-20 sm:absolute sm:left-0 sm:right-0 sm:bottom-0 sm:rounded-b-lg">
      <el-button @click="loadData" size="large" class="w-32" :loading="loading">重置</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving" size="large" class="w-32">保存配置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VueDraggable } from 'vue-draggable-plus'
import request from '@/utils/http'

interface Lottery {
  id: number
  name: string
  title: string
  typeid: string
  isopen: number
  sort: number
  selected: boolean
}

const loading = ref(false)
const saving = ref(false)
const maxDisplay = ref(8)
const lotteries = ref<Lottery[]>([])


const availableLotteries = computed(() => {
  return lotteries.value
})


const selectedLotteries = computed({
  get: () => lotteries.value.filter(l => l.selected),
  set: (val) => {

    const selectedNames = val.map(v => v.name)
    lotteries.value.forEach(l => {
      l.selected = selectedNames.includes(l.name)
    })
  }
})

const getTypeName = (typeid: string) => {
  const typeMap: Record<string, string> = {
    'ssc': '时时彩',
    'pk10': 'PK10',
    'k3': '快3',
    '11x5': '11选5',
    'lhc': '六合彩',
    'xy28': '幸运28',
    'kl8': '快乐8',
  }
  return typeMap[typeid] || typeid
}

const toggleLottery = (lottery: Lottery) => {
  lottery.selected = !lottery.selected
}

const handleCheckChange = (lottery: Lottery) => {

}

const selectAll = () => {
  lotteries.value.forEach(l => {
    if (l.isopen) {
      l.selected = true
    }
  })
}

const clearAll = () => {
  lotteries.value.forEach(l => {
    l.selected = false
  })
}

const removeLottery = (lottery: Lottery) => {
  lottery.selected = false
}

const handleMaxChange = () => {

}

const handleDragEnd = () => {

}

const loadData = async () => {
  loading.value = true
  try {
    const res = await request.get<{ config: any; lotteries: any[] }>({
      url: '/app/admin/home-lottery-config/data'
    })

    console.log('API Response:', res)

    if (res && res.lotteries) {
      const { config, lotteries: lotteryList } = res
      maxDisplay.value = config.max_display || 8


      const enabledOrder = config.enabled_lotteries || []

      lotteries.value = lotteryList.map((l: any) => ({
        ...l,
        selected: enabledOrder.includes(l.name)
      }))


      if (enabledOrder.length > 0) {
        lotteries.value.sort((a, b) => {
          const aIndex = enabledOrder.indexOf(a.name)
          const bIndex = enabledOrder.indexOf(b.name)
          if (a.selected && b.selected) {
            return aIndex - bIndex
          }
          if (a.selected) return -1
          if (b.selected) return 1
          return a.sort - b.sort
        })
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {

    const enabledLotteries = selectedLotteries.value.map(l => l.name)

    await request.post({
      url: '/app/admin/home-lottery-config/save',
      data: {
        enabled_lotteries: enabledLotteries,
        max_display: maxDisplay.value
      },
      showSuccessMessage: true
    })
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.drag-handle:active {
  cursor: grabbing;
}
</style>
