import { MessageContentTypeConst, WKApp } from "@tsdaodao/base";
import React from "react";
import ReactDOM from "react-dom";
import { TUICallKit, TUICallKitAPI, CallMediaType, TUIStore, StoreName, NAME, CallRole } from "@trtc/calls-uikit-react";

// CallStatus 未从包中导出，直接使用字符串字面值
const CallStatus = { IDLE: 'idle', CALLING: 'calling', CONNECTED: 'connected' };
import WKSDK, { ChannelTypePerson, ChannelTypeGroup } from "wukongimjssdk";
import { CallSystemCell, CallSystemContent } from "../Messages/system";
import { fetchTRTCUserSig, reportCallResult, syncP2pAccept, syncP2pRefuse, syncP2pCancel, syncP2pHangup } from "./service";

// --------------------------------------------------------
// 群聊通话 - 成员选择弹窗
// --------------------------------------------------------
function GroupCallModal({ channelID, onClose }) {
    const [members, setMembers] = React.useState([]);
    const [selected, setSelected] = React.useState({});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        WKApp.apiClient.get(`groups/${channelID}/subscribers`)
            .then((data) => {
                const list = (data.subscribers || data || [])
                    .filter((m) => m.uid && m.uid !== WKApp.loginInfo.uid);
                setMembers(list);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [channelID]);

    const toggle = (uid) => {
        setSelected((prev) => ({ ...prev, [uid]: !prev[uid] }));
    };

    const selectedUIDs = members.filter((m) => selected[m.uid]).map((m) => m.uid);

    const handleCall = () => {
        if (selectedUIDs.length === 0) return;
        TUICallKitAPI.calls({
            userIDList: selectedUIDs,
            type: CallMediaType.VIDEO,
        }).catch((err) => console.error("[TRTC] 群视频呼叫失败:", err));
        onClose();
    };

    return React.createElement(
        "div",
        {
            style: {
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.5)", zIndex: 9999,
                display: "flex", alignItems: "center", justifyContent: "center",
            },
            onClick: (e) => { if (e.target === e.currentTarget) onClose(); },
        },
        React.createElement(
            "div",
            {
                style: {
                    background: "#fff", borderRadius: 12, padding: "20px",
                    minWidth: 300, maxWidth: 400, maxHeight: "70vh",
                    display: "flex", flexDirection: "column", gap: 12,
                },
            },
            React.createElement("div", {
                style: { fontSize: 16, fontWeight: "bold" }
            }, "选择通话成员"),
            loading
                ? React.createElement("div", { style: { textAlign: "center", padding: 20 } }, "加载中...")
                : React.createElement(
                    "div",
                    { style: { overflowY: "auto", flex: 1 } },
                    members.length === 0
                        ? React.createElement("div", { style: { textAlign: "center", color: "#999", padding: 20 } }, "暂无群成员")
                        : members.map((m) =>
                            React.createElement(
                                "div",
                                {
                                    key: m.uid,
                                    onClick: () => toggle(m.uid),
                                    style: {
                                        display: "flex", alignItems: "center",
                                        padding: "8px 4px", cursor: "pointer",
                                        borderRadius: 6,
                                        background: selected[m.uid] ? "#e8f4ff" : "transparent",
                                        marginBottom: 2,
                                    },
                                },
                                React.createElement("input", {
                                    type: "checkbox",
                                    readOnly: true,
                                    checked: !!selected[m.uid],
                                    style: { marginRight: 10, accentColor: "#07c160", cursor: "pointer" },
                                }),
                                React.createElement("img", {
                                    src: m.avatar || WKApp.shared.avatarUser(m.uid),
                                    style: { width: 36, height: 36, borderRadius: "50%", marginRight: 10, objectFit: "cover" },
                                    onError: (e) => { e.currentTarget.style.display = "none"; },
                                }),
                                React.createElement("span", { style: { fontSize: 14 } }, m.name || m.uid)
                            )
                        )
                ),
            React.createElement(
                "div",
                { style: { display: "flex", gap: 10, justifyContent: "flex-end" } },
                React.createElement(
                    "button",
                    {
                        onClick: onClose,
                        style: {
                            padding: "8px 20px", borderRadius: 6,
                            border: "1px solid #ddd", background: "#f5f5f5",
                            cursor: "pointer", fontSize: 14,
                        },
                    },
                    "取消"
                ),
                React.createElement(
                    "button",
                    {
                        onClick: handleCall,
                        disabled: selectedUIDs.length === 0,
                        style: {
                            padding: "8px 20px", borderRadius: 6, border: "none",
                            background: selectedUIDs.length === 0 ? "#ccc" : "#07c160",
                            color: "#fff",
                            cursor: selectedUIDs.length === 0 ? "not-allowed" : "pointer",
                            fontSize: 14,
                        },
                    },
                    `发起视频通话${selectedUIDs.length > 0 ? ` (${selectedUIDs.length}人)` : ""}`
                )
            )
        )
    );
}

function showGroupCallModal(channelID) {
    let container = document.getElementById("trtc-groupcall-modal");
    if (!container) {
        container = document.createElement("div");
        container.id = "trtc-groupcall-modal";
        document.body.appendChild(container);
    }
    const close = () => { ReactDOM.unmountComponentAtNode(container); };
    ReactDOM.render(
        React.createElement(GroupCallModal, { channelID, onClose: close }),
        container
    );
}

// --------------------------------------------------------
// 通话状态跟踪：追踪当前通话信息，通话结束后上报结果
// --------------------------------------------------------
let _webCallState = {
    isCaller: false,
    wasConnected: false,
    targetUID: '',
    callType: 0,        // 0=语音, 1=视频
    connectStartMs: 0,
    reported: false,
    synced: false,       // 是否已调用过 syncP2p* 同步接口
    endReason: '',       // TUICallEngine onCallEnd 提供的结束原因
};

function resetWebCallState() {
    _webCallState = {
        isCaller: false,
        wasConnected: false,
        targetUID: '',
        callType: 0,
        connectStartMs: 0,
        reported: false,
        synced: false,
        endReason: '',
    };
}

/**
 * 通话结束后的完整处理：
 * 1. 调用 syncP2p* 通知服务端发 CMD 给其他端（CMD 同步 + 写 9989 消息）
 * 2. 如果走了 syncP2p* 则不重复调 reportCallResult（服务端已写 9989）
 * 3. 如果无法走 syncP2p*，则降级用 reportCallResult 写 9989
 */
function doReportAndSync() {
    if (_webCallState.reported) return;
    const { isCaller, wasConnected, targetUID, callType, connectStartMs, synced, endReason } = _webCallState;
    if (!targetUID) { resetWebCallState(); return; }
    _webCallState.reported = true;

    const second = wasConnected
        ? Math.max(0, Math.round((Date.now() - connectStartMs) / 1000))
        : 0;

    console.log("[TRTC] doReportAndSync:", { isCaller, wasConnected, targetUID, callType, endReason, second, synced });

    // ── 主叫方处理 ──
    if (isCaller) {
        if (wasConnected) {
            // 正常挂断 → syncP2pHangup（CMD + 9989）
            if (!synced) { _webCallState.synced = true; syncP2pHangup(targetUID, second, callType, true); }
        } else if (endReason === 'Rejected' || endReason === 'REJECTED') {
            // 对方拒绝 → 被叫方会调 refuse，主叫不重复上报
            console.log('[TRTC] 对方拒绝，由被叫侧上报');
        } else if (endReason === 'NoResponse' || endReason === 'NO_RESPONSE' || endReason === 'Timeout') {
            // 对方未接听 → reportCallResult(type=2) + 发 cancel CMD 让其他端收敛
            if (!synced) { _webCallState.synced = true; syncP2pCancel(targetUID, callType); }
            // p2pCancel 服务端写的 9989 是 cancel(0)，但实际是未接听(2)，补一条精确记录
            reportCallResult(targetUID, callType, 2, 0);
        } else if (endReason === 'LineBusy' || endReason === 'LINE_BUSY') {
            // 对方忙线
            reportCallResult(targetUID, callType, 3, 0);
        } else {
            // 默认：主叫主动取消 → syncP2pCancel（CMD + 9989）
            if (!synced) { _webCallState.synced = true; syncP2pCancel(targetUID, callType); }
        }
    }
    // ── 被叫方处理 ──
    else {
        if (wasConnected) {
            // 被叫方挂断（正常结束）→ syncP2pHangup（CMD + 9989）
            if (!synced) { _webCallState.synced = true; syncP2pHangup(targetUID, second, callType, false); }
        } else if (endReason === 'Rejected' || endReason === 'REJECTED') {
            // 被叫方主动拒绝 → syncP2pRefuse（CMD + 9989）
            if (!synced) { _webCallState.synced = true; syncP2pRefuse(targetUID, callType); }
        } else {
            // 被叫方的其他结束原因（Cancel 等由主叫上报）
            console.log('[TRTC] 被叫方通话结束, reason:', endReason, '不上报');
        }
    }

    resetWebCallState();
}

// TUICallKit 的 beforeCalling / afterCalling 回调
function handleBeforeCalling(type, error) {
    console.log("[TRTC] beforeCalling:", type, error);
    // type='call' 表示主叫发起，type='invited' 表示被叫收到邀请
    // 被叫不需要上报，只有主叫上报
    // 注意：主叫的 targetUID 在点击呼叫按钮时已经记录到 _webCallState 中
}

function handleAfterCalling() {
    console.log("[TRTC] afterCalling - 通话结束");
    // afterCalling 在以下场景触发：
    // 1. 主叫取消 (ON_CALL_NOT_CONNECTED)
    // 2. 正常通话结束 (CALLING_END)
    // 3. 错误场景
    // 注意：被叫拒绝(REJECT)、超时(NO_RESP)、忙线(LINE_BUSY)时不会触发 afterCalling
    doReportAndSync();
}

// TUIStore.watch 回调：监听 CALL_STATUS 变化，作为 afterCalling 的补充
// 当 REJECT/NO_RESP/LINE_BUSY 时，afterCalling 不会触发，但 CALL_STATUS 会变为 IDLE
function handleCallStatusChange(newStatus) {
    if (newStatus === CallStatus.CONNECTED) {
        _webCallState.wasConnected = true;
        _webCallState.connectStartMs = Date.now();
        console.log("[TRTC] 通话已接通");
        // Web 端作为被叫接听时，通知服务器发 rtc.p2p.accept CMD → 手机端关闭来电弹窗
        setTimeout(() => {
            try {
                const role = TUIStore.getData(StoreName.CALL, NAME.CALL_ROLE);
                if (role === CallRole.CALLEE) {
                    const remoteUsers = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
                    const callerUID = remoteUsers && remoteUsers.length > 0
                        ? (remoteUsers[0].userId || remoteUsers[0].userID || '')
                        : '';
                    const mediaType = TUIStore.getData(StoreName.CALL, NAME.CALL_MEDIA_TYPE);
                    const callType = (mediaType === CallMediaType.VIDEO) ? 1 : 0;
                    if (callerUID) {
                        console.log('[TRTC] Web接听来电，通知服务器关闭手机端弹窗, callerUID:', callerUID);
                        syncP2pAccept(callerUID, callType);
                    }
                }
            } catch (e) {
                console.warn('[TRTC] Web接听后 syncP2pAccept 失败:', e);
            }
        }, 200);
    }

    if (newStatus === CallStatus.CALLING && !_webCallState.targetUID) {
        // 被叫收到呼叫时，CALL_STATUS 变为 CALLING
        // 尝试从 TUIStore 读取角色和通话信息
        setTimeout(() => {
            try {
                const role = TUIStore.getData(StoreName.CALL, NAME.CALL_ROLE);
                if (role === CallRole.CALLER && !_webCallState.isCaller) {
                    // 群呼或其他场景下可能通过 TUIStore 发起
                    _webCallState.isCaller = true;
                    const mediaType = TUIStore.getData(StoreName.CALL, NAME.CALL_MEDIA_TYPE);
                    _webCallState.callType = (mediaType === CallMediaType.VIDEO) ? 1 : 0;
                    const remoteUsers = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
                    if (remoteUsers && remoteUsers.length > 0) {
                        _webCallState.targetUID = remoteUsers[0].userId;
                    }
                } else if (role === CallRole.CALLEE && !_webCallState.targetUID) {
                    // 被叫场景：记录来电信息，用于后续 refuse/hangup 同步
                    _webCallState.isCaller = false;
                    const mediaType = TUIStore.getData(StoreName.CALL, NAME.CALL_MEDIA_TYPE);
                    _webCallState.callType = (mediaType === CallMediaType.VIDEO) ? 1 : 0;
                    const remoteUsers = TUIStore.getData(StoreName.CALL, NAME.REMOTE_USER_INFO_LIST);
                    if (remoteUsers && remoteUsers.length > 0) {
                        _webCallState.targetUID = remoteUsers[0].userId || remoteUsers[0].userID || '';
                    }
                    console.log('[TRTC] 被叫来电信息已记录: targetUID=', _webCallState.targetUID, 'callType=', _webCallState.callType);
                }
            } catch (e) {
                // ignore
            }
        }, 100);
    }

    if (newStatus === CallStatus.IDLE) {
        // 用 setTimeout 避免和 afterCalling 回调竞争
        setTimeout(() => {
            if (!_webCallState.reported && _webCallState.targetUID) {
                console.log("[TRTC] Store watch 兜底上报:", { isCaller: _webCallState.isCaller, endReason: _webCallState.endReason });
                doReportAndSync();
            } else {
                resetWebCallState();
            }
        }, 500);
    }
}

let _storeWatchInitialized = false;
function initStoreWatch() {
    if (_storeWatchInitialized) return;
    _storeWatchInitialized = true;
    try {
        TUIStore.watch(StoreName.CALL, {
            [NAME.CALL_STATUS]: handleCallStatusChange,
        });
        console.log("[TRTC] TUIStore.watch 已注册");
    } catch (e) {
        console.warn("[TRTC] TUIStore.watch 注册失败:", e);
    }
}

let _rtcCmdFallbackListenerInitialized = false;
function initRtcCmdFallbackListener() {
    if (_rtcCmdFallbackListenerInitialized) return;
    _rtcCmdFallbackListenerInitialized = true;
    try {
        WKSDK.shared().chatManager.addCMDListener((message) => {
            try {
                const cmdData = message && message.content;
                const cmd = cmdData && cmdData.cmd;
                if (!cmd) return;
                if (cmd !== "rtc.p2p.accept" && cmd !== "rtc.p2p.cancel" && cmd !== "rtc.p2p.refuse" && cmd !== "rtc.p2p.hangup") {
                    return;
                }

                const callRole = TUIStore.getData(StoreName.CALL, NAME.CALL_ROLE);
                const callStatus = TUIStore.getData(StoreName.CALL, NAME.CALL_STATUS);

                // 仅在被叫振铃阶段做兜底收敛，避免影响通话中逻辑
                if (callRole === CallRole.CALLEE && callStatus === CallStatus.CALLING) {
                    console.log("[TRTC] 收到 RTC CMD 兜底收敛:", cmd, "当前仍在振铃，关闭本端来电UI");
                    forceCloseCallByCmd(`cmdFallback:${cmd}`);
                }
            } catch (e) {
                console.warn("[TRTC] RTC CMD 兜底监听处理失败:", e);
            }
        });
        console.log("[TRTC] RTC CMD 兜底监听已注册");
    } catch (e) {
        console.warn("[TRTC] RTC CMD 兜底监听注册失败:", e);
    }
}

async function forceCloseCallByCmd(reason) {
    try {
        const status = TUIStore.getData(StoreName.CALL, NAME.CALL_STATUS);
        if (status === CallStatus.IDLE) {
            resetWebCallState();
            return;
        }

        const role = TUIStore.getData(StoreName.CALL, NAME.CALL_ROLE);
        if (status === CallStatus.CALLING) {
            if (role === CallRole.CALLEE) {
                await TUICallKitAPI.reject();
            } else {
                await TUICallKitAPI.hangup();
            }
        } else if (status === CallStatus.CONNECTED) {
            await TUICallKitAPI.hangup();
        }
    } catch (e) {
        console.warn("[TRTC] CMD 收敛关闭失败:", reason, e);
    } finally {
        resetWebCallState();
    }
}

// --------------------------------------------------------
// 挂载 <TUICallKit /> 到全局 portal（需常驻 DOM 接收来电）
// --------------------------------------------------------
function mountCallKitContainer() {
    let container = document.getElementById("trtc-callkit-root");
    if (!container) {
        container = document.createElement("div");
        container.id = "trtc-callkit-root";
        // 关键：设置为固定定位全屏覆盖层，让 TUICallKit 通话 UI 居中显示在最上层
        container.style.cssText =
            "position:fixed;top:0;left:0;width:100%;height:100%;" +
            "z-index:9999;display:flex;align-items:center;justify-content:center;" +
            "pointer-events:none;";
        document.body.appendChild(container);

        // 让 TUICallKit 内部元素（按钮等）可正常响应鼠标事件
        const patchStyle = document.createElement("style");
        patchStyle.textContent = "#trtc-callkit-root > * { pointer-events: auto; }";
        document.head.appendChild(patchStyle);
    }
    // React 17 使用 ReactDOM.render，传入 beforeCalling/afterCalling 回调
    ReactDOM.render(
        React.createElement(TUICallKit, {
            beforeCalling: handleBeforeCalling,
            afterCalling: handleAfterCalling,
        }),
        container
    );
}

// --------------------------------------------------------
// 拉取 UserSig 并初始化 TUICallKit SDK
// --------------------------------------------------------
let _trtcInitialized = false;

async function initTRTC() {
    if (_trtcInitialized) return;
    if (!WKApp.loginInfo.isLogined()) return;
    try {
        const sigInfo = await fetchTRTCUserSig();
        await TUICallKitAPI.init({
            userID: sigInfo.user_id || WKApp.loginInfo.uid,
            userSig: sigInfo.user_sig,
            SDKAppID: sigInfo.sdk_app_id,
        });
        _trtcInitialized = true;
        console.log("[TRTC] TUICallKit 初始化成功, userID:", sigInfo.user_id);

        // 设置当前用户昵称和头像（文档步骤3：非好友通话时对方能看到）
        try {
            const myUID = WKApp.loginInfo.uid || '';
            const myName = WKApp.loginInfo.name || myUID;
            const myAvatar = WKApp.shared.avatarUser(myUID);
            await TUICallKitAPI.setSelfInfo({ nickName: myName, avatar: myAvatar });
            console.log("[TRTC] setSelfInfo 成功:", myName);
        } catch (e) {
            console.warn("[TRTC] setSelfInfo 失败:", e);
        }

        // 开启悬浮窗功能（通话中可缩小为悬浮窗）
        try {
            TUICallKitAPI.enableFloatWindow(true);
        } catch (e) {
            // ignore
        }

        // 初始化通话状态监听
        initStoreWatch();
        // 初始化 RTC CMD 兜底监听（处理多端处理通知未触发状态收敛的场景）
        initRtcCmdFallbackListener();

        // 监听底层 CallEngine 的 USER_ENTER（onUserJoin）事件
        // 场景：多端同账号登录时，手机端接听通话 → server 触发 ProcessInvitationProcessedByOtherDeviceNotify
        // → TUICallEngine 发 USER_ENTER（主叫进房），而不是 ON_CALL_NOT_CONNECTED
        // → Web 的 CALL_STATUS 停在 CALLING，铃声不停
        // 解决：检测到 CALLEE+CALLING 状态下主叫进房，说明其他设备已接通，强制关闭本端 UI
        try {
            const callEngine = TUICallKitAPI.getTUICallEngineInstance();
            if (callEngine && typeof callEngine.on === 'function') {
                callEngine.on('onUserJoin', function _onOtherDeviceAcceptedHandler(event) {
                    setTimeout(() => {
                        const callRole = TUIStore.getData(StoreName.CALL, NAME.CALL_ROLE);
                        const callStatus = TUIStore.getData(StoreName.CALL, NAME.CALL_STATUS);
                        // CALLEE + CALLING = 我们还没接听，但主叫已进房 = 其他设备接了
                        // CALLEE + CONNECTED = 我们自己接了（accept() 会先同步置为 CONNECTED）
                        if (callRole === CallRole.CALLEE && callStatus === CallStatus.CALLING) {
                            console.log('[TRTC] 检测到主叫进房但本端仍在振铃 → 多端同账号其他设备已接通，关闭本端通话UI:', JSON.stringify(event));
                            forceCloseCallByCmd('otherDeviceAccepted');
                        }
                    }, 150); // 延迟确保 accept() 的同步 CALL_STATUS 更新先生效
                });
                console.log('[TRTC] CallEngine onUserJoin 多端接听检测已注册');

                // 监听 onCallEnd 事件获取通话结束原因（Rejected/NoResponse/LineBusy等）
                // 用于精确上报通话结果和选择正确的同步API
                callEngine.on('onCallEnd', function _onCallEndReasonHandler(event) {
                    try {
                        // event 可能是 { callId, reason, ... } 或 { data: { reason } }
                        const reason = (event && (event.reason || (event.data && event.data.reason))) || '';
                        console.log('[TRTC] onCallEnd reason:', reason, 'event:', JSON.stringify(event));
                        if (reason) {
                            _webCallState.endReason = String(reason);
                        }
                    } catch (e) {
                        console.warn('[TRTC] onCallEnd 处理失败:', e);
                    }
                });
                console.log('[TRTC] CallEngine onCallEnd reason 监听已注册');
            }
        } catch (e) {
            console.warn('[TRTC] CallEngine 事件监听注册失败:', e);
        }
    } catch (e) {
        console.error("[TRTC] TUICallKit 初始化失败:", e);
        // 初始化失败时，10秒后自动重试一次
        setTimeout(() => {
            if (!_trtcInitialized && WKApp.loginInfo.isLogined()) {
                console.log('[TRTC] 初始化失败，自动重试...');
                initTRTC();
            }
        }, 10000);
    }
}

// --------------------------------------------------------
// TRTCModule：实现 IModule 接口，替换原 P2P RTC 模块
// --------------------------------------------------------
export default class TRTCModule {
    id() {
        return "RTCModule";
    }

    init() {
        // 1. 挂载常驻通话 UI（收到来电时自动显示）
        mountCallKitContainer();

        // 2. 注册消息内容类型（保持与历史消息的兼容）
        WKSDK.shared().register(
            MessageContentTypeConst.rtcResult,
            () => new CallSystemContent(MessageContentTypeConst.rtcResult)
        );
        WKSDK.shared().register(
            MessageContentTypeConst.rtcSwitchToVideo,
            () => new CallSystemContent(MessageContentTypeConst.rtcSwitchToVideo)
        );
        WKSDK.shared().register(
            MessageContentTypeConst.rtcSwitchToVideoReply,
            () => new CallSystemContent(MessageContentTypeConst.rtcSwitchToVideoReply)
        );
        WKApp.messageManager.registerCell(
            MessageContentTypeConst.rtcResult,
            () => CallSystemCell
        );
        WKApp.messageManager.registerCell(
            MessageContentTypeConst.rtcSwitchToVideo,
            () => CallSystemCell
        );
        WKApp.messageManager.registerCell(
            MessageContentTypeConst.rtcSwitchToVideoReply,
            () => CallSystemCell
        );

        // 3. 如果已登录直接初始化；否则等待登录回调
        if (WKApp.loginInfo.isLogined()) {
            initTRTC();
        }
        WKApp.endpoints.addOnLogin(() => {
            _trtcInitialized = false; // 每次登录重新初始化
            initTRTC();
        });

        // 4. 在会话头部注入语音通话按钮
        WKApp.endpoints.registerChannelHeaderRightItem(
            "rtc.p2p.call.audio",
            (param) => {
                const channel = param.channel;
                if (channel.channelType !== ChannelTypePerson) {
                    return undefined;
                }
                return React.createElement(
                    "div",
                    {
                        onClick: (event) => {
                            event.stopPropagation();
                            // 记录呼叫状态（主叫 + 语音）
                            resetWebCallState();
                            _webCallState.isCaller = true;
                            _webCallState.targetUID = channel.channelID;
                            _webCallState.callType = 0; // 语音
                            TUICallKitAPI.calls({
                                userIDList: [channel.channelID],
                                type: CallMediaType.AUDIO,
                            }).catch((err) =>
                                console.error("[TRTC] 语音呼叫失败:", err)
                            );
                        },
                    },
                    React.createElement(
                        "svg",
                        {
                            fill: WKApp.config.themeColor,
                            height: "30px",
                            role: "presentation",
                            viewBox: "0 0 36 36",
                            width: "30px",
                        },
                        React.createElement("path", {
                            d: "M25.753 28.2c1.07-.357 1.816-1.275 2.423-2.225a2.05 2.05 0 00.037-2.151 4.998 4.998 0 00-.723-.963 11.594 11.594 0 00-2.888-2.112c-.58-.299-1.272-.212-1.808.159l-2.098 1.452a.472.472 0 01-.437.055 11.557 11.557 0 01-4.045-2.63 11.554 11.554 0 01-2.63-4.044.472.472 0 01.056-.437l1.453-2.098c.37-.536.457-1.228.158-1.807A11.587 11.587 0 0013.14 8.51a4.995 4.995 0 00-.963-.723 2.05 2.05 0 00-2.15.037c-.951.607-1.87 1.353-2.225 2.424-1.174 3.527 1.187 8.461 5.338 12.613 4.152 4.151 9.086 6.512 12.614 5.338z",
                        })
                    ),
                    React.createElement("div", {
                        className: "wk-conversation-header-mask",
                    })
                );
            }
        );

        // 5. 在会话头部注入视频通话按钮（单聊）
        WKApp.endpoints.registerChannelHeaderRightItem(
            "rtc.p2p.call.video",
            (param) => {
                const channel = param.channel;
                if (channel.channelType !== ChannelTypePerson) {
                    return undefined;
                }
                return React.createElement(
                    "div",
                    {
                        onClick: (event) => {
                            event.stopPropagation();
                            // 记录呼叫状态（主叫 + 视频）
                            resetWebCallState();
                            _webCallState.isCaller = true;
                            _webCallState.targetUID = channel.channelID;
                            _webCallState.callType = 1; // 视频
                            TUICallKitAPI.calls({
                                userIDList: [channel.channelID],
                                type: CallMediaType.VIDEO,
                            }).catch((err) =>
                                console.error("[TRTC] 视频呼叫失败:", err)
                            );
                        },
                    },
                    React.createElement(
                        "svg",
                        {
                            fill: WKApp.config.themeColor,
                            height: "34px",
                            role: "presentation",
                            viewBox: "0 0 36 36",
                            width: "34px",
                        },
                        React.createElement("path", {
                            d: "M9 9.5a4 4 0 00-4 4v9a4 4 0 004 4h10a4 4 0 004-4v-9a4 4 0 00-4-4H9zm16.829 12.032l3.723 1.861A1 1 0 0031 22.5v-9a1 1 0 00-1.448-.894l-3.723 1.861A1.5 1.5 0 0025 15.81v4.38a1.5 1.5 0 00.829 1.342z",
                        })
                    ),
                    React.createElement("div", {
                        className: "wk-conversation-header-mask",
                    })
                );
            }
        );

        // 6. 在群聊会话头部注入视频通话按钮
        WKApp.endpoints.registerChannelHeaderRightItem(
            "rtc.group.call.video",
            (param) => {
                const channel = param.channel;
                if (channel.channelType !== ChannelTypeGroup) {
                    return undefined;
                }
                return React.createElement(
                    "div",
                    {
                        onClick: (event) => {
                            event.stopPropagation();
                            showGroupCallModal(channel.channelID);
                        },
                    },
                    React.createElement(
                        "svg",
                        {
                            fill: WKApp.config.themeColor,
                            height: "34px",
                            role: "presentation",
                            viewBox: "0 0 36 36",
                            width: "34px",
                        },
                        React.createElement("path", {
                            d: "M9 9.5a4 4 0 00-4 4v9a4 4 0 004 4h10a4 4 0 004-4v-9a4 4 0 00-4-4H9zm16.829 12.032l3.723 1.861A1 1 0 0031 22.5v-9a1 1 0 00-1.448-.894l-3.723 1.861A1.5 1.5 0 0025 15.81v4.38a1.5 1.5 0 00.829 1.342z",
                        })
                    ),
                    React.createElement("div", {
                        className: "wk-conversation-header-mask",
                    })
                );
            }
        );

    }
}
