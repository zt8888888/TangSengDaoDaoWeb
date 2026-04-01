import request from '@/utils/http'

export interface Notice {
  id: number
  title: string
  content: string
  create_time: string
  title_zh_hant?: string
  content_zh_hant?: string
  title_en?: string
  content_en?: string
  title_ja?: string
  content_ja?: string
  title_ko?: string
  content_ko?: string
  title_vi?: string
  content_vi?: string
  title_th?: string
  content_th?: string
  title_id?: string
  content_id?: string
  title_ms?: string
  content_ms?: string
  title_hi?: string
  content_hi?: string
  title_es?: string
  content_es?: string
  title_pt?: string
  content_pt?: string
}

export interface NoticeListResponse {
  list: Notice[]
  total: number
}

export interface NoticeSearchParams {
  page?: number
  limit?: number
  title?: string
}

export function fetchNoticeList(params?: NoticeSearchParams) {
  return request.get<NoticeListResponse>({
    url: '/app/admin/api/maintenance/notice/list',
    params
  })
}

export function createNotice(data: Record<string, any>) {
  return request.post({
    url: '/app/admin/api/maintenance/notice/create',
    data,
    showSuccessMessage: true
  })
}

export function updateNotice(data: Record<string, any>) {
  return request.post({
    url: '/app/admin/api/maintenance/notice/update',
    data,
    showSuccessMessage: true
  })
}

export function deleteNotice(id: number) {
  return request.post({
    url: '/app/admin/api/maintenance/notice/delete',
    data: { id },
    showSuccessMessage: true
  })
}
