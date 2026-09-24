import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test.describe('Tier 2 evidence-based assessment', () => {
  test('creates two CTEs, attaches a file and a code link, and reports the result', async ({
    page,
  }, testInfo) => {
    const offenders: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      if (!url.startsWith('http://127.0.0.1:4173')) offenders.push(url);
    });

    await page.goto('./#/assess');

    // Two CTEs: one hardware (critical), one software (critical).
    await page.getByLabel(/^Name/).fill('Energy harvester');
    await page.getByLabel(/^Kind/).selectOption('hardware');
    await page.getByRole('button', { name: 'Add CTE' }).click();

    await page.getByLabel(/^Name/).fill('Telemetry firmware');
    await page.getByLabel(/^Kind/).selectOption('software');
    await page.getByRole('button', { name: 'Add CTE' }).click();

    await expect(page.getByText('CTE-02').first()).toBeVisible();

    // Mark one criterion per level met on CTE-01 for TRL 1-3 and attach evidence to each.
    await page
      .getByRole('button', { name: /CTE-01/ })
      .first()
      .click();

    const file = testInfo.outputPath('bench-test.txt');
    await writeFile(file, 'fictional bench test record');

    for (const [index, criterion] of ['DOD-T2-L1-01', 'DOD-T2-L2-01', 'DOD-T2-L3-01'].entries()) {
      // The level accordion header, not the ladder rung of the same name.
      const header = page
        .getByRole('button', { name: new RegExp(`^TRL ${index + 1} `) })
        .filter({ has: page.locator('[aria-expanded], svg') })
        .or(page.locator(`h3 > button:has-text("TRL ${index + 1}")`))
        .first();
      if ((await header.getAttribute('aria-expanded')) !== 'true') await header.click();
      await page.getByLabel(`Status for ${criterion}`).selectOption('Met');
      await page
        .locator(`li:has-text("${criterion}")`)
        .first()
        .getByRole('button', { name: 'Manage' })
        .click();
      await page.getByRole('button', { name: 'Add evidence' }).first().click();
      await page.getByLabel(/^Title/).fill(`Evidence for ${criterion}`);
      if (index === 0) {
        await page.getByLabel(/^File/).setInputFiles(file);
      } else {
        await page.getByLabel(/^Type/).selectOption('Code repository');
        await page.getByLabel(/^Repository URL/).fill('https://example.org/fictional/repo');
        await page.getByLabel(/^Commit SHA/).fill('0f1e2d3c4b5a697887');
      }
      await page.getByRole('button', { name: 'Add evidence' }).last().click();
      await expect(page.getByText(`CTE-01/${criterion}`)).toBeVisible();
    }

    await page.getByRole('link', { name: 'Results' }).click();
    await expect(page.getByTestId('system-trl')).toContainText('< TRL 1');
    await expect(page.getByTestId('limiting-ctes')).toContainText('CTE-02');

    // CTE-01 itself reached TRL 3.
    await expect(page.getByRole('row', { name: /Energy harvester/ })).toContainText('TRL 3');

    expect(offenders, `unexpected network requests: ${offenders.join(', ')}`).toHaveLength(0);
  });

  test('restores the session and the stored evidence file after a reload', async ({
    page,
  }, testInfo) => {
    await page.goto('./#/assess/evidence');
    await page.getByRole('button', { name: 'Add evidence' }).click();
    await page.getByLabel(/^Title/).fill('Persisted report');
    const file = testInfo.outputPath('persisted.txt');
    await writeFile(file, 'persisted content');
    await page.getByLabel(/^File/).setInputFiles(file);
    await page.getByRole('button', { name: 'Add evidence' }).last().click();
    // Wait for the saved row (EV-0001), not the form's file preview, before reloading.
    await expect(page.getByText('EV-0001')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Persisted report')).toBeVisible();
    await expect(page.getByText(/sha256/)).toBeVisible();
  });

  test('loads the fictional example and clears all local data on demand', async ({ page }) => {
    await page.goto('./#/assess');
    await page.getByRole('button', { name: 'open the fictional example' }).click();
    await page.getByRole('button', { name: 'Yes, load it' }).click();
    await expect(page.getByText('Energy harvester').first()).toBeVisible();

    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem('trl-assess:session:v1') ?? ''))
      .toContain('Energy harvester');
  });
});
