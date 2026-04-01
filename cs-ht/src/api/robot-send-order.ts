import request from '@/utils/http'

export interface RobotLottery {
  id?: number
  title: string
  name: string
  typeid: string
  hemai_status: number
  hemai_danqi_sum: number | string
  hemai_baomi_type: number
  hemai_touzhu_beishu: number | string
  hemai_touzhe_bili: number | string
  hemai_baodi_status: number
  hemai_wanfa_type: string[]
}

export interface RobotLotteryListResponse {
  list: RobotLottery[]
  total: number
}



export function fetchRobotLotteryList(params?: any) {
  return request.get<RobotLotteryListResponse>({
    url: '/app/admin/api/robot/send-order/list',
    params
  })
}



export function updateRobotLotteryValue(data: { cpname: string; [key: string]: any }) {
  const { cpname, ...rest } = data
  return request.post({
    url: '/app/admin/api/robot/send-order/update',
    data: {
      name: cpname,
      ...rest
    },
    showSuccessMessage: true
  })
}



export function updateRobotLotteryStatus(data: { cpname: string; cp_hemai_status: number }) {
  return updateRobotLotteryValue({
    cpname: data.cpname,
    hemai_status: data.cp_hemai_status
  })
}
