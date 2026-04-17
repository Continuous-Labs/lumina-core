var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe, inject } from '@angular/core';
import { LuminaService } from './lumina.service';
/**
 * Lumina Pipe
 *
 * Translates a key or original text using the standard Angular pipe syntax.
 *
 * Usage:
 * <p>{{ 'Hello World' | lumina }}</p>
 * <p>{{ 'id_7a8b' | lumina:'Default Text' }}</p>
 */
let LuminaPipe = class LuminaPipe {
    constructor() {
        this.lumina = inject(LuminaService);
    }
    /**
     * Transforms the input into a translated string.
     *
     * @param value The text or hash to translate.
     * @param defaultValue Optional fallback text if value is a hash.
     * @returns The translated content.
     */
    transform(value, defaultValue) {
        // We access the signal to ensure Angular tracks this pipe for re-evaluation
        // when the locale changes.
        this.lumina.locale();
        // If defaultValue is provided, 'value' is assumed to be the hash
        if (defaultValue) {
            return this.lumina.translate(value, defaultValue);
        }
        // Otherwise, we calculate a fallback based on the value itself
        // (Note: Hashing every pipe call might be slow, but this aligns with 
        // the "Zero-Config" philosophy for manual calls).
        return this.lumina.translate('', value);
    }
};
LuminaPipe = __decorate([
    Pipe({
        name: 'lumina',
        standalone: true,
        pure: false // Must be impure to react to locale signal changes
    })
], LuminaPipe);
export { LuminaPipe };
//# sourceMappingURL=lumina.pipe.js.map