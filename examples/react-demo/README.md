# Lumina React Demo ⚛️

This is a high-fidelity showcase of **Lumina i18n** integrated with React and Vite.

## Key Features
- **Zero-Config Extraction:** Notice the `t` attribute in `App.tsx`. The SWC compiler automatically detects these and generates persistent IDs.
- **Signals-Based Reactivity:** The UI updates instantly when calling `setLocale` without a full component re-render.
- **Premium UI:** A modern dark-mode dashboard using the Outfit font and glassmorphism.

## How to use
1. **Explore the code:** Check `src/App.tsx` and see how clean the UI code is. No `useTranslation` hooks or `t('key')` manual mapping.
2. **Check the locales:** Open `.lumina/locales/es.json` to see how the extracted strings are stored.

## Running the demo
```bash
pnpm install
pnpm run dev
```

## Setup details
The project is configured via `vite.config.ts`:
```typescript
import { vitePlugin as lumina } from 'unplugin-lumina-i18n'

export default defineConfig({
  plugins: [react(), lumina()]
})
```
And initialized in `src/App.tsx` using `LuminaProvider`.
