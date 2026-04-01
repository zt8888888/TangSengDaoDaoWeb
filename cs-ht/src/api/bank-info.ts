import request from '@/utils/http'

export interface BankInfo {
  id: number
  username: string
  accountname: string
  bankname: string
  bankbranch: string
  bankaddress: string
  banknumber: string
  state: number
  created_at_text?: string
}

export interface BankSearchParams {
  page?: number
  limit?: number
  state?: number | string
  username?: string
  accountname?: string
}

export interface BankList {
  list: BankInfo[]
  total: number
}


export function fetchBankList(params: BankSearchParams) {

  const cleanParams: any = {
    page: params.page || 1,
    limit: params.limit || 20
  }

  if (params.username) {
    cleanParams.username = params.username
  }

  if (params.accountname) {
    cleanParams.accountname = params.accountname
  }

  if (params.state !== undefined && params.state !== null && params.state !== '') {
    cleanParams.state = params.state
  }

  return request.get<any>({
    url: '/app/admin/member/bank-list',
    params: cleanParams,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as BankList
  })
}


export function updateBank(data: Partial<BankInfo>) {
  return request.post({
    url: '/app/admin/member/bank-edit',
    data,
    showSuccessMessage: true
  })
}


export function deleteBank(id: number) {
  return request.post({
    url: '/app/admin/member/bank-delete',
    data: { id },
    showSuccessMessage: true
  })
}
