import { Provider, APP_INITIALIZER } from '@angular/core'
import { initLumina, LuminaOptions } from '@continuouslabs/lumina'
import { LuminaService } from './lumina.service'

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
export function provideLumina(options: LuminaOptions = {}): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        return () => {
          // Initialize the core client
          const client = initLumina(options)
          
          // Inject into globalThis for the unplugin-generated code
          if (typeof globalThis !== 'undefined') {
            (globalThis as any).__lumina = client
          }
          
          return Promise.resolve()
        }
      },
      multi: true
    },
    LuminaService
  ]
}
