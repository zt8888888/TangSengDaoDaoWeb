import { AppRouteRecord } from '@/types/router'

export const memberRoutes: AppRouteRecord = {
  path: '/member',
  name: 'Member',
  component: 'Layout',
  meta: {
    title: '会员管理',
    icon: 'ri:user-3-line',
    sort: 20
  },
  children: [
    {
      path: 'group',
      name: 'MemberGroup',
      component: '/member/group/index',
      meta: {
        title: '会员组',
        icon: 'ri:group-line'
      }
    },
    {
      path: 'team-profile',
      name: 'TeamProfile',
      component: '/statistics/team/index',
      meta: {
        title: '团队概况',
        icon: 'ri:team-line',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'ip-check',
      name: 'IpCheck',
      component: '/member/ip-check/index',
      meta: {
        title: '同IP会员检测',
        icon: 'ri:shield-user-line'
      }
    },
    {
      path: 'withdraw-account',
      name: 'WithdrawAccount',
      component: '/member/withdraw-account/index',
      meta: {
        title: '提现账户管理',
        icon: 'ri:bank-card-line'
      }
    },
    {
      path: 'balance-log',
      name: 'BalanceLog',
      component: '/member/balance-log/index',
      meta: {
        title: '账变记录',
        icon: 'ri:file-list-3-line'
      }
    },
    {
      path: 'bank-info',
      name: 'BankInfo',
      component: '/member/bank-info/index',
      meta: {
        title: '银行信息管理',
        icon: 'ri:bank-line'
      }
    },
    {
      path: 'agent-link',
      name: 'AgentLink',
      component: '/member/agent-link/index',
      meta: {
        title: '代理注册链接',
        icon: 'ri:share-line'
      }
    },
    {
      path: 'agent-commission',
      name: 'AgentCommission',
      component: '/member/agent-commission/index',
      meta: {
        title: '代理佣金管理',
        icon: 'ri:money-cny-circle-line'
      }
    },
    {
      path: 'login-log',
      name: 'LoginLog',
      component: '/member/login-log/index',
      meta: {
        title: '登录日志',
        icon: 'ri:history-line'
      }
    },
    {
      path: 'notice',
      name: 'Notice',
      component: '/member/notice/index',
      meta: {
        title: '站内信管理',
        icon: 'ri:message-3-line'
      }
    },
    {
      path: 'list',
      name: 'MemberList',
      component: '/member/list/index',
      meta: {
        title: '会员列表',
        icon: 'ri:user-search-line'
      }
    }
  ]
}
