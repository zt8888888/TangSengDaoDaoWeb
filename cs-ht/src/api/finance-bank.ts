import request from '@/utils/http'

export interface SysBank {
  id: number
  bankcode: string
  bankname: string
  banklogo?: string
  imgbg?: string
  state: number
  listorder?: number
}

export interface SysBankSearchParams {
  page?: number
  limit?: number
}

export interface SysBankList {
  list: SysBank[]
  total: number
}


export function fetchSysBankList(params: SysBankSearchParams) {
  const queryStr = `page=${params.page || 1}&limit=${params.limit || 20}`
  return request.get<any>({
    url: `/app/admin/finance/sysbank-list?${queryStr}`,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as SysBankList
  })
}


export function createSysBank(data: Partial<SysBank>) {
  return request.post({
    url: '/app/admin/finance/sysbank-save',
    data,
    showSuccessMessage: true
  })
}


export function updateSysBank(data: Partial<SysBank>) {
  return request.post({
    url: '/app/admin/finance/sysbank-update',
    data,
    showSuccessMessage: true
  })
}


export function deleteSysBank(id: number) {
  return request.post({
    url: '/app/admin/finance/sysbank-delete',
    data: { id },
    showSuccessMessage: true
  })
}


export function setSysBankState(id: number, state: number) {
  return request.post({
    url: '/app/admin/finance/sysbank-setstate',
    data: { id, state },
    showSuccessMessage: true
  })
}


export function deleteAllSysBank(ids: number[]) {
  return request.post({
    url: '/app/admin/finance/sysbank-deleteall',
    data: { 'ids[]': ids },
    showSuccessMessage: true
  })
}


export function updateSysBankOrder(items: { id: number; listorder: number }[]) {
  const data: Record<string, any> = {
    'ids[]': items.map(item => item.id)
  }
  items.forEach(item => {
    data[`listorder[${item.id}]`] = item.listorder
  })
  return request.post({
    url: '/app/admin/finance/sysbank-listorder',
    data,
    showSuccessMessage: true
  })
}
