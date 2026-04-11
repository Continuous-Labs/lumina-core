import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePlugin as lumina } from '@continuouslabs/unplugin-lumina'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Lumina high-performance compiler
    lumina(),
  ],
})
