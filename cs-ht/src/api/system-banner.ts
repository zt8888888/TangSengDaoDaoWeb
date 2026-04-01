


import request from '@/utils/http'



export enum BannerPlatform {

  ALL = 0,

  PC = 1,

  MOBILE = 2
}



export enum BannerStatus {

  DISABLED = 0,

  ENABLED = 1
}



export interface IBanner {
  listorder?: number
  type?: number
  url?: string

  id: number

  title: string

  platform: BannerPlatform

  image: string

  link?: string

  sort?: number

  status: BannerStatus

  createdAt?: number

  updatedAt?: number

  platformText?: string

  statusText?: string

  validTime?: string

  remark?: string
}



export interface IBannerSearchParams {

  page?: number

  limit?: number

  platform?: BannerPlatform | ''

  status?: BannerStatus | ''
}



export interface IBannerListResponse {

  list: IBanner[]

  total: number
}



export interface IBannerFormData {

  id?: number

  title: string

  image: string

  link?: string

  platform?: BannerPlatform

  sort?: number

  status?: BannerStatus

  startTime?: string

  endTime?: string

  remark?: string
}



const API_PATHS = {
  LIST: '/app/admin/system/banner-list',
  ADD: '/app/admin/system/banner-add',
  EDIT: '/app/admin/system/banner-edit',
  DELETE: '/app/admin/system/banner-delete',
  DELETE_ALL: '/app/admin/system/banner-deleteall',
  STATUS: '/app/admin/system/banner-status'
} as const



const DEFAULT_PAGE_SIZE = 20



function transformBannerData(item: Record<string, unknown>): IBanner & { url: string; type: number; listorder: number } & Record<string, unknown> {
  const result: Record<string, unknown> = {
    id: item.id as number,
    title: item.title as string,
    platform: item.platform as BannerPlatform,
    image: item.image as string,
    link: item.link as string,
    sort: item.sort as number,
    status: item.status as BannerStatus,
    createdAt: item.created_at as number,
    updatedAt: item.updated_at as number,
    platformText: item.platform_text as string,
    statusText: item.status_text as string,
    validTime: item.valid_time as string,
    remark: item.remark as string,

    url: item.image as string,
    type: item.platform as number,
    listorder: item.sort as number
  }
  
  const langSuffixes = ['_zh_hant', '_en', '_ja', '_ko', '_vi', '_th', '_id', '_ms', '_hi', '_es', '_pt']
  langSuffixes.forEach(suffix => {
    result[`title${suffix}`] = item[`title${suffix}`] || ''
    result[`image${suffix}`] = item[`image${suffix}`] || ''
    result[`link${suffix}`] = item[`link${suffix}`] || ''
  })
  
  return result as IBanner & { url: string; type: number; listorder: number }
}



export function fetchBannerList(params: IBannerSearchParams): Promise<IBannerListResponse> {
  return request
    .get<{ data: Record<string, unknown>[]; count: number }>({
      url: API_PATHS.LIST,
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? DEFAULT_PAGE_SIZE,
        platform: params.platform ?? '',
        status: params.status ?? ''
      },
      returnFullResponse: true
    })
    .then((res) => {
      const list = (res.data ?? []).map(transformBannerData)
      return {
        list,
        total: res.count ?? 0
      }
    })
}



export function createBanner(data: IBannerFormData | Record<string, unknown>): Promise<unknown> {
  const postData: Record<string, unknown> = {
    title: data.title,
    image: (data as Record<string, unknown>).url ?? data.image,
    link: data.link ?? '',
    platform: (data as Record<string, unknown>).type ?? data.platform ?? BannerPlatform.ALL,
    sort: (data as Record<string, unknown>).listorder ?? data.sort ?? 0,
    status: data.status ?? BannerStatus.ENABLED,
    start_time: (data as IBannerFormData).startTime ?? '',
    end_time: (data as IBannerFormData).endTime ?? '',
    remark: data.remark ?? ''
  }

  const langSuffixes = ['_zh_hant', '_en', '_ja', '_ko', '_vi', '_th', '_id', '_ms', '_hi', '_es', '_pt']
  langSuffixes.forEach(suffix => {
    const d = data as Record<string, unknown>
    if (d[`title${suffix}`] !== undefined) postData[`title${suffix}`] = d[`title${suffix}`]
    if (d[`image${suffix}`] !== undefined) postData[`image${suffix}`] = d[`image${suffix}`]
    if (d[`link${suffix}`] !== undefined) postData[`link${suffix}`] = d[`link${suffix}`]
  })

  return request.post({
    url: API_PATHS.ADD,
    data: postData,
    showSuccessMessage: true
  })
}



export function updateBanner(data: IBannerFormData | Record<string, unknown>): Promise<unknown> {
  const postData: Record<string, unknown> = {
    id: data.id,
    title: data.title,
    image: (data as Record<string, unknown>).url ?? data.image,
    link: data.link ?? '',
    platform: (data as Record<string, unknown>).type ?? data.platform ?? BannerPlatform.ALL,
    sort: (data as Record<string, unknown>).listorder ?? data.sort ?? 0,
    status: data.status,
    start_time: (data as IBannerFormData).startTime ?? '',
    end_time: (data as IBannerFormData).endTime ?? '',
    remark: data.remark ?? ''
  }

  const langSuffixes = ['_zh_hant', '_en', '_ja', '_ko', '_vi', '_th', '_id', '_ms', '_hi', '_es', '_pt']
  langSuffixes.forEach(suffix => {
    const d = data as Record<string, unknown>
    if (d[`title${suffix}`] !== undefined) postData[`title${suffix}`] = d[`title${suffix}`]
    if (d[`image${suffix}`] !== undefined) postData[`image${suffix}`] = d[`image${suffix}`]
    if (d[`link${suffix}`] !== undefined) postData[`link${suffix}`] = d[`link${suffix}`]
  })

  return request.post({
    url: API_PATHS.EDIT,
    data: postData,
    showSuccessMessage: true
  })
}



export function deleteBanner(id: number): Promise<unknown> {
  return request.post({
    url: API_PATHS.DELETE,
    data: { id },
    showSuccessMessage: true
  })
}



export function deleteAllBanner(ids: number[]): Promise<unknown> {
  return request.post({
    url: API_PATHS.DELETE_ALL,
    data: { ids },
    showSuccessMessage: true
  })
}



export function updateBannerOrder(
  items: Array<{ id: number; listorder: number }>
): Promise<unknown[]> {
  const promises = items.map((item) =>
    request.post({
      url: API_PATHS.EDIT,
      data: { id: item.id, sort: item.listorder }
    })
  )
  return Promise.all(promises)
}



export function updateBannerStatus(id: number, status: BannerStatus): Promise<unknown> {
  return request.post({
    url: API_PATHS.STATUS,
    data: { id, status },
    showSuccessMessage: true
  })
}


export type Banner = IBanner
export type BannerSearchParams = IBannerSearchParams
export type BannerList = IBannerListResponse
