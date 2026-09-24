/**
 * Captures the screenshots used by README.md. Run with: npm run screenshots
 */
import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const OUT = path.resolve('docs/img');

test.describe('screenshots', () => {
  test.skip(!process.env.CAPTURE_SCREENSHOTS, 'set CAPTURE_SCREENSHOTS=1 to capture');

  test.beforeAll(async () => {
    await mkdir(OUT, { recursive: true });
  });

  test('capture the three README screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const example = JSON.parse(
      await readFile(path.resolve('src/data/examples/fictional-sensor-node.session.json'), 'utf8'),
    );

    // Seed the browser with the fictional example so the screenshots show a complete assessment.
    await page.goto('./');
    await page.evaluate((example) => {
      localStorage.setItem('trl-assess:session:v1', JSON.stringify(example));
      sessionStorage.setItem('trl-assess:notice-dismissed', '1');
    }, example);

    // Reload once so the store picks up the seeded session, then navigate. (Navigating first
    // would let the empty-session redirect rewrite the hash before the reload.)
    await page.reload();

    await page.goto('./#/quick/result');
    await expect(page.getByTestId('estimated-trl')).toBeVisible();
    await page.screenshot({ path: path.join(OUT, 'tier1-result.png'), fullPage: true });

    await page.goto('./#/assess');
    await expect(page.getByText('Wave energy harvester').first()).toBeVisible();
    await page.screenshot({ path: path.join(OUT, 'tier2-criteria.png'), fullPage: true });

    await page.goto('./#/assess/result');
    await expect(page.getByTestId('system-trl')).toBeVisible();
    await page.screenshot({ path: path.join(OUT, 'tier2-result.png'), fullPage: true });
  });
});
