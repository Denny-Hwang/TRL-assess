/**
 * Proves that every Excel feature the Tier 1/Tier 2 workbooks depend on survives a write → read
 * round-trip with ExcelJS.
 */
import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';

async function roundTrip(wb: ExcelJS.Workbook): Promise<ExcelJS.Workbook> {
  const buf = await wb.xlsx.writeBuffer();
  const back = new ExcelJS.Workbook();
  await back.xlsx.load(buf as ArrayBuffer);
  return back;
}

describe('ExcelJS feature spike', () => {
  it('round-trips hyperlinks, list validation, formulas, freeze panes and conditional formatting', async () => {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'TRL Assess spike';
    const ws = wb.addWorksheet('Spike', {
      views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
    });
    ws.columns = [
      { header: 'ID', key: 'id', width: 14 },
      { header: 'Link', key: 'link', width: 40 },
      { header: 'Status', key: 'status', width: 18 },
      { header: 'Open', key: 'open', width: 14 },
    ];

    ws.addRow({ id: 'EV-0001', link: 'https://example.org/report.pdf', status: 'Met' });

    // 1. Hyperlink cell
    ws.getCell('B2').value = {
      text: 'https://example.org/report.pdf',
      hyperlink: 'https://example.org/report.pdf',
    };
    // 2. List data validation
    ws.getCell('C2').dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"Met,Partially met,Not met,N/A,Not assessed"'],
      showErrorMessage: true,
      errorTitle: 'Invalid status',
      error: 'Pick a value from the list.',
    };
    // 3. HYPERLINK() formula
    ws.getCell('D2').value = { formula: 'IF(B2="","",HYPERLINK(B2,"Open"))' };
    // 4. Conditional formatting
    ws.addConditionalFormatting({
      ref: 'C2:C100',
      rules: [
        {
          type: 'containsText',
          operator: 'containsText',
          text: 'Not met',
          priority: 1,
          style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFC7CE' } } },
        },
      ],
    });
    ws.autoFilter = { from: 'A1', to: 'D1' };

    const back = await roundTrip(wb);
    const sheet = back.getWorksheet('Spike');
    expect(sheet).toBeDefined();
    if (!sheet) throw new Error('sheet missing');

    // hyperlink
    const link = sheet.getCell('B2').value as { hyperlink?: string; text?: string };
    expect(link.hyperlink).toBe('https://example.org/report.pdf');

    // data validation
    const dv = sheet.getCell('C2').dataValidation;
    expect(dv?.type).toBe('list');
    expect(dv?.formulae?.[0]).toContain('Partially met');

    // formula
    const formulaCell = sheet.getCell('D2').value as { formula?: string };
    expect(formulaCell.formula).toContain('HYPERLINK');

    // freeze panes
    const view = sheet.views?.[0] as { state?: string; ySplit?: number } | undefined;
    expect(view?.state).toBe('frozen');
    expect(view?.ySplit).toBe(1);

    // conditional formatting
    const cf = (sheet as unknown as { conditionalFormattings: unknown[] }).conditionalFormattings;
    expect(Array.isArray(cf)).toBe(true);
    expect(cf.length).toBeGreaterThan(0);

    // autofilter
    expect(sheet.autoFilter).toBeTruthy();
  });

  it('supports relative hyperlinks (used by the evidence package)', async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Rel');
    ws.getCell('A1').value = {
      text: 'evidence/EV-0001_report.pdf',
      hyperlink: 'evidence/EV-0001_report.pdf',
    };
    const back = await roundTrip(wb);
    const cell = back.getWorksheet('Rel')?.getCell('A1').value as { hyperlink?: string };
    expect(cell.hyperlink).toBe('evidence/EV-0001_report.pdf');
  });

  it('is importable through a dynamic import (lazy-loading path used by the app)', async () => {
    const mod = await import('exceljs');
    const Workbook = mod.default?.Workbook ?? (mod as unknown as typeof ExcelJS).Workbook;
    expect(typeof Workbook).toBe('function');
  });
});
