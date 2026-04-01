import { IModule } from "@tsdaodao/base";
import { WKRTCCallType } from "./P2pcall/signalingChannel";
/**
 * 拨打语音/视频
 * @param channelID
 * @param CallType
 */
export declare const RTCCall: (channelID: string, CallType: WKRTCCallType) => void;
export default class RTCModule implements IModule {
    notify?: Notification;
    id(): string;
    handleHangup(isActive: boolean): Promise<void>;
    handleClose(): void;
    handleAnswer(): Promise<void>;
    recvCallNotification(fromUID: string, callType: WKRTCCallType): void;
    sendAnsweredByOtherDeviceNotification(): void;
    init(): void;
}
//# sourceMappingURL=module.d.ts.map