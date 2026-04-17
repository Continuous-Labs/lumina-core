import { Injectable, signal, computed, inject, InjectionToken } from '@angular/core'
import { LuminaClient, initLumina, LuminaOptions } from '@continuouslabs/lumina'

/**
 * Injection token for Lumina configuration.
 */
export const LUMINA_CONFIG = new InjectionToken<LuminaOptions>('LUMINA_CONFIG')

/**
 * Lumina Service for Angular
 * 
 * Provides a directive-safe and component-safe way to access translations 
 * using Angular's native Signals API.
 */
@Injectable({
  providedIn: 'root'
})
export class LuminaService {
  private _client: LuminaClient
  
  /** 
   * Reactive signal representing the current locale.
   * This allows templates to automatically re-render when the language changes.
   */
  public locale = signal('en')

  constructor() {
    // We try to find the global instance established by provideLumina() or the unplugin
    this._client = (globalThis as any).__lumina

    if (!this._client) {
      // Fallback: initialize a default client if none exists
      this._client = initLumina()
      if (typeof globalThis !== 'undefined') {
        (globalThis as any).__lumina = this._client
      }
    }

    // Sync initial state
    this.locale.set(this._client.locale)

    // Subscribe to Lumina's core Signal and sync back to Angular's Signal
    this._client.subscribe(() => {
      this.locale.set(this._client.locale)
    })
  }

  /**
   * Returns the core Lumina instance for advanced manipulation.
   */
  get client(): LuminaClient {
    return this._client
  }

  /**
   * Sets the global application language.
   */
  setLocale(locale: string): void {
    this._client.locale = locale
    // The subscriber will automatically update this.locale signal
  }

  /**
   * Translates a text string using the current active locale.
   * 
   * @param id The FNV-1a hash of the text.
   * @param defaultValue The fallback text.
   * @returns The translated string.
   */
  translate(id: string, defaultValue: string): string {
    return this._client.getText(id, defaultValue)
  }
}
