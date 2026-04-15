/// <reference types="astro/client" />

declare module '@lumina/config' {
  const config: import('@continuouslabs/lumina').LuminaOptions
  export default config
}

declare namespace JSX {
  interface IntrinsicAttributes {
    t?: boolean
  }
}