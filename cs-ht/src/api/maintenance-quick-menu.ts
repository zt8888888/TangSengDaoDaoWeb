import request from '@/utils/http'

export interface QuickMenu {
  id: number
  name: string
  name_en: string
  name_vi: string
  name_th: string
  name_ms: string
  icon: string
  link_type: number
  link: string
  sort: number
  status: number
  add_time: number
}

export interface QuickMenuListResponse {
  list: QuickMenu[]
  total: number
}

export interface QuickMenuSearchParams {
  page?: number
  limit?: number
  status?: number | string
}

export function fetchQuickMenuList(params?: QuickMenuSearchParams) {
  return request.get<QuickMenuListResponse>({
    url: '/app/admin/api/maintenance/quick-menu/list',
    params
  })
}

export function createQuickMenu(data: Record<string, any>) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-menu/create',
    data,
    showSuccessMessage: true
  })
}

export function updateQuickMenu(data: Record<string, any>) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-menu/update',
    data,
    showSuccessMessage: true
  })
}

export function deleteQuickMenu(id: number) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-menu/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function toggleQuickMenuStatus(id: number) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-menu/toggle-status',
    data: { id },
    showSuccessMessage: true
  })
}

export function saveQuickMenuSort(items: { id: number; sort: number }[]) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-menu/save-sort',
    data: { items },
    showSuccessMessage: true
  })
}

export function batchDeleteQuickMenu(ids: number[]) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-menu/batch-delete',
    data: { ids },
    showSuccessMessage: true
  })
}

