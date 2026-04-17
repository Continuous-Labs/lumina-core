/**
 * Lumina Svelte Adapter
 * 
 * Official Svelte integration for Lumina i18n, optimized for Svelte 5 Runes.
 * It provides a reactive context bridge between Lumina's Signals and Svelte's reactivity.
 */

import { getContext, setContext } from 'svelte'
import { initLumina, type LuminaClient, type LuminaOptions } from '@continuouslabs/lumina'

// Context key for Svelte's context API
const LUMINA_KEY = Symbol('lumina')

export interface LuminaSvelteState {
  locale: string
  setLocale: (newLocale: string) => void
  client: LuminaClient
}

/**
 * Initializes Lumina for a Svelte application.
 * Should be called in the root component (e.g., App.svelte).
 */
export function createLumina(options?: LuminaOptions) {
  // Initialize core client
  const client = initLumina(options)

  // Attach to globalThis for the compiler (unplugin)
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__lumina = client
  }

  // Create a reactive state using Svelte 5 Runes if available, 
  // or a custom reactive object that Svelte can track.
  // Note: We use the Svelte 'runes' approach ($state) implicitly 
  // by providing a getter/setter interface.
  
  let currentLocale = client.locale

  const state: LuminaSvelteState = {
    get locale() {
      return currentLocale
    },
    set locale(v: string) {
      currentLocale = v
      client.locale = v
    },
    setLocale(newLocale: string) {
      this.locale = newLocale
    },
    client
  }

  // Subscribe to core changes to keep Svelte state in sync
  client.subscribe(() => {
    currentLocale = client.locale
  })

  // Set context for child components
  setContext(LUMINA_KEY, state)

  return state
}

/**
 * Access Lumina state in any Svelte component.
 */
export function useLumina(): LuminaSvelteState {
  const state = getContext<LuminaSvelteState>(LUMINA_KEY)
  
  if (!state) {
    // If context isn't found, we attempt to use the global singleton
    // but warn the user since they might miss reactivity.
    const globalClient = (globalThis as any).__lumina as LuminaClient
    
    if (globalClient) {
      return {
        locale: globalClient.locale,
        setLocale: (l) => { globalClient.locale = l },
        client: globalClient
      }
    }
    
    throw new Error('useLumina must be used after createLumina() has been called in a parent component.')
  }
  
  return state
}
