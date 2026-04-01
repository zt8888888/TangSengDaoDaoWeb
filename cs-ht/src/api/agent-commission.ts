import request from '@/utils/http'

export interface CommissionRecord {
  id: number
  agentId: number
  agentUsername: string
  subCount: number
  performance: number
  rate: number
  amount: number
  status: number
  settleDate: string
  claimedAt: string
  createdAt: string
}

export interface CommissionStats {
  totalCommission: number
  claimed: number
  pending: number
  agentCount: number
}

export interface RateConfig {
  effectiveCount: number
  performance: number
  rate: number
  commission?: number
}

export interface CommissionListParams {
  agentId?: string
  status?: number
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export function fetchCommissionList(params: CommissionListParams) {
  return request.get<{ list: CommissionRecord[]; total: number }>({
    url: '/app/admin/agent-commission/list',
    params
  })
}

export function fetchCommissionStats() {
  return request.get<CommissionStats>({
    url: '/app/admin/agent-commission/stats'
  })
}

export function manualClaimCommission(id: number) {
  return request.post({
    url: '/app/admin/agent-commission/manual-claim',
    data: { id },
    showSuccessMessage: true
  })
}

export function fetchCommissionRates() {
  return request.get<{ list: RateConfig[] }>({
    url: '/app/admin/agent-commission/rates'
  })
}

export function saveCommissionRates(rates: RateConfig[]) {
  return request.post({
    url: '/app/admin/agent-commission/rates',
    data: { rates },
    showSuccessMessage: true
  })
}

export interface AgentSettings {
  agentMode: string
  settlementCycle: string
  settlementDay: number
  validRecharge: number
  validBet: number
  auditMultiple: number
  ipLimit: number
  deviceLimit: number
}

export function fetchAgentSettings() {
  return request.get<AgentSettings>({
    url: '/app/admin/agent-commission/settings'
  })
}

export function saveAgentSettings(data: AgentSettings) {
  return request.post({
    url: '/app/admin/agent-commission/settings',
    data,
    showSuccessMessage: true
  })
}

export function executeSettlement() {
  return request.post<{ count: number }>({
    url: '/app/admin/agent-commission/settlement'
  })
}

export function fetchAgentList(params: { search?: string }) {
  return request.get<{ list: any[] }>({
    url: '/app/admin/agent-commission/agent-list',
    params
  })
}

export function removeAgentStatus(id: number) {
  return request.post({
    url: '/app/admin/agent-commission/remove-agent',
    data: { id },
    showSuccessMessage: true
  })
}

export const agentCommissionApi = {
  getList: fetchCommissionList,
  getStats: fetchCommissionStats,
  manualClaim: (data: { id: number }) => manualClaimCommission(data.id),
  getRates: fetchCommissionRates,
  saveRates: (data: { rates: RateConfig[] }) => saveCommissionRates(data.rates),
  getSettings: fetchAgentSettings,
  saveSettings: saveAgentSettings,
  settlement: executeSettlement,
  getAgentList: fetchAgentList,
  removeAgent: (data: { id: number }) => removeAgentStatus(data.id)
}
