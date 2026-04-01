import request from '@/utils/http'

export interface CpuInfo {
  cpuNum: number
  total: number
  sys: number
  used: number
  wait: number
  free: number
}

export interface MemInfo {
  total: number
  used: number
  free: number
  usage: number
}

export interface JvmInfo {
  name: string
  version: string
  startTime: string
  runTime: string
  home: string
  usage: number
  total: number | string
  max: number | string
  free: number | string
  inputArgs?: string
  sapi?: string
}

export interface SysInfo {
  computerName: string
  computerIp: string
  osName: string
  osArch: string
  userDir: string
}

export interface SysFileInfo {
  dirName: string
  sysTypeName: string
  typeName: string
  total: string
  free: string
  used: string
  usage: number
}

export interface ServerMonitorData {
  cpu: CpuInfo
  mem: MemInfo
  jvm: JvmInfo

  sys: SysInfo
  sysFiles: SysFileInfo[]
}



export function fetchServerMonitor() {
  return request.get<ServerMonitorData>({
    url: '/app/admin/api/monitor/server'
  })
}
