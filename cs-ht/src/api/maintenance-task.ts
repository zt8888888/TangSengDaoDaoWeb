import request from '@/utils/http'

export interface Task {
  id?: number
  name: string
  time_key: string
  time_value_hour?: number
  time_value_minute?: number
  remark: string
  type?: 'time' | 'days'
  days_value?: number
}

export interface TaskListResponse {
  list: Task[]
  total: number
}

export interface UpdateTaskParams {
  name: string
  hour?: number
  minute?: number
  days?: number
}



export function fetchTaskList() {
  return request.get<TaskListResponse>({
    url: '/app/admin/api/maintenance/task/list'
  })
}



export function updateTask(data: UpdateTaskParams) {
  return request.post({
    url: '/app/admin/api/maintenance/task/update',
    data,
    showSuccessMessage: true
  })
}
