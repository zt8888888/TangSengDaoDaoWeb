import { MediaMessageContent } from "wukongimjssdk";
import React from "react";
import WKApp from "../../App";
import MessageBase from "../Base";
import { MessageCell } from "../MessageCell";
import "./index.css"
import { MessageContentTypeConst } from "../../Service/Const";

export class VideoContent extends MediaMessageContent {
    url!: string  // 小视频下载地址
    cover!: string // 小视频封面图片下载地址
    size: number = 0 // 小视频大小 单位byte
    width!: number // 小视频宽度
    height!: number // 小视频高度
    second!: number // 小视频秒长

    constructor(file?: File, width?: number, height?: number, second?: number, size?: number) {
        super()
        this.file = file
        this.width = width || 0
        this.height = height || 0
        this.second = second || 0
        this.size = size || 0
    }

    decodeJSON(content: any) {
        this.url = content["url"] || ""
        this.cover = content["cover"] || ""
        this.size = content["size"] || 0
        this.width = content["width"] || 0
        this.height = content["height"] || 0
        this.second = content["second"] || 0
        this.remoteUrl = this.url
    }

    encodeJSON() {
        return { "url": this.url || this.remoteUrl || "", "cover": this.cover || "", "size": this.size || 0, "width": this.width || 0, "height": this.height || 0, "second": this.second || 0 }
    }

    get contentType() {
        return MessageContentTypeConst.smallVideo
    }

    get conversationDigest() {
        return "[小视频]"
    }

}

export class VideoCell extends MessageCell<any, any> {

    secondFormat(second: number): string {

        const minute = parseInt(`${( second / 60)}`)
        const realSecond = parseInt(`${second % 60}`)

        let minuteFormat = ""
        if (minute > 9) {
            minuteFormat = `${minute}`
        } else {
            minuteFormat = `0${minute}`
        }

        let secondFormat = ""
        if (realSecond > 9) {
            secondFormat = `${realSecond}`
        } else {
            secondFormat = `0${realSecond}`
        }

        return `${minuteFormat}:${secondFormat}`
    }

    videoScale(orgWidth: number, orgHeight: number, maxWidth = 380, maxHeight = 380) {
        let actSize = { width: orgWidth, height: orgHeight };
        if (orgWidth > orgHeight) {//横图
            if (orgWidth > maxWidth) { // 横图超过最大宽度
                let rate = maxWidth / orgWidth; // 缩放比例
                actSize.width = maxWidth;
                actSize.height = orgHeight * rate;
            }
        } else if (orgWidth < orgHeight) { //竖图
            if (orgHeight > maxHeight) {
                let rate = maxHeight / orgHeight; // 缩放比例
                actSize.width = orgWidth * rate;
                actSize.height = maxHeight;
            }
        } else if (orgWidth === orgHeight) {
            if (orgWidth > maxWidth) {
                let rate = maxWidth / orgWidth; // 缩放比例
                actSize.width = maxWidth;
                actSize.height = orgHeight * rate;
            }
        }
        return actSize;
    }
    render() {
        const { message, context } = this.props
        const content = message.content as VideoContent
        const actSize = this.videoScale(content.width, content.height)
        const cover = WKApp.dataSource.commonDataSource.getImageURL(content.cover)
        const videoURL = WKApp.dataSource.commonDataSource.getFileURL(content.url)
        return <MessageBase hiddeBubble={true} message={message} context={context}>
            <div
                className="wk-message-video"
                style={{ width: actSize.width, height: actSize.height, cursor: "pointer", position: "relative" }}
                onClick={() => {
                    if (!videoURL) return
                    WKApp.shared.baseContext.showGlobalModal({
                        closable: false,
                        className: "wk-base-modal wk-video-preview-modal",
                        body: (
                            <div
                                className="wk-video-preview-overlay"
                                onClick={() => {
                                    WKApp.shared.baseContext.hideGlobalModal()
                                }}
                            >
                                <div className="wk-video-preview" onClick={(e) => e.stopPropagation()}>
                                    <div className="wk-video-preview-header">
                                        <a
                                            className="wk-video-preview-close"
                                            onClick={() => {
                                                WKApp.shared.baseContext.hideGlobalModal()
                                            }}
                                        >
                                            关闭
                                        </a>
                                    </div>
                                    <video className="wk-video-preview-player" controls autoPlay poster={cover}>
                                        <source src={videoURL} type="video/mp4" />
                                    </video>
                                </div>
                            </div>
                        ),
                        width: "auto",
                        onCancel: () => {
                            WKApp.shared.baseContext.hideGlobalModal()
                        }
                    })
                }}
            >
                <div className="wk-message-video-content" style={{ position: "relative" }}>
                    <span className="wk-message-video-content-time">{this.secondFormat(content.second)}</span>
                    <div className="wk-message-video-content-video">
                        <img src={cover} width={actSize.width} height={actSize.height} alt="" />
                    </div>
                </div>
            </div>
        </MessageBase>
    }
}