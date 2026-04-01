import request from '@/utils/http'

export interface ImGroup {
  id: number
  name: string
  avatar: string
  owner_id: number
  owner_name: string
  member_count: number
  max_members: number
  notice: string
  status: number
  status_text: string
  created_at: string
  updated_at: string
}

export interface ImGroupMember {
  id: number
  group_id: number
  user_id: number
  username: string
  nickname: string
  avatar: string
  role: string
  role_text: string
  joined_at: string
}

export interface ImGroupMessage {
  id: number
  group_id: number
  group_name: string
  sender_id: number
  sender_name: string
  sender_avatar: string
  content: string
  message_type: string
  message_type_text: string
  created_at: string
}

export interface ImUserMessage {
  id: number
  from_user_id: number
  from_username: string
  from_avatar: string
  to_user_id: number
  to_username: string
  to_avatar: string
  content: string
  message_type: string
  message_type_text: string
  is_read: number
  created_at: string
}

export interface GroupSearchParams {
  page?: number
  limit?: number
  name?: string
  owner_name?: string
  status?: number | string
}

export interface GroupMessageSearchParams {
  page?: number
  limit?: number
  group_id?: number | string
  sender_name?: string
  message_type?: string
  sDate?: string
  eDate?: string
}

export interface UserMessageSearchParams {
  page?: number
  limit?: number
  from_username?: string
  to_username?: string
  message_type?: string
  sDate?: string
  eDate?: string
}

export function fetchGroupList(params: GroupSearchParams) {
  return request.get<{ total: number; list: ImGroup[] }>({
    url: '/app/admin/api/im/group/list',
    params
  })
}

export function fetchGroupDetail(id: number) {
  return request.get<ImGroup>({
    url: '/app/admin/api/im/group/detail',
    params: { id }
  })
}

export function createGroup(data: Partial<ImGroup>) {
  return request.post({
    url: '/app/admin/api/im/group/create',
    data,
    showSuccessMessage: true
  })
}

export function updateGroup(data: Partial<ImGroup>) {
  return request.post({
    url: '/app/admin/api/im/group/update',
    data,
    showSuccessMessage: true
  })
}

export function deleteGroup(id: number) {
  return request.post({
    url: '/app/admin/api/im/group/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function toggleGroupStatus(id: number) {
  return request.post({
    url: '/app/admin/api/im/group/toggle-status',
    data: { id },
    showSuccessMessage: true
  })
}

export function fetchGroupMembers(group_id: number) {
  return request.get<{ list: ImGroupMember[] }>({
    url: '/app/admin/api/im/group/members',
    params: { group_id }
  })
}

export function removeGroupMember(group_id: number, user_id: number) {
  return request.post({
    url: '/app/admin/api/im/group/remove-member',
    data: { group_id, user_id },
    showSuccessMessage: true
  })
}

export function fetchGroupMessageList(params: GroupMessageSearchParams) {
  return request.get<{ total: number; list: ImGroupMessage[] }>({
    url: '/app/admin/api/im/group-message/list',
    params
  })
}

export function deleteGroupMessage(id: number) {
  return request.post({
    url: '/app/admin/api/im/group-message/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function batchDeleteGroupMessage(ids: number[]) {
  return request.post({
    url: '/app/admin/api/im/group-message/batch-delete',
    data: { ids },
    showSuccessMessage: true
  })
}

export function fetchUserMessageList(params: UserMessageSearchParams) {
  return request.get<{ total: number; list: ImUserMessage[] }>({
    url: '/app/admin/api/im/user-message/list',
    params
  })
}

export function deleteUserMessage(id: number) {
  return request.post({
    url: '/app/admin/api/im/user-message/delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function batchDeleteUserMessage(ids: number[]) {
  return request.post({
    url: '/app/admin/api/im/user-message/batch-delete',
    data: { ids },
    showSuccessMessage: true
  })
}

export function fetchGroupOptions() {
  return request.get<{ value: number; label: string }[]>({
    url: '/app/admin/api/im/group/options'
  })
}
