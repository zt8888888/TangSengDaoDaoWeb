import request from '@/utils/http'


const USE_MOCK = false

const mockDelay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

export interface YebProduct {
  id: number
  name: string
  type: 'current' | 'fixed'
  rate: number
  rate_desc: string
  duration_days: number
  settle_cycle_hours: number
  min_amount: number
  max_interest: number
  audit_multiple: number
  auto_claim: 0 | 1
  status: 0 | 1
  sort: number
}

export interface YebProductList {
  list: YebProduct[]
  total: number
}

export interface YebProductSearchParams {
  limit?: number
  page?: number
  page_size?: number
}



export function fetchProductList(params: YebProductSearchParams) {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      list: [
        {
          id: 1,
          name: '余额宝活期',
          type: 'current',
          rate: 0.0003,
          rate_desc: '七日年化2.1%',
          duration_days: 0,
          min_amount: 100,
          status: 1,
          sort: 1
        },
        {
          id: 2,
          name: '定期理财30天',
          type: 'fixed',
          rate: 0.0005,
          rate_desc: '年化5.4%',
          duration_days: 30,
          min_amount: 1000,
          status: 1,
          sort: 2
        }
      ],
      total: 2
    })) as any
  }
  return request.get<YebProductList>({
    url: '/app/admin/api/yebao/product-list',
    params
  })
}

export function fetchProductDetail(id: number) {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      id,
      name: '余额宝活期',
      type: 'current',
      rate: 0.0003,
      rate_desc: '七日年化2.1%',
      duration_days: 0,
      min_amount: 100,
      status: 1,
      sort: 1
    })) as any
  }
  return request.get<YebProduct>({
    url: '/app/admin/api/yebao/product-detail',
    params: { id }
  })
}

export function createProduct(data: Partial<YebProduct>) {
  if (USE_MOCK) return mockDelay()
  return request.post({
    url: '/app/admin/api/yebao/product-add',
    data,
    showSuccessMessage: true
  })
}

export function updateProduct(data: Partial<YebProduct>) {
  if (USE_MOCK) return mockDelay()
  return request.post({
    url: '/app/admin/api/yebao/product-edit',
    data,
    showSuccessMessage: true
  })
}

export function deleteProduct(id: number) {
  if (USE_MOCK) return mockDelay()
  return request.post({
    url: '/app/admin/api/yebao/product-delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function updateProductStatus(id: number, status: 0 | 1) {
  if (USE_MOCK) return mockDelay()
  return request.post({
    url: '/app/admin/api/yebao/product-status',
    data: { id, status },
    showSuccessMessage: true
  })
}

export function fetchProductOptions() {
  if (USE_MOCK) return mockDelay().then(() => [])
  return request.get<any>({
    url: '/app/admin/api/yebao/product-options'
  })
}

export function fetchProductTypeOptions() {
  if (USE_MOCK) {
    return mockDelay().then(() => [
      { label: '随存随取', value: 'current' },
      { label: '定期', value: 'fixed' }
    ])
  }
  return request.get<any>({
    url: '/app/admin/api/yebao/product-type-options'
  })
}



export interface YebHolding {
  id: number
  username: string
  order_id: string
  product_name: string
  amount: number
  type: 'current' | 'fixed'
  status: 'running' | 'settled' | 'cancelled'
  create_time: string
}

export interface YebHoldingList {
  list: YebHolding[]
  total: number
}

export interface YebHoldingSearchParams {
  page?: number
  page_size?: number
  username?: string
  order_id?: string
  type?: 'current' | 'fixed'
  status?: 'running' | 'settled' | 'cancelled'
}

export function fetchHoldingList(params: YebHoldingSearchParams) {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      list: [
        {
          id: 1,
          username: 'user001',
          order_id: 'ORD20231128001',
          product_name: '余额宝活期',
          amount: 5000,
          type: 'current',
          status: 'running',
          create_time: '2023-11-28 10:00:00'
        },
        {
          id: 2,
          username: 'user002',
          order_id: 'ORD20231128002',
          product_name: '定期理财30天',
          amount: 10000,
          type: 'fixed',
          status: 'settled',
          create_time: '2023-10-28 10:00:00'
        }
      ],
      total: 2
    })) as any
  }
  return request.get<YebHoldingList>({
    url: '/app/admin/api/yebao/holding-list',
    params
  })
}

export function fetchHoldingDetail(id: number) {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      id,
      username: 'user001',
      order_id: 'ORD20231128001',
      product_name: '余额宝活期',
      amount: 5000,
      type: 'current',
      status: 'running',
      create_time: '2023-11-28 10:00:00'
    })) as any
  }
  return request.get<YebHolding>({
    url: '/app/admin/api/yebao/holding-detail',
    params: { id }
  })
}

export function settleHolding(id: number) {
  if (USE_MOCK) return mockDelay()
  return request.post({
    url: '/app/admin/api/yebao/holding-settle',
    data: { id },
    showSuccessMessage: true
  })
}

export function deleteHolding(id: number) {
  if (USE_MOCK) return mockDelay()
  return request.post({
    url: '/app/admin/api/yebao/holding-delete',
    data: { id },
    showSuccessMessage: true
  })
}

export function fetchHoldingStats(params: YebHoldingSearchParams) {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      total_amount: 15000,
      current_amount: 5000,
      fixed_amount: 10000
    }))
  }
  return request.get<any>({
    url: '/app/admin/api/yebao/holding-stats',
    params
  })
}

export function fetchHoldingStatusOptions() {
  if (USE_MOCK) {
    return mockDelay().then(() => [
      { label: '收息中', value: 'running' },
      { label: '已结算', value: 'settled' },
      { label: '已取消', value: 'cancelled' }
    ])
  }
  return request.get<any>({
    url: '/app/admin/api/yebao/holding-status-options'
  })
}



export interface YebRecord {
  id: number
  username: string
  type: 'deposit' | 'withdraw' | 'interest' | 'settle'
  amount: number
  before_amount: number
  after_amount: number
  create_time: string
  remark: string
}

export interface YebRecordList {
  list: YebRecord[]
  total: number
}

export interface YebRecordSearchParams {
  page?: number
  page_size?: number
  username?: string
  type?: string
}

export function fetchRecordList(params: YebRecordSearchParams) {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      list: [
        {
          id: 1,
          username: 'user001',
          type: 'interest',
          amount: 1.5,
          before_amount: 5000,
          after_amount: 5001.5,
          create_time: '2023-11-28 00:00:00',
          remark: '每日收益'
        },
        {
          id: 2,
          username: 'user001',
          type: 'deposit',
          amount: 5000,
          before_amount: 0,
          after_amount: 5000,
          create_time: '2023-11-27 10:00:00',
          remark: '用户存入'
        }
      ],
      total: 2
    })) as any
  }
  return request.get<YebRecordList>({
    url: '/app/admin/api/yebao/record-list',
    params
  })
}

export function fetchRecordDetail(id: number) {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      id,
      username: 'user001',
      type: 'interest',
      amount: 1.5,
      before_amount: 5000,
      after_amount: 5001.5,
      create_time: '2023-11-28 00:00:00',
      remark: '每日收益'
    })) as any
  }
  return request.get<YebRecord>({
    url: '/app/admin/api/yebao/record-detail',
    params: { id }
  })
}

export function deleteRecord(id: number) {
  if (USE_MOCK) return mockDelay()
  return request.post({
    url: '/app/admin/api/yebao/record-delete',
    data: { id },
    showSuccessMessage: true
  })
}


export function fetchRecordTypeOptions() {
  if (USE_MOCK) {
    return mockDelay().then(() => [
      { label: '存入', value: 'deposit' },
      { label: '取出', value: 'withdraw' },
      { label: '收益发放', value: 'interest' },
      { label: '定期结算', value: 'settle' }
    ])
  }
  return request.get<any>({
    url: '/app/admin/api/yebao/record-type-options'
  })
}

export function adminDeposit(data: { username: string; product_id: number; amount: number; remark?: string }) {
  return request.post({
    url: '/app/admin/api/yebao/admin-deposit',
    data,
    showSuccessMessage: true
  })
}

export function adminWithdraw(data: { username: string; amount: number; type: string; remark?: string }) {
  return request.post({
    url: '/app/admin/api/yebao/admin-withdraw',
    data,
    showSuccessMessage: true
  })
}

export function fetchUserInfo(username: string) {
  return request.get<any>({
    url: '/app/admin/api/yebao/user-info',
    params: { username }
  })
}

export interface YebUserStats {
  username: string
  total_interest: number
  current_amount: number
  fixed_amount: number
  yesterday_interest: number
}

export interface YebUserStatsList {
  list: YebUserStats[]
  total: number
}

export function fetchUserStatsList(params: { page?: number; page_size?: number; username?: string }) {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      list: [
        {
          username: 'user001',
          total_interest: 50.5,
          current_amount: 5000,
          fixed_amount: 0,
          yesterday_interest: 1.5
        }
      ],
      total: 1
    })) as any
  }
  return request.get<YebUserStatsList>({
    url: '/app/admin/api/yebao/user-stats',
    params
  })
}

export interface YebOverview {
  user_count: number
  running_amount: number
  total_interest: number
  today_deposit: number
  today_withdraw: number
  today_interest: number
  product_count: number
}

export function fetchOverview() {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      user_count: 100,
      running_amount: 500000,
      total_interest: 15000,
      today_deposit: 10000,
      today_withdraw: 5000,
      today_interest: 150,
      product_count: 5
    })) as any
  }
  return request.get<YebOverview>({
    url: '/app/admin/api/yebao/overview'
  })
}



export interface YebConfig {
  settle_cycle: string
  settle_cycle_hours: number
  annual_rate: string
  annual_rate_value: number
  min_amount: number
  max_interest: string
  claim_time: string
  audit_multiple: number
  auto_claim: number
}

export function fetchConfig() {
  if (USE_MOCK) {
    return mockDelay().then(() => ({
      settle_cycle: '1小时',
      settle_cycle_hours: 1,
      annual_rate: '4%',
      annual_rate_value: 0.04,
      min_amount: 20,
      max_interest: '不限制',
      claim_time: '隔天领取',
      audit_multiple: 1
    })) as any
  }
  return request.get<YebConfig>({
    url: '/app/admin/api/yebao/config'
  })
}

export function saveConfig(data: YebConfig) {
  if (USE_MOCK) return mockDelay()
  return request.post({
    url: '/app/admin/api/yebao/config-save',
    data,
    showSuccessMessage: true
  })
}
