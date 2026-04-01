import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'
import { BaseResponse } from '@/types'
import { apiDecrypt, apiEncrypt, isEncryptedResponse } from '@/utils/crypto/api'

const ENABLE_ENCRYPTION = true

export const HTTP_CONFIG = {
  REQUEST_TIMEOUT: 15000,
  LOGOUT_DELAY: 500,
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
  UNAUTHORIZED_DEBOUNCE_TIME: 3000
} as const

const { REQUEST_TIMEOUT, LOGOUT_DELAY, MAX_RETRIES, RETRY_DELAY, UNAUTHORIZED_DEBOUNCE_TIME } = HTTP_CONFIG

let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
  returnFullResponse?: boolean
  _retry?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      if (isEncryptedResponse(headers)) {
        try {
          const decrypted = apiDecrypt(data)
          if (decrypted !== null) {
            return decrypted
          }
          return data
        } catch (e) {
          return data
        }
      }

      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

async function tryRefreshToken(): Promise<string | null> {
  const userStore = useUserStore()
  const refreshTokenValue = userStore.refreshToken

  if (!refreshTokenValue) {
    return null
  }

  try {
    const res = await axios.post(
      `${VITE_API_URL}/app/admin/account/refreshToken`,
      `refresh_token=${encodeURIComponent(refreshTokenValue)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: REQUEST_TIMEOUT
      }
    )
    if (res.data?.code === 0 && res.data?.data?.access_token) {
      userStore.setToken(res.data.data.access_token)
      return res.data.data.access_token
    }
    return null
  } catch {
    return null
  }
}

axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.accessToken) request.headers.set('Authorization', `Bearer ${userStore.accessToken}`)

    if (request.data && !(request.data instanceof FormData)) {
      if (ENABLE_ENCRYPTION && ['post', 'put', 'patch'].includes(request.method?.toLowerCase() || '')) {
        const encrypted = apiEncrypt(request.data)
        request.data = encrypted
        request.headers.set('Content-Type', 'text/plain')
        request.headers.set('X-Encrypted', '1')
      } else if (!request.headers['Content-Type']) {
        request.headers.set('Content-Type', 'application/x-www-form-urlencoded')
        request.data = Object.keys(request.data)
          .filter((key) => request.data[key] !== undefined)
          .map((key) => {
            const value = request.data[key]
            const encodedValue = value === null ? '' : encodeURIComponent(String(value))
            return `${encodeURIComponent(key)}=${encodedValue}`
          })
          .join('&')
      }
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const { code, msg } = response.data
    if (code === ApiStatus.success) return response
    if (code === ApiStatus.unauthorized) {
      return handleUnauthorizedWithRefresh(response.config as ExtendedAxiosRequestConfig, msg)
    }
    throw createHttpError(msg || $t('httpMsg.requestFailed'), code)
  },
  async (error) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig

    if (error.response?.status === ApiStatus.unauthorized && !originalRequest._retry) {
      return handleUnauthorizedWithRefresh(originalRequest)
    }

    return Promise.reject(handleError(error))
  }
)

async function handleUnauthorizedWithRefresh(
  originalRequest: ExtendedAxiosRequestConfig,
  message?: string
): Promise<any> {
  if (originalRequest._retry) {
    return handleUnauthorizedError(message)
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((token: string) => {
        if (!token) {
          reject(createHttpError(message || 'Unauthorized', ApiStatus.unauthorized))
          return
        }
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers['Authorization'] = `Bearer ${token}`
        resolve(axiosInstance(originalRequest))
      })
    })
  }

  originalRequest._retry = true
  isRefreshing = true

  try {
    const newToken = await tryRefreshToken()

    if (newToken) {
      onTokenRefreshed(newToken)
      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`
      return axiosInstance(originalRequest)
    } else {
      onTokenRefreshed('')
      return handleUnauthorizedError(message)
    }
  } catch {
    onTokenRefreshed('')
    return handleUnauthorizedError(message)
  } finally {
    isRefreshing = false
  }
}

function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    showError(error, true)
    throw error
  }

  throw error
}

function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

function logOut() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config)

    if (config.showSuccessMessage && res.data.msg) {
      showSuccess(res.data.msg)
    }

    if (config.returnFullResponse) {
      return res.data as unknown as T
    }

    return res.data.data as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  }
}

export default api
