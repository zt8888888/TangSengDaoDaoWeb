import request from '@/utils/http'

export interface HeMaiSearchParams {
  page?: number
  limit?: number
  isnb?: number
  cpname?: string
  qihao?: string
  trano?: string
  sDate?: string
  eDate?: string
  username?: string
  status?: number
  listorder?: number
}

export interface HeMaiItem {
  id: number
  trano: string
  username: string
  cptitle: string
  expect: string
  playtitle: string
  itemcount: number
  mode: string
  amount: number | string
  amountafter: number | string
  okamount: number | string
  okcount: number
  beishu: number
  yjf: string
  tzcode: string
  tzcode_full?: string
  opencode: string
  type: string
  status: string
  status_raw: number
  oddtime: string
}

export interface HeMaiListResponse {
  list: HeMaiItem[]
  total: number
}



export function fetchHeMaiList(params: HeMaiSearchParams) {
  return request.get<HeMaiListResponse>({
    url: '/app/admin/api/robot/hemai/list',
    params
  })
}



export function fetchHeMaiDetail(id: number) {
  return request.get<HeMaiItem>({
    url: '/app/admin/api/robot/hemai/detail',
    params: { id }
  })
}
