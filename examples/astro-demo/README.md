# Lumina Astro Demo 🚀

This demo showcases **Lumina i18n**'s state-of-the-art integration for Astro projects.

## Zero-Config Static Extraction
- **Astro Components:** Translate `.astro` files effortlessly by adding the `t` attribute.
- **Client-Side Hydration:** Lumina automatically injects the necessary runtime client to switch languages without a page reload, even in static-first environments.
- **Full Context:** The compiler uses the file structure of your Astro project to give context hints to the AI translation engine.

## Running the demo
```bash
pnpm install
pnpm run dev
```

## Setup details
The integration is registered in `astro.config.mjs`:
```javascript
import lumina from '@lumina-i18n/astro';
export default defineConfig({
  integrations: [lumina({ locale: 'en' })]
});
```

The `unplugin-lumina-i18n` compiler is added to the `vite.plugins` section of the Astro config to handle `.astro` file transformation.
