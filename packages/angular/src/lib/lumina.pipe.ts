import { Pipe, PipeTransform, inject } from '@angular/core'
import { LuminaService } from './lumina.service'

/**
 * Lumina Pipe
 * 
 * Translates a key or original text using the standard Angular pipe syntax.
 * 
 * Usage:
 * <p>{{ 'Hello World' | lumina }}</p>
 * <p>{{ 'id_7a8b' | lumina:'Default Text' }}</p>
 */
@Pipe({
  name: 'lumina',
  standalone: true,
  pure: false // Must be impure to react to locale signal changes
})
export class LuminaPipe implements PipeTransform {
  private lumina = inject(LuminaService)

  /**
   * Transforms the input into a translated string.
   * 
   * @param value The text or hash to translate.
   * @param defaultValue Optional fallback text if value is a hash.
   * @returns The translated content.
   */
  transform(value: string, defaultValue?: string): string {
    // We access the signal to ensure Angular tracks this pipe for re-evaluation
    // when the locale changes.
    this.lumina.locale()
    
    // If defaultValue is provided, 'value' is assumed to be the hash
    if (defaultValue) {
      return this.lumina.translate(value, defaultValue)
    }
    
    // Otherwise, we calculate a fallback based on the value itself
    // (Note: Hashing every pipe call might be slow, but this aligns with 
    // the "Zero-Config" philosophy for manual calls).
    return this.lumina.translate('', value) 
  }
}
