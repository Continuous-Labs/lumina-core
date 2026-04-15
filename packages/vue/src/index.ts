/**
 * Lumina Vue Adapter
 * 
 * This package provides the official Vue 3 integration for Lumina i18n.
 * It follows standard Vue patterns by providing a global plugin and a 
 * companion composable (hook) to handle reactive language updates.
 */

import { App, inject, ref, onMounted, onUnmounted, Plugin } from 'vue'
import { LuminaClient, initLumina, LuminaOptions } from '@continuouslabs/lumina'

/**
 * Unique symbol to avoid key collisions when using provide/inject.
 */
const LuminaSymbol = Symbol('lumina')

/**
 * Vue Plugin for Lumina i18n
 * 
 * When you use app.use(createLumina()), this plugin will:
 * 1. Initialize the singleton Lumina client.
 * 2. Attach it to globalThis for compiler-level support.
 * 3. Provide it to the entire Vue application via provide/inject.
 * 4. Add a $lumina global property for backward compatibility or options API use.
 */
export const createLumina = (options?: LuminaOptions): Plugin => {
  return {
    install(app: App) {
      // Create the core client instance
      const client = initLumina(options)
      
      // Inject into globalThis to allow the generated getText calls to find the client
      if (typeof globalThis !== 'undefined') {
        (globalThis as any).__lumina = client
      }
      
      // Make the client injectable in components
      app.provide(LuminaSymbol, client)
      // Optional: helpful for Options API or template-only access
      app.config.globalProperties.$lumina = client
    }
  }
}

/**
 * The standard Vue Composable (Hook) for Lumina.
 * 
 * Use this in your 'setup()' function or <script setup> to:
 * - Access the current 'locale' reactively.
 * - Change the language using 'setLocale'.
 * - Get access to the raw Lumina client instance.
 * 
 * This composable automatically handles lifecycle cleanup by 
 * unsubscribing from locale changes when the component is unmounted.
 */
export function useLumina() {
  const client = inject<LuminaClient>(LuminaSymbol)
  
  if (!client) {
    throw new Error('Lumina plugin not installed. Please register the Lumina plugin in your main app file.')
  }

  // We wrap the client's current locale in a Vue Ref to make it 
  // discoverable by Vue's reactivity system.
  const locale = ref(client.locale)

  /**
   * Sync mechanism.
   * On mount, we start listening for any changes to the Lumina client's state.
   */
  onMounted(() => {
    // Initial sync
    locale.value = client.locale
    
    // Subscribe to the global Signal
    const unsubscribe = client.subscribe(() => {
      // Whenever the language changes anywhere in the app, 
      // this ref updates, triggering a re-render of this component.
      locale.value = client.locale
    })
    
    // Safety first: stop listening when the component is destroyed
    onUnmounted(unsubscribe)
  })

  return {
    /** The core Lumina instance */
    client,
    /** Reactive ref containing the current language code (e.g., 'en') */
    locale,
    /** Function to update the language globally */
    setLocale: (newLocale: string) => {
      client.locale = newLocale
    }
  }
}
