# Lumina Vanilla Demo 🍦

A professional showcase of **Lumina i18n** for pure Javascript/Typescript environments.

## The Simplest i18n Solution
- **Framework Agnostic:** Pure JavaScript logic that works anywhere.
- **Universal Init:** Automatic initialization with browser language detection.
- **Ultra-Lightweight:** Less than 2KB of runtime code.
- **Zero-Dependency Core:** Only relies on the ultra-lightweight `@continuouslabs/lumina` runtime.
- **Zero-Config Extraction:** Even in vanilla JS, the Lumina compiler detects `t` attributes in template literals and extracts them automatically.
- **Universal Singletons:** Uses `globalThis.__lumina` to provide a consistent state across different vanilla modules.

## Running the demo
```bash
pnpm install
pnpm run dev
```

## How it works
This demo uses the `unplugin` to transform standard template literals:

```typescript
import { initLumina } from '@continuouslabs/lumina'
const client = initLumina()

document.body.innerHTML = `
  <h1 t>Hello World</h1>
`
```

The compiler transforms the above into a reactive call that renders the correct translation based on the current locale.

## Key Advantages
- **No VDOM required:** Works directly with the browser's DOM.
- **Tiny footprint:** Optimized for performance-critical applications.
- **AI-Powered:** Ready to be translated 100% automatically via the Lumina CLI.
