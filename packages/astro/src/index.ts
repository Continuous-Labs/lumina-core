/**
 * Lumina Astro Integration
 * 
 * This package provides a zero-config integration for Astro. 
 * Its main responsibility is to automatically initialize the Lumina client 
 * on the client-side of every page, ensuring that translatable components 
 * (React, Vue, or pure Astro) have access to the global __lumina instance.
 */

import type { AstroIntegration } from 'astro'
import { LuminaOptions } from '@continuouslabs/lumina'

/**
 * Default export to be used in 'astro.config.mjs'.
 * 
 * Example:
 * ```js
 * import lumina from '@continuouslabs/lumina-astro';
 * export default defineConfig({
 *   integrations: [lumina({ locales: ['en', 'es'] })]
 * });
 * ```
 */
export default function lumina(options: LuminaOptions = {}): AstroIntegration {
  return {
    name: '@continuouslabs/lumina-astro',
    hooks: {
      /**
       * Injects a script that runs on every page.
       * 
       * Why 'injectScript'? Astro is island-based. To ensure that 
       * components from different frameworks (React islands, Vue islands) 
       * can speak the same language, we initialize Lumina as a global 
       * singleton that persists across client-side navigation.
       */
      'astro:config:setup': ({ injectScript }) => {
        // We inject the initialization script to the document's head
        injectScript('page', `
          import { initLumina } from '@continuouslabs/lumina';
          
          // We attach the client instance to globalThis. 
          // This allows the compiled 'getText' calls to function immediately
          // without needing framework-specific context in vanilla HTML parts.
          globalThis.__lumina = initLumina(${JSON.stringify(options)});
          
          console.log('[Lumina] Astro integration initialized');
        `);
      },
    },
  }
}
