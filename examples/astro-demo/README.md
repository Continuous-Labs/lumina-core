# Lumina Astro Demo 🚀

This demo showcases **Lumina i18n**'s state-of-the-art integration for Astro projects.

## Zero-Config Static Extraction
- **Astro Components:** Translate `.astro` files effortlessly by adding the `t` attribute.
- **Client-Side Hydration:** Lumina automatically injects the necessary runtime client to switch languages without a page reload, even in static-first environments.
- **High-Performance Architecture:** The compiler extracts strings during build-time, keeping your runtime fast and efficient.

## Running the demo
```bash
pnpm install
pnpm run dev
```

## Setup details
The integration is registered in `astro.config.mjs`:
```javascript
import lumina from '@continuouslabs/lumina-astro';
export default defineConfig({
  integrations: [lumina({ locales: ['en', 'es'] })]
});
```

The `@continuouslabs/unplugin-lumina` compiler is automatically used by the integration to handle `.astro` file transformation.

## Key Features
- **Deterministic Hashing:** Persistent IDs based on content, avoiding manual mapping.
- **Hybrid i18n:** Handles both server-rendered HTML and client-side reactive components.
- **Browser Auto-Detection:** Automatically synchronizes the UI with the user's browser language.
- **Isomorphic Core:** Uses the same hashing engine on the server and client.
