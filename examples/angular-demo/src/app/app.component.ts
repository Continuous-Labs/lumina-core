import { Component, inject } from '@angular/core'
import { LuminaDirective, LuminaService } from '@continuouslabs/lumina-angular'

@Component({
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
export class AppComponent {
  public lumina = inject(LuminaService)
}
