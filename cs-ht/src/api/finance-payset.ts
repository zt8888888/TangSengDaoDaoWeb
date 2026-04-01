import request from '@/utils/http'

export interface PaySet {
  id: number
  paytype: string
  paytypetitle: string
  ftitle?: string
  isonline: number
  state: number

  listorder?: number
}

export interface PaySetSearchParams {
  page?: number
  limit?: number
}

export interface PaySetList {
  list: PaySet[]
  total: number
}


export function fetchPaySetList(params: PaySetSearchParams) {
  return request.get<any>({
    url: '/app/admin/finance/payset-list',
    params: {
      page: params.page || 1,
      limit: params.limit || 20
    },
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as PaySetList
  })
}


export function createPaySet(data: any) {

  const postData: Record<string, any> = { ...data }
  if (data.configs_data && typeof data.configs_data === 'object') {
    Object.keys(data.configs_data).forEach(key => {
      postData[`configs_data[${key}]`] = data.configs_data[key]
    })
    delete postData.configs_data
  }
  return request.post({
    url: '/app/admin/finance/payset-save',
    data: postData,
    showSuccessMessage: true
  })
}


export function updatePaySet(data: any) {

  const postData: Record<string, any> = { ...data }
  if (data.configs_data && typeof data.configs_data === 'object') {
    Object.keys(data.configs_data).forEach(key => {
      postData[`configs_data[${key}]`] = data.configs_data[key]
    })
    delete postData.configs_data
  }
  return request.post({
    url: '/app/admin/finance/payset-update',
    data: postData,
    showSuccessMessage: true
  })
}


export function deletePaySet(id: number) {
  return request.post({
    url: '/app/admin/finance/payset-delete',
    data: { id },
    showSuccessMessage: true
  })
}


export function setPaySetState(id: number, state: number) {
  return request.post({
    url: '/app/admin/finance/payset-setstate',
    data: { id, state },
    showSuccessMessage: true
  })
}


export function deleteAllPaySet(ids: number[]) {
  return request.post({
    url: '/app/admin/finance/payset-deleteall',
    data: { 'ids[]': ids },
    showSuccessMessage: true
  })
}


export function updatePaySetOrder(items: { id: number; listorder: number }[]) {
  const data: Record<string, any> = {
    'ids[]': items.map(item => item.id)
  }
  items.forEach(item => {
    data[`listorder[${item.id}]`] = item.listorder
  })
  return request.post({
    url: '/app/admin/finance/payset-listorder',
    data,
    showSuccessMessage: true
  })
}
