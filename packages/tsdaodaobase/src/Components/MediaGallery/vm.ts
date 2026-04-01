import { Channel, PullMode } from "wukongimjssdk";
import WKApp from "../../App";
import { SyncMessageOptions } from "../../Service/DataSource/DataProvider";
import { ProviderListener } from "../../Service/Provider";

export type MediaType = "image" | "video";

export interface MediaMessageItem {
  messageID: string;
  clientMsgNo?: string;
  timestamp: number;
  fromUID?: string;
  contentType: number;
  content?: any;
  messageSeq?: number;
  // 保留原始 message（用于已读/转发/删除等，避免重复拉取）
  raw?: any;
}

function uniqueByMessageID(items: MediaMessageItem[]): MediaMessageItem[] {
  const seen = new Set<string>();
  const result: MediaMessageItem[] = [];
  for (const item of items) {
    const key = item.messageID || item.clientMsgNo || "";
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export default class MediaGalleryVM extends ProviderListener {
  channel!: Channel;
  mediaType!: MediaType;
  contentTypes: number[] = [];

  limit = 200;
  loading = false;
  loadingMoreOlder = false;
  loadingMoreNewer = false;
  loadFinishOlder = false;
  loadFinishNewer = false;

  items: MediaMessageItem[] = [];

  // 游标（消息序号）
  private scannedMinSeq?: number;
  private scannedMaxSeq?: number;

  constructor(channel: Channel, mediaType: MediaType, contentTypes: number[]) {
    super();
    this.channel = channel;
    this.mediaType = mediaType;
    this.contentTypes = contentTypes;
  }

  didMount(): void {
    // noop
  }

  init() {
    this.items = [];
    this.loading = false;
    this.loadingMoreOlder = false;
    this.loadingMoreNewer = false;
    this.loadFinishOlder = false;
    this.loadFinishNewer = false;

    this.scannedMinSeq = undefined;
    this.scannedMaxSeq = undefined;
    this.notifyListener();
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
    if (!this.contentTypes.includes(msg.contentType)) return false;
    if (this.isDeleted(msg) || this.isRevoked(msg)) return false;
    return true;
  }

  private toItems(messages: any[]): MediaMessageItem[] {
    if (!messages || messages.length === 0) return [];
    return messages
      .filter((m: any) => this.isEligible(m))
      .map((m: any) => {
        const item: MediaMessageItem = {
          messageID: String(m.messageID || ""),
          clientMsgNo: m.clientMsgNo,
          timestamp: m.timestamp || 0,
          fromUID: m.fromUID,
          contentType: m.contentType,
          content: m.content,
          messageSeq: m.messageSeq,
          raw: m,
        };
        return item;
      })
      .filter((m: MediaMessageItem) => !!m.messageID && !!m.timestamp);
  }

  private updateScannedRange(messages: any[]) {
    if (!messages || messages.length === 0) return;
    let minSeq: number | undefined;
    let maxSeq: number | undefined;
    for (const m of messages) {
      const seq = (m as any)?.messageSeq;
      if (typeof seq !== "number" || !seq) continue;
      if (minSeq === undefined || seq < minSeq) minSeq = seq;
      if (maxSeq === undefined || seq > maxSeq) maxSeq = seq;
    }
    if (minSeq !== undefined) {
      this.scannedMinSeq = this.scannedMinSeq === undefined ? minSeq : Math.min(this.scannedMinSeq, minSeq);
    }
    if (maxSeq !== undefined) {
      this.scannedMaxSeq = this.scannedMaxSeq === undefined ? maxSeq : Math.max(this.scannedMaxSeq, maxSeq);
    }
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
    // 统一使用应用侧的 conversationProvider：和聊天页拉消息链路一致
    return WKApp.conversationProvider.syncMessages(this.channel, opts);
  }

  async initialLoad() {
    this.init();
    this.loading = true;
    this.notifyListener();

    try {
      const msgs = (await this.syncMessages({ limit: this.limit })) || [];
      this.updateScannedRange(msgs);
      const list = uniqueByMessageID(this.toItems(msgs));
      list.sort((a, b) => (b.messageSeq || 0) - (a.messageSeq || 0));
      this.items = list;
      // 如果这次已经扫到最早的消息，则标记到底
      if (msgs.some((m: any) => (m as any)?.messageSeq === 1)) {
        this.loadFinishOlder = true;
      }
    } finally {
      this.loading = false;
      this.notifyListener();
    }
  }

  async loadMoreOlder() {
    if (this.loadingMoreOlder || this.loadFinishOlder) return;
    this.loadingMoreOlder = true;
    this.notifyListener();

    try {
      if (!this.scannedMinSeq || this.scannedMinSeq <= 1) {
        this.loadFinishOlder = true;
        return;
      }
      const msgs =
        (await this.syncMessages({
          limit: this.limit,
          pullMode: PullMode.Down,
          startMessageSeq: this.scannedMinSeq - 1,
        })) || [];
      if (!msgs || msgs.length === 0) {
        this.loadFinishOlder = true;
        return;
      }
      this.updateScannedRange(msgs);
      const older = this.toItems(msgs);
      const merged = uniqueByMessageID([...this.items, ...older]);
      merged.sort((a, b) => (b.messageSeq || 0) - (a.messageSeq || 0));
      this.items = merged;
      if (msgs.some((m: any) => (m as any)?.messageSeq === 1)) {
        this.loadFinishOlder = true;
      }
    } finally {
      this.loadingMoreOlder = false;
      this.notifyListener();
    }
  }

  async loadMoreNewer() {
    if (this.loadingMoreNewer || this.loadFinishNewer) return;
    this.loadingMoreNewer = true;
    this.notifyListener();

    try {
      if (!this.scannedMaxSeq) {
        this.loadFinishNewer = true;
        return;
      }
      const msgs =
        (await this.syncMessages({
          limit: this.limit,
          pullMode: PullMode.Up,
          startMessageSeq: this.scannedMaxSeq,
        })) || [];
      if (!msgs || msgs.length === 0) {
        this.loadFinishNewer = true;
        return;
      }
      this.updateScannedRange(msgs);
      const newer = this.toItems(msgs);
      const merged = uniqueByMessageID([...newer, ...this.items]);
      merged.sort((a, b) => (b.messageSeq || 0) - (a.messageSeq || 0));
      this.items = merged;
    } finally {
      this.loadingMoreNewer = false;
      this.notifyListener();
    }
  }

  // 帮助：确保某个 messageID 在列表里（用于从消息气泡点开时定位）
  async ensureContains(messageID: string) {
    if (!messageID) return;
    if (this.items.find((it) => it.messageID === messageID)) return;
    // 逐页往更早消息扫描，直到包含目标或到底
    let guard = 0;
    while (!this.items.find((it) => it.messageID === messageID) && !this.loadFinishOlder && guard < 30) {
      guard++;
      await this.loadMoreOlder();
    }
  }
}
