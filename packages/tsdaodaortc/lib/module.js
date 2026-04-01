import { MessageContentTypeConst, WKApp } from "@tsdaodao/base";
import React from "react";
import WKSDK, { Channel, ChannelTypePerson, } from "wukongimjssdk";
import P2PCall from "./P2pcall";
import { RTCDataContent } from "./Messages/rtcdata";
import { P2PCallStatus, P2pCallManager, } from "./P2pcall/manager";
import { CallSystemCell, CallSystemContent } from "./Messages/system";
import { P2pCallAPI, WKRTCCallType } from "./P2pcall/signalingChannel";
import { Toast } from "@douyinfe/semi-ui";
/**
 * 拨打语音/视频
 * @param channelID
 * @param CallType
 */
export const RTCCall = (channelID, CallType) => {
    P2pCallManager.shared().setupCall(channelID, CallType, true);
    P2pCallManager.shared().invite();
    WKApp.shared.baseContext.showGlobalModal({
        body: (React.createElement(P2PCall, { uid: channelID, onHangup: async () => {
                const isActive = true;
                if (P2pCallManager.shared().status == P2PCallStatus.Calling &&
                    isActive) {
                    await P2pCallManager.shared().refuse();
                }
                else {
                    await P2pCallManager.shared().hangup(isActive);
                }
                P2pCallManager.shared().close();
                WKApp.shared.baseContext.hideGlobalModal();
            }, onAnswer: async () => {
                P2pCallManager.shared().status = P2PCallStatus.Answering;
                await P2pCallManager.shared().accept();
            } })),
        className: "wk-p2pcall-modal",
        closable: false,
    }); // 显示全局弹窗
};
export default class RTCModule {
    id() {
        return "RTCModule";
    }
    async handleHangup(isActive) {
        if (this.notify && this.notify.close) {
            this.notify.close();
            this.notify = undefined;
        }
        if (P2pCallManager.shared().status == P2PCallStatus.Calling && isActive) {
            await P2pCallManager.shared().refuse();
        }
        else {
            await P2pCallManager.shared().hangup(isActive);
        }
        this.handleClose();
    }
    handleClose() {
        // 清除来电超时计时器
        if (this._callTimeoutId) {
            clearTimeout(this._callTimeoutId);
            this._callTimeoutId = undefined;
        }
        P2pCallManager.shared().close();
        WKApp.shared.baseContext.hideGlobalModal();
    }
    async handleAnswer() {
        P2pCallManager.shared().status = P2PCallStatus.Answering;
        await P2pCallManager.shared().accept();
    }
    recvCallNotification(fromUID, callType) {
        const channel = new Channel(fromUID, ChannelTypePerson);
        let channelInfo = WKSDK.shared().channelManager.getChannelInfo(channel);
        if (!channelInfo) {
            return;
        }
        const self = this;
        if (window.Notification && Notification.permission !== "denied") {
            this.notify = new Notification(channelInfo ? channelInfo.orgData.displayName : "通知", {
                body: `${channelInfo.title}正在呼叫您`,
                icon: WKApp.shared.avatarChannel(channel),
                lang: "zh-CN",
                tag: "tag",
                // renotify: true
            });
            this.notify.onclick = () => {
                self.notify.close();
                window.focus();
                WKApp.endpoints.showConversation(channel);
            };
            this.notify.onshow = () => {
                console.log("通知显示");
            };
            this.notify.onclose = () => {
                console.log("通知关闭");
            };
        }
    }
    // 发送通话被其他设备接听的通知
    sendAnsweredByOtherDeviceNotification() {
        const self = this;
        if (window.Notification && Notification.permission !== "denied") {
            const notify = new Notification("通知", {
                body: `通话被其他设备接听`,
                lang: "zh-CN",
                tag: "tag",
                // renotify: true
            });
            notify.onclick = () => {
                self.notify.close();
            };
            notify.onshow = () => {
                console.log("通知显示");
            };
            notify.onclose = () => {
                console.log("通知关闭");
            };
        }
    }
    init() {
        WKSDK.shared().register(MessageContentTypeConst.rtcData, () => new RTCDataContent());
        WKSDK.shared().register(MessageContentTypeConst.rtcResult, () => new CallSystemContent(MessageContentTypeConst.rtcResult));
        WKSDK.shared().register(MessageContentTypeConst.rtcSwitchToVideo, () => new CallSystemContent(MessageContentTypeConst.rtcSwitchToVideo));
        WKSDK.shared().register(MessageContentTypeConst.rtcSwitchToVideoReply, () => new CallSystemContent(MessageContentTypeConst.rtcSwitchToVideoReply));
        WKApp.messageManager.registerCell(MessageContentTypeConst.rtcResult, () => CallSystemCell);
        WKApp.messageManager.registerCell(MessageContentTypeConst.rtcSwitchToVideo, () => CallSystemCell);
        WKApp.messageManager.registerCell(MessageContentTypeConst.rtcSwitchToVideoReply, () => CallSystemCell);
        WKSDK.shared().conversationManager.addNoUpdateContentType(MessageContentTypeConst.rtcData);
        // 注入语音通话
        WKApp.endpoints.registerChannelHeaderRightItem("rtc.p2p.call.audio", (param) => {
            const channel = param.channel;
            if (channel.channelType != ChannelTypePerson) {
                return undefined;
            }
            const self = this;
            return (React.createElement("div", { onClick: (event) => {
                    event.stopPropagation();
                    console.log(channel);
                    P2pCallManager.shared().setupCall(channel.channelID, WKRTCCallType.Audio, true);
                    P2pCallManager.shared().invite();
                    WKApp.shared.baseContext.showGlobalModal({
                        body: (React.createElement(P2PCall, { uid: channel.channelID, onHangup: () => {
                                self.handleHangup(true);
                            }, onAnswer: async () => {
                                await self.handleAnswer();
                            } })),
                        className: "wk-p2pcall-modal",
                        closable: false,
                    }); // 显示全局弹窗
                } },
                React.createElement("svg", { fill: WKApp.config.themeColor, height: "30px", role: "presentation", viewBox: "0 0 36 36", width: "30px" },
                    React.createElement("path", { d: "M25.753 28.2c1.07-.357 1.816-1.275 2.423-2.225a2.05 2.05 0 00.037-2.151 4.998 4.998 0 00-.723-.963 11.594 11.594 0 00-2.888-2.112c-.58-.299-1.272-.212-1.808.159l-2.098 1.452a.472.472 0 01-.437.055 11.557 11.557 0 01-4.045-2.63 11.554 11.554 0 01-2.63-4.044.472.472 0 01.056-.437l1.453-2.098c.37-.536.457-1.228.158-1.807A11.587 11.587 0 0013.14 8.51a4.995 4.995 0 00-.963-.723 2.05 2.05 0 00-2.15.037c-.951.607-1.87 1.353-2.225 2.424-1.174 3.527 1.187 8.461 5.338 12.613 4.152 4.151 9.086 6.512 12.614 5.338z" })),
                React.createElement("div", { className: "wk-conversation-header-mask" })));
        });
        // 注入视频通话
        WKApp.endpoints.registerChannelHeaderRightItem("rtc.p2p.call.video", (param) => {
            const channel = param.channel;
            if (channel.channelType != ChannelTypePerson) {
                return undefined;
            }
            const self = this;
            return (React.createElement("div", { onClick: (event) => {
                    event.stopPropagation();
                    P2pCallManager.shared().setupCall(channel.channelID, WKRTCCallType.Video, true);
                    P2pCallManager.shared().invite();
                    WKApp.shared.baseContext.showGlobalModal({
                        body: (React.createElement(P2PCall, { uid: channel.channelID, onHangup: () => {
                                self.handleHangup(true);
                            }, onAnswer: async () => {
                                await self.handleAnswer();
                            } })),
                        className: "wk-p2pcall-modal",
                        closable: false,
                    }); // 显示全局弹窗
                } },
                React.createElement("svg", { fill: WKApp.config.themeColor, height: "34px", role: "presentation", viewBox: "0 0 36 36", width: "34px" },
                    React.createElement("path", { d: "M9 9.5a4 4 0 00-4 4v9a4 4 0 004 4h10a4 4 0 004-4v-9a4 4 0 00-4-4H9zm16.829 12.032l3.723 1.861A1 1 0 0031 22.5v-9a1 1 0 00-1.448-.894l-3.723 1.861A1.5 1.5 0 0025 15.81v4.38a1.5 1.5 0 00.829 1.342z" })),
                React.createElement("div", { className: "wk-conversation-header-mask" })));
        });
        WKSDK.shared().chatManager.addCMDListener((message) => {
            const cmd = message.content;
            const param = cmd.param;
            switch (cmd.cmd) {
                case "rtc.p2p.invoke":
                    var fromUID = param.from_uid;
                    // 忙线检测：如果状态残留（超时未重置）则先强制释放，再接受新来电
                    if (P2pCallManager.shared().status !== P2PCallStatus.None) {
                        if (P2pCallManager.shared().isStale()) {
                            console.warn("RTC: 检测到过期通话状态，强制释放后接受新来电");
                            this.handleClose();
                            // 状态已重置为 None，继续往下走正常来电流程
                        } else {
                            // 真正忙线，拒绝新来电
                            console.log("正在通话中，自动拒绝新呼叫");
                            P2pCallAPI.shared().refuse(fromUID, param.call_type).catch((err) => {
                                console.error("忙线自动拒绝失败", err);
                            });
                            return;
                        }
                    }
                    if (fromUID === WKApp.loginInfo.uid) {
                        return;
                    }
                    this.recvCallNotification(fromUID, param.call_type);
                    P2pCallManager.shared().setupCall(fromUID, param.call_type, false);
                    // 设置来电超时：60秒内无操作自动关闭弹窗，避免残留
                    this._callTimeoutId = setTimeout(() => {
                        if (P2pCallManager.shared().status === P2PCallStatus.Calling &&
                            !P2pCallManager.shared().isCaller) {
                            console.warn("RTC: 来电超时60秒未处理，自动关闭");
                            this.handleHangup(true);
                        }
                    }, 60 * 1000);
                    WKApp.shared.baseContext.showGlobalModal({
                        body: (React.createElement(P2PCall, { uid: param.from_uid, onHangup: () => {
                                this.handleHangup(true);
                            }, onAnswer: async () => {
                                await this.handleAnswer();
                            } })),
                        className: "wk-p2pcall-modal",
                        closable: false,
                    }); // 显示全局弹窗
                    break;
                case "rtc.p2p.accept":
                    var fromUID = param.from_uid;
                    if (fromUID === WKApp.loginInfo.uid) {
                        // 说明被其他设备接收
                        if (P2pCallManager.shared().status != P2PCallStatus.Calling) {
                            return;
                        }
                        this.handleClose();
                        Toast.info({
                            content: "通话被其他设备接听",
                            duration: 3,
                        });
                        this.sendAnsweredByOtherDeviceNotification();
                        return;
                    }
                    break;
                case "rtc.p2p.cancel":
                    var fromUID = param.uid;
                    if (fromUID !== P2pCallManager.shared().fromUID) {
                        return;
                    }
                    this.handleHangup(false);
                    WKApp.shared.baseContext.hideGlobalModal();
                    break;
                case "rtc.p2p.hangup":
                    var fromUID = param.uid;
                    if (fromUID !== P2pCallManager.shared().fromUID) {
                        return;
                    }
                    this.handleHangup(false);
                    WKApp.shared.baseContext.hideGlobalModal();
                    break;
                case "rtc.p2p.refuse":
                    var fromUID = param.uid;
                    if (fromUID !== P2pCallManager.shared().fromUID) {
                        return;
                    }
                    this.handleHangup(false);
                    WKApp.shared.baseContext.hideGlobalModal();
                    break;
            }
        });
        WKSDK.shared().chatManager.addMessageListener((message) => {
            const contentType = message.contentType;
            switch (contentType) {
                case MessageContentTypeConst.rtcResult:
                    // 兼容性放宽：只要当前有未完结的通话就尝试关闭，避免 fromUID 不匹配导致弹窗残留
                    if (P2pCallManager.shared().status !== P2PCallStatus.None) {
                        var fromUID = message.fromUID;
                        var channel = message.channel;
                        // 两方任一匹配即视为本次通话的结果
                        if (fromUID === P2pCallManager.shared().fromUID ||
                            (channel && channel.channelID === P2pCallManager.shared().fromUID)) {
                            this.handleHangup(false);
                        }
                    }
                    break;
                default:
                    break;
            }
        });
    }
}
