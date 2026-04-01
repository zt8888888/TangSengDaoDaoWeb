import { WKApp } from "@tsdaodao/base";
import axios, { Canceler } from "axios";
import { MediaMessageContent } from "wukongimjssdk";
import {  MessageTask, TaskStatus } from "wukongimjssdk";



export class MediaMessageUploadTask extends MessageTask {
    private _progress?:number
    private canceler: Canceler | undefined
    getUUID(){
        var len=32;//32长度
        var radix=16;//16进制
        var chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');var uuid=[],i;radix=radix||chars.length;if(len){for(i=0;i<len;i++)uuid[i]=chars[0|Math.random()*radix];}else{var r;uuid[8]=uuid[13]=uuid[18]=uuid[23]='-';uuid[14]='4';for(i=0;i<36;i++){if(!uuid[i]){r=0|Math.random()*16;uuid[i]=chars[(i===19)?(r&0x3)|0x8:r];}}}
        return uuid.join('');
      }

    async start(): Promise<void> {
        const mediaContent = this.message.content as MediaMessageContent
        if(mediaContent.file) {
            const fileName = this.getUUID();
            const path = `/${this.message.channel.channelType}/${this.message.channel.channelID}/${fileName}${mediaContent.extension??""}`
            // 统一走 APIClient 的 baseURL（开发环境可通过同源 /v1 代理转发，避免直接走 HTTP/2 域名导致上传异常）
            const uploadURL = `file/upload?path=${encodeURIComponent(path)}&type=chat`
            this.uploadFile(mediaContent.file,uploadURL)
        }else {
            console.log('多媒体消息不存在附件！');
            if (mediaContent.remoteUrl && mediaContent.remoteUrl !== "") {
                this.status = TaskStatus.success
                this.update()
            } else {
                this.status = TaskStatus.fail
                this.update()
            }
        }
    }

   async uploadFile(file:File,uploadURL:string) {
        const param = new FormData();
        param.append("file", file);
        param.append("contenttype", file.type || "application/octet-stream");
        const resp = await axios.post(uploadURL,param,{
            headers: { "Content-Type": "multipart/form-data" },
            cancelToken: new axios.CancelToken((c: Canceler) => {
                this.canceler = c
            }),
            onUploadProgress: e => {
                if(e.total) {
                    const completeProgress = Math.round((e.loaded * 100) / e.total)
                    this._progress = completeProgress
                }
                this.update()
            },
            timeout: 10 * 60 * 1000,
        }).catch(error => {
            console.log('文件上传失败！->', error);
            this.status = TaskStatus.fail
            this.update()
        })
        if(resp) {
            if(resp.data.path) {
                const mediaContent = this.message.content as MediaMessageContent
                mediaContent.remoteUrl = resp.data.path
                this.status = TaskStatus.success
                this.update()
            }
        }
    }

    // 旧逻辑：先 GET 获取绝对上传地址再 POST。
    // 现在统一走 APIClient baseURL 的相对路径，便于开发环境同源代理转发。

    suspend(): void {
    }
    resume(): void {
       
    }
    cancel(): void {
        this.status = TaskStatus.cancel
        if(this.canceler) {
            this.canceler()
        }
        this.update()
    }
    progress(): number {
        return this._progress??0
    }

}