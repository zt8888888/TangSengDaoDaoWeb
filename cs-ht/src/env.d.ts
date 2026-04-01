

declare module 'nprogress'

declare module 'crypto-js'

declare module 'vue-img-cutter'

declare module 'file-saver'

declare module 'qrcode.vue' {
  export type Level = 'L' | 'M' | 'Q' | 'H'
  export type RenderAs = 'canvas' | 'svg'
  export type GradientType = 'linear' | 'radial'
  export interface ImageSettings {
    src: string
    height: number
    width: number
    excavate: boolean
  }
  export interface QRCodeProps {
    value: string
    size?: number
    level?: Level
    background?: string
    foreground?: string
    renderAs?: RenderAs
  }
  const QrcodeVue: any
  export default QrcodeVue
}

declare const __APP_VERSION__: string

interface ImportMetaEnv {

  readonly VITE_BASE_URL: string

  readonly VITE_API_URL: string

  readonly VITE_API_PROXY_URL?: string

  readonly VITE_DROP_CONSOLE: string

  readonly VITE_CRYPTO_KEY?: string

  readonly VITE_WITH_CREDENTIALS?: string

  readonly VITE_VERSION?: string

  readonly VITE_PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
