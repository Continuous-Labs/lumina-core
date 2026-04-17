import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { vitePlugin as lumina } from '@continuouslabs/unplugin-lumina'

export default defineConfig({
  plugins: [
    svelte(),
    lumina({
      locales: ['en', 'es']
    })
  ],
})
