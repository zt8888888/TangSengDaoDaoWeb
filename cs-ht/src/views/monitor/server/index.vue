<template>
  <div class="monitor-server-page art-full-height p-4">
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      
      <ElCard shadow="never" class="border-none shadow-sm">
        <template #header>
          <div class="flex items-center">
            <i class="ri-cpu-line mr-2 text-lg"></i>
            <span class="font-bold">CPU</span>
          </div>
        </template>
        <div class="p-2">
          <ElTable :data="cpuData" border size="small">
            <ElTableColumn prop="name" label="属性" />
            <ElTableColumn prop="value" label="值" />
          </ElTable>
        </div>
      </ElCard>

      
      <ElCard shadow="never" class="border-none shadow-sm">
        <template #header>
          <div class="flex items-center">
            <i class="ri-database-2-line mr-2 text-lg"></i>
            <span class="font-bold">内存</span>
          </div>
        </template>
        <div class="p-2">
          <ElTable :data="memData" border size="small">
            <ElTableColumn prop="name" label="属性" />
            <ElTableColumn prop="mem" label="内存" />
            <ElTableColumn prop="jvm" label="JVM" />
          </ElTable>
        </div>
      </ElCard>
    </div>

    
    <ElCard shadow="never" class="mb-4 border-none shadow-sm">
      <template #header>
        <div class="flex items-center">
          <i class="ri-server-line mr-2 text-lg"></i>
          <span class="font-bold">服务器信息</span>
        </div>
      </template>
      <div class="p-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div class="flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">服务器名称</span>
            <span class="font-medium">{{ sysInfo.computerName }}</span>
          </div>
          <div class="flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">操作系统</span>
            <span class="font-medium">{{ sysInfo.osName }}</span>
          </div>
          <div class="flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">服务器IP</span>
            <span class="font-medium">{{ sysInfo.computerIp }}</span>
          </div>
          <div class="flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">系统架构</span>
            <span class="font-medium">{{ sysInfo.osArch }}</span>
          </div>
        </div>
      </div>
    </ElCard>

          
    <ElCard shadow="never" class="mb-4 border-none shadow-sm">
      <template #header>
        <div class="flex items-center">
          <i class="ri-code-box-line mr-2 text-lg"></i>
          <span class="font-bold">运行环境信息 (PHP/Webman)</span>
        </div>
      </template>
      <div class="p-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div class="flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">环境名称</span>
            <span class="font-medium">{{ jvmInfo.name }}</span>
          </div>
          <div class="flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">PHP版本</span>
            <span class="font-medium">{{ jvmInfo.version }}</span>
          </div>
          <div class="flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">启动时间</span>
            <span class="font-medium">{{ jvmInfo.startTime }}</span>
          </div>
          <div class="flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">运行时长</span>
            <span class="font-medium">{{ jvmInfo.runTime }}</span>
          </div>
          <div class="col-span-1 md:col-span-2 flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">安装路径</span>
            <span class="font-medium break-all">{{ jvmInfo.home }}</span>
          </div>
          <div class="col-span-1 md:col-span-2 flex border-b border-full-d pb-2">
            <span class="w-24 text-g-500">运行模式</span>
            <span class="font-medium break-all">{{ jvmInfo.sapi }}</span>
          </div>
        </div>
      </div>
    </ElCard>

    
    <ElCard shadow="never" class="border-none shadow-sm">
      <template #header>
        <div class="flex items-center">
          <i class="ri-hard-drive-line mr-2 text-lg"></i>
          <span class="font-bold">磁盘状态</span>
        </div>
      </template>
      <div class="p-2">
        <ElTable :data="sysFiles" border size="small">
          <ElTableColumn prop="dirName" label="盘符路径" width="150" />
          <ElTableColumn prop="sysTypeName" label="文件系统" width="120" />
          <ElTableColumn prop="typeName" label="盘符类型" min-width="150" />
          <ElTableColumn prop="total" label="总大小" width="120" />
          <ElTableColumn prop="free" label="可用大小" width="120" />
          <ElTableColumn prop="used" label="已用大小" width="120" />
          <ElTableColumn prop="usage" label="已用百分比" width="180">
            <template #default="{ row }">
              <div class="flex items-center">
                <span class="mr-2">{{ row.usage }}%</span>
                <ElProgress 
                  :percentage="row.usage" 
                  :show-text="false" 
                  :status="row.usage > 80 ? 'exception' : row.usage > 60 ? 'warning' : 'success'"
                  class="w-24"
                />
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElCard, ElTable, ElTableColumn, ElProgress } from 'element-plus'
import { fetchServerMonitor, ServerMonitorData } from '@/api/monitor-server'

defineOptions({ name: 'MonitorServer' })


const cpuData = ref<any[]>([])
const memData = ref<any[]>([])
const sysInfo = ref<any>({})
const jvmInfo = ref<any>({})
const sysFiles = ref<any[]>([])

const loadData = async () => {
  try {
    const res = await fetchServerMonitor()

    if (res) {

      const data = res as any
      if (data.php) {
        data.jvm = data.php
      }
      processData(data)
    } else {

      const mockData: ServerMonitorData = {
        cpu: { cpuNum: 2, total: 0, sys: 0.8, used: 0.8, wait: 0, free: 98.4 },
        mem: { total: 1.92, used: 1.67, free: 0.25, usage: 86.78 },
        jvm: {
          name: 'Java HotSpot(TM) 64-Bit Server VM',
          version: '1.8.0_161',
          startTime: '2025-11-25 22:15:55',
          runTime: '3天1小时21分钟',
          home: 'C:\\Program Files\\Java\\jre1.8.0_161',
          usage: 46.09,
          total: 260.0,
          max: 1024,
          free: 140.16,
          inputArgs: '[-Dname=ruoyi.jar -Duser.timezone=Asia/Shanghai -Xms512m -Xmx1024m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -XX:+PrintGCDateStamps -XX:+PrintGCDetails -XX:NewRatio=1 -XX:SurvivorRatio=30 -XX:+UseParallelGC -XX:+UseParallelOldGC]'
        },
        sys: {
          computerName: 'yangzz',
          computerIp: '172.31.187.226',
          userDir: 'C:\\ruoyi',
          osName: 'Windows Server 2012 R2',
          osArch: 'amd64'
        },
        sysFiles: [
          {
            dirName: 'C:\\',
            sysTypeName: 'NTFS',
            typeName: '本地固定磁盘 (C:)',
            total: '39.7 GB',
            free: '20.5 GB',
            used: '19.1 GB',
            usage: 48.28
          }
        ]
      }
      processData(mockData)
    }
  } catch (e) {
    console.error(e)
  }
}

const processData = (data: ServerMonitorData) => {

  cpuData.value = [
    { name: '核心数', value: data.cpu.cpuNum },
    { name: '用户使用率', value: data.cpu.used + '%' },
    { name: '系统使用率', value: data.cpu.sys + '%' },
    { name: '当前空闲率', value: data.cpu.free + '%' }
  ]


  memData.value = [
    { name: '总内存', mem: data.mem.total + 'G', jvm: data.jvm.total + 'M' },
    { name: '已用内存', mem: data.mem.used + 'G', jvm: data.jvm.usage + 'M' },

    { name: '剩余内存', mem: data.mem.free + 'G', jvm: data.jvm.free + 'M' },
    { name: '使用率', mem: data.mem.usage + '%', jvm: data.jvm.usage + '%' }
  ]


  sysInfo.value = data.sys


  jvmInfo.value = { ...data.jvm, userDir: data.sys.userDir }


  sysFiles.value = data.sysFiles
}

let timer: number | null = null

onMounted(() => {
  loadData()
  timer = window.setInterval(loadData, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.break-all {
  word-break: break-all;
}
</style>
