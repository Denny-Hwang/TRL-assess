import { test, expect } from '@playwright/test';

test.describe('Tier 1 quick estimate', () => {
  test('completes an estimate and shows the engine result', async ({ page }) => {
    const offenders: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      if (!url.startsWith('http://127.0.0.1:4173')) offenders.push(url);
    });

    await page.goto('./#/quick');

    await page.getByLabel('Project name').fill('Fictional Remote Sensor Node (example data)');
    await page.getByLabel('Technology name').fill('Self-powered remote sensor node');
    await page.getByLabel('Assessor name').fill('Example Assessor');
    await page.getByLabel('Environment reached').selectOption('E2');
    await page.getByLabel('Build maturity').selectOption('B2');
    await page.getByRole('button', { name: 'Continue to the questions' }).click();

    // TRL 9 → 1, matching the fictional example: No ×4, Unsure at 5, Yes ×4.
    for (const answer of ['n', 'n', 'n', 'n', 'u', 'y', 'y', 'y', 'y']) {
      await page.keyboard.press(answer);
    }
    await expect(page.getByText('9 / 9 answered')).toBeVisible();

    await page.getByRole('button', { name: 'See the estimate' }).click();

    await expect(page.getByTestId('estimated-trl')).toContainText('TRL 4');
    await expect(page.getByTestId('first-yes-trl')).toContainText('TRL 4');
    await expect(page.getByTestId('matrix-trl')).toContainText('TRL 5');
    await expect(page.getByText('Consistency: High')).toBeVisible();
    await expect(page.getByText('Estimate — self-reported, no evidence')).toBeVisible();

    expect(offenders, `unexpected network requests: ${offenders.join(', ')}`).toHaveLength(0);
  });

  test('restores the session after a reload', async ({ page }) => {
    await page.goto('./#/quick');
    await page.getByLabel('Project name').fill('Persisted project');
    await page.getByLabel('Technology name').fill('T');
    await page.getByLabel('Assessor name').fill('A');
    await page.getByRole('button', { name: 'Continue to the questions' }).click();
    await page.keyboard.press('y');

    await page.reload();
    await page.goto('./#/quick');
    await expect(page.getByLabel('Project name')).toHaveValue('Persisted project');
  });

  test('renders on a 375 px viewport without horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('./#/quick');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.getByLabel('Project name')).toBeVisible();
  });
});
