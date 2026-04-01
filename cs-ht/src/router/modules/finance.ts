import { AppRouteRecord } from '@/types/router'

export const financeRoutes: AppRouteRecord = {
  path: '/finance',
  name: 'Finance',
  component: 'Layout',
  meta: {
    title: '财务管理',
    icon: 'ri:wallet-3-line',
    sort: 30
  },
  children: [
    {
      path: 'recharge',
      name: 'FinanceRecharge',
      component: '/finance/recharge/index',
      meta: {
        title: '充值管理',
        icon: 'ri:hand-coin-line'
      }
    },
    {
      path: 'withdraw',
      name: 'FinanceWithdraw',
      component: '/finance/withdraw/index',
      meta: {
        title: '提现管理',
        icon: 'ri:bank-card-line'
      }
    },
    {
      path: 'bank',
      name: 'FinanceBank',
      component: '/finance/bank/index',
      meta: {
        title: '提款银行配置',
        icon: 'ri:bank-line'
      }
    },
    {
      path: 'payset',
      name: 'FinancePaySet',
      component: '/finance/payset/index',
      meta: {
        title: '充值方式配置',
        icon: 'ri:settings-3-line'
      }
    },
    {
      path: 'rebate',
      name: 'FinanceRebate',
      component: '/finance/rebate/index',
      meta: {
        title: '反水管理',
        icon: 'ri:exchange-funds-line'
      }
    }
  ]
}
