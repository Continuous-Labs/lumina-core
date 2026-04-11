import type { AstroIntegration } from 'astro'
import { LuminaOptions } from '@continuouslabs/lumina'

/**
 * Lumina Astro Integration
 * Provides zero-config i18n support for Astro projects.
 */
export default function lumina(options: LuminaOptions): AstroIntegration {
  return {
    name: '@continuouslabs/lumina-astro',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        // Inject the initialization script to the client
        // This ensures window.__lumina is available for compiled t markers
        injectScript('page', `
          import { initLumina } from '@continuouslabs/lumina';
          const options = ${JSON.stringify(options)};
          window.__lumina = initLumina(options);
          console.log('[Lumina] Astro integration initialized');
        `);
      },
    },
  }
}
