import { Component, ReactNode } from "react";
import Provider from "../../Service/Provider";
import { SubscriberListVM } from "./list_vm";
import React from "react";
import { IconSearchStroked } from "@douyinfe/semi-icons";
import "./list.css";
import WKApp from "../../App";
import WKSDK, { Channel, ChannelTypePerson, Subscriber } from "wukongimjssdk";
import WKAvatar from "../WKAvatar";
import { Checkbox } from "@douyinfe/semi-ui/lib/es/checkbox";
import { Toast } from "@douyinfe/semi-ui";
import { GroupRole } from "../../Service/Const";
import { ForbiddenTimeOption } from "../../Service/DataSource/DataSource";

export interface SubscriberListProps {
  channel: Channel;
  canSelect?: boolean; // 是否支持多选
  disableSelectList?: string[]; // 禁选列表
  onSelect?: (items: Subscriber[]) => void;
  display?: boolean; // 是否展示成员(包含虚拟成员)
  myRole?: number; // 当前用户群内角色
}

export interface SubscriberListState {
  selectedList: Subscriber[];
}

export class SubscriberList extends Component<
  SubscriberListProps,
  SubscriberListState
> {
  private forbiddenTimes?: ForbiddenTimeOption[];
  private forbiddenTimesLoading: boolean = false;

  constructor(props: SubscriberListProps) {
    super(props);
    this.state = {
      selectedList: [],
    };
  }

  onSearch = (v: string, vm: SubscriberListVM) => {
    vm.search(v);
  };

  handleScroll = (e: React.UIEvent<HTMLDivElement>, vm: SubscriberListVM) => {
    const target = e.target as HTMLDivElement;
    const offset = 200;
    if (
      target.scrollTop + target.clientHeight + offset >=
      target.scrollHeight
    ) {
      console.log("到底了");
      vm.loadMoreSubscribersIfNeed();
    }
  };

  // 获取显示名称
  getShowName = (subscriber: Subscriber) => {
    // 优先显示个人备注
    const channelInfo = WKSDK.shared().channelManager.getChannelInfo(
      new Channel(subscriber.uid, ChannelTypePerson)
    );
    if (
      channelInfo &&
      channelInfo.orgData.remark &&
      channelInfo.orgData.remark.trim() !== ""
    ) {
      return channelInfo.orgData.remark;
    }

    // 其次显示群内备注
    if (subscriber.remark && subscriber.remark.trim() !== "") {
      return subscriber.remark;
    }

    // 最后显示昵称
    return subscriber.name;
  };

  onItemClick = (subscriber: Subscriber) => {
    const { canSelect } = this.props;
    if (!canSelect) {
      WKApp.shared.baseContext.showUserInfo(subscriber.uid, this.props.channel);
      return;
    }
    if (this.isVirtualSubscriber(subscriber)) {
      Toast.warning("展示成员不可操作");
      return;
    }
    this.checkItem(subscriber);
  };

  isVirtualSubscriber(subscriber: Subscriber) {
    const raw = subscriber.orgData?.is_virtual ?? subscriber.orgData?.isVirtual;
    if (raw === 1 || raw === true || raw === "1") {
      return true;
    }
    const robot = subscriber.orgData?.robot ?? subscriber.orgData?.is_robot;
    return robot === 1 || robot === true || robot === "1";
  }

  getMyRole(subscribers: Subscriber[]): number {
    if (this.props.myRole !== undefined && this.props.myRole !== null) {
      return this.props.myRole;
    }
    const myUID = WKApp.loginInfo.uid;
    if (!myUID) {
      return GroupRole.normal;
    }
    const me = subscribers.find((s) => String(s.uid) === String(myUID));
    return me?.role ?? GroupRole.normal;
  }

  getForbiddenExpirTime(subscriber: Subscriber): number {
    const raw =
      subscriber.orgData?.forbidden_expir_time ??
      subscriber.orgData?.forbiddenExpirTime;
    if (!raw) return 0;
    const value = typeof raw === "string" ? parseInt(raw, 10) : raw;
    return value || 0;
  }

  isForbidden(subscriber: Subscriber): boolean {
    const expire = this.getForbiddenExpirTime(subscriber);
    if (!expire) return false;
    const now = Math.floor(Date.now() / 1000);
    return expire > now;
  }

  canOperateMember(subscriber: Subscriber, myRole: number): boolean {
    if (myRole !== GroupRole.owner && myRole !== GroupRole.manager) {
      return false;
    }
    if (this.isVirtualSubscriber(subscriber)) {
      return false;
    }
    const myUID = WKApp.loginInfo.uid;
    if (myUID && String(subscriber.uid) === String(myUID)) {
      return false;
    }
    if (subscriber.role === GroupRole.owner) {
      return false;
    }
    if (myRole === GroupRole.manager && subscriber.role === GroupRole.manager) {
      return false;
    }
    return true;
  }

  getForbiddenSecondsByKey(key: number): number {
    switch (key) {
      case 1:
        return 60;
      case 2:
        return 60 * 10;
      case 3:
        return 60 * 60;
      case 4:
        return 60 * 60 * 24;
      case 5:
        return 60 * 60 * 24 * 7;
      case 6:
        return 60 * 60 * 24 * 30;
      default:
        return 0;
    }
  }

  async ensureForbiddenTimes(): Promise<ForbiddenTimeOption[]> {
    if (this.forbiddenTimes && this.forbiddenTimes.length > 0) {
      return this.forbiddenTimes;
    }
    if (this.forbiddenTimesLoading) {
      return new Promise((resolve) => {
        const timer = window.setInterval(() => {
          if (!this.forbiddenTimesLoading) {
            window.clearInterval(timer);
            resolve(this.forbiddenTimes || []);
          }
        }, 100);
      });
    }
    this.forbiddenTimesLoading = true;
    try {
      const list = await WKApp.dataSource.channelDataSource.forbiddenTimes();
      this.forbiddenTimes = list || [];
      return this.forbiddenTimes;
    } catch (err: any) {
      Toast.error(err?.msg || "获取禁言时长失败");
      return [];
    } finally {
      this.forbiddenTimesLoading = false;
    }
  }

  async openForbiddenModal(subscriber: Subscriber) {
    const options = await this.ensureForbiddenTimes();
    if (!options || options.length === 0) {
      return;
    }
    WKApp.shared.baseContext.showGlobalModal({
      width: "420px",
      closable: true,
      onCancel: () => {
        WKApp.shared.baseContext.hideGlobalModal();
      },
      body: (
        <div className="wk-forbidden-modal">
          <div className="wk-forbidden-modal-title">选择禁言时长</div>
          <div className="wk-forbidden-modal-options">
            {options.map((opt) => (
              <div
                key={opt.key}
                className="wk-forbidden-modal-option"
                onClick={async () => {
                  await this.forbiddenMember(subscriber, opt.key);
                }}
              >
                {opt.text}
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }

  async forbiddenMember(subscriber: Subscriber, key: number) {
    try {
      await WKApp.dataSource.channelDataSource.forbiddenWithMember(
        this.props.channel,
        {
          memberUID: subscriber.uid,
          action: 1,
          key: key,
        }
      );
      const seconds = this.getForbiddenSecondsByKey(key);
      const now = Math.floor(Date.now() / 1000);
      subscriber.orgData = subscriber.orgData || {};
      subscriber.orgData.forbidden_expir_time = now + seconds;
      this.forceUpdate();
      WKApp.shared.baseContext.hideGlobalModal();
      Toast.success("已禁言");
    } catch (err: any) {
      Toast.error(err?.msg || "禁言失败");
    }
  }

  async unForbiddenMember(subscriber: Subscriber) {
    try {
      await WKApp.dataSource.channelDataSource.forbiddenWithMember(
        this.props.channel,
        {
          memberUID: subscriber.uid,
          action: 0,
        }
      );
      subscriber.orgData = subscriber.orgData || {};
      subscriber.orgData.forbidden_expir_time = 0;
      this.forceUpdate();
      Toast.success("已解除禁言");
    } catch (err: any) {
      Toast.error(err?.msg || "解除禁言失败");
    }
  }

  isDisableItem(id: string) {
    const { disableSelectList } = this.props;
    if (disableSelectList && disableSelectList.length > 0) {
      for (const disableSelect of disableSelectList) {
        if (disableSelect === id) {
          return true;
        }
      }
    }
    return false;
  }

  isCheckItem(item: Subscriber) {
    const { selectedList } = this.state;
    for (const selected of selectedList) {
      if (selected.uid === item.uid) {
        return true;
      }
    }
    return false;
  }

  checkItem(item: Subscriber) {
    const { selectedList } = this.state;
    const { onSelect } = this.props;
    let newSelectedList = selectedList;
    let found = -1;
    for (let index = 0; index < newSelectedList.length; index++) {
      const selected = newSelectedList[index];
      if (selected.uid === item.uid) {
        found = index;
        break;
      }
    }
    if (found >= 0) {
      newSelectedList.splice(found, 1);
    } else {
      newSelectedList = [item, ...selectedList];
    }

    this.setState({
      selectedList: newSelectedList,
    });
    if (onSelect) {
      onSelect(newSelectedList);
    }
  }

  getRoleName = (item: Subscriber) => {
    if (item.role === GroupRole.owner) {
      return "群主";
    } else if (item.role === GroupRole.manager) {
      return "管理员";
    } else {
      return "";
    }
  };

  render() {
    const { canSelect } = this.props;
    return (
      <Provider
        create={() => {
          return new SubscriberListVM(this.props.channel, this.props.display);
        }}
        render={(vm: SubscriberListVM) => {
          const myRole = this.getMyRole(vm.subscribers);
          return (
            <div
              className="wk-subscrierlist"
              onScroll={(e) => {
                this.handleScroll(e, vm);
              }}
            >
              <div className="wk-indextable-search-box">
                <div className="wk-indextable-search-icon">
                  <IconSearchStroked
                    style={{ color: "#bbbfc4", fontSize: "20px" }}
                  />
                </div>
                <div className="wk-indextable-search-input">
                  <input
                    onChange={(v) => {
                      this.onSearch(v.target.value, vm);
                    }}
                    placeholder={"搜索"}
                    ref={(rf) => {}}
                    type="text"
                    style={{ fontSize: "17px" }}
                  />
                </div>
              </div>
              <div className="wk-subscrierlist-list">
                {vm.subscribers.map((item) => {
                  const canOperate = !canSelect && this.canOperateMember(item, myRole);
                  const isForbidden = this.isForbidden(item);
                  return (
                    <div
                      className="wk-subscrierlist-list-item"
                      key={item.uid}
                      onClick={() => {
                        this.onItemClick(item);
                      }}
                    >
                      {canSelect ? (
                        <div className="wk-indextable-checkbox">
                          <Checkbox
                            checked={
                              this.isDisableItem(item.uid) ||
                              this.isCheckItem(item)
                            }
                            disabled={
                              this.isDisableItem(item.uid) ||
                              this.isVirtualSubscriber(item)
                            }
                          ></Checkbox>
                        </div>
                      ) : undefined}
                      <div className="wk-subscrierlist-item-avatar">
                        <WKAvatar src={item.avatar}></WKAvatar>
                      </div>
                      <div className="wk-subscrierlist-item-content">
                        <div className="wk-subscrierlist-item-name">
                          {this.getShowName(item)}
                        </div>
                        <div
                          className="wk-subscrierlist-item-actions"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {this.getRoleName(item) ? (
                            <span className="wk-subscrierlist-item-role">
                              {this.getRoleName(item)}
                            </span>
                          ) : undefined}
                          {canOperate ? (
                            isForbidden ? (
                              <span
                                className="wk-subscrierlist-item-action wk-subscrierlist-item-action-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.unForbiddenMember(item);
                                }}
                              >
                                解除禁言
                              </span>
                            ) : (
                              <span
                                className="wk-subscrierlist-item-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  this.openForbiddenModal(item);
                                }}
                              >
                                禁言
                              </span>
                            )
                          ) : undefined}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      ></Provider>
    );
  }
}
