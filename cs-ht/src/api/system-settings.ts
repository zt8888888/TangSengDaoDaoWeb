import request from '@/utils/http'

export interface SystemSettings {

  webtitle: string
  sitedomain: string
  logo: string
  float_icon: string
  float_icon_link: string
  promo_texts: string
  keywords: string
  description: string
  defaulttjcode: string
  loginerrornum_q: number
  loginerrorclosetime_q: number
  ipblackisopen: number
  ipblacklist: string
  ipwhiteisopen: number
  ipwhitelist: string

  fs_status: string
  fs_api_url: string
  fs_api_key: string
  fs_api_secret: string
  iskillorder: number
  sysBankMaxNum: number
  damaliang: number
  paiduinum: number
  tikuanstart: string
  tikuanend: string
  tikuannumoverbilv: number
  tikuannumovermin: number
  tikuannumovermax: number
  tikuanMin: number
  tikuanMax: number
  ritikuanxiane: number
  tikuannum: number
  fanDianMax: number
  fanDianMin: number
  pointchongzhi: number
  pointchongzhiadd: number
  kefuqq: string
  kefuthree: string
  tg_service_list: string

  loginerrornum: number
  loginerrorclosetime: number
  islogincode: number
  isemailcode: number
  adminemailcodetime: number
  getemailcode: string

  SMTP_HOST: string
  SMTP_SSL: number
  SMTP_PORT: string
  FROM_EMAIL: string
  SMTP_USER: string
  FROM_NAME: string
  REPLY_EMAIL: string
  REPLY_NAME: string
  SMTP_PASS: string

  caijieapiurl: string
  weballowips: string
  czaudioplay: number
  czaudioplaytime: number
  czaudioqxtime: number
  czaudio_url: string
  tkaudioplay: number
  tkaudioplaytime: number
  tkaudio_url: string
  cardaudioplay: number
  cardaudio_url: string
}

export function fetchSystemSettings() {
  return request.get<{ data: SystemSettings }>({
    url: '/app/admin/system/info',
    returnFullResponse: true
  }).then(res => {

    return res.data || {} as SystemSettings
  })
}

export function saveSystemSettings(data: Partial<SystemSettings>) {
  return request.post({
    url: '/app/admin/system/save',
    data: { info: data },
    showSuccessMessage: true
  })
}
