<template>
  <ElConfigProvider size="default" :locale="locales[language]" :z-index="3000">
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
  import { useUserStore } from './store/modules/user'
  import zh from 'element-plus/es/locale/lang/zh-cn'
  import en from 'element-plus/es/locale/lang/en'
  import { systemUpgrade } from './utils/sys'
  import { toggleTransition } from './utils/ui/animation'
  import { checkStorageCompatibility } from './utils/storage'
  import { initializeTheme } from './hooks/core/useTheme'
  import { initWebSocket, closeWebSocket, socketEmitter } from '@/utils/websocket'
  import { fetchSystemSettings } from '@/api/system-settings'

  const userStore = useUserStore()
  const { language } = storeToRefs(userStore)

  const locales = {
    zh: zh,
    en: en
  }

  const audioConfig = ref<any>(null)
  const wsInitialized = ref(false)

  const loadAudioConfig = async () => {
    try {
      const res = await fetchSystemSettings()
      if (res?.settings) {
        audioConfig.value = res.settings
      }
    } catch (e) {
    }
  }

  const playSound = (url: string) => {
    if (!url) return
    try {
      const audio = new Audio(url)
      audio.volume = 1
      audio.play()
    } catch (e) {}
  }

  const onDeposit = () => {
    if (audioConfig.value?.czaudioplay == 1 && audioConfig.value?.czaudio_url) {
      playSound(audioConfig.value.czaudio_url)
    }
  }

  const onWithdraw = () => {
    if (audioConfig.value?.tkaudioplay == 1 && audioConfig.value?.tkaudio_url) {
      playSound(audioConfig.value.tkaudio_url)
    }
  }

  const onBindCard = () => {
    if (audioConfig.value?.cardaudioplay == 1 && audioConfig.value?.cardaudio_url) {
      playSound(audioConfig.value.cardaudio_url)
    }
  }

  const setupWebSocket = async () => {
    if (wsInitialized.value) return
    wsInitialized.value = true
    initWebSocket()
    await loadAudioConfig()
    socketEmitter.on('finance_new_deposit', onDeposit)
    socketEmitter.on('finance_new_withdraw', onWithdraw)
    socketEmitter.on('user_bindcard', onBindCard)
  }

  watch(() => userStore.accessToken, (token) => {
    if (token && !wsInitialized.value) {
      setupWebSocket()
    }
  })

  onBeforeMount(() => {
    toggleTransition(true)
    initializeTheme()
  })

  onMounted(() => {
    checkStorageCompatibility()
    toggleTransition(false)
    systemUpgrade()
    setupWebSocket()
  })

  onUnmounted(() => {
    closeWebSocket()
    socketEmitter.off('finance_new_deposit', onDeposit)
    socketEmitter.off('finance_new_withdraw', onWithdraw)
    socketEmitter.off('user_bindcard', onBindCard)
  })
</script>
