import React, { Component } from "react";
import { Button, Spin } from "@douyinfe/semi-ui";
import { Channel } from "wukongimjssdk";
import Provider from "../../Service/Provider";
import WKApp from "../../App";
import MediaGallery from "../MediaGallery";
import MediaSummaryVM, { MediaSummaryType } from "./vm";
import "./index.css";

export interface MediaSummaryProps {
  channel: Channel;
  type: MediaSummaryType;
}

export default class MediaSummary extends Component<MediaSummaryProps> {
  vm!: MediaSummaryVM;

  private title(): string {
    return this.props.type === "image" ? "图片" : "视频";
  }

  private openAll() {
    const { channel, type } = this.props;
    WKApp.shared.baseContext.showGlobalModal({
      closable: false,
      className: "wk-base-modal",
      body: (
        <MediaGallery
          channel={channel}
          mediaType={type}
          onClose={() => {
            WKApp.shared.baseContext.hideGlobalModal();
          }}
        />
      ),
      width: "90%",
      height: "90%",
      onCancel: () => {
        WKApp.shared.baseContext.hideGlobalModal();
      },
    });
  }

  render() {
    const { channel, type } = this.props;

    return (
      <Provider
        create={() => {
          this.vm = new MediaSummaryVM(channel, type, { previewLimit: 6, countCap: 500 });
          return this.vm;
        }}
        render={(vm: MediaSummaryVM) => {
          return (
            <div className="wk-media-summary">
              <div className="wk-media-summary-head">
                <div className="wk-media-summary-title">{this.title()}</div>
                <div className="wk-media-summary-right">
                  {vm.loading ? (
                    <span className="wk-media-summary-count">
                      <Spin size="small" />
                    </span>
                  ) : (
                    <span className="wk-media-summary-count">{vm.countText}</span>
                  )}
                  <Button
                    size="small"
                    theme="borderless"
                    onClick={() => {
                      this.openAll();
                    }}
                  >
                    查看全部
                  </Button>
                </div>
              </div>

              {vm.items.length > 0 ? (
                <div className="wk-media-summary-grid">
                  {vm.items.map((it) => (
                    <div
                      key={it.messageID}
                      className="wk-media-summary-item"
                      onClick={() => {
                        // 直接定位打开
                        WKApp.shared.baseContext.showGlobalModal({
                          closable: false,
                          className: "wk-base-modal",
                          body: (
                            <MediaGallery
                              channel={channel}
                              mediaType={type}
                              focusMessageID={it.messageID}
                              focusTimestamp={it.timestamp}
                              onClose={() => {
                                WKApp.shared.baseContext.hideGlobalModal();
                              }}
                            />
                          ),
                          width: "90%",
                          height: "90%",
                          onCancel: () => {
                            WKApp.shared.baseContext.hideGlobalModal();
                          },
                        });
                      }}
                    >
                      <img alt="" src={it.thumb} />
                      {type === "video" ? <div className="wk-media-summary-badge">视频</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="wk-media-summary-empty">暂无</div>
              )}
            </div>
          );
        }}
      />
    );
  }
}
