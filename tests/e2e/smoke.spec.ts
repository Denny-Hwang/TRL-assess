import { test, expect, type Request } from '@playwright/test';

/**
 * Principle 1 guard: the app must make no third-party network requests at runtime.
 */
function attachRequestGuard(page: import('@playwright/test').Page, offenders: string[]) {
  page.on('request', (req: Request) => {
    const url = req.url();
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) return;
    const origin = new URL(url).origin;
    if (origin !== new URL(page.url() || 'http://127.0.0.1:4173').origin) offenders.push(url);
  });
}

test('app shell loads and exposes the main navigation', async ({ page }) => {
  const offenders: string[] = [];
  await page.goto('./');
  attachRequestGuard(page, offenders);
  await expect(page.getByRole('heading', { name: 'TRL Assess', level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  expect(offenders, `unexpected cross-origin requests: ${offenders.join(', ')}`).toHaveLength(0);
});

test('deep links survive a reload (HashRouter)', async ({ page }) => {
  await page.goto('./#/about');
  await expect(page.getByRole('heading', { name: /About/i })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /About/i })).toBeVisible();
});

test('sensitive-data notice is shown and dismissible', async ({ page }) => {
  await page.goto('./');
  const notice = page.getByTestId('sensitive-notice');
  await expect(notice).toBeVisible();
  await notice.getByRole('button', { name: 'Dismiss' }).click();
  await expect(notice).toHaveCount(0);
});
