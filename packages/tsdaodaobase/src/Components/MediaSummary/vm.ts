import { Channel, PullMode } from "wukongimjssdk";
import { ProviderListener } from "../../Service/Provider";
import { MessageContentTypeConst } from "../../Service/Const";
import WKApp from "../../App";
import { ImageContent } from "../../Messages/Image";
import { VideoContent } from "../../Messages/Video";
import { SyncMessageOptions } from "../../Service/DataSource/DataProvider";

export type MediaSummaryType = "image" | "video";

export interface MediaSummaryItem {
  messageID: string;
  timestamp: number;
  thumb: string;
}

interface SummaryOptions {
  // 预览最多显示多少个
  previewLimit?: number;
  // 数量统计最多数到多少，超过显示为 `${cap}+`
  countCap?: number;
}

export default class MediaSummaryVM extends ProviderListener {
  channel!: Channel;
  type!: MediaSummaryType;

  loading = false;
  items: MediaSummaryItem[] = [];

  countText: string = "-";

  private previewLimit = 6;
  private countCap = 500;

  constructor(channel: Channel, type: MediaSummaryType, options?: SummaryOptions) {
    super();
    this.channel = channel;
    this.type = type;
    if (options?.previewLimit) this.previewLimit = options.previewLimit;
    if (options?.countCap) this.countCap = options.countCap;
  }

  didMount(): void {
    this.load().catch(() => {
      // ignore
    });
  }

  private contentTypes(): number[] {
    return this.type === "image" ? [MessageContentTypeConst.image] : [MessageContentTypeConst.smallVideo];
  }

  private isRevoked(msg: any): boolean {
    const revoke = (msg as any)?.remoteExtra?.revoke;
    return revoke === 1 || revoke === true;
  }

  private isDeleted(msg: any): boolean {
    const deleted = (msg as any)?.isDeleted;
    return deleted === 1 || deleted === true;
  }

  private isEligible(msg: any): boolean {
    if (!msg) return false;
    if (!this.contentTypes().includes(msg.contentType)) return false;
    if (this.isDeleted(msg) || this.isRevoked(msg)) return false;
    return true;
  }

  private buildThumbFromMessage(msg: any): string {
    if (!msg) return "";
    if (this.type === "image") {
      const c = msg.content as ImageContent;
      const url = c?.url || "";
      const width = c?.width || 0;
      const height = c?.height || 0;
      if (!url) return "";
      return WKApp.dataSource.commonDataSource.getImageURL(url, { width, height });
    }
    const v = msg.content as VideoContent;
    const cover = v?.cover || "";
    if (!cover) return "";
    return WKApp.dataSource.commonDataSource.getImageURL(cover);
  }

  private async syncMessages(options: { limit?: number; pullMode?: PullMode; startMessageSeq?: number }) {
    const opts = new SyncMessageOptions();
    if (typeof (options as any)?.limit === "number") {
      opts.limit = (options as any).limit;
    }
    if (typeof (options as any)?.startMessageSeq === "number") {
      opts.startMessageSeq = (options as any).startMessageSeq;
    }
    if ((options as any)?.pullMode !== undefined) {
      opts.pullMode = (options as any).pullMode;
    }
    // 与“查看全部”同源：走 conversationProvider，保证同一过滤/存储链路
    return WKApp.conversationProvider.syncMessages(this.channel, opts);
  }

  async load() {
    if (this.loading) return;
    this.loading = true;
    this.items = [];
    this.countText = "-";
    this.notifyListener();

    try {
      const pageSize = 200;
      let total = 0;
      let scannedMinSeq: number | undefined;

      const processBatch = (messages: any[], allowPreviewFill: boolean) => {
        if (!messages || messages.length === 0) return;
        const ordered = [...messages].sort((a, b) => (b.messageSeq || 0) - (a.messageSeq || 0));
        for (const m of ordered) {
          const seq = (m as any)?.messageSeq;
          if (typeof seq === "number" && seq) {
            scannedMinSeq = scannedMinSeq === undefined ? seq : Math.min(scannedMinSeq, seq);
          }

          if (!this.isEligible(m)) continue;
          total++;
          if (allowPreviewFill && this.items.length < this.previewLimit) {
            const thumb = this.buildThumbFromMessage(m);
            if (thumb) {
              this.items.push({
                messageID: String(m.messageID || ""),
                timestamp: m.timestamp || 0,
                thumb,
              });
            }
          }

          if (total >= this.countCap) {
            break;
          }
        }
      };

      // 先拉一页最新消息：用于预览 + 初始化扫描游标
      const first = await this.syncMessages({ limit: pageSize });
      const firstMsgs = Array.isArray(first) ? first : first?.messages || [];
      processBatch(firstMsgs, true);
      this.notifyListener();

      // 再向更早消息逐页扫描统计
      let guard = 0;
      while (total < this.countCap && scannedMinSeq && scannedMinSeq > 1 && guard < 60) {
        guard++;
        const res = await this.syncMessages({
          limit: pageSize,
          pullMode: PullMode.Down,
          startMessageSeq: scannedMinSeq - 1,
        });
        const msgs = Array.isArray(res) ? res : res?.messages || [];
        if (!msgs || msgs.length === 0) {
          break;
        }
        processBatch(msgs, this.items.length < this.previewLimit);
        if (msgs.some((m: any) => (m as any)?.messageSeq === 1)) {
          break;
        }
      }

      if (total >= this.countCap) {
        this.countText = `${this.countCap}+`;
      } else if (guard >= 60 && scannedMinSeq && scannedMinSeq > 1) {
        // 扫描次数达到上限但仍未到最早消息：给出“至少”提示
        this.countText = `${total}+`;
      } else {
        this.countText = `${total}`;
      }
    } finally {
      this.loading = false;
      this.notifyListener();
    }
  }
}
