import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'

// https://vite.dev/config/
export default defineConfig({
  // Served from the root of runners.sillygame.studio, so base stays "/".
  // Moving back to a github.io project path would mean setting this to
  // "/wellesley-route-wrangler/" and dropping public/CNAME.
  base: '/',
  plugins: [react()],
  test: {
    /*
     * Two projects. The pure suite is the fast one and holds every rule; the
     * browser suite exists for the one thing it cannot know — whether the model
     * it tests against still matches what the map actually draws (#110 and its
     * relatives). Run `npm test` for both, `npm run test:fast` for the first.
     */
    projects: [
      {
        extends: true,
        test: {
          name: 'pure',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'rendered',
          include: ['src/**/*.browser.test.tsx'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
