import React, { Component } from "react";
import './index.css';
import WKAvatar from "@tsdaodao/base/src/Components/WKAvatar";
import { WKApp } from "@tsdaodao/base";
import WKSDK, { Channel, ChannelTypePerson } from "wukongimjssdk";
import { AnswerButton, HangupButton } from "../Components/Callbutton";
import { P2PCallStatus, P2pCallManager } from "./manager";
import { WKRTCCallType } from "./signalingChannel";
import { Size, VideoUtil } from "../Service/util";
export class P2PCallProps {
}
export class P2PCallState {
    constructor() {
        this.remoteVideoChangeBig = false;
        this.seconds = 0;
    }
}
export default class P2PCall extends Component {
    constructor(props) {
        super(props);
        this.onAnswer = async () => {
            const { uid, onAnswer } = this.props;
            if (onAnswer) {
                await onAnswer();
            }
            this.setState({});
            this.remoteVideoRef.current.onloadedmetadata = (e) => {
                const target = this.remoteVideoRef.current;
                const width = target.videoWidth;
                const height = target.videoHeight;
                const needSize = VideoUtil.convertVideoSize(new Size(width, height));
                target.style.height = `${needSize.height}px`;
                target.style.width = `${needSize.width}px`;
            };
            console.log("pulishLocalStream start....");
            await this.pulishLocalStream();
            console.log("pulishLocalStream end....");
        };
        this.onLocalVideoClick = () => {
            console.log("onLocalVideoClick...");
            if (!this.state.remoteVideoChangeBig || P2pCallManager.shared().status !== P2PCallStatus.Talking) {
                return;
            }
            this.setState({ remoteVideoChangeBig: false });
            this.localVideoChangeToBig();
            this.remoteVideoChangeToSmall();
        };
        this.onRemoteVideoClick = () => {
            console.log("onRemoteVideoClick...");
            if (this.state.remoteVideoChangeBig || P2pCallManager.shared().status !== P2PCallStatus.Talking) {
                return;
            }
            this.setState({ remoteVideoChangeBig: true });
            this.remoteVideoChangeToBig();
            this.localVideoChangeToSmall();
        };
        this.localVideoRef = React.createRef();
        this.remoteVideoRef = React.createRef();
        this.videoBoxRef = React.createRef();
        this.state = new P2PCallState();
    }
    componentDidMount() {
        this.channelListener = (channelInfo) => {
            this.setState({});
        };
        WKSDK.shared().channelManager.addListener(this.channelListener);
        if (P2pCallManager.shared().callType == WKRTCCallType.Video) {
            this.renderLocalStream();
        }
        let isPlaying = false;
        P2pCallManager.shared().onStreamadded = async (e) => {
            var _a;
            console.log("onStreamadded.....");
            // if (isPlaying) {
            //     return
            // }
            this.startCallTimer();
            this.setState({});
            if (((_a = this.remoteVideoRef) === null || _a === void 0 ? void 0 : _a.current) && e.stream.mediaStream) {
                // isPlaying = true
                this.remoteVideoRef.current.srcObject = e.stream.mediaStream;
            }
            if (P2pCallManager.shared().isCaller) {
                const localStream = await P2pCallManager.shared().getLocalStream();
                if (!P2pCallManager.shared().localStreamIsPublished) {
                    await this.pulishLocalStream();
                    await this.renderLocalStream();
                }
            }
        };
    }
    componentWillUnmount() {
        WKSDK.shared().channelManager.removeListener(this.channelListener);
        clearInterval(this.intervalId);
    }
    startCallTimer() {
        if (!this.intervalId) {
            this.intervalId = setInterval(() => {
                this.setState({
                    seconds: P2pCallManager.shared().getCallSeconds(),
                });
            }, 1000);
        }
    }
    async pulishLocalStream() {
        const { uid } = this.props;
        const localStream = await P2pCallManager.shared().getLocalStream();
        if (localStream) {
            await P2pCallManager.shared().pulishLocalStream(uid, localStream);
        }
    }
    async renderLocalStream() {
        var _a;
        const localStream = await P2pCallManager.shared().getLocalStream();
        if ((_a = this.localVideoRef) === null || _a === void 0 ? void 0 : _a.current) {
            this.localVideoRef.current.srcObject = localStream.mediaStream;
        }
    }
    getFooterUI() {
        const { onHangup } = this.props;
        switch (P2pCallManager.shared().status) {
            case P2PCallStatus.Calling:
                if (P2pCallManager.shared().isCaller) {
                    return React.createElement(HangupButton, { onClick: onHangup });
                }
                return React.createElement(React.Fragment, null,
                    React.createElement(HangupButton, { onClick: onHangup }),
                    React.createElement(AnswerButton, { onClick: this.onAnswer }));
            case P2PCallStatus.Answering:
                return React.createElement(HangupButton, { onClick: onHangup });
            case P2PCallStatus.Talking:
                return React.createElement(HangupButton, { onClick: onHangup });
        }
    }
    getP2pStatusClass() {
        switch (P2pCallManager.shared().status) {
            case P2PCallStatus.Calling:
                return "wk-p2p-calling";
            case P2PCallStatus.Answering:
                return "wk-p2p-answering";
            case P2PCallStatus.Talking:
                return "wk-p2p-talking";
            case P2PCallStatus.Hangup:
                return "wk-p2p-hangup";
        }
    }
    localVideoChangeToSmall() {
        const target = this.localVideoRef.current;
        const width = target.videoWidth;
        const height = target.videoHeight;
        const needSize = VideoUtil.convertVideoSize(new Size(width, height));
        target.style.height = `${needSize.height}px`;
        target.style.width = `${needSize.width}px`;
        target.style.right = `20px`;
        target.style.top = `20px`;
        target.style.left = `unset`;
        target.style.bottom = `unset`;
    }
    localVideoChangeToBig() {
        const target = this.localVideoRef.current;
        const videoBox = this.videoBoxRef.current;
        const localVideoBoxHeight = videoBox.offsetHeight;
        const localVideoBoxWidth = videoBox.offsetWidth;
        target.style.height = `${localVideoBoxHeight}px`;
        target.style.width = `${localVideoBoxWidth}px`;
        target.style.left = `0px`;
        target.style.top = `0px`;
    }
    remoteVideoChangeToSmall() {
        const target = this.remoteVideoRef.current;
        const width = target.videoWidth;
        const height = target.videoHeight;
        const needSize = VideoUtil.convertVideoSize(new Size(width, height));
        target.style.right = `20px`;
        target.style.top = `20px`;
        target.style.height = `${needSize.height}px`;
        target.style.width = `${needSize.width}px`;
        target.style.left = `unset`;
        target.style.bottom = `unset`;
    }
    remoteVideoChangeToBig() {
        const target = this.remoteVideoRef.current;
        const videoBox = this.videoBoxRef.current;
        const localVideoBoxHeight = videoBox.offsetHeight;
        const localVideoBoxWidth = videoBox.offsetWidth;
        target.style.height = `${localVideoBoxHeight}px`;
        target.style.width = `${localVideoBoxWidth}px`;
        target.style.left = `0px`;
        target.style.top = `0px`;
    }
    getTip(channelInfo) {
        if (P2pCallManager.shared().status == P2PCallStatus.Talking) {
            if (P2pCallManager.shared().callType === WKRTCCallType.Video) {
                return "";
            }
            return `${P2pCallManager.shared().formatTime(this.state.seconds)}`;
        }
        else {
            if (P2pCallManager.shared().isCaller) {
                return "正在等待对方接听...";
            }
            return `${channelInfo === null || channelInfo === void 0 ? void 0 : channelInfo.title}邀请你${P2pCallManager.shared().callType === WKRTCCallType.Video ? "视频" : "语音"}通话`;
        }
    }
    render() {
        const { uid } = this.props;
        const { remoteVideoChangeBig } = this.state;
        const channel = new Channel(uid, ChannelTypePerson);
        const channelInfo = WKSDK.shared().channelManager.getChannelInfo(channel);
        if (channelInfo) {
            WKSDK.shared().channelManager.fetchChannelInfo(channel);
        }
        return React.createElement("div", { className: `wk-p2pcall ${this.getP2pStatusClass()} ${P2pCallManager.shared().callType === WKRTCCallType.Video ? "wk-p2p-calltype-video" : "wk-p2p-calltype-audio"}`, ref: this.videoBoxRef },
            React.createElement("video", { playsInline: true, autoPlay: true, ref: this.localVideoRef, className: `wk-p2pcall-localvideo ${remoteVideoChangeBig ? 'wk-p2p-changesmall' : 'wk-p2p-changebig'}`, onClick: this.onLocalVideoClick }),
            React.createElement("video", { playsInline: true, autoPlay: true, onClick: this.onRemoteVideoClick, ref: this.remoteVideoRef, className: `wk-p2pcall-remotevideo ${remoteVideoChangeBig ? 'wk-p2p-changebig' : 'wk-p2p-changesmall'}` }),
            React.createElement("div", { className: "wk-p2pcall-content" },
                React.createElement("div", { className: "wk-p2pcall-userbox" },
                    React.createElement("div", { className: "wk-userbox-avatar" },
                        React.createElement(WKAvatar, { src: WKApp.shared.avatarUser(uid), style: { width: "100px", height: "100px" } })),
                    React.createElement("div", { className: "wk-userbox-name" }, channelInfo === null || channelInfo === void 0 ? void 0 : channelInfo.title),
                    React.createElement("div", { className: "wk-userbox-tip" }, this.getTip(channelInfo)))),
            React.createElement("div", { className: "wk-p2pcall-footer" }, this.getFooterUI()));
    }
}
