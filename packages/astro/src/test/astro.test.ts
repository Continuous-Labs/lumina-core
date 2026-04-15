import { describe, it, expect, vi } from 'vitest'
import lumina from '../index.js'

describe('Lumina Astro Adapter', () => {
  it('should define an integration with the correct name', () => {
    const integration = lumina()
    expect(integration.name).toBe('@continuouslabs/lumina-astro')
  })

  it('should inject the initialization script', () => {
    const injectScript = vi.fn()
    const options = { locale: 'es', defaultLocale: 'en' }
    const integration = lumina(options)
    
    // Trigger the hook
    if (integration.hooks?.['astro:config:setup']) {
      (integration.hooks['astro:config:setup'] as any)({ injectScript })
    }

    expect(injectScript).toHaveBeenCalledWith('page', expect.stringContaining('globalThis.__lumina'))
    expect(injectScript).toHaveBeenCalledWith('page', expect.stringContaining('initLumina({"locale":"es","defaultLocale":"en"})'))
  })
})
