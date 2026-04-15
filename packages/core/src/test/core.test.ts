import { describe, it, expect, vi } from 'vitest'
import { hash64, createSignal, createEffect, LuminaClient, initLumina } from '../index.js'

describe('Lumina Core', () => {
  describe('hashing', () => {
    it('should generate consistent 64-bit hashes', () => {
      const input = 'Hello World'
      const h1 = hash64(input)
      const h2 = hash64(input)
      expect(h1).toBe(h2)
      expect(h1.length).toBe(16)
    })

    it('should generate different hashes for different inputs', () => {
      expect(hash64('A')).not.toBe(hash64('B'))
    })
  })

  describe('signals', () => {
    it('should trigger effects when values change', () => {
      const count = createSignal(0)
      const callback = vi.fn()
      
      createEffect(() => {
        callback(count.value)
      })

      expect(callback).toHaveBeenCalledWith(0)
      
      count.value = 1
      expect(callback).toHaveBeenCalledWith(1)
    })

    it('should not trigger effects when value is same', () => {
      const count = createSignal(10)
      const callback = vi.fn()
      
      createEffect(() => {
        callback(count.value)
      })
      
      count.value = 10
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('LuminaClient', () => {
    it('should resolve translations correctly', () => {
      const client = new LuminaClient({
        locale: 'en',
        messages: {
          en: { 'id_1': 'Hello' },
          es: { 'id_1': 'Hola' }
        }
      })

      expect(client.getText('id_1', 'Default')).toBe('Hello')
      
      client.locale = 'es'
      expect(client.getText('id_1', 'Default')).toBe('Hola')
    })

    it('should support setLanguage alias as getter/setter', () => {
      const client = new LuminaClient({ locale: 'en' })
      expect(client.setLanguage).toBe('en')
      
      client.setLanguage = 'es'
      expect(client.locale).toBe('es')
      expect(client.setLanguage).toBe('es')
    })

    it('should fallback to default locale if translation is missing', () => {
      const client = new LuminaClient({
        locale: 'fr',
        fallbackLocale: 'en',
        messages: {
          en: { 'id_1': 'Hello' }
        }
      })

      expect(client.getText('id_1', 'Default')).toBe('Hello')
    })

    it('should support zero-config initialization', () => {
      const client = new LuminaClient()
      expect(client.locale).toBe('en')
      expect(client.getText('any', 'fallback')).toBe('fallback')
    })
  })

  describe('initLumina', () => {
    it('should initialize a global instance with zero config', () => {
      const client = initLumina()
      expect(client.locale).toBe('en')
    })

    it('should accept custom options', () => {
      const client = initLumina({ defaultLocale: 'es' })
      expect(client.locale).toBe('es')
    })
  })

  describe('Reactivity & State', () => {
    it('should notify subscribers on locale change', () => {
      const client = new LuminaClient({ locale: 'en' })
      const callback = vi.fn()
      client.subscribe(callback)
      
      client.locale = 'es'
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should handle missing message objects gracefully', () => {
      const client = new LuminaClient({ 
        locale: 'en',
        messages: undefined 
      })
      expect(client.getText('any', 'fallback')).toBe('fallback')
    })

    it('should react to loadMessages for the current locale', () => {
      const client = new LuminaClient({ locale: 'en' })
      const callback = vi.fn()
      client.subscribe(callback)

      client.loadMessages('en', { 'hello': 'World' })
      expect(callback).toHaveBeenCalled()
      expect(client.getText('hello', '')).toBe('World')
    })
  })
})
