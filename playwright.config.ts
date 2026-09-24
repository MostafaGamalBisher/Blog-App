import { defineConfig, devices } from '@playwright/test';

// Browser checks for the /blog list page (e2e/*.spec.ts).
// Run with `npm run test:e2e`. The web server below builds and starts the
// production app, so the checks run against a real production build.
// First run on a new machine: `npx playwright install chromium`.
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: 'e2e',
  // One worker: the tests measure debounce timing, which is more reliable
  // without other browsers competing for the CPU.
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/api/categories`,
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
