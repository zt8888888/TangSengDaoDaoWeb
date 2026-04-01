import { ConversationContext, FileHelper, ImageContent, WKApp } from "@tsdaodao/base";
import { VideoContent } from "../../Messages/Video";
import React from "react";
import { Component, ReactNode } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

import "./index.css"


interface ImageToolbarProps {
    conversationContext: ConversationContext
    icon: string
    accept?: string
}

interface ImageToolbarState {
    showDialog: boolean
    file?: any
    fileType?: string
    previewUrl?: any,
    fileIconInfo?: any,
    canSend?: boolean
    width?: number
    height?: number
    videoCover?: string
    videoDuration?: number
    uploading?: boolean
    progress?: number
}

export default class ImageToolbar extends Component<ImageToolbarProps, ImageToolbarState>{
    pasteListen!:(event:any)=>void
    constructor(props:any) {
        super(props)
        this.state = {
            showDialog: false,
            uploading: false,
            progress: 0
        }
    }

    componentDidMount() {
        let self = this;

        const { conversationContext } = this.props

        const accept = this.props.accept || "";
        if (accept.includes("image")) {
            this.pasteListen = function (event:any) { // 监听粘贴里的文件
                let files = event.clipboardData.files;
                if (files.length > 0) {
                    self.showFile(files[0]);
                }
            }
            document.addEventListener('paste',this.pasteListen )
        }

        conversationContext.setDragFileCallback((file)=>{
            self.showFile(file);
        })
    }

    componentWillUnmount() {
        document.removeEventListener("paste",this.pasteListen)
    }

    $fileInput: any
    onFileClick = (event: any) => {
        event.target.value = '' // 防止选中一个文件取消后不能再选中同一个文件
    }
    onFileChange() {
        if (this.$fileInput.files.length > 0) {
            let file = this.$fileInput.files[0];
            this.showFile(file);
        }
    }
    chooseFile = () => {
        this.$fileInput.click();
    }

    getVideoCover(file: File): Promise<{ cover: string, width: number, height: number, duration: number }> {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                if (video.duration > 1) {
                    video.currentTime = 1;
                } else {
                    video.currentTime = 0.1;
                }
            }
             video.onseeked = () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                const cover = canvas.toDataURL("image/jpeg");
                window.URL.revokeObjectURL(video.src);
                resolve({ cover, width: video.videoWidth, height: video.videoHeight, duration: video.duration });
            };
             video.onerror = () => {
                window.URL.revokeObjectURL(video.src);
                reject("Video load error");
            };
            video.src = URL.createObjectURL(file);
        });
    }

    showFile(file: any) {
        const self = this
        if (file.type && file.type.startsWith('image/')) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function (e: any) {
                self.setState({
                    file: file,
                    fileType: "image",
                    previewUrl: reader.result,
                    showDialog: true,
                });
            };
        } else if (file.type && file.type.startsWith('video/')) {
            this.getVideoCover(file).then((res)=>{
                self.setState({
                  file: file,
                  fileType: "video",
                  previewUrl: res.cover,
                  videoCover: res.cover,
                  width: res.width,
                  height: res.height,
                  videoDuration: res.duration,
                  showDialog: true,
                  canSend: true,
              });
           })
        }

    }

    // 将 base64 转换为 File
    dataURLtoFile(dataurl: string, filename: string) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)![1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    getUUID(){
        var len=32;//32长度
        var radix=16;//16进制
        var chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');var uuid=[],i;radix=radix||chars.length;if(len){for(i=0;i<len;i++)uuid[i]=chars[0|Math.random()*radix];}else{var r;uuid[8]=uuid[13]=uuid[18]=uuid[23]='-';uuid[14]='4';for(i=0;i<36;i++){if(!uuid[i]){r=0|Math.random()*16;uuid[i]=chars[(i===19)?(r&0x3)|0x8:r];}}}
        return uuid.join('');
    }

    async uploadCover(file: File): Promise<string> {
        const channel = this.props.conversationContext.channel();
        const path = `/${channel.channelType}/${channel.channelID}/${this.getUUID()}.jpg`;
        const param = new FormData();
        param.append("file", file);
        param.append("contenttype", file.type || "application/octet-stream");
        // 统一走 APIClient 的 baseURL（开发环境可通过同源 /v1 代理转发，避免直接走 HTTP/2 域名导致上传异常）
        const resp = await axios.post(`file/upload?path=${encodeURIComponent(path)}&type=chat`, param, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        if (resp.data && resp.data.path) {
            return resp.data.path;
        }
        return "";
    }

    async uploadFile(file: File): Promise<string> {
        const channel = this.props.conversationContext.channel();
        const extension = file.name.split('.').pop() || 'mp4';
        const path = `/${channel.channelType}/${channel.channelID}/${this.getUUID()}.${extension}`;
        const param = new FormData();
        param.append("file", file);
        param.append("contenttype", file.type || "application/octet-stream");
        const resp = await axios.post(`file/upload?path=${encodeURIComponent(path)}&type=chat`, param, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    this.setState({ progress });
                }
            },
            // 大文件上传给足时间，避免中途被前端超时打断
            timeout: 10 * 60 * 1000,
        });
        if (resp.data && resp.data.path) {
            return resp.data.path;
        }
        return "";
    }

    onSend = async () => {
        const { conversationContext } = this.props
        const { file, previewUrl, width, height, fileType, videoCover, videoDuration } = this.state
        
        if (fileType === "image") {
            this.setState({
                showDialog: false,
            });
            conversationContext.sendMessage(new ImageContent(file, previewUrl, width, height))
        } else if (fileType === "video") {
            this.setState({ uploading: true, progress: 0 });
            try {
                // 1. 上传封面
                let coverPath = ""
                if (videoCover) {
                    const coverFile = this.dataURLtoFile(videoCover, "cover.jpg");
                    coverPath = await this.uploadCover(coverFile);
                }

                // 2. 上传视频
                const videoPath = await this.uploadFile(file);
                
                // 3. 发送消息
                const videoContent = new VideoContent(undefined, width, height, Math.floor(videoDuration || 0), file.size);
                videoContent.url = videoPath;
                videoContent.cover = coverPath;
                conversationContext.sendMessage(videoContent)
            } catch (error) {
                console.error("Upload failed", error);
                const sizeMb = file?.size ? Math.round((file.size / 1024 / 1024) * 10) / 10 : 0;
                // 这类错误常见于网关/反向代理限制了请求体大小，或 HTTP/2 连接被上游提前终止
                Toast.error(sizeMb ? `视频上传失败（${sizeMb}MB）。可能是服务端限制了上传大小，请检查网关/Nginx 的 body 限制。` : "视频上传失败");
            } finally {
                this.setState({
                    showDialog: false,
                    uploading: false,
                    progress: 0
                });
            }
        }
    }
    onPreviewLoad(e: any) {
        let img = e.target;
        let width = img.naturalWidth || img.width || img.videoWidth;
        let height = img.naturalHeight || img.height || img.videoHeight;
        this.setState({
            width: width,
            height: height,
            canSend: true,
        });
    }
    render(): ReactNode {
        const { icon, accept } = this.props
        const { showDialog, canSend, fileIconInfo, file, fileType, previewUrl, uploading, progress } = this.state
        return <div className="wk-imagetoolbar" >
            <div className="wk-imagetoolbar-content" onClick={() => {
            this.chooseFile()
        }}>
                <div className="wk-imagetoolbar-content-icon">
                    <img src={icon}></img>
                    <input onClick={this.onFileClick} onChange={this.onFileChange.bind(this)} ref={(ref) => { this.$fileInput = ref }} type="file" multiple={false} accept={accept || "image/*,video/*"} style={{ display: 'none' }} />
                </div>
            </div>
            {
                showDialog ? ReactDOM.createPortal(
                    <ImageDialog onSend={this.onSend} onLoad={this.onPreviewLoad.bind(this)} canSend={canSend} fileIconInfo={fileIconInfo} file={file} fileType={fileType} previewUrl={previewUrl} uploading={uploading} progress={progress} onClose={() => {
                        this.setState({
                            showDialog: false,
                            file: undefined,
                            fileType: undefined,
                            previewUrl: undefined,
                            fileIconInfo: undefined,
                            canSend: false,
                            width: undefined,
                            height: undefined,
                            videoCover: undefined,
                            videoDuration: undefined,
                            uploading: false,
                            progress: 0,
                        })
                    }} />, document.body
                ) : null
            }
        </div>
    }
}


interface ImageDialogProps {
    onClose: () => void
    onSend?: () => void
    fileType?: string // image, file
    previewUrl?: string
    file?: any
    fileIconInfo?: any,
    canSend?: boolean
    onLoad: (e: any) => void
    uploading?: boolean
    progress?: number
}

interface ImageDialogState {
    videoUrl?: string
}

class ImageDialog extends Component<ImageDialogProps, ImageDialogState> {
    private keydownListener?: (e: KeyboardEvent) => void

    constructor(props: ImageDialogProps) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        const { file, fileType } = this.props
        if (fileType === 'video' && file) {
            this.setState({
                videoUrl: URL.createObjectURL(file)
            })
        }

        this.keydownListener = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (!this.props.uploading) {
                    e.preventDefault()
                    this.props.onClose()
                }
                return
            }
            if (e.key !== 'Enter') {
                return
            }
            if (this.props.uploading) {
                return
            }
            if (!this.props.canSend) {
                return
            }
            if (this.props.onSend) {
                e.preventDefault()
                this.props.onSend()
            }
        }
        document.addEventListener('keydown', this.keydownListener)
    }

    componentWillUnmount() {
        if (this.keydownListener) {
            document.removeEventListener('keydown', this.keydownListener)
        }
        if (this.state.videoUrl) {
            URL.revokeObjectURL(this.state.videoUrl)
        }
    }

    // 格式化文件大小
    getFileSizeFormat(size: number) {
        if (size < 1024) {
            return `${size} B`
        }
        if (size > 1024 && size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`
        }
        if (size > 1024 * 1024 && size < 1024 * 1024 * 1024) {
            return `${(size / 1024 / 1024).toFixed(2)} M`
        }
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)}G`
    }

    render() {
        const { onClose, onSend, fileType, previewUrl, file, canSend, fileIconInfo, onLoad, uploading, progress } = this.props
        return <div className="wk-imagedialog">
            <div className="wk-imagedialog-mask" onClick={!uploading ? onClose : undefined}></div>
            <div className="wk-imagedialog-content">
                {
                    uploading ? (
                        <div className="wk-imagedialog-loading-mask" style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            borderRadius: '4px'
                        }}>
                            <div className="wk-loading-spinner" style={{ marginBottom: '10px' }}></div>
                            <div>上传中... {progress}%</div>
                        </div>
                    ) : null
                }
                <div className="wk-imagedialog-content-close" onClick={!uploading ? onClose : undefined}>
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2683" ><path d="M568.92178541 508.23169412l299.36805789-299.42461715a39.13899415 39.13899415 0 0 0 0-55.1452591L866.64962537 152.02159989a39.13899415 39.13899415 0 0 0-55.08869988 0L512.19286756 451.84213173 212.76825042 151.90848141a39.13899415 39.13899415 0 0 0-55.0886999 0L155.98277331 153.54869938a38.46028327 38.46028327 0 0 0 0 55.08869987L455.46394971 508.23169412 156.03933259 807.71287052a39.13899415 39.13899415 0 0 0 0 55.08869986l1.64021795 1.6967772a39.13899415 39.13899415 0 0 0 55.08869988 0l299.42461714-299.48117638 299.36805793 299.42461714a39.13899415 39.13899415 0 0 0 55.08869984 0l1.6967772-1.64021796a39.13899415 39.13899415 0 0 0 0-55.08869987L568.86522614 508.17513487z" p-id="2684"></path></svg>
                </div>
                <div className="wk-imagedialog-content-title">发送{fileType === 'image' ? '图片' : fileType === 'video' ? '视频' : '文件'}</div>
                <div className="wk-imagedialog-content-body">
                    {
                        fileType === 'image' ? (
                            <div className="wk-imagedialog-content-preview">
                                <img alt="" className="wk-imagedialog-content-previewImg" src={previewUrl} onLoad={onLoad} />
                            </div>
                        ) : fileType === 'video' ? (
                            <div className="wk-imagedialog-content-preview">
                                <video controls className="wk-imagedialog-content-previewImg" src={this.state.videoUrl} onLoadedMetadata={onLoad}></video>
                            </div>
                        ) : (
                            <div className="wk-imagedialog-content-preview">
                                <div className="wk-imagedialog-content-preview-file">
                                    <div className="wk-imagedialog-content-preview-file-icon" style={{ backgroundColor: fileIconInfo?.color }}>
                                        <img alt="" className="wk-imagedialog-content-preview-file-thumbnail" src={fileIconInfo?.icon} />
                                    </div>
                                    <div className="wk-imagedialog-content-preview--filecontent">
                                        <div className="wk-imagedialog-content-preview--filecontent-name">{file?.name}</div>
                                        <div className="wk-imagedialog-content-preview--filecontent-size">{this.getFileSizeFormat(file?.size)}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    <div className="wk-imagedialog-footer" >
                        <button onClick={onClose} disabled={uploading}>取消</button>
                        <button onClick={onSend} className="wk-imagedialog-footer-okbtn" disabled={!canSend || uploading} style={{ backgroundColor: (canSend && !uploading) ? WKApp.config.themeColor : 'gray' }}>发送</button>
                    </div>
                </div>

            </div>
        </div>
    }
}