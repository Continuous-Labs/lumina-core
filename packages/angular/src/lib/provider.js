import { APP_INITIALIZER } from '@angular/core';
import { initLumina } from '@continuouslabs/lumina';
import { LuminaService } from './lumina.service';
/**
 * Provides Lumina i18n to the Angular application.
 *
 * Usage in app.config.ts:
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideLumina({
 *       defaultLocale: 'en',
 *       locales: ['en', 'es']
 *     })
 *   ]
 * };
 * ```
 */
export function provideLumina(options = {}) {
    return [
        {
            provide: APP_INITIALIZER,
            useFactory: () => {
                return () => {
                    // Initialize the core client
                    const client = initLumina(options);
                    // Inject into globalThis for the unplugin-generated code
                    if (typeof globalThis !== 'undefined') {
                        globalThis.__lumina = client;
                    }
                    return Promise.resolve();
                };
            },
            multi: true
        },
        LuminaService
    ];
}
//# sourceMappingURL=provider.js.map