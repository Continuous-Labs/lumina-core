import { defineConfig } from 'astro/config';
import luminaIntegration from '@continuouslabs/lumina-astro';
import { vitePlugin as luminaCompiler } from '@continuouslabs/unplugin-lumina';
// https://astro.build/config
export default defineConfig({
  integrations: [
    // 1. Initialized Lumina Client on the client-side
    luminaIntegration()
  ],
  vite: {
    plugins: [
      // 2. Add the compiler to transform .astro files
      // luminaCompiler()
    ]
  }
});
