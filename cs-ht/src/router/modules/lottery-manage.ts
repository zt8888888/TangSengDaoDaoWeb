import { AppRouteRecord } from '@/types/router'

export const lotteryManageRoutes: AppRouteRecord[] = [

  {
    path: '/statistics',
    name: 'Statistics',
    component: 'Layout',
    meta: {
      title: '数据统计',
      icon: 'ri:bar-chart-box-line',
      sort: 1,
      roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
    },
    children: [
      {
        path: 'overview',
        name: 'StatisticsOverview',
        component: '/statistics/overview/index',
        meta: {
          title: '统计概况',
          icon: 'ri:dashboard-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      },
      {
        path: 'user-operations',
        name: 'UserOperations',
        component: '/statistics/user-operations/index',
        meta: {
          title: '用户运营',
          icon: 'ri:user-heart-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      },
      {
        path: 'finance-analysis',
        name: 'FinanceAnalysis',
        component: '/statistics/finance-analysis/index',
        meta: {
          title: '财务分析',
          icon: 'ri:money-dollar-circle-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      },
      {
        path: 'lottery',
        name: 'StatisticsLottery',
        component: '/statistics/lottery/index',
        meta: {
          title: '彩种统计',
          icon: 'ri:ticket-2-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      }
    ]
  },


  {
    path: '/lottery',
    name: 'Lottery',
    component: 'Layout',
    meta: {
      title: '彩票管理',
      icon: 'ri:ticket-line',
      sort: 2,
      roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
    },
    children: [
      {
        path: 'lottery-list',
        name: 'LotteryList',
        component: '/lottery/lottery-list/index',
        meta: {
          title: '彩种列表',
          icon: 'ri:list-check',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      },
      {
        path: 'game-category',
        name: 'GameCategory',
        component: '/lottery/game-category/index',
        meta: {
          title: '游戏分类',
          icon: 'ri:apps-line',
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'game-list',
        name: 'GameList',
        component: '/lottery/game-list/index',
        meta: {
          title: '游戏列表',
          icon: 'ri:gamepad-line',
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'game-list/:platform',
        name: 'GameListDetail',
        component: '/lottery/game-list/detail',
        meta: {
          title: '游戏管理',
          icon: 'ri:gamepad-line',
          roles: ['R_SUPER', 'R_ADMIN'],
          isHide: true,
          activePath: '/lottery/game-list'
        }
      },
      {
        path: 'hot-games',
        name: 'HotGames',
        component: '/lottery/hot-games/index',
        meta: {
          title: '热门游戏',
          icon: 'ri:fire-line',
          roles: ['R_SUPER', 'R_ADMIN']
        }
      },
      {
        path: 'play-list',
        name: 'PlayList',
        component: '/lottery/play-list/index',
        meta: {
          title: '玩法管理',
          icon: 'ri:gamepad-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      },
      {
        path: 'result-list',
        name: 'LotteryResultList',
        component: '/lottery/result-list/index',
        meta: {
          title: '开奖管理',
          icon: 'ri:calendar-check-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      },
      {
        path: 'game-record',
        name: 'GameRecord',
        component: '/lottery/game-record/index',
        meta: {
          title: '游戏记录',
          icon: 'ri:file-list-3-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      },
      {
        path: 'abnormal-record',
        name: 'AbnormalRecord',
        component: '/lottery/abnormal-record/index',
        meta: {
          title: '注单异常检测',
          icon: 'ri:alarm-warning-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      },
      {
        path: 'pre-result',
        name: 'PreResult',
        component: '/lottery/pre-result/index',
        meta: {
          title: '系统彩预开奖',
          icon: 'ri:gift-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
        }
      },
      {
        path: 'pre-result-history',
        name: 'PreResultHistory',
        component: '/lottery/pre-result-history/index',
        meta: {
          title: '预开奖历史',
          icon: 'ri:history-line',
          roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],
          isHide: true,
          activePath: '/lottery/pre-result'
        }
      }
    ]
  }
]
