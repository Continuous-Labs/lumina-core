import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createLumina, useLumina } from './index'
import * as svelte from 'svelte'

// Mock Svelte context functions
vi.mock('svelte', () => ({
  getContext: vi.fn(),
  setContext: vi.fn(),
}))

describe('Lumina Svelte Adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clean up global singleton
    if (typeof globalThis !== 'undefined') {
      delete (globalThis as any).__lumina
    }
  })

  it('should initialize Lumina and attach to globalThis', () => {
    const options = { locale: 'fr' }
    const lumina = createLumina(options)

    expect(lumina.locale).toBe('fr')
    expect((globalThis as any).__lumina).toBeDefined()
    expect((globalThis as any).__lumina.locale).toBe('fr')
  })

  it('should set Svelte context upon creation', () => {
    createLumina()
    expect(svelte.setContext).toHaveBeenCalled()
  })

  it('should update core client when locale changes', () => {
    const lumina = createLumina({ locale: 'en' })
    lumina.setLocale('es')
    
    expect(lumina.locale).toBe('es')
    expect(lumina.client.locale).toBe('es')
  })

  it('should throw error if useLumina is called without provider', () => {
    vi.mocked(svelte.getContext).mockReturnValue(undefined)
    
    expect(() => useLumina()).toThrow('useLumina must be used after createLumina()')
  })

  it('should return context state in useLumina', () => {
    const mockState = { locale: 'en', client: {} }
    vi.mocked(svelte.getContext).mockReturnValue(mockState)
    
    const state = useLumina()
    expect(state).toBe(mockState)
  })
})
