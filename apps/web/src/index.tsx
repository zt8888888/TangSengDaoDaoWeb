import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import  { BaseModule, WKApp } from '@tsdaodao/base';
import  { LoginModule } from '@tsdaodao/login';
import  { DataSourceModule } from '@tsdaodao/datasource';
import {ContactsModule} from '@tsdaodao/contacts';
import { GroupManagerModule } from '@tsdaodao/groupmanager';
import { AdvancedModule } from '@tsdaodao/advanced';
import { TRTCModule } from '@tsdaodao/rtc';

function setBootInfo(text: string) {
  try {
    const el = document.getElementById('boot-error');
    if (el) {
      el.textContent = text;
    }
  } catch {
    // ignore
  }
}

function showBootFallback() {
  try {
    const el = document.getElementById('boot-fallback');
    if (el) {
      el.style.display = 'block';
    }
  } catch {
    // ignore
  }
}

function markBootstrapped() {
  try {
    (window as any).__APP_BOOTSTRAPPED__ = true;
    const fb = document.getElementById('boot-fallback');
    if (fb) {
      fb.style.display = 'none';
    }
  } catch {
    // ignore
  }
}

const remoteApiURL = "https://api.xrtech.it.com/v1/"
const devApiURL = "/v1/"

if((window as any).__TAURI_IPC__) { // tauri环境
  console.log("tauri环境")
  WKApp.apiClient.config.apiURL = remoteApiURL
}else if((window as any)?.__POWERED_ELECTRON__){
  console.log("__POWERED_ELECTRON__环境")
  WKApp.apiClient.config.apiURL = remoteApiURL
}else{
  if(process.env.NODE_ENV === "development") {
    // 浏览器开发环境：走本地 devServer 代理，避免后端 CORS 配置影响调试
    WKApp.apiClient.config.apiURL = devApiURL
  }else {
    WKApp.apiClient.config.apiURL = "/api/v1/" // 正式环境地址 (通用打包镜像，用此相对地址),打包出来的镜像可以通过API_URL环境变量来修改API地址
  }
}

setBootInfo(
  [
    `href: ${window.location.href}`,
    `apiURL: ${WKApp.apiClient.config.apiURL || ''}`,
    `appVersion: ${process.env.REACT_APP_VERSION || '0.0.0'}`,
    `userAgent: ${navigator.userAgent}`,
    `time: ${new Date().toISOString()}`,
  ].join('\n')
)


WKApp.apiClient.config.tokenCallback = ()=> {
  return WKApp.loginInfo.token
}
WKApp.config.appVersion = `${process.env.REACT_APP_VERSION || "0.0.0"}`

// WebRTC ICE/TURN 配置（建议通过环境变量注入，避免写死到仓库）
try {
  const turnUrlsRaw = (process.env.REACT_APP_RTC_TURN_URLS || '').trim();
  const turnUsername = (process.env.REACT_APP_RTC_TURN_USERNAME || '').trim();
  const turnCredential = (process.env.REACT_APP_RTC_TURN_PASSWORD || '').trim();
  if (turnUrlsRaw && turnUsername && turnCredential) {
    const urls = turnUrlsRaw.split(',').map(s => s.trim()).filter(Boolean);
    (WKApp as any).config.rtcIceServers = [
      {
        urls: 'stun:stun1.l.google.com:19302',
      },
      {
        urls: urls.length === 1 ? urls[0] : urls,
        username: turnUsername,
        credential: turnCredential,
      },
    ];
  }
} catch {
  // ignore
}

WKApp.loginInfo.load() // 加载登录信息

WKApp.shared.registerModule(new BaseModule()); // 基础模块
WKApp.shared.registerModule(new DataSourceModule()) // 数据源模块
WKApp.shared.registerModule(new LoginModule()); // 登录模块
WKApp.shared.registerModule(new ContactsModule()); // 联系模块
WKApp.shared.registerModule(new GroupManagerModule()); // 群管理模块
WKApp.shared.registerModule(new AdvancedModule()); // 高级模块
WKApp.shared.registerModule(new TRTCModule()); // 音视频模块（腾讯云TRTC）

try {
  WKApp.shared.startup() // app启动
} catch (e: any) {
  setBootInfo(
    [
      `startup() crashed: ${e && e.message ? e.message : String(e)}`,
      '',
      `href: ${window.location.href}`,
      `apiURL: ${WKApp.apiClient.config.apiURL || ''}`,
      `appVersion: ${process.env.REACT_APP_VERSION || '0.0.0'}`,
      `userAgent: ${navigator.userAgent}`,
      `time: ${new Date().toISOString()}`,
    ].join('\n')
  )
  showBootFallback()
  throw e
}

// Initialize Electron notification bridge if running in Electron


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
markBootstrapped()
reportWebVitals();

