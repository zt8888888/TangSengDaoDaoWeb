import api from '@/utils/http'

export interface ActivityPopup {
  id: number
  title: string
  image: string
  jump_type: 'none' | 'url' | 'route' | 'activity'
  jump_url: string
  sort: number
  status: number
  created_at: string
}

export function fetchActivityPopupList(params: { page: number; limit: number }) {
  return api.get({
    url: '/app/admin/ActivityPopup/list',
    params,
    returnFullResponse: true
  })
}

export function createActivityPopup(data: Partial<ActivityPopup>) {
  return api.post({
    url: '/app/admin/ActivityPopup/save',
    data,
    returnFullResponse: true,
    showSuccessMessage: true
  })
}

export function updateActivityPopup(data: Partial<ActivityPopup>) {
  return api.post({
    url: '/app/admin/ActivityPopup/update',
    data,
    returnFullResponse: true,
    showSuccessMessage: true
  })
}

export function deleteActivityPopup(id: number) {
  return api.post({
    url: '/app/admin/ActivityPopup/delete',
    data: { id },
    returnFullResponse: true,
    showSuccessMessage: true
  })
}

export function setActivityPopupState(id: number, status: number) {
  return api.post({
    url: '/app/admin/ActivityPopup/setState',
    data: { id, status },
    returnFullResponse: true
  })
}
