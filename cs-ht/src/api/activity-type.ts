import request from '@/utils/http'

export interface ActivityType {
  id: number
  name: string
  code: string
  icon?: string
  sort: number
  status: number
  remark?: string
  created_at?: string
}

export interface ActivityTypeSearchParams {
  page?: number
  limit?: number
  name?: string
  status?: number
}

export interface ActivityTypeList {
  list: ActivityType[]
  total: number
}

export function fetchActivityTypeList(params: ActivityTypeSearchParams) {
  return request.get<any>({
    url: '/app/admin/api/activity/type-list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as ActivityTypeList
  })
}

export function createActivityType(data: Partial<ActivityType>) {
  return request.post({
    url: '/app/admin/api/activity/type-add',
    data,
    showSuccessMessage: true
  })
}

export function updateActivityType(data: Partial<ActivityType>) {
  return request.post({
    url: '/app/admin/api/activity/type-edit',
    data,
    showSuccessMessage: true
  })
}

export function deleteActivityType(id: number) {
  return request.post({
    url: '/app/admin/api/activity/type-delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function updateActivityTypeStatus(id: number, status: number) {
  return request.post({
    url: '/app/admin/api/activity/type-status',
    data: { id, status },
    showSuccessMessage: true
  })
}
