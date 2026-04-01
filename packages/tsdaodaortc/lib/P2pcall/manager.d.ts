import { WKRTCCallType } from "./signalingChannel";
export declare enum P2PCallStatus {
    None = 0,
    Calling = 1,
    Answering = 2,
    Talking = 3,
    Hangup = 4
}
export declare class P2pCallManager {
    status: P2PCallStatus;
    private static instance;
    p2p: any;
    localStream?: any;
    publicationForCamera?: any;
    fromUID: string;
    callType: WKRTCCallType;
    isCaller: boolean;
    startAnswerTime?: Date;
    isConnected?: boolean;
    stopped?: boolean;
    ringtoneElement?: HTMLAudioElement;
    hangupElement?: HTMLAudioElement;
    onStreamadded?: (e: any) => void;
    localStreamIsPublished?: boolean;
    static shared(): P2pCallManager;
    initP2p(): void;
    setupCall(fromUID: string, callType: WKRTCCallType, isCaller: boolean): void;
    connect(): any;
    getLocalStream(): Promise<any>;
    pulishLocalStream(toUID: string, localStream: any): Promise<any>;
    accept(): Promise<any>;
    invite(): Promise<any>;
    refuse(): Promise<any>;
    getCallSeconds(): number;
    formatTime(seconds: number): string;
    hangup(isActive: boolean): Promise<any> | undefined;
    close(): Promise<void>;
}
export declare class AuidoCallManager {
    private static instance;
    ringtoneElement?: HTMLAudioElement;
    hangupElement?: HTMLAudioElement;
    static shared(): AuidoCallManager;
    playRingtone(): void;
    stopRingtone(): void;
    playHangup(): void;
    stopHangup(): void;
}
//# sourceMappingURL=manager.d.ts.map