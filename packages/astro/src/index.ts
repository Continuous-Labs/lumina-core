import type { AstroIntegration } from 'astro'
import { LuminaOptions } from '@continuouslabs/lumina'

/**
 * Lumina Astro Integration
 * Provides zero-config i18n support for Astro projects.
 */
export default function lumina(options: LuminaOptions = {}): AstroIntegration {
  return {
    name: '@continuouslabs/lumina-astro',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        // Inject the initialization script to the client
        injectScript('page', `
          import { initLumina } from '@continuouslabs/lumina';
          window.__lumina = initLumina(${JSON.stringify(options)});
          console.log('[Lumina] Astro integration initialized');
        `);
      },
    },
  }
}
