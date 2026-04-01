import request from '@/utils/http'

export interface QuickEntry {
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

export interface QuickEntryListResponse {
  list: QuickEntry[]
  total: number
}

export function fetchQuickEntryList() {
  return request.get<QuickEntryListResponse>({
    url: '/app/admin/api/maintenance/quick-entry/list'
  })
}

export function createQuickEntry(data: Record<string, any>) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-entry/create',
    data,
    showSuccessMessage: true
  })
}

export function updateQuickEntry(data: Record<string, any>) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-entry/update',
    data,
    showSuccessMessage: true
  })
}

export function deleteQuickEntry(id: number) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-entry/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function saveQuickEntrySort(items: { id: number; sort: number }[]) {
  return request.post({
    url: '/app/admin/api/maintenance/quick-entry/save-sort',
    data: { items },
    showSuccessMessage: true
  })
}

