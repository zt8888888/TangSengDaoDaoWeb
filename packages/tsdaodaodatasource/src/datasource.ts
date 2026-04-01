import { ChannelQrcodeResp, Contacts, ForbiddenTimeOption, IChannelDataSource, ICommonDataSource, WKApp, RequestConfig, GroupRole } from "@tsdaodao/base";
import { Channel, ChannelInfo, ChannelTypeGroup, ChannelTypePerson, WKSDK, Message, MessageContentType,ConversationExtra,Subscriber } from "wukongimjssdk";

// 部分后端未实现 /v1/groups/:id/members_display，或会对 query 参数 display=true 返回 400。
// 这里做一次性探测：若某个群返回 400/404，则后续永久降级到 members，避免控制台/Network 刷屏。
const membersDisplayUnsupportedGroupIDs = new Set<string>();

export class ChannelDataSource implements IChannelDataSource {

    async exitChannel(channel: Channel): Promise<void> {
        if (channel.channelType === ChannelTypePerson) {
            return
        }
        return WKApp.apiClient.post(`groups/${channel.channelID}/exit`)
    }

    async channelTransferOwner(channel: Channel, toUID: string): Promise<void> {
        if (channel.channelType === ChannelTypePerson) {
            return
        }
        return WKApp.apiClient.post(`groups/${channel.channelID}/transfer/${toUID}`)
    }

    async subscriberAttrUpdate(channel: Channel, subscriberUID: string, attr: any): Promise<any> {
        if (channel.channelType === ChannelTypePerson) {
            return
        }
        return WKApp.apiClient.put(`groups/${channel.channelID}/members/${subscriberUID}`, attr)
    }
    createChannel(uids: string[]): Promise<any> {
        return WKApp.apiClient.post(`group/create`, { members: uids });
    }
    async groupSaveList(): Promise<ChannelInfo[]> {
        const resp = await WKApp.apiClient.get('group/my', {
            param: {
                "limit": 100000,
            }
        });
        const channelInfos = [];
        if (resp) {

            if (resp.length === 0) return [];
            for (const data of resp) {
                let channelInfo = new ChannelInfo();
                channelInfo.channel = new Channel(data.group_no, ChannelTypeGroup);
                channelInfo.title = data.name;
                channelInfo.logo = WKApp.shared.avatarChannel(channelInfo.channel);
                channelInfo.mute = data.mute === 1;
                channelInfo.top = data.top === 1;
                channelInfo.orgData = data;
                if (!channelInfo.orgData) {
                    channelInfo.orgData = {}
                }
                if (channelInfo.orgData.remark && channelInfo.orgData.remark !== "") {
                    channelInfo.orgData.displayName = channelInfo.orgData.remark;
                } else {
                    channelInfo.orgData.displayName = channelInfo.title;
                }

                channelInfos.push(channelInfo);
            }
        }
        return channelInfos;
    }
    removeSubscribers(channel: Channel, uids: string[]): Promise<void> {
        return WKApp.apiClient.delete(`groups/${channel.channelID}/members`, {
            data: {
                members: uids,
            }
        })
    }
    addSubscribers(channel: Channel, uids: string[]): Promise<void> {
        return WKApp.apiClient.post(`groups/${channel.channelID}/members`, {
            members: uids,
        })
    }

    async subscribers(channel: Channel,req:{
        keyword?:string, // 搜索关键字
        limit?:number, // 每页数量
        page?:number, // 页码
        display?: boolean, // 是否展示成员(包含虚拟成员)
    }): Promise<Subscriber[]> {
        const wantDisplay = Boolean(req.display);
        const displaySupported = !membersDisplayUnsupportedGroupIDs.has(channel.channelID);
        const useMembersDisplay = wantDisplay && displaySupported;

        const path = useMembersDisplay ? `groups/${channel.channelID}/members_display` : `groups/${channel.channelID}/members`
        let resp: any
        try {
            // members_display 走专用路由时不要再带 display=true 这个 query，避免部分后端严格校验导致 400。
            const param: any = { ...req }
            if (useMembersDisplay) {
                delete param.display
            }
            resp = await WKApp.apiClient.get(path, { param })
        } catch (e: any) {
            // 一些后端没有 members_display 或会返回 400，这里自动降级到 members
            if (wantDisplay) {
                const status = e?.status
                if (status === 400 || status === 404) {
                    membersDisplayUnsupportedGroupIDs.add(channel.channelID)
                }
                try {
                    const fallbackReq: any = { ...req }
                    delete fallbackReq.display
                    resp = await WKApp.apiClient.get(`groups/${channel.channelID}/members`, {
                        param: fallbackReq,
                    })
                } catch (e2: any) {
                    console.warn("[GroupSubscribers] load failed, fallback", {
                        channelID: channel.channelID,
                        channelType: channel.channelType,
                        path,
                        req,
                        err: e2,
                    })
                    return []
                }
            } else {
            console.warn("[GroupSubscribers] load failed, fallback", {
                channelID: channel.channelID,
                channelType: channel.channelType,
                path,
                req,
                err: e,
            })
            return []
            }
        }
        let members = new Array<Subscriber>();
        if (resp) {
            for (let i = 0; i < resp.length; i++) {
                let memberMap = resp[i];
                let member = new Subscriber();
                member.uid = memberMap.uid;
                member.name = memberMap.name;
                member.remark = memberMap.remark;
                member.role = memberMap.role;
                member.version = memberMap.version;
                member.isDeleted = memberMap.is_deleted;
                member.status = memberMap.status;
                member.orgData = memberMap
                member.avatar = WKApp.shared.avatarUser(member.uid)
                members.push(member);
            }
        }
        return members
    }

    updateField(channel: Channel, field: string, value: string): Promise<void> {
        const param: any = {}
        param[field] = value
        return WKApp.apiClient.put(`groups/${channel.channelID}`, param)
    }

    qrcode(channel: Channel): Promise<ChannelQrcodeResp> {
        return WKApp.apiClient.get(`groups/${channel.channelID}/qrcode`, {
            resp: () => {
                return new ChannelQrcodeResp()
            }
        })
    }

    async updateSetting(setting: any, channel: Channel): Promise<void> {
        if (channel.channelType === ChannelTypeGroup) {
            return WKApp.apiClient.put(`groups/${channel.channelID}/setting`, setting)
        } else if (channel.channelType === ChannelTypePerson) { // 个人信息
            return WKApp.apiClient.put(`users/${channel.channelID}/setting`, setting)
        }
    }

    async managerRemove(channel: Channel, uids: string[]): Promise<void> {
        return WKApp.apiClient.delete(`groups/${channel.channelID}/managers`, {
            data: uids,
        })
    }

    async managerAdd(channel: Channel, uids: string[]): Promise<void> {
        return WKApp.apiClient.post(`groups/${channel.channelID}/managers`, uids)
    }

    blacklistAdd(channel: Channel, uids: string[]): Promise<void> {
        return WKApp.apiClient.post(`groups/${channel.channelID}/blacklist/add`, { uids: uids })
    }


    blacklistRemove(channel: Channel, uids: string[]): Promise<void> {
        return WKApp.apiClient.post(`groups/${channel.channelID}/blacklist/remove`, { uids: uids })
    }

    conversationExtraUpdate(conversationExtra:ConversationExtra): Promise<void> {
        return WKApp.apiClient.post(`conversations/${conversationExtra.channel.channelID}/${conversationExtra.channel.channelType}/extra`,{
            "browse_to": conversationExtra.browseTo,
            "keep_message_seq": conversationExtra.keepMessageSeq,
            "keep_offset_y": conversationExtra.keepOffsetY,
            "draft": conversationExtra.draft||""

        })
    }

    forbiddenTimes(): Promise<ForbiddenTimeOption[]> {
        return WKApp.apiClient.get("group/forbidden_times")
    }

    forbiddenWithMember(channel: Channel, req: { memberUID: string; action: 0 | 1; key?: number }): Promise<void> {
        if (channel.channelType === ChannelTypePerson) {
            return Promise.resolve()
        }
        return WKApp.apiClient.post(`groups/${channel.channelID}/forbidden_with_member`, {
            member_uid: req.memberUID,
            action: req.action,
            key: req.key,
        })
    }
}

export class CommonDataSource implements ICommonDataSource {
    blacklistAdd(uid: string): Promise<void> {
        return WKApp.apiClient.post(`user/blacklist/${uid}`)
    }
    blacklistRemove(uid: string): Promise<void> {
        return WKApp.apiClient.delete(`user/blacklist/${uid}`)
    }
    deleteFriend(uid:string): Promise<void> {
        return WKApp.apiClient.delete(`friends/${uid}`)
    }

    userRemark(uid: string, remark: string): Promise<void> {
        return WKApp.apiClient.put(`friend/remark`, { uid: uid, remark: remark })
    }
    getFavoritesAll(): Promise<any> {
        // TODO: 这里先取10000足够 等后面再做分页
        return WKApp.apiClient.get(`favorite/my?page_index=1&page_size=10000`)
    }
    favorities(message: Message): Promise<void>{
        var content: string = ""
        if (message.contentType === MessageContentType.text) {
            content = message.content.contentObj.content;
        } else if (message.contentType === MessageContentType.image) {
            content = message.content.contentObj.url;
        }
        const fromChannelInfo = WKSDK.shared().channelManager.getChannelInfo(new Channel(message.fromUID, ChannelTypePerson))
        return WKApp.apiClient.post(`favorites`, {
            type: message.contentType,
            unique_key: message.messageID,
            author_name: fromChannelInfo?.title || "",
            author_uid: message.fromUID,
            payload: { content: content },
        })
    }
    favoritiesDelete(id: string): Promise<void> {
        return WKApp.apiClient.delete(`favorites/${id}`)
    }
    userStickerCategory(): Promise<any> {
        return WKApp.apiClient.get(`sticker/user/category`)
    }
    getStickers(category: string): Promise<any> {
        return WKApp.apiClient.get(`sticker/user/sticker?category=${category}`)
    }
    searchUser(keyword: string): Promise<any> {
        return WKApp.apiClient.get(`user/search?keyword=${keyword}`)
    }
    qrcodeMy(): Promise<any> {
        return WKApp.apiClient.get("user/qrcode")
    }

    friendSure(token: string): Promise<void> {
        return WKApp.apiClient.post("friend/sure", {
            "token": token,
        })
    }

    friendApply(req:{uid:string,remark:string,vercode:string}):Promise<void> {
        return WKApp.apiClient.post(`friend/apply`,{to_uid:req.uid,remark:req.remark,vercode:req.vercode},)
    }

    /**
    *  获取图片完整地址
    * @param path  图片路径
    * @param opts 参数
    */
    getImageURL(path: string, opts?: { width: number, height: number }): string {
        if (path && path.length > 4) {
            const prefix = path.substring(0, 4)
            if (prefix === 'http') {
                return path
            }
        }
        const baseURl = WKApp.apiClient.config.apiURL
        return `${baseURl}${path}`
    }
    getFileURL(path: string): string {
        if (path && path.length > 4) {
            const prefix = path.substring(0, 4)
            if (prefix === 'http') {
                return path
            }
        }
        const baseURl = WKApp.apiClient.config.apiURL
        return `${baseURl}${path}`
    }


    async contactsSync(version: string): Promise<Contacts[]> {
        const results = await WKApp.apiClient.get(`friend/sync`, {
            param: { version: version,"api_version":"1" },
        })
        const contactsList = new Array<Contacts>()
        if (results) {
            for (const result of results) {
                contactsList.push(this.toContacts(result))
            }
        }
        return contactsList

    }
    imConnectAddr(): Promise<string> {
        return WKApp.apiClient.get(`users/${WKApp.loginInfo.uid}/im`).then((resp) => {
            let addr = resp.wss_addr
            if(!addr || addr==='') {
                addr =  resp.ws_addr
            }
            return addr
        });
    }
    imConnectAddrs(): Promise<string[]> {
        return WKApp.apiClient.get(`users/${WKApp.loginInfo.uid}/im`).then((resp) => {
            let addr = resp.wss_addr
            if(!addr || addr==='') {
                addr =  resp.ws_addr
            }
            return [addr]
        });
    }

    toContacts(resultDic: any): Contacts {
        const contacts = new Contacts()
        contacts.uid = resultDic["uid"] || ""
        contacts.name = resultDic["name"] || ""
        contacts.remark = resultDic["remark"] || ""
        if (resultDic["version"]) {
            contacts.version = resultDic["version"] + ""
        }
        contacts.avatar = WKApp.shared.avatarUser(contacts.uid)
        contacts.status = resultDic["status"] || 0
        contacts.follow = resultDic["follow"] || 0
        contacts.vercode = resultDic["vercode"] || ""

        return contacts
    }

    async searchFriends(keyword?: string): Promise<ChannelInfo[]> {
        let resp = await WKApp.apiClient.get('friend/sync', {
            param: {
                "keyword": keyword,
                "api_version":"1"
            }
        })
        const channelInfos = [];
        if (resp) {
            for (const data of resp) {
                if (data.is_deleted === 1) {
                    continue
                }
                let channelInfo = new ChannelInfo();
                channelInfo.channel = new Channel(data.uid, ChannelTypePerson);
                channelInfo.title = data.name;
                channelInfo.logo = WKApp.shared.avatarChannel(channelInfo.channel);
                channelInfo.mute = data.mute === 1;
                channelInfo.top = data.top === 1;
                channelInfo.orgData = data;
                if (!channelInfo.orgData) {
                    channelInfo.orgData = {}
                }
                if (channelInfo.orgData.remark && channelInfo.orgData.remark !== "") {
                    channelInfo.orgData.displayName = channelInfo.orgData.remark;
                } else {
                    channelInfo.orgData.displayName = channelInfo.title;
                }

                channelInfos.push(channelInfo);
            }
        }
        return channelInfos;
    }

}