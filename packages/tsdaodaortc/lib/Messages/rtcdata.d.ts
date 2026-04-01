import { MessageContent } from "wukongimjssdk";
export declare class RTCDataContent extends MessageContent {
    data: string;
    encodeJSON(): {
        content: string;
    };
    decodeJSON(content: any): void;
    get contentType(): number;
}
//# sourceMappingURL=rtcdata.d.ts.map