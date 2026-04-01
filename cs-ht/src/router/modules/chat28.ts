import { AppRouteRecord } from '@/types/router'

export const chat28Routes: AppRouteRecord = {
  path: '/chat28',
  name: 'Chat28',
  component: 'Layout',
  meta: {
    title: '聊天室28',
    icon: 'ri:message-3-line',
    sort: 98
  },
  children: [
    {
      path: 'live',
      name: 'Chat28Live',
      component: '/chat28/live/index',
      meta: {
        title: '实时监控',
        icon: 'ri:live-line'
      }
    },
    {
      path: 'config',
      name: 'Chat28Config',
      component: '/chat28/config/index',
      meta: {
        title: '机器人配置',
        icon: 'ri:settings-4-line'
      }
    },
    {
      path: 'robot',
      name: 'Chat28Robot',
      component: '/chat28/robot/index',
      meta: {
        title: '机器人管理',
        icon: 'ri:robot-line'
      }
    },
    {
      path: 'message',
      name: 'Chat28Message',
      component: '/chat28/message/index',
      meta: {
        title: '消息管理',
        icon: 'ri:chat-3-line'
      }
    }
  ]
}

