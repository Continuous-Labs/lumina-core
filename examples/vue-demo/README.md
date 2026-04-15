# Lumina Vue Demo 🖖

A premium showcase of **Lumina i18n** for Vue 3 using the Composition API.

## High-Performance i18n
- **Declarative Templates:** Translate your Vue templates simply by adding the `t` attribute to any tag.
- **Composition API:** Use the `useLumina()` composable to access and change the current locale reactively.
- **Lazy Loading:** Localization files are bundled efficiently, keeping your initial bundle light.

## Running the demo
```bash
pnpm install
pnpm run dev
```

## Setup details
Lumina is registered as a standard Vue plugin in `src/main.ts`:

```typescript
import { createLumina } from '@continuouslabs/lumina-vue'
import App from './App.vue'

const app = createApp(App)
app.use(createLumina({ locales: ['en', 'es'] }))
app.mount('#app')
```

The build-time extraction and transformation are handled by `@continuouslabs/unplugin-lumina` in `vite.config.ts`:

```typescript
import { vitePlugin as lumina } from '@continuouslabs/unplugin-lumina'

export default defineConfig({
  plugins: [vue(), lumina()]
})
```

## Key Benefits
- **Zero Manual Mappings:** Stop managing huge translation keys lists.
- **Native Reactivity:** Integrated with Vue's internal reactivity system.
- **Obsidian Liquid Branding:** Modern dark-mode experience out of the box.
