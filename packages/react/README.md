# @continuouslabs/lumina-react

> React adapter for the Lumina i18n ecosystem.

Lumina React provides a high-level `LuminaProvider` and the `useLumina` hook to bring reactive internationalization to React applications with minimal boilerplate.

## 💎 Features

- **Context-Powered**: Global locale state shared across the component tree.
- **Hook-Based UI**: Simple `useLumina` hook for locale management.
- **Zero-Config Aware**: Automatically picks up configuration injected by the Lumina Unplugin.
- **Next.js Compatible**: Optimized for both client and server components.

## 🚀 Installation

```bash
pnpm add @continuouslabs/lumina @continuouslabs/lumina-react
```

## 📖 Usage

### 1. Wrap your application

```tsx
import { LuminaProvider } from '@continuouslabs/lumina-react'

export function App() {
  return (
    <LuminaProvider>
      <header t>Welcome to Lumina</header>
      <MainComponent />
    </LuminaProvider>
  )
}
```

### 2. Manage locale in components

```tsx
import { useLumina } from '@continuouslabs/lumina-react'

export function LanguagePicker() {
  const { currentLocale, locales, setLocale } = useLumina()

  return (
    <select value={currentLocale} onChange={(e) => setLocale(e.target.value)}>
      {locales.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
    </select>
  )
}
```

## 🛠️ The 't' Attribute

When using the Lumina Unplugin, you can mark any JSX element with a `t` or `i18n` attribute. The unplugin will automatically extract the content and replace it with a reactive translation call.

---

<p align="center">
  Developed with focus by <b>Continuous Labs</b>
</p>
