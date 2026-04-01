import { WKApp } from "@tsdaodao/base";
import { P2pCallAPI, SignalingChannel, WKRTCCallType } from "./signalingChannel";
export var P2PCallStatus;
(function (P2PCallStatus) {
    P2PCallStatus[P2PCallStatus["None"] = 0] = "None";
    P2PCallStatus[P2PCallStatus["Calling"] = 1] = "Calling";
    P2PCallStatus[P2PCallStatus["Answering"] = 2] = "Answering";
    P2PCallStatus[P2PCallStatus["Talking"] = 3] = "Talking";
    P2PCallStatus[P2PCallStatus["Hangup"] = 4] = "Hangup";
})(P2PCallStatus || (P2PCallStatus = {}));
export class P2pCallManager {
    constructor() {
        this.status = P2PCallStatus.None;
    }
    static shared() {
        if (!P2pCallManager.instance) {
            P2pCallManager.instance = new P2pCallManager();
        }
        return P2pCallManager.instance;
    }
    initP2p() {
        // ICE 配置（WebRTC）：优先读取 WKApp.config.rtcIceServers
        // 由业务端在启动时注入（例如通过环境变量/后端下发），避免在模块里写死。
        const defaultIceServers = [{
                urls: 'stun:stun1.l.google.com:19302',
            }, {
                urls: [
                    // TURN over TLS（默认 TCP）；显式带 transport 避免实现差异
                    'turns:coturn.pxstcp.com:5349?transport=tcp',
                ],
                username: 'admin',
                credential: 'UrHH22nFvBTMV',
            }];
        const configuredIceServers = (WKApp.config && WKApp.config.rtcIceServers) ? WKApp.config.rtcIceServers : defaultIceServers;
        const rtcConfiguration = {
            iceServers: configuredIceServers,
        };
        this.p2p = new Owt.P2P.P2PClient({
            audioEncodings: true,
            videoEncodings: [{
                    codec: {
                        name: 'h264',
                    },
                }, {
                    codec: {
                        name: 'vp9',
                    },
                }, {
                    codec: {
                        name: 'vp8',
                    },
                }],
            rtcConfiguration,
        }, new SignalingChannel());
        const self = this;
        this.p2p.addEventListener('streamadded', async (e) => {
            console.log("streamadded---->");
            self.status = P2PCallStatus.Talking;
            if (self.onStreamadded) {
                self.onStreamadded(e);
            }
            self.startAnswerTime = new Date();
        });
        this.p2p.addEventListener('messagereceived', (e) => {
            console.log("messagereceived------------------>", e);
        });
        console.log("----this.p2p---->", this.p2p);
    }
    setupCall(fromUID, callType, isCaller) {
        this.status = P2PCallStatus.Calling;
        this.fromUID = fromUID;
        this.callType = callType;
        this.isCaller = isCaller;
        this.stopped = false;
        this.localStreamIsPublished = false;
        this.callStartTime = Date.now(); // 记录通话发起时间，用于超时检测
        this.initP2p();
    }
    /**
     * 判断当前通话状态是否已过期（超过 STALE_TIMEOUT_MS 仍未进入 Talking）。
     * 用于避免残留状态误拒新来电。
     */
    isStale() {
        const STALE_TIMEOUT_MS = 90 * 1000; // 90秒
        if (this.status === P2PCallStatus.None) return false;
        if (this.status === P2PCallStatus.Talking) return false; // 正在通话不算过期
        if (!this.callStartTime) return true; // 没有发起时间，视为异常
        return (Date.now() - this.callStartTime) > STALE_TIMEOUT_MS;
    }
    connect() {
        this.isConnected = true;
        return this.p2p.connect({ host: "xxx", token: "kksd" });
    }
    getLocalStream() {
        const self = this;
        if (this.localStream) {
            return new Promise((resolve) => {
                return resolve(self.localStream);
            });
        }
        return new Promise((resolve, reject) => {
            const audioConstraintsForMic = new Owt.Base.AudioTrackConstraints(Owt.Base.AudioSourceInfo.MIC);
            const videoConstraintsForCamera = new Owt.Base
                .VideoTrackConstraints(Owt.Base.VideoSourceInfo.CAMERA);
            var streamConstraints;
            if (self.callType == WKRTCCallType.Audio) {
                streamConstraints = new Owt.Base
                    .StreamConstraints(audioConstraintsForMic, videoConstraintsForCamera);
                streamConstraints.video = false;
            }
            else {
                streamConstraints = new Owt.Base
                    .StreamConstraints(audioConstraintsForMic, videoConstraintsForCamera);
                streamConstraints.video = true;
            }
            let mediaStream;
            Owt.Base.MediaStreamFactory.createMediaStream(streamConstraints).then((stream) => {
                mediaStream = stream;
                var cameraSource = 'camera';
                if (self.callType == WKRTCCallType.Video) {
                    cameraSource = 'camera';
                }
                self.localStream = new Owt.Base.LocalStream(mediaStream, new Owt
                    .Base.StreamSourceInfo('mic', cameraSource));
                resolve(self.localStream);
            }, (err) => {
                console.error('Failed to create MediaStream, ' + err);
                reject(err);
            });
        });
    }
    pulishLocalStream(toUID, localStream) {
        console.log("pulishLocalStream---->");
        if (this.localStreamIsPublished) {
            return new Promise((resolve) => {
                return resolve(null);
            });
        }
        this.localStreamIsPublished = true;
        const self = this;
        return new Promise((resolve, reject) => {
            console.log("this.p2p----->", self.p2p, self);
            self.p2p.publish(toUID, localStream).then((publication) => {
                self.publicationForCamera = publication;
                resolve(null);
            }, (error) => {
                console.log('Failed to share video.', error);
                reject(error);
            });
        });
    }
    async accept() {
        this.p2p.allowedRemoteIds = [this.fromUID, WKApp.loginInfo.uid || ""];
        await P2pCallManager.shared().connect();
        return P2pCallAPI.shared().accept(this.fromUID, this.callType);
    }
    async invite() {
        this.p2p.allowedRemoteIds = [this.fromUID, WKApp.loginInfo.uid || ""];
        await P2pCallManager.shared().connect();
        return P2pCallAPI.shared().invite(this.fromUID, this.callType);
    }
    refuse() {
        return P2pCallAPI.shared().refuse(this.fromUID, this.callType);
    }
    getCallSeconds() {
        if (!this.startAnswerTime) {
            return 0;
        }
        const endAnswerTime = new Date();
        const diff = endAnswerTime.getTime() - this.startAnswerTime.getTime();
        const second = Math.floor(diff / 1000);
        return second;
    }
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    }
    hangup(isActive) {
        if (!isActive) {
            return;
        }
        const endAnswerTime = new Date();
        const diff = endAnswerTime.getTime() - this.startAnswerTime.getTime();
        const second = Math.floor(diff / 1000);
        return P2pCallAPI.shared().hangup(this.fromUID, second, this.callType, this.isCaller);
    }
    async close() {
        if (this.stopped) {
            // 即使已经 stopped 过，也强制将状态重置，防止残留
            this.status = P2PCallStatus.None;
            this.callStartTime = undefined;
            return;
        }
        console.log("rtc close---->");
        this.stopped = true;
        this.startAnswerTime = undefined;
        this.callStartTime = undefined;
        // ★ 先重置状态，再做资源清理；即使后续抛异常也不会残留
        this.status = P2PCallStatus.None;
        try {
            if (this.publicationForCamera) {
                this.publicationForCamera.stop();
                this.publicationForCamera = null;
            }
        } catch (e) { console.warn("close: stop publication failed", e); }
        try {
            if (this.localStream) {
                for (const track of this.localStream.mediaStream.getTracks()) {
                    track.stop();
                }
                this.localStream = undefined;
            }
        } catch (e) { console.warn("close: stop local stream failed", e); }
        try {
            if (this.p2p) {
                if (this.isConnected) {
                    await this.p2p.stop(this.fromUID);
                    await this.p2p.disconnect();
                }
                this.p2p.clearEventListener("streamadded");
                this.p2p.clearEventListener("messagereceived");
                this.p2p = null;
            }
        } catch (e) { console.warn("close: stop p2p failed", e); }
        this.isConnected = false;
    }
}
export class AuidoCallManager {
    static shared() {
        if (!AuidoCallManager.instance) {
            AuidoCallManager.instance = new AuidoCallManager();
        }
        return AuidoCallManager.instance;
    }
    playRingtone() {
        if (!this.ringtoneElement) {
            const audioContext = new AudioContext();
            this.ringtoneElement = new Audio('/audio/receive.mp3');
            this.ringtoneElement.loop = true;
            const source = audioContext.createMediaElementSource(this.ringtoneElement);
            source.connect(audioContext.destination);
            this.ringtoneElement.play();
        }
        else {
            this.ringtoneElement.currentTime = 0;
            this.ringtoneElement.play();
        }
    }
    stopRingtone() {
        if (this.ringtoneElement) {
            this.ringtoneElement.pause();
        }
    }
    playHangup() {
        if (!this.hangupElement) {
            const audioContext = new AudioContext();
            this.hangupElement = new Audio('/audio/hangup.wav');
            const source = audioContext.createMediaElementSource(this.hangupElement);
            source.connect(audioContext.destination);
            this.hangupElement.play();
        }
        else {
            this.hangupElement.currentTime = 0;
            this.hangupElement.play();
        }
    }
    stopHangup() {
        if (this.hangupElement) {
            this.hangupElement.pause();
        }
    }
}
