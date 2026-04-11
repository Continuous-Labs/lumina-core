# Lumina Vue Demo 🖖

A premium showcase of **Lumina i18n** for Vue 3 using the Composition API.

## High-Performance i18n
- **Declarative Templates:** Translate your Vue templates simply by adding the `t` attribute.
- **Composition API:** Use the `useLumina()` composable to access and change the current locale reactively.
- **Lazy Loading:** Localization files are loaded as needed, keeping your initial bundle light.

## Running the demo
```bash
pnpm install
pnpm run dev
```

## Setup details
Lumina is installed as a standard Vue plugin in `src/main.ts`:
```typescript
import lumina from '@lumina-i18n/vue'
app.use(lumina, { locale: 'en', messages: { ... } })
```

The build-time extraction is handled by `unplugin-lumina-i18n` in `vite.config.ts`.
