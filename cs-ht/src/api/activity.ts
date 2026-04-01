import request from '@/utils/http'

export interface Activity {
  id: number
  title: string
  desc: string
  content: string
  banner: string
  images: string[]
  type: string
  type_text?: string
  start_date: string
  end_date: string
  status: number
  sort: number
  created_at?: string
}

export interface ActivitySearchParams {
  category?: string
  page?: number
  limit?: number
  title?: string
  type?: string
  status?: number
}

export interface ActivityList {
  list: Activity[]
  total: number
}

export interface ActivityTypeOption {
  value: string
  label: string
}


export function fetchActivityList(params: ActivitySearchParams) {
  return request.get<any>({
    url: '/app/admin/api/activity/list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as ActivityList
  })
}


export function fetchActivityDetail(id: number) {
  return request.get<Activity>({
    url: '/app/admin/api/activity/detail',
    params: { id }
  })
}


export function createActivity(data: Partial<Activity>) {
  return request.post({
    url: '/app/admin/api/activity/add',
    data,
    showSuccessMessage: true
  })
}


export function updateActivity(data: Partial<Activity>) {
  return request.post({
    url: '/app/admin/api/activity/edit',
    data,
    showSuccessMessage: true
  })
}


export function deleteActivity(id: number) {
  return request.post({
    url: '/app/admin/api/activity/delete',
    data: { id },
    showSuccessMessage: true
  })
}


export function updateActivityStatus(id: number, status: number) {
  return request.post({
    url: '/app/admin/api/activity/status',
    data: { id, status },
    showSuccessMessage: true
  })
}


export function fetchActivityTypeOptions() {
  return request.get<ActivityTypeOption[]>({
    url: '/app/admin/api/activity/type-options'
  })
}
