import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from the root of runners.sillygame.studio, so base stays "/".
  // Moving back to a github.io project path would mean setting this to
  // "/wellesley-route-wrangler/" and dropping public/CNAME.
  base: '/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
