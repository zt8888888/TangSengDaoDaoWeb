import { Modal } from "@douyinfe/semi-ui";
import { Channel } from "wukongimjssdk";
import React, { Component, HTMLProps, ReactNode } from "react";
import ConversationSelect from "../ConversationSelect";
import UserInfo from "../UserInfo";
import WKApp from "../../App";
import "./index.css";

export interface WKBaseState {
  showUserInfo?: boolean;
  userUID?: string;
  vercode?: string; // 加好友的验证码
  fromChannel?: Channel;
  showConversationSelect?: boolean;
  conversationSelectTitle?: string;
  showAlert?: boolean;
  alertContent?: string;
  alertTitle?: string;
  onAlertOk?: () => void;
  conversationSelectFinished?: (channel: Channel[]) => void;

  showGlobalModal?: boolean; // 显示全局弹窗
  globalModalOptions?: GlobalModalOptions;

  showJoinOrgInfo?: boolean;
  orgId?: string;
  orgCode?: string;
  orgUid?: string;
}

export class GlobalModalOptions {
  width?: string;
  height?: string;
  body?: ReactNode;
  footer?: ReactNode;
  className?: string;
  closable?: boolean;
  onCancel?: () => void;
}

function normalizeModalHeight(height?: string): string | undefined {
  if (!height) return undefined;
  const h = height.trim();
  // 调用方大量传 "90%" 这类值，但百分比高度在弹窗里经常不生效；这里按视口高度处理
  if (h.endsWith("%")) {
    const num = h.slice(0, -1).trim();
    if (num && !Number.isNaN(Number(num))) {
      return `${num}vh`;
    }
  }
  return h;
}

export interface WKBaseProps {
  children: React.ReactNode;
  onContext?: (context: WKBaseContext) => void;
}

export interface WKBaseContext {
  // 显示最近会话选择
  showConversationSelect(
    onFinished?: (channels: Channel[]) => void,
    title?: string
  ): void;

  // 显示用户信息
  showUserInfo(uid: string, fromChannel?: Channel, vercode?: string): void;
  // 隐藏用户信息
  hideUserInfo(): void;
  // 弹出提示框
  showAlert(conf: { content: string; title?: string; onOk?: () => void }): void;

  showGlobalModal(options: GlobalModalOptions): void;

  // 显示加入组织
  showJoinOrgInfo(org_id: string, uid: string, code: string): void;

  hideGlobalModal(): void;
}

export default class WKBase
  extends Component<WKBaseProps, WKBaseState>
  implements WKBaseContext
{
  private keydownListener?: (e: KeyboardEvent) => void;
  constructor(props: any) {
    super(props);
    this.state = {};
  }
  showUserInfo(uid: string, fromChannel?: Channel, vercode?: string): void {
    this.setState({
      showUserInfo: true,
      userUID: uid,
      fromChannel: fromChannel,
      vercode: vercode,
    });
  }

  showAlert(conf: {
    content: string;
    title?: string;
    onOk?: () => void;
  }): void {
    this.setState({
      alertContent: conf.content,
      alertTitle: conf.title,
      onAlertOk: conf.onOk,
      showAlert: true,
    });
  }

  showConversationSelect(
    onFinished?: (channels: Channel[]) => void,
    title?: string
  ) {
    this.setState({
      showConversationSelect: true,
      conversationSelectFinished: onFinished,
      conversationSelectTitle: title,
    });
  }

  hideUserInfo() {
    this.setState({
      showUserInfo: false,
      userUID: undefined,
      vercode: undefined,
    });
  }

  showGlobalModal(options: GlobalModalOptions) {
    this.setState({
      showGlobalModal: true,
      globalModalOptions: options,
    });
  }
  hideGlobalModal() {
    this.setState({
      showGlobalModal: false,
    });
  }

  componentDidMount() {
    const { onContext } = this.props;
    if (onContext) {
      onContext(this);
    }
    this.keydownListener = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (e.defaultPrevented) return;
      // 优先让弹窗自身处理 ESC（比如全局弹窗、会话选择等）
      if (
        this.state.showAlert ||
        this.state.showConversationSelect ||
        this.state.showGlobalModal ||
        this.state.showJoinOrgInfo
      ) {
        return;
      }
      if (this.state.showUserInfo) {
        e.preventDefault();
        e.stopPropagation();
        this.hideUserInfo();
        return;
      }

      // 聊天页面：按 ESC 退出当前会话，回到初始空白页
      if (WKApp.shared.openChannel) {
        e.preventDefault();
        e.stopPropagation();
        WKApp.shared.openChannel = undefined;
        try {
          WKApp.mittBus.emit("conversation.close");
        } catch {
          // ignore
        }
        try {
          WKApp.routeRight.popToRoot();
        } catch {
          // ignore
        }
        WKApp.shared.notifyListener();
      }
    };
    window.addEventListener("keydown", this.keydownListener, false);
  }

  componentWillUnmount() {
    if (this.keydownListener) {
      window.removeEventListener("keydown", this.keydownListener, false);
    }
  }

  cancelAlert() {
    this.setState({
      showAlert: false,
      alertContent: undefined,
      alertTitle: undefined,
      onAlertOk: undefined,
    });
  }

  showJoinOrgInfo(org_id: string, uid: string, code: string) {
    this.setState({
      showJoinOrgInfo: true,
      orgId: org_id,
      orgCode: code,
      orgUid: uid,
    });
  }

  render(): ReactNode {
    const {
      showUserInfo,
      userUID,
      fromChannel,
      vercode,
      showConversationSelect,
      conversationSelectTitle,
      conversationSelectFinished,
      onAlertOk,
      alertContent,
      alertTitle,
      showJoinOrgInfo,
      orgId,
      orgCode,
      orgUid,
    } = this.state;
    const baseURl = WKApp.apiClient.config.apiURL.replace("v1/", "");
    return (
      <div className="wk-base">
        {this.props.children}
        <Modal
          width={400}
          footer={null}
          closeIcon={<div></div>}
          className="wk-base-modal-userinfo wk-base-modal"
          visible={showUserInfo}
          mask={false}
          centered
          closeOnEsc={true}
          onCancel={() => {
            this.setState({
              showUserInfo: false,
              userUID: undefined,
            });
          }}
        >
          {userUID && userUID !== "" ? (
            <UserInfo
              fromChannel={fromChannel}
              vercode={vercode}
              uid={userUID}
              onClose={() => {
                this.setState({
                  showUserInfo: false,
                  userUID: undefined,
                });
              }}
            ></UserInfo>
          ) : undefined}
        </Modal>

        <Modal
          className="wk-base-modal"
          width={400}
          footer={null}
          visible={showConversationSelect}
          mask={false}
          onCancel={() => {
            this.setState({
              showConversationSelect: false,
            });
          }}
        >
          <ConversationSelect
            onFinished={(channels: Channel[]) => {
              this.setState({
                showConversationSelect: false,
              });
              if (conversationSelectFinished) {
                conversationSelectFinished(channels);
              }
            }}
            title={conversationSelectTitle}
          ></ConversationSelect>
        </Modal>

        <Modal
          title={alertTitle}
          visible={this.state.showAlert}
          onOk={() => {
            if (onAlertOk) {
              onAlertOk();
            }
            this.cancelAlert();
          }}
          onCancel={() => {
            this.cancelAlert();
          }}
          maskClosable={false}
        >
          {alertContent}
        </Modal>
        <Modal
          closable={this.state.globalModalOptions?.closable}
          className={this.state.globalModalOptions?.className}
          visible={this.state.showGlobalModal}
          width={this.state.globalModalOptions?.width}
          footer={this.state.globalModalOptions?.footer}
          onCancel={this.state.globalModalOptions?.onCancel}
        >
          <div style={{ height: normalizeModalHeight(this.state.globalModalOptions?.height) || "auto" }}>
            {this.state.globalModalOptions?.body}
          </div>
        </Modal>
        {/* 加入组织 */}
        <Modal
          visible={showJoinOrgInfo}
          width={400}
          title="加入组织"
          className="wk-base-modal-join-org"
          footer={null}
          mask={false}
          centered
          onCancel={() => {
            this.setState({
              showJoinOrgInfo: false,
              orgId: undefined,
              orgUid: undefined,
              orgCode: undefined,
            });
          }}
        >
          {orgId && orgUid && orgCode && (
            <iframe
              src={`${baseURl}web/join_org.html?org_id=${orgId}&uid=${orgUid}&code=${orgCode}`}
              style={{ width: "100%", height: "100%", border: "none" }}
            ></iframe>
          )}
        </Modal>
      </div>
    );
  }
}
