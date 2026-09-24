/**
 * Accessibility checks (BUILD_SPEC Phase 8, task 1). Every route must be free of
 * serious and critical axe violations.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROUTES = [
  '#/',
  '#/quick',
  '#/quick/questions',
  '#/quick/result',
  '#/assess',
  '#/assess/evidence',
  '#/assess/result',
  '#/guide',
  '#/guide/overview',
  '#/guide/methodology',
  '#/guide/faq',
  '#/guide/arl',
  '#/arl',
  '#/about',
];

/** Routes that need ARL ratings in the session to render rather than redirect. */
const ARL_ROUTES = ['#/arl/rate', '#/arl/result'];

async function seed(page: import('@playwright/test').Page) {
  const example = JSON.parse(
    await readFile(path.resolve('src/data/examples/fictional-wave-buoy.session.json'), 'utf8'),
  );
  await page.goto('./');
  await page.evaluate((e) => {
    localStorage.setItem('trl-assess:session:v1', JSON.stringify(e));
  }, example);
  await page.reload();
}

/** The example session plus ARL ratings of every kind. */
async function seedWithArl(page: import('@playwright/test').Page) {
  const example = JSON.parse(
    await readFile(path.resolve('src/data/examples/fictional-wave-buoy.session.json'), 'utf8'),
  );
  const rubric = JSON.parse(
    await readFile(path.resolve('src/data/frameworks/arl/doe-otc-arl-2025.json'), 'utf8'),
  ) as { id: string; version: string; dimensions: Array<{ id: string }> };
  const cycle = ['Low', 'Medium', 'High', 'N/A', 'Unsure'];
  const session = {
    ...example,
    arl: {
      frameworkId: rubric.id,
      frameworkVersion: rubric.version,
      context: { projectName: 'Example', technologyName: 'Example', assessorName: 'Example' },
      dimensions: rubric.dimensions.map((d, i) => ({
        dimensionId: d.id,
        current: cycle[i % cycle.length],
        rationale: i % 2 ? 'Example rationale.' : '',
        ...(i % 3 === 0 ? { target: 'Low', plannedAction: 'Example action' } : {}),
      })),
    },
  };
  await page.goto('./');
  await page.evaluate((s) => {
    localStorage.setItem('trl-assess:session:v1', JSON.stringify(s));
  }, session);
  await page.reload();
}

async function expectNoBlockingViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(
    blocking,
    blocking
      .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join('; ')}`)
      .join('\n'),
  ).toEqual([]);
}

for (const route of ROUTES) {
  test(`axe: ${route} has no serious or critical violations`, async ({ page }) => {
    await seed(page);
    await page.goto(`./${route}`);
    await page.waitForLoadState('networkidle');
    await expectNoBlockingViolations(page);
  });
}

for (const route of ARL_ROUTES) {
  test(`axe: ${route} (with ARL ratings) has no serious or critical violations`, async ({
    page,
  }) => {
    await seedWithArl(page);
    await page.goto(`./${route}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Adoption readiness');
    await expectNoBlockingViolations(page);
  });
}

test('the whole Tier 1 flow is reachable with the keyboard alone', async ({ page }) => {
  await page.goto('./#/quick');

  await page.getByLabel('Project name').focus();
  await page.keyboard.type('Keyboard project');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Keyboard technology');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Keyboard assessor');

  // Reach the submit button by tabbing, then activate it.
  const submit = page.getByRole('button', { name: 'Continue to the questions' });
  for (let i = 0; i < 25; i += 1) {
    if (await submit.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press('Tab');
  }
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'TRL 9' })).toBeVisible();
  for (let i = 0; i < 9; i += 1) await page.keyboard.press('y');
  await expect(page.getByText('9 / 9 answered')).toBeVisible();
});

test('the result is announced to assistive technology', async ({ page }) => {
  await seed(page);
  await page.goto('./#/quick/result');
  const live = page.locator('[aria-live="polite"]').first();
  await expect(live).toBeVisible();
  await expect(live).toContainText('TRL');
});
