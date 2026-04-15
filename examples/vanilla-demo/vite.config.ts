import { defineConfig } from 'vite'
import { vitePlugin as lumina } from '@continuouslabs/unplugin-lumina'

export default defineConfig({
  plugins: [
    lumina()
  ]
})
