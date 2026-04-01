import WKSDK, { Channel, ChannelTypePerson, Subscriber } from "wukongimjssdk";
import { GroupRole, SubscriberStatus } from "../../Service/Const";
import WKApp from "../../App";
import { ProviderListener } from "../../Service/Provider";
import RouteContext from "../../Service/Context";
import { ChannelSettingRouteData } from "../ChannelSetting/context";


export class SubscribersVM extends ProviderListener {
    context:RouteContext<any>
    routeData:ChannelSettingRouteData
    private _subscribers: Subscriber[] = []
    showNum:number = 20
    private refreshTimer?: number

    // visible=true 时的在线校准：节流 + 并发去重 + 重试
    private onlineCalibratePromise?: Promise<void>
    private lastOnlineCalibrateAt: number = 0
    private onlineCalibrateThrottleMs: number = 4000 // 3~5s 窗口，默认 4s
    private onlineCalibrateRetryDelays: number[] = [300, 800, 1500]


    constructor(context:RouteContext<any>) {
        super()
        this.context = context
        this.routeData = context.routeData()
    }

    get subscribers():Subscriber[] {
        return this.routeData.subscribers
    }

    get sortedSubscribers():Subscriber[] {
        const list = this.routeData.subscribers ? [...this.routeData.subscribers] : []
        return list.sort((a, b) => {
            const roleRank = (item: Subscriber) => {
                if (item.role === GroupRole.owner) return 2
                if (item.role === GroupRole.manager) return 1
                return 0
            }
            const onlineRank = (item: Subscriber) => (this.isOnline(item) ? 1 : 0)
            const lastSeen = (item: Subscriber) => this.getLastSeenAt(item)
            if (roleRank(a) !== roleRank(b)) return roleRank(b) - roleRank(a)
            if (onlineRank(a) !== onlineRank(b)) return onlineRank(b) - onlineRank(a)
            return lastSeen(b) - lastSeen(a)
        })
    }

    get sortedSubscribersTop():Subscriber[] {
        const showMemberNum = this.shouldShowMemberNum()
        const sorted = this.sortedSubscribers
        if (sorted.length <= showMemberNum) {
            return sorted
        }
        return sorted.slice(0, showMemberNum)
    }

    /**
     * 总成员数（含虚拟成员），优先取 channelInfo.orgData.member_count，
     * 避免 API 尚未返回时只显示 SDK 缓存的少量真实成员数。
     */
    get totalMemberCount(): number {
        const channel = this.routeData.channel
        if (channel) {
            try {
                const channelInfo = WKSDK.shared().channelManager.getChannelInfo(channel)
                if (channelInfo && channelInfo.orgData.member_count) {
                    return channelInfo.orgData.member_count
                }
            } catch {
                // ignore
            }
        }
        return this.subscribers.length
    }

    get subscribersTop():Subscriber[] {

        let showMemberNum = this.shouldShowMemberNum()

        const subscribers = this.routeData.subscribers

        if(subscribers && subscribers.length>0) {
            if(subscribers.length<showMemberNum) {
                return subscribers
            }else {
                return subscribers.slice(0,showMemberNum)
            }
        }
        return subscribers
    }

    shouldShowMemberNum() {
        let showMemberNum = this.showNum

        if(this.showAdd()) {
            showMemberNum-=1
        }
        if(this.showRemove()) {
            showMemberNum-=1
        }
        return showMemberNum
    }

    showAdd() {
        return true
    }

    showRemove() {
        const subscriberOfMe = this.routeData.subscriberOfMe
        let role = GroupRole.normal
        if(subscriberOfMe) {
            role = subscriberOfMe.role
        }
        if(role === GroupRole.owner || role === GroupRole.manager) {
           return true
        }
        return false
    }

    hasMoreSubscribers() {
        const showMemberNum = this.shouldShowMemberNum()
        // 使用 totalMemberCount：即使 API 尚未返回完整列表，
        // 只要 channelInfo 的 member_count 大于显示阈值，就显示"查看更多"按钮
        return this.totalMemberCount > showMemberNum || this.subscribers.length > showMemberNum
    }

    didMount(): void {
        // 始终在挂载时拉一次完整成员列表（含虚拟成员）。
        // 之前仅在 visible=true 时才刷新，但面板首次渲染时 visible 可能还是 false，
        // 导致只有 SDK 缓存的真实成员被显示。
        this.refreshMemberStatus()
        this.refreshTimer = window.setInterval(() => {
            if (this.routeData.visible) {
                this.refreshMemberStatus()
            }
        }, 60 * 1000)
    }

    didUnMount(): void {
        if (this.refreshTimer) {
            window.clearInterval(this.refreshTimer)
        }
    }

    private getLastSeenAt(subscriber: Subscriber): number {
        const raw = subscriber.orgData?.lastSeenAt || subscriber.orgData?.last_seen_at || subscriber.orgData?.last_seen
        if (!raw) return 0
        const value = typeof raw === "string" ? parseInt(raw, 10) : raw
        if (!value) return 0
        return value > 1e12 ? Math.floor(value / 1000) : value
    }

    private isOnline(subscriber: Subscriber): boolean {
        // 优先使用本地 ChannelInfo.online（由在线状态推送更新）
        try {
            const channelInfo = WKSDK.shared().channelManager.getChannelInfo(new Channel(subscriber.uid, ChannelTypePerson))
            if (channelInfo && typeof channelInfo.online === "boolean") {
                return channelInfo.online
            }
        } catch {
            // ignore
        }

        const onlineRaw = subscriber.orgData?.online
        if (onlineRaw === 1 || onlineRaw === true) return true
        if (onlineRaw === 0 || onlineRaw === false) return false
        if (typeof onlineRaw === "string") {
            const v = onlineRaw.trim().toLowerCase()
            if (v === "1" || v === "true" || v === "online" || v === "在线") return true
            if (v === "0" || v === "false" || v === "offline" || v === "离线") return false
        }
        const lastSeenAt = this.getLastSeenAt(subscriber)
        if (!lastSeenAt) return false
        const now = Math.floor(Date.now() / 1000)
        return now - lastSeenAt < 60
    }

    // 外部触发：成员面板打开(visible=true)
    onVisibleChange(visible: boolean) {
        if (!visible) return
        // fire-and-forget：由内部 Promise 管理并发去重
        this.calibrateOnlineStatusOnVisible()
    }

    private sleep(ms: number) {
        return new Promise<void>((resolve) => {
            window.setTimeout(() => resolve(), ms)
        })
    }

    private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
        let lastErr: any
        const delays = this.onlineCalibrateRetryDelays
        for (let attempt = 0; attempt <= delays.length; attempt++) {
            try {
                return await fn()
            } catch (e) {
                lastErr = e
                if (attempt >= delays.length) {
                    throw e
                }
                await this.sleep(delays[attempt])
            }
        }
        throw lastErr
    }

    private async mergeOnlineStatusToMembers(members: Subscriber[]) {
        const normalMembers = members.filter((s) => s.status === SubscriberStatus.normal)
        const uids = normalMembers.map((m) => String(m.uid)).filter((uid) => uid && uid !== "0")
        if (!uids || uids.length === 0) return

        const chunkSize = 200
        for (let i = 0; i < uids.length; i += chunkSize) {
            const chunk = uids.slice(i, i + chunkSize)
            if (chunk.length === 0) continue
            const onlineList: Array<any> = await WKApp.apiClient.post("user/online", chunk)
            if (!onlineList || !(onlineList instanceof Array)) continue
            const onlineDict: Record<string, any> = {}
            for (const item of onlineList) {
                if (item?.uid) {
                    onlineDict[String(item.uid)] = item
                }
            }
            for (const m of normalMembers) {
                const uid = String(m.uid)
                const o = onlineDict[uid]
                if (!o) continue
                m.orgData = m.orgData || {}
                m.orgData.online = o.online
                if (o.last_online) {
                    m.orgData.lastSeenAt = o.last_online
                }
                if (o.last_offline) {
                    m.orgData.last_offline = o.last_offline
                }
                if (o.device_flag !== undefined) {
                    m.orgData.device_flag = o.device_flag
                }
            }
        }
    }

    private calibrateOnlineStatusOnVisible(): Promise<void> {
        if (this.onlineCalibratePromise) {
            return this.onlineCalibratePromise
        }

        const now = Date.now()
        if (now - this.lastOnlineCalibrateAt < this.onlineCalibrateThrottleMs) {
            return (async () => {})()
        }

        this.lastOnlineCalibrateAt = now

        // 始终走全量刷新，确保虚拟成员和在线状态都能正确加载。
        // 之前仅在缓存为空时才全量刷新，导致面板可见时只有 SDK 缓存的
        // 真实成员而没有虚拟成员。
        this.onlineCalibratePromise = this.withRetry(async () => {
            await this.refreshMemberStatus({ throwOnError: true })
        })

        // 清理 in-flight（不使用 Promise.finally，兼容更低 lib 配置）
        this.onlineCalibratePromise.then(
            () => {
                this.onlineCalibratePromise = undefined
            },
            () => {
                this.onlineCalibratePromise = undefined
            }
        )

        return this.onlineCalibratePromise
    }

    private async refreshMemberStatus(options?: { throwOnError?: boolean }) {
        const channel = this.routeData.channel
        if (!channel) return
        const throwOnError = !!options?.throwOnError
        try {
            const members = await WKApp.dataSource.channelDataSource.subscribers(channel, {
                page: 1,
                limit: 1000,
                display: true,
            })
            if (!members) {
                if (throwOnError) {
                    throw new Error("refresh members failed")
                }
                return
            }

            // 主动拉取在线状态：onlineStatus 推送不一定覆盖群内所有成员（例如非好友）
            if (throwOnError) {
                await this.mergeOnlineStatusToMembers(members)
            } else {
                try {
                    await this.mergeOnlineStatusToMembers(members)
                } catch (e) {
                    // ignore online fetch errors
                }
            }

            this.routeData.subscriberAll = members
            this.routeData.subscribers = members.filter((s) => s.status === SubscriberStatus.normal)
            this.notifyListener()
        } catch (e) {
            if (throwOnError) {
                throw e
            }
        }
    }
}