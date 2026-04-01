import WKSDK from "wukongimjssdk";
import { ChannelInfoListener } from "wukongimjssdk";
import { Channel, ChannelInfo, ChannelTypePerson } from "wukongimjssdk";
import React, { Component } from "react";
import { ConversationWrap, MessageWrap } from "../../Service/Model";
import { getTimeStringAutoShort2 } from '../../Utils/time'
import classNames from "classnames";

import "./index.css"
import { Badge, Toast } from "@douyinfe/semi-ui";
import WKApp from "../../App";
import { EndpointID } from "../../Service/Const";
import ContextMenus, { ContextMenusContext } from "../ContextMenus";
import { ChannelSettingManager } from "../../Service/ChannelSetting";
import { TypingListener, TypingManager } from "../../Service/TypingManager";
import { BeatLoader } from "react-spinners";
import { RevokeCell } from "../../Messages/Revoke";
import { FlameMessageCell } from "../../Messages/Flame";
import WKAvatar from "../WKAvatar";
export interface ConversationListProps {
    conversations: ConversationWrap[]
    select?: Channel
    onClick?: (conversation: ConversationWrap) => void
    onClearMessages?: (channel: Channel) => void
    onMovePinnedConversation?: (fromChannelKey: string, toChannelKey: string) => void
}

export interface ConversationListState {
    selectConversationWrap?: ConversationWrap
    draggingChannelKey?: string

}

export default class ConversationList extends Component<ConversationListProps, ConversationListState>{
    channelListener!: ChannelInfoListener
    contextMenusContext!: ContextMenusContext
    typingListener!: TypingListener
    private _pendingRefresh: number | null = null  // 合并高频刷新
    constructor(props: ConversationListProps) {
        super(props)

        this.state = {
        }
    }

    /**
     * 合并短时间内的多次刷新请求为一次 setState，
     * 避免 channelInfo 连续返回时触发 N 次全量重渲染。
     */
    private _scheduleRefresh() {
        if (this._pendingRefresh !== null) return
        this._pendingRefresh = window.requestAnimationFrame(() => {
            this._pendingRefresh = null
            this.setState({})
        })
    }

    /**
     * 已请求过 fetchChannelInfo 的频道集合，
     * 避免同一频道在多次 render 中重复发起请求形成级联刷新。
     */
    private _fetchedChannels = new Set<string>()

    private _ensureChannelInfo(channel: Channel): ChannelInfo | undefined {
        const info = WKSDK.shared().channelManager.getChannelInfo(channel)
        if (info) return info
        const key = channel.getChannelKey()
        if (!this._fetchedChannels.has(key)) {
            this._fetchedChannels.add(key)
            WKSDK.shared().channelManager.fetchChannelInfo(channel)
        }
        return undefined
    }

    private findByChannelKey(channelKey: string) {
        const { conversations } = this.props
        if (!conversations || !channelKey) {
            return
        }
        for (const c of conversations) {
            if (c.channel.getChannelKey() === channelKey) {
                return c
            }
        }
    }

    private canDragPinned(fromKey?: string, toKey?: string) {
        if (!fromKey || !toKey) {
            return false
        }
        const from = this.findByChannelKey(fromKey)
        const to = this.findByChannelKey(toKey)
        return !!(from?.extra?.top === 1 && to?.extra?.top === 1)
    }

    componentDidMount() {
        this.channelListener = (channelInfo: ChannelInfo) => {
            // 频道信息已返回，从去重集合中移除，允许后续再次拉取（如信息过期）
            this._fetchedChannels.delete(channelInfo.channel.getChannelKey())
            this._scheduleRefresh()
        }
        WKSDK.shared().channelManager.addListener(this.channelListener)

        this.typingListener = (channel: Channel, add: boolean) => {
            this._scheduleRefresh()
        }
        TypingManager.shared.addTypingListener(this.typingListener)

    }

    componentWillUnmount() {
        WKSDK.shared().channelManager.removeListener(this.channelListener)
        TypingManager.shared.removeTypingListener(this.typingListener)
        if (this._pendingRefresh !== null) {
            window.cancelAnimationFrame(this._pendingRefresh)
            this._pendingRefresh = null
        }
    }

    _handleScroll() {
        this.contextMenusContext.hide()
    }
    _handleContextMenu(conversationWrap: ConversationWrap, event: React.MouseEvent) {
        this.contextMenusContext.show(event)
        this.setState({
            selectConversationWrap: conversationWrap
        })
    }

    _getTypingUI(conversationWrap: ConversationWrap) {
        const { select } = this.props
        const typing = TypingManager.shared.getTyping(conversationWrap.channel)
        const selected = select && select.isEqual(conversationWrap.channel)
        return <div className="wk-typing"><BeatLoader size={4} margin={3} color={selected ? "white" : "var(--wk-color-theme)"} />&nbsp;&nbsp;{conversationWrap.channel.channelType !== ChannelTypePerson ? typing?.fromName : ""}正在输入</div>
    }

    lastContent(conversationWrap: ConversationWrap) {
        if (!conversationWrap.lastMessage) {
            return
        }
        const draft = conversationWrap.remoteExtra.draft
        if(draft && draft!=="") {
            return draft
        }
        const lastMessage = new MessageWrap(conversationWrap.lastMessage)
        if (lastMessage.isDeleted) {
            return ""
        }
        if (lastMessage.revoke) {
            return RevokeCell.tip(lastMessage)
        }
        if(lastMessage.flame) {
            return FlameMessageCell.tip(lastMessage)
        }
        // 如果消息被编辑过，使用编辑后的内容
        const digest = lastMessage.message.remoteExtra?.isEdit && lastMessage.message.remoteExtra?.contentEdit
            ? lastMessage.message.remoteExtra.contentEdit.conversationDigest
            : lastMessage.content?.conversationDigest

        if (lastMessage.channel.channelType === ChannelTypePerson) {
            return digest
        } else {

            let from = ""
            if (lastMessage.fromUID && lastMessage.fromUID !== "") {
                const fromChannel = new Channel(lastMessage.fromUID, ChannelTypePerson)
                const fromChannelInfo = this._ensureChannelInfo(fromChannel)
                if (fromChannelInfo) {
                    from = `${fromChannelInfo.title}: `
                }
            }


            return `${from}${digest || ""}`
        }
    }

    getOnlineTip(channelInfo: ChannelInfo) {
        if (channelInfo.online) {
            return undefined
        }
        const nowTime = new Date().getTime() / 1000
        const btwTime = nowTime - channelInfo.lastOffline
        if (btwTime < 60) {
            return "刚刚"
        }
        return `${(btwTime / 60).toFixed(0)}分钟`
    }

    // 是否需要显示在线状态
    needShowOnlineStatus(channelInfo?: ChannelInfo) {
        if (!channelInfo) {
            return false
        }
        if (channelInfo.online) {
            return true
        }
        const nowTime = new Date().getTime() / 1000
        const btwTime = nowTime - channelInfo.lastOffline
        if (btwTime > 0 && btwTime < 60 * 60) { // 小于1小时才显示
            return true
        }
        return false
    }

    conversationItem(conversationWrap: ConversationWrap) {
        

        let channelInfo = conversationWrap.channelInfo
        if (!channelInfo) {
            this._ensureChannelInfo(conversationWrap.channel)
        }

        const avatarKey = WKApp.shared.getChannelAvatarTag(conversationWrap.channel);

        const { select, onClick } = this.props
        const typing = TypingManager.shared.getTyping(conversationWrap.channel)
        const selected = select && select.isEqual(conversationWrap.channel)
        const channelKey = conversationWrap.channel.getChannelKey()
        const isPinned = conversationWrap.extra?.top === 1

        return <div
            key={channelKey}
            draggable={isPinned}
            onDragStart={(e) => {
                if (!isPinned) {
                    return
                }
                try {
                    e.dataTransfer.setData('text/plain', channelKey)
                    e.dataTransfer.effectAllowed = 'move'
                } catch {
                    // ignore
                }
                this.setState({ draggingChannelKey: channelKey })
            }}
            onDragOver={(e) => {
                const fromKey = this.state.draggingChannelKey
                if (!this.canDragPinned(fromKey, channelKey)) {
                    return
                }
                e.preventDefault()
                try {
                    e.dataTransfer.dropEffect = 'move'
                } catch {
                    // ignore
                }
            }}
            onDrop={(e) => {
                e.preventDefault()
                const fromKey = this.state.draggingChannelKey
                if (!this.canDragPinned(fromKey, channelKey)) {
                    this.setState({ draggingChannelKey: undefined })
                    return
                }
                if (this.props.onMovePinnedConversation && fromKey) {
                    this.props.onMovePinnedConversation(fromKey, channelKey)
                }
                this.setState({ draggingChannelKey: undefined })
            }}
            onDragEnd={() => {
                this.setState({ draggingChannelKey: undefined })
            }}
            onClick={() => {
            if (onClick) {
                onClick(conversationWrap)
            }
        }} className={classNames("wk-conversationlist-item", channelInfo?.top ? "wk-conversationlist-item-top" : undefined)} onContextMenu={(e) => {
            this._handleContextMenu(conversationWrap, e)
        }}>
            <div className={classNames("wk-conversationlist-item-content", selected ? "wk-conversationlist-item-selected" : undefined)}>
                <div className="wk-conversationlist-item-left">
                    <div className="wk-conversationlist-item-avatar-box">
                        <WKAvatar  channel={conversationWrap.channel} key={avatarKey}></WKAvatar>
                        {
                            channelInfo && this.needShowOnlineStatus(channelInfo) ? <OnlineStatusBadge tip={this.getOnlineTip(channelInfo)}></OnlineStatusBadge> : undefined
                        }

                    </div>
                </div>
                <div className="wk-conversationlist-item-right">
                    <div className="wk-conversationlist-item-right-first-line">
                        <div className="wk-conversationlist-item-name">
                            <h3>
                                {channelInfo?.orgData.displayName}


                            </h3>
                            {
                                channelInfo?.orgData.identityIcon ? <img style={{ "marginLeft": "4px", "width": channelInfo?.orgData?.identitySize.width, "height": channelInfo?.orgData?.identitySize.height }} src={channelInfo?.orgData.identityIcon}></img> : undefined
                            }

                            {
                                channelInfo?.top ? <span className="wk-conversationlist-item-top-tag">置顶</span> : undefined
                            }
                            {
                                channelInfo?.mute ? (
                                    <div style={{ "width": "14px", height: "14px", "display": "flex", "alignItems": "center", "marginLeft": "5px" }}>
                                        <svg className="icon" viewBox="0 0 1131 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2755" width="14" height="14"><path d="M914.688 892.736L64 236.224l38.784-50.88L271.36 315.648a300.288 300.288 0 0 1 246.976-157.952v-33.28c0-16.64 13.504-30.08 30.08-30.08h2.304c16.576 0 30.08 13.44 30.08 30.08v32.96a299.776 299.776 0 0 1 284.928 299.136v294.272l45.504 58.624 48.768 37.696-45.312 45.632zM234.624 480.384l506.88 391.232H140.416l94.272-121.536-0.064-269.696z" fill="#bfbfbf" p-id="2756"></path></svg>
                                    </div>
                                ) : undefined
                            }
                        </div>

                        <div className="wk-conversationlist-item-time">
                            <span>{getTimeStringAutoShort2(conversationWrap.timestamp * 1000, true)}</span>
                        </div>

                    </div>
                    <div className="wk-conversationlist-item-right-second-line">
                        <div className="wk-conversationlist-item-lastmsg">
                            {
                                !typing?<label className="wk-reminder" style={{ display: conversationWrap.remoteExtra.draft  ? undefined : 'none' }}>[草稿]</label>:undefined
                            }
                            {
                                conversationWrap.simpleReminders && !typing &&  conversationWrap.simpleReminders.length>0 ?(
                                    conversationWrap.simpleReminders.filter((r)=>r.done === false).map((r)=>{
                                        return   <label key={r.reminderID} className="wk-reminder">{r.text}</label>
                                    })
                                ):undefined
                            }
                            {
                                typing ? this._getTypingUI(conversationWrap) : this.lastContent(conversationWrap)
                            }

                        </div>
                        <div className="wk-conversationlist-item-reddot">
                            {
                                conversationWrap.unread > 0 ? <Badge style={channelInfo?.mute ? { "border": "none", "backgroundColor": "rgb(200,200,200)" } : { border: "none" }} count={conversationWrap.unread} type='danger'></Badge> : undefined
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    onTop(channelInfo: ChannelInfo) {
        ChannelSettingManager.shared.top(!channelInfo.top, channelInfo.channel)
    }

    onMute(channelInfo: ChannelInfo) {
        ChannelSettingManager.shared.mute(!channelInfo.mute, channelInfo.channel)
    }

    onCloseChat(channel: Channel) { // 关闭聊天
        WKApp.conversationProvider.deleteConversation(channel)
    }

    async onClearMessages(channel: Channel) {
        if(this.props.onClearMessages) {
            this.props.onClearMessages(channel)
        }
    }

    render() {
        const { conversations, select } = this.props
        const { selectConversationWrap } = this.state
        return <div id="wk-conversationlist" className="wk-conversationlist" onScroll={this._handleScroll.bind(this)}>
            {
                conversations && conversations.map((conversationWrap) => {
                    return this.conversationItem(conversationWrap)
                })
            }

            <ContextMenus onContext={(ctx) => {
                this.contextMenusContext = ctx
            }} menus={[
                {
                    title: selectConversationWrap?.channelInfo?.top ? "取消置顶" : "置顶", onClick: () => {
                        this.onTop(selectConversationWrap?.channelInfo!)
                    }
                },
                {
                    title: selectConversationWrap?.channelInfo?.mute ? "关闭免打扰" : "开启免打扰", onClick: () => {
                        this.onMute(selectConversationWrap?.channelInfo!)
                    }
                },
                {
                    title: "关闭聊天窗口", onClick: () => {
                        this.onCloseChat(selectConversationWrap?.channel!)
                    }
                },
                {
                    title: "清空聊天记录", onClick: () => {
                        this.onClearMessages(selectConversationWrap?.channel!)
                    }
                },
                {
                    title: "关闭窗口并清空聊天记录", onClick: () => {
                        this.onCloseChat(selectConversationWrap?.channel!)
                        this.onClearMessages(selectConversationWrap?.channel!)
                    }
                },
            ]} />
        </div>
    }
}


interface OnlineStatusBadgeProps {
    tip?: string
}
export class OnlineStatusBadge extends Component<OnlineStatusBadgeProps> {

    render(): React.ReactNode {
        const { tip } = this.props
        return <div className={classNames("wk-onlinestatusbadge", !tip ? "wk-onlinestatusbadge-empty" : undefined)}>
            <div className="wk-onlinestatusbadge-content">
                <div className="wk-onlinestatusbadge-content-tip">{tip}</div>
            </div>
        </div>
    }
}