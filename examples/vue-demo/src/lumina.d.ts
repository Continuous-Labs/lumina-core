/* eslint-disable */
declare module '@lumina/config' {
  const config: import('@continuouslabs/lumina').LuminaOptions
  export default config
}

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    LuminaProvider: typeof import('@continuouslabs/lumina-react').LuminaProvider
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
