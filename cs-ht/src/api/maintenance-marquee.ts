import request from '@/utils/http'

export interface Marquee {
  id: number
  content: string
  link: string
  link_type: number
  sort: number
  status: number
  start_time: string
  end_time: string
  add_time: string
  content_zh_hant?: string
  content_en?: string
  content_ja?: string
  content_ko?: string
  content_vi?: string
  content_th?: string
  content_id?: string
  content_ms?: string
  content_hi?: string
  content_es?: string
  content_pt?: string
}

export interface MarqueeListResponse {
  list: Marquee[]
  total: number
}

export interface MarqueeSearchParams {
  page?: number
  limit?: number
  content?: string
  status?: number | string
}

export function fetchMarqueeList(params?: MarqueeSearchParams) {
  return request.get<MarqueeListResponse>({
    url: '/app/admin/api/maintenance/marquee/list',
    params
  })
}

export function createMarquee(data: Record<string, any>) {
  return request.post({
    url: '/app/admin/api/maintenance/marquee/create',
    data,
    showSuccessMessage: true
  })
}

export function updateMarquee(data: Record<string, any>) {
  return request.post({
    url: '/app/admin/api/maintenance/marquee/update',
    data,
    showSuccessMessage: true
  })
}

export function deleteMarquee(id: number) {
  return request.post({
    url: '/app/admin/api/maintenance/marquee/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function toggleMarqueeStatus(id: number, status: number) {
  return request.post({
    url: '/app/admin/api/maintenance/marquee/toggle-status',
    data: { id, status },
    showSuccessMessage: true
  })
}

