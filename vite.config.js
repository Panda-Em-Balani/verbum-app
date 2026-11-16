import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import precacheManifest from './vite-plugins/precacheManifest.js'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [react(), precacheManifest()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
