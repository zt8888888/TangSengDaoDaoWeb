import request from '@/utils/http'


type GameParams = Record<string, unknown>
type GameData = Record<string, unknown>



export function fetchGameRecordList(params: GameParams) {
  return request.get<GameData>({
    url: '/app/admin/game/record-list',
    params
  })
}



export function fetchCancelBet(data: { id: number }) {
  return request.post({
    url: '/app/admin/game/cancel',
    data
  })
}



export function fetchAnomalyRecordList(params: GameParams) {
  return request.get<GameData>({
    url: '/app/admin/game/check-anomaly-list',
    params
  })
}
