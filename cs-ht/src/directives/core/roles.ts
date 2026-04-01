

import { useUserStore } from '@/store/modules/user'
import { App, Directive, DirectiveBinding } from 'vue'

interface RolesBinding extends DirectiveBinding {
  value: string | string[]
}

const originalDisplayMap = new WeakMap<HTMLElement, string>()

function checkRolePermission(el: HTMLElement, binding: RolesBinding): void {
  const userStore = useUserStore()
  const userRoles = userStore.getUserInfo.roles

  if (!userRoles?.length) {
    hideElement(el)
    return
  }

  const requiredRoles = Array.isArray(binding.value) ? binding.value : [binding.value]

  const hasPermission = requiredRoles.some((role: string) => userRoles.includes(role))

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

const rolesDirective: Directive = {
  mounted: checkRolePermission,
  updated: checkRolePermission,
  beforeUnmount(el: HTMLElement) {

    originalDisplayMap.delete(el)
  }
}

export function setupRolesDirective(app: App): void {
  app.directive('roles', rolesDirective)
}
