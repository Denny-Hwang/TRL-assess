import { test, expect } from '@playwright/test';

test.describe('Adoption readiness (ARL) side module', () => {
  test('rates the dimensions, reads ARL Start and End, and exports', async ({ page }) => {
    const offenders: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      if (!url.startsWith('http://127.0.0.1:4173')) offenders.push(url);
    });

    await page.goto('./#/arl');
    await page.getByLabel('Project name').fill('Fictional ARL project (example data)');
    await page.getByLabel('Technology name').fill('Example technology');
    await page.getByLabel('Assessor name').fill('Example Assessor');
    await page.getByLabel('Technology scope').fill('The device and its controller');
    await page.getByRole('button', { name: 'Continue to the ratings' }).click();

    await expect(page.getByRole('heading', { name: /step 2 of 3/ })).toBeVisible();
    const cards = page.getByTestId(/^dimension-ARL-/);
    await expect(cards).toHaveCount(17);
    await expect(page.getByTestId('live-arl-start')).toContainText('ARL Start 1');

    for (let i = 0; i < 17; i += 1) {
      // The radio is visually hidden; people click the whole rubric card, which is its label.
      await cards
        .nth(i)
        .locator('label', { hasText: /^Low risk/ })
        .click();
    }
    await expect(page.getByTestId('live-arl-start')).toContainText('ARL Start 9');

    const cost = page.getByTestId('dimension-ARL-A1');
    await cost.locator('label', { hasText: /^High risk/ }).click();
    await cost.getByLabel('Target at the end of the project').selectOption('Low');
    await cost.getByLabel('Planned action').fill('Cost-down pilot');
    await expect(page.getByTestId('live-arl-start')).toContainText('ARL Start 8');
    await expect(page.getByTestId('live-arl-end')).toContainText('ARL End (target) 9');

    await page.getByRole('button', { name: 'See the result' }).click();
    await expect(page.getByTestId('arl-start')).toContainText('ARL 8');
    await expect(page.getByTestId('arl-end')).toContainText('ARL 9');
    await expect(
      page.getByText('Adoption readiness self-assessment — not reviewed or endorsed by DOE'),
    ).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Excel' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
      /^ARL_fictional-arl-project-example-data_\d{8}-\d{4}\.xlsx$/,
    );

    expect(offenders, `unexpected network requests: ${offenders.join(', ')}`).toHaveLength(0);
  });

  test('keeps the ARL ratings across a reload and a TRL reset', async ({ page }) => {
    await page.goto('./#/arl');
    await page.getByLabel('Project name').fill('Persisted ARL project');
    await page.getByLabel('Technology name').fill('T');
    await page.getByLabel('Assessor name').fill('A');
    await page.getByRole('button', { name: 'Continue to the ratings' }).click();
    await page
      .getByTestId('dimension-ARL-B2')
      .locator('label', { hasText: /^Medium risk/ })
      .click();

    await page.reload();
    await page.goto('./#/quick');
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.getByRole('button', { name: 'Yes, reset' }).click();

    await page.goto('./#/arl/rate');
    await expect(
      page.getByTestId('dimension-ARL-B2').getByRole('radio', { name: /^Medium risk/ }),
    ).toBeChecked();
  });
});
