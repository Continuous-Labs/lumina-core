import { webpackPlugin as luminaWebpack } from '@continuouslabs/unplugin-lumina'
import type { NextConfig } from 'next'

export interface LuminaNextOptions {
  locales?: string[]
  outputDir?: string
}

export function withLumina(nextConfig: NextConfig = {}, luminaOptions: LuminaNextOptions = {}): NextConfig {
  return {
    ...nextConfig,
    webpack(config, options) {
      const { webpack } = options

      config.plugins.push(
        luminaWebpack({
          locales: luminaOptions.locales,
          outputDir: luminaOptions.outputDir,
        })
      )

      config.plugins.push(
        new webpack.DefinePlugin({
          '__lumina': 'globalThis.__lumina',
          '__lumina_t': '(k, t, a) => (globalThis.__lumina?.getText(k, t, a) ?? t)',
        })
      )

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }
      return config
    },
  }
}
