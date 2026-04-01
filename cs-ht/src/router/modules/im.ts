import { AppRouteRecord } from '@/types/router'

export const imRoutes: AppRouteRecord = {
  path: '/im',
  name: 'Im',
  component: 'Layout',
  meta: {
    title: 'IM管理',
    icon: 'ri:chat-4-line',
    sort: 97
  },
  children: [
    {
      path: 'group',
      name: 'ImGroup',
      component: '/im/group/index',
      meta: {
        title: '群聊管理',
        icon: 'ri:group-line'
      }
    },
    {
      path: 'group-message',
      name: 'ImGroupMessage',
      component: '/im/group-message/index',
      meta: {
        title: '群聊消息',
        icon: 'ri:message-2-line'
      }
    },
    {
      path: 'user-message',
      name: 'ImUserMessage',
      component: '/im/user-message/index',
      meta: {
        title: '用户消息',
        icon: 'ri:chat-1-line'
      }
    }
  ]
}
