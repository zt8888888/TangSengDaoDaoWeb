import WKSDK, { Channel, ChannelTypePerson, Subscriber } from "wukongimjssdk";
import React from "react";
import { Component } from "react";
import Provider from "../../Service/Provider";
import WKApp from "../../App";
import "./index.css";
import { SubscribersVM } from "./vm";
import WKBase, { WKBaseContext } from "../WKBase";
import RouteContext, { RouteContextConfig } from "../../Service/Context";
import { SubscriberList } from "./list";
import { GroupRole } from "../../Service/Const";

export interface SubscribersProps {
  context: RouteContext<any>;
  channel: any;
  visible?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
}

export class Subscribers extends Component<SubscribersProps> {
  baseContext!: WKBaseContext;
  private vm?: SubscribersVM;

  componentDidMount(): void {
    if (this.props.visible) {
      this.vm?.onVisibleChange(true);
    }
  }

  componentDidUpdate(prevProps: Readonly<SubscribersProps>): void {
    if (!prevProps.visible && this.props.visible) {
      this.vm?.onVisibleChange(true);
    }
  }

  getRoleLabel(subscriber: Subscriber) {
    if (subscriber.role === GroupRole.owner) {
      return "创建者";
    }
    if (subscriber.role === GroupRole.manager) {
      return "管理员";
    }
    return "";
  }

  getShowName(subscriber: Subscriber) {
    return subscriber.remark || subscriber.name;
  }

  getLastSeenAt(subscriber: Subscriber) {
    const raw =
      subscriber.orgData?.lastSeenAt ||
      subscriber.orgData?.last_seen_at ||
      subscriber.orgData?.last_seen;
    if (!raw) {
      return 0;
    }
    const value = typeof raw === "string" ? parseInt(raw, 10) : raw;
    if (!value) {
      return 0;
    }
    return value > 1e12 ? Math.floor(value / 1000) : value;
  }

  isOnline(subscriber: Subscriber) {
    // 优先使用本地 ChannelInfo 的在线状态（由 onlineStatus 推送更新）
    try {
      const channelInfo = WKSDK.shared().channelManager.getChannelInfo(
        new Channel(subscriber.uid, ChannelTypePerson)
      );
      if (channelInfo && typeof channelInfo.online === "boolean") {
        return channelInfo.online;
      }
    } catch {
      // ignore
    }

    // 兼容后端/SDK 可能返回的 online 字段：1/0、true/false、"1"/"0"、"online"/"offline"、"在线"/"离线"
    const onlineRaw = subscriber.orgData?.online;
    if (onlineRaw === 1 || onlineRaw === true) return true;
    if (onlineRaw === 0 || onlineRaw === false) return false;
    if (typeof onlineRaw === "string") {
      const v = onlineRaw.trim().toLowerCase();
      if (v === "1" || v === "true" || v === "online" || v === "在线") return true;
      if (v === "0" || v === "false" || v === "offline" || v === "离线") return false;
    }

    const lastSeenAt = this.getLastSeenAt(subscriber);
    if (!lastSeenAt) {
      return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return now - lastSeenAt < 60;
  }

  formatLastSeen(subscriber: Subscriber) {
    if (this.isOnline(subscriber)) {
      return "在线";
    }
    const lastSeenAt = this.getLastSeenAt(subscriber);
    if (!lastSeenAt) {
      return "离线";
    }
    const now = Math.floor(Date.now() / 1000);
    const diff = Math.max(0, now - lastSeenAt);
    if (diff < 60) {
      return "刚刚";
    }
    if (diff < 60 * 60) {
      return `${Math.floor(diff / 60)}分钟前`;
    }
    if (diff < 60 * 60 * 24) {
      return `${Math.floor(diff / 3600)}小时前`;
    }
    return `${Math.floor(diff / 86400)}天前`;
  }

  subscriberUI(subscriber: Subscriber) {
    return (
      <div
        key={subscriber.uid}
        className="wk-subscribers-row"
        onClick={() => {
          const vercode = subscriber.orgData?.vercode;
          WKApp.shared.baseContext.showUserInfo(
            subscriber.uid,
            subscriber.channel,
            vercode
          );
        }}
      >
        <div className="wk-subscribers-avatar">
          <img src={WKApp.shared.avatarUser(subscriber.uid)} alt="" />
          <span
            className={
              this.isOnline(subscriber)
                ? "wk-subscribers-online"
                : "wk-subscribers-offline"
            }
          ></span>
        </div>
        <div className="wk-subscribers-info">
          <div className="wk-subscribers-name">{this.getShowName(subscriber)}</div>
          <div className="wk-subscribers-status">
            {this.formatLastSeen(subscriber)}
          </div>
        </div>
        {this.getRoleLabel(subscriber) ? (
          <div className="wk-subscribers-role">{this.getRoleLabel(subscriber)}</div>
        ) : undefined}
      </div>
    );
  }

  render() {
    const { context, onAdd, onRemove, channel } = this.props;
    return (
      <Provider
        create={() => {
          return new SubscribersVM(context);
        }}
        render={(vm: SubscribersVM) => {
          this.vm = vm;
          return (
            <WKBase
              onContext={(baseContext) => {
                this.baseContext = baseContext;
              }}
            >
              <div className="wk-subscribers">
                <div className="wk-subscribers-header">
                  <div className="wk-subscribers-header-title">
                    {vm.totalMemberCount}位成员
                  </div>
                  <div className="wk-subscribers-header-actions">
                    {vm.showAdd() ? (
                      onAdd ? (
                        <div
                          className="wk-subscribers-action-btn wk-subscribers-action-btn-add"
                          title="添加群成员"
                          onClick={() => {
                            onAdd();
                          }}
                        >
                          +
                        </div>
                      ) : (
                        WKApp.endpoints.organizationalTool(
                          channel,
                          <div className="wk-subscribers-action-btn wk-subscribers-action-btn-add" title="添加群成员">+</div>
                        )
                      )
                    ) : undefined}
                      {vm.showRemove() ? (
                        onRemove ? (
                          <div
                            className="wk-subscribers-action-btn wk-subscribers-action-btn-remove"
                            title="删除群成员"
                            onClick={() => {
                              onRemove();
                            }}
                          >
                            −
                          </div>
                        ) : undefined
                      ) : undefined}
                  </div>
                </div>
                <div className="wk-subscribers-list">
                  {vm.sortedSubscribersTop.map((subscriber) => {
                    return this.subscriberUI(subscriber);
                  })}
                </div>
                {vm.hasMoreSubscribers() ? (
                  <div
                    className="wk-subscribers-more"
                    onClick={() => {
                      context.push(
                        <SubscriberList
                          channel={channel}
                          display={true}
                          myRole={vm.routeData?.subscriberOfMe?.role}
                        ></SubscriberList>,
                        new RouteContextConfig({
                          title: "成员列表",
                        })
                      );
                    }}
                  >
                    查看更多群成员
                  </div>
                ) : undefined}
              </div>
            </WKBase>
          );
        }}
      ></Provider>
    );
  }
}
