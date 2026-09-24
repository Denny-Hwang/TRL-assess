/**
 * Workbooks are written in the interface language, while sheet names (which formulas and tests
 * reference) and validated cell values stay in English.
 */
import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import { buildTier1Workbook, TIER1_SHEETS } from '@/export/excel/tier1';
import { resolveFramework } from '@/domain/frameworks';
import { parseSession } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';
import { en } from '@/i18n/en';
import { createTranslator } from '@/i18n/translate';

const session = parseSession(FICTIONAL_EXAMPLE);
const framework = resolveFramework(session.frameworkId);

describe('Tier 1 workbook — interface language', () => {
  it('writes translated headers but keeps the English sheet names and answer values', async () => {
    const tr = createTranslator('ko', {
      ...en,
      'excel.tier1.col.question': 'KO-TEST',
      'excel.tier1.readme.fill.heading': 'KO-FILL',
    });
    const workbook = await buildTier1Workbook(
      framework,
      session,
      new Date('2026-02-03T04:05:06.000Z'),
      tr,
    );
    const buffer = await workbook.xlsx.writeBuffer();
    const back = new ExcelJS.Workbook();
    await back.xlsx.load(buffer as ArrayBuffer);

    expect(back.worksheets.map((w) => w.name)).toEqual([...TIER1_SHEETS]);
    const responses = back.getWorksheet('Responses')!;
    expect(responses.getCell('C1').value).toBe('KO-TEST');
    expect(responses.getCell('D1').value).toBe('Answer');
    expect(responses.getCell('D2').dataValidation?.formulae?.[0]).toBe('"Yes,No,Unsure"');

    const readme: string[] = [];
    back
      .getWorksheet('README')!
      .eachRow((row) => row.eachCell((cell) => readme.push(String(cell.value ?? ''))));
    expect(readme).toContain('KO-FILL');
    expect(readme).not.toContain('How to fill the placeholders');
  });
});
