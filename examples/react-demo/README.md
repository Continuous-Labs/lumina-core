# Lumina React Demo ⚛️

This is a high-fidelity showcase of **Lumina i18n** integrated with React and Vite.

## Key Features
- **Zero-Config Extraction:** Notice the `t` attribute in `App.tsx`. The compiler automatically detects these and generates persistent IDs based on content.
- **Browser Language Auto-Detection:** Automatically synchronizes the UI with the user's browser language on first load.
- **Signals-Based Reactivity:** The UI updates instantly when calling `setLocale` without a full component re-render, leveraging Lumina's reactive core.
- **Premium UI:** A modern dark-mode dashboard reflecting the **Obsidian Liquid** design system.

## How to use
1. **Explore the code:** Check `src/App.tsx`. You'll find clean UI code without manual `t('home.welcome')` mappings.
2. **Check the locales:** Open `.lumina/locales/original.json` to see the extracted source strings.

## Running the demo
```bash
pnpm install
pnpm run dev
```

## Setup details
The project is configured via `vite.config.ts`:

```typescript
import { vitePlugin as lumina } from '@continuouslabs/unplugin-lumina'

export default defineConfig({
  plugins: [react(), lumina()]
})
```

And initialized in `src/App.tsx` using `LuminaProvider`:

```tsx
<LuminaProvider>
  <Dashboard />
</LuminaProvider>
```

## Advantages
- **No VDOM Overhead:** Fast translation updates.
- **AI-Native:** Designed to be translated automatically by the Lumina CLI.
- **Developer Experience:** Focus on features, not translation keys.
