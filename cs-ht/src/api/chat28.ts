import request from '@/utils/http'

export interface RobotConfig {
  id: number
  name: string
  lottery_codes: string | string[]
  lottery_codes_arr: string[]
  is_enabled: number
  min_bet_amount: number
  max_bet_amount: number
  bet_interval_min: number
  bet_interval_max: number
  bet_count_min: number
  bet_count_max: number
  play_types: string
  created_at: string
  updated_at: string
}

export interface ChatRobot {
  id: number
  username: string
  nickname: string
  face: string
  balance: number
  islock: number
  islock_text: string
  regtime: string
  logintime: string
}

export interface ChatMessage {
  id: number
  lottery_code: string
  issue: string
  user_id: number
  user_name: string
  avatar: string
  content: string
  message_type: string
  message_type_text: string
  is_system: number
  created_at: string
}

export interface Chat28Stats {
  robot_count: number
  today_messages: number
  today_bets: number
  today_amount: number
  config_enabled: boolean
}

export interface LotteryOption {
  value: string
  label: string
}

export interface BotConfig {
  robot_name: string
  robot_avatar: string
  bill_enabled: number
  result_enabled: number
  sealed_notice_enabled: number
  draw_notice_enabled: number
  msg_pre_sealed: string
  msg_sealed_line: string
  msg_no_talk: string
  msg_draw_coming: string
}

export function fetchConfigList() {
  return request.get<{ total: number; list: RobotConfig[] }>({
    url: '/app/admin/api/chat28/config/list'
  })
}

export function fetchConfigDetail(id: number) {
  return request.get<RobotConfig>({
    url: '/app/admin/api/chat28/config/detail',
    params: { id }
  })
}

export function createConfig(data: Partial<RobotConfig>) {
  return request.post({
    url: '/app/admin/api/chat28/config/create',
    data,
    showSuccessMessage: true
  })
}

export function updateConfig(data: Partial<RobotConfig>) {
  return request.post({
    url: '/app/admin/api/chat28/config/update',
    data,
    showSuccessMessage: true
  })
}

export function toggleConfig(id: number) {
  return request.post({
    url: '/app/admin/api/chat28/config/toggle',
    data: { id },
    showSuccessMessage: true
  })
}

export function deleteConfig(id: number) {
  return request.post({
    url: '/app/admin/api/chat28/config/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export interface RobotSearchParams {
  page?: number
  limit?: number
  username?: string
  status?: string
}

export function fetchRobotList(params: RobotSearchParams) {
  return request.get<{ total: number; list: ChatRobot[] }>({
    url: '/app/admin/api/chat28/robot/list',
    params
  })
}

export function createRobot(data: Partial<ChatRobot>) {
  return request.post({
    url: '/app/admin/api/chat28/robot/create',
    data,
    showSuccessMessage: true
  })
}

export function batchCreateRobot(data: { prefix: string; count: number; balance: number }) {
  return request.post({
    url: '/app/admin/api/chat28/robot/batch-create',
    data,
    showSuccessMessage: true
  })
}

export function updateRobot(data: Partial<ChatRobot>) {
  return request.post({
    url: '/app/admin/api/chat28/robot/update',
    data,
    showSuccessMessage: true
  })
}

export function deleteRobot(id: number) {
  return request.post({
    url: '/app/admin/api/chat28/robot/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function batchRechargeRobot(data: { amount: number; min_balance: number }) {
  return request.post({
    url: '/app/admin/api/chat28/robot/batch-recharge',
    data,
    showSuccessMessage: true
  })
}

export interface MessageSearchParams {
  page?: number
  limit?: number
  lottery_code?: string
  username?: string
  message_type?: string
  sDate?: string
  eDate?: string
}

export function fetchMessageList(params: MessageSearchParams) {
  return request.get<{ total: number; list: ChatMessage[] }>({
    url: '/app/admin/api/chat28/message/list',
    params
  })
}

export function deleteMessage(id: number) {
  return request.post({
    url: '/app/admin/api/chat28/message/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function sendSystemMessage(data: { lottery_code: string; content: string }) {
  return request.post({
    url: '/app/admin/api/chat28/message/send-system',
    data,
    showSuccessMessage: true
  })
}

export function fetchStats(lottery_code?: string) {
  return request.get<Chat28Stats>({
    url: '/app/admin/api/chat28/stats',
    params: { lottery_code }
  })
}

export function fetchLotteryOptions() {
  return request.get<LotteryOption[]>({
    url: '/app/admin/api/chat28/lottery-options'
  })
}

export function fetchBotConfig() {
  return request.get<BotConfig>({
    url: '/app/admin/api/chat28/bot-config'
  })
}

export function saveBotConfig(data: Partial<BotConfig>) {
  return request.post({
    url: '/app/admin/api/chat28/bot-config-save',
    data,
    showSuccessMessage: true
  })
}

