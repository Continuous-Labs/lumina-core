/**
 * Lumina Core
 * 
 * This package is the heartbeat of the Lumina i18n ecosystem. 
 * It's intentionally kept small, zero-dependency, and high-performance.
 * Its main job is to provide a reliable hashing mechanism and a 
 * framework-agnostic reactivity system based on the Signals pattern.
 */

/**
 * Stable 64-bit FNV-1a hash implementation.
 * 
 * Why FNV-1a? Because it's extremely fast and provides excellent 
 * distribution for small strings like translation keys. 
 * 
 * We use BigInt to ensure 64-bit precision, as standard JavaScript 
 * numbers lose precision after 53 bits (Number.MAX_SAFE_INTEGER).
 * 
 * @param str The source text to hash.
 * @returns A consistent 16-character hex string (e.g., "id_7a8b...").
 */
export const hash64 = (str: string): string => {
  // FNV-1a offset basis for 64-bit
  let h = BigInt('0xcbf29ce484222325')
  // FNV-1a prime for 64-bit
  const prime = BigInt('0x100000001b3')
  
  for (let i = 0; i < str.length; i++) {
    // XOR with the byte (char code)
    h = h ^ BigInt(str.charCodeAt(i))
    // Multiply by the prime and mask to keep it within 64 bits
    h = (h * prime) & BigInt('0xffffffffffffffff')
  }
  
  // Return padded hex string to ensure uniform length
  return h.toString(16).padStart(16, '0')
}

// --- Signals Implementation ---
// A minimal reactivity foundation that allows adapters (React, Vue, etc.) 
// to listen for locale changes without being tightly coupled.

type Subscriber = () => void
let activeEffect: Subscriber | null = null

/**
 * Creates a reactive signal.
 * 
 * This is the same pattern used by modern frameworks like Solid or Preact.
 * It tracks which 'effect' is currently running and adds it as a subscriber
 * whenever the signal's value is read.
 */
export function createSignal<T>(initialValue: T) {
  let value = initialValue
  const subscribers = new Set<Subscriber>()

  return {
    get value() {
      // Automatic dependency tracking
      if (activeEffect) {
        subscribers.add(activeEffect)
      }
      return value
    },
    set value(newValue: T) {
      // Only trigger if the value actually changed to prevent render loops
      if (value !== newValue) {
        value = newValue
        subscribers.forEach(sub => sub())
      }
    },
    /** 
     * Allows manual subscription to changes. 
     * Returns an unsubscribe function for cleanup. 
     */
    subscribe(fn: Subscriber): () => void {
      subscribers.add(fn)
      return () => { subscribers.delete(fn) }
    }
  }
}

/**
 * Runs a function and automatically re-runs it whenever any 
 * signal accessed inside it changes.
 */
export function createEffect(fn: Subscriber) {
  activeEffect = fn
  fn() // Initial run to collect dependencies
  activeEffect = null
}

// --- Lumina Client ---

/**
 * Configuration options for the Lumina runtime.
 */
export interface LuminaOptions {
  locale?: string
  defaultLocale?: string
  fallbackLocale?: string
  messages?: Record<string, Record<string, string>>
}

/**
 * The primary runtime class for Lumina.
 * 
 * This class is a singleton in most applications, managed by 
 * globalThis.__lumina. High-level adapters (React/Vue) interact 
 * with this instance to fetch translations and change locales.
 */
export class LuminaClient {
  // Reactive state for the current locale
  private _locale = createSignal('en')
  // Internal dictionary store
  private _messages: Record<string, Record<string, string>> = {}
  // Default locale to use if a translation is missing in the primary locale
  private _fallbackLocale = 'en'

  constructor(options: LuminaOptions = {}) {
    this._locale.value = options.locale || options.defaultLocale || 'en'
    this._messages = options.messages || {}
    this._fallbackLocale = options.fallbackLocale || options.defaultLocale || 'en'
  }

  /**
   * Technical alias for 'locale' to align with external API documentation.
   */
  get setLanguage() { return this.locale }
  set setLanguage(val: string) { this.locale = val }

  /**
   * Get or set the current locale reactively.
   */
  get locale() {
    return this._locale.value
  }

  set locale(val: string) {
    this._locale.value = val
  }

  /**
   * The core method used to retrieve translations.
   * 
   * This method is NOT typically called manually by developers. 
   * Instead, the Lumina Compiler (unplugin) re-writes your code 
   * to call this method with the correct hash and default text.
   * 
   * @param id The unique FNV-1a hash of the text.
   * @param defaultValue The original text to display if no translation is found.
   */
  getText(id: string, defaultValue: string): string {
    const locale = this._locale.value
    // Try primary locale -> then fallback locale -> then default value
    const message = this._messages[locale]?.[id] || this._messages[this._fallbackLocale]?.[id]
    return message || defaultValue
  }

  /**
   * Merges new translations into the existing store.
   * 
   * Use this for lazy-loading language chunks or updating 
   * dictionaries from an Edge API.
   */
  loadMessages(locale: string, messages: Record<string, string>) {
    this._messages[locale] = {
      ...(this._messages[locale] || {}),
      ...messages
    }
    
    // If we updated the current locale, we force a reactivity trigger
    if (this._locale.value === locale) {
      // Signals only notify on change, so we perform a "flicker" update
      const current = this._locale.value
      this._locale.value = ''
      this._locale.value = current
    }
  }

  /**
   * High-level subscription method.
   * 
   * This is designed for React's useSyncExternalStore or 
   * any generic event-driven state management.
   */
  subscribe(callback: () => void): () => void {
    return this._locale.subscribe(callback)
  }
}

/**
 * Global singleton instance used by the compiler and adapters.
 */
export let lumina: LuminaClient | null = null

/**
 * Initializes the global Lumina instance.
 * 
 * In zero-config mode, this is called automatically by the 
 * injected scripts. For customized setups, developers can call this 
 * manually in their entry point.
 */
export const initLumina = (options: LuminaOptions = {}) => {
  lumina = new LuminaClient(options)
  return lumina
}
