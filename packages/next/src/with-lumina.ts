/**
 * Lumina Next.js Wrapper
 * 
 * This file provides the 'withLumina' function used to extend Next.js 
 * configuration with Lumina's build-time transformation engine.
 */

import { webpackPlugin as luminaWebpack } from '@continuouslabs/unplugin-lumina'
import type { NextConfig } from 'next'

export interface LuminaNextOptions {
  /** Target locales (e.g., ['en', 'es']) */
  locales?: string[]
  /** Where to save the extracted keys. Defaults to .lumina/locales */
  outputDir?: string
}

/**
 * Standard Next.js wrapper function.
 * 
 * Example usage in 'next.config.js':
 * ```js
 * const { withLumina } = require('@continuouslabs/lumina-next');
 * module.exports = withLumina({ ...activeNextConfig });
 * ```
 * 
 * It injects the Lumina Webpack plugin and defines global constants 
 * to ensure the translation logic is available in both client and server components.
 */
export function withLumina(nextConfig: NextConfig = {}, luminaOptions: LuminaNextOptions = {}): NextConfig {
  return {
    ...nextConfig,
    webpack(config, options) {
      const { webpack } = options

      // 1. Inject the Lumina Unplugin (Handles AST transformations)
      config.plugins.push(
        luminaWebpack({
          locales: luminaOptions.locales,
          outputDir: luminaOptions.outputDir,
        })
      )

      // 2. Define global variables to avoid "variable not defined" errors 
      // when the compiler-generated code runs in environments where 
      // globalThis might not be fully populated yet.
      config.plugins.push(
        new webpack.DefinePlugin({
          '__lumina': 'globalThis.__lumina',
          '__lumina_t': '(k, t, a) => (globalThis.__lumina?.getText(k, t, a) ?? t)',
        })
      )

      // Support existing custom Webpack configurations
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }
      return config
    },
  }
}
