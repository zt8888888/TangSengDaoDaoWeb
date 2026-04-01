import request from '@/utils/http'

export interface ActivityCategory {
  id: number
  name: string
  code: string
  icon?: string
  sort: number
  status: number
  remark?: string
  created_at?: string
}

export interface ActivityCategorySearchParams {
  page?: number
  limit?: number
  name?: string
  status?: number
}

export interface ActivityCategoryList {
  list: ActivityCategory[]
  total: number
}

export function fetchActivityCategoryList(params: ActivityCategorySearchParams) {
  return request.get<any>({
    url: '/app/admin/api/activity-category/list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as ActivityCategoryList
  })
}

export function fetchActivityCategoryOptions() {
  return request.get<Array<{value: string, label: string}>>({
    url: '/app/admin/api/activity-category/options'
  })
}

export function fetchActivityPlatforms(type?: string) {
  return request.get<any>({
    url: '/app/admin/api/activity/platforms',
    params: type ? { type } : {},
    returnFullResponse: true
  }).then(res => res.data || [])
}

export function createActivityCategory(data: Partial<ActivityCategory>) {
  return request.post({
    url: '/app/admin/api/activity-category/add',
    data,
    showSuccessMessage: true
  })
}

export function updateActivityCategory(data: Partial<ActivityCategory>) {
  return request.post({
    url: '/app/admin/api/activity-category/edit',
    data,
    showSuccessMessage: true
  })
}

export function deleteActivityCategory(id: number) {
  return request.post({
    url: '/app/admin/api/activity-category/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function updateActivityCategoryStatus(id: number, status: number) {
  return request.post({
    url: '/app/admin/api/activity-category/status',
    data: { id, status },
    showSuccessMessage: true
  })
}

