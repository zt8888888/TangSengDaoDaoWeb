<template>
  <component :is="tag" v-html="safeHtml"></component>
</template>

<script setup lang="ts">


import { computed } from 'vue'
import { sanitizeHtml } from '@/utils/security/xss'

interface Props {

  html: string

  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  html: '',
  tag: 'div'
})


const safeHtml = computed(() => sanitizeHtml(props.html))
</script>
