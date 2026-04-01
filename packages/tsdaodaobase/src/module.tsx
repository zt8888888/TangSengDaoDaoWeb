import {
  Channel,
  ChannelTypePerson,
  WKSDK,
  Message,
  MessageContentType,
  ConversationAction,
  ChannelTypeGroup,
  ChannelInfo,
  CMDContent,
  MessageText,
  Subscriber,
} from "wukongimjssdk";
import React, { ElementType } from "react";
import { Howl, Howler } from "howler";
import WKApp, { FriendApply, FriendApplyState, ThemeMode } from "./App";
import ChannelQRCode from "./Components/ChannelQRCode";
import { ChannelSettingRouteData } from "./Components/ChannelSetting/context";
import { IndexTableItem } from "./Components/IndexTable";
import { InputEdit } from "./Components/InputEdit";
import {
  ListItem,
  ListItemButton,
  ListItemButtonType,
  ListItemIcon,
  ListItemMuliteLine,
  ListItemSwitch,
  ListItemSwitchContext,
  ListItemTip,
} from "./Components/ListItem";
import { Subscribers } from "./Components/Subscribers";
import UserSelect, { ContactsSelect } from "./Components/UserSelect";
import { Card, CardCell } from "./Messages/Card";
import { GifCell, GifContent } from "./Messages/Gif";
import { HistorySplitCell, HistorySplitContent } from "./Messages/HistorySplit";
import { ImageCell, ImageContent } from "./Messages/Image";
import { JoinOrganizationCell, JoinOrganizationContent } from "./Messages/JoinOrganization";
import {
  SignalMessageCell,
  SignalMessageContent,
} from "./Messages/SignalMessage/signalmessage";
import { SystemCell } from "./Messages/System";
import { TextCell } from "./Messages/Text";
import { TimeCell } from "./Messages/Time";
import { UnknownCell } from "./Messages/Unknown";
import { UnsupportCell, UnsupportContent } from "./Messages/Unsupport";
import {
  ChannelTypeCustomerService,
  EndpointCategory,
  EndpointID,
  GroupRole,
  MessageContentTypeConst,
  unsupportMessageTypes,
  UserRelation,
} from "./Service/Const";
import RouteContext, {
  FinishButtonContext,
  RouteContextConfig,
} from "./Service/Context";
import { ChannelField } from "./Service/DataSource/DataSource";
import { IModule } from "./Service/Module";
import { Row, Section } from "./Service/Section";
import { VoiceCell, VoiceContent } from "./Messages/Voice";
import { VideoCell, VideoContent } from "./Messages/Video";
import { TypingCell } from "./Messages/Typing";
import { LottieSticker, LottieStickerCell } from "./Messages/LottieSticker";
import { LocationCell, LocationContent } from "./Messages/Location";
import { Toast } from "@douyinfe/semi-ui";
import { ChannelSettingManager } from "./Service/ChannelSetting";
import { DefaultEmojiService } from "./Service/EmojiService";
import IconClick from "./Components/IconClick";
import EmojiToolbar from "./Components/EmojiToolbar";
import MergeforwardContent, { MergeforwardCell } from "./Messages/Mergeforward";
import { UserInfoRouteData } from "./Components/UserInfo/vm";
import { IconAlertCircle } from "@douyinfe/semi-icons";
import { TypingManager } from "./Service/TypingManager";
import APIClient from "./Service/APIClient";
import { ChannelAvatar } from "./Components/ChannelAvatar";
import { ScreenshotCell, ScreenshotContent } from "./Messages/Screenshot";
import ImageToolbar from "./Components/ImageToolbar";
import { ProhibitwordsService } from "./Service/ProhibitwordsService";
import { SubscriberList } from "./Components/Subscribers/list";
import GlobalSearch from "./Components/GlobalSearch";
import { handleGlobalSearchClick } from "./Pages/Chat/vm";
import { ApproveGroupMemberCell } from "./Messages/ApproveGroupMember";
import { notificationUtil } from "./Utils/NotificationUtil";
import MediaSummary from "./Components/MediaSummary";

export default class BaseModule implements IModule {
  messageTone?: Howl;

  id(): string {
    return "base";
  }
  init(): void {

    APIClient.shared.logoutCallback = () => {
      WKApp.shared.logout();
    };

    WKApp.endpointManager.setMethod(
      EndpointID.emojiService,
      () => DefaultEmojiService.shared
    );

    WKApp.messageManager.registerMessageFactor(
      (contentType: number): ElementType | undefined => {
        switch (contentType) {
          case MessageContentType.text: // 文本消息
            return TextCell;
          case MessageContentType.image: // 图片消息
            return ImageCell;
          case MessageContentTypeConst.card: // 名片
            return CardCell;
          case MessageContentTypeConst.gif: // gif
            return GifCell;
          case MessageContentTypeConst.voice: // 语音
            return VoiceCell;
          case MessageContentTypeConst.mergeForward: // 合并转发
            return MergeforwardCell;
          case MessageContentTypeConst.joinOrganization: // 加入组织
            return JoinOrganizationCell;
          case MessageContentTypeConst.smallVideo: // 小视频
            return VideoCell;
          case MessageContentTypeConst.historySplit: // 历史消息风格线
            return HistorySplitCell;
          case MessageContentTypeConst.time: // 时间消息
            return TimeCell;
          case MessageContentTypeConst.typing: // 输入中...
            return TypingCell;
          case MessageContentTypeConst.lottieSticker: // 动图
          case MessageContentTypeConst.lottieEmojiSticker:
            return LottieStickerCell;
          case MessageContentTypeConst.location: // 定位
            return LocationCell;
          case MessageContentTypeConst.screenshot:
            return ScreenshotCell;
          case MessageContentType.signalMessage: // 端对端加密错误消息
          case MessageContentTypeConst.approveGroupMember: // 审批群成员
            return ApproveGroupMemberCell;
          case 98:
            return SignalMessageCell;
          default:
            if (contentType <= 2000 && contentType >= 1000) {
              return SystemCell;
            }
        }
      }
    );

    WKSDK.shared().register(MessageContentType.image, () => new ImageContent()); // 图片

    WKSDK.shared().register(MessageContentTypeConst.card, () => new Card()); // 名片
    WKSDK.shared().register(
      MessageContentTypeConst.gif,
      () => new GifContent()
    ); // gif动图
    WKSDK.shared().register(
      MessageContentTypeConst.voice,
      () => new VoiceContent()
    ); // 语音正文
    WKSDK.shared().register(
      MessageContentTypeConst.smallVideo,
      () => new VideoContent()
    ); // 视频正文
    WKSDK.shared().register(
      MessageContentTypeConst.historySplit,
      () => new HistorySplitContent()
    ); // 历史分割线
    WKSDK.shared().register(
      MessageContentTypeConst.location,
      () => new LocationContent()
    ); // 定位
    WKSDK.shared().register(
      MessageContentTypeConst.lottieSticker,
      () => new LottieSticker()
    ); // 动图
    WKSDK.shared().register(
      MessageContentTypeConst.lottieEmojiSticker,
      () => new LottieSticker()
    ); // 动图
    WKSDK.shared().register(
      MessageContentTypeConst.mergeForward,
      () => new MergeforwardContent()
    ); // 合并转发
    WKSDK.shared().register(
      MessageContentTypeConst.screenshot,
      () => new ScreenshotContent()
    );
    // 加入组织
    WKSDK.shared().register(
      MessageContentTypeConst.joinOrganization,
      () => new JoinOrganizationContent()
    );

    // 未知消息
    WKApp.messageManager.registerCell(
      MessageContentType.unknown,
      (): ElementType => {
        return UnknownCell;
      }
    );

    // 不支持的消息
    for (const unsupportMessageType of unsupportMessageTypes) {
      WKSDK.shared().register(
        unsupportMessageType,
        () => new UnsupportContent()
      );
      WKApp.messageManager.registerCell(
        unsupportMessageType,
        (): ElementType => {
          return UnsupportCell;
        }
      );
    }

    WKSDK.shared().chatManager.addCMDListener((message: Message) => {
      console.log("收到CMD->", message);
      const cmdContent = message.content as CMDContent;
      const param = cmdContent.param;

      const cleanupConversation = (channel: Channel) => {
        try {
          const conversation = WKSDK.shared().conversationManager.findConversation(channel);
          if (conversation) {
            // 尽量把该会话的提醒项标记 done，避免退群后红点残留
            const reminders: any[] = (conversation as any).reminders || [];
            const reminderIDs: number[] = [];
            for (const r of reminders) {
              const id = Number((r as any)?.reminderID ?? (r as any)?.id);
              if (!isNaN(id as any) && id > 0) {
                reminderIDs.push(id);
              }
            }
            if (reminderIDs.length > 0) {
              WKSDK.shared().reminderManager.done(reminderIDs);
            }
          }
        } catch {
          // ignore
        }

        // 清理未读（服务端 + 本地）
        WKApp.conversationProvider
          .markConversationUnread(channel, 0)
          .catch(() => undefined);

        // 兜底删除最近会话（服务端），避免 cmd 丢失导致重登仍存在
        WKApp.conversationProvider.deleteConversation(channel).catch(() => undefined);

        // 本地移除会话
        WKSDK.shared().conversationManager.removeConversation(channel);
      };

      if (cmdContent.cmd === "channelUpdate") {
        // 频道信息更新
        WKSDK.shared().channelManager.fetchChannelInfo(
          new Channel(param.channel_id, param.channel_type)
        );
      } else if (cmdContent.cmd === "typing") {
        TypingManager.shared.addTyping(
          new Channel(
            cmdContent.param.channel_id,
            cmdContent.param.channel_type
          ),
          cmdContent.param.from_uid,
          cmdContent.param.from_name
        );
      } else if (cmdContent.cmd === "groupAvatarUpdate") {
        // 改变群头像缓存
        WKApp.shared.changeChannelAvatarTag(new Channel(param.group_no, ChannelTypeGroup));
        // 通过触发channelInfoListener来更新UI
        WKSDK.shared().channelManager.fetchChannelInfo(
          new Channel(param.group_no, ChannelTypeGroup)
        );
      } else if (cmdContent.cmd === "unreadClear") {
        // 清除最近会话未读数量
        const channel = new Channel(param.channel_id, param.channel_type);
        const conversation =
          WKSDK.shared().conversationManager.findConversation(channel);
        let unread = 0;
        if (param.unread > 0) {
          unread = param.unread;
        }
        if (conversation) {
          conversation.unread = unread;
          WKSDK.shared().conversationManager.notifyConversationListeners(
            conversation,
            ConversationAction.update
          );
        }
      } else if (cmdContent.cmd === "conversationDeleted") {
        // 最近会话删除
        const channel = new Channel(param.channel_id, param.channel_type);
        cleanupConversation(channel);
      } else if (cmdContent.cmd === "friendRequest") {
        // 好友申请
        const friendApply = new FriendApply();
        friendApply.uid = param.apply_uid;
        friendApply.to_name = param.apply_name;
        friendApply.status = FriendApplyState.apply;
        friendApply.remark = param.remark;
        friendApply.token = param.token;
        friendApply.unread = true;
        friendApply.createdAt = message.timestamp;
        WKApp.shared.addFriendApply(friendApply);
        WKApp.shared.setFriendApplysUnreadCount();
        this.tipsAudio();
      } else if (cmdContent.cmd === "friendAccept") {
        // 接受好友申请
        const toUID = param.to_uid;
        if (!toUID || toUID === "") {
          return;
        }
        if (param.from_uid) {
          WKSDK.shared().channelManager.fetchChannelInfo(
            new Channel(param.from_uid, ChannelTypePerson)
          );
        }

        WKApp.dataSource.contactsSync(); // 同步联系人

        const friendApplys = WKApp.shared.getFriendApplys();
        if (friendApplys && friendApplys.length > 0) {
          for (const friendApply of friendApplys) {
            if (toUID === friendApply.uid) {
              friendApply.unread = false;
              friendApply.status = FriendApplyState.accepted;
              WKApp.shared.updateFriendApply(friendApply);
              WKApp.endpointManager.invokes(
                EndpointCategory.friendApplyDataChange
              );
              break;
            }
          }
        }
      } else if (cmdContent.cmd === "friendDeleted") {
        WKApp.dataSource.contactsSync(); // 同步联系人
      } else if (cmdContent.cmd === "memberUpdate") {
        // 成员更新
        const channel = new Channel(
          cmdContent.param.group_no,
          ChannelTypeGroup
        );
        // 同步订阅者后，若发现自己不在订阅者列表中（被移除/退群），则清理会话与红点
        WKSDK.shared()
          .channelManager.syncSubscribes(channel)
          .finally(() => {
            const myUID = WKApp.loginInfo.uid || "";
            if (!myUID) {
              return;
            }
            const subOfMe = WKSDK.shared().channelManager.getSubscribeOfMe(channel);
            if (!subOfMe) {
              cleanupConversation(channel);
            }
          });
      } else if (cmdContent.cmd === "onlineStatus") {
        // 好友在线状态改变
        const channel = new Channel(cmdContent.param.uid, ChannelTypePerson);
        const online = param.online === 1;
        const onlineChannelInfo =
          WKSDK.shared().channelManager.getChannelInfo(channel);
        if (onlineChannelInfo) {
          onlineChannelInfo.online = online;
          if (!online) {
            onlineChannelInfo.lastOffline = new Date().getTime() / 1000;
          }
          WKSDK.shared().channelManager.notifyListeners(onlineChannelInfo);
        } else {
          WKSDK.shared().channelManager.fetchChannelInfo(channel);
        }
      } else if (cmdContent.cmd === "syncConversationExtra") {
        // 同步最近会话扩展
        WKSDK.shared().conversationManager.syncExtra();
      } else if (cmdContent.cmd === "syncPinnedConversationOrder") {
        // 多端置顶会话排序变更：通知 ChatVM 拉取并重排
        try {
          WKApp.mittBus.emit("conversation.pinnedOrder.sync");
        } catch {
          // ignore
        }
      } else if (cmdContent.cmd === "syncReminders") {
        // 同步提醒项
        WKSDK.shared().reminderManager.sync();
      } else if (cmdContent.cmd === "messageRevoke") {
        // 消息撤回
        const channel = message.channel;
        const messageID = param.message_id;
        let conversation =
          WKSDK.shared().conversationManager.findConversation(channel);
        if (
          conversation &&
          conversation.lastMessage &&
          conversation.lastMessage?.messageID === messageID
        ) {
          conversation.lastMessage.remoteExtra.revoke = true;
            conversation.lastMessage.remoteExtra.revoker = String(cmdContent.param?.revoker ?? message.fromUID ?? conversation.lastMessage.fromUID ?? '')
          WKSDK.shared().conversationManager.notifyConversationListeners(
            conversation,
            ConversationAction.update
          );
        }
      } else if (cmdContent.cmd === "userAvatarUpdate") { // 用户头像更新
        WKApp.shared.changeChannelAvatarTag(new Channel(param.uid, ChannelTypePerson));
        WKApp.dataSource.notifyContactsChange();
      }
    });

    WKSDK.shared().chatManager.addMessageListener((message: Message) => {
      console.log("收到消息->", message);
      if (TypingManager.shared.hasTyping(message.channel)) {
        TypingManager.shared.removeTyping(message.channel);
      }
      switch (message.contentType) {
        case MessageContentTypeConst.channelUpdate:
          WKSDK.shared().channelManager.fetchChannelInfo(message.channel);
          break;
        case MessageContentTypeConst.addMembers:
        case MessageContentTypeConst.removeMembers:
          WKSDK.shared().channelManager.syncSubscribes(message.channel);
          break;
      }

      if (this.allowNotify(message)) {
        let from = "";
        if (message.channel.channelType === ChannelTypeGroup) {
          const fromChannelInfo = WKSDK.shared().channelManager.getChannelInfo(
            new Channel(message.fromUID, ChannelTypePerson)
          );
          if (fromChannelInfo) {
            from = `${fromChannelInfo?.orgData.displayName}: `;
          }
        }
        this.sendNotification(
          message,
          `${from}${message.content.conversationDigest}`
        );
        this.tipsAudio();
      }
    });

    WKSDK.shared().channelManager.addListener((channelInfo: ChannelInfo) => {
      if (channelInfo.channel.channelType === ChannelTypePerson) {
        if (WKApp.loginInfo.uid === channelInfo.channel.channelID) {
          WKApp.loginInfo.name = channelInfo.title;
          WKApp.loginInfo.shortNo = channelInfo.orgData.short_no;
          WKApp.loginInfo.sex = channelInfo.orgData.sex;
          WKApp.loginInfo.save();
        }
      }
    });

    this.registerChatMenus(); // 注册开始菜单

    this.registerUserInfo(); // 注册用户资料功能

    this.registerChannelSettings(); // 注册频道设置功能
    this.registerMessageContextMenus(); // 注册消息上下文菜单

    this.registerChatToolbars(); // 注册聊天工具栏
  }

  tipsAudio() {
    Howler.autoUnlock = false;
    if (!this.messageTone) {
      this.messageTone = new Howl({
        src: require("./assets/msg-tip.mp3"),
      });
      this.messageTone.play();
    } else {
      this.messageTone.play();
    }
  }

  allowNotify(message: Message) {
    if (WKApp.shared.notificationIsClose) {
      // 用户关闭了通知
      return false;
    }
    if (WKSDK.shared().isSystemMessage(message.contentType)) {
      // 系统消息不发通知
      return false;
    }
    if (message.fromUID === WKApp.loginInfo.uid) {
      // 自己发的消息不发通知
      return false;
    }

    return true;
  }

  async sendNotification(message: Message, description?: string) {
    await notificationUtil.sendMessageNotification(message, description);
  }

  registerChatToolbars() {
    WKApp.endpoints.registerChatToolbar("chattoolbar.emoji", (ctx) => {
      return (
        <EmojiToolbar
          conversationContext={ctx}
          icon={require("./assets/toolbars/func_face_normal.svg").default}
        ></EmojiToolbar>
      );
    });

    WKApp.endpoints.registerChatToolbar("chattoolbar.mention", (ctx) => {
      const channel = ctx.channel();
      if (channel.channelType === ChannelTypePerson) {
        return undefined;
      }
      return (
        <IconClick
          icon={require("./assets/toolbars/func_mention_normal.svg").default}
          onClick={() => {
            ctx.messageInputContext().insertText("@");
          }}
        ></IconClick>
      );
    });

    WKApp.endpoints.registerChatToolbar("chattoolbar.screenshot", (ctx) => {
      return (
        <IconClick
          icon={require("./assets/toolbars/func_screenshot.svg").default}
          onClick={() => {
            if ((window as any).__POWERED_ELECTRON__) {
              (window as any).ipc.send('screenshots-start', {})
            } else {
              window.open("https://www.snipaste.com");
            }
          }}
        ></IconClick>
      );
    });
    WKApp.endpoints.registerChatToolbar("chattoolbar.image", (ctx) => {
      return (
        <ImageToolbar
          icon={require("./assets/toolbars/func_upload_image.svg").default}
          conversationContext={ctx}
          accept="image/*"
        ></ImageToolbar>
      );
    });
    WKApp.endpoints.registerChatToolbar("chattoolbar.video", (ctx) => {
      return (
        <ImageToolbar
          icon={require("./assets/toolbars/func_upload_video.svg").default}
          conversationContext={ctx}
          accept="video/*"
        ></ImageToolbar>
      );
    });
  }

  registerChatMenus() {
    WKApp.shared.chatMenusRegister("chatmenus.startchat", (param) => {
      const isDark = WKApp.config.themeMode === ThemeMode.dark;
      return {
        title: "发起群聊",
        icon: require(`${isDark
          ? "./assets/popmenus_startchat_dark.png"
          : "./assets/popmenus_startchat.png"
          }`),
        onClick: () => {
          const channel: any = {
            channelID: "",
            channelType: 0,
          };
          WKApp.endpoints.organizationalLayer(channel);
        },
      };
    });
  }

  registerMessageContextMenus() {
    WKApp.endpoints.registerMessageContextMenus(
      "contextmenus.copy",
      (message) => {
        if (message.contentType !== MessageContentType.text && message.contentType !== MessageContentType.image) {
          return null;
        }

        const guessImageMimeTypeFromUrl = (imageUrl: string): string | undefined => {
          const lower = (imageUrl || "").toLowerCase();
          // 尽量只从 pathname 推断（避免 query 里人为塞 filename 导致误判）
          let pathname = lower;
          try {
            pathname = new URL(imageUrl, window.location.origin).pathname.toLowerCase();
          } catch {
            // ignore
          }
          if (pathname.endsWith(".png")) {
            return "image/png";
          }
          if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) {
            return "image/jpeg";
          }
          if (pathname.endsWith(".gif")) {
            return "image/gif";
          }
          if (pathname.endsWith(".webp")) {
            return "image/webp";
          }
          if (pathname.endsWith(".bmp")) {
            return "image/bmp";
          }
          return undefined;
        };

        const sniffImageMimeType = async (blob: Blob): Promise<string | undefined> => {
          try {
            const ab = await blob.slice(0, 32).arrayBuffer();
            const b = new Uint8Array(ab);

            // PNG: 89 50 4E 47 0D 0A 1A 0A
            if (
              b.length >= 8 &&
              b[0] === 0x89 &&
              b[1] === 0x50 &&
              b[2] === 0x4e &&
              b[3] === 0x47 &&
              b[4] === 0x0d &&
              b[5] === 0x0a &&
              b[6] === 0x1a &&
              b[7] === 0x0a
            ) {
              return "image/png";
            }
            // JPEG: FF D8 FF
            if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
              return "image/jpeg";
            }
            // GIF: 47 49 46 38
            if (b.length >= 4 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) {
              return "image/gif";
            }
            // WEBP: RIFF....WEBP
            if (
              b.length >= 12 &&
              b[0] === 0x52 &&
              b[1] === 0x49 &&
              b[2] === 0x46 &&
              b[3] === 0x46 &&
              b[8] === 0x57 &&
              b[9] === 0x45 &&
              b[10] === 0x42 &&
              b[11] === 0x50
            ) {
              return "image/webp";
            }
            // BMP: 42 4D
            if (b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d) {
              return "image/bmp";
            }
          } catch {
            // ignore
          }
          return undefined;
        };

        const toAbsoluteUrl = (inputUrl: string): string => {
          if (!inputUrl) {
            return inputUrl;
          }
          try {
            const u = new URL(inputUrl, window.location.origin);
            return u.href;
          } catch {
            return inputUrl;
          }
        };

        return {
          title: "复制",
          onClick: () => {
            if (message.contentType === MessageContentType.image) {
              const content = message.content as ImageContent
              const buildImageSrcForCopy = (c: ImageContent): string => {
                if (c?.url && c.url !== "") {
                  // 复制到剪贴板的场景，不要强行追加 filename=image.png，避免服务端按文件名错误推断 Content-Type
                  return WKApp.dataSource.commonDataSource.getImageURL(c.url, { width: c.width, height: c.height });
                }
                return c?.imgData || "";
              };

              const url = buildImageSrcForCopy(content);
              if (!url) {
                Toast.warning("图片未就绪，请稍后再试");
                return;
              }
              const absoluteUrl = toAbsoluteUrl(url)
              void (async () => {
                const debugEnabled = (): boolean => {
                  try {
                    return localStorage.getItem("wk_debug_copy_image") === "1";
                  } catch {
                    return false;
                  }
                };

                const debugLog = (...args: any[]) => {
                  if (debugEnabled()) {
                    // eslint-disable-next-line no-console
                    console.log("[copy-image]", ...args);
                  }
                };

                const notifyCopyImageFailed = (err?: any) => {
                  const name = err?.name || "";
                  if (name === "NotAllowedError") {
                    Toast.warning("浏览器拒绝写入剪贴板，请检查权限/HTTPS，并重试");
                    return;
                  }
                  Toast.error("复制图片失败");
                };

                const getTokenHeader = (): Record<string, string> => {
                  try {
                    const token = WKApp.apiClient.config.tokenCallback?.();
                    if (token) {
                      return { token };
                    }
                  } catch {
                    // ignore
                  }
                  return {};
                };

                const convertToPngIfPossible = async (blob: Blob): Promise<{ blob: Blob; mimeType: string }> => {
                  try {
                    const originalType = blob.type && blob.type.startsWith("image/") ? blob.type : "";
                    if (originalType === "image/png") {
                      return { blob, mimeType: "image/png" };
                    }
                    // 太大的图转码很容易触发内存/解码失败，保留原始格式更稳
                    if (blob.size > 12 * 1024 * 1024) {
                      return { blob, mimeType: originalType || "application/octet-stream" };
                    }
                    if (!(window as any).createImageBitmap) {
                      return { blob, mimeType: originalType || "application/octet-stream" };
                    }
                    const bitmap = await (window as any).createImageBitmap(blob);
                    const canvas = document.createElement("canvas");
                    canvas.width = bitmap.width;
                    canvas.height = bitmap.height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                      bitmap.close?.();
                      return { blob, mimeType: originalType || "application/octet-stream" };
                    }
                    ctx.drawImage(bitmap, 0, 0);
                    bitmap.close?.();
                    const png = await new Promise<Blob>((resolve, reject) => {
                      canvas.toBlob((b) => {
                        if (b) {
                          resolve(b);
                        } else {
                          reject(new Error("toBlob failed"));
                        }
                      }, "image/png");
                    });
                    return { blob: png, mimeType: "image/png" };
                  } catch {
                    const t = blob.type && blob.type.startsWith("image/") ? blob.type : "application/octet-stream";
                    return { blob, mimeType: t };
                  }
                };

                const fetchImageAsBlob = async (fetchUrl: string, requestInit: RequestInit): Promise<{ blob: Blob; contentType: string }> => {
                  const res = await fetch(fetchUrl, requestInit);
                  if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                  }
                  const blob = await res.blob();
                  const contentType = res.headers.get("content-type") || "";
                  return { blob, contentType };
                };

                const resolveImageBlob = async (): Promise<{ blob: Blob; contentType: string; via: "direct" | "proxy" }> => {
                  const directRequestInit: RequestInit = {
                    mode: "cors",
                    credentials: "omit",
                  };

                  // 仅在同源/同 API 域时附带 token（跨域附带自定义 header 会触发预检，反而更容易失败）
                  try {
                    const apiBase = WKApp.apiClient.config.apiURL || "";
                    const apiOrigin = apiBase ? new URL(apiBase).origin : "";
                    const target = new URL(absoluteUrl, window.location.origin);
                    const isSameOriginAsPage = target.origin === window.location.origin;
                    const isSameOriginAsApi = apiOrigin ? target.origin === apiOrigin : false;
                    if (isSameOriginAsPage || isSameOriginAsApi) {
                      const tokenHeader = getTokenHeader();
                      if (Object.keys(tokenHeader).length > 0) {
                        directRequestInit.headers = {
                          ...(directRequestInit.headers || {}),
                          ...tokenHeader,
                        };
                      }
                    }
                  } catch {
                    // ignore
                  }
                  try {
                    const r = await fetchImageAsBlob(absoluteUrl, directRequestInit);
                    return { ...r, via: "direct" };
                  } catch (e) {
                    debugLog("direct fetch failed", e);
                  }

                  // 通过服务端代理绕过跨域/CORS
                  const proxyUrl = `${WKApp.apiClient.config.apiURL}file/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                  const proxyRequestInit: RequestInit = {
                    headers: {
                      ...getTokenHeader(),
                    },
                    // 即便 apiURL 配成跨域，这里也尽量不带 cookie，避免 ACAO:* 与 credentials 冲突
                    credentials: "omit",
                  };
                  const r = await fetchImageAsBlob(proxyUrl, proxyRequestInit);
                  return { ...r, via: "proxy" };
                };

                try {
                  const isElectron = Boolean((window as any).__POWERED_ELECTRON__ && (window as any).ipc?.invoke);

                  // Electron 桌面端优先走原生剪贴板，绕开浏览器 Clipboard 限制
                  if (isElectron) {
                    const { blob: originBlob, contentType, via } = await resolveImageBlob();
                    const urlGuess = guessImageMimeTypeFromUrl(absoluteUrl);
                    const headerGuess = contentType && contentType.startsWith("image/") ? contentType : "";
                    const blobGuess = originBlob.type && originBlob.type.startsWith("image/") ? originBlob.type : "";
                    const sniffGuess = await sniffImageMimeType(originBlob);
                    const preferredMimeType = urlGuess || blobGuess || headerGuess || sniffGuess || "image/png";
                    const typedBlob = originBlob.type ? originBlob : new Blob([originBlob], { type: preferredMimeType });
                    const converted = await convertToPngIfPossible(typedBlob);
                    const finalBlob = converted.blob;
                    const ab = await finalBlob.arrayBuffer();
                    debugLog("electron copy", { via, size: finalBlob.size, type: converted.mimeType, preferredMimeType, contentType });
                    const r = await (window as any).ipc.invoke("clipboard:writeImage", { data: ab });
                    if (r?.ok) {
                      Toast.success("复制成功");
                      return;
                    }
                    debugLog("electron clipboard failed", r);
                    // 继续走浏览器剪贴板兜底
                  }

                  const ClipboardItemCtor = (window as any).ClipboardItem;
                  if (!navigator.clipboard?.write || !ClipboardItemCtor) {
                    Toast.warning("当前环境不支持复制图片到剪贴板，请使用 Chrome/Edge 或桌面端");
                    return;
                  }

                  // 关键：不要先 await fetch 再写剪贴板（会丢失 user activation），
                  // 而是把异步获取 Blob 放进 ClipboardItem 的 Promise 里。
                  const urlGuess = guessImageMimeTypeFromUrl(absoluteUrl);
                  const preferredMimeType = urlGuess || "image/png";

                  // 关键：不要先 await fetch 再 write（会丢 user activation）
                  // 但我们仍然可以在 Promise 里动态决定最终写入的 mime
                  const blobPromise: Promise<{ blob: Blob; mimeType: string; via: string; contentType: string }> = (async () => {
                    const { blob: originBlob, contentType, via } = await resolveImageBlob();
                    const headerGuess = contentType && contentType.startsWith("image/") ? contentType : "";
                    const blobGuess = originBlob.type && originBlob.type.startsWith("image/") ? originBlob.type : "";
                    const sniffGuess = await sniffImageMimeType(originBlob);
                    const detectedMimeType = blobGuess || headerGuess || sniffGuess || preferredMimeType;
                    const typedBlob = originBlob.type ? originBlob : new Blob([originBlob], { type: detectedMimeType });
                    const converted = await convertToPngIfPossible(typedBlob);
                    const finalMimeType = converted.mimeType && converted.mimeType.startsWith("image/") ? converted.mimeType : detectedMimeType;
                    debugLog("resolved blob", { via, size: converted.blob.size, type: finalMimeType, preferredMimeType, contentType });
                    return { blob: converted.blob, mimeType: finalMimeType, via, contentType };
                  })();

                  // ClipboardItem 的 key 必须和 Promise 最终 resolve 的 Blob 类型一致，否则部分浏览器会直接拒绝
                  // 因为 key 需要在构造时就确定，所以这里优先使用 image/png：能转就转；不能转时再回退到原始 mime
                  let itemWritten = false;
                  try {
                    await navigator.clipboard.write([
                      new ClipboardItemCtor({
                        "image/png": (async () => {
                          const r = await blobPromise;
                          if (r.mimeType === "image/png") {
                            return r.blob;
                          }
                          // 不能转码时，不要伪装成 png，直接抛错走下面的原始 mime 流程
                          throw new Error("not-png");
                        })(),
                      }),
                    ]);
                    itemWritten = true;
                  } catch (e) {
                    debugLog("png clipboard write skipped", e);
                  }

                  if (!itemWritten) {
                    const r = await blobPromise;
                    const mt = r.mimeType && r.mimeType.startsWith("image/") ? r.mimeType : preferredMimeType;
                    await navigator.clipboard.write([
                      new ClipboardItemCtor({
                        [mt]: Promise.resolve(r.blob.type === mt ? r.blob : new Blob([r.blob], { type: mt })),
                      }),
                    ]);
                  }
                  Toast.success("复制成功");
                } catch (err) {
                  debugLog("clipboard write failed", err);
                  const msg = (err as any)?.message || "";
                  const name = (err as any)?.name || "";
                  if (msg) {
                    debugLog("clipboard write error detail", { name, msg });
                  }
                  // 不再自动兜底复制链接（避免“复制”结果变成 URL）
                  notifyCopyImageFailed(err);
                }
              })();
            } else {
              (function (s) {
                document.oncopy = function (e) {
                  e.clipboardData?.setData("text", s);
                  e.preventDefault();
                  document.oncopy = null;
                };
              })((message.content as MessageText).text || "");
              document.execCommand("Copy");
            }

          },
        };
      },
      1000
    );

    WKApp.endpoints.registerMessageContextMenus(
      "contextmenus.forward",
      (message, context) => {
        if (WKApp.shared.notSupportForward.includes(message.contentType)) {
          return null;
        }

        return {
          title: "转发",
          onClick: () => {
            context.fowardMessageUI(message);
          },
        };
      },
      2000
    );
    WKApp.endpoints.registerMessageContextMenus(
      "contextmenus.reply",
      (message, context) => {
        return {
          title: "回复",
          onClick: () => {
            context.reply(message, 1);
          },
        };
      }
    );

    WKApp.endpoints.registerMessageContextMenus(
      "contextmenus.edit",
      (message, context) => {
        // 仅支持编辑自己发送的文本消息
        if (!message.send) {
          return null;
        }
        if (message.messageID == "") {
          return null;
        }
        if (message.contentType !== MessageContentType.text) {
          return null;
        }
        if ((message as any)?.isDeleted) {
          return null;
        }
        const revoke = (message as any)?.remoteExtra?.revoke;
        if (revoke === 1 || revoke === true) {
          return null;
        }
        return {
          title: "编辑",
          onClick: () => {
            context.reply(message, 2);
          },
        };
      },
      2500
    );
    WKApp.endpoints.registerMessageContextMenus(
      "contextmenus.pin",
      (message, context) => {
        if (message.messageID == "") {
          return null;
        }
        if ((message as any)?.isDeleted) {
          return null;
        }
        const revoke = (message as any)?.remoteExtra?.revoke;
        if (revoke === 1 || revoke === true) {
          return null;
        }
        const isPinned = (message as any)?.remoteExtra?.isPinned === 1 || (message as any)?.remoteExtra?.isPinned === true;
        return {
          title: isPinned ? "取消置顶" : "置顶",
          onClick: () => {
            try {
              if (!message.messageSeq || message.messageSeq <= 0) {
                Toast.error("该消息未同步，暂不支持置顶")
                return
              }
              const pinFn = (context as any)?.pinMessage
              if (typeof pinFn !== "function") {
                Toast.error("当前版本不支持置顶")
                return
              }
              const p = pinFn.call(context, message)
              if (p && typeof (p as any).catch === "function") {
                ;(p as any).catch((err: any) => {
                  Toast.error(err?.msg || err?.message || "操作失败")
                })
              }
            } catch (err: any) {
              Toast.error(err?.message || "操作失败")
            }
          },
        };
      },
      2600
    );
    WKApp.endpoints.registerMessageContextMenus(
      "contextmenus.muli",
      (message, context) => {
        return {
          title: "多选",
          onClick: () => {
            context.setEditOn(true);
          },
        };
      },
      3000
    );
    WKApp.endpoints.registerMessageContextMenus(
      "contextmenus.revoke",
      (message, context) => {
        if (message.messageID == "") {
          return null;
        }

        let isManager = false;
        if (message.channel.channelType == ChannelTypeGroup) {
          const sub = WKSDK.shared().channelManager.getSubscribeOfMe(
            message.channel
          );
          if (sub?.role == GroupRole.manager || sub?.role == GroupRole.owner) {
            isManager = true;
          }
        }

        if (!isManager) {
          if (!message.send) {
            return null;
          }
          let revokeSecond = WKApp.remoteConfig.revokeSecond;
          if (revokeSecond > 0) {
            const messageTime = new Date().getTime() / 1000 - message.timestamp;
            if (messageTime > revokeSecond) {
              //  超过两分钟则不显示撤回
              return null;
            }
          }
        }
        return {
          title: "撤回",
          onClick: () => {
            context.revokeMessage(message).catch((err) => {
              Toast.error(err.msg);
            });
          },
        };
      },
      4000
    );
  }

  registerUserInfo() {
    WKApp.shared.userInfoRegister(
      "userinfo.remark",
      (context: RouteContext<UserInfoRouteData>) => {
        const data = context.routeData();
        const channelInfo = data.channelInfo;
        const fromSubscriberOfUser = data.fromSubscriberOfUser;

        if (data.isSelf) {
          return;
        }

        const rows = new Array();
        rows.push(
          new Row({
            cell: ListItem,
            properties: {
              title: "设置备注",
              onClick: () => {
                this.inputEditPush(
                  context,
                  channelInfo?.orgData?.remark,
                  async (value) => {
                    await WKApp.dataSource.commonDataSource
                      .userRemark(data.uid, value)
                      .catch((err) => {
                        Toast.error(err.msg);
                      });
                    return;
                  },
                  "设置备注"
                );
              },
            },
          })
        );
        if (fromSubscriberOfUser) {
          let joinDesc = `${fromSubscriberOfUser.orgData.created_at.substr(
            0,
            10
          )}`;
          if (
            fromSubscriberOfUser.orgData?.invite_uid &&
            fromSubscriberOfUser.orgData?.invite_uid !== ""
          ) {
            const inviterChannel = new Channel(
              fromSubscriberOfUser.orgData?.invite_uid,
              ChannelTypePerson
            );
            const inviteChannelInfo =
              WKSDK.shared().channelManager.getChannelInfo(inviterChannel);
            if (inviteChannelInfo) {
              joinDesc += ` ${inviteChannelInfo.title}邀请入群`;
            } else {
              WKSDK.shared().channelManager.fetchChannelInfo(inviterChannel);
            }
          } else {
            joinDesc += "加入群聊";
          }
          rows.push(
            new Row({
              cell: ListItem,
              properties: {
                title: "进群方式",
                subTitle: joinDesc,
              },
            })
          );
        }

        return new Section({
          rows: rows,
        });
      }
    );

    WKApp.shared.userInfoRegister(
      "userinfo.others",
      (context: RouteContext<UserInfoRouteData>) => {
        const data = context.routeData();
        const channelInfo = data.channelInfo;
        const relation = channelInfo?.orgData?.follow;
        const status = channelInfo?.orgData.status;

        if (data.isSelf) {
          return;
        }

        const rows = new Array();
        if (relation === UserRelation.friend) {
          rows.push(
            new Row({
              cell: ListItem,
              properties: {
                title: "解除好友关系",
                onClick: () => {
                  WKApp.shared.baseContext.showAlert({
                    content: `将联系人“${channelInfo?.orgData?.displayName}”删除，同时删除与该联系人的聊天记录`,
                    onOk: () => {
                      WKApp.dataSource.commonDataSource
                        .deleteFriend(data.uid)
                        .then(() => {
                          const channel = new Channel(
                            data.uid,
                            ChannelTypePerson
                          );
                          const conversation =
                            WKSDK.shared().conversationManager.findConversation(
                              channel
                            );
                          if (conversation) {
                            WKApp.conversationProvider.clearConversationMessages(
                              conversation
                            );
                          }
                          WKSDK.shared().conversationManager.removeConversation(
                            channel
                          );
                          WKApp.endpointManager.invoke(
                            EndpointID.clearChannelMessages,
                            channel
                          );

                          WKSDK.shared().channelManager.fetchChannelInfo(
                            new Channel(data.uid, ChannelTypePerson)
                          );
                        })
                        .catch((err) => {
                          Toast.error(err.msg);
                        });
                    },
                  });
                },
              },
            })
          );
        }

        rows.push(
          new Row({
            cell: ListItem,
            properties: {
              title:
                status === UserRelation.blacklist ? "拉出黑名单" : "拉入黑名单",
              onClick: () => {
                if (status === UserRelation.blacklist) {
                  WKApp.dataSource.commonDataSource
                    .blacklistRemove(data.uid)
                    .then(() => {
                      WKApp.dataSource.contactsSync();
                    })
                    .catch((err) => {
                      Toast.error(err.msg);
                    });
                } else {
                  WKApp.shared.baseContext.showAlert({
                    content: "加入黑名单，你将不再收到对方的消息。",
                    onOk: () => {
                      WKApp.dataSource.commonDataSource
                        .blacklistAdd(data.uid)
                        .then(() => {
                          WKApp.dataSource.contactsSync();
                        })
                        .catch((err) => {
                          Toast.error(err.msg);
                        });
                    },
                  });
                }
              },
            },
          })
        );

        // rows.push(new Row({
        //     cell: ListItem,
        //     properties: {
        //         title: "投诉",
        //     }
        // }))
        return new Section({
          rows: rows,
        });
      }
    );

    // 群成员禁言（单人）- 放在“查看用户信息”里，方便快捷操作
    WKApp.shared.userInfoRegister(
      "userinfo.group.forbidden",
      (context: RouteContext<UserInfoRouteData>) => {
        const data = context.routeData();
        if (data.isSelf) {
          return;
        }

        const fromChannel = data.fromChannel;
        const targetSubscriber = data.fromSubscriberOfUser;
        if (!fromChannel || fromChannel.channelType === ChannelTypePerson) {
          return;
        }
        if (!targetSubscriber) {
          return;
        }

        const toRoleNumber = (role: any): number | undefined => {
          if (role === 0) return 0;
          if (!role) return undefined;
          if (typeof role === "number") return role;
          if (typeof role === "string") {
            const n = parseInt(role, 10);
            return Number.isFinite(n) ? n : undefined;
          }
          return undefined;
        };

        const subscribers =
          WKSDK.shared().channelManager.getSubscribes(fromChannel) || [];
        const me = subscribers.find((s) => s.uid === WKApp.loginInfo.uid);
        const myRole = toRoleNumber((me as any)?.role);
        const targetRole = toRoleNumber((targetSubscriber as any)?.role);
        const now = Math.floor(Date.now() / 1000);

        const isVirtual = () => {
          const raw = (targetSubscriber as any)?.orgData?.is_virtual;
          if (raw === 1 || raw === true) return true;
          if (typeof raw === "string") {
            const n = parseInt(raw, 10);
            return Number.isFinite(n) ? n === 1 : false;
          }
          return false;
        };

        const getForbiddenUntilSec = (): number => {
          const raw =
            (targetSubscriber as any)?.orgData?.forbidden_expir_time ||
            (targetSubscriber as any)?.orgData?.forbiddenExpirationTime ||
            (targetSubscriber as any)?.orgData?.forbidden_expiration_time;
          if (!raw) return 0;
          const value = typeof raw === "string" ? parseInt(raw, 10) : raw;
          if (!value) return 0;
          // 兼容 ms/秒
          const sec = value > 1e12 ? Math.floor(value / 1000) : value;
          return typeof sec === "number" && Number.isFinite(sec) ? sec : 0;
        };

        const forbiddenUntil = getForbiddenUntilSec();
        const forbidden = forbiddenUntil > now;

        const myIsManagerOrOwner =
          myRole === GroupRole.owner || myRole === GroupRole.manager;
        if (!myIsManagerOrOwner) {
          return;
        }
        // 不能操作自己
        if (data.uid === WKApp.loginInfo.uid) {
          return;
        }
        // 虚拟/机器人禁用
        const isRobot =
          (targetSubscriber as any)?.orgData?.robot === 1 ||
          (targetSubscriber as any)?.robot === 1;
        if (isVirtual() || isRobot) {
          return;
        }
        // 管理员不能操作管理员/群主
        if (myRole === GroupRole.manager) {
          if (targetRole === GroupRole.owner || targetRole === GroupRole.manager) {
            return;
          }
        }

        const formatForbiddenTime = (sec: number) => {
          if (!sec) return "";
          try {
            return new Date(sec * 1000).toLocaleString();
          } catch {
            return "";
          }
        };

        const openForbiddenTimesModal = async () => {
          const options = await WKApp.dataSource.channelDataSource
            .forbiddenTimes()
            .catch((err) => {
              Toast.error(err?.msg || "获取禁言时长失败");
              return [];
            });
          if (!options || options.length === 0) {
            return;
          }
          WKApp.shared.baseContext.showGlobalModal({
            width: "380px",
            closable: true,
            onCancel: () => {
              WKApp.shared.baseContext.hideGlobalModal();
            },
            body: (
              <div className="wk-userinfo-forbidden-modal">
                <div className="wk-userinfo-forbidden-modal-title">选择禁言时长</div>
                <div className="wk-userinfo-forbidden-modal-options">
                  {options.map((opt) => {
                    const key =
                      typeof (opt as any).key === "string"
                        ? parseInt((opt as any).key, 10)
                        : (opt as any).key;
                    return (
                      <div
                        key={opt.key}
                        className="wk-userinfo-forbidden-modal-option"
                        onClick={async () => {
                          await WKApp.dataSource.channelDataSource
                            .forbiddenWithMember(fromChannel, {
                              memberUID: data.uid,
                              action: 1,
                              key,
                            })
                            .then(() => {
                              Toast.success("已禁言");
                              WKApp.shared.baseContext.hideGlobalModal();
                              WKSDK.shared().channelManager.syncSubscribes(fromChannel);
                              data.refresh?.();
                            })
                            .catch((err) => {
                              Toast.error(err?.msg || "禁言失败");
                            });
                        }}
                      >
                        {opt.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          });
        };

        const rows: Row[] = [];
        if (forbidden) {
          rows.push(
            new Row({
              cell: ListItem,
              properties: {
                title: "解除禁言",
                subTitle: forbiddenUntil ? `禁言至 ${formatForbiddenTime(forbiddenUntil)}` : undefined,
                onClick: async () => {
                  await WKApp.dataSource.channelDataSource
                    .forbiddenWithMember(fromChannel, {
                      memberUID: data.uid,
                      action: 0,
                    })
                    .then(() => {
                      Toast.success("已解除禁言");
                      WKSDK.shared().channelManager.syncSubscribes(fromChannel);
                      data.refresh?.();
                    })
                    .catch((err) => {
                      Toast.error(err?.msg || "解除禁言失败");
                    });
                },
              },
            })
          );
          rows.push(
            new Row({
              cell: ListItem,
              properties: {
                title: "延长禁言",
                onClick: openForbiddenTimesModal,
              },
            })
          );
        } else {
          rows.push(
            new Row({
              cell: ListItem,
              properties: {
                title: "禁言10分钟",
                onClick: async () => {
                  const options = await WKApp.dataSource.channelDataSource
                    .forbiddenTimes()
                    .catch((err) => {
                      Toast.error(err?.msg || "获取禁言时长失败");
                      return [];
                    });
                  if (!options || options.length === 0) {
                    return;
                  }
                  const tenMin =
                    options.find((o) => String((o as any).key) === "2") || options[0];
                  const key =
                    typeof (tenMin as any).key === "string"
                      ? parseInt((tenMin as any).key, 10)
                      : (tenMin as any).key;
                  await WKApp.dataSource.channelDataSource
                    .forbiddenWithMember(fromChannel, {
                      memberUID: data.uid,
                      action: 1,
                      key,
                    })
                    .then(() => {
                      Toast.success("已禁言");
                      WKSDK.shared().channelManager.syncSubscribes(fromChannel);
                      data.refresh?.();
                    })
                    .catch((err) => {
                      Toast.error(err?.msg || "禁言失败");
                    });
                },
              },
            })
          );
          rows.push(
            new Row({
              cell: ListItem,
              properties: {
                title: "选择禁言时长",
                onClick: openForbiddenTimesModal,
              },
            })
          );
        }

        return new Section({
          rows,
        });
      }
    );

    WKApp.shared.userInfoRegister(
      "userinfo.source",
      (context: RouteContext<UserInfoRouteData>) => {
        const data = context.routeData();
        const channelInfo = data.channelInfo;
        const relation = channelInfo?.orgData?.follow;
        if (data.isSelf) {
          return;
        }
        if (relation !== UserRelation.friend) {
          return;
        }
        return new Section({
          rows: [
            new Row({
              cell: ListItem,
              properties: {
                title: "来源",
                subTitle: `${channelInfo?.orgData?.source_desc}`,
              },
            }),
          ],
        });
      }
    );

    WKApp.shared.userInfoRegister(
      "userinfo.blacklist.tip",
      (context: RouteContext<UserInfoRouteData>) => {
        const data = context.routeData();
        const channelInfo = data.channelInfo;
        const status = channelInfo?.orgData?.status;
        if (data.isSelf) {
          return;
        }
        if (status !== UserRelation.blacklist) {
          return;
        }
        return new Section({
          rows: [
            new Row({
              cell: ListItemTip,
              properties: {
                tip: (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <IconAlertCircle
                      size="small"
                      style={{ marginRight: "4px", color: "red" }}
                    />
                    已添加至黑名单，你将不再收到对方的消息
                  </div>
                ),
              },
            }),
          ],
        });
      },
      99999
    );
  }

  inputEditPush(
    context: RouteContext<any>,
    defaultValue: string,
    onFinish: (value: string) => Promise<void>,
    placeholder?: string,
    maxCount?: number,
    allowEmpty?: boolean,
    allowWrap?: boolean
  ) {
    let value: string;
    let finishButtonContext: FinishButtonContext;
    context.push(
      <InputEdit
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(v, exceeded) => {
          value = v;
          if (!allowEmpty && (!value || value === "")) {
            finishButtonContext.disable(true);
          } else {
            finishButtonContext.disable(false);
          }
          if (exceeded) {
            finishButtonContext.disable(true);
          }
        }}
        maxCount={maxCount}
        allowWrap={allowWrap}
      ></InputEdit>,
      new RouteContextConfig({
        showFinishButton: true,
        onFinishContext: (finishBtnContext) => {
          finishButtonContext = finishBtnContext;
          finishBtnContext.disable(true);
        },
        onFinish: async () => {
          finishButtonContext.loading(true);
          await onFinish(value);
          finishButtonContext.loading(false);

          context.pop();
        },
      })
    );
  }

  registerChannelSettings() {
    WKApp.shared.channelSettingRegister("channel.subscribers", (context) => {
      const data = context.routeData() as ChannelSettingRouteData;
      const channel = data.channel;

      if (channel.channelType == ChannelTypeCustomerService) {
        return;
      }

      let addFinishButtonContext: FinishButtonContext;
      let removeFinishButtonContext: FinishButtonContext;
      let addSelectItems: IndexTableItem[];
      let removeSelectItems: Subscriber[];
      const disableSelectList = data.subscribers.map((subscriber) => {
        return subscriber.uid;
      });
      return new Section({
        rows: [
          new Row({
            cell: Subscribers,
            properties: {
              context: context,
              channel: channel,
              visible: !!data.visible,
              key: channel.getChannelKey(),
              onAdd: () => {
                context.push(
                  <ContactsSelect
                    onSelect={(items) => {
                      addSelectItems = items;
                      addFinishButtonContext.disable(items.length === 0);
                    }}
                    disableSelectList={disableSelectList}
                  ></ContactsSelect>,
                  {
                    title: "联系人选择",
                    showFinishButton: true,
                    onFinish: async () => {
                      addFinishButtonContext.loading(true);
                      try {
                        if (channel.channelType === ChannelTypePerson) {
                          const uids = new Array();
                          uids.push(WKApp.loginInfo.uid || "");
                          uids.push(channel.channelID);
                          for (const item of addSelectItems) {
                            uids.push(item.id);
                          }

                          const result = await WKApp.dataSource.channelDataSource
                            .createChannel(uids)
                            .catch((err) => {
                              Toast.error(err?.msg || "创建群失败");
                            });
                          if (result) {
                            WKApp.endpoints.showConversation(
                              new Channel(result.group_no, ChannelTypeGroup)
                            );
                          }
                        } else {
                          await WKApp.dataSource.channelDataSource.addSubscribers(
                            channel,
                            addSelectItems.map((item) => {
                              return item.id;
                            })
                          );
                          context.pop();
                        }
                      } catch (err: any) {
                        Toast.error(err?.msg || "添加失败");
                      } finally {
                        addFinishButtonContext.loading(false);
                      }
                    },
                    onFinishContext: (context) => {
                      addFinishButtonContext = context;
                      addFinishButtonContext.disable(true);
                    },
                  }
                );
              },
              onRemove: () => {
                const removeDisableSelectList: string[] = [];
                if (WKApp.loginInfo.uid) {
                  removeDisableSelectList.push(WKApp.loginInfo.uid);
                }
                context.push(
                  <SubscriberList
                    channel={channel}
                    onSelect={(items) => {
                      removeSelectItems = items;
                      removeFinishButtonContext.disable(items.length === 0);
                    }}
                    canSelect={true}
                    myRole={data.subscriberOfMe?.role}
                    disableSelectList={removeDisableSelectList}

                  ></SubscriberList>,
                  {
                    title: "删除群成员",
                    showFinishButton: true,
                    onFinish: async () => {
                      removeFinishButtonContext.loading(true);
                      try {
                        await WKApp.dataSource.channelDataSource.removeSubscribers(
                          channel,
                          removeSelectItems.map((item) => {
                            return item.uid;
                          })
                        );
                        context.pop();
                      } catch (err: any) {
                        Toast.error(err?.msg || "删除失败");
                      } finally {
                        removeFinishButtonContext.loading(false);
                      }

                    },
                    onFinishContext: (context) => {
                      removeFinishButtonContext = context;
                      removeFinishButtonContext.disable(true);
                    },
                  }
                );
              },
            },
          }),
        ],
      });
    });

    WKApp.shared.channelSettingRegister(
      "channel.base.setting",
      (context) => {
        const data = context.routeData() as ChannelSettingRouteData;
        const channelInfo = data.channelInfo;
        const channel = data.channel;
        if (channel.channelType !== ChannelTypeGroup) {
          return undefined;
        }
        const rows = new Array();
        rows.push(
          new Row({
            cell: ListItem,
            properties: {
              title: "群聊名称",
              subTitle: channelInfo?.title,
              onClick: () => {
                if (!data.isManagerOrCreatorOfMe) {
                  Toast.warning("只有管理者才能修改群名字");
                  return;
                }
                this.inputEditPush(
                  context,
                  channelInfo?.title || "",
                  (value: string) => {
                    return WKApp.dataSource.channelDataSource
                      .updateField(channel, ChannelField.channelName, value)
                      .catch((err) => {
                        Toast.error(err.msg);
                      });
                  },
                  "群名称",
                  20
                );
              },
            },
          })
        );

        rows.push(
          new Row({
            cell: ListItemIcon,
            properties: {
              title: "群头像",
              icon: (
                <img
                  style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                  src={WKApp.shared.avatarChannel(channel)}
                  alt=""
                />
              ),
              onClick: () => {
                context.push(
                  <ChannelAvatar
                    showUpload={data.isManagerOrCreatorOfMe}
                    channel={channel}
                    context={context}
                  ></ChannelAvatar>,
                  { title: "群头像" }
                );
              },
            },
          })
        );

        rows.push(
          new Row({
            cell: ListItemIcon,
            properties: {
              title: "群二维码",
              icon: (
                <img
                  style={{ width: "24px", height: "24px" }}
                  src={require("./assets/icon_qrcode.png")}
                  alt=""
                />
              ),
              onClick: () => {
                context.push(
                  <ChannelQRCode channel={channel}></ChannelQRCode>,
                  new RouteContextConfig({
                    title: "群二维码名片",
                  })
                );
              },
            },
          })
        );
        rows.push(
          new Row({
            cell: ListItemMuliteLine,
            properties: {
              title: "群公告",
              subTitle: channelInfo?.orgData?.notice,
              onClick: () => {
                if (!data.isManagerOrCreatorOfMe) {
                  Toast.warning("只有管理者才能修改群公告");
                  return;
                }
                this.inputEditPush(
                  context,
                  channelInfo?.orgData?.notice || "",
                  (value: string) => {
                    return WKApp.dataSource.channelDataSource
                      .updateField(channel, ChannelField.notice, value)
                      .catch((err) => {
                        Toast.error(err.msg);
                      });
                  },
                  "群公告",
                  400,
                  false,
                  true
                );
              },
            },
          })
        );
        rows.push(
          new Row({
            cell: ListItem,
            properties: {
              title: "备注",
              subTitle: channelInfo?.orgData?.remark,
              onClick: () => {
                this.inputEditPush(
                  context,
                  channelInfo?.orgData?.remark || "",
                  (value: string) => {
                    return ChannelSettingManager.shared.remark(value, channel).then(() => {
                      data.refresh()
                    })
                  },
                  "群聊的备注仅自己可见",
                  15,
                  true
                );
              },
            },
          })
        );
        return new Section({
          rows: rows,
        });
      },
      1000
    );

    WKApp.shared.channelSettingRegister(
      "channel.base.settingMessageHistory",
      (context) => {
        const data = context.routeData() as ChannelSettingRouteData;
        const channel = data.channel

        return new Section({
          rows: [
            new Row({
              cell: ListItem,
              properties: {
                title: "查找聊天内容",
                onClick: () => {
                  WKApp.shared.baseContext.showGlobalModal({
                    body: <GlobalSearch channel={channel} onClick={(item: any, type: string) => {
                      handleGlobalSearchClick(item, type, () => {
                        WKApp.shared.baseContext.hideGlobalModal()
                      })
                    }} />,
                    width: "80%",
                    height: "80%",
                    onCancel: () => {
                      WKApp.shared.baseContext.hideGlobalModal()
                    }
                  })
                },
              },
            }),
            new Row({
              cell: MediaSummary,
              properties: {
                channel,
                type: "image",
              },
            }),
            new Row({
              cell: MediaSummary,
              properties: {
                channel,
                type: "video",
              },
            }),
          ],
        });
      },
      1100
    );

    WKApp.shared.channelSettingRegister(
      "channel.base.setting2",
      (context) => {
        const data = context.routeData() as ChannelSettingRouteData;
        const channelInfo = data.channelInfo;
        const channel = data.channel;
        const rows = new Array<Row>();

        if (channel.channelType == ChannelTypeCustomerService) {
          return;
        }

        rows.push(
          new Row({
            cell: ListItemSwitch,
            properties: {
              title: "消息免打扰",
              checked: channelInfo?.mute,
              onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                ctx.loading = true;
                ChannelSettingManager.shared
                  .mute(v, channel)
                  .then(() => {
                    ctx.loading = false;
                    data.refresh();
                  })
                  .catch(() => {
                    ctx.loading = false;
                  });
              },
            },
          })
        );

        rows.push(
          new Row({
            cell: ListItemSwitch,
            properties: {
              title: "聊天置顶",
              checked: channelInfo?.top,
              onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                ctx.loading = true;
                ChannelSettingManager.shared
                  .top(v, channel)
                  .then(() => {
                    ctx.loading = false;
                    data.refresh();
                  })
                  .catch(() => {
                    ctx.loading = false;
                  });
              },
            },
          })
        );

        if (channel.channelType == ChannelTypeGroup) {
          rows.push(
            new Row({
              cell: ListItemSwitch,
              properties: {
                title: "保存到通讯录",
                checked: channelInfo?.orgData.save === 1,
                onCheck: (v: boolean, ctx: ListItemSwitchContext) => {
                  ctx.loading = true;
                  ChannelSettingManager.shared
                    .save(v, channel)
                    .then(() => {
                      ctx.loading = false;
                      data.refresh();
                    })
                    .catch(() => {
                      ctx.loading = false;
                    });
                },
              },
            })
          );
        }
        return new Section({
          rows: rows,
        });
      },
      3000
    );

    WKApp.shared.channelSettingRegister(
      "channel.base.setting3",
      (context) => {
        const data = context.routeData() as ChannelSettingRouteData;
        if (data.channel.channelType !== ChannelTypeGroup) {
          return undefined;
        }

        let name = data.subscriberOfMe?.remark;
        if (!name || name === "") {
          name = data.subscriberOfMe?.name;
        }

        return new Section({
          rows: [
            new Row({
              cell: ListItem,
              properties: {
                title: "我在本群的昵称",
                subTitle: name,
                onClick: () => {
                  this.inputEditPush(
                    context,
                    name || "",
                    (value: string) => {
                      return WKApp.dataSource.channelDataSource.subscriberAttrUpdate(
                        data.channel,
                        WKApp.loginInfo.uid || "",
                        { remark: value }
                      );
                    },
                    "在这里可以设置你在这个群里的昵称。这个昵称只会在此群内显示。",
                    10,
                    true
                  );
                },
              },
            }),
          ],
        });
      },
      4000
    );

    // WKApp.shared.channelSettingRegister("channel.notify.setting.screen", (context) => {
    //     return new Section({
    //         subtitle: "在对话中的截屏，各方均会收到通知",
    //         rows: [
    //             new Row({
    //                 cell: ListItemSwitch,
    //                 properties: {
    //                     title: "截屏通知",
    //                 },
    //             }),
    //         ],
    //     })
    // })
    // WKApp.shared.channelSettingRegister("channel.notify.setting.revokemind", (context) => {
    //     return new Section({
    //         subtitle: "在对话中的消息撤回，各方均会收到通知",
    //         rows: [
    //             new Row({
    //                 cell: ListItemSwitch,
    //                 properties: {
    //                     title: "撤回通知",
    //                 },
    //             }),
    //         ],
    //     })
    // })
    // WKApp.shared.channelSettingRegister("channel.base.setting5", (context) => {
    //     return new Section({
    //         rows: [
    //             new Row({
    //                 cell: ListItem,
    //                 properties: {
    //                     title: "投诉",
    //                 },
    //             }),
    //         ],
    //     })
    // })

    WKApp.shared.channelSettingRegister(
      "channel.base.setting6",
      (context) => {
        const data = context.routeData() as ChannelSettingRouteData;
        if (data.channel.channelType !== ChannelTypeGroup) {
          return undefined;
        }
        return new Section({
          rows: [
            new Row({
              cell: ListItemButton,
              properties: {
                title: "清空聊天记录",
                type: ListItemButtonType.warn,
                onClick: () => {
                  WKApp.shared.baseContext.showAlert({
                    content: "是否清空此会话的所有消息？",
                    onOk: async () => {
                      const conversation =
                        WKSDK.shared().conversationManager.findConversation(
                          data.channel
                        );
                      if (!conversation) {
                        return;
                      }
                      await WKApp.conversationProvider.clearConversationMessages(
                        conversation
                      );
                      conversation.lastMessage = undefined;
                      WKApp.endpointManager.invoke(
                        EndpointID.clearChannelMessages,
                        data.channel
                      );
                    },
                  });
                },
              },
            }),
            new Row({
              cell: ListItemButton,
              properties: {
                title: "删除并退出",
                type: ListItemButtonType.warn,
                onClick: () => {
                  WKApp.shared.baseContext.showAlert({
                    content:
                      "退出后不会通知群里其他成员，且不会再接收此群聊消息",
                    onOk: async () => {
                      WKApp.dataSource.channelDataSource
                        .exitChannel(data.channel)
                        .catch((err) => {
                          Toast.error(err.msg);
                        });
                      WKApp.conversationProvider.deleteConversation(
                        data.channel
                      );
                    },
                  });
                },
              },
            }),
          ],
        });
      },
      90000
    );
  }
}
