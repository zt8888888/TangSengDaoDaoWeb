import request from '@/utils/http'

export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/app/admin/account/login',
    data: params
  })
}

export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/app/admin/account/info'
  })
}

export function fetchRefreshToken(params: Api.Auth.RefreshTokenParams) {
  return request.post<Api.Auth.RefreshTokenResponse>({
    url: '/app/admin/account/refreshToken',
    data: params
  })
}

export function fetchLogout() {
  return request.post({
    url: '/app/admin/account/logout'
  })
}

export function fetchUpdateUserProfile(data: Api.Auth.UpdateProfileParams | Api.Auth.UserInfo) {
  return request.post({
    url: '/app/admin/account/update',
    data,
    showSuccessMessage: true
  })
}

export function fetchUpdatePassword(data: Api.Auth.UpdatePasswordParams) {
  return request.post({
    url: '/app/admin/account/password',
    data,
    showSuccessMessage: true
  })
}
