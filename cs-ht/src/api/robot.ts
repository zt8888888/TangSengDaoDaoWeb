import request from '@/utils/http'

export interface Robot {
  id: number
  username: string
  balance: number | string
  groupid: number
  isonline: number | string
  isonline_raw?: number
  regtime: string
}

export interface RobotSearchParams {
  page?: number
  limit?: number
  username?: string
}

export interface RobotList {
  list: Robot[]
  total: number
}


export function fetchRobotList(params: RobotSearchParams) {
  return request.get<RobotList>({
    url: '/app/admin/robot/setting',
    params
  })
}


export function createRobot(data: Partial<Robot>) {
  return request.post({
    url: '/app/admin/robot/add-robot',
    data,

    showSuccessMessage: true
  })
}


export function deleteRobot(id: number) {
  return request.post({
    url: '/app/admin/robot/delete-robot',
    data: { id },
    showSuccessMessage: true
  })
}
