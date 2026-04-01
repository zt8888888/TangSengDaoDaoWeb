import request from '@/utils/http'

export interface GamePlatform {
  id: number
  code: string
  name: string
  type: string
  type_text?: string
  status: string
  status_text?: string
  hot: number
  sort: number
  api_url?: string
  api_key?: string
  api_secret?: string
  balance?: string | number
  created_at?: string
}

export interface GamePlatformSearchParams {
  page?: number
  limit?: number
  name?: string
  code?: string
  type?: string
  status?: string
}

export interface GamePlatformList {
  list: GamePlatform[]
  total: number
}

export interface PlatformOption {
  value: string
  label: string
}


export function fetchPlatformList(params: GamePlatformSearchParams) {
  return request.get<any>({
    url: '/app/admin/api/game/platform-list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as GamePlatformList
  })
}


export function fetchPlatformDetail(id: number) {
  return request.get<GamePlatform>({
    url: '/app/admin/api/game/platform-detail',
    params: { id }
  })
}


export function createPlatform(data: Partial<GamePlatform>) {
  return request.post({
    url: '/app/admin/api/game/platform-add',
    data,
    showSuccessMessage: true
  })
}


export function updatePlatform(data: Partial<GamePlatform>) {
  return request.post({
    url: '/app/admin/api/game/platform-edit',
    data,
    showSuccessMessage: true
  })
}


export function deletePlatform(id: number) {
  return request.post({
    url: '/app/admin/api/game/platform-delete',
    data: { id },
    showSuccessMessage: true
  })
}


export function updatePlatformStatus(id: number, status: string) {
  return request.post({
    url: '/app/admin/api/game/platform-status',
    data: { id, status },
    showSuccessMessage: true
  })
}


export function fetchPlatformBalance(code: string) {
  return request.get<{ balance: number }>({
    url: '/app/admin/api/game/platform-balance',
    params: { code }
  })
}


export function fetchAllPlatformBalances() {
  return request.get<any>({
    url: '/app/admin/api/game/platform-balance-all',
    returnFullResponse: true
  }).then(res => res.data || [])
}


export function fetchPlatformOptions() {
  return request.get<PlatformOption[]>({
    url: '/app/admin/api/game/platform-options'
  })
}


export function fetchPlatformTypeOptions() {
  return request.get<PlatformOption[]>({
    url: '/app/admin/api/game/platform-type-options'
  })
}


export function fetchPlatformStatusOptions() {
  return request.get<PlatformOption[]>({
    url: '/app/admin/api/game/platform-status-options'
  })
}

export interface PlatformCategory {
  id: number
  platform_code: string
  category_code: string
  category_name?: string
  banner?: string
  mobile_banner?: string
  sort: number
}

export function fetchPlatformCategoryList(platformCode?: string) {
  return request.get<any>({
    url: '/app/admin/api/game/platform-category-list',
    params: platformCode ? { platform_code: platformCode } : {}
  }).then(res => res?.list || [])
}

export function batchSavePlatformCategories(platformCode: string, categories: any[]) {
  return request.post({
    url: '/app/admin/api/game/platform-category-batch',
    data: { platform_code: platformCode, categories },
    showSuccessMessage: true
  })
}