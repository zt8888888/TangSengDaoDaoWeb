import request from '@/utils/http'


type LotteryParams = Record<string, unknown>
type LotteryData = Record<string, unknown>


export interface LotteryListResponse {
  list: LotteryData[]
  total: number
  stats?: {
    total: number
    active: number
    maintenance: number
    disabled: number
  }
}


export interface PlayListResponse {
  list: LotteryData[]
  data?: LotteryData[]
  total: number
  count?: number
}



export function fetchGetLotteryList(params: LotteryParams) {
  return request.get<LotteryListResponse>({
    url: '/app/admin/api/lottery/index',
    params
  })
}



export function fetchGetLotteryDetail(id: number) {
  return request.get<LotteryData>({
    url: '/app/admin/api/lottery/detail',
    params: { id }
  })
}



export function fetchGetActiveLotteryList() {
  return request.get<any>({
    url: '/app/admin/api/lottery/get-lottery-list'
  })
}



export function fetchSaveLottery(data: LotteryData) {
  return request.post({
    url: '/app/admin/api/lottery/save',
    data
  })
}



export function fetchSetLotteryStatus(data: { id: number; field: string; value: number }) {
  return request.post({
    url: '/app/admin/api/lottery/set-status',
    data
  })
}



export function fetchDeleteLottery(id: number) {
  return request.post({
    url: '/app/admin/api/lottery/delete',
    data: { id }
  })
}





export function fetchGetPlayList(params: LotteryParams) {
  return request.get<PlayListResponse>({
    url: '/app/admin/api/lottery/play-list',
    params
  })
}



export function fetchGetPlayDetail(id: number) {
  return request.get<LotteryData>({
    url: '/app/admin/api/lottery/play-detail',
    params: { id }
  })
}



export function fetchSavePlay(data: LotteryData) {
  return request.post({
    url: '/app/admin/api/lottery/play-save',
    data
  })
}



export function fetchSetPlayStatus(data: { id: number; isopen: number }) {
  return request.post({
    url: '/app/admin/api/lottery/play-status',
    data
  })
}





export function fetchGetPreResultList(params: { lottery_name: string }) {
  return request.get<any>({
    url: '/app/admin/api/lottery/pre-result-list',
    params
  })
}



export function fetchSavePreResult(data: LotteryData) {
  return request.post<LotteryData>({
    url: '/app/admin/api/lottery/pre-result-save',
    data
  })
}



export function fetchGetPreResultHistory(params: LotteryParams) {
  return request.get<any>({
    url: '/app/admin/api/lottery/pre-result-history',
    params
  })
}



export function fetchGetPreResultHistoryList(params: LotteryParams) {
  return request.get<any>({
    url: '/app/admin/api/lottery/pre-result-history-list',
    params
  })
}





export function fetchGetResultList(params: LotteryParams) {
  return request.get<any>({
    url: '/app/admin/api/lottery/result-list',
    params
  })
}



export function fetchAddResult(data: LotteryData) {
  return request.post({
    url: '/app/admin/api/lottery/result-add',
    data
  })
}



export function fetchEditResult(data: LotteryData) {
  return request.post({
    url: '/app/admin/api/lottery/result-edit',
    data
  })
}



export function fetchResetResult(data: { id: number }) {
  return request.post({
    url: '/app/admin/api/lottery/result-reset',
    data
  })
}



export function fetchDeleteResult(data: { id: number }) {
  return request.post({
    url: '/app/admin/api/lottery/result-delete',
    data
  })
}





export function fetchGetGameCategoryList(params?: LotteryParams) {
  return request.get<any>({
    url: '/app/admin/api/game-category/index',
    params
  })
}



export function fetchGetGameCategoryDetail(id: number) {
  return request.get<any>({
    url: '/app/admin/api/game-category/detail',
    params: { id }
  })
}



export function fetchSaveGameCategory(data: LotteryData) {
  return request.post({
    url: '/app/admin/api/game-category/save',
    data
  })
}



export function fetchSetGameCategoryStatus(data: { id: number; status: number }) {
  return request.post({
    url: '/app/admin/api/game-category/set-status',
    data
  })
}



export function fetchUpdateGameCategorySort(data: { id: number; sort: number }) {
  return request.post({
    url: '/app/admin/api/game-category/update-sort',
    data
  })
}



export function fetchDeleteGameCategory(id: number) {
  return request.post({
    url: '/app/admin/api/game-category/delete',
    data: { id }
  })
}
