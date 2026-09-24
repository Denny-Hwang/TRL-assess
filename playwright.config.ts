import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_PATH = process.env.VITE_BASE_PATH ?? '/TRL-assess/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}${BASE_PATH}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Sandboxes / CI images that ship a prebuilt Chromium can point at it with
        // PLAYWRIGHT_CHROMIUM_PATH instead of downloading a matching build.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : {},
      },
    },
    // Cross-browser smoke. Enabled where the browsers are
    // installed: `npx playwright install firefox webkit`, then CROSS_BROWSER=1.
    ...(process.env.CROSS_BROWSER
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            testMatch: /smoke\.spec\.ts|cross-browser\.spec\.ts/,
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            testMatch: /smoke\.spec\.ts|cross-browser\.spec\.ts/,
          },
        ]
      : []),
  ],
  webServer: {
    // Bind explicitly to 127.0.0.1: on runners where `localhost` resolves to ::1 first, Vite's
    // preview server listens on IPv6 only and Playwright's IPv4 readiness check never succeeds.
    command: `npm run preview -- --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}${BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
