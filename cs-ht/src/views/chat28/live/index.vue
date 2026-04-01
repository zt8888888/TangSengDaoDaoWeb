
<template>
  <div class="chat28-live-page flex !p-0 max-md:flex-col" :style="{ height: containerMinHeight }">
    
    <div class="box-border w-72 h-full p-4 border-r border-g-300 max-md:w-full max-md:h-auto max-md:border-r-0">
      
      <div class="mb-4">
        <div class="text-sm font-medium mb-2 text-g-600">选择彩种</div>
        <ElSelect v-model="currentLottery" placeholder="请选择" style="width: 100%" @change="handleLotteryChange">
          <ElOption
            v-for="item in lotteryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </div>

      
      <div class="mb-4 p-3 bg-theme/10 rounded-lg">
        <div class="text-xs text-g-500 mb-1">当前期号</div>
        <div class="text-lg font-bold text-theme">{{ currentIssue || '--' }}</div>
        <div class="text-xs text-g-500 mt-1">
          状态: 
          <ElTag :type="statusType" size="small">{{ statusText }}</ElTag>
        </div>
      </div>

      
      <div class="space-y-2">
        <div class="flex-cb py-1">
            <span class="text-xs text-g-500">在线机器人</span>
          <span class="text-sm font-bold text-success">{{ stats.robot_count }}</span>
        </div>
        <div class="flex-cb py-1">
            <span class="text-xs text-g-500">今日消息</span>
          <span class="text-sm font-bold text-primary">{{ stats.today_messages }}</span>
        </div>
        <div class="flex-cb py-1">
            <span class="text-xs text-g-500">今日投注</span>
          <span class="text-sm font-bold text-warning">{{ stats.today_bets }}</span>
        </div>
        <div class="flex-cb py-1">
            <span class="text-xs text-g-500">今日金额</span>
          <span class="text-sm font-bold text-danger">¥{{ stats.today_amount }}</span>
        </div>
      </div>

      
      <div class="mt-4">
        <div class="flex-cb mb-2">
          <span class="text-sm font-medium text-g-600">机器人状态</span>
          <ElTag :type="stats.config_enabled ? 'success' : 'danger'" size="small">
            {{ stats.config_enabled ? '运行中' : '已停止' }}
          </ElTag>
        </div>
      </div>
    </div>

    
    <div class="box-border flex-1 h-full flex flex-col">
      
      <div class="flex-cb pt-4 px-4 pb-0 mb-3 border-b border-g-200 pb-3">
        <div class="flex-c gap-3">
          <div class="w-10 h-10 rounded-full bg-theme/20 flex-center">
            <i class="ri-message-3-line text-xl text-theme"></i>
          </div>
          <div>
            <span class="text-base font-medium">聊天室28实时监控</span>
            <div class="flex-c gap-1 mt-1">
              <div class="w-2 h-2 rounded-full animate-pulse" :class="wsConnected ? 'bg-success' : 'bg-danger'"></div>
              <span class="text-xs text-g-600">{{ wsConnected ? 'WebSocket 已连接' : 'WebSocket 未连接' }}</span>
            </div>
          </div>
        </div>
        <div class="flex-c gap-2">
          <ElButton size="small" @click="clearMessages">
            <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />清空
          </ElButton>
          <ElButton size="small" type="primary" @click="reconnectWS">
            <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />重连
          </ElButton>
        </div>
      </div>

      
      <div
        class="flex-1 py-4 px-4 overflow-y-auto [&::-webkit-scrollbar]:!w-1"
        ref="messageContainer"
      >
        <template v-if="messages.length === 0">
          <div class="flex-center h-full text-g-400">
            <div class="text-center">
              <i class="ri-chat-3-line text-4xl mb-2"></i>
              <div>等待消息...</div>
            </div>
          </div>
        </template>
        <template v-else>
          <TransitionGroup name="message">
            <div
              v-for="message in messages"
              :key="message.id"
              class="flex gap-2 items-start w-full mb-4"
              :class="getMessageClass(message)"
            >
              <ElAvatar :size="36" :src="message.avatar" class="flex-shrink-0">
                {{ message.userName?.charAt(0) || '?' }}
              </ElAvatar>
              <div class="flex flex-col max-w-[70%] items-start">
                <div class="flex gap-2 mb-1 text-xs">
                  <span class="font-medium" :class="getUserNameClass(message)">{{ message.userName }}</span>
                  <ElTag v-if="message.messageType === 'bet'" type="success" size="small">投注</ElTag>
                  <ElTag v-else-if="message.messageType === 'system'" type="warning" size="small">系统</ElTag>
                  <ElTag v-else-if="message.messageType === 'result'" type="danger" size="small">开奖</ElTag>
                  <span class="text-g-500">{{ message.time }}</span>
                </div>
                <div
                  class="py-2 px-3 text-sm leading-[1.5] rounded-lg"
                  :class="getMessageBubbleClass(message)"
                >
                  {{ message.content }}
                </div>
              </div>
            </div>
          </TransitionGroup>
        </template>
      </div>

      
      <div class="p-4 border-t border-g-200">
        <div class="flex gap-2">
          <ElInput
            v-model="systemMessageText"
            placeholder="输入消息内容（以机器人身份发送）..."
            @keyup.enter="sendSystemMessage"
          />
          <ElButton type="primary" @click="sendSystemMessage" :loading="sending">
            <ArtSvgIcon icon="ri:robot-line" class="mr-1" />机器人发送
          </ElButton>
        </div>
      </div>
    </div>

    
    <div class="box-border w-64 h-full p-4 border-l border-g-300 max-md:hidden">
      <div class="text-sm font-medium mb-3 text-g-600">
        最近活跃用户 <span class="text-g-400">({{ recentUsers.length }})</span>
      </div>
      <ElScrollbar>
        <div
          v-for="user in recentUsers"
          :key="user.id"
          class="flex-c p-2 mb-2 rounded-lg bg-g-100 hover:bg-g-200 transition-colors"
        >
          <ElAvatar :size="32" :src="user.avatar" class="mr-2">
            {{ user.name?.charAt(0) || '?' }}
          </ElAvatar>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ user.name }}</div>
            <div class="text-xs text-g-500 truncate">{{ user.lastMessage }}</div>
          </div>
          <ElTag v-if="user.isRobot" type="info" size="small">机器人</ElTag>
        </div>
        <div v-if="recentUsers.length === 0" class="text-center text-g-400 py-4">
          暂无活跃用户
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { useAutoLayoutHeight } from '@/hooks/core/useLayoutHeight'
import {
  fetchStats,
  fetchLotteryOptions,
  sendSystemMessage as apiSendSystemMessage,
  Chat28Stats,
  LotteryOption
} from '@/api/chat28'

defineOptions({ name: 'Chat28Live' })

const { containerMinHeight } = useAutoLayoutHeight()

const currentLottery = ref('yfxy28')
const currentIssue = ref('')
const lotteryOptions = ref<LotteryOption[]>([])
const wsConnected = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const systemMessageText = ref('')
const sending = ref(false)

const stats = reactive<Chat28Stats>({
  robot_count: 0,
  today_messages: 0,
  today_bets: 0,
  today_amount: 0,
  config_enabled: false
})

const statusType = ref<'success' | 'warning' | 'danger' | 'info'>('info')
const statusText = ref('等待中')

interface Message {
  id: string | number
  userName: string
  avatar: string
  content: string
  messageType: string
  time: string
  isSystem?: boolean
  isRobot?: boolean
}
const messages = ref<Message[]>([])

interface RecentUser {
  id: number | string
  name: string
  avatar: string
  lastMessage: string
  isRobot?: boolean
}
const recentUsers = ref<RecentUser[]>([])

let ws: WebSocket | null = null
let reconnectTimer: number | null = null

const loadLotteryOptions = async () => {
  try {
    const res = await fetchLotteryOptions()
    if (res) {
      lotteryOptions.value = res
      if (res.length > 0 && !currentLottery.value) {
        currentLottery.value = res[0].value
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const loadStats = async () => {
  try {
    const res = await fetchStats(currentLottery.value)
    if (res) {
      Object.assign(stats, res)
    }
  } catch (e) {
    console.error(e)
  }
}

const handleLotteryChange = () => {
  messages.value = []
  recentUsers.value = []
  loadStats()
  reconnectWS()
}

const connectWS = () => {
  if (ws) {
    ws.close()
    ws = null
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsHost = window.location.hostname
  const wsUrl = `${protocol}//${wsHost}/ws`

  console.log('[Chat28 Live] 连接 WebSocket:', wsUrl)

  try {
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('[Chat28 Live] WebSocket 已连接')
      wsConnected.value = true

      ws?.send(JSON.stringify({
        type: 'subscribe',
        data: { lotteryCode: currentLottery.value }
      }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)

        if (msg.type && msg.data) {
          handleWSMessage({ type: msg.type, ...msg.data, lotteryCode: msg.data?.lotteryCode })
        } else {
          handleWSMessage(msg)
        }
      } catch (e) {
        console.error('[Chat28 Live] 解析消息失败', e)
      }
    }

    ws.onclose = (event) => {
      console.log('[Chat28 Live] WebSocket 已关闭', event.code, event.reason)
      wsConnected.value = false
      ws = null

      if (!reconnectTimer) {
        reconnectTimer = window.setTimeout(() => {
          reconnectTimer = null
          connectWS()
        }, 5000)
      }
    }

    ws.onerror = (error) => {
      console.error('[Chat28 Live] WebSocket 错误', error)
      wsConnected.value = false
    }
  } catch (e) {
    console.error('[Chat28 Live] WebSocket 连接失败', e)
    wsConnected.value = false
  }
}

const handleWSMessage = (data: any) => {
  if (data.type === 'lottery_chat_message' && data.lotteryCode === currentLottery.value) {

    const msg = data.message || data.data || data

    let content = msg.content || ''
    if (msg.messageType === 'result' && !content && msg.code) {
      const code = Array.isArray(msg.code) ? msg.code : []
      content = `第 ${msg.issue} 期开奖: ${code.join('+')} = ${msg.sum} (${msg.type})`
    }

    if (msg.messageType === 'bill' && !content && msg.details) {
      const count = msg.details?.length || 0
      const total = msg.details?.reduce((sum: number, d: any) => sum + (d.total || 0), 0) || 0
      content = `第 ${msg.issue} 期账单: ${count}人投注，共${total.toFixed(2)}元`
    }

    addMessage({
      id: msg.id || Date.now(),
      userName: msg.userName || msg.user_name || '系统',
      avatar: msg.avatar || '',
      content: content,
      messageType: msg.messageType || msg.message_type || 'text',
      time: msg.time || new Date().toLocaleTimeString(),
      isSystem: msg.isSystem || msg.messageType === 'system',
      isRobot: msg.source === 'robot'
    })

    updateRecentUser({
      id: msg.userId || msg.user_id || 0,
      name: msg.userName || msg.user_name || '系统',
      avatar: msg.avatar || '',
      lastMessage: content?.substring(0, 20) || '',
      isRobot: msg.source === 'robot'
    })
  } else if (data.type === 'countdown') {
    currentIssue.value = data.currentIssue || ''
    updateStatus(data)
  } else if (data.type === 'draw_result') {
    addMessage({
      id: Date.now(),
      userName: '系统',
      avatar: '',
      content: `第 ${data.issue} 期开奖结果: ${data.openCode?.join(',')} = ${data.openCode?.reduce((a: number, b: number) => a + b, 0)}`,
      messageType: 'result',
      time: new Date().toLocaleTimeString(),
      isSystem: true
    })
    loadStats()
  }
}

const updateStatus = (data: any) => {
  if (data.status === 2 || data.status === 'sealed') {
    statusType.value = 'warning'
    statusText.value = '封盘中'
  } else if (data.status === 'drawing') {
    statusType.value = 'danger'
    statusText.value = '开奖中'
  } else {
    statusType.value = 'success'
    statusText.value = '投注中'
  }
}

const addMessage = (msg: Message) => {
  messages.value.push(msg)

  if (messages.value.length > 100) {
    messages.value.shift()
  }
  scrollToBottom()

  stats.today_messages++
  if (msg.messageType === 'bet') {
    stats.today_bets++
  }
}

const updateRecentUser = (user: RecentUser) => {
  const idx = recentUsers.value.findIndex(u => u.id === user.id)
  if (idx >= 0) {
    recentUsers.value.splice(idx, 1)
  }
  recentUsers.value.unshift(user)

  if (recentUsers.value.length > 20) {
    recentUsers.value.pop()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

const clearMessages = () => {
  messages.value = []
}

const reconnectWS = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  connectWS()
}

const sendSystemMessage = async () => {
  const content = systemMessageText.value.trim()
  if (!content) {
    ElMessage.warning('请输入消息内容')
    return
  }

  sending.value = true
  try {
    await apiSendSystemMessage({
      lottery_code: currentLottery.value,
      content
    })
    systemMessageText.value = ''
    ElMessage.success('发送成功')
  } catch (e) {
    console.error(e)
  } finally {
    sending.value = false
  }
}

const getMessageClass = (msg: Message) => {
  if (msg.isSystem || msg.messageType === 'system' || msg.messageType === 'result') {
    return 'justify-center'
  }
  return ''
}

const getUserNameClass = (msg: Message) => {
  if (msg.isRobot) return 'text-info'
  if (msg.isSystem) return 'text-warning'
  return 'text-g-800'
}

const getMessageBubbleClass = (msg: Message) => {
  if (msg.messageType === 'system') return 'bg-warning/10 text-warning'
  if (msg.messageType === 'result') return 'bg-danger/10 text-danger'
  if (msg.messageType === 'bet') return 'bg-success/10 text-success'
  if (msg.isRobot) return 'bg-info/10'
  return 'bg-g-100'
}

onMounted(() => {
  loadLotteryOptions()
  loadStats()
  connectWS()

  const statsTimer = setInterval(loadStats, 30000)

  onUnmounted(() => {
    clearInterval(statsTimer)
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }
    if (ws) {
      ws.close()
    }
  })
})
</script>

<style scoped>
.message-enter-active {
  transition: all 0.3s ease-out;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-cb {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-c {
  display: flex;
  align-items: center;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>

