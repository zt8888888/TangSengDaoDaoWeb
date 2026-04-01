import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

export function fetchGetMenuList() {
  return request.get<any>({
    url: '/app/admin/api/yzz-menu/full-tree'
  }).then(res => {

    return convertMenuToRoute(res || [])
  })
}

function convertMenuToRoute(menus: any[]): AppRouteRecord[] {
  return menus.map(menu => ({
    id: menu.id,
    pid: menu.pid,
    path: menu.path,
    name: menu.name,
    component: menu.component,
    meta: {
      title: menu.title,
      icon: menu.icon,
      sort: menu.sort,
      isHide: menu.isHide || menu.status === 0,
      isHideTab: menu.isHideTab,
      keepAlive: menu.keepAlive,
      isIframe: menu.isIframe,
      link: menu.link,
      showBadge: menu.showBadge,
      showTextBadge: menu.showTextBadge,
      fixedTab: menu.fixedTab,
      activePath: menu.activePath,
      roles: menu.roles,
      authList: menu.children?.filter((c: any) => c.type === 2).map((c: any) => ({
        title: c.title,
        authMark: c.authMark,
        id: c.id
      })) || []
    },
    children: menu.children ? convertMenuToRoute(menu.children.filter((c: any) => c.type !== 2)) : undefined
  }))
}
