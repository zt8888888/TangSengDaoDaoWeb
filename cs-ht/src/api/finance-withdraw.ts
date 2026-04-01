import request from '@/utils/http'

export interface Withdraw {
  id: number
  trano: string
  username: string
  accountname: string
  bankname: string
  banknumber: string
  paytype: string
  paytypename: string
  qr_code?: string
  amount: string
  actualamount: string
  fee: string
  oldaccountmoney: string
  newaccountmoney: string
  oddtime: string
  state: number
}

export interface WithdrawStatistics {
  total_amount: string
  total_count: number
  success_amount: string
}

export interface WithdrawList {
  list: Withdraw[]
  total: number
  statistics?: WithdrawStatistics
}

export interface WithdrawSearchParams {
  page?: number
  limit?: number
  state?: number | string
  sDate?: string
  eDate?: string
  sAmout?: string
  eAmout?: string
  username?: string
  trano?: string
}


export function fetchWithdrawList(params: WithdrawSearchParams) {

  const queryParams = new URLSearchParams()
  queryParams.append('page', String(params.page || 1))
  queryParams.append('limit', String(params.limit || 20))

  if (params.state !== '' && params.state !== undefined && params.state !== null) {
    queryParams.append('state', String(params.state))
  }
  if (params.sDate) queryParams.append('sDate', params.sDate)
  if (params.eDate) queryParams.append('eDate', params.eDate)
  if (params.sAmout) queryParams.append('sAmout', params.sAmout)
  if (params.eAmout) queryParams.append('eAmout', params.eAmout)
  if (params.username) queryParams.append('username', params.username)
  if (params.trano) queryParams.append('trano', params.trano)

  return request.get<any>({
    url: `/app/admin/finance/withdraw-list?${queryParams.toString()}`,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0,
      statistics: res.statistics
    } as WithdrawList
  })
}


export function approveWithdraw(id: number) {
  return request.post({
    url: '/app/admin/finance/withdraw-approve',
    data: { id },
    showSuccessMessage: true
  })
}


export function rejectWithdraw(id: number) {
  return request.post({
    url: '/app/admin/finance/withdraw-reject',
    data: { id },
    showSuccessMessage: true
  })
}
