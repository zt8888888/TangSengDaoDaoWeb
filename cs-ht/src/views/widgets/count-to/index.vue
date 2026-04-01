<template>
  <div class="page-content mb-5">
    <div class="mb-15 text-center">
      <h1 class="my-4 text-2xl font-semibold leading-tight"
        >基于 VueUse useTransition 的 Count-To 组件</h1
      >
      <p class="m-0 text-base leading-relaxed text-g-700"
        >高性能数字滚动动画组件，支持完整的动画控制和事件监听</p
      >
    </div>

    
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">基础用法</h2>
      <div class="count">
        <ArtCountTo :target="1000" :duration="2000" />
      </div>
    </div>

    
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">带前缀后缀</h2>
      <div class="count">
        <ArtCountTo :target="20000" :duration="2500" prefix="¥" suffix="元" :decimals="2" />
      </div>
    </div>

    
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">小数点和分隔符</h2>
      <div class="count">
        <ArtCountTo :target="2023.45" :duration="3000" :decimals="2" separator="," />
      </div>
    </div>

    
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">动画效果对比</h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mb-8">
        <div class="text-center" v-for="easing in easingTypes" :key="easing.type">
          <div class="mb-3 text-sm font-medium text-g-700">{{ easing.name }}</div>
          <div class="count">
            <ArtCountTo :target="easingTarget" :duration="3000" :easing="easing.type" />
          </div>
        </div>
      </div>
      <div class="text-center">
        <ElButton @click="triggerEasing">触发所有动画</ElButton>
      </div>
    </div>

    
    <div class="mb-15">
      <h2 class="m-0 mb-6 text-xl font-medium">控制按钮</h2>
      <div class="count">
        <ArtCountTo
          ref="countToRef"
          :target="controlTarget"
          :duration="2000"
          @started="handleAnimationStarted"
          @finished="handleAnimationFinished"
          @paused="handleAnimationPaused"
          @reset="handleAnimationReset"
        />
      </div>

      <div class="flex gap-3 justify-center">
        <ElButton @click="startCount">开始</ElButton>
        <ElButton @click="pauseCount">暂停</ElButton>
        <ElButton @click="resetCount">重置</ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ArtCountTo from '@/components/core/text-effect/art-count-to/index.vue'

  defineOptions({ name: 'TemplateCountTo' })

  const controlTarget = ref(0)
  const countToRef = ref()
  const easingTarget = ref(0)

  const easingTypes = [
    { name: 'Linear', type: 'linear' },
    { name: 'Ease Out Cubic', type: 'easeOutCubic' },
    { name: 'Ease Out Expo', type: 'easeOutExpo' },
    { name: 'Ease Out Sine', type: 'easeOutSine' },
    { name: 'Ease In Out', type: 'easeInOutCubic' },
    { name: 'Ease In Quad', type: 'easeInQuad' }
  ] as const

  const startCount = () => {
    const newTarget = 5000
    controlTarget.value = newTarget
    countToRef.value?.start(newTarget)
  }

  const pauseCount = () => {
    countToRef.value?.pause()
  }

  const resetCount = () => {
    countToRef.value?.reset()
    controlTarget.value = 0
  }

  const triggerEasing = () => {
    easingTarget.value = easingTarget.value === 0 ? 1000 : 0
  }

  const handleAnimationStarted = (value: number) => {
    console.log('动画开始，目标值:', value)
  }

  const handleAnimationFinished = (value: number) => {
    console.log('动画完成，最终值:', value)
  }

  const handleAnimationPaused = (value: number) => {
    console.log('动画暂停，当前值:', value)
  }

  const handleAnimationReset = () => {
    console.log('动画已重置')
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .count {
    @apply p-5 
    mb-5 
    text-2xl 
    font-semibold 
    text-center
    bg-g-100
    rounded-lg 
    tabular-nums
    border border-g-300/60;
  }
</style>
