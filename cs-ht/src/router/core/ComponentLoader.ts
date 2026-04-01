

import { h } from 'vue'

export class ComponentLoader {
  private modules: Record<string, () => Promise<any>>

  constructor() {

    this.modules = import.meta.glob('../../views/**/*.vue')
  }

  load(componentPath: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    if (componentPath === 'Layout') {
      return this.loadLayout()
    }

    const normalizedPath = componentPath.startsWith('/') ? componentPath : `/${componentPath}`
    const fullPath = `../../views${normalizedPath}.vue`
    const fullPathWithIndex = `../../views${normalizedPath}/index.vue`

    const module = this.modules[fullPath] || this.modules[fullPathWithIndex]

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到组件: ${componentPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      return this.createErrorComponent(componentPath)
    }

    return module
  }

  loadLayout(): () => Promise<any> {
    return () => import('@/views/index/index.vue')
  }

  loadIframe(): () => Promise<any> {
    return () => import('@/views/outside/Iframe.vue')
  }

  private createEmptyComponent(): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', {})
        }
      })
  }

  private createErrorComponent(componentPath: string): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', { class: 'route-error' }, `组件未找到: ${componentPath}`)
        }
      })
  }
}
