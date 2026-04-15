import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { createLumina, useLumina } from '../index.js'

const TestComponent = defineComponent({
  setup() {
    const { locale, setLocale, client } = useLumina()
    return () => h('div', [
      h('span', { 'data-testid': 'locale' }, locale.value),
      h('button', { onClick: () => setLocale('fr') }, 'Switch to FR'),
      h('span', { 'data-testid': 'text' }, client.getText('msg', 'Default'))
    ])
  }
})

describe('Lumina Vue Adapter', () => {
  beforeEach(() => {
    delete (globalThis as any).__lumina
  })

  it('should install as a plugin and provide client', () => {
    const app = createApp(TestComponent)
    const lumina = createLumina({ locale: 'en' })
    app.use(lumina)
    
    expect((globalThis as any).__lumina).toBeDefined()
  })

  it('should be reactive when locale changes', async () => {
    const app = createApp(TestComponent)
    const lumina = createLumina({ 
      locale: 'en',
      messages: {
        en: { msg: 'Hello' },
        fr: { msg: 'Bonjour' }
      }
    })
    app.use(lumina)

    // Manual mock of mounting for test purposes
    // In a full environment we'd use @testing-library/vue
    // but for unit testing the logic:
    const root = document.createElement('div')
    const vm = app.mount(root)

    expect(root.querySelector('[data-testid="locale"]')?.textContent).toBe('en')
    expect(root.querySelector('[data-testid="text"]')?.textContent).toBe('Hello')

    const button = root.querySelector('button')
    button?.click()

    // Wait for Vue reactivity
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(root.querySelector('[data-testid="locale"]')?.textContent).toBe('fr')
    expect(root.querySelector('[data-testid="text"]')?.textContent).toBe('Bonjour')
  })

  it('should check error if Lumina is not installed', () => {
    const app = createApp(TestComponent)
    // No app.use(lumina)
    
    expect(() => app.mount(document.createElement('div'))).toThrow('Lumina plugin not installed')
  })
})
