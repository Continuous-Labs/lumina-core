import { describe, it, expect } from 'vitest'
import { transformLuminaCode } from '../index.js'

describe('Lumina Unplugin Transformation', () => {
  it('should transform React JSX t-attributes', () => {
    const input = 'export const App = () => <div t>Hello World</div>'
    const result = transformLuminaCode(input, 'App.tsx')
    
    expect(result?.code).toContain('globalThis.__lumina?.getText')
    expect(result?.code).toContain('Hello World')
    expect(result?.code).not.toContain(' t>')
  })

  it('should transform React JSX i18n-attributes', () => {
    const input = 'export const App = () => <div i18n>Localized</div>'
    const result = transformLuminaCode(input, 'App.tsx')
    
    expect(result?.code).toContain('globalThis.__lumina?.getText')
    expect(result?.code).not.toContain(' i18n>')
  })

  it('should transform Vue template t-attributes', () => {
    const input = `
<template>
  <button t>Click Me</button>
</template>
`
    const result = transformLuminaCode(input, 'App.vue')
    
    expect(result?.code).toContain('{{globalThis.__lumina?.getText')
    expect(result?.code).toContain('Click Me')
    expect(result?.code).not.toContain(' t>')
  })

  it('should transform Vue template i18n-attributes', () => {
    const input = `
<template>
  <p i18n>Hello World</p>
</template>
`
    const result = transformLuminaCode(input, 'App.vue')
    
    expect(result?.code).toContain('{{globalThis.__lumina?.getText')
    expect(result?.code).not.toContain(' i18n>')
  })

  it('should transform Astro templates with single braces', () => {
    const input = `---
const name = "Lumina"
---
<h1 t>Welcome to {name}</h1>`
    const result = transformLuminaCode(input, 'index.astro')
    
    expect(result?.code).toContain('{globalThis.__lumina?.getText')
    expect(result?.code).toContain('Welcome to {expr}')
    expect(result?.code).not.toContain('{{')
  })

  it('should inject virtual config into initLumina calls', () => {
    const input = 'import { initLumina } from "@continuouslabs/lumina"; initLumina()'
    const result = transformLuminaCode(input, 'main.ts')
    
    expect(result?.code).toContain('const __LUMINA_CONFIG__ = {')
    expect(result?.code).toContain('initLumina(__LUMINA_CONFIG__)')
  })

  it('should transform t() function calls', () => {
    const input = 'const msg = t("Dynamic Message")'
    const result = transformLuminaCode(input, 'util.ts')
    
    expect(result?.code).toContain('globalThis.__lumina?.getText')
    expect(result?.code).toContain('Dynamic Message')
  })
})
