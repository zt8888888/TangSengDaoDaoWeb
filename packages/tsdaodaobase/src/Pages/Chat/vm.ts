import WKSDK, { MessageContentType } from "wukongimjssdk";
import { ChannelInfoListener } from "wukongimjssdk";
import { ConnectStatus, ConnectStatusListener } from "wukongimjssdk";
import { ConversationAction, ConversationListener } from "wukongimjssdk";
import { Channel, ChannelInfo, Conversation, Message } from "wukongimjssdk";
import WKApp, { MessageDeleteListener } from "../../App";
import { ConversationWrap } from "../../Service/Model";
import { ProviderListener } from "../../Service/Provider";
import { animateScroll, scroller } from 'react-scroll';
import { ProhibitwordsService } from "../../Service/ProhibitwordsService";
import { EndpointID } from "../../Service/Const";
import { ShowConversationOptions } from "../../EndpointCommon";

export class ChatVM extends ProviderListener {
    conversations: ConversationWrap[] = new Array()
    loading: boolean = false // 最近会话是否加载中
    private _connectTitle: string = "" // 连接标题
    private _showChannelSetting: boolean = false // 是否显示频道设置
    private _selectedConversation?: ConversationWrap // 选中的最近会话
    private _showAddPopover = false // 点击添加按钮弹出的popover
    private connectStatusListener!: ConnectStatusListener
    private conversationListener!: ConversationListener
    private channelListener!: ChannelInfoListener
    private messageDeleteListener!: MessageDeleteListener
    private conversationListID = "wk-conversationlist"
    private _showGlobalSearch = false // 是否显示全局搜索

    // 置顶顺序服务端接口能力探测：远端没更新时会返回 404，避免反复请求刷屏
    private pinnedOrderServerCapability: 'unknown' | 'supported' | 'unsupported' = 'unknown'
    private pinnedOrderPulledOnce: boolean = false

    private onPinnedOrderSync = () => {
        const conversationY = this.currentConversationListY()
        void this.pullPinnedOrderFromServer(true).then(() => {
            this.sortConversations()
            this.notifyListener(() => {
                if (conversationY) {
                    this.keepPosition(conversationY)
                }
            })
        })
    }

    private pinnedOrderStorageKey() {
        return `${WKApp.loginInfo.uid || ""}-pinned-conversation-order`
    }

    private getPinnedOrder(): string[] {
        try {
            const raw = WKApp.loginInfo.getStorageItem(this.pinnedOrderStorageKey())
            if (!raw) {
                return []
            }
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
                return parsed.filter((v) => typeof v === 'string')
            }
            return []
        } catch {
            return []
        }
    }

    private setPinnedOrder(order: string[]) {
        try {
            WKApp.loginInfo.setStorageItem(this.pinnedOrderStorageKey(), JSON.stringify(order))
        } catch {
            // ignore
        }
    }

    private async pullPinnedOrderFromServer(force: boolean = false) {
        if (this.pinnedOrderServerCapability === 'unsupported') {
            return
        }
        if (this.pinnedOrderPulledOnce && !force) {
            return
        }
        this.pinnedOrderPulledOnce = true
        try {
            const resp = await WKApp.apiClient.get("conversation/pinned/order")
            this.pinnedOrderServerCapability = 'supported'
            const order = resp?.order
            if (Array.isArray(order)) {
                const filtered = order.filter((v: any) => typeof v === 'string')
                // 服务端返回空数组时不覆盖本地顺序（避免误清空导致置顶区排序跳动）
                if (filtered.length > 0) {
                    this.setPinnedOrder(filtered)
                }
            }
        } catch (e: any) {
            if (e?.status === 404) {
                this.pinnedOrderServerCapability = 'unsupported'
            }
            // ignore
        }
    }

    private async pushPinnedOrderToServer(order?: string[]) {
        if (this.pinnedOrderServerCapability === 'unsupported') {
            return
        }
        try {
            const payload = { order: order || this.getPinnedOrder() }
            await WKApp.apiClient.post("conversation/pinned/order", payload)
            this.pinnedOrderServerCapability = 'supported'
        } catch (e: any) {
            if (e?.status === 404) {
                this.pinnedOrderServerCapability = 'unsupported'
            }
            // ignore
        }
    }

    private normalizePinnedOrder(pinnedKeys: string[]) {
        const pinnedSet = new Set(pinnedKeys)
        const order = this.getPinnedOrder().filter((k) => pinnedSet.has(k))
        for (const k of pinnedKeys) {
            if (!order.includes(k)) {
                order.push(k)
            }
        }
        this.setPinnedOrder(order)
        return order
    }

    private ensurePinnedKeyAtFront(channelKey: string) {
        const order = this.getPinnedOrder().filter((k) => k !== channelKey)
        order.unshift(channelKey)
        this.setPinnedOrder(order)
    }

    private removePinnedKey(channelKey: string) {
        const order = this.getPinnedOrder().filter((k) => k !== channelKey)
        this.setPinnedOrder(order)
    }

    movePinnedConversation(fromChannelKey: string, toChannelKey: string) {
        if (!fromChannelKey || !toChannelKey || fromChannelKey === toChannelKey) {
            return
        }
        const pinnedKeys = this.conversations
            .filter((c) => c.extra?.top === 1)
            .map((c) => c.channel.getChannelKey())
        const order = this.normalizePinnedOrder(pinnedKeys)
        const fromIndex = order.indexOf(fromChannelKey)
        const toIndex = order.indexOf(toChannelKey)
        if (fromIndex < 0 || toIndex < 0) {
            return
        }
        const next = order.slice()
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        this.setPinnedOrder(next)
        void this.pushPinnedOrderToServer(next)
        this.sortConversations()
        this.notifyListener()
    }

    private onConversationClose = () => {
        this._selectedConversation = undefined
        this._showChannelSetting = false
        this._showAddPopover = false
        this._showGlobalSearch = false
        this.notifyListener()
    }


    set showAddPopover(v: boolean) {
        this._showAddPopover = v
        this.notifyListener()
    }

    get showAddPopover() {
        return this._showAddPopover
    }

    set showGlobalSearch(v: boolean) {
        this._showGlobalSearch = v
        this.notifyListener()
    }

    get showGlobalSearch() {
        return this._showGlobalSearch
    }

    set selectedConversation(v: ConversationWrap | undefined) {
        this._selectedConversation = v
        this.notifyListener()
    }

    set showChannelSetting(v: boolean) {
        this._showChannelSetting = v
        this.notifyListener()
    }

    get showChannelSetting() {
        return this._showChannelSetting
    }

    get selectedConversation() {
        return this._selectedConversation
    }

    set connectTitle(v: string) {
        this._connectTitle = v
        this.notifyListener()
    }

    get connectTitle() {
        return this._connectTitle
    }

    didMount(): void {
        // 根据连接状态设置标题
        this.setConnectTitleWithConnectStatus(WKSDK.shared().connectManager.status)

        if (WKSDK.shared().connectManager.status == ConnectStatus.Connected) { // 如果已经连接则直接加载
            this.reloadRequestConversationList()
        }

        // 监听im连接状态
        this.connectStatusListener = (status: ConnectStatus, reasonCode?: number) => {
            this.setConnectTitleWithConnectStatus(WKSDK.shared().connectManager.status)
            if (status === ConnectStatus.Connected) {
                // 请求最近会话列表
                this.reloadRequestConversationList()
            }
        }
        WKSDK.shared().connectManager.addConnectStatusListener(this.connectStatusListener)

        // ---------- 最近会话 ----------
        this.conversationListener = (conversation: Conversation, action: ConversationAction) => {

            const channelInfo = WKSDK.shared().channelManager.getChannelInfo(conversation.channel)
            if (!channelInfo) {
                WKSDK.shared().channelManager.fetchChannelInfo(conversation.channel)
            }
            if (action === ConversationAction.add) {
                console.log("ConversationAction-----add")
                if (conversation.lastMessage?.content && conversation.lastMessage?.contentType === MessageContentType.text) {
                    conversation.lastMessage.content.text = ProhibitwordsService.shared.filter(conversation.lastMessage?.content.text)
                }
                this.conversations = [new ConversationWrap(conversation), ...this.conversations]
                this.sortConversations()
                this.notifyListener()
            } else if (action === ConversationAction.update) {
                console.log("ConversationAction-----update")
                const existConversation = this.findConversation(conversation.channel)
                if (existConversation) {
                    existConversation.conversation = conversation
                    if (existConversation.lastMessage?.content && existConversation.lastMessage?.contentType === MessageContentType.text) {
                        existConversation.lastMessage.content.text = ProhibitwordsService.shared.filter(existConversation.lastMessage?.content.text)
                    }
                }

                this.sortConversations()
                const conversationY = this.currentConversationListY()
                console.log("conversationY----->", conversationY)
                this.notifyListener(() => {
                    if (conversationY) {
                        this.keepPosition(conversationY)
                    }
                })
            } else if (action === ConversationAction.remove) {
                this.removeConversation(conversation.channel)
            }
        }
        WKSDK.shared().conversationManager.addConversationListener(this.conversationListener)

        this.channelListener = (channelInfo: ChannelInfo) => {
            const conversation = this.findConversation(channelInfo.channel)
            if (conversation) {
                const prevTop = conversation.extra?.top === 1
                const nextTop = !!channelInfo.top
                conversation.extra.top = nextTop ? 1 : 0
                const channelKey = channelInfo.channel.getChannelKey()
                // 注意：ChannelInfo 会在很多场景刷新（拉取资料/切换会话/收到消息等）。
                // 只有“置顶状态发生变化”时才更新 pinned 顺序，避免拖拽排序被覆盖。
                if (nextTop && !prevTop) {
                    // 新置顶默认插入置顶区最前（可拖拽调整）
                    this.ensurePinnedKeyAtFront(channelKey)
                    void this.pushPinnedOrderToServer()
                } else if (!nextTop && prevTop) {
                    this.removePinnedKey(channelKey)
                    void this.pushPinnedOrderToServer()
                }
                this.sortConversations()
                this.notifyListener()
            }
        }
        WKSDK.shared().channelManager.addListener(this.channelListener)

        this.messageDeleteListener = (message: Message, preMessage?: Message) => {
            const conversation = WKSDK.shared().conversationManager.findConversation(message.channel)
            if (conversation) {
                if (conversation.lastMessage && conversation.lastMessage.clientMsgNo === message.clientMsgNo) {
                    conversation.lastMessage = preMessage
                    WKSDK.shared().conversationManager.notifyConversationListeners(conversation, ConversationAction.update)
                }
            }
        }
        WKApp.shared.addMessageDeleteListener(this.messageDeleteListener)

        // ESC 退出会话时同步取消选中（回到右侧空白页）
        try {
            WKApp.mittBus.on("conversation.close", this.onConversationClose as any)
        } catch {
            // ignore
        }

        // 多端置顶会话排序同步（无需手动刷新）
        try {
            WKApp.mittBus.on("conversation.pinnedOrder.sync", this.onPinnedOrderSync as any)
        } catch {
            // ignore
        }


    }
    didUnMount(): void {
        WKSDK.shared().connectManager.removeConnectStatusListener(this.connectStatusListener)
        WKSDK.shared().conversationManager.removeConversationListener(this.conversationListener)
        WKSDK.shared().channelManager.removeListener(this.channelListener)
        WKApp.shared.removeMessageDeleteListener(this.messageDeleteListener)

        try {
            WKApp.mittBus.off("conversation.close", this.onConversationClose as any)
        } catch {
            // ignore
        }

        try {
            WKApp.mittBus.off("conversation.pinnedOrder.sync", this.onPinnedOrderSync as any)
        } catch {
            // ignore
        }
    }

    findConversation(channel: Channel) {
        if (this.conversations) {
            for (const conversation of this.conversations) {
                if (conversation.channel.isEqual(channel)) {
                    return conversation
                }
            }
        }
    }

    keepPosition(y: number) {
        animateScroll.scrollTo(y, {
            containerId: this.conversationListID,
            "duration": 0,
        })
    }
    currentConversationListY() {
        const conversationElem = document.getElementById(this.conversationListID)
        if (!conversationElem) {
            return
        }
        return conversationElem.scrollTop
    }

    removeConversation(channel: Channel) {
        if (this.conversations) {
            for (let i = 0; i < this.conversations.length; i++) {
                const conversation = this.conversations[i]
                if (conversation.channel.isEqual(channel)) {
                    this.conversations.splice(i, 1)
                    this.notifyListener()
                    break
                }
            }
        }
    }

    async clearMessages(channel: Channel) {

        const conversationWrap = this.findConversation(channel)
        if (!conversationWrap) {
            return
        }
        await WKApp.conversationProvider.clearConversationMessages(conversationWrap.conversation)
        conversationWrap.conversation.lastMessage = undefined
        conversationWrap.conversation.unread = 0
        WKApp.endpointManager.invoke(EndpointID.clearChannelMessages, channel)
        this.sortConversations()
        this.notifyListener()
    }


    setConnectTitleWithConnectStatus(connectStatus: ConnectStatus) {
        if (connectStatus === ConnectStatus.Connected) {
            this.connectTitle = WKApp.config.appName
        } else if (connectStatus === ConnectStatus.Disconnect) {
            this.connectTitle = "已断开"
        } else {
            this.connectTitle = "连接中..."
        }
    }

    // 排序最近会话列表
    sortConversations(conversations?: Array<ConversationWrap>) {
        const source = (conversations || this.conversations || []).slice()
        if (!source || source.length <= 0) {
            return []
        }

        const pinned: ConversationWrap[] = []
        const normal: ConversationWrap[] = []
        for (const c of source) {
            if (c.extra?.top === 1) {
                pinned.push(c)
            } else {
                normal.push(c)
            }
        }

        const pinnedKeys = pinned.map((c) => c.channel.getChannelKey())
        const order = this.normalizePinnedOrder(pinnedKeys)
        const orderIndex = new Map<string, number>()
        order.forEach((k, i) => orderIndex.set(k, i))

        pinned.sort((a, b) => {
            const ai = orderIndex.get(a.channel.getChannelKey())
            const bi = orderIndex.get(b.channel.getChannelKey())
            // 都有索引时按索引；否则兜底按时间（但 normalize 后通常都会有）
            if (ai !== undefined && bi !== undefined) {
                return ai - bi
            }
            return b.timestamp - a.timestamp
        })

        normal.sort((a, b) => b.timestamp - a.timestamp)

        const sorted = [...pinned, ...normal]
        if (!conversations) {
            this.conversations = sorted
        }
        return sorted
    }

    async requestConversationList() {

        this.loading = true
        this.notifyListener()
        const conversationWraps = new Array<ConversationWrap>()
        const conversations = await WKSDK.shared().conversationManager.sync({})
        if (conversations && conversations.length > 0) {
            for (const conversation of conversations) {
                conversationWraps.push(new ConversationWrap(conversation))
            }
        }
        this.conversations = conversationWraps
        this.loading = false

        this.sortConversations()

        // 尝试从服务端恢复置顶顺序（不阻塞首屏）
        void this.pullPinnedOrderFromServer().then(() => {
            this.sortConversations()
            this.notifyListener()
        })

        this.notifyListener()
    }

    async reloadRequestConversationList() {
        const conversationWraps = new Array<ConversationWrap>()
        const conversations = await WKSDK.shared().conversationManager.sync({})
        if (conversations && conversations.length > 0) {
            for (const conversation of conversations) {
                if (conversation.lastMessage?.content && conversation.lastMessage?.contentType == MessageContentType.text) {
                    conversation.lastMessage.content.text = ProhibitwordsService.shared.filter(conversation.lastMessage.content.text)
                }
                conversationWraps.push(new ConversationWrap(conversation))
            }
        }
        this.conversations = conversationWraps
        this.sortConversations()

        // 尝试从服务端恢复置顶顺序（不阻塞首屏）
        void this.pullPinnedOrderFromServer().then(() => {
            this.sortConversations()
            this.notifyListener()
        })

        this.notifyListener()

        WKApp.menus.refresh()
    }
}


// 处理搜索内容点击事件
export function handleGlobalSearchClick(item: any, type: string,hideModal?:()=>void) {
    if (type === "contacts" || type === "group") {
        if(hideModal){
            hideModal()
        }
        WKApp.endpoints.showConversation(new Channel(item.channel_id, item.channel_type))
    } else if (type === "message") {
        const opts = new ShowConversationOptions()
        opts.initLocateMessageSeq = item.message_seq
        if(hideModal){
            hideModal()
        }
        WKApp.endpoints.showConversation(new Channel(item.channel.channel_id, item.channel.channel_type), opts)
    } else if (type === "file") {
        // 下载文件
        const payload = item.payload
        let downloadURL = WKApp.dataSource.commonDataSource.getImageURL(payload.url || '')
        if (downloadURL.indexOf("?") != -1) {
            downloadURL += "&filename=" + payload.name
        } else {
            downloadURL += "?filename=" + payload.name
        }
        window.open(`${downloadURL}`, 'top');
    }
}