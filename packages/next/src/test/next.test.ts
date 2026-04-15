import { describe, it, expect, vi } from 'vitest'
import { withLumina } from '../index.js'

describe('Lumina Next.js Adapter', () => {
  it('should extend next config with lumina webpack plugin', () => {
    const nextConfig = {
      reactStrictMode: true
    }
    
    const luminaOptions = {
      locales: ['en', 'es'],
      outputDir: './custom/locales'
    }

    const config = withLumina(nextConfig, luminaOptions)
    
    // Mock webpack config and options
    const mockWebpackConfig = {
      plugins: [] as any[]
    }
    const mockOptions = {
      webpack: {
        DefinePlugin: class {
          constructor(public definitions: any) {}
        }
      }
    }

    if (config.webpack) {
      config.webpack(mockWebpackConfig as any, mockOptions as any)
    }

    // Check if plugin was added (unplugin adds stuff to plugins array)
    expect(mockWebpackConfig.plugins.length).toBeGreaterThan(0)
    
    // Check DefinePlugin injection
    const definePlugin = mockWebpackConfig.plugins.find(p => p.definitions)
    expect(definePlugin.definitions['__lumina']).toBe('globalThis.__lumina')
  })

  it('should preserve existing webpack config', () => {
    const nextConfig = {
      webpack: (config: any) => {
        config.customKey = 'customValue'
        return config
      }
    }
    
    const config = withLumina(nextConfig as any)
    const mockConfig = { plugins: [] } as any
    const mockOptions = { webpack: { DefinePlugin: class {} } }
    
    const result = config.webpack!(mockConfig, mockOptions as any)
    expect(result.customKey).toBe('customValue')
  })
})
