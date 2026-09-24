import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('interface languages', () => {
  test('English by default; switching translates, persists and flips direction for Arabic', async ({
    page,
  }) => {
    const offenders: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('data:') || url.startsWith('blob:')) return;
      if (!url.startsWith('http://127.0.0.1:4173')) offenders.push(url);
    });

    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const nav = page.getByRole('navigation').first();
    await expect(nav.getByRole('link', { name: 'Quick Estimate' })).toBeVisible();

    await page.getByTestId('language-select').selectOption('ko');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(nav.getByRole('link', { name: 'Quick Estimate' })).toHaveCount(0);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(page.getByTestId('language-select')).toHaveValue('ko');

    await page.getByTestId('language-select').selectOption('ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await page.getByTestId('language-select').selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(nav.getByRole('link', { name: 'Quick Estimate' })).toBeVisible();

    expect(offenders, `unexpected network requests: ${offenders.join(', ')}`).toHaveLength(0);
  });

  for (const lang of ['ko', 'ar', 'hi']) {
    test(`axe: home and the quick estimate have no serious violations in ${lang}`, async ({
      page,
    }) => {
      await page.goto('./');
      await page.getByTestId('language-select').selectOption(lang);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      for (const route of ['./', './#/quick', './#/arl']) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        const blocking = results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        );
        expect(blocking.map((v) => `${route} ${v.id}`)).toEqual([]);
      }
    });
  }
});
