var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, signal, InjectionToken } from '@angular/core';
import { initLumina } from '@continuouslabs/lumina';
/**
 * Injection token for Lumina configuration.
 */
export const LUMINA_CONFIG = new InjectionToken('LUMINA_CONFIG');
/**
 * Lumina Service for Angular
 *
 * Provides a directive-safe and component-safe way to access translations
 * using Angular's native Signals API.
 */
let LuminaService = class LuminaService {
    constructor() {
        /**
         * Reactive signal representing the current locale.
         * This allows templates to automatically re-render when the language changes.
         */
        this.locale = signal('en');
        // We try to find the global instance established by provideLumina() or the unplugin
        this._client = globalThis.__lumina;
        if (!this._client) {
            // Fallback: initialize a default client if none exists
            this._client = initLumina();
            if (typeof globalThis !== 'undefined') {
                globalThis.__lumina = this._client;
            }
        }
        // Sync initial state
        this.locale.set(this._client.locale);
        // Subscribe to Lumina's core Signal and sync back to Angular's Signal
        this._client.subscribe(() => {
            this.locale.set(this._client.locale);
        });
    }
    /**
     * Returns the core Lumina instance for advanced manipulation.
     */
    get client() {
        return this._client;
    }
    /**
     * Sets the global application language.
     */
    setLocale(locale) {
        this._client.locale = locale;
        // The subscriber will automatically update this.locale signal
    }
    /**
     * Translates a text string using the current active locale.
     *
     * @param id The FNV-1a hash of the text.
     * @param defaultValue The fallback text.
     * @returns The translated string.
     */
    translate(id, defaultValue) {
        return this._client.getText(id, defaultValue);
    }
};
LuminaService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [])
], LuminaService);
export { LuminaService };
//# sourceMappingURL=lumina.service.js.map