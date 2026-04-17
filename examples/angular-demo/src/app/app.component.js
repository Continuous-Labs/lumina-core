var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, inject } from '@angular/core';
import { LuminaDirective, LuminaService } from '@continuouslabs/lumina-angular';
let AppComponent = class AppComponent {
    constructor() {
        this.lumina = inject(LuminaService);
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        standalone: true,
        imports: [LuminaDirective],
        template: `
    <div style="font-family: sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto;">
      <h1 t>Lumina Angular Integration</h1>
      <p t>Experience the future of localized Angular applications with Signals.</p>
      
      <div style="margin-top: 2rem; padding: 1rem; background: #f4f4f4; border-radius: 8px;">
        <p>Current Locale: <strong>{{ lumina.locale() }}</strong></p>
        
        <button (click)="lumina.setLocale('en')" style="margin-right: 0.5rem; padding: 0.5rem 1rem;">English</button>
        <button (click)="lumina.setLocale('es')" style="padding: 0.5rem 1rem;">Español</button>
      </div>

      <div style="margin-top: 2rem;">
        <h3 t>Dynamic Content Example</h3>
        <p t>Lumina makes it easy to build global apps without the boilerplate.</p>
      </div>
    </div>
  `
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map