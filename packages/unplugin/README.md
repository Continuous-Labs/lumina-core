# @continuouslabs/unplugin-lumina

> The Zero-Config build engine for the Lumina i18n ecosystem.

Lumina Unplugin is the automated core that handles compile-time text extraction and dynamic configuration inlining. It supports Vite, Webpack, Rollup, and Esbuild out-of-the-box.

## 💎 Features

- **Direct Inlining**: Zero-Config architecture that injects locale data at build time.
- **Auto-Extraction**: Scans your source code for `t` and `i18n` attributes.
- **Universal Support**: Works anywhere `unplugin` can run.
- **Frictionless DX**: No manual dictionary imports or management needed.

## 🚀 Installation

```bash
pnpm add -D @continuouslabs/unplugin-lumina
```

## ⚙️ Configuration

### Vite
```typescript
import { defineConfig } from 'vite'
import { vitePlugin as Lumina } from '@continuouslabs/unplugin-lumina'

export default defineConfig({
  plugins: [Lumina()]
})
```

### Webpack (Next.js)
```javascript
const { webpackPlugin: Lumina } = require('@continuouslabs/unplugin-lumina')

module.exports = {
  webpack: (config) => {
    config.plugins.push(Lumina())
    return config
  }
}
```

## 🛠️ The Inlining Strategy

Unlike traditional i18n systems that require runtime fetches or virtual module resolution, Lumina inlines your configuration and messages directly into your code during transformation. This ensures maximum performance and complete stability across all build tools.

---

<p align="center">
  Developed with focus by <b>Continuous Labs</b>
</p>
