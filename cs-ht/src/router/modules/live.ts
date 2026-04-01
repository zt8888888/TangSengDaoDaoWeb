import { AppRouteRecord } from '@/types/router'

export const liveRoutes: AppRouteRecord = {
  path: '/live',
  name: 'Live',
  component: 'Layout',
  meta: {
    title: '真人视讯',
    icon: 'ri:gamepad-line',
    sort: 25
  },
  children: [
    {
      path: 'platform',
      name: 'GamePlatform',
      component: '/live/platform/index',
      meta: {
        title: '商户信息',
        icon: 'ri:store-3-line'
      }
    },
    {
      path: 'bet',
      name: 'GameBet',
      component: '/live/bet/index',
      meta: {
        title: '投注记录',
        icon: 'ri:file-list-line'
      }
    },
    {
      path: 'transfer',
      name: 'GameTransfer',
      component: '/live/transfer/index',
      meta: {
        title: '额度转让',
        icon: 'ri:exchange-cny-line'
      }
    }
  ]
}
