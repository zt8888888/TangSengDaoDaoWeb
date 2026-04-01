import request from '@/utils/http'

export interface LoginLog {
  id: number
  username: string
  type: number | string
  info: string
  ip: string
  iparea: string
  time_text: string
}

export interface LoginLogSearchParams {
  page?: number
  limit?: number
  sDate?: string
  eDate?: string
  username?: string
  loginip?: string
}

export interface LoginLogList {
  list: LoginLog[]
  total: number
}


export function fetchLoginLogList(params: LoginLogSearchParams) {
  return request.get<any>({
    url: '/app/admin/member/login-log-list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as LoginLogList
  })
}
