<template>
  <div class="task-manage-page art-full-height p-4 bg-g-50/50">
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
      
      <div class="xl:col-span-2 flex flex-col gap-6">
        
        <div class="flex items-center justify-between px-1">
          <div>
            <h2 class="text-xl font-bold text-g-800 flex items-center">
              <span class="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center mr-3 shadow-md shadow-primary/20">
                <i class="ri-time-line text-lg"></i>
              </span>
              定时执行任务
            </h2>
            <p class="text-g-400 text-sm mt-1 pl-11">每日或每月定时自动执行的业务逻辑处理</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="task in timeTasks" 
            :key="task.name"
            class="group relative bg-box border-full-d rounded-xl p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
          >
            
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <i class="ri-gift-2-line text-lg"></i>
                </div>
                <h3 class="font-bold text-g-700">{{ task.name }}</h3>
              </div>
              <ElTag size="small" type="success" effect="light" round class="border-0 bg-success/10 text-success">
                <ArtSvgIcon icon="ri:checkbox-circle-line" class="mr-1" />运行中
              </ElTag>
            </div>

            
            <div class="mb-5 h-10">
              <p class="text-xs text-g-400 line-clamp-2 leading-relaxed" :title="task.remark">
                {{ task.remark }}
              </p>
            </div>

            
            <div class="bg-g-50/80 rounded-lg p-3 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
              <div class="flex items-center gap-3">
                <span class="text-xs font-medium text-g-500">触发时间</span>
                <div class="flex items-center gap-1.5">
                  <ElSelect v-model="task.time_value_hour" size="small" class="w-18 !text-center">
                    <template #prefix><span class="text-[10px] text-g-400 scale-90">H</span></template>
                    <ElOption v-for="h in 24" :key="h-1" :label="(h-1).toString().padStart(2, '0')" :value="h-1" />
                  </ElSelect>
                  <span class="text-g-300 font-bold">:</span>
                  <ElSelect v-model="task.time_value_minute" size="small" class="w-18">
                    <template #prefix><span class="text-[10px] text-g-400 scale-90">M</span></template>
                    <ElOption v-for="m in 60" :key="m-1" :label="(m-1).toString().padStart(2, '0')" :value="m-1" />
                  </ElSelect>
                </div>
              </div>
              <ElButton type="primary" size="small" plain :loading="task.loading" @click="handleSave(task)">
                保存
              </ElButton>
            </div>
          </div>
        </div>
      </div>

      
      <div class="xl:col-span-1 flex flex-col h-full">
        <div class="bg-box rounded-xl border-full-d shadow-sm flex flex-col h-full overflow-hidden max-h-[calc(100vh-120px)]">
          <div class="p-5 border-b border-full-d flex items-center justify-between bg-box sticky top-0 z-10">
            <div class="flex items-center">
              <span class="w-8 h-8 rounded-lg bg-warning text-white flex items-center justify-center mr-3 shadow-md shadow-warning/20">
                <i class="ri-delete-bin-2-line text-lg"></i>
              </span>
              <div>
                <h2 class="font-bold text-g-800 text-base">数据保留策略</h2>
                <p class="text-xs text-g-400 mt-0.5">自动清理过期数据</p>
              </div>
            </div>
            <ElTooltip content="策略修改后将在下一次清理任务执行时生效" placement="top">
              <i class="ri-question-line text-g-300 hover:text-g-500 cursor-help"></i>
            </ElTooltip>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div 
              v-for="task in daysTasks" 
              :key="task.name"
              class="group bg-box border-full-d rounded-lg p-3 hover:border-warning/50 transition-all duration-200 hover:bg-warning/5"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                  <div class="w-1.5 h-1.5 rounded-full bg-warning mr-2"></div>
                  <span class="text-sm font-medium text-g-700">{{ task.name }}</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between pl-3.5">
                <span class="text-xs text-g-400 truncate max-w-[100px]" :title="task.remark">{{ task.remark }}</span>
                <div class="flex items-center gap-2">
                  <div class="flex items-center bg-g-50 rounded px-2 py-1">
                    <span class="text-xs text-g-500 mr-2">清理</span>
                    <ElSelect v-model="task.days_value" size="small" class="w-20 !h-6">
                      <ElOption v-for="d in 90" :key="d" :label="d + ' 天前'" :value="d" />
                    </ElSelect>
                  </div>
                  <ElButton type="primary" link size="small" :loading="task.loading" @click="handleSave(task)">
                    保存
                  </ElButton>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-3 border-t border-full-d bg-g-50 text-center">
            <span class="text-xs text-g-400">共 {{ daysTasks.length }} 项清理策略</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  ElCard,
  ElSelect,
  ElOption,
  ElMessage,
  ElTag,
  ElTooltip,
  ElButton
} from 'element-plus'
import { fetchTaskList, updateTask, Task } from '@/api/maintenance-task'

defineOptions({ name: 'TaskManage' })

interface TaskUI extends Task {
  loading?: boolean
}

const taskList = ref<TaskUI[]>([])

const timeTasks = computed(() => taskList.value.filter(t => !t.type || t.type === 'time'))
const daysTasks = computed(() => taskList.value.filter(t => t.type === 'days'))

const loadData = async () => {
  try {
    const res = await fetchTaskList()
    if (res && res.list) {
      taskList.value = res.list
    } else {

      taskList.value = [
        { name: '日消费赠送活动', time_key: 'jihua_rixiaofei', time_value_hour: 0, time_value_minute: 30, remark: '赠送前一天(系统设置->赠送活动)', type: 'time' },
        { name: '日亏损赠送活动', time_key: 'jihua_rikuisun', time_value_hour: 0, time_value_minute: 30, remark: '赠送前一天(系统设置->赠送活动)', type: 'time' },
        { name: '代理下线会员投注返点发放', time_key: 'jihua_dailifandian', time_value_hour: 0, time_value_minute: 30, remark: '发放前一天(系统设置->赠送活动)', type: 'time' },
        { name: '月消费赠送活动', time_key: 'jihua_yuexiaofei', time_value_hour: 0, time_value_minute: 30, remark: '赠送上一个月(系统设置->赠送活动)', type: 'time' },
        { name: '月亏损赠送活动', time_key: 'jihua_yuekuisun', time_value_hour: 0, time_value_minute: 30, remark: '赠送上一个月(系统设置->赠送活动)', type: 'time' },
        { name: '开奖数据清理', time_key: 'jihua_kaijiang', days_value: 11, remark: '清理N天前的开奖数据', type: 'days' },
        { name: '投注数据清理', time_key: 'jihua_touzhu', days_value: 45, remark: '清理N天前的投注记录', type: 'days' },
        { name: '账变数据清理', time_key: 'jihua_fuddetail', days_value: 47, remark: '清理N天前的账变记录', type: 'days' },
        { name: '会员日志清理', time_key: 'jihua_memlog', days_value: 7, remark: '清理N天前的会员日志', type: 'days' },
        { name: '管理员日志清理', time_key: 'jihua_adminlog', days_value: 7, remark: '清理N天前的管理员日志', type: 'days' },
        { name: '返点数据清理', time_key: 'jihua_fandian', days_value: 7, remark: '清理N天前的返点数据', type: 'days' },
        { name: '晋级奖励清理', time_key: 'jihua_jinji', days_value: 7, remark: '清理N天前的晋级奖励', type: 'days' },
        { name: '返水数据清理', time_key: 'jihua_fanshui', days_value: 7, remark: '清理N天前的返水数据', type: 'days' }
      ]
    }
  } catch (e) {
    console.error(e)
  }
}

const handleSave = async (row: TaskUI) => {
  try {
    row.loading = true
    const params: any = { name: row.time_key }
    if (row.type === 'days') {
      params.days = row.days_value
    } else {
      params.hour = row.time_value_hour
      params.minute = row.time_value_minute
    }
    await updateTask(params)
    ElMessage.success('设置成功')
  } catch (e) {

  } finally {
    row.loading = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.w-18 { width: 4.5rem; }
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--art-gray-300);
  border-radius: 20px;
}
</style>
