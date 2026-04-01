import React, { Component } from "react";
import { Button, Spin, Toast } from "@douyinfe/semi-ui";
import Viewer from "react-viewer";
import WKApp from "../../App";
import { Channel, Message, PullMode, Setting, WKSDK } from "wukongimjssdk";
import { MessageContentTypeConst } from "../../Service/Const";
import { ImageContent } from "../../Messages/Image";
import { VideoContent } from "../../Messages/Video";
import MediaGalleryVM, { MediaType, MediaMessageItem } from "./vm";
import ContextMenus, { ContextMenusContext, ContextMenusData } from "../ContextMenus";
import { SyncMessageOptions } from "../../Service/DataSource/DataProvider";
import "./index.css";

export interface MediaGalleryProps {
  channel: Channel;
  mediaType: MediaType;
  // 从消息气泡点击进入时传
  focusMessageID?: string;
  focusTimestamp?: number;
  onClose?: () => void;
}

interface MediaGalleryState {
  showViewer: boolean;
  activeIndex: number;
  images: any[];
  playingVideo?: {
    url: string;
    cover?: string;
  };
  contextMenus?: ContextMenusData[];
}

export default class MediaGallery extends Component<MediaGalleryProps, MediaGalleryState> {
  vm!: MediaGalleryVM;
  gridRef = React.createRef<HTMLDivElement>();
  private viewerContextMenuBound = false;
  private copyingFromViewer = false;
  private contextMenusContext?: ContextMenusContext;
  private contextMenusItem?: MediaMessageItem;

  constructor(props: MediaGalleryProps) {
    super(props);
    this.state = {
      showViewer: false,
      activeIndex: 0,
      images: [],
      playingVideo: undefined,
      contextMenus: undefined,
    };

    const contentTypes =
      props.mediaType === "image" ? [MessageContentTypeConst.image] : [MessageContentTypeConst.smallVideo];
    this.vm = new MediaGalleryVM(props.channel, props.mediaType, contentTypes);
  }

  componentDidMount(): void {
    this.vm.listen(() => {
      this.setState({});
    });
    this.vm
      .initialLoad()
      .then(() => this.ensureFocusAndOpen())
      .catch((err) => {
        // 部分错误对象使用 message 字段
        Toast.error(err?.msg || err?.message || "加载失败");
        // 方便定位线上问题
        // eslint-disable-next-line no-console
        console.error("MediaGallery.initialLoad failed", err);
      });
  }

  componentDidUpdate(_: MediaGalleryProps, prevState: MediaGalleryState): void {
    if (prevState.showViewer !== this.state.showViewer) {
      if (this.state.showViewer) {
        this.bindViewerContextMenu();
      } else {
        this.unbindViewerContextMenu();
      }
    }
  }

  componentWillUnmount(): void {
    this.vm.listen(undefined as any);
    this.unbindViewerContextMenu();
  }

  private bindViewerContextMenu() {
    if (this.viewerContextMenuBound) return;
    document.addEventListener("contextmenu", this.onViewerContextMenu, true);
    this.viewerContextMenuBound = true;
  }

  private unbindViewerContextMenu() {
    if (!this.viewerContextMenuBound) return;
    document.removeEventListener("contextmenu", this.onViewerContextMenu, true);
    this.viewerContextMenuBound = false;
  }

  private toAbsoluteUrl(inputUrl: string): string {
    if (!inputUrl) return inputUrl;
    try {
      return new URL(inputUrl, window.location.origin).href;
    } catch {
      return inputUrl;
    }
  }

  private getTokenHeader(): Record<string, string> {
    try {
      const token = WKApp.apiClient.config.tokenCallback?.();
      if (token) {
        return { token };
      }
    } catch {
      // ignore
    }
    return {};
  }

  private async fetchImageAsBlob(fetchUrl: string, requestInit: RequestInit): Promise<Blob> {
    const res = await fetch(fetchUrl, requestInit);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.blob();
  }

  private async resolveImageBlob(absoluteUrl: string): Promise<Blob> {
    const directInit: RequestInit = {
      mode: "cors",
      credentials: "omit",
    };

    // 同源/同 API 域时才尝试附带 token（跨域附带自定义 header 会触发预检）
    try {
      const apiBase = WKApp.apiClient.config.apiURL || "";
      const apiOrigin = apiBase ? new URL(apiBase, window.location.origin).origin : "";
      const target = new URL(absoluteUrl, window.location.origin);
      const isSameOriginAsPage = target.origin === window.location.origin;
      const isSameOriginAsApi = apiOrigin ? target.origin === apiOrigin : false;
      if (isSameOriginAsPage || isSameOriginAsApi) {
        const tokenHeader = this.getTokenHeader();
        if (Object.keys(tokenHeader).length > 0) {
          directInit.headers = {
            ...(directInit.headers || {}),
            ...tokenHeader,
          };
        }
      }
    } catch {
      // ignore
    }

    try {
      return await this.fetchImageAsBlob(absoluteUrl, directInit);
    } catch {
      // ignore
    }

    // 通过服务端代理绕过跨域/CORS
    const proxyUrl = `${WKApp.apiClient.config.apiURL}file/proxy?url=${encodeURIComponent(absoluteUrl)}`;
    const proxyInit: RequestInit = {
      headers: {
        ...this.getTokenHeader(),
      },
      credentials: "omit",
    };
    return await this.fetchImageAsBlob(proxyUrl, proxyInit);
  }

  private async copyImageUrlToClipboard(inputUrl: string) {
    const src = inputUrl || "";
    if (!src) {
      Toast.warning("图片未就绪，请稍后再试");
      return;
    }
    const absoluteUrl = this.toAbsoluteUrl(src);

    const isElectron = Boolean((window as any).__POWERED_ELECTRON__ && (window as any).ipc?.invoke);
    if (isElectron) {
      const blob = await this.resolveImageBlob(absoluteUrl);
      const ab = await blob.arrayBuffer();
      const r = await (window as any).ipc.invoke("clipboard:writeImage", { data: ab });
      if (r?.ok) {
        Toast.success("复制成功");
        return;
      }
      throw new Error("electron-clipboard-failed");
    }

    const ClipboardItemCtor = (window as any).ClipboardItem;
    if (!navigator.clipboard?.write || !ClipboardItemCtor) {
      Toast.warning("当前环境不支持复制图片到剪贴板，请使用 Chrome/Edge 或桌面端");
      return;
    }

    // 不要先 await fetch 再写剪贴板（会丢失 user activation）
    const blobPromise: Promise<Blob> = this.resolveImageBlob(absoluteUrl);

    const guessMimeTypeFromUrl = (imageUrl: string): string => {
      const lower = (imageUrl || "").toLowerCase();
      let pathname = lower;
      try {
        pathname = new URL(imageUrl, window.location.origin).pathname.toLowerCase();
      } catch {
        // ignore
      }
      if (pathname.endsWith(".png")) return "image/png";
      if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
      if (pathname.endsWith(".gif")) return "image/gif";
      if (pathname.endsWith(".webp")) return "image/webp";
      if (pathname.endsWith(".bmp")) return "image/bmp";
      return "image/png";
    };

    const convertToPngIfPossible = async (blob: Blob): Promise<Blob> => {
      if (blob.type === "image/png") return blob;
      if (blob.size > 12 * 1024 * 1024) {
        throw new Error("too-large-to-convert");
      }
      if (!(window as any).createImageBitmap) {
        throw new Error("no-createImageBitmap");
      }
      const bitmap = await (window as any).createImageBitmap(blob);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("no-canvas-ctx");
        }
        ctx.drawImage(bitmap, 0, 0);
        const png = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error("toBlob failed"));
            },
            "image/png"
          );
        });
        return png;
      } finally {
        bitmap.close?.();
      }
    };

    const preferredMimeType = guessMimeTypeFromUrl(absoluteUrl);

    let ok = false;
    try {
      await navigator.clipboard.write([
        new ClipboardItemCtor({
          "image/png": (async () => {
            const b = await blobPromise;
            const typed = b.type ? b : new Blob([b], { type: preferredMimeType });
            return await convertToPngIfPossible(typed);
          })(),
        }),
      ]);
      ok = true;
    } catch {
      // ignore
    }

    if (!ok) {
      await navigator.clipboard.write([
        new ClipboardItemCtor({
          [preferredMimeType]: (async () => {
            const b = await blobPromise;
            const typed = b.type ? b : new Blob([b], { type: preferredMimeType });
            return typed.type === preferredMimeType ? typed : new Blob([typed], { type: preferredMimeType });
          })(),
        }),
      ]);
    }
    Toast.success("复制成功");
  }

  private copyViewerActiveImage = async () => {
    const img = this.state.images?.[this.state.activeIndex];
    const src = img?.downloadUrl || img?.src || "";
    await this.copyImageUrlToClipboard(src);
  };

  private onViewerContextMenu = (e: MouseEvent) => {
    if (!this.state.showViewer) return;

    // viewer 打开时，右键应当始终用于“复制图片”，避免浏览器默认菜单（返回/前进等）误触。
    e.preventDefault();
    e.stopPropagation();
    (e as any).stopImmediatePropagation?.();

    if (this.copyingFromViewer) return;
    this.copyingFromViewer = true;

    void this.copyViewerActiveImage()
      .catch((err) => {
        const name = (err as any)?.name || "";
        if (name === "NotAllowedError") {
          Toast.warning("浏览器拒绝写入剪贴板，请检查权限/HTTPS，并重试");
          return;
        }
        Toast.error("复制图片失败");
      })
      .finally(() => {
        this.copyingFromViewer = false;
      });
  };

  private getImageSrc(content: ImageContent) {
    if (content.url && content.url !== "") {
      let downloadURL = WKApp.dataSource.commonDataSource.getImageURL(content.url, {
        width: content.width,
        height: content.height,
      });
      if (downloadURL.indexOf("?") !== -1) {
        downloadURL += "&filename=image.png";
      } else {
        downloadURL += "?filename=image.png";
      }
      return downloadURL;
    }
    return content.imgData;
  }

  private async getMessageForItem(item: MediaMessageItem): Promise<Message | undefined> {
    const raw = (item as any)?.raw;
    if (raw) return raw as any;
    if (!item?.messageSeq) return undefined;
    try {
      const opts = new SyncMessageOptions();
      opts.limit = 1;
      opts.startMessageSeq = item.messageSeq;
      opts.pullMode = PullMode.Up;
      const msgs = (await WKApp.conversationProvider.syncMessages(this.props.channel, opts)) || [];
      if (!msgs || msgs.length === 0) return undefined;
      // 兼容：优先按 messageID 命中
      const idStr = String(item.messageID || "");
      const hit = msgs.find((m: any) => String((m as any)?.messageID || "") === idStr);
      return (hit as any) || (msgs[0] as any);
    } catch {
      return undefined;
    }
  }

  private async uploadReadedForMessageID(messageID: string) {
    try {
      const item = this.vm.items.find((it) => it.messageID === messageID);
      if (!item) return;

      const msg = await this.getMessageForItem(item);
      if (!msg) return;

      const fromUID = (msg as any)?.fromUID;
      if (!fromUID || fromUID === WKApp.loginInfo.uid) return;

      const receiptEnabled = (msg as any)?.setting?.receiptEnabled;
      if (!receiptEnabled) return;

      const readed = (msg as any)?.remoteExtra?.readed;
      if (readed) return;

      WKSDK.shared().receiptManager.addReceiptMessages(this.props.channel, [msg]);
    } catch {
      // ignore
    }
  }

  private async forwardMessage(msg: Message) {
    if (WKApp.shared.notSupportForward?.includes?.((msg as any)?.contentType)) {
      Toast.warning("该类型消息不支持转发");
      return;
    }
    WKApp.shared.baseContext.showConversationSelect(async (channels: Channel[]) => {
      const cloneContent = (msg as any).content;
      for (const ch of channels) {
        try {
          const channelInfo = WKSDK.shared().channelManager.getChannelInfo(ch);
          const setting = new Setting();
          if ((channelInfo as any)?.orgData?.receipt === 1) {
            (setting as any).receiptEnabled = true;
          }
          await WKSDK.shared().chatManager.send(cloneContent, ch, setting);
        } catch {
          // ignore single failure
        }
      }
    });
  }

  private async deleteMessageFromChannel(msg: Message) {
    await WKApp.conversationProvider.deleteMessages([msg]);
    // 从列表里移除
    const idStr = String((msg as any)?.messageID || "");
    this.vm.items = this.vm.items.filter((it) => String(it.messageID || "") !== idStr);
    this.vm.notifyListener();
    // viewer 已打开时，尽量刷新图片数组，避免 activeIndex 悬空
    if (this.state.showViewer) {
      const nextImages = this.buildViewerImages(this.vm.items);
      const nextIndex = Math.max(0, Math.min(this.state.activeIndex, Math.max(0, nextImages.length - 1)));
      this.setState({ images: nextImages, activeIndex: nextIndex, showViewer: nextImages.length > 0 });
    }
  }

  private showItemContextMenu(item: MediaMessageItem, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenusItem = item;

    const menus: ContextMenusData[] = [];

    menus.push({
      title: "查看",
      onClick: () => {
        if (this.props.mediaType === "image") {
          this.openImageViewerAt(item.messageID);
        } else {
          this.openVideoPlayerAt(item.messageID);
        }
      },
    });

    if (this.props.mediaType === "image") {
      menus.push({
        title: "复制图片",
        onClick: () => {
          void (async () => {
            const content = item.content as any as ImageContent;
            const src = this.getImageSrc(content) || "";
            if (!src) {
              Toast.warning("图片未就绪，请稍后再试");
              return;
            }
            try {
              await this.copyImageUrlToClipboard(src);
            } catch (err) {
              const name = (err as any)?.name || "";
              if (name === "NotAllowedError") {
                Toast.warning("浏览器拒绝写入剪贴板，请检查权限/HTTPS，并重试");
                return;
              }
              Toast.error("复制图片失败");
            }
          })();
        },
      });
    }

    if (item.messageSeq && item.messageSeq > 0) {
      menus.push({
        title: "定位",
        onClick: () => {
          // 打开对应会话并定位到消息
          if (this.props.onClose) {
            this.props.onClose();
          }
          WKApp.endpoints.showConversation(this.props.channel, { initLocateMessageSeq: item.messageSeq });
        },
      });
    }

    menus.push({
      title: "转发",
      onClick: () => {
        void (async () => {
          const msg = await this.getMessageForItem(item);
          if (!msg) {
            Toast.error("获取消息失败");
            return;
          }
          await this.forwardMessage(msg);
        })();
      },
    });

    menus.push({
      title: "删除",
      onClick: () => {
        void (async () => {
          const msg = await this.getMessageForItem(item);
          if (!msg) {
            Toast.error("获取消息失败");
            return;
          }
          try {
            await this.deleteMessageFromChannel(msg);
            Toast.success("已删除");
          } catch {
            Toast.error("删除失败");
          }
        })();
      },
    });

    this.setState({ contextMenus: menus }, () => {
      this.contextMenusContext?.show(event);
    });
  }

  private getVideoCoverSrc(content: VideoContent) {
    return WKApp.dataSource.commonDataSource.getImageURL(content.cover);
  }

  private openVideoPlayerAt(messageID: string) {
    const item = this.vm.items.find((it) => it.messageID === messageID);
    if (!item?.content) return;
    const c = item.content as VideoContent;
    const url = WKApp.dataSource.commonDataSource.getFileURL(c.url);
    const cover = this.getVideoCoverSrc(c);
    this.setState({
      playingVideo: {
        url,
        cover,
      },
    });
  }

  private buildViewerImages(items: MediaMessageItem[]) {
    const list: any[] = [];
    for (const it of items) {
      if (!it.content) continue;
      if (this.props.mediaType === "image") {
        const c = it.content as ImageContent;
        const src = this.getImageSrc(c) || "";
        if (!src) continue;
        list.push({ src, alt: "", downloadUrl: src, messageID: it.messageID });
      } else {
        // video viewer 目前不使用 react-viewer
      }
    }
    return list;
  }

  private openImageViewerAt(messageID: string) {
    const images = this.buildViewerImages(this.vm.items);
    let idx = images.findIndex((it: any) => it.messageID === messageID);
    if (idx < 0) idx = 0;
    this.setState({ showViewer: true, images, activeIndex: idx });
    void this.uploadReadedForMessageID(messageID);
  }

  private async ensureFocusAndOpen() {
    const { focusMessageID, mediaType } = this.props;
    if (!focusMessageID) return;

    await this.vm.ensureContains(focusMessageID);

    if (mediaType === "image") {
      this.openImageViewerAt(focusMessageID);
    } else {
      this.openVideoPlayerAt(focusMessageID);
    }
  }

  private async onScroll() {
    const el = this.gridRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 200;
    if (nearBottom) {
      await this.vm.loadMoreOlder();
    }
  }

  render() {
    const { mediaType } = this.props;
    const { showViewer, images, activeIndex, contextMenus } = this.state;

    const title = mediaType === "image" ? "图片" : "视频";

    return (
      <div className="wk-media-gallery">
        <div className="wk-media-gallery-toolbar">
          <div>{title}</div>
          <div>
            <Button
              theme="borderless"
              onClick={() => {
                if (this.props.onClose) this.props.onClose();
              }}
            >
              关闭
            </Button>
          </div>
        </div>

        {this.vm.loading ? (
          <div style={{ paddingTop: 40, textAlign: "center" }}>
            <Spin />
          </div>
        ) : (
          <>
            <div
              className="wk-media-gallery-grid"
              ref={this.gridRef}
              onScroll={() => {
                this.onScroll().catch(() => {
                  // ignore
                });
              }}
            >
              {this.vm.items.map((it) => {
                if (!it.content) return null;
                if (mediaType === "image") {
                  const c = it.content as ImageContent;
                  const src = this.getImageSrc(c) || "";
                  if (!src) return null;
                  return (
                    <div
                      key={it.messageID}
                      className="wk-media-gallery-item"
                      onContextMenu={(e) => {
                        this.showItemContextMenu(it, e);
                      }}
                      onClick={() => {
                        this.openImageViewerAt(it.messageID);
                      }}
                    >
                      <img alt="" src={src} />
                    </div>
                  );
                }

                const v = it.content as VideoContent;
                const cover = this.getVideoCoverSrc(v);
                return (
                  <div
                    key={it.messageID}
                    className="wk-media-gallery-item"
                    onContextMenu={(e) => {
                      this.showItemContextMenu(it, e);
                    }}
                    onClick={() => {
                      this.openVideoPlayerAt(it.messageID);
                    }}
                  >
                    <img alt="" src={cover} />
                    <div className="wk-media-gallery-item-badge">视频</div>
                  </div>
                );
              })}
            </div>
            <div className="wk-media-gallery-footer">
              {this.vm.loadingMoreOlder ? (
                <Spin size="small" />
              ) : this.vm.loadFinishOlder ? (
                "- 到底了 -"
              ) : (
                <Button
                  size="small"
                  theme="borderless"
                  onClick={() => {
                    this.vm.loadMoreOlder().catch((err) => {
                      Toast.error(err?.msg || err?.message || "加载失败");
                    });
                  }}
                >
                  加载更多
                </Button>
              )}
            </div>
          </>
        )}

        {mediaType === "image" ? (
          <Viewer
            visible={showViewer}
            noImgDetails={true}
            downloadable={true}
            rotatable={false}
            changeable={true}
            showTotal={true}
            activeIndex={activeIndex}
            onMaskClick={() => {
              this.setState({ showViewer: false });
            }}
            onClose={() => {
              this.setState({ showViewer: false });
            }}
            onChange={(_: any, index: number) => {
              this.setState({ activeIndex: index });
              if (index >= images.length - 3) {
                this.vm.loadMoreOlder().then(() => {
                  const nextImages = this.buildViewerImages(this.vm.items);
                  this.setState({ images: nextImages });
                });
              }
            }}
            images={images}
          />
        ) : null}

        {mediaType === "video" && this.state.playingVideo ? (
          <div
            className="wk-video-preview-overlay"
            onClick={() => {
              this.setState({ playingVideo: undefined });
            }}
          >
            <div className="wk-video-preview" onClick={(e) => e.stopPropagation()}>
              <div className="wk-video-preview-header">
                <Button
                  theme="borderless"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                  onClick={() => {
                    this.setState({ playingVideo: undefined });
                  }}
                >
                  关闭
                </Button>
              </div>
              <video
                className="wk-video-preview-player"
                controls
                autoPlay
                poster={this.state.playingVideo.cover}
              >
                <source src={this.state.playingVideo.url} type="video/mp4" />
              </video>
            </div>
          </div>
        ) : null}

        <ContextMenus
          menus={contextMenus}
          onContext={(ctx) => {
            this.contextMenusContext = ctx;
          }}
        />
      </div>
    );
  }
}
