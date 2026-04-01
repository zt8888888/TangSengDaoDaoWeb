import request from '@/utils/http'



export interface GameBet {
  id: number
  username: string
  platform: string
  game_name: string
  order_no: string
  bet_amount: string
  valid_bet: string
  win_amount: string
  profit: string
  status: string
  bet_time: string
  settle_time?: string
}

export interface BetSearchParams {
  page?: number
  limit?: number
  username?: string
  platform?: string
  order_no?: string
  status?: string
  start_time?: string
  end_time?: string
}

export interface BetListResponse {
  list: GameBet[]
  total: number
  stats?: {
    total_bet: string
    total_win: string
    total_profit: string
  }
}

export function fetchBetList(params: BetSearchParams) {
  return request.get<any>({
    url: '/app/admin/api/game/bet-list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0,
      stats: res.stats
    } as BetListResponse
  })
}

export function fetchBetStatusOptions() {
  return request.get<{value: string, label: string}[]>({
    url: '/app/admin/api/game/bet-status-options'
  })
}

export function syncBetRecords(data?: { start_time?: string; end_time?: string }) {
  return request.post<any>({
    url: '/app/admin/api/game/sync-bet-records',
    data,
    showSuccessMessage: true
  })
}



export interface GameTransfer {
  id: number
  trano: string
  username: string
  platform: string
  type: string
  amount: string
  before_amount?: string
  after_amount?: string
  status: number
  created_at: string
}

export interface TransferSearchParams {
  page?: number
  limit?: number
  username?: string
  platform?: string
  trano?: string
  type?: string
  status?: number
  start_time?: string
  end_time?: string
}

export interface TransferListResponse {
  list: GameTransfer[]
  total: number
}

export function fetchTransferList(params: TransferSearchParams) {
  return request.get<any>({
    url: '/app/admin/api/game/transfer-list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as TransferListResponse
  })
}

export function manualTransfer(data: { username: string; platform: string; type: string; amount: number }) {
  return request.post({
    url: '/app/admin/api/game/transfer-manual',
    data,
    showSuccessMessage: true
  })
}

export function recallAllTransfer() {
  return request.post({
    url: '/app/admin/api/game/transfer-recall-all',
    showSuccessMessage: true
  })
}

export function fetchTransferTypeOptions() {
  return request.get<{value: string, label: string}[]>({
    url: '/app/admin/api/game/transfer-type-options'
  })
}

export function fetchTransferStatusOptions() {
  return request.get<{value: number, label: string}[]>({
    url: '/app/admin/api/game/transfer-status-options'
  })
}
