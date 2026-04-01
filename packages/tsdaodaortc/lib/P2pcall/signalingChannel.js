import { MessageContentTypeConst, WKApp } from "@tsdaodao/base";
import WKSDK, { Channel, ChannelTypePerson, SendOptions } from "wukongimjssdk";
import { RTCDataContent } from "../Messages/rtcdata";
export var WKRTCCallType;
(function (WKRTCCallType) {
    WKRTCCallType[WKRTCCallType["Audio"] = 0] = "Audio";
    WKRTCCallType[WKRTCCallType["Video"] = 1] = "Video";
})(WKRTCCallType || (WKRTCCallType = {}));
export class SignalingChannel {
    async connect(loginInfo) {
        if (this.messageListener) {
            WKSDK.shared().chatManager.removeMessageListener(this.messageListener);
        }
        const self = this;
        this.messageListener = (msg) => {
            if (msg.contentType === MessageContentTypeConst.rtcData) {
                const rtcDataContent = msg.content;
                if (self.onMessage) { // 这里注意，需要调用onMessage，应该是owt注入了这个方法
                    self.onMessage(msg.fromUID, rtcDataContent.data);
                }
            }
        };
        WKSDK.shared().chatManager.addMessageListener(this.messageListener);
        return WKApp.loginInfo.uid || "";
    }
    send(targetID, message) {
        const content = new RTCDataContent();
        content.data = message;
        const opts = new SendOptions();
        opts.noPersist = true;
        opts.reddot = false;
        return WKSDK.shared().chatManager.sendWithOptions(content, new Channel(targetID, ChannelTypePerson), opts);
    }
    async disconnect() {
        if (this.messageListener) {
            WKSDK.shared().chatManager.removeMessageListener(this.messageListener);
        }
    }
}
export class P2pCallAPI {
    static shared() {
        if (!P2pCallAPI.instance) {
            P2pCallAPI.instance = new P2pCallAPI();
        }
        return P2pCallAPI.instance;
    }
    // 发起呼叫
    async call(to, callType) {
        return WKApp.apiClient.post("rtc/p2p/call", { "to_uid": to, "call_type": callType });
    }
    // 取消呼叫
    async cancel(to) {
        return WKApp.apiClient.post("rtc/p2p/cancel", { "to_uid": to });
    }
    // 挂断
    async hangup(to, second, callType, isCaller) {
        return WKApp.apiClient.post("rtc/p2p/hangup", { "uid": to, "second": second, "call_type": callType, "is_caller": isCaller ? 1 : 0 });
    }
    // 邀请
    invite(to, callType) {
        return WKApp.apiClient.post("rtc/p2p/invoke", { "to_uid": to, "call_type": callType });
    }
    // 接受
    async accept(to, callType) {
        return WKApp.apiClient.post("rtc/p2p/accept", { "from_uid": to, "call_type": callType });
    }
    // 拒绝
    async refuse(to, callType) {
        return WKApp.apiClient.post("rtc/p2p/refuse", { "uid": to, "call_type": callType });
    }
}
