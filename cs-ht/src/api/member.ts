import request from '@/utils/http'

export interface MemberGroup {
  shengjiedu?: string
  jjje?: string
  free_withdraw_times?: string
  weekly_betting?: string
  weekly_bonus?: string
  monthly_betting?: string
  monthly_bonus?: string
  groupid: number
  groupname: string
  touhan: string
  fanshui: string
}

export interface MemberGroupSearchParams {
  page?: number
  limit?: number
  groupname?: string
}

export interface MemberGroupList {
  list: MemberGroup[]
  total: number
}

export function fetchMemberGroupList(params: MemberGroupSearchParams) {
  return request.get<MemberGroupList>({
    url: '/app/admin/membergroup/list',
    params
  })
}

export function createMemberGroup(data: Partial<MemberGroup>) {
  return request.post({
    url: '/app/admin/membergroup/add',
    data,
    showSuccessMessage: true
  })
}

export function updateMemberGroup(data: Partial<MemberGroup>) {
  return request.post({
    url: '/app/admin/membergroup/edit',
    data,
    showSuccessMessage: true
  })
}

export function deleteMemberGroup(id: number) {
  return request.post({
    url: '/app/admin/membergroup/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function saveMemberGroupLimit(data: Record<string, unknown>) {
  return request.post({
    url: '/app/admin/membergroup/save-limit-config',
    data,
    showSuccessMessage: true
  })
}

export function getMemberGroupLimit(id: number) {
  return request.get({
    url: '/app/admin/membergroup/get-limit',
    params: { id }
  })
}

export interface Member {
  id: number
  groupid?: number
  groupname: string
  username: string
  userbankname: string
  parent_username: string
  proxy_text: string
  proxy: number
  jinjijilu: string
  balance: number
  point: number
  yebmoney: number
  xima: number
  logintime_text: string
  loginsource: string
  isonline_text: string
  islock: number
  qq?: string
  nickname?: string
  loginip?: string
}

export interface MemberSearchParams {
  page?: number
  limit?: number
  ordertype?: number
  groupid?: number
  proxy?: number
  isnb?: number
  username?: string
  userbankname?: string
  qq?: string
  nickname?: string
  loginip?: string
  isonline?: number
  sDate?: string
  eDate?: string
  sAmount?: string
  eAmount?: string
}

export interface MemberList {
  list: Member[]
  total: number
}

export function fetchMemberList(params: MemberSearchParams) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
  )
  return request.get<MemberList>({
    url: '/app/admin/api/member/list',
    params: cleanParams
  })
}

export function updateMember(data: Partial<Member> & { password?: string }) {
  const { id, groupid, userbankname, nickname, qq, proxy, password } = data
  const payload: Record<string, string | number | undefined> = {
    id, groupid, userbankname, nickname: nickname || '', qq: qq || '', proxy
  }
  if (password) payload.password = password

  return request.post({
    url: '/app/admin/api/member/edit',
    data: payload,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    showSuccessMessage: true
  })
}

export function deleteMember(id: number) {
  return request.post({
    url: '/app/admin/api/member/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function kickMember(id: number) {
  return request.post({
    url: '/app/admin/api/member/kick',
    data: { id },
    showSuccessMessage: true
  })
}

export function createMember(data: Partial<Member>) {
  return request.post({
    url: '/app/admin/api/member/add',
    data,
    showSuccessMessage: true
  })
}

export function lockMember(id: number, islock: number) {
  return request.post({
    url: '/app/admin/api/member/lock',
    data: { id, islock },
    showSuccessMessage: true
  })
}

export function updateBalance(data: { id: number; balance: number; type: number; remark?: string }) {
  return request.post({
    url: '/app/admin/api/member/edit-balance',
    data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    showSuccessMessage: true
  })
}

export function updatePoint(data: { id: number; point: number; type: number; remark?: string }) {
  return request.post({
    url: '/app/admin/api/member/edit-point',
    data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    showSuccessMessage: true
  })
}

export function updateXima(data: { id: number; xima: number; type: number; remark?: string }) {
  return request.post({
    url: '/app/admin/api/member/edit-xima',
    data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    showSuccessMessage: true
  })
}

export function resetFundPassword(data: { id: number; password?: string }) {
  return request.post({
    url: '/app/admin/api/member/reset-fund-password',
    data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    showSuccessMessage: true
  })
}

export function fetchMemberInfo(id: number) {
  return request.get<Member>({
    url: '/app/admin/member/info',
    params: { id }
  })
}

export interface BalanceLogItem {
  id: number
  trano: string
  username: string
  typename: string
  amount: string
  amountbefor: string
  amountafter: string
  remark: string
  oddtime_text: string
}

export interface BalanceLogSearchParams {
  page?: number
  limit?: number
  uid?: number
  type?: string
  sDate?: string
  eDate?: string
  username?: string
  trano?: string
}

export interface BalanceLogList {
  list: BalanceLogItem[]
  total: number
}

export function fetchBalanceLog(params: BalanceLogSearchParams) {
  return request.get<{ data: BalanceLogItem[]; count: number }>({
    url: '/app/admin/api/member/balance-log-list',
    params,
    returnFullResponse: true
  }).then(res => {
    return {
      list: res.data || [],
      total: res.count || 0
    } as BalanceLogList
  })
}

export function fetchChildren(params: { parentid: number; page?: number; limit?: number }) {
  return request.get<MemberList>({
    url: '/app/admin/api/member/child-list',
    params
  })
}

export interface IpCheckItem {
  loginip: string
  usernames: string
  count: number
  last_login_time: string
}

export interface IpCheckList {
  list: IpCheckItem[]
  total: number
}

export function fetchIpCheckList(params: { page?: number; limit?: number }) {
  return request.get<IpCheckList>({
    url: '/app/admin/member/ip-check-data',
    params
  })
}

export interface OnlineUserItem {
  sessionId: string
  loginName: string
  deptName: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  status: 'on_line' | 'off_line'
  startTimestamp: string
  lastAccessTime: string
}

export interface OnlineUserList {
  list: OnlineUserItem[]
  total: number
}

export interface OnlineUserSearchParams {
  page?: number
  limit?: number
  ipaddr?: string
  loginName?: string
}

export function fetchOnlineUserList(params: OnlineUserSearchParams) {
  return request.get<OnlineUserList>({
    url: '/app/admin/api/monitor/online/list',
    params
  })
}

export function forceLogout(sessionId: string) {
  return request.post({
    url: '/app/admin/api/monitor/online/batchForceLogout',
    data: { ids: sessionId },
    showSuccessMessage: true
  })
}

export function batchForceLogout(sessionIds: string[]) {
  return request.post({
    url: '/app/admin/api/monitor/online/batchForceLogout',
    data: { ids: sessionIds.join(',') },
    showSuccessMessage: true
  })
}

export interface MemberSecurityInfo {
  id: number
  username: string
  phone: string
  phoneBind: boolean
  email: string
  emailBind: boolean
  googleBind: boolean
  hasFundPwd: boolean
  hasQuestion: boolean
}

export function fetchMemberSecurityInfo(id: number) {
  return request.get<MemberSecurityInfo>({
    url: '/app/admin/api/member/security-info',
    params: { id }
  })
}

export function resetMemberGoogle(id: number) {
  return request.post({
    url: '/app/admin/api/member/reset-google',
    data: { id },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    showSuccessMessage: true
  })
}

export function unbindMemberPhone(id: number) {
  return request.post({
    url: '/app/admin/api/member/unbind-phone',
    data: { id },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    showSuccessMessage: true
  })
}

export function unbindMemberEmail(id: number) {
  return request.post({
    url: '/app/admin/api/member/unbind-email',
    data: { id },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    showSuccessMessage: true
  })
}

export function resetMemberQuestion(id: number) {
  return request.post({
    url: '/app/admin/api/member/reset-question',
    data: { id },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    showSuccessMessage: true
  })
}
