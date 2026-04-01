import { MediaMessageContent } from "wukongimjssdk"
import React from "react"
import WKApp from "../../App"
import { MessageContentTypeConst } from "../../Service/Const"
import MessageBase from "../Base"
import MessageTrail from "../Base/tail"
import { MessageCell } from "../MessageCell"
import Viewer from 'react-viewer';
import { Toast } from "@douyinfe/semi-ui";


export class ImageContent extends MediaMessageContent {
    width!: number
    height!: number
    url!: string
    imgData?: string
    constructor(file?: File, imgData?: string, width?: number, height?: number) {
        super()
        this.file = file
        this.imgData = imgData
        this.width = width || 0
        this.height = height || 0
    }
    decodeJSON(content: any) {
        this.width = content["width"] || 0
        this.height = content["height"] || 0
        this.url = content["url"] || ''
        this.remoteUrl = this.url
    }
    encodeJSON() {
        return { "width": this.width || 0, "height": this.height || 0, "url": this.remoteUrl || "" }
    }
    get contentType() {
        return MessageContentTypeConst.image
    }
    get conversationDigest() {
        return "[图片]"
    }
}


interface ImageCellState {
    showPreview: boolean
    images: any[]
    activeIndex: number
    fallbackSrc?: string
}

export class ImageCell extends MessageCell<any, ImageCellState> {
    private viewerContextMenuBound = false
    private copyingFromViewer = false

    constructor(props: any) {
        super(props)
        this.state = {
            showPreview: false,
            images: [],
            activeIndex: 0,
            fallbackSrc: undefined
        }
    }

    componentDidUpdate(_: any, prevState: ImageCellState): void {
        if (prevState.showPreview !== this.state.showPreview) {
            if (this.state.showPreview) {
                this.bindViewerContextMenu()
            } else {
                this.unbindViewerContextMenu()
            }
        }
    }

    componentWillUnmount(): void {
        this.unbindViewerContextMenu()
    }

    private bindViewerContextMenu() {
        if (this.viewerContextMenuBound) return
        document.addEventListener("contextmenu", this.onViewerContextMenu as any, true)
        this.viewerContextMenuBound = true
    }

    private unbindViewerContextMenu() {
        if (!this.viewerContextMenuBound) return
        document.removeEventListener("contextmenu", this.onViewerContextMenu as any, true)
        this.viewerContextMenuBound = false
    }

    private toAbsoluteUrl(inputUrl: string): string {
        if (!inputUrl) return inputUrl
        try {
            return new URL(inputUrl, window.location.origin).href
        } catch {
            return inputUrl
        }
    }

    private getTokenHeader(): Record<string, string> {
        try {
            const token = WKApp.apiClient.config.tokenCallback?.()
            if (token) {
                return { token }
            }
        } catch {
            // ignore
        }
        return {}
    }

    private async fetchImageAsBlob(fetchUrl: string, requestInit: RequestInit): Promise<Blob> {
        const res = await fetch(fetchUrl, requestInit)
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }
        return await res.blob()
    }

    private async resolveImageBlob(absoluteUrl: string): Promise<Blob> {
        const directInit: RequestInit = {
            mode: "cors",
            credentials: "omit",
        }

        // 同源/同 API 域时才尝试附带 token（跨域附带自定义 header 会触发预检）
        try {
            const apiBase = WKApp.apiClient.config.apiURL || ""
            const apiOrigin = apiBase ? new URL(apiBase, window.location.origin).origin : ""
            const target = new URL(absoluteUrl, window.location.origin)
            const isSameOriginAsPage = target.origin === window.location.origin
            const isSameOriginAsApi = apiOrigin ? target.origin === apiOrigin : false
            if (isSameOriginAsPage || isSameOriginAsApi) {
                const tokenHeader = this.getTokenHeader()
                if (Object.keys(tokenHeader).length > 0) {
                    directInit.headers = {
                        ...(directInit.headers || {}),
                        ...tokenHeader,
                    }
                }
            }
        } catch {
            // ignore
        }

        try {
            return await this.fetchImageAsBlob(absoluteUrl, directInit)
        } catch {
            // ignore
        }

        // 通过服务端代理绕过跨域/CORS
        const proxyUrl = `${WKApp.apiClient.config.apiURL}file/proxy?url=${encodeURIComponent(absoluteUrl)}`
        const proxyInit: RequestInit = {
            headers: {
                ...this.getTokenHeader(),
            },
            credentials: "omit",
        }
        return await this.fetchImageAsBlob(proxyUrl, proxyInit)
    }

    private copyViewerActiveImage = async () => {
        const img = this.state.images?.[this.state.activeIndex]
        const src = img?.downloadUrl || img?.src || ""
        if (!src) {
            Toast.warning("图片未就绪，请稍后再试")
            return
        }
        const absoluteUrl = this.toAbsoluteUrl(src)

        const isElectron = Boolean((window as any).__POWERED_ELECTRON__ && (window as any).ipc?.invoke)
        if (isElectron) {
            const blob = await this.resolveImageBlob(absoluteUrl)
            const ab = await blob.arrayBuffer()
            const r = await (window as any).ipc.invoke("clipboard:writeImage", { data: ab })
            if (r?.ok) {
                Toast.success("复制成功")
                return
            }
            throw new Error("electron-clipboard-failed")
        }

        const ClipboardItemCtor = (window as any).ClipboardItem
        if (!navigator.clipboard?.write || !ClipboardItemCtor) {
            Toast.warning("当前环境不支持复制图片到剪贴板，请使用 Chrome/Edge 或桌面端")
            return
        }

        const blobPromise: Promise<Blob> = this.resolveImageBlob(absoluteUrl)

        const guessMimeTypeFromUrl = (imageUrl: string): string => {
            const lower = (imageUrl || "").toLowerCase()
            let pathname = lower
            try {
                pathname = new URL(imageUrl, window.location.origin).pathname.toLowerCase()
            } catch {
                // ignore
            }
            if (pathname.endsWith(".png")) return "image/png"
            if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg"
            if (pathname.endsWith(".gif")) return "image/gif"
            if (pathname.endsWith(".webp")) return "image/webp"
            if (pathname.endsWith(".bmp")) return "image/bmp"
            return "image/png"
        }

        const convertToPngIfPossible = async (blob: Blob): Promise<Blob> => {
            if (blob.type === "image/png") return blob
            if (blob.size > 12 * 1024 * 1024) {
                throw new Error("too-large-to-convert")
            }
            if (!(window as any).createImageBitmap) {
                throw new Error("no-createImageBitmap")
            }
            const bitmap = await (window as any).createImageBitmap(blob)
            try {
                const canvas = document.createElement("canvas")
                canvas.width = bitmap.width
                canvas.height = bitmap.height
                const ctx = canvas.getContext("2d")
                if (!ctx) {
                    throw new Error("no-canvas-ctx")
                }
                ctx.drawImage(bitmap, 0, 0)
                const png = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob(
                        (b) => {
                            if (b) resolve(b)
                            else reject(new Error("toBlob failed"))
                        },
                        "image/png"
                    )
                })
                return png
            } finally {
                bitmap.close?.()
            }
        }

        const preferredMimeType = guessMimeTypeFromUrl(absoluteUrl)

        let ok = false
        try {
            await navigator.clipboard.write([
                new ClipboardItemCtor({
                    "image/png": (async () => {
                        const b = await blobPromise
                        const typed = b.type ? b : new Blob([b], { type: preferredMimeType })
                        return await convertToPngIfPossible(typed)
                    })(),
                }),
            ])
            ok = true
        } catch {
            // ignore
        }

        if (!ok) {
            await navigator.clipboard.write([
                new ClipboardItemCtor({
                    [preferredMimeType]: (async () => {
                        const b = await blobPromise
                        const typed = b.type ? b : new Blob([b], { type: preferredMimeType })
                        return typed.type === preferredMimeType ? typed : new Blob([typed], { type: preferredMimeType })
                    })(),
                }),
            ])
        }
        Toast.success("复制成功")
    }

    private onViewerContextMenu = (e: MouseEvent) => {
        if (!this.state.showPreview) return

        // viewer 打开时，右键应当始终用于“复制图片”，避免浏览器默认菜单（返回/前进等）误触。
        e.preventDefault()
        e.stopPropagation()
        ;(e as any).stopImmediatePropagation?.()

        if (this.copyingFromViewer) return
        this.copyingFromViewer = true

        void this.copyViewerActiveImage()
            .catch((err) => {
                const name = (err as any)?.name || ""
                if (name === "NotAllowedError") {
                    Toast.warning("浏览器拒绝写入剪贴板，请检查权限/HTTPS，并重试")
                    return
                }
                Toast.error("复制图片失败")
            })
            .finally(() => {
                this.copyingFromViewer = false
            })
    }

    imageScale(orgWidth: number, orgHeight: number, maxWidth = 250, maxHeight = 250) {
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

    getImageSrc(content: ImageContent) {
        if (content.url && content.url !== "") { // 等待发送的消息
            let downloadURL = WKApp.dataSource.commonDataSource.getImageURL(content.url, { width: content.width, height: content.height })
            if (downloadURL.indexOf("?") != -1) {
                downloadURL += "&filename=image.png"
            } else {
                downloadURL += "?filename=image.png"
            }
            return downloadURL
        }
        return content.imgData
    }

    getProxyImageSrc(content: ImageContent) {
        const src = this.getImageSrc(content)
        if (!src) {
            return src
        }
        if (src.indexOf("proxy=1") !== -1) {
            return src
        }
        return src.indexOf("?") !== -1 ? `${src}&proxy=1` : `${src}?proxy=1`
    }

    handleImageError(content: ImageContent) {
        if (this.state.fallbackSrc) {
            return
        }
        const proxySrc = this.getProxyImageSrc(content)
        if (proxySrc && proxySrc !== this.getImageSrc(content)) {
            this.setState({ fallbackSrc: proxySrc })
        }
    }

    getImageElement() {
        const { message } = this.props
        const content = message.content as ImageContent
        let scaleSize = this.imageScale(content.width, content.height);
        const src = this.state.fallbackSrc || this.getImageSrc(content)
        return <img alt="" src={src} onError={this.handleImageError.bind(this, content)} style={{ borderRadius: '5px', width: scaleSize.width, height: scaleSize.height }} />
    }

    render() {
        const { message, context } = this.props
        const { showPreview, images, activeIndex } = this.state
        const content = message.content as ImageContent
        let scaleSize = this.imageScale(content.width, content.height);
        // const imageURL = this.getImageSrc(content) || ""
        return <MessageBase context={context} message={message}>
            <div style={{ width: scaleSize.width, height: scaleSize.height, cursor: "pointer" }} onClick={() => {
                let imgList: any[] = []
                let idx = 0
                const vm = (context as any).vm
                if (vm && vm.messages) {
                    const imgMessages = vm.messages.filter((m: any) => m.contentType === MessageContentTypeConst.image && !m.revoke && !m.isDeleted)
                    imgList = imgMessages.map((m: any) => {
                        const c = m.content as ImageContent
                        const src = this.getImageSrc(c) || ""
                        return {
                            src: src,
                            alt: '',
                            downloadUrl: src
                        }
                    })
                    idx = imgMessages.findIndex((m: any) => m.clientMsgNo === message.clientMsgNo)
                    if (idx < 0) idx = 0
                }
                if (imgList.length === 0) {
                    const src = this.getImageSrc(content) || ""
                    imgList = [{ src, alt: '', downloadUrl: src }]
                }
                this.setState({
                    showPreview: !this.state.showPreview,
                    images: imgList,
                    activeIndex: idx
                })
            }}>
                {this.getImageElement()}
            </div>
            <div style={{ width: "100%", display: "flow-root" }}>
                <MessageTrail message={message} />
            </div>
            {showPreview ? (
                <Viewer
                    visible={showPreview}
                    noImgDetails={true}
                    downloadable={true}
                    rotatable={false}
                    changeable={true}
                    showTotal={true}
                    activeIndex={activeIndex}
                    onMaskClick={() => { this.setState({ showPreview: false }); }}
                    onClose={() => { this.setState({ showPreview: false }); }}
                    onChange={(_: any, index: number) => { this.setState({ activeIndex: index }) }}
                    images={images}
                />
            ) : null}
        </MessageBase>
    }
}