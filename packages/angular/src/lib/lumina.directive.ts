import { Directive, ElementRef, Input, OnInit, effect, inject } from '@angular/core'
import { LuminaService } from './lumina.service'

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
@Directive({
  selector: '[t], [i18n]',
  standalone: true
})
export class LuminaDirective implements OnInit {
  private el = inject(ElementRef)
  private lumina = inject(LuminaService)
  
  /** 
   * The unique hash provided by the compiler.
   * If not provided, the directive will calculate it from the text content.
   */
  @Input('t') tHash?: string
  @Input('i18n') i18nHash?: string

  private originalText: string = ''

  constructor() {
    /**
     * Re-render whenever the locale changes.
     * We use Angular's effect() to subscribe to the Lumina signal.
     */
    effect(() => {
      // Accessing the signal marks this effect as a dependency
      this.lumina.locale()
      this.updateTranslation()
    })
  }

  ngOnInit() {
    // Capture the original text on initialization
    this.originalText = this.el.nativeElement.textContent?.trim() || ''
    this.updateTranslation()
  }

  private updateTranslation() {
    const hash = this.tHash || this.i18nHash
    
    if (hash) {
      // If we have a hash from the compiler, translate it
      const translated = this.lumina.translate(hash, this.originalText)
      this.el.nativeElement.textContent = translated
    } else if (this.originalText) {
      // Dev mode: if no hash is present, just keep original but check if it's in the current locale manually?
      // Actually, Lumina prefers unplugin for extraction. 
      // This fallback keeps the original text visible.
      this.el.nativeElement.textContent = this.originalText
    }
  }
}
