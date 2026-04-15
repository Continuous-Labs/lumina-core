/**
 * Lumina Core
 * Zero-dependency utilities for hashing and reactive state.
 */

/**
 * Stable 64-bit FNV-1a hash implementation.
 * Returns a hex string representation.
 */
export const hash64 = (str: string): string => {
  let h = BigInt('0xcbf29ce484222325')
  const prime = BigInt('0x100000001b3')
  
  for (let i = 0; i < str.length; i++) {
    h = h ^ BigInt(str.charCodeAt(i))
    h = (h * prime) & BigInt('0xffffffffffffffff')
  }
  
  return h.toString(16).padStart(16, '0')
}

// --- Signals Implementation ---

type Subscriber = () => void
let activeEffect: Subscriber | null = null

export function createSignal<T>(initialValue: T) {
  let value = initialValue
  const subscribers = new Set<Subscriber>()

  return {
    get value() {
      if (activeEffect) {
        subscribers.add(activeEffect)
      }
      return value
    },
    set value(newValue: T) {
      if (value !== newValue) {
        value = newValue
        subscribers.forEach(sub => sub())
      }
    },
    /** Subscribe to changes externally. Returns unsubscriber. */
    subscribe(fn: Subscriber): () => void {
      subscribers.add(fn)
      return () => { subscribers.delete(fn) }
    }
  }
}

export function createEffect(fn: Subscriber) {
  activeEffect = fn
  fn()
  activeEffect = null
}

// --- Lumina Client ---

export interface LuminaOptions {
  locale?: string
  defaultLocale?: string
  fallbackLocale?: string
  messages?: Record<string, Record<string, string>>
}

export class LuminaClient {
  private _locale = createSignal('en')
  private _messages: Record<string, Record<string, string>> = {}
  private _fallbackLocale = 'en'

  constructor(options: LuminaOptions = {}) {
    this._locale.value = options.locale || options.defaultLocale || 'en'
    this._messages = options.messages || {}
    this._fallbackLocale = options.fallbackLocale || options.defaultLocale || 'en'
  }

  get locale() {
    return this._locale.value
  }

  set locale(value: string) {
    this._locale.value = value
  }

  /**
   * Main method to retrieve a translation.
   * Injected by the compiler.
   */
  getText(id: string, defaultValue: string): string {
    const locale = this._locale.value
    const message = this._messages[locale]?.[id] || this._messages[this._fallbackLocale]?.[id]
    return message || defaultValue
  }

  /**
   * Load translations dynamically.
   */
  loadMessages(locale: string, messages: Record<string, string>) {
    this._messages[locale] = {
      ...(this._messages[locale] || {}),
      ...messages
    }
    // Trigger reactivity if we are adding to the current locale
    if (this._locale.value === locale) {
      // We temporarily set it to empty and back to trigger subscribers
      // because our signals only trigger on actual value change.
      this._locale.value = ''
      this._locale.value = locale
    }
  }

  /**
   * Subscribe to locale changes. Returns an unsubscribe function.
   * Compatible with React's useSyncExternalStore subscribe signature.
   */
  subscribe(callback: () => void): () => void {
    return this._locale.subscribe(callback)
  }
}

// Singleton for global use (to be initialized by runtime adapters)
export let lumina: LuminaClient | null = null

export const initLumina = (options: LuminaOptions = {}) => {
  lumina = new LuminaClient(options)
  return lumina
}
