


import request from '@/utils/http'




export interface LevelConfig {
  id: number
  level_id: number
  level_name: string
  level_icon: string
  required_points: number
  reward_amount: number
  daily_withdraw_limit: number
  rebate_rate: number
  sort_order: number
  is_enabled: number
  remark: string
  gmt_create: string
  gmt_modified: string
}


export interface LevelRewardRecord {
  id: number
  user_id: number
  username: string
  order_no: string
  from_level_id: number
  from_level_name: string
  to_level_id: number
  to_level_name: string
  reward_amount: number
  balance_before: number
  balance_after: number
  status: number
  claim_time: string
  expire_time: string
  remark: string
  gmt_create: string
}


export interface UserLevel {
  id: number
  user_id: number
  username: string
  balance: number
  current_level_id: number
  current_points: number
  total_points: number
  pending_reward: number
  last_upgrade_time: string
  gmt_create: string
  gmt_modified: string
}


export interface LevelRewardStats {
  today_amount: string
  today_count: number
  total_amount: string
  pending_amount: string
}


export interface StatusOption {
  value: number
  label: string
}


export interface LevelConfigListParams {
  page?: number
  limit?: number
}


export interface RecordListParams {
  page?: number
  limit?: number
  username?: string
  status?: number | string
  start_date?: string
  end_date?: string
}


export interface UserLevelListParams {
  page?: number
  limit?: number
  user_id?: number | string
}




export function fetchLevelConfigList(params?: LevelConfigListParams) {
  return request.get<any>({
    url: '/app/admin/api/level-reward/config-list',
    params,
    returnFullResponse: true
  }).then(res => ({
    list: res.data || [],
    total: res.count || 0
  }))
}


export function saveLevelConfig(data: Partial<LevelConfig>) {
  return request.post({
    url: '/app/admin/api/level-reward/config-save',
    data,
    showSuccessMessage: true
  })
}


export function deleteLevelConfig(id: number) {
  return request.post({
    url: '/app/admin/api/level-reward/config-delete',
    data: { id },
    showSuccessMessage: true
  })
}




export function fetchRecordList(params: RecordListParams) {
  return request.get<any>({
    url: '/app/admin/api/level-reward/record-list',
    params,
    returnFullResponse: true
  }).then(res => ({
    list: res.data || [],
    total: res.count || 0
  }))
}




export function fetchUserLevelList(params: UserLevelListParams) {
  return request.get<any>({
    url: '/app/admin/api/level-reward/user-level-list',
    params,
    returnFullResponse: true
  }).then(res => ({
    list: res.data || [],
    total: res.count || 0
  }))
}




export function grantReward(data: { user_id: number; amount: number; remark?: string }) {
  return request.post({
    url: '/app/admin/api/level-reward/grant',
    data,
    showSuccessMessage: true
  })
}


export function batchGrantReward(data: { user_ids: number[] | string; amount: number }) {
  return request.post({
    url: '/app/admin/api/level-reward/batch-grant',
    data,
    showSuccessMessage: true
  })
}




export function fetchStats() {
  return request.get<LevelRewardStats>({
    url: '/app/admin/api/level-reward/stats'
  })
}


export function fetchStatusOptions() {
  return request.get<StatusOption[]>({
    url: '/app/admin/api/level-reward/status-options'
  })
}
