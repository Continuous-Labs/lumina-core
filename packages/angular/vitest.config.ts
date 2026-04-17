import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  esbuild: {
    /**
     * Angular uses experimental decorators and metadata which ESBuild 
     * needs to be explicitly told to handle.
     */
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
})
