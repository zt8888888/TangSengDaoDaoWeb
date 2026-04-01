

import { router } from '@/router'
import { App, Directive, DirectiveBinding } from 'vue'

interface AuthBinding extends DirectiveBinding {
  value: string
}

const originalDisplayMap = new WeakMap<HTMLElement, string>()

function checkAuthPermission(el: HTMLElement, binding: AuthBinding): void {

  const authList = (router.currentRoute.value.meta.authList as Array<{ authMark: string }>) || []

  const hasPermission = authList.some((item) => item.authMark === binding.value)

  if (!hasPermission) {
    hideElement(el)
  } else {
    showElement(el)
  }
}

function hideElement(el: HTMLElement): void {

  if (!originalDisplayMap.has(el)) {
    originalDisplayMap.set(el, el.style.display)
  }
  el.style.display = 'none'
}

function showElement(el: HTMLElement): void {
  const originalDisplay = originalDisplayMap.get(el)
  el.style.display = originalDisplay ?? ''
}

const authDirective: Directive = {
  mounted: checkAuthPermission,
  updated: checkAuthPermission,
  beforeUnmount(el: HTMLElement) {

    originalDisplayMap.delete(el)
  }
}

export function setupAuthDirective(app: App): void {
  app.directive('auth', authDirective)
}
