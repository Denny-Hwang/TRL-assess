/**
 * Captures the screenshots used by README.md. Run with: npm run screenshots
 */
import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const OUT = path.resolve('docs/img');

/**
 * Fictional ARL ratings for the example sensor node, used only for the screenshots. Start: 6
 * Medium and 2 High; target: 5 Medium and no High.
 */
const ARL_EXAMPLE: Record<
  string,
  { current: string; rationale: string; target?: string; plannedAction?: string }
> = {
  'ARL-A1': {
    current: 'Medium',
    rationale: 'Unit cost at pilot volumes is above the battery-powered nodes it would replace.',
    target: 'Low',
    plannedAction: 'Cost-down design review before the pilot build.',
  },
  'ARL-A2': { current: 'Low', rationale: 'Chamber tests meet the target duty cycle.' },
  'ARL-A3': { current: 'Low', rationale: 'Installs like the nodes it would replace.' },
  'ARL-B1': { current: 'Medium', rationale: 'Two prospective users have asked for pilot units.' },
  'ARL-B2': {
    current: 'Medium',
    rationale: 'The addressable market has not been sized yet.',
    target: 'Low',
    plannedAction: 'Market sizing study.',
  },
  'ARL-B3': {
    current: 'High',
    rationale: 'No integrator or distributor identified yet.',
    target: 'Medium',
    plannedAction: 'Approach two integrators.',
  },
  'ARL-C1': {
    current: 'High',
    rationale: 'No follow-on funding after the current grant.',
    target: 'Medium',
    plannedAction: 'Apply for a follow-on programme.',
  },
  'ARL-C2': { current: 'Medium', rationale: 'No partner yet for field deployment.' },
  'ARL-C3': { current: 'Low', rationale: 'Uses existing mounting and telemetry infrastructure.' },
  'ARL-C4': { current: 'Medium', rationale: 'The harvester is made in-house in small batches.' },
  'ARL-C5': { current: 'Low', rationale: 'Commodity materials only.' },
  'ARL-C6': { current: 'Low', rationale: 'Installers need no new skills.' },
  'ARL-D1': {
    current: 'Medium',
    rationale: 'Radio certification has not started.',
    target: 'Low',
    plannedAction: 'Pre-compliance radio test.',
  },
  'ARL-D2': { current: 'Low', rationale: 'No policy dependency identified.' },
  'ARL-D3': { current: 'Low', rationale: 'Mounts on existing structures.' },
  'ARL-D4': { current: 'Low', rationale: 'Sealed, low-voltage device.' },
  'ARL-D5': { current: 'Low', rationale: 'No community concerns expected.' },
};

/** Seeds the fictional example (plus ARL ratings) and the interface language, then reloads. */
async function seed(page: Page, lang = 'en') {
  const example = JSON.parse(
    await readFile(path.resolve('src/data/examples/fictional-sensor-node.session.json'), 'utf8'),
  );
  const rubric = JSON.parse(
    await readFile(path.resolve('src/data/frameworks/arl/doe-otc-arl-2025.json'), 'utf8'),
  ) as { id: string; version: string; dimensions: Array<{ id: string }> };
  const session = {
    ...example,
    arl: {
      frameworkId: rubric.id,
      frameworkVersion: rubric.version,
      context: {
        projectName: example.tier1.context.projectName,
        technologyName: example.tier1.context.technologyName,
        assessorName: example.tier1.context.assessorName,
        technologyScope: 'The sensor node with its energy harvester, for outdoor monitoring.',
        valueChainScope: 'From component suppliers to the installers and operators of the nodes.',
        evaluationTimeline: 'Now, and at the end of the two-year project.',
        policyEnvironment: 'Current rules; no new incentives assumed.',
      },
      dimensions: rubric.dimensions.map((d) => ({ dimensionId: d.id, ...ARL_EXAMPLE[d.id] })),
    },
  };

  await page.goto('./');
  await page.evaluate(
    ({ session, lang }) => {
      localStorage.setItem('trl-assess:session:v1', JSON.stringify(session));
      localStorage.setItem('trl-assess:ui:v1', JSON.stringify({ lang }));
      sessionStorage.setItem('trl-assess:notice-dismissed', '1');
    },
    { session, lang },
  );
  // Reload once so the stores pick up the seeded data, then navigate. (Navigating first would let
  // the empty-session redirect rewrite the hash before the reload.)
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
}

test.describe('screenshots', () => {
  test.skip(!process.env.CAPTURE_SCREENSHOTS, 'set CAPTURE_SCREENSHOTS=1 to capture');

  test.beforeAll(async () => {
    await mkdir(OUT, { recursive: true });
  });

  // One 1280 × 900 screen each, so the README gallery lines up.
  test('capture the TRL screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page);

    await page.goto('./#/quick/result');
    await expect(page.getByTestId('estimated-trl')).toBeVisible();
    await page.screenshot({ path: path.join(OUT, 'tier1-result.png') });

    await page.goto('./#/assess');
    await expect(page.getByText('Energy harvester').first()).toBeVisible();
    await page.screenshot({ path: path.join(OUT, 'tier2-criteria.png') });

    await page.goto('./#/assess/result');
    await expect(page.getByTestId('system-trl')).toBeVisible();
    await page.screenshot({ path: path.join(OUT, 'tier2-result.png') });
  });

  test('capture the ARL screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page);

    await page.goto('./#/arl/rate');
    const card = page.getByTestId('dimension-ARL-A1');
    await expect(card).toBeVisible();
    await card.screenshot({ path: path.join(OUT, 'arl-rating.png') });

    await page.goto('./#/arl/result');
    const reading = page.locator('section[aria-labelledby="arl-how-read"]');
    await expect(reading).toBeVisible();
    // A hash route keeps the scroll position of the previous page.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(OUT, 'arl-result.png') });
    await reading.screenshot({ path: path.join(OUT, 'arl-reading.png') });
  });

  test('capture the interface in Korean', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seed(page, 'ko');

    await page.goto('./#/arl/rate');
    await expect(page.getByTestId('dimension-ARL-A1')).toBeVisible();
    await page.screenshot({ path: path.join(OUT, 'language-ko.png') });
  });
});
