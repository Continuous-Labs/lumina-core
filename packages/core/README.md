# @continuouslabs/lumina

> The reactive core of the Lumina i18n ecosystem.

Lumina Core provides the fundamental translation logic, singleton state management, and reactive hooks used by all framework adapters. It is designed for high-performance, SSR-safe internationalization with zero overhead.

## 💎 Features

- **Singleton Architecture**: Unified state across all modules via `globalThis.__lumina`.
- **Reactive Engine**: Atomic updates for locale changes.
- **SSR-Safe**: Built-in protection against hydration mismatches.
- **Type-Safe**: Complete TypeScript support for locales and keys.

## 🚀 Installation

```bash
pnpm add @continuouslabs/lumina
```

## 📖 Basic Usage

While most users will use a framework adapter, the core can be used in any environment:

```typescript
import { initLumina, t } from '@continuouslabs/lumina'

// Initialize the singleton
initLumina({
  locale: 'en',
  messages: {
    en: { "id_123": "Hello World" }
  }
})

// Use the global translation hook
console.log(t('Hello World'))
```

## 🛠️ State Management

Lumina uses a specialized singleton pattern on `globalThis` to ensure that even in complex builds (like Next.js or Astro), there is only one source of truth for your application's localization state.

---

<p align="center">
  Developed with focus by <b>Continuous Labs</b>
</p>
