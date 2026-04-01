

declare namespace Api {

  namespace Common {

    interface PaginationParams {

      current: number

      size: number

      total: number
    }

    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    type EnableStatus = '1' | '2'
  }

  namespace Auth {

    interface LoginParams {
      username: string
      password: string
      captcha?: string
      skip_captcha?: boolean
    }

    interface LoginResponse {
      id: number
      username: string
      nickname: string
      avatar: string
      email: string
      mobile: string
      roles: number[]
      access_token: string
      refresh_token: string
      token_type: string
      expires_in: number
    }

    interface RefreshTokenParams {
      refresh_token: string
    }

    interface RefreshTokenResponse {
      access_token: string
      expires_in: number
    }

    interface UserInfo {
      id: number
      username: string
      nickname: string
      avatar: string
      email: string
      mobile: string
      isSuperAdmin: boolean
      token?: string
      userId?: number
      roles?: string[]
      buttons?: string[]

      userName?: string

      realName?: string

      sex?: string

      address?: string

      des?: string

      title?: string

      department?: string

      tags?: string[]
    }

    interface UpdateProfileParams {
      realName?: string
      nickname?: string
      email?: string
      mobile?: string
      address?: string
      sex?: string
      des?: string
      avatar?: string
    }

    interface UpdatePasswordParams {
      oldPassword?: string
      newPassword?: string
      confirmPassword?: string
    }
  }

  namespace SystemManage {

    type UserList = Api.Common.PaginatedResponse<UserListItem>

    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >
  }

  namespace Statistics {

    interface OverviewStats {
      todayRegister: number
      todayRegisterChange: number
      todayActive: number
      todayActiveChange: number
      todayRecharge: number
      todayRechargeChange: number
      todayWithdraw: number
      todayWithdrawChange: number
      todayBet: number
      todayBetChange: number
      todayPrize: number
      todayPrizeChange: number
      todayProfit: number
      todayProfitChange: number
      platformBalance: number
      onlineCount: number
    }

    interface TrendData {
      xAxis: string[]
      series: {
        name: string
        data: number[]
      }[]
    }

    interface RealtimeItem {
      type: 'recharge' | 'withdraw' | 'bet' | 'win'
      content: string
      time: string
      amount: number
      username?: string
    }

    interface ProfitParams {
      startDate?: string
      endDate?: string
      lotteryType?: string
      userLevel?: string
    }

    interface ProfitStats {
      totalBet: number
      totalPrize: number
      totalRebate: number
      totalActivity: number
      netProfit: number
      profitRate: number
      dailyData: TrendData
      lotteryData: { name: string; value: number }[]
      costData?: { name: string; value: number }[]
      hourlyData?: TrendData
    }

    interface UserStats {
      summary: {
        totalUsers: number
        newUsers: number
        activeUsers: number
        rechargeUsers: number
        betUsers: number
        firstRechargeUsers: number
      }
      growthTrend: {
        date: string
        newUsers: number
        activeUsers: number
      }[]
      retention?: {
        day1: number
        day7: number
        day30: number
      }
      activeTrend?: TrendData
      valueAnalysis?: any
      deviceDistribution?: any
    }

    interface TeamStats {
      totalAgents: number
      directMembers: number
      teamMembers: number
      teamRecharge: number
      teamBet: number
      teamProfit: number
      commissionPaid: number

      totalUsers?: number
      totalMembers?: number
      onlineUsers?: number
    }

    interface TeamLevelItem {
      name: string
      value: number
    }

    interface TeamRankItem {
      username: string
      teamCount: number
      performance: number
    }

    interface TeamListItem {
      username: string
      totalcount: number
      agentcount: number
      usercount: number
      onlinecount: number
      zdrecharge: number
      sdjiarecharge: number
      sdjianrecharge: number
      withdraw: number
      ctyingkui: number
      touzhu: number
      zhongjiang: number
      huodong: number
      tzyingkui: number
    }

    interface TeamListParams {
      current: number
      size: number
      sDate?: string
      eDate?: string
      username?: string
    }

    interface LotteryParams {
      startDate?: string
      endDate?: string
      lotteryType?: string
      playType?: string
    }

    interface LotteryStats {
      list: {
        lotteryName: string
        betCount: number
        betAmount: number
        prizeAmount: number
        profitAmount: number
        profitRate: number
        userCount: number
      }[]
      pieData: { name: string; value: number }[]
      barData: TrendData
      hotPlay: {
        xAxis: string[]
        series: { name: string; data: number[]; itemStyle?: any }[]
      }
      peakHours: {
        xAxis: string[]
        series: { name: string; data: number[]; itemStyle?: any }[]
      }
      bigWins: {
        username: string
        lotteryName: string
        playName?: string
        playTitle?: string
        prizeAmount: number
        time: string
      }[]
    }

    interface RetentionData {
      summary: {
        avgDay1Rate: number
        avgDay3Rate: number
        avgDay7Rate: number
      }
      list: {
        date: string
        newUsers: number
        day1: number
        day1Rate: number
        day3?: number
        day3Rate?: number
        day7?: number
        day7Rate?: number
      }[]
    }

    interface ValueAnalysisData {
      summary: {
        totalUsers: number
        avgRecency: number
        avgFrequency: number
        avgMonetary: number
      }
      segments: {
        name: string
        value: number
        key: string
      }[]
    }

    interface DeviceDistributionData {
      deviceDistribution: {
        name: string
        value: number
      }[]
      hourlyActive: {
        hour: string
        count: number
      }[]
      totalUsers: number
    }

    interface FinanceStats {
      recharge: {
        totalAmount: number
        totalCount: number
        userCount: number
        avgAmount: number
        firstAmount: number
        firstCount: number
      }
      withdraw: {
        totalAmount: number
        totalCount: number
        userCount: number
        avgAmount: number
        pendingAmount: number
        pendingCount: number
      }
      channels: {
        name: string
        amount: number
        count: number
        successRate: number
      }[]
      trendData: TrendData
      largeTransactions?: any
      channelTrend?: TrendData
    }
  }
}
