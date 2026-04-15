# @continuouslabs/lumina-next

> Next.js adapter for the Lumina i18n ecosystem.

Lumina Next provides specialized support for the Next.js ecosystem, ensuring that your internationalization state is synchronized and hydration-safe across Server and Client Components.

## 💎 Features

- **Hydration Safe**: Built-in prevention for "Text content did not match" errors.
- **Webpack Optimized**: Deep integration with the Next.js build pipeline.
- **Singleton Sync**: Consistent state across different rendering phases.

## 🚀 Installation

```bash
pnpm add @continuouslabs/lumina @continuouslabs/lumina-next
```

## 📖 Usage

### 1. Initialize in layout.tsx

```tsx
import { LuminaProvider } from '@continuouslabs/lumina-next'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LuminaProvider>
          {children}
        </LuminaProvider>
      </body>
    </html>
  )
}
```

### 2. Standard usage in Pages

Simply use the `t` attribute or the `useLumina` hook exactly as you would in standard React. Lumina handles the Next.js specifics automatically.

---

<p align="center">
  Developed with focus by <b>Continuous Labs</b>
</p>
