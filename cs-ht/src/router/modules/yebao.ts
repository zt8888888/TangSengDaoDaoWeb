import { AppRouteRecord } from '@/types/router'

export const yebaoRoutes: AppRouteRecord = {
  path: '/yebao',
  name: 'Yebao',
  component: 'Layout',
  meta: {
    title: '余额宝管理',
    icon: 'ri:money-cny-box-line',
    sort: 25
  },
  children: [
    {
      path: 'product-list',
      name: 'YebProduct',
      component: '/Yebgroup/index',
      meta: {
        title: '余额宝类型',
        icon: 'ri:list-settings-line'
      }
    },
    {
      path: 'holding-list',
      name: 'YebHolding',
      component: '/Yebrecord/index',
      meta: {
        title: '余额宝记录',
        icon: 'ri:file-list-line'
      }
    },
    {
      path: 'revenue-list',
      name: 'YebRecord',
      component: '/Yebrecord/shouyi',
      meta: {
        title: '余额宝收益',
        icon: 'ri:hand-coin-line'
      }
    },
    {
      path: 'config',
      name: 'YebConfig',
      component: '/Yebconfig/index',
      meta: {
        title: '利息宝配置',
        icon: 'ri:settings-3-line'
      }
    }
  ]
}
