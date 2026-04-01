import request from '@/utils/http'

export interface ActivityReward {
  id: number
  activityId: number
  activityTitle?: string
  rewardType: string
  levelName: string
  conditionMin: number
  conditionMax: number
  rewardAmount: number
  rewardRate: number
  conditionType: string
  conditionValue?: string
  needApply: boolean
  limitTimes: number
  limitPeriod: string
  sort: number
  status: number
  createdAt?: number
  updatedAt?: number
}

export interface ActivityParticipation {
  id: number
  activityId: number
  activityTitle: string
  rewardId: number
  levelName: string
  uid: number
  username: string
  rewardType: string
  conditionValue?: string
  rewardAmount: number
  status: number
  statusText: string
  trano?: string
  applyTime: number
  auditTime?: number
  auditAdmin?: string
  auditRemark?: string
  ip?: string
}

export interface RewardSearchParams {
  activity_id?: number
  reward_type?: string
}

export interface ParticipationSearchParams {
  page?: number
  limit?: number
  activity_id?: number
  status?: number | string
  username?: string
}

export interface StatisticsParams {
  activity_id?: number
  start_date?: string
  end_date?: string
}

export function fetchRewardList(params?: RewardSearchParams) {
  return request.get<any>({
    url: '/app/admin/api/activity-reward/list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    }
  })
}

export function fetchRewardDetail(id: number) {
  return request.get<ActivityReward>({
    url: '/app/admin/api/activity-reward/detail',
    params: { id }
  })
}

export function createReward(data: Partial<ActivityReward>) {
  return request.post({
    url: '/app/admin/api/activity-reward/add',
    data,
    showSuccessMessage: true
  })
}

export function updateReward(data: Partial<ActivityReward>) {
  return request.post({
    url: '/app/admin/api/activity-reward/edit',
    data,
    showSuccessMessage: true
  })
}

export function deleteReward(id: number) {
  return request.post({
    url: '/app/admin/api/activity-reward/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function fetchParticipationList(params: ParticipationSearchParams) {
  return request.get<any>({
    url: '/app/admin/api/activity-reward/participation-list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    }
  })
}

export function auditParticipation(data: {
  ids: number[]
  status: number
  remark?: string
}) {
  return request.post({
    url: '/app/admin/api/activity-reward/audit',
    data,
    showSuccessMessage: true
  })
}

export function fetchStatistics(params?: StatisticsParams) {
  return request.get<any>({
    url: '/app/admin/api/activity-reward/statistics',
    params
  })
}

export const rewardTypeOptions = [
  { label: '幸运注单', value: 'lucky_order' },
  { label: '亏损救援', value: 'loss_rescue' },
  { label: '周俸禄', value: 'weekly_salary' },
  { label: '月俸禄', value: 'monthly_salary' },
  { label: '充值奖励', value: 'deposit_bonus' },
  { label: '其他', value: 'other' }
]

export const conditionTypeOptions = [
  { label: '金额', value: 'amount' },
  { label: '注单尾号', value: 'order_tail' },
  { label: '投注次数', value: 'bet_count' }
]

export const limitPeriodOptions = [
  { label: '一次性', value: 'once' },
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' }
]

export const auditStatusOptions = [
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 }
]
