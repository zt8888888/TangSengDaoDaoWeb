import request from '@/utils/http'

export interface WithdrawAccount {
  id: number
  uid?: number
  username: string
  type: 'bank' | 'usdt' | 'alipay' | 'wechat'


  bank_name?: string
  bank_account?: string
  account_name?: string
  bank_branch?: string
  usdt_address?: string
  usdt_network?: string
  qr_code?: string


  account_info?: string
  is_default: number
  status: number
  created_at_text: string
}

export interface WithdrawAccountSearchParams {
  page?: number
  limit?: number
  username?: string
  type?: string
  status?: string
}

export interface WithdrawAccountList {
  list: WithdrawAccount[]
  total: number
}


export function fetchWithdrawAccountList(params: WithdrawAccountSearchParams) {
  return request.get<any>({
    url: '/app/admin/withdraw-account/select',
    params,
    returnFullResponse: true
  }).then(res => {

    return {
      list: res.data || [],
      total: res.count || 0
    } as WithdrawAccountList
  })
}


export function createWithdrawAccount(data: Partial<WithdrawAccount>) {
  return request.post({
    url: '/app/admin/withdraw-account/insert',
    data,
    showSuccessMessage: true
  })
}


export function updateWithdrawAccount(data: Partial<WithdrawAccount>) {
  return request.post({
    url: '/app/admin/withdraw-account/update',
    data,

    showSuccessMessage: true
  })
}


export function deleteWithdrawAccount(ids: number[]) {
  return request.post({
    url: '/app/admin/withdraw-account/delete',
    data: { ids },
    showSuccessMessage: true
  })
}


export function setDefaultWithdrawAccount(id: number) {
  return request.post({
    url: '/app/admin/withdraw-account/setDefault',
    data: { id },
    showSuccessMessage: true
  })
}


export function fetchMemberWithdrawAccounts(uid: number) {
  return request.get<any>({
    url: '/app/admin/withdraw-account/select',
    params: { uid, page: 1, limit: 100 },
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as WithdrawAccountList
  })
}
