import request from '@/utils/http'


export enum ClearType {
  USER_INACTIVE = 'user_inactive',
  USER_REGISTER = 'user_register',
  USER_TEST = 'user_test',
  LOTTERY_RESULT = 'lottery_result',
  BET_RECORD = 'bet_record',
  RECHARGE_RECORD = 'recharge_record',
  WITHDRAW_RECORD = 'withdraw_record',
  BALANCE_LOG = 'balance_log',
  MEMBER_LOG = 'member_log',
  ADMIN_LOG = 'admin_log'
}

export interface ClearParams {
  type: ClearType
  days?: number
  amount?: number
  state?: number
  is_inner?: number
}



export function clearData(data: ClearParams) {
  return request.post({
    url: '/app/admin/api/maintenance/clear-data',
    data,
    showSuccessMessage: true
  })
}
