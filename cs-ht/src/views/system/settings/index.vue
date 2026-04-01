<template>
  <div class="p-4 min-h-[calc(100vh-100px)] relative pb-20">
    
    <div class="bg-box rounded-lg shadow-sm p-2 mb-4 sticky top-0 z-10 mx-[-16px] px-6 border-b border-full-d sm:mx-0 sm:px-2">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <el-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name">
          <template #label>
            <div class="flex items-center gap-2 px-2 py-1">
              <i :class="tab.icon" class="text-lg"></i>
              <span class="font-medium">{{ tab.label }}</span>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    
    <div class="space-y-4">
      <el-form 
        ref="formRef"
        :model="form" 
        label-position="top"
        class="w-full"
      >
        
        <div v-show="activeTab === 'basic'" class="animate-fade-in space-y-4">
          <div class="bg-box p-6 rounded-lg shadow-sm">
            <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">基础信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <el-form-item label="网站Logo" class="md:col-span-2">
                <input type="file" ref="logoInputRef" accept="image/*" class="hidden" @change="handleLogoChange" />
                <div class="flex items-start gap-4">
                  <div class="w-24 h-24 bg-g-50 rounded-lg flex items-center justify-center border border-dashed border-g-300 overflow-hidden">
                    <img v-if="form.logo" :src="form.logo" class="w-full h-full object-contain" />
                    <i v-else class="ri-image-line text-3xl text-g-400"></i>
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="flex gap-2">
                      <el-input v-model="form.logo" placeholder="Logo图片地址" class="flex-1" />
                      <el-button type="primary" @click="triggerLogoUpload" :loading="logoUploading">
                        <ArtSvgIcon icon="ri:upload-line" class="mr-1" />上传
                      </el-button>
                    </div>
                    <div class="text-xs text-g-400">建议尺寸: 200x200，用于WAP首页及登录弹窗显示</div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="网站名称">
                <el-input v-model="form.webtitle" placeholder="请输入网站名称" />
              </el-form-item>
              <el-form-item label="易记域名">
                <el-input v-model="form.sitedomain" placeholder="例如: 2015.com">
                  <template #prefix><ArtSvgIcon icon="ri:global-line" /></template>
                </el-input>
                <div class="text-xs text-g-400 mt-1">用于登录弹窗显示的易记网址</div>
              </el-form-item>
              <el-form-item label="关键词">
                <el-input v-model="form.keywords" placeholder="SEO关键词，用逗号分隔" />
              </el-form-item>
              <el-form-item label="网站描述" class="md:col-span-2">
                <el-input v-model="form.description" type="textarea" :rows="3" placeholder="网站描述信息" />
              </el-form-item>
              <el-form-item label="宣传文案" class="md:col-span-2">
                <el-input v-model="form.promo_texts" type="textarea" :rows="4" placeholder="登录弹窗宣传语，一行一条，例如：&#10;🥇全球游戏爱好者的最佳选择🥇&#10;🌈畅享多元化游戏娱乐体验🌈" />
                <div class="text-xs text-g-400 mt-1">登录/注册弹窗显示的宣传语，一行一条</div>
              </el-form-item>
              <el-form-item label="默认推荐码">
                <el-input v-model="form.defaulttjcode">
                  <template #prefix><ArtSvgIcon icon="ri:share-forward-line" /></template>
                </el-input>
                <div class="text-xs text-g-400 mt-1">仅针对散户注册显示</div>
              </el-form-item>
            </div>
          </div>

          <div class="bg-box p-6 rounded-lg shadow-sm">
            <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">悬浮图标</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <el-form-item label="悬浮图标" class="md:col-span-2">
                <input type="file" ref="floatIconInputRef" accept="image/*" class="hidden" @change="handleFloatIconChange" />
                <div class="flex items-start gap-4">
                  <div class="w-20 h-20 bg-g-50 rounded-lg flex items-center justify-center border border-dashed border-g-300 overflow-hidden">
                    <img v-if="form.float_icon" :src="form.float_icon" class="w-full h-full object-contain" />
                    <i v-else class="ri-gift-line text-2xl text-g-400"></i>
                  </div>
                  <div class="flex-1 space-y-2">
                    <div class="flex gap-2">
                      <el-input v-model="form.float_icon" placeholder="悬浮图标图片地址" class="flex-1" />
                      <el-button type="primary" @click="triggerFloatIconUpload" :loading="floatIconUploading">
                        <ArtSvgIcon icon="ri:upload-line" class="mr-1" />上传
                      </el-button>
                    </div>
                    <div class="text-xs text-g-400">建议尺寸: 140x140，用于WAP首页右侧悬浮显示</div>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="跳转链接" class="md:col-span-2">
                <el-input v-model="form.float_icon_link" placeholder="点击悬浮图标跳转的地址，如: /activity 或 https://example.com">
                  <template #prefix><ArtSvgIcon icon="ri:link" /></template>
                </el-input>
                <div class="text-xs text-g-400 mt-1">支持站内路径（如 /activity）或完整URL</div>
              </el-form-item>
            </div>
          </div>

          <div class="bg-box p-6 rounded-lg shadow-sm">
            <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">访问控制</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <el-form-item label="前台登录保护">
                <div class="flex items-center gap-2 p-3 bg-g-50 rounded border-full-d w-full">
                  <span>连续错误</span>
                  <el-input-number v-model="form.loginerrornum_q" :min="0" controls-position="right" class="!w-20" />
                  <span>次，锁定</span>
                  <el-input-number v-model="form.loginerrorclosetime_q" :min="0" controls-position="right" class="!w-20" />
                  <span>小时</span>
                </div>
              </el-form-item>
              
              <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="border-full-d rounded-lg p-4">
                  <div class="flex justify-between items-center mb-3">
                    <span class="font-medium text-g-700">IP 黑名单</span>
                    <el-switch v-model="form.ipblackisopen" :active-value="1" :inactive-value="0" />
                  </div>
                  <el-input v-model="form.ipblacklist" type="textarea" :rows="4" placeholder="一行一个IP地址" :disabled="!form.ipblackisopen" />
                </div>
                <div class="border-full-d rounded-lg p-4">
                  <div class="flex justify-between items-center mb-3">
                    <span class="font-medium text-g-700">IP 白名单</span>
                    <el-switch v-model="form.ipwhiteisopen" :active-value="1" :inactive-value="0" />
                  </div>
                  <el-input v-model="form.ipwhitelist" type="textarea" :rows="4" placeholder="一行一个IP地址" :disabled="!form.ipwhiteisopen" />
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div v-show="activeTab === 'operation'" class="animate-fade-in space-y-4">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div class="lg:col-span-2 bg-box p-6 rounded-lg shadow-sm">
              <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">财务规则</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <el-form-item label="提款开放时间">
                  <div class="flex items-center gap-2 w-full">
                    <el-time-picker v-model="form.tikuanstart" value-format="HH:mm" format="HH:mm" class="!flex-1" placeholder="开始" />
                    <span class="text-g-400">-</span>
                    <el-time-picker v-model="form.tikuanend" value-format="HH:mm" format="HH:mm" class="!flex-1" placeholder="结束" />
                  </div>
                </el-form-item>
                <el-form-item label="提款打码量 (%)">
                  <el-input-number v-model="form.damaliang" :min="0" :max="100" controls-position="right" class="w-full" />
                </el-form-item>
                
                <div class="md:col-span-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div class="text-sm font-bold text-primary mb-3">提款限额 (元)</div>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <el-form-item label="单笔最低" class="mb-0">
                      <el-input-number v-model="form.tikuanMin" :min="0" :controls="false" class="w-full" />
                    </el-form-item>
                    <el-form-item label="单笔最高" class="mb-0">
                      <el-input-number v-model="form.tikuanMax" :min="0" :controls="false" class="w-full" />
                    </el-form-item>
                    <el-form-item label="日累计限额" class="mb-0">
                      <el-input-number v-model="form.ritikuanxiane" :min="0" :controls="false" class="w-full" />
                    </el-form-item>
                    <el-form-item label="日提款次数" class="mb-0">
                      <el-input-number v-model="form.tikuannum" :min="0" :controls="false" class="w-full" />
                    </el-form-item>
                  </div>
                </div>

                <div class="md:col-span-2 p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div class="text-sm font-bold text-warning mb-3">超额提款费用</div>
                  <div class="flex flex-wrap items-end gap-4">
                    <el-form-item label="费率 (%)" class="mb-0 flex-1 min-w-[120px]">
                      <el-input-number v-model="form.tikuannumoverbilv" :min="0" :max="100" controls-position="right" class="w-full" />
                    </el-form-item>
                    <el-form-item label="最低费用" class="mb-0 flex-1 min-w-[120px]">
                      <el-input-number v-model="form.tikuannumovermin" :min="0" controls-position="right" class="w-full" />
                    </el-form-item>
                    <el-form-item label="最高费用" class="mb-0 flex-1 min-w-[120px]">
                      <el-input-number v-model="form.tikuannumovermax" :min="0" controls-position="right" class="w-full" />
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-box p-6 rounded-lg shadow-sm h-fit">
                <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">FS游戏接口</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-g-50 rounded">
                    <span>FS接口状态</span>
                    <el-select v-model="form.fs_status" size="small" class="!w-24">
                      <el-option value="online" label="正常" />
                      <el-option value="offline" label="关闭" />
                      <el-option value="maintenance" label="维护" />
                    </el-select>
                  </div>
                  <el-form-item label="API URL" class="mb-0">
                    <el-input v-model="form.fs_api_url" placeholder="https://api.fsgameapi.com" />
                  </el-form-item>
                  <el-form-item label="Token (API Key)" class="mb-0">
                    <el-input v-model="form.fs_api_key" />
                  </el-form-item>
                  <el-form-item label="Secret Key" class="mb-0">
                    <el-input v-model="form.fs_api_secret" show-password />
                  </el-form-item>
                </div>
              </div>

              <div class="bg-box p-6 rounded-lg shadow-sm h-fit">
                <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">其他规则</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-g-50 rounded">
                    <span>允许撤单</span>
                    <el-switch v-model="form.iskillorder" :active-value="1" :inactive-value="0" />
                  </div>
                  <el-form-item label="最大绑卡数" class="mb-0">
                    <el-input-number v-model="form.sysBankMaxNum" :min="1" controls-position="right" class="w-full" />
                  </el-form-item>
                  <el-form-item label="排队人数基数" class="mb-0">
                    <el-input-number v-model="form.paiduinum" :min="0" controls-position="right" class="w-full" />
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-box p-6 rounded-lg shadow-sm">
            <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">返点与客服</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <el-form-item label="返点范围 (%)">
                <div class="flex items-center gap-2">
                  <el-input-number v-model="form.fanDianMin" :min="0" :max="100" :precision="1" :controls="false" class="!w-20" />
                  <span>-</span>
                  <el-input-number v-model="form.fanDianMax" :min="0" :max="100" :precision="1" :controls="false" class="!w-20" />
                </div>
              </el-form-item>
              <el-form-item label="充值积分 (元/分)">
                <div class="flex items-center gap-2">
                  <el-input-number v-model="form.pointchongzhi" :min="1" :controls="false" class="!w-20" />
                  <span>:</span>
                  <el-input-number v-model="form.pointchongzhiadd" :min="0" :controls="false" class="!w-20" />
                </div>
              </el-form-item>
              <div class="md:col-span-1 space-y-4">
                <el-input v-model="form.kefuqq" placeholder="客服QQ">
                  <template #prefix><ArtSvgIcon icon="ri:qq-line" /></template>
                </el-input>
                <el-input v-model="form.kefuthree" placeholder="客服链接">
                  <template #prefix><ArtSvgIcon icon="ri:link" /></template>
                </el-input>
              </div>
              <el-form-item label="TG客服列表" class="md:col-span-3">
                <div class="space-y-3">
                  <div v-for="(item, index) in tgServiceList" :key="index" class="flex items-center gap-2 p-3 bg-g-50 rounded border-full-d">
                    <el-input v-model="item.name" placeholder="客服名称" class="!w-40" />
                    <el-input v-model="item.id" placeholder="客服号" class="!w-32" />
                    <el-input v-model="item.link" placeholder="客服链接 https://t.me/xxx" class="flex-1" />
                    <el-button type="danger" :icon="Delete" circle size="small" @click="removeTgService(index)" />
                  </div>
                  <el-button type="primary" plain @click="addTgService">
                    <ArtSvgIcon icon="ri:add-line" class="mr-1" />添加TG客服
                  </el-button>
                </div>
              </el-form-item>
            </div>
          </div>

          </div>

        
        <div v-show="activeTab === 'backend'" class="animate-fade-in space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-box p-6 rounded-lg shadow-sm">
              <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">后台登录安全</h3>
              <el-form-item label="登录失败限制">
                <div class="flex items-center gap-2 w-full bg-danger/10 p-3 rounded border border-danger/20">
                  <span class="text-g-600">错误</span>
                  <el-input-number v-model="form.loginerrornum" :min="0" controls-position="right" class="!w-20" />
                  <span class="text-g-600">次，锁定</span>
                  <el-input-number v-model="form.loginerrorclosetime" :min="0" controls-position="right" class="!w-20" />
                  <span class="text-g-600">小时</span>
                </div>
              </el-form-item>
              <div class="flex items-center justify-between p-4 mt-4 bg-g-50 rounded-lg">
                <div class="font-medium">图像验证码</div>
                <el-switch v-model="form.islogincode" :active-value="1" :inactive-value="0" />
              </div>
            </div>

            <div class="bg-box p-6 rounded-lg shadow-sm">
              <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">邮箱验证登录</h3>
              <div class="flex items-center justify-between p-4 bg-g-50 rounded-lg mb-4">
                <div class="font-medium">启用状态</div>
                <el-switch v-model="form.isemailcode" :active-value="1" :inactive-value="0" />
              </div>
              <div class="space-y-4">
                <el-form-item label="验证码有效期 (秒)">
                  <el-input-number v-model="form.adminemailcodetime" :min="0" controls-position="right" class="w-full" />
                </el-form-item>
                <el-form-item label="接收验证码邮箱">
                  <el-input v-model="form.getemailcode" placeholder="用于接收验证码" />
                </el-form-item>
              </div>
              <div class="mt-4 text-xs text-warning bg-warning/10 p-2 rounded">
                <i class="ri-alert-line align-bottom mr-1"></i>
                请确保邮件服务器配置正确，否则无法收到验证码。
              </div>
            </div>
          </div>
        </div>

        
        <div v-show="activeTab === 'mail'" class="animate-fade-in">
          <div class="bg-box p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
            <h3 class="text-base font-bold text-g-800 mb-6 border-l-4 border-primary pl-3">SMTP 服务器配置</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <el-form-item label="服务器地址" class="md:col-span-2">
                <el-input v-model="form.SMTP_HOST" placeholder="例如: smtp.exmail.qq.com">
                  <template #prefix><ArtSvgIcon icon="ri:server-line" /></template>
                </el-input>
              </el-form-item>
              <el-form-item label="端口">
                <el-input v-model="form.SMTP_PORT" placeholder="465 / 587" />
              </el-form-item>
              <el-form-item label="加密协议">
                <el-radio-group v-model="form.SMTP_SSL" class="w-full">
                  <el-radio-button :label="1">SSL / TLS</el-radio-button>
                  <el-radio-button :label="0">None</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="账号">
                <el-input v-model="form.SMTP_USER" placeholder="邮箱账号" />
              </el-form-item>
              <el-form-item label="密码 / 授权码">
                <el-input v-model="form.SMTP_PASS" type="password" show-password placeholder="密码" />
              </el-form-item>
              
              <div class="md:col-span-2 border-t border-full-d my-2 pt-4">
                <h4 class="text-sm font-bold text-g-700 mb-4">发件人信息</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <el-form-item label="发件人名称">
                    <el-input v-model="form.FROM_NAME" />
                  </el-form-item>
                  <el-form-item label="发件人邮箱">
                    <el-input v-model="form.FROM_EMAIL" />
                  </el-form-item>
                  <el-form-item label="回复名称">
                    <el-input v-model="form.REPLY_NAME" />
                  </el-form-item>
                  <el-form-item label="回复邮箱">
                    <el-input v-model="form.REPLY_EMAIL" />
                  </el-form-item>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div v-show="activeTab === 'other'" class="animate-fade-in space-y-4">
          <div class="bg-box p-6 rounded-lg shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-g-800 border-l-4 border-primary pl-3">声音提示配置</h3>
            </div>
            <input type="file" ref="czAudioInputRef" accept="audio/*" class="hidden" @change="handleCzAudioChange" />
            <input type="file" ref="tkAudioInputRef" accept="audio/*" class="hidden" @change="handleTkAudioChange" />
            <input type="file" ref="cardAudioInputRef" accept="audio/*" class="hidden" @change="handleCardAudioChange" />
            <div class="space-y-5">
              
              <div class="border-full-d rounded-xl p-6 transition-shadow hover:shadow-md" :class="{'bg-g-50/50': !form.czaudioplay}">
                <div class="flex flex-wrap items-center gap-5 md:gap-8">
                  <div class="flex items-center gap-4 min-w-[180px]">
                    <div class="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center">
                      <ArtSvgIcon icon="ri:money-dollar-circle-line" class="text-3xl text-success" />
                    </div>
                    <div>
                      <div class="text-lg font-bold text-g-700">充值提示</div>
                      <div class="text-sm text-g-400">新充值订单提醒</div>
                    </div>
                  </div>
                  <el-switch v-model="form.czaudioplay" :active-value="1" :inactive-value="0" size="large" />
                  <template v-if="form.czaudioplay">
                    <div class="flex items-center gap-3 text-base">
                      <span class="text-g-500">有效时间</span>
                      <el-input-number v-model="form.czaudioplaytime" :min="1" :controls="false" class="!w-20" />
                      <span class="text-g-400">分</span>
                    </div>
                    <div class="flex items-center gap-3 text-base">
                      <span class="text-g-500">自动关闭</span>
                      <el-input-number v-model="form.czaudioqxtime" :min="1" :controls="false" class="!w-20" />
                      <span class="text-g-400">分</span>
                    </div>
                    <div class="flex items-center gap-3 flex-1 min-w-[280px]">
                      <el-input v-model="form.czaudio_url" placeholder="音频地址" class="flex-1" />
                      <el-button type="primary" @click="triggerCzAudioUpload" :loading="czAudioUploading">
                        <ArtSvgIcon icon="ri:upload-line" class="text-lg" />
                      </el-button>
                      <el-button :type="playingAudio === 'cz' ? 'danger' : 'default'" @click="playAudio('cz', form.czaudio_url)">
                        <ArtSvgIcon :icon="playingAudio === 'cz' ? 'ri:stop-fill' : 'ri:play-fill'" class="text-lg" />
                      </el-button>
                    </div>
                  </template>
                </div>
              </div>

              
              <div class="border-full-d rounded-xl p-6 transition-shadow hover:shadow-md" :class="{'bg-g-50/50': !form.tkaudioplay}">
                <div class="flex flex-wrap items-center gap-5 md:gap-8">
                  <div class="flex items-center gap-4 min-w-[180px]">
                    <div class="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center">
                      <ArtSvgIcon icon="ri:bank-card-line" class="text-3xl text-warning" />
                    </div>
                    <div>
                      <div class="text-lg font-bold text-g-700">提款提示</div>
                      <div class="text-sm text-g-400">新提款订单提醒</div>
                    </div>
                  </div>
                  <el-switch v-model="form.tkaudioplay" :active-value="1" :inactive-value="0" size="large" />
                  <template v-if="form.tkaudioplay">
                    <div class="flex items-center gap-3 text-base">
                      <span class="text-g-500">有效时间</span>
                      <el-input-number v-model="form.tkaudioplaytime" :min="1" :controls="false" class="!w-20" />
                      <span class="text-g-400">分</span>
                    </div>
                    <div class="flex items-center gap-3 flex-1 min-w-[280px]">
                      <el-input v-model="form.tkaudio_url" placeholder="音频地址" class="flex-1" />
                      <el-button type="primary" @click="triggerTkAudioUpload" :loading="tkAudioUploading">
                        <ArtSvgIcon icon="ri:upload-line" class="text-lg" />
                      </el-button>
                      <el-button :type="playingAudio === 'tk' ? 'danger' : 'default'" @click="playAudio('tk', form.tkaudio_url)">
                        <ArtSvgIcon :icon="playingAudio === 'tk' ? 'ri:stop-fill' : 'ri:play-fill'" class="text-lg" />
                      </el-button>
                    </div>
                  </template>
                </div>
              </div>

              
              <div class="border-full-d rounded-xl p-6 transition-shadow hover:shadow-md" :class="{'bg-g-50/50': !form.cardaudioplay}">
                <div class="flex flex-wrap items-center gap-5 md:gap-8">
                  <div class="flex items-center gap-4 min-w-[180px]">
                    <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ArtSvgIcon icon="ri:id-card-line" class="text-3xl text-primary" />
                    </div>
                    <div>
                      <div class="text-lg font-bold text-g-700">绑卡提示</div>
                      <div class="text-sm text-g-400">新绑卡申请提醒</div>
                    </div>
                  </div>
                  <el-switch v-model="form.cardaudioplay" :active-value="1" :inactive-value="0" size="large" />
                  <template v-if="form.cardaudioplay">
                    <div class="flex items-center gap-3 flex-1 min-w-[280px]">
                      <el-input v-model="form.cardaudio_url" placeholder="音频地址" class="flex-1" />
                      <el-button type="primary" @click="triggerCardAudioUpload" :loading="cardAudioUploading">
                        <ArtSvgIcon icon="ri:upload-line" class="text-lg" />
                      </el-button>
                      <el-button :type="playingAudio === 'card' ? 'danger' : 'default'" @click="playAudio('card', form.cardaudio_url)">
                        <ArtSvgIcon :icon="playingAudio === 'card' ? 'ri:stop-fill' : 'ri:play-fill'" class="text-lg" />
                      </el-button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    
    <div class="fixed bottom-0 left-0 right-0 bg-box border-t border-full-d p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-center gap-4 z-20 sm:absolute sm:left-0 sm:right-0 sm:bottom-0 sm:rounded-b-lg">
      <el-button @click="loadData" size="large" class="w-32">重置</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large" class="w-32">保存设置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import {
  fetchSystemSettings,
  saveSystemSettings,
  type SystemSettings
} from '@/api/system-settings'
import { uploadImage } from '@/api/common'

const activeTab = ref('basic')
const loading = ref(false)
const submitting = ref(false)

const tabs = [
  { name: 'basic', label: '基本设置', icon: 'ri-settings-4-line' },
  { name: 'operation', label: '运维设置', icon: 'ri-tools-line' },
  { name: 'backend', label: '后台设置', icon: 'ri-shield-user-line' },
  { name: 'mail', label: '邮件设置', icon: 'ri-mail-settings-line' },
  { name: 'other', label: '其他设置', icon: 'ri-more-fill' }
]

const logoInputRef = ref<HTMLInputElement | null>(null)
const logoUploading = ref(false)
const floatIconInputRef = ref<HTMLInputElement | null>(null)
const floatIconUploading = ref(false)

const czAudioInputRef = ref<HTMLInputElement | null>(null)
const czAudioUploading = ref(false)
const tkAudioInputRef = ref<HTMLInputElement | null>(null)
const tkAudioUploading = ref(false)
const cardAudioInputRef = ref<HTMLInputElement | null>(null)
const cardAudioUploading = ref(false)

const playingAudio = ref<string | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)

interface TgService {
  name: string
  id: string
  link: string
}
const tgServiceList = ref<TgService[]>([])

const addTgService = () => {
  tgServiceList.value.push({ name: '', id: '', link: '' })
}

const removeTgService = (index: number) => {
  tgServiceList.value.splice(index, 1)
}

const form = reactive<SystemSettings>({

  webtitle: '',
  sitedomain: '',
  logo: '',
  float_icon: '',
  float_icon_link: '',
  promo_texts: '',
  keywords: '',
  description: '',
  defaulttjcode: '',
  loginerrornum_q: 6,
  loginerrorclosetime_q: 24,
  ipblackisopen: 0,
  ipblacklist: '',
  ipwhiteisopen: 0,
  ipwhitelist: '',

  fs_status: 'online',
  fs_api_url: '',
  fs_api_key: '',
  fs_api_secret: '',
  iskillorder: 1,
  sysBankMaxNum: 4,
  damaliang: 50,
  paiduinum: 33,
  tikuanstart: '00:10',
  tikuanend: '23:55',
  tikuannumoverbilv: 10,
  tikuannumovermin: 100,
  tikuannumovermax: 9999999,
  tikuanMin: 100,
  tikuanMax: 500000,
  ritikuanxiane: 1000000,
  tikuannum: 10,
  fanDianMax: 9.8,
  fanDianMin: 0.0,
  pointchongzhi: 1,
  pointchongzhiadd: 2,
  kefuqq: '',
  kefuthree: '',
  tg_service_list: '',

  loginerrornum: 3,
  loginerrorclosetime: 1,
  islogincode: 0,
  isemailcode: 0,
  adminemailcodetime: 180,
  getemailcode: '',

  SMTP_HOST: '',
  SMTP_SSL: 0,
  SMTP_PORT: '',
  FROM_EMAIL: '',
  SMTP_USER: '',
  FROM_NAME: '',
  REPLY_EMAIL: '',
  REPLY_NAME: '',
  SMTP_PASS: '',

  caijieapiurl: '',
  weballowips: '',
  czaudioplay: 1,
  czaudioplaytime: 5,
  czaudioqxtime: 8,
  czaudio_url: '',
  tkaudioplay: 1,
  tkaudioplaytime: 5,
  tkaudio_url: '',
  cardaudioplay: 1,
  cardaudio_url: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchSystemSettings()
    console.log('System Settings API Response:', res)

    const toNumber = (val: any) => {
      const n = Number(val)
      return isNaN(n) ? 0 : n
    }

    const settings = (res as any).settings || res
    if (settings) {
      form.webtitle = settings.webtitle || ''
      form.sitedomain = settings.sitedomain || ''
      form.logo = settings.logo || ''
      form.float_icon = settings.float_icon || ''
      form.float_icon_link = settings.float_icon_link || ''
      let promoTexts = settings.promo_texts || ''
      if (Array.isArray(promoTexts)) {
        form.promo_texts = promoTexts.join('\n')
      } else if (typeof promoTexts === 'string' && promoTexts.startsWith('[')) {
        try {
          const parsed = JSON.parse(promoTexts)
          form.promo_texts = Array.isArray(parsed) ? parsed.join('\n') : promoTexts
        } catch {
          form.promo_texts = ''
        }
      } else {
        form.promo_texts = promoTexts
      }
      form.keywords = settings.keywords || ''
      form.description = settings.description || ''
      form.defaulttjcode = settings.defaulttjcode || ''
      form.loginerrornum_q = toNumber(settings.loginerrornum_q)
      form.loginerrorclosetime_q = toNumber(settings.loginerrorclosetime_q)
      form.ipblackisopen = toNumber(settings.ipblackisopen)
      form.ipblacklist = settings.ipblacklist || ''
      form.ipwhiteisopen = toNumber(settings.ipwhiteisopen)
      form.ipwhitelist = settings.ipwhitelist || ''

      form.fs_status = settings.fs_status || 'online'
      form.fs_api_url = settings.fs_api_url || ''
      form.fs_api_key = settings.fs_api_key || ''
      form.fs_api_secret = settings.fs_api_secret || ''
      form.iskillorder = toNumber(settings.iskillorder)
      form.sysBankMaxNum = toNumber(settings.sysBankMaxNum)
      form.damaliang = toNumber(settings.damaliang)
      form.paiduinum = toNumber(settings.paiduinum)
      form.tikuanstart = settings.tikuanstart || '00:00'
      form.tikuanend = settings.tikuanend || '23:59'
      form.tikuannumoverbilv = toNumber(settings.tikuannumoverbilv)
      form.tikuannumovermin = toNumber(settings.tikuannumovermin)
      form.tikuannumovermax = toNumber(settings.tikuannumovermax)
      form.tikuanMin = toNumber(settings.tikuanMin)
      form.tikuanMax = toNumber(settings.tikuanMax)
      form.ritikuanxiane = toNumber(settings.ritikuanxiane)
      form.tikuannum = toNumber(settings.tikuannum)
      form.fanDianMax = toNumber(settings.fanDianMax)
      form.fanDianMin = toNumber(settings.fanDianMin)
      form.pointchongzhi = toNumber(settings.pointchongzhi)
      form.pointchongzhiadd = toNumber(settings.pointchongzhiadd)
      form.kefuqq = settings.kefuqq || ''
      form.kefuthree = settings.kefuthree || ''
      form.tg_service_list = settings.tg_service_list || ''
      
      if (settings.tg_service_list) {
        try {
          const parsed = JSON.parse(settings.tg_service_list)
          tgServiceList.value = Array.isArray(parsed) ? parsed : []
        } catch {
          tgServiceList.value = []
        }
      } else {
        tgServiceList.value = []
      }

      form.loginerrornum = toNumber(settings.loginerrornum)
      form.loginerrorclosetime = toNumber(settings.loginerrorclosetime)
      form.islogincode = toNumber(settings.islogincode)
      form.isemailcode = toNumber(settings.isemailcode)
      form.adminemailcodetime = toNumber(settings.adminemailcodetime)
      form.getemailcode = settings.getemailcode || ''

      form.SMTP_HOST = settings.SMTP_HOST || ''
      form.SMTP_SSL = toNumber(settings.SMTP_SSL)
      form.SMTP_PORT = settings.SMTP_PORT || ''
      form.FROM_EMAIL = settings.FROM_EMAIL || ''
      form.SMTP_USER = settings.SMTP_USER || ''
      form.FROM_NAME = settings.FROM_NAME || ''
      form.REPLY_EMAIL = settings.REPLY_EMAIL || ''
      form.REPLY_NAME = settings.REPLY_NAME || ''
      form.SMTP_PASS = settings.SMTP_PASS || ''

      form.caijieapiurl = settings.caijieapiurl || ''
      form.weballowips = settings.weballowips || ''
      form.czaudioplay = toNumber(settings.czaudioplay)
      form.czaudioplaytime = toNumber(settings.czaudioplaytime)
      form.czaudioqxtime = toNumber(settings.czaudioqxtime)
      form.czaudio_url = settings.czaudio_url || ''
      form.tkaudioplay = toNumber(settings.tkaudioplay)
      form.tkaudioplaytime = toNumber(settings.tkaudioplaytime)
      form.tkaudio_url = settings.tkaudio_url || ''
      form.cardaudioplay = toNumber(settings.cardaudioplay)
      form.cardaudio_url = settings.cardaudio_url || ''
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const triggerLogoUpload = () => {
  logoInputRef.value?.click()
}

const handleLogoChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  logoUploading.value = true
  try {
    const result = await uploadImage(file)
    if (result.url) {
      form.logo = result.url
      ElMessage.success('Logo上传成功')
    }
  } catch (error) {
    ElMessage.error('上传失败')
    console.error(error)
  } finally {
    logoUploading.value = false
    target.value = ''
  }
}

const triggerFloatIconUpload = () => {
  floatIconInputRef.value?.click()
}

const handleFloatIconChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  floatIconUploading.value = true
  try {
    const result = await uploadImage(file)
    if (result.url) {
      form.float_icon = result.url
      ElMessage.success('悬浮图标上传成功')
    }
  } catch (error) {
    ElMessage.error('上传失败')
    console.error(error)
  } finally {
    floatIconUploading.value = false
    target.value = ''
  }
}

const triggerCzAudioUpload = () => {
  czAudioInputRef.value?.click()
}

const handleCzAudioChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  czAudioUploading.value = true
  try {
    const result = await uploadImage(file)
    if (result.url) {
      form.czaudio_url = result.url
      ElMessage.success('充值提示音上传成功')
    }
  } catch (error) {
    ElMessage.error('上传失败')
    console.error(error)
  } finally {
    czAudioUploading.value = false
    target.value = ''
  }
}

const triggerTkAudioUpload = () => {
  tkAudioInputRef.value?.click()
}

const handleTkAudioChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  tkAudioUploading.value = true
  try {
    const result = await uploadImage(file)
    if (result.url) {
      form.tkaudio_url = result.url
      ElMessage.success('提款提示音上传成功')
    }
  } catch (error) {
    ElMessage.error('上传失败')
    console.error(error)
  } finally {
    tkAudioUploading.value = false
    target.value = ''
  }
}

const triggerCardAudioUpload = () => {
  cardAudioInputRef.value?.click()
}

const handleCardAudioChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  cardAudioUploading.value = true
  try {
    const result = await uploadImage(file)
    if (result.url) {
      form.cardaudio_url = result.url
      ElMessage.success('绑卡提示音上传成功')
    }
  } catch (error) {
    ElMessage.error('上传失败')
    console.error(error)
  } finally {
    cardAudioUploading.value = false
    target.value = ''
  }
}

const playAudio = (type: string, url: string) => {
  if (!url) {
    ElMessage.warning('请先上传音频文件')
    return
  }
  
  if (playingAudio.value === type) {
    audioRef.value?.pause()
    playingAudio.value = null
    return
  }
  
  if (audioRef.value) {
    audioRef.value.pause()
  }
  
  audioRef.value = new Audio(url)
  audioRef.value.play()
  playingAudio.value = type
  
  audioRef.value.onended = () => {
    playingAudio.value = null
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const validTgList = tgServiceList.value.filter(item => item.name && item.link)
    form.tg_service_list = validTgList.length > 0 ? JSON.stringify(validTgList) : ''
    
    await saveSystemSettings(form)
    ElMessage.success('保存成功')
    loadData()
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
.custom-tabs :deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px;
}
.custom-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  padding: 0 20px;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>