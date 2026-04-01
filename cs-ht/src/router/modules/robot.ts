import { AppRouteRecord } from '@/types/router'

export const robotRoutes: AppRouteRecord = {
  path: '/robot',
  name: 'Robot',
  component: 'Layout',
  meta: {
    title: '机器人与发单',
    icon: 'ri:robot-line',
    sort: 99
  },
  children: [
    {
      path: 'manage',
      name: 'RobotManage',
      component: '/robot/manage/index',
      meta: {
        title: '机器人管理',
        icon: 'ri:settings-3-line'
      }
    },
    {
      path: 'send-order',
      name: 'RobotSendOrder',
      component: '/robot/send-order/index',
      meta: {
        title: '发单设置',
        icon: 'ri:list-settings-line'
      }
    },
    {
      path: 'hemai',
      name: 'RobotHeMai',
      component: '/robot/hemai/index',
      meta: {
        title: '合买列表',
        icon: 'ri:file-list-line'
      }
    }
  ]
}
