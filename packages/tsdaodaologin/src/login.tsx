import axios from "axios";
import React, { Component } from "react";
import { Button, Spin, Toast, Modal } from '@douyinfe/semi-ui';
import './login.css'
import QRCode from 'qrcode.react';
import { WKApp, Provider } from "@tsdaodao/base"
import { LoginStatus, LoginType, LoginVM } from "./login_vm";
import classNames from "classnames";

type LoginState = {
    loginStatus: string
    loginUUID: string
    getLoginUUIDLoading: boolean
    scanner?: string  // 扫描者的uid
    qrcode?: string
    registerVisible: boolean // 注册弹窗显示
    registerName?: string
    registerPassword?: string
    registerNickName?: string
}

class Login extends Component<any, LoginState> {

    constructor(props: any) {
        super(props);
        this.state = {
            loginStatus: "",
            loginUUID: "",
            getLoginUUIDLoading: false,
            registerVisible: false
        }
    }




    render() {

        return <Provider create={() => {
            return new LoginVM()
        }} render={(vm: LoginVM) => {
            const doLogin = async () => {
                if (vm.loginLoading) {
                    return
                }
                if (!vm.username) {
                    Toast.error("用户名不能为空！")
                    return
                }
                if (!vm.password) {
                    Toast.error("密码不能为空！")
                    return
                }
                vm.requestLoginWithUsernameAndPwd(vm.username, vm.password).catch((err) => {
                    Toast.error(err.msg)
                })
            }
            return <div className="wk-login">
                <div className="wk-login-content">
                    <div className="wk-login-content-phonelogin" style={{ "display": vm.loginType === LoginType.phone ? "block" : "none" }}>
                        <div className="wk-login-content-logo">
                            <img src={require("./assets/logo.png")} alt=""></img>
                        </div>
                        <div className="wk-login-content-slogan">
                            更愉快的与朋友交流
                        </div>
                        <div className="wk-login-content-form">
                            <input type="text" placeholder="用户名" onChange={(v) => {
                                vm.username = v.target.value
                            }} onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    void doLogin()
                                }
                            }}></input>
                            <input type="password" placeholder="密码" onChange={(v) => {
                                vm.password = v.target.value
                            }} onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    void doLogin()
                                }
                            }}></input>
                            <div className="wk-login-content-form-buttons">
                                <Button loading={vm.loginLoading} className="wk-login-content-form-ok" type='primary' theme='solid' onClick={async () => {
                                    await doLogin()
                                }}>登录</Button>
                            </div>
                            <div className="wk-login-content-form-others">
                                <span className="wk-login-content-form-scanlogin" onClick={() => {
                                    this.setState({
                                        registerVisible: true
                                    })
                                }}>
                                    注册账号
                                </span>
                                <span style={{margin:'0 10px', color:'#e0e0e0'}}>|</span>
                                <span className="wk-login-content-form-scanlogin" onClick={() => {
                                    vm.loginType = LoginType.qrcode
                                }}>
                                    扫描登录
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={classNames("wk-login-content-scanlogin", vm.loginType === LoginType.qrcode ? "wk-login-content-scanlogin-show" : undefined)}>
                        <Spin size="large" spinning={vm.qrcodeLoading}>
                            <div className="wk-login-content-scanlogin-qrcode">
                                {
                                    vm.qrcodeLoading || !vm.qrcode ? undefined : <QRCode value={vm.qrcode} size={280} fgColor={WKApp.config.themeColor}></QRCode>
                                }
                                {
                                    <div className={classNames("wk-login-content-scanlogin-qrcode-avatar", vm.showAvatar() ? "wk-login-content-scanlogin-qrcode-avatar-show" : undefined)}>
                                        {vm.showAvatar() ? <img src={WKApp.shared.avatarUser(vm.uid!)}></img> : undefined}
                                    </div>
                                }
                                {
                                    !vm.autoRefresh ? <div className="wk-login-content-scanlogin-qrcode-expire">
                                        <p>二维码已失效，点击刷新</p>
                                        <img onClick={() => {
                                            vm.reStartAdvance()
                                        }} src={require("./assets/refresh.png")}></img>
                                    </div> : undefined
                                }
                            </div>
                        </Spin>
                        <div className="wk-login-content-scanlogin-qrcode-title">
                            <h3>使用手机{WKApp.config.appName}扫码登录</h3>
                        </div>
                        <div className="wk-login-content-scanlogin-qrcode-desc">
                            <ul>
                                <li>
                                    在手机上打开{WKApp.config.appName}
                                </li>
                                <li>
                                    进入 <b>消息</b> &nbsp; &gt; &nbsp; <b>+</b>  &nbsp; &gt; &nbsp;<b>扫一扫</b>
                                </li>
                                <li>
                                    将你的手机摄像头对准上面二维码进行扫描
                                </li>
                                <li>
                                    在手机上确认登录
                                </li>
                            </ul>
                        </div>
                        <div className="wk-login-footer-buttons">
                            <button onClick={() => {
                                vm.loginType = LoginType.phone
                            }}>使用用户名登录</button>
                        </div>

                    </div>

                    <div className="wk-login-footer">
                        <ul>
                            <li style={{ cursor: 'pointer' }} onClick={() => {
                                let url = WKApp.apiClient.config.apiURL
                                if (url.indexOf("v1") !== -1) {
                                    url = url.replace("v1/", "web/privacy_policy.html")
                                } else {
                                    url = url + "web/privacy_policy.html"
                                }
                                window.open(url)
                            }}>隐私政策</li>
                            <li style={{ cursor: 'pointer' }} onClick={() => {
                                let url = WKApp.apiClient.config.apiURL
                                if (url.indexOf("v1") !== -1) {
                                    url = url.replace("v1/", "web/user_agreement.html")
                                } else {
                                    url = url + "web/user_agreement.html"
                                }
                                window.open(url)
                            }}>用户协议</li>
                            <li> © 裕民心安</li>
                        </ul>

                    </div>
                </div>
                <Modal centered title="注册账号" visible={this.state.registerVisible} onOk={() => {
                    if(!this.state.registerName) {
                        Toast.error("请输入用户名")
                        return
                    }
                    if(!this.state.registerNickName) {
                        Toast.error("请输入昵称")
                        return
                    }
                    if(!this.state.registerPassword) {
                        Toast.error("请输入密码")
                        return
                    }
                    vm.requestRegister(this.state.registerName, this.state.registerPassword, this.state.registerNickName).then(()=>{
                        Toast.success("注册成功")
                        this.setState({
                            registerVisible: false
                        })
                    }).catch((err)=>{
                        Toast.error(err.msg)
                    })
                }} onCancel={() => {
                    this.setState({
                        registerVisible: false
                    })
                }}>
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                        <input className="wk-login-input" placeholder="请输入用户名" onChange={(e)=>{
                            this.setState({
                                registerName: e.target.value
                            })
                        }}></input>
                        <input className="wk-login-input" placeholder="请输入昵称" onChange={(e)=>{
                            this.setState({
                                registerNickName: e.target.value
                            })
                        }}></input>
                        <input className="wk-login-input" type="password" placeholder="请输入密码" onChange={(e)=>{
                            this.setState({
                                registerPassword: e.target.value
                            })
                        }}></input>
                    </div>
                </Modal>

            </div>
        }}>

        </Provider>
    }
}

export default Login