import axios, { AxiosResponse } from "axios";

type ApiPerfStats = {
    count: number
    slowCount: number
    totalMs: number
    maxMs: number
}

const getApiPerfConfig = () => {
    const enabledByEnv = typeof process !== "undefined" && (process as any)?.env?.REACT_APP_PERF_API === "1"
    const thresholdByEnvRaw = typeof process !== "undefined" ? (process as any)?.env?.REACT_APP_PERF_API_THRESHOLD_MS : undefined
    const thresholdByEnv = thresholdByEnvRaw ? Number(thresholdByEnvRaw) : undefined

    let enabledByStorage = false
    let thresholdByStorage: number | undefined
    if (typeof window !== "undefined") {
        try {
            enabledByStorage = window.localStorage?.getItem("tsdd_perf_api") === "1"
            const v = window.localStorage?.getItem("tsdd_perf_api_threshold_ms")
            if (v != null && v !== "") {
                const n = Number(v)
                if (Number.isFinite(n) && n > 0) {
                    thresholdByStorage = n
                }
            }
        } catch {
            // ignore
        }
    }

    const enabled = enabledByEnv || enabledByStorage
    const thresholdMs = thresholdByStorage ?? thresholdByEnv ?? 800

    return {
        enabled,
        thresholdMs,
    }
}

const getNowMs = () => {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
        return performance.now()
    }
    return Date.now()
}


export class APIClientConfig {
    private _apiURL: string =""
    private _token:string = ""
    tokenCallback?:()=>string|undefined
    // private _apiURL: string = "/api/v1/" // 正式打包用此地址
    

    set apiURL(apiURL:string) {
        this._apiURL = apiURL;
        axios.defaults.baseURL = apiURL;
    }
    get apiURL():string {
        return this._apiURL
    }
}

export default class APIClient {
    private constructor() {
        this.initAxios()
    }
    public static shared = new APIClient()
    public config = new APIClientConfig()
    public logoutCallback?:()=>void

    private logoutTriggeredAt: number = 0

    initAxios() {
        const self = this

        const perf = getApiPerfConfig()
        const perfStats: Record<string, ApiPerfStats> | undefined = perf.enabled ? {} : undefined
        if (perf.enabled && typeof window !== "undefined") {
            ;(window as any).__TSDD_API_PERF__ = {
                enabled: true,
                thresholdMs: perf.thresholdMs,
                stats: perfStats,
                help: "Enable via localStorage: tsdd_perf_api=1, optional tsdd_perf_api_threshold_ms=800",
            }
        }

        const triggerLogoutOnce = () => {
            const now = Date.now()
            // 防止 401 风暴导致反复触发登出/刷新
            if (now - self.logoutTriggeredAt < 1500) {
                return
            }
            self.logoutTriggeredAt = now
            try {
                if (self.logoutCallback) {
                    self.logoutCallback()
                }
            } catch (e) {
                // 不让登出流程被异常打断
                // eslint-disable-next-line no-console
                console.error("logoutCallback error", e)
            }
        }

        axios.interceptors.request.use(function (config) {
            if (perf.enabled) {
                ;(config as any).__tsddPerfStart = getNowMs()
            }
            let token:string | undefined
            if(self.config.tokenCallback) {
                token = self.config.tokenCallback()
            }
            if (token && token !== "") {
                config.headers!["token"] = token;
            }
            return config;
        });

        axios.interceptors.response.use(function (response) {
            if (perf.enabled) {
                try {
                    const cfg: any = response.config
                    const start = cfg?.__tsddPerfStart
                    const end = getNowMs()
                    const durationMs = typeof start === "number" ? end-start : undefined
                    const method = (cfg?.method || "GET").toUpperCase()
                    const url = cfg?.url || ""
                    const key = `${method} ${url}`
                    if (durationMs != null && perfStats) {
                        const s = perfStats[key] || (perfStats[key] = { count: 0, slowCount: 0, totalMs: 0, maxMs: 0 })
                        s.count += 1
                        s.totalMs += durationMs
                        if (durationMs > s.maxMs) s.maxMs = durationMs
                        if (durationMs >= perf.thresholdMs) {
                            s.slowCount += 1
                            // eslint-disable-next-line no-console
                            console.warn("[API:slow]", { key, ms: Math.round(durationMs), status: response.status })
                        }
                    }
                } catch {
                    // ignore
                }
            }
            return response;
        }, function (error) {
            if (perf.enabled) {
                try {
                    const cfg: any = error?.config
                    const start = cfg?.__tsddPerfStart
                    const end = getNowMs()
                    const durationMs = typeof start === "number" ? end-start : undefined
                    const method = (cfg?.method || "GET").toUpperCase()
                    const url = cfg?.url || ""
                    const key = `${method} ${url}`
                    const status = error?.response?.status
                    if (durationMs != null && perfStats) {
                        const s = perfStats[key] || (perfStats[key] = { count: 0, slowCount: 0, totalMs: 0, maxMs: 0 })
                        s.count += 1
                        s.totalMs += durationMs
                        if (durationMs > s.maxMs) s.maxMs = durationMs
                        if (durationMs >= perf.thresholdMs) {
                            s.slowCount += 1
                            // eslint-disable-next-line no-console
                            console.warn("[API:slow:error]", { key, ms: Math.round(durationMs), status })
                        }
                    }
                } catch {
                    // ignore
                }
            }
            var msg = "";
            switch (error.response && error.response.status) {
                case 400:
                    msg = error.response.data.msg;
                    break;
                case 404:
                    msg = "请求地址没有找到（404）"
                    break;
                case 401:
                    msg = "未授权（401），请重新登录"
                    triggerLogoutOnce()
                    break;
                default:
                    msg = "未知错误"
                    break;
            }
            return Promise.reject({ error: error, msg: msg, status: error?.response?.status });
        });
    }

     get<T>(path: string, config?: RequestConfig) {
       return this.wrapResult<T>(axios.get(path, {
        params: config?.param
    }), config)
    }
    post(path: string, data?: any, config?: RequestConfig) {
        return this.wrapResult(axios.post(path, data, {}), config)
    }

    put(path: string, data?: any, config?: RequestConfig) {
        return this.wrapResult(axios.put(path, data, {
            params: config?.param,
        }), config)
    }

    delete(path: string, config?: RequestConfig) {
        return this.wrapResult(axios.delete(path, {
            params: config?.param,
            data: config?.data,
        }), config)
    }

    private async wrapResult<T = APIResp>(result: Promise<AxiosResponse>, config?: RequestConfig): Promise<T|any> {
        if (!result) {
            return Promise.reject()
        }
        
        return  result.then((value) => {
          
            if (!config || !config.resp) {
                
                return Promise.resolve(value.data)
            }
            if (value.data) {
                const results = new Array<T>()
                if (value.data instanceof Array) {
                    for (const data of value.data) {
                        var resp = config.resp()
                        resp.fill(data)
                        results.push(resp as unknown as T)
                    }
                    return results
                } else {
                    var sresp = config.resp()
                    sresp.fill(value.data)
                    return Promise.resolve(sresp)
                }
            }
            return Promise.resolve()
        })
    }
}

export class RequestConfig {
    param?: any
    data?:any
    resp?: () => APIResp
}

export interface APIResp {

    fill(data: any): void;
}