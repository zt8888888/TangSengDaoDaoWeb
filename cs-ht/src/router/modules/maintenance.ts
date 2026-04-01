import { AppRouteRecord } from '@/types/router'

export const maintenanceRoutes: AppRouteRecord = {
  path: '/maintenance',
  name: 'Maintenance',
  component: 'Layout',
  meta: {
    title: '运维管理',
    icon: 'ri:tools-line',
    sort: 99,
    roles: ['R_SUPER']
  },
  children: [
    {
      path: 'clear',
      name: 'DataClear',
      component: '/maintenance/clear/index',
      meta: {
        title: '数据清理',
        icon: 'ri:delete-bin-line',
        roles: ['R_SUPER']
      }
    },
    {
      path: 'notice',
      name: 'NoticeManage',
      component: '/maintenance/notice/index',
      meta: {
        title: '公告管理',
        icon: 'ri:notification-line',
        roles: ['R_SUPER']
      }
    },
    {
      path: 'task',
      name: 'TaskManage',
      component: '/maintenance/task/index',
      meta: {
        title: '计划任务',
        icon: 'ri:time-line',
        roles: ['R_SUPER']
      }
    },
    {
      path: 'server',
      name: 'MonitorServer',
      component: '/monitor/server/index',
      meta: {
        title: '服务监控',
        icon: 'ri:dashboard-3-line',
        roles: ['R_SUPER']
      }
    },
    {
      path: 'marquee',
      name: 'MarqueeManage',
      component: '/maintenance/marquee/index',
      meta: {
        title: '跑马灯设置',
        icon: 'ri:speaker-line',
        roles: ['R_SUPER']
      }
    },
    {
      path: 'quick-menu',
      name: 'QuickMenuManage',
      component: '/maintenance/quick-menu/index',
      meta: {
        title: '快捷菜单',
        icon: 'ri:apps-line',
        roles: ['R_SUPER']
      }
    },
    {
      path: 'quick-entry',
      name: 'QuickEntryManage',
      component: '/maintenance/quick-entry/index',
      meta: {
        title: '金刚区配置',
        icon: 'ri:layout-grid-line',
        roles: ['R_SUPER']
      }
    }
  ]
}
