import { MessageContentTypeConst } from "@tsdaodao/base";
import { MessageContent } from "wukongimjssdk";
export class RTCDataContent extends MessageContent {
    encodeJSON() {
        return {
            content: this.data,
        };
    }
    decodeJSON(content) {
        this.data = content["content"];
    }
    get contentType() {
        return MessageContentTypeConst.rtcData;
    }
}
