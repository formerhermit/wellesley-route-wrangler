import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://formerhermit.github.io/wellesley-route-wrangler/, so
  // assets must resolve under that subpath. If this ever moves to a custom
  // domain at the root (runners.sillygame.studio), set base back to "/" and
  // restore public/CNAME.
  base: '/wellesley-route-wrangler/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
