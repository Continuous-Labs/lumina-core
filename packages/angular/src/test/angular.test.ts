import { describe, it, expect, beforeEach, vi } from 'vitest'
import { initLumina } from '@continuouslabs/lumina'

/**
 * Mocking the Angular environment for unit tests.
 * This MUST happen before importing the service.
 */
vi.mock('@angular/core', async () => {
  return {
    Injectable: () => () => {},
    InjectionToken: class { constructor(public name: string) {} },
    signal: (val: any) => {
      let current = val
      const s = () => current
      s.set = (v: any) => { current = v }
      return s
    },
    computed: (fn: any) => fn(),
    inject: () => ({}),
  }
})

// Import service AFTER the mock is established
import { LuminaService } from '../lib/lumina.service'

describe('Lumina Angular Adapter', () => {
  let service: LuminaService

  beforeEach(() => {
    // Reset the global singleton
    (globalThis as any).__lumina = initLumina({
      defaultLocale: 'en',
      locales: ['en', 'es'],
      messages: {
        es: {
          'id_hello': 'Hola'
        }
      }
    })
    
    // Manual instantiation for testing (ignoring DI for simple logic checks)
    service = new LuminaService()
  })

  it('should initialize with the correct default locale', () => {
    expect(service.locale()).toBe('en')
  })

  it('should react to locale changes in the core client', () => {
    service.client.locale = 'es'
    expect(service.locale()).toBe('es')
  })

  it('should update the core client when setLocale is called', () => {
    service.setLocale('es')
    expect(service.client.locale).toBe('es')
    expect(service.locale()).toBe('es')
  })

  it('should return translations correctly', () => {
    const result = service.translate('id_hello', 'Hello')
    service.setLocale('es')
    const resultEs = service.translate('id_hello', 'Hello')
    
    expect(result).toBe('Hello')
    expect(resultEs).toBe('Hola')
  })
})
