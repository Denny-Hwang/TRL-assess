/**
 * BUILD_SPEC D-3.0 / D-3.1 — the Tier 1 workbook is generated, read back with ExcelJS and
 * asserted sheet by sheet.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import ExcelJS from 'exceljs';
import { buildTier1Workbook, TIER1_SHEETS } from '@/export/excel/tier1';
import { resolveFramework } from '@/domain/frameworks';
import { parseSession } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';
import { scoreTier1 } from '@/domain/tier1';
import { safeText, STATIC_VALUES_NOTE } from '@/export/excel/shared';
import { BLANK_NEXT_EVIDENCE_ROWS, TIER1_LABEL } from '@/config/app.config';
import { slugify, timestampForFilename, workbookFilename } from '@/export/download';

const session = parseSession(FICTIONAL_EXAMPLE);
const framework = resolveFramework(session.frameworkId);
const generatedAt = new Date('2026-02-03T04:05:06.000Z');

let back: ExcelJS.Workbook;

beforeAll(async () => {
  const workbook = await buildTier1Workbook(framework, session, generatedAt);
  const buffer = await workbook.xlsx.writeBuffer();
  back = new ExcelJS.Workbook();
  await back.xlsx.load(buffer as ArrayBuffer);
});

function sheet(name: string): ExcelJS.Worksheet {
  const ws = back.getWorksheet(name);
  if (!ws) throw new Error(`sheet ${name} missing`);
  return ws;
}

function headers(name: string): string[] {
  const row = sheet(name).getRow(1);
  const out: string[] = [];
  row.eachCell((cell) => out.push(String(cell.value ?? '')));
  return out;
}

function columnValues(name: string, column: string): string[] {
  const ws = sheet(name);
  const values: string[] = [];
  for (let r = 2; r <= ws.rowCount; r += 1) {
    const value = ws.getCell(`${column}${r}`).value;
    values.push(value === null || value === undefined ? '' : String(value));
  }
  return values;
}

describe('Tier 1 workbook — structure', () => {
  it('has exactly the specified sheets, in order', () => {
    expect(back.worksheets.map((w) => w.name)).toEqual([...TIER1_SHEETS]);
  });

  it('snapshots the sheet and column structure', () => {
    const structure = Object.fromEntries(TIER1_SHEETS.map((name) => [name, headers(name)]));
    expect(structure).toMatchInlineSnapshot(`
      {
        "Context": [
          "Field",
          "Value",
        ],
        "Next_Evidence_Placeholders": [
          "TRL",
          "Criterion ID",
          "Criterion",
          "Planned evidence (placeholder)",
          "Evidence link / path (placeholder)",
          "Open",
          "Owner",
          "Target date",
        ],
        "README": [
          "TRL Assess — how to read this workbook",
          "",
        ],
        "References": [
          "Source ID",
          "Title",
          "Issuer",
          "Version/Date",
          "URL",
        ],
        "Responses": [
          "TRL",
          "Question ID",
          "Question",
          "Answer",
          "Note",
          "Origin",
          "Source (doc, section, page)",
        ],
        "Summary": [
          "Item",
          "Value",
        ],
      }
    `);
  });

  it('freezes the header row on every sheet and bolds it', () => {
    for (const name of TIER1_SHEETS) {
      const ws = sheet(name);
      const view = ws.views?.[0] as { state?: string; ySplit?: number } | undefined;
      expect(view?.state, name).toBe('frozen');
      expect(view?.ySplit, name).toBe(1);
      expect(ws.getRow(1).font?.bold, name).toBe(true);
    }
  });

  it('sets an autofilter on the tabular sheets', () => {
    for (const name of ['Context', 'Responses', 'Next_Evidence_Placeholders', 'References']) {
      expect(sheet(name).autoFilter, name).toBeTruthy();
    }
  });

  it('gives every column a sensible width', () => {
    for (const name of TIER1_SHEETS) {
      for (const column of sheet(name).columns ?? []) {
        expect(column.width ?? 0).toBeGreaterThan(5);
      }
    }
  });
});

describe('Tier 1 workbook — README sheet', () => {
  const text = () => {
    const ws = sheet('README');
    const lines: string[] = [];
    ws.eachRow((row) => row.eachCell((cell) => lines.push(String(cell.value ?? ''))));
    return lines.join('\n');
  };

  it('carries the label, the disclaimer and the static-values warning', () => {
    expect(text()).toContain(TIER1_LABEL);
    expect(text()).toContain('not an independent Technology Readiness');
    expect(text()).toContain(STATIC_VALUES_NOTE);
  });

  it('explains each sheet and how to fill the placeholders', () => {
    expect(text()).toContain('Next_Evidence_Placeholders');
    expect(text()).toContain('How to fill the placeholders');
  });

  it('records the tool version, framework, git SHA and generation timestamp', () => {
    const body = text();
    expect(body).toContain('Framework: marine-energy-eere');
    expect(body).toContain('Framework version: 1.0.0');
    expect(body).toContain('Git SHA:');
    expect(body).toContain(`Generated at (UTC): ${generatedAt.toISOString()}`);
  });
});

describe('Tier 1 workbook — Summary sheet', () => {
  const values = () =>
    Object.fromEntries(
      columnValues('Summary', 'A').map((key, index) => [key, columnValues('Summary', 'B')[index]]),
    );

  it('reports the engine result', () => {
    const result = scoreTier1(framework, session.tier1!);
    const v = values();
    expect(v['Estimated TRL (headline)']).toBe(`TRL ${result.contiguousTrl}`);
    expect(v['Highest level claimed (first "Yes")']).toBe(`TRL ${result.firstYesTrl}`);
    expect(v['Build × environment cross-check']).toContain(`TRL ${result.matrixTrl}`);
    expect(v['Consistency rating']).toBe(result.consistency);
  });

  it('carries the project, technology, assessor and framework', () => {
    const v = values();
    expect(v['Project']).toBe(session.tier1!.context.projectName);
    expect(v['Technology']).toBe(session.tier1!.context.technologyName);
    expect(v['Assessor']).toBe(session.tier1!.context.assessorName);
    expect(v['Framework']).toContain('marine-energy-eere');
  });

  it('carries the label and the disclaimer', () => {
    const v = values();
    expect(v['Label']).toBe(TIER1_LABEL);
    expect(v['Disclaimer']).toContain('not an independent Technology Readiness Assessment');
  });
});

describe('Tier 1 workbook — Context sheet', () => {
  it('lists every context field including the environment and build descriptions', () => {
    const fields = columnValues('Context', 'A');
    for (const expected of [
      'Project name',
      'Technology name',
      'Assessor name',
      'Highest-fidelity test performed',
      'Environment code',
      'Environment description',
      'Build code',
      'Build description',
    ]) {
      expect(fields).toContain(expected);
    }
    const values = columnValues('Context', 'B');
    expect(values[fields.indexOf('Environment code')]).toContain('E2');
    expect(values[fields.indexOf('Build description')]!.length).toBeGreaterThan(20);
  });
});

describe('Tier 1 workbook — Responses sheet', () => {
  it('has one row per question, ordered TRL 9 → 1', () => {
    const levels = columnValues('Responses', 'A').filter(Boolean).map(Number);
    expect(levels).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });

  it('records the answers, notes, origin and source', () => {
    const ws = sheet('Responses');
    const row = ws.getRow(6); // TRL 5 wa the "Unsure" answer in the example
    expect(String(row.getCell(2).value)).toBe('MEE-T1-L5');
    expect(String(row.getCell(4).value)).toBe('Unsure');
    expect(String(row.getCell(5).value)).toContain('fresh water');
    expect(String(row.getCell(6).value)).toBe('adapted');
    expect(String(row.getCell(7).value)).toContain('eere-r540-112-02');
  });

  it('validates the Answer column against Yes / No / Unsure', () => {
    const dv = sheet('Responses').getCell('D2').dataValidation;
    expect(dv?.type).toBe('list');
    expect(dv?.formulae?.[0]).toBe('"Yes,No,Unsure"');
  });

  it('highlights the answers without relying on colour alone', () => {
    const cf = (sheet('Responses') as unknown as { conditionalFormattings: unknown[] })
      .conditionalFormattings;
    expect(cf.length).toBeGreaterThan(0);
    expect(columnValues('Responses', 'D').filter(Boolean).length).toBe(9);
  });
});

describe('Tier 1 workbook — Next_Evidence_Placeholders sheet', () => {
  it('lists the criteria for the next two levels above the estimate', () => {
    const levels = new Set(columnValues('Next_Evidence_Placeholders', 'A').filter(Boolean));
    expect([...levels].sort()).toEqual(['5', '6']);
  });

  it('adds the configured number of blank placeholder rows', () => {
    const ids = columnValues('Next_Evidence_Placeholders', 'B');
    const blanks = columnValues('Next_Evidence_Placeholders', 'C').filter(
      (v) => v === 'placeholder',
    );
    expect(blanks).toHaveLength(BLANK_NEXT_EVIDENCE_ROWS);
    expect(ids.filter(Boolean).length).toBeGreaterThan(0);
  });

  it('carries the HYPERLINK formula on every row, including the blanks', () => {
    const ws = sheet('Next_Evidence_Placeholders');
    for (let r = 2; r <= ws.rowCount; r += 1) {
      const cell = ws.getCell(`F${r}`).value as { formula?: string } | null;
      expect(cell?.formula, `row ${r}`).toContain('HYPERLINK(E');
    }
  });
});

describe('Tier 1 workbook — References sheet', () => {
  it('lists the framework sources with clickable URLs', () => {
    const ids = columnValues('References', 'A').filter(Boolean);
    expect(ids).toContain('eere-r540-112-02');
    expect(ids).toContain('dod-tra-2025');
    const link = sheet('References').getCell('E2').value as { hyperlink?: string };
    expect(link.hyperlink).toMatch(/^https:\/\//);
  });
});

describe('formula-injection guard and file naming (D-3.0)', () => {
  it('prefixes user text that Excel would read as a formula', () => {
    expect(safeText('=1+1')).toBe("'=1+1");
    expect(safeText('+cmd')).toBe("'+cmd");
    expect(safeText('-2')).toBe("'-2");
    expect(safeText('@x')).toBe("'@x");
    expect(safeText('normal')).toBe('normal');
    expect(safeText(undefined)).toBe('');
  });

  it('names the file TRL_<tier>_<slug>_<timestamp>.xlsx', () => {
    const name = workbookFilename('Tier1', session, new Date('2026-02-03T04:05:00'));
    expect(name).toMatch(/^TRL_Tier1_[a-z0-9-]+_\d{8}-\d{4}\.xlsx$/);
    expect(name).toContain(slugify(session.tier1!.context.projectName));
  });

  it('formats the timestamp as YYYYMMDD-HHmm in local time', () => {
    expect(timestampForFilename(new Date(2026, 1, 3, 4, 5))).toBe('20260203-0405');
  });

  it('writes a formula-like project name safely into the workbook', async () => {
    const evil = {
      ...session,
      tier1: {
        ...session.tier1!,
        context: { ...session.tier1!.context, projectName: '=HYPERLINK("http://evil","x")' },
      },
    };
    const workbook = await buildTier1Workbook(framework, evil, generatedAt);
    const buffer = await workbook.xlsx.writeBuffer();
    const reloaded = new ExcelJS.Workbook();
    await reloaded.xlsx.load(buffer as ArrayBuffer);
    const value = reloaded.getWorksheet('Summary')!.getCell('B2').value;
    expect(typeof value).toBe('string');
    expect(String(value).startsWith("'=") || String(value).startsWith('=')).toBe(true);
    expect((value as { formula?: string }).formula).toBeUndefined();
  });
});
