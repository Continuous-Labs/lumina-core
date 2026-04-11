import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vitePlugin as lumina } from '@continuouslabs/unplugin-lumina'

export default defineConfig({
  plugins: [
    vue(),
    lumina()
  ],
})
