import { describe, it, expect, vi } from 'vitest'
import { hash64, createSignal, createEffect, LuminaClient } from '../index.js'

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
  })
})
