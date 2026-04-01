import { AppRouteRecord } from '@/types/router'

export const activityRoutes: AppRouteRecord = {
  path: '/activity',
  name: 'Activity',
  component: 'Layout',
  meta: {
    title: '活动管理',
    icon: 'ri:gift-2-line',
    sort: 20
  },
  children: [
    {
      path: 'list',
      name: 'ActivityList',
      component: '/activity/index',
      meta: {
        title: '活动列表',
        icon: 'ri:list-check'
      }
    },
    {
      path: 'activity-category',
      name: 'ActivityCategory',
      component: '/activity/activity-category/index',
      meta: {
        title: '活动分类',
        icon: 'ri:folder-line'
      }
    },
    {
      path: 'type',
      name: 'ActivityType',
      component: '/activity/type/index',
      meta: {
        title: '活动类型',
        icon: 'ri:list-settings-line'
      }
    },
    {
      path: 'level-reward-config',
      name: 'LevelRewardConfig',
      component: '/activity/level-reward/config',
      meta: {
        title: '晋级奖励配置',
        icon: 'ri:vip-crown-line'
      }
    },
    {
      path: 'level-reward-record',
      name: 'LevelRewardRecord',
      component: '/activity/level-reward/record',
      meta: {
        title: '晋级记录',
        icon: 'ri:file-list-2-line'
      }
    },

    {
      path: 'participation-audit',
      name: 'ParticipationAudit',
      component: '/activity/participation-audit',
      meta: {
        title: '参与记录审核',
        icon: 'ri:file-check-line'
      }
    }
  ]
}
