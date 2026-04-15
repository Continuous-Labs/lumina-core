import { App, inject, ref, onMounted, onUnmounted, Plugin } from 'vue'
import { LuminaClient, initLumina, createEffect, LuminaOptions } from '@continuouslabs/lumina'

const LuminaSymbol = Symbol('lumina')

/**
 * Vue Plugin for Lumina i18n
 */
export const createLumina = (options?: LuminaOptions): Plugin => {
  return {
    install(app: App) {
      const client = initLumina(options || { locale: 'en', messages: {} })
      
      // Automatic global injection for Zero Config compiler support
      if (typeof window !== 'undefined') {
        (window as any).__lumina = client
      }
      
      app.provide(LuminaSymbol, client)
      app.config.globalProperties.$lumina = client
    }
  }
}

/**
 * Composable to access Lumina client and reactive locale
 */
export function useLumina() {
  const client = inject<LuminaClient>(LuminaSymbol)
  if (!client) {
    throw new Error('Lumina plugin not installed')
  }

  const locale = ref(client.locale)

  // Bridge Core Signal to Vue Ref
  let cleanup: (() => void) | null = null
  
  onMounted(() => {
    // We wrap the effect to update the ref
    createEffect(() => {
      locale.value = client.locale
    })
  })

  return {
    client,
    locale,
    setLocale: (newLocale: string) => {
      client.locale = newLocale
    }
  }
}
