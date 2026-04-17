var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ElementRef, Input, effect, inject } from '@angular/core';
import { LuminaService } from './lumina.service';
/**
 * Lumina Directive
 *
 * Supports both the 't' and 'i18n' attributes.
 *
 * Usage:
 * <p t>Hello World</p>
 * <p i18n>Hello World</p>
 *
 * In production, the Lumina Compiler (unplugin) will automatically
 * provide the hash to the attribute:
 * <p t="id_7a8b">Hello World</p>
 */
let LuminaDirective = class LuminaDirective {
    constructor() {
        this.el = inject(ElementRef);
        this.lumina = inject(LuminaService);
        this.originalText = '';
        /**
         * Re-render whenever the locale changes.
         * We use Angular's effect() to subscribe to the Lumina signal.
         */
        effect(() => {
            // Accessing the signal marks this effect as a dependency
            this.lumina.locale();
            this.updateTranslation();
        });
    }
    ngOnInit() {
        // Capture the original text on initialization
        this.originalText = this.el.nativeElement.textContent?.trim() || '';
        this.updateTranslation();
    }
    updateTranslation() {
        const hash = this.tHash || this.i18nHash;
        if (hash) {
            // If we have a hash from the compiler, translate it
            const translated = this.lumina.translate(hash, this.originalText);
            this.el.nativeElement.textContent = translated;
        }
        else if (this.originalText) {
            // Dev mode: if no hash is present, just keep original but check if it's in the current locale manually?
            // Actually, Lumina prefers unplugin for extraction. 
            // This fallback keeps the original text visible.
            this.el.nativeElement.textContent = this.originalText;
        }
    }
};
__decorate([
    Input('t'),
    __metadata("design:type", String)
], LuminaDirective.prototype, "tHash", void 0);
__decorate([
    Input('i18n'),
    __metadata("design:type", String)
], LuminaDirective.prototype, "i18nHash", void 0);
LuminaDirective = __decorate([
    Directive({
        selector: '[t], [i18n]',
        standalone: true
    }),
    __metadata("design:paramtypes", [])
], LuminaDirective);
export { LuminaDirective };
//# sourceMappingURL=lumina.directive.js.map