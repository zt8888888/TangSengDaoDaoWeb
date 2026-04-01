import React, { Component } from "react";
import './index.css';
import { ChannelInfo, ChannelInfoListener } from "wukongimjssdk";
export declare class P2PCallProps {
    uid: string;
    onHangup?: () => void;
    onAnswer?: () => void;
}
export declare class P2PCallState {
    remoteVideoChangeBig: boolean;
    seconds: number;
}
export default class P2PCall extends Component<P2PCallProps, P2PCallState> {
    channelListener: ChannelInfoListener;
    private localVideoRef?;
    private remoteVideoRef?;
    private videoBoxRef?;
    private intervalId;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    startCallTimer(): void;
    onAnswer: () => Promise<void>;
    pulishLocalStream(): Promise<void>;
    renderLocalStream(): Promise<void>;
    getFooterUI(): JSX.Element | undefined;
    getP2pStatusClass(): "wk-p2p-calling" | "wk-p2p-answering" | "wk-p2p-talking" | "wk-p2p-hangup" | undefined;
    onLocalVideoClick: () => void;
    onRemoteVideoClick: () => void;
    localVideoChangeToSmall(): void;
    localVideoChangeToBig(): void;
    remoteVideoChangeToSmall(): void;
    remoteVideoChangeToBig(): void;
    getTip(channelInfo?: ChannelInfo): string;
    render(): React.ReactNode;
}
//# sourceMappingURL=index.d.ts.map