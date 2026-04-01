import { Message } from "wukongimjssdk";
export declare enum WKRTCCallType {
    Audio = 0,
    Video = 1
}
export declare class SignalingChannel {
    messageListener?: (msg: Message) => void;
    onMessage?: any;
    connect(loginInfo: any): Promise<string>;
    send(targetID: string, message: any): Promise<Message>;
    disconnect(): Promise<void>;
}
export declare class P2pCallAPI {
    private static instance;
    static shared(): P2pCallAPI;
    call(to: string, callType: WKRTCCallType): Promise<any>;
    cancel(to: string): Promise<any>;
    hangup(to: string, second: number, callType: WKRTCCallType, isCaller: boolean): Promise<any>;
    invite(to: string, callType: WKRTCCallType): Promise<any>;
    accept(to: string, callType: WKRTCCallType): Promise<any>;
    refuse(to: string, callType: WKRTCCallType): Promise<any>;
}
//# sourceMappingURL=signalingChannel.d.ts.map