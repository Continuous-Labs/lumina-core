import { defineConfig } from 'vite'
import analog from '@analogjs/platform'
import { vitePlugin as lumina } from '@continuouslabs/unplugin-lumina'

export default defineConfig(({ mode }) => ({
  plugins: [
    analog(),
    lumina({
      locales: ['en', 'es'],
      outputDir: './.lumina/locales'
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}))
