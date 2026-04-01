import { WKApp } from "@tsdaodao/base";

/**
 * 从业务服务器获取 TRTC UserSig
 * 服务端接口：GET /v1/rtc/trtc/usersig
 * 返回：{ sdk_app_id: number, user_id: string, user_sig: string, expire: number }
 */
export async function fetchTRTCUserSig() {
    const result = await WKApp.apiClient.get("rtc/trtc/usersig");
    return result;
}

/**
 * 上报通话结果到业务服务器，服务器会生成 9989 消息写入聊天记录
 * 服务端接口：POST /v1/rtc/trtc/callresult
 * @param {string} toUID - 对方 UID
 * @param {number} callType - 0=语音, 1=视频
 * @param {number} resultType - 0=取消, 1=挂断, 2=未接听, 3=拒绝
 * @param {number} second - 通话时长（秒）
 */
export async function reportCallResult(toUID, callType, resultType, second) {
    try {
        await WKApp.apiClient.post("rtc/trtc/callresult", {
            to_uid: toUID,
            call_type: callType,
            result_type: resultType,
            second: second || 0,
        });
        console.log("[TRTC] 通话结果上报成功:", { toUID, callType, resultType, second });
    } catch (err) {
        console.error("[TRTC] 通话结果上报失败:", err);
    }
}

/**
 * Web 端接听来电后通知服务器，服务器下发 rtc.p2p.accept CMD 给手机端关闭来电弹窗
 * 服务端接口：POST /v1/rtc/p2p/accept
 * @param {string} fromUID - 主叫方 UID（即来电方）
 * @param {number} callType - 0=语音, 1=视频
 */
export async function syncP2pAccept(fromUID, callType) {
    if (!fromUID) return;
    try {
        await WKApp.apiClient.post("rtc/p2p/accept", {
            from_uid: fromUID,
            call_type: callType || 0,
        });
        console.log("[TRTC] syncP2pAccept 成功 → 手机端来电弹窗将关闭:", fromUID);
    } catch (err) {
        console.error("[TRTC] syncP2pAccept 失败:", err);
    }
}

/**
 * Web 端被叫拒绝来电后通知服务器
 * 服务端 /v1/rtc/p2p/refuse 会发 CMD 给对方 + 写 9989 消息
 * @param {string} uid - 主叫方 UID
 * @param {number} callType - 0=语音, 1=视频
 */
export async function syncP2pRefuse(uid, callType) {
    if (!uid) return;
    const _retry = async (attempt) => {
        try {
            await WKApp.apiClient.post("rtc/p2p/refuse", {
                uid: uid,
                call_type: callType || 0,
            });
            console.log("[TRTC] syncP2pRefuse 成功:", uid);
        } catch (err) {
            if (attempt < 2) {
                console.warn(`[TRTC] syncP2pRefuse 第${attempt + 1}次重试:`, err);
                await new Promise(r => setTimeout(r, 500));
                return _retry(attempt + 1);
            }
            console.error("[TRTC] syncP2pRefuse 失败:", err);
        }
    };
    return _retry(0);
}

/**
 * Web 端主叫取消呼叫后通知服务器
 * 服务端 /v1/rtc/p2p/cancel 会发 CMD 给对方 + 写 9989 消息
 * @param {string} uid - 被叫方 UID
 * @param {number} callType - 0=语音, 1=视频
 */
export async function syncP2pCancel(uid, callType) {
    if (!uid) return;
    const _retry = async (attempt) => {
        try {
            await WKApp.apiClient.post("rtc/p2p/cancel", {
                uid: uid,
                call_type: callType || 0,
            });
            console.log("[TRTC] syncP2pCancel 成功:", uid);
        } catch (err) {
            if (attempt < 2) {
                console.warn(`[TRTC] syncP2pCancel 第${attempt + 1}次重试:`, err);
                await new Promise(r => setTimeout(r, 500));
                return _retry(attempt + 1);
            }
            console.error("[TRTC] syncP2pCancel 失败:", err);
        }
    };
    return _retry(0);
}

/**
 * Web 端挂断通话后通知服务器
 * 服务端 /v1/rtc/p2p/hangup 会发 CMD 给对方 + 写 9989 消息
 * @param {string} uid - 对方 UID
 * @param {number} second - 通话时长（秒）
 * @param {number} callType - 0=语音, 1=视频
 * @param {boolean} isCaller - 当前是否主叫
 */
export async function syncP2pHangup(uid, second, callType, isCaller) {
    if (!uid) return;
    const _retry = async (attempt) => {
        try {
            await WKApp.apiClient.post("rtc/p2p/hangup", {
                uid: uid,
                second: second || 0,
                call_type: callType || 0,
                is_caller: isCaller ? 1 : 0,
            });
            console.log("[TRTC] syncP2pHangup 成功:", uid, "second:", second);
        } catch (err) {
            if (attempt < 2) {
                console.warn(`[TRTC] syncP2pHangup 第${attempt + 1}次重试:`, err);
                await new Promise(r => setTimeout(r, 500));
                return _retry(attempt + 1);
            }
            console.error("[TRTC] syncP2pHangup 失败:", err);
        }
    };
    return _retry(0);
}
