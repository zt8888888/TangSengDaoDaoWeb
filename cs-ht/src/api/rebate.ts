import api from '@/utils/http'

export interface VipConfigItem {
  groupId: number
  groupName: string
  fanshuiRaw: string
  tiers: { min: number; max: number; rate: number }[]
  gameTypeRates: { type: number; name: string; field: string; rate: number }[]
}

export interface RebateRecord {
  id: number
  trano: string
  uid: number
  username: string
  groupname: string
  bili: number
  touzhuedu: number
  amount: number
  oddtime: string
  shenhe: number
  type: string
  type_label: string
  gametype?: number
  fanshui_type?: number
}

export interface RebateStats {
  today: { total: number; count: number; pending: number }
  month: { total: number; count: number }
  totalPending: number
}

export interface RebateReportData {
  trend: { date: string; amount: number; count: number }[]
  byCategory: { category: string; total: number }[]
  byVip: { groupname: string; total: number; cnt: number }[]
}

export interface VendorConfig {
  vendorCode: string
  vendorName: string
  categoryCode: string
  gameCount: number
  status: number
  baseRate: number
  vipBonus: number
  minBet: number
}

export interface CategoryConfig {
  code: string
  name: string
  status: number
  sort: number
  vendors: VendorConfig[]
}

export interface GlobalConfig {
  enabled: boolean
  cycle: string
  minAmount: number
  expireDays: number
  turnoverTimes: number
  agentLevel: number
}

export function fetchGlobalConfig() {
  return api.get<GlobalConfig>({ url: '/app/admin/api/rebate/global-config' })
}

export function saveGlobalConfig(data: GlobalConfig) {
  return api.post<void>({ url: '/app/admin/api/rebate/global-config-save', data })
}

export function fetchVipConfig() {
  return api.get<{ list: VipConfigItem[] }>({ url: '/app/admin/api/rebate/vip-config' })
}

export function saveVipConfig(data: { groupId: number; tiers: any[]; gameTypeRates: any[] }) {
  return api.post<void>({ url: '/app/admin/api/rebate/vip-config-save', data })
}

export function fetchVendorConfig() {
  return api.get<{ categories: CategoryConfig[] }>({ url: '/app/admin/api/rebate/vendor-config' })
}

export function saveCategoryStatus(code: string, status: number) {
  return api.post<void>({ url: '/app/admin/api/rebate/category-status-save', data: { code, status } })
}

export function saveVendorConfigItem(data: VendorConfig & { categoryCode: string }) {
  return api.post<void>({ url: '/app/admin/api/rebate/vendor-config-save', data })
}

export function fetchRebateList(params: Record<string, any>) {
  return api.get<{ list: RebateRecord[]; total: number }>({ url: '/app/admin/api/rebate/list', params })
}

export function fetchRebateStats() {
  return api.get<RebateStats>({ url: '/app/admin/api/rebate/stats' })
}

export function auditRebate(id: number, action: 'pass' | 'reject') {
  return api.post<void>({ url: '/app/admin/api/rebate/audit', data: { id, action } })
}

export function batchAuditRebate(ids: number[], action: 'pass' | 'reject') {
  return api.post<{ count: number }>({ url: '/app/admin/api/rebate/batch-audit', data: { ids, action } })
}

export function fetchRebateReport(days: number) {
  return api.get<RebateReportData>({ url: '/app/admin/api/rebate/report', params: { days } })
}

export interface TierItem {
  id?: number
  minBet: number
  rate: number
  status: number
}

export interface TierConfig {
  categoryCode: string
  categoryName: string
  vendorCode: string
  vendorName: string
  tiers: TierItem[]
}

export function fetchTierConfig(params?: { category_code?: string; vendor_code?: string }) {
  return api.get<{ list: TierConfig[] }>({ url: '/app/admin/api/rebate/tier-config', params })
}

export function saveTierConfig(data: { category_code: string; vendor_code: string; tiers: TierItem[] }) {
  return api.post<void>({ url: '/app/admin/api/rebate/tier-config-save', data })
}

export function deleteTierConfig(id: number) {
  return api.post<void>({ url: '/app/admin/api/rebate/tier-config-delete', data: { id } })
}

export function fetchUserBetStats(params?: { uid?: number; username?: string }) {
  return api.get<{ list: any[] }>({ url: '/app/admin/api/rebate/user-bet-stats', params })
}

