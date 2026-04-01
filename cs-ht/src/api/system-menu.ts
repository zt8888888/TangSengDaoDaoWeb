import request from '@/utils/http'
import type { AppRouteRecord } from '@/types/router'



export interface MenuItem {
  id: number
  pid: number
  name: string
  title: string
  icon?: string
  path: string
  component?: string
  type: number
  sort: number
  status: number
  isHide?: boolean
  keepAlive?: boolean
  isIframe?: boolean
  link?: string
  authMark?: string
  roles?: string[]
  children?: MenuItem[]
  created_at?: string
  updated_at?: string
}

export interface MenuFormData {
  id?: number
  pid: number
  name: string
  title: string
  icon?: string
  path: string
  component?: string
  type: number
  sort: number
  status: number
  isHide?: boolean
  keepAlive?: boolean
  isIframe?: boolean
  link?: string
  authMark?: string
  roles?: string[]
}

export interface ParentOption {
  id: number
  title: string
  children?: ParentOption[]
}





export function fetchMenuTree() {
  return request.get<MenuItem[]>({
    url: '/app/admin/api/yzz-menu/tree'
  })
}



export function fetchFullMenuTree() {
  return request.get<MenuItem[]>({
    url: '/app/admin/api/yzz-menu/full-tree'
  })
}



export function fetchMenuList() {
  return request.get<MenuItem[]>({
    url: '/app/admin/api/yzz-menu/list'
  })
}



export function fetchMenuDetail(id: number) {
  return request.get<MenuItem>({
    url: '/app/admin/api/yzz-menu/detail',
    params: { id }
  })
}



export function createMenu(data: MenuFormData) {
  return request.post({
    url: '/app/admin/api/yzz-menu/add',
    data,
    showSuccessMessage: true
  })
}



export function updateMenu(data: MenuFormData) {
  return request.post({
    url: '/app/admin/api/yzz-menu/edit',
    data,
    showSuccessMessage: true
  })
}



export function deleteMenu(id: number) {
  return request.post({
    url: '/app/admin/api/yzz-menu/delete',
    data: { id },
    showSuccessMessage: true
  })
}



export function updateMenuStatus(id: number, status: number) {
  return request.post({
    url: '/app/admin/api/yzz-menu/status',
    data: { id, status },
    showSuccessMessage: true
  })
}



export function updateMenuSort(data: { id: number; sort: number }[]) {
  return request.post({
    url: '/app/admin/api/yzz-menu/sort',
    data: { items: data },
    showSuccessMessage: true
  })
}



export function fetchParentOptions() {
  return request.get<ParentOption[]>({
    url: '/app/admin/api/yzz-menu/parent-options'
  })
}



export function importMenus(menus: MenuItem[]) {
  return request.post({
    url: '/app/admin/api/yzz-menu/import',
    data: { menus },
    showSuccessMessage: true
  })
}





export function convertToRouteFormat(menus: MenuItem[]): AppRouteRecord[] {
  return menus.map(menu => ({
    path: menu.path,
    name: menu.name,
    component: menu.component,
    meta: {
      title: menu.title,
      icon: menu.icon,
      sort: menu.sort,
      isHide: menu.isHide,
      keepAlive: menu.keepAlive,
      isIframe: menu.isIframe,
      link: menu.link,
      authMark: menu.authMark,
      roles: menu.roles
    },
    children: menu.children ? convertToRouteFormat(menu.children) : undefined
  }))
}
