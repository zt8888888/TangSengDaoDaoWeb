import request from '@/utils/http'

export interface ServerInfo {
  id: number
  name: string
  ip: string
  cpu_usage: number
  memory_usage: number
  swap_usage: number
  disk_usage: number
  status: 'running' | 'stopped' | 'error'
}



export function fetchServerList() {
  return request.get<{ list: ServerInfo[] }>({
    url: '/app/admin/api/maintenance/server/list'
  })
}



export function performServerAction(data: { id: number; action: 'start' | 'stop' | 'restart' }) {
  return request.post({
    url: '/app/admin/api/maintenance/server/action',
    data,
    showSuccessMessage: true
  })
}
