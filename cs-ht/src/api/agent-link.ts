import request from '@/utils/http'

export interface AgentLink {
  id: number
  username: string
  type: number
  type_text?: string
  total_count: number
  used_count: number
  template: string
  created_at: string
  url?: string
}

export interface AgentLinkSearchParams {
  page?: number
  limit?: number
  username?: string
}

export interface AgentLinkList {
  list: AgentLink[]
  total: number
}


export function fetchAgentLinkList(params: AgentLinkSearchParams) {

  const cleanParams: any = {
    page: params.page || 1,
    limit: params.limit || 20
  }
  if (params.username) cleanParams.username = params.username

  return request.get<any>({
    url: '/app/admin/member/agent-link-list',
    params: cleanParams,
    returnFullResponse: true
  }).then(res => {

    return {
      list: res.data || [],
      total: res.count || 0
    } as AgentLinkList
  })
}


export function saveAgentLink(data: Partial<AgentLink>) {
  return request.post({
    url: '/app/admin/member/agent-link-save',
    data,
    showSuccessMessage: true
  })
}


export function deleteAgentLink(id: number) {
  return request.post({
    url: '/app/admin/member/agent-link-delete',
    data: { id },
    showSuccessMessage: true
  })
}
