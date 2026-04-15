import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, act, cleanup } from '@testing-library/react'
import { LuminaProvider, useLumina } from '../index.js'
import { initLumina } from '@continuouslabs/lumina'

// Mock context for testing
const TestComponent = () => {
  const { locale, setLocale, client } = useLumina()
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <button onClick={() => setLocale('es')}>Switch to ES</button>
      <span data-testid="text">{client.getText('h1', 'Default')}</span>
    </div>
  )
}

describe('Lumina React Adapter', () => {
  beforeEach(() => {
    // Clear globalThis.__lumina if exists
    delete (globalThis as any).__lumina
  })

  afterEach(() => {
    cleanup()
  })

  it('should provide LuminaClient via provider', () => {
    render(
      <LuminaProvider options={{ locale: 'en' }}>
        <TestComponent />
      </LuminaProvider>
    )

    expect(screen.getByTestId('locale').textContent).toBe('en')
    expect((globalThis as any).__lumina).toBeDefined()
  })

  it('should update locale and re-render when setLocale is called', async () => {
    render(
      <LuminaProvider options={{ 
        locale: 'en',
        messages: { 
          en: { h1: 'Hello' },
          es: { h1: 'Hola' }
        }
      }}>
        <TestComponent />
      </LuminaProvider>
    )

    expect(screen.getByTestId('text').textContent).toBe('Hello')
    
    const button = screen.getByText('Switch to ES')
    await act(async () => {
      button.click()
    })

    expect(screen.getByTestId('locale').textContent).toBe('es')
    expect(screen.getByTestId('text').textContent).toBe('Hola')
  })

  it('should function in zero-config mode (missing options)', () => {
    render(
      <LuminaProvider>
        <TestComponent />
      </LuminaProvider>
    )

    expect(screen.getByTestId('locale').textContent).toBe('en') // Default
  })
})
