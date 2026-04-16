# Lumina Next.js Demo 🏁

A high-performance showcase of **Lumina i18n** for Next.js 15+ using the App Router.

## Modern i18n for Next.js
- **App Router Integration:** Deeply integrated with Next.js App Router and server components.
- **Automated Localization:** Zero-config extraction and browser language auto-detection.
- **Optimized Bundling:** Seamless integration with Next.js build process.
- **withLumina Wrapper:** A powerful Webpack wrapper that handles zero-config extraction without cluttering your `next.config.js`.
- **Hybrid Rendering:** Designed to work across Client Components and SSR environments via `globalThis` singletons.

## Running the demo
```bash
pnpm install
pnpm run dev
```

## Setup details
Register the Lumina wrapper in `next.config.ts`:

```typescript
import { withLumina } from '@continuouslabs/lumina-next'

const nextConfig = {
  // your standard next config
}

export default withLumina(nextConfig, { locales: ['en', 'es'] })
```

## Usage in App Router
Simply add the `t` attribute to any HTML element in your Client Components:

```tsx
'use client'
import { useLumina } from '@continuouslabs/lumina-react'

export default function Page() {
  const { setLocale } = useLumina()
  
  return (
    <div>
      <h1 t>Lumina + Next.js</h1>
      <button onClick={() => setLocale('es')}>Español</button>
    </div>
  )
}
```

## Key Benefits
- **Zero Hydration Mismatch:** Standardized state management prevents flashing content.
- **Server-Side Compatibility:** Global singleton architecture ensures consistent state.
- **Developer Flow:** Use standard HTML tags with the `t` attribute; forget about manual translation JS/JSON files until you are ready to translate.
