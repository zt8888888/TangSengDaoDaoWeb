/// <reference types="react" />
import { MessageContent } from "wukongimjssdk";
import { WKRTCCallType } from "../P2pcall/signalingChannel";
import { MessageCell } from "@tsdaodao/base";
import "./system.css";
export declare class CallSystemContent extends MessageContent {
    content: string;
    second: number;
    callType: WKRTCCallType;
    isAnswered: boolean;
    constructor(contentType: number);
    encodeJSON(): {
        content: string;
        second: number;
        call_Type: WKRTCCallType;
        result_type: number;
    };
    decodeJSON(content: any): void;
    get conversationDigest(): string;
}
export declare class CallSystemCell extends MessageCell {
    render(): JSX.Element;
}
//# sourceMappingURL=system.d.ts.map