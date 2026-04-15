import 'react'

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    t?: boolean
  }
}

declare module '@lumina/config' {
  const config: import('@continuouslabs/lumina').LuminaOptions
  export default config
}
