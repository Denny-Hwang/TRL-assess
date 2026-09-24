/**
 * Cross-browser smoke. Runs in Chromium always, and in Firefox and
 * WebKit when CROSS_BROWSER=1 and those browsers are installed.
 */
import { test, expect } from '@playwright/test';

test('the core flow works in this browser', async ({ page, browserName }) => {
  await page.goto('./#/quick');
  await page.getByLabel('Project name').fill(`Smoke ${browserName}`);
  await page.getByLabel('Technology name').fill('Smoke technology');
  await page.getByLabel('Assessor name').fill('Smoke assessor');
  await page.getByRole('button', { name: 'Continue to the questions' }).click();
  for (let i = 0; i < 9; i += 1) await page.keyboard.press('y');
  await page.getByRole('button', { name: 'See the estimate' }).click();
  await expect(page.getByTestId('estimated-trl')).toContainText('TRL 9');
});

test('storage and the guide work in this browser', async ({ page }) => {
  await page.goto('./#/assess');
  await page.getByLabel(/^Name/).fill('Smoke CTE');
  await page.getByRole('button', { name: 'Add CTE' }).click();
  await expect(page.getByText('CTE-01').first()).toBeVisible();

  await page.reload();
  await expect(page.getByText('Smoke CTE').first()).toBeVisible();

  await page.goto('./#/guide/methodology');
  await expect(page.getByRole('heading', { name: 'Methodology', level: 1 })).toBeVisible();
});

test('an Excel export downloads in this browser', async ({ page }) => {
  await page.goto('./#/quick');
  await page.getByLabel('Project name').fill('Export smoke');
  await page.getByLabel('Technology name').fill('T');
  await page.getByLabel('Assessor name').fill('A');
  await page.getByRole('button', { name: 'Continue to the questions' }).click();
  await page.keyboard.press('y');
  await page.goto('./#/quick/result');

  const download = page.waitForEvent('download', { timeout: 30_000 });
  await page.getByRole('button', { name: 'Download Excel' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^TRL_Tier1_export-smoke_\d{8}-\d{4}\.xlsx$/);
});

test('a large assessment exports without locking the interface', async ({ page }) => {
  await page.goto('./');
  // Seed 30 CTEs and 300 evidence items directly into storage, then reload.
  await page.evaluate(() => {
    const ctes = Array.from({ length: 30 }, (_, i) => ({
      id: `CTE-${String(i + 1).padStart(2, '0')}`,
      name: `Element ${i + 1}`,
      critical: i % 3 === 0,
      kind: (['hardware', 'software', 'process'] as const)[i % 3],
      targetTrl: 6,
    }));
    const evidence = Array.from({ length: 300 }, (_, i) => ({
      id: `EV-${String(i + 1).padStart(4, '0')}`,
      type: 'Document',
      title: `Evidence ${i + 1}`,
      marking: 'Internal (unrestricted)',
      verification: 'Unverified',
      linkedCriteria: [{ cteId: ctes[i % 30]!.id, criterionId: 'MEE-T2-L1-01' }],
    }));
    const session = {
      schemaVersion: 1,
      appVersion: '0.0.0-test',
      gitSha: 'test',
      frameworkId: 'marine-energy-eere',
      frameworkVersion: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tier2: {
        ctes,
        assessments: ctes.map((c) => ({
          cteId: c.id,
          criterionId: 'MEE-T2-L1-01',
          status: 'Met',
        })),
        evidence,
        gapActions: [],
      },
    };
    localStorage.setItem('trl-assess:session:v1', JSON.stringify(session));
  });
  await page.reload();
  await page.goto('./#/assess/result');
  await expect(page.getByTestId('system-trl')).toBeVisible();

  const started = Date.now();
  const download = page.waitForEvent('download', { timeout: 60_000 });
  await page.getByRole('button', { name: 'Download Excel' }).click();

  // The interface must still respond while the workbook is being built.
  await expect(page.getByRole('button', { name: /Building the workbook/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Guide' })).toBeVisible();

  const file = await download;
  expect(file.suggestedFilename()).toMatch(/\.xlsx$/);
  expect(Date.now() - started).toBeLessThan(45_000);
});
