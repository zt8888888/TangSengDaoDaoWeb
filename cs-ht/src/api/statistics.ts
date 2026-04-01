import request from '@/utils/http'





export function fetchOverviewStats() {
  return request.get<Api.Statistics.OverviewStats>({
    url: '/app/admin/api/statistics/overview'
  })
}


export function fetchRechargeTrend(params: { days: number }) {
  return request.get<Api.Statistics.TrendData>({
    url: '/app/admin/api/statistics/recharge-trend',
    params
  })
}


export function fetchBetTrend(params: { days: number }) {
  return request.get<Api.Statistics.TrendData>({
    url: '/app/admin/api/statistics/bet-trend',
    params
  })
}


export function fetchUserGrowth() {
  return request.get<Api.Statistics.TrendData>({
    url: '/app/admin/api/statistics/user-growth'
  })
}


export function fetchRealtimeStats() {
  return request.get<Api.Statistics.RealtimeItem[]>({
    url: '/app/admin/api/statistics/realtime'
  })
}



export function fetchProfitStats(params: Api.Statistics.ProfitParams) {
  return request.get<Api.Statistics.ProfitStats>({
    url: '/app/admin/api/statistics/profit',
    params
  })
}



export function fetchUserStats(params: { startDate?: string; endDate?: string }) {
  return request.get<Api.Statistics.UserStats>({
    url: '/app/admin/api/statistics/user',
    params
  })
}



export function fetchTeamStats() {
  return request.get<Api.Statistics.TeamStats>({
    url: '/app/admin/api/statistics/team'
  })
}



export function fetchTeamList(params: Api.Statistics.TeamListParams) {

  const { sDate, eDate, ...rest } = params || ({} as Api.Statistics.TeamListParams)
  const qp: Record<string, any> = { ...rest }

  if (sDate) {
    qp.sDate = sDate
    qp.startDate = /^(\d{8})$/.test(String(sDate))
      ? `${String(sDate).slice(0,4)}-${String(sDate).slice(4,6)}-${String(sDate).slice(6,8)}`
      : sDate
  }
  if (eDate) {
    qp.eDate = eDate
    qp.endDate = /^(\d{8})$/.test(String(eDate))
      ? `${String(eDate).slice(0,4)}-${String(eDate).slice(4,6)}-${String(eDate).slice(6,8)}`
      : eDate
  }
  return request.get<Api.Common.PaginatedResponse<Api.Statistics.TeamListItem>>({
    url: '/app/admin/api/statistics/team',
    params: qp
  })
}



export function fetchLotteryStats(params: Api.Statistics.LotteryParams) {
  return request.get<Api.Statistics.LotteryStats>({
    url: '/app/admin/api/statistics/lottery',
    params
  })
}



export function fetchFinanceStats(params: { startDate?: string; endDate?: string }) {
  return request.get<Api.Statistics.FinanceStats>({
    url: '/app/admin/api/statistics/finance',
    params
  })
}



export function fetchRetention() {
  return request.get<Api.Statistics.RetentionData>({
    url: '/app/admin/api/statistics/retention'
  })
}



export function fetchValueAnalysis() {
  return request.get<Api.Statistics.ValueAnalysisData>({
    url: '/app/admin/api/statistics/value-analysis'
  })
}



export function fetchDeviceDistribution() {
  return request.get<Api.Statistics.DeviceDistributionData>({
    url: '/app/admin/api/statistics/device-distribution'
  })
}



export function fetchTeamOverview() {
  return request.get<Api.Statistics.TeamStats>({
    url: '/app/admin/api/statistics/team/overview'
  })
}



export function fetchTeamLevels() {
  return request.get<Api.Statistics.TeamLevelItem[]>({
    url: '/app/admin/api/statistics/team/levels'
  })
}



export function fetchTeamCommissionTrend(params?: { startDate?: string; endDate?: string }) {
  return request.get<Api.Statistics.TrendData>({
    url: '/app/admin/api/statistics/team/commission-trend',
    params
  })
}



export function fetchTeamPerformanceTrend(params?: { startDate?: string; endDate?: string }) {
  return request.get<Api.Statistics.TrendData>({
    url: '/app/admin/api/statistics/team/performance-trend',
    params
  })
}



export function fetchTeamRank(params?: { by?: 'performance' | 'teamCount'; limit?: number }) {
  return request.get<Api.Statistics.TeamRankItem[]>({
    url: '/app/admin/api/statistics/team/rank',
    params
  })
}
