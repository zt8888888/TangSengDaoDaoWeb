import { IConversationProvider, WKApp, SyncMessageOptions, Convert, PinnedMessageItem, SyncPinnedMessagesResult } from "@tsdaodao/base";
import { Conversation, Message, Channel, MessageExtra } from "wukongimjssdk";

export class ConversationProvider implements IConversationProvider {


    async deleteConversation(channel: Channel): Promise<void> {
        // 统一走 WKApp.apiClient，确保 baseURL/鉴权/拦截器一致
        return WKApp.apiClient.delete(`conversations/${channel.channelID}/${channel.channelType}`)
    }

    // 删除消息
    async deleteMessages(messages: Message[]): Promise<void> {
        if (!messages || messages.length === 0) {
            return undefined
        }
        var params = []
        for (const message of messages) {
            params.push({
                "message_id": message.messageID,
                "channel_id": message.channel.channelID,
                "channel_type": message.channel.channelType,
                "message_seq": message.messageSeq,
            })
        }

        return await axios.delete("message", {
            data: params
        })
    }
    revokeMessage(message: Message): Promise<void> {
        return WKApp.apiClient.post(`message/revoke?channel_id=${message.channel.channelID}&channel_type=${message.channel.channelType}&message_id=${message.messageID}&client_msg_no=${message.clientMsgNo}`)
    }

    // 编辑消息
    // 文档：POST /message/edit
    // body: { channel_id, channel_type, message_id, content_edit }
    editMessage(messageID: String, messageSeq: number, channelID: String, channelType: number, content: String): Promise<void> {
        return WKApp.apiClient.post(`message/edit`, {
            channel_id: channelID,
            channel_type: channelType,
            message_id: messageID,
            message_seq: messageSeq,
            content_edit: content,
        })
    }


    markConversationUnread(channel: Channel, unread: number): Promise<void> {
        return WKApp.apiClient.put('coversation/clearUnread', { "channel_id": channel.channelID, "channel_type": channel.channelType, "unread": unread > 0 ? unread : 0 }).catch(function (error) {
            console.log(error);
            return error;
        });

    }

    // 同步消息 由于isdelete导致可能一页消息数量不够 甚至没有，所以 syncGetMessages 写成回调
    async syncMessages(channel: Channel, opts: SyncMessageOptions = new SyncMessageOptions()): Promise<Message[]> {
        var messages = await this.syncGetMessages(channel, opts);
        return messages
    }

    async syncGetMessages(channel: Channel, opts: SyncMessageOptions): Promise<Message[]> {
        let messages = new Array<Message>()
        const limit = opts.limit || 15;
        var resp = await WKApp.apiClient.post(`message/channel/sync`, { "limit": limit, "channel_id": channel.channelID, "channel_type": channel.channelType, "start_message_seq": opts.startMessageSeq || 0, "end_message_seq": opts.endMessageSeq || 0, "pull_mode": opts.pullMode });
        const messageList = resp && resp["messages"]
        if (messageList) {
            messageList.forEach((msg: any) => {
                const message = Convert.toMessage(msg);
                messages.push(message);
            });
            // if (resp.data.more === 1 && messages.length < limit && resp.data["messages"].length) {
            //     opts.maxMessageSeq = resp.data["messages"][0].message_seq;
            //     opts.limit = limit - messages.length;
            //     var data = await this.syncGetMessages(channel, opts);
            //     messages = data.concat(messages);
            // }
        }

        return messages
    }

    async syncMessageExtras(channel: Channel, version: number, limit: number): Promise<MessageExtra[]> {
        let messageExtras = new Array<MessageExtra>()

        let messageExtraObjs = await WKApp.apiClient.post(`message/extra/sync`, { "channel_id": channel.channelID, "channel_type": channel.channelType, "extra_version": version, "limit": limit })
        if(messageExtraObjs) {
            messageExtraObjs.forEach((extraObj:any)=>{
                const messageExtra = Convert.toMessageExtra(extraObj)
                messageExtras.push(messageExtra)
            }) 
        }
        return messageExtras
    }

    async syncPinnedMessages(channel: Channel, version: number): Promise<SyncPinnedMessagesResult> {
        const resp = await WKApp.apiClient.post(`message/pinned/sync`, {
            channel_id: channel.channelID,
            channel_type: channel.channelType,
            version: version || 0,
        })

        const pinnedMessages: PinnedMessageItem[] = []
        const messages: Message[] = []
        if (resp) {
            const messageList = resp["messages"] || []
            if (messageList && messageList.length > 0) {
                messageList.forEach((msg: any) => {
                    const message = Convert.toMessage(msg)
                    messages.push(message)
                })
            }
            const pinnedList = resp["pinned_messages"] || []
            if (pinnedList && pinnedList.length > 0) {
                pinnedList.forEach((item: any) => {
                    pinnedMessages.push({
                        messageID: item.message_id,
                        messageSeq: item.message_seq,
                        channelID: item.channel_id,
                        channelType: item.channel_type,
                        isDeleted: item.is_deleted,
                        version: item.version,
                        createdAt: item.created_at,
                        updatedAt: item.updated_at,
                    })
                })
            }
        }

        return { pinnedMessages, messages }
    }

    pinMessage(message: Message): Promise<void> {
        return WKApp.apiClient.post(`message/pinned`, {
            message_id: message.messageID,
            message_seq: message.messageSeq,
            channel_id: message.channel.channelID,
            channel_type: message.channel.channelType,
        })
    }

    clearConversationMessages(conversation: Conversation): Promise<void> {
        return axios.post("message/offset", {
            channel_id: conversation.channel.channelID,
            channel_type: conversation.channel.channelType,
            message_seq: conversation.lastMessage?.messageSeq || 0,
        })
    }
}