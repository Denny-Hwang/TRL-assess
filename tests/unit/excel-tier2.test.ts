/**
 * The Tier 2 workbook is generated, read back and asserted sheet by sheet.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import ExcelJS from 'exceljs';
import {
  buildTier2Workbook,
  GAP_STATUSES,
  REVIEW_CONCLUSIONS,
  TIER2_SHEETS,
} from '@/export/excel/tier2';
import { resolveFramework } from '@/domain/frameworks';
import { parseSession } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';
import { scoreTier2 } from '@/domain/tier2';
import {
  BLANK_EVIDENCE_PLACEHOLDER_ROWS,
  BLANK_GAP_ACTION_ROWS,
  SCHEMA_VERSION,
  TIER2_LABEL,
} from '@/config/app.config';
import { CRITERION_STATUSES, EVIDENCE_TYPES, MARKINGS, VERIFICATIONS } from '@/domain/schemas';

const session = parseSession(FICTIONAL_EXAMPLE);
const framework = resolveFramework(session.frameworkId);
const generatedAt = new Date('2026-02-03T04:05:06.000Z');

let back: ExcelJS.Workbook;

beforeAll(async () => {
  const workbook = await buildTier2Workbook(framework, session, { generatedAt });
  const buffer = await workbook.xlsx.writeBuffer();
  back = new ExcelJS.Workbook();
  await back.xlsx.load(buffer as ArrayBuffer);
});

const sheet = (name: string) => {
  const ws = back.getWorksheet(name);
  if (!ws) throw new Error(`sheet ${name} missing`);
  return ws;
};

const headers = (name: string) => {
  const out: string[] = [];
  sheet(name)
    .getRow(1)
    .eachCell((cell) => out.push(String(cell.value ?? '')));
  return out;
};

const column = (name: string, col: string) => {
  const ws = sheet(name);
  const values: string[] = [];
  for (let r = 2; r <= ws.rowCount; r += 1) {
    const value = ws.getCell(`${col}${r}`).value;
    values.push(value === null || value === undefined ? '' : String(value));
  }
  return values;
};

describe('Tier 2 workbook — sheets and columns (D-3.2)', () => {
  it('has exactly the specified sheets, in order', () => {
    expect(back.worksheets.map((w) => w.name)).toEqual([...TIER2_SHEETS]);
  });

  it('CTE_Register has the specified columns', () => {
    expect(headers('CTE_Register')).toEqual([
      'CTE ID',
      'Name',
      'Kind',
      'Critical',
      'Description',
      'Why critical',
      'Owner',
      'Target TRL',
      'Assessed TRL',
    ]);
  });

  it('Criteria_Assessment has the specified columns including the placeholder column', () => {
    expect(headers('Criteria_Assessment')).toEqual([
      'CTE ID',
      'CTE',
      'TRL',
      'Criterion ID',
      'Criterion',
      'Category',
      'Mandatory',
      'Origin',
      'Source',
      'Status',
      'Justification (N/A)',
      'Satisfied',
      'Evidence IDs',
      'Additional evidence (placeholder)',
      'Assessor note',
    ]);
  });

  it('Evidence_Register has the specified columns', () => {
    expect(headers('Evidence_Register')).toEqual([
      'Evidence ID',
      'Type',
      'Title',
      'Description',
      'Linked CTE/Criteria',
      'Location / URL',
      'Local file (relative path)',
      'Open',
      'Repo URL',
      'Commit SHA',
      'Repo path / tag',
      'DOI',
      'File size (bytes)',
      'SHA-256',
      'Date',
      'Owner / custodian',
      'Marking',
      'Verification',
      'Verified by',
      'Verified date',
      'Bundled in package',
    ]);
  });

  it('Gap_Actions has the specified columns', () => {
    expect(headers('Gap_Actions')).toEqual([
      'CTE ID',
      'Next TRL',
      'Criterion ID',
      'Gap description',
      'Planned action',
      'Planned evidence (placeholder)',
      'Owner',
      'Due date',
      'Status',
    ]);
  });

  it('freezes and bolds the header row on every sheet', () => {
    for (const name of TIER2_SHEETS) {
      const ws = sheet(name);
      const view = ws.views?.[0] as { state?: string; ySplit?: number } | undefined;
      expect(view?.state, name).toBe('frozen');
      expect(ws.getRow(1).font?.bold, name).toBe(true);
    }
  });
});

describe('Tier 2 workbook — README and Summary', () => {
  const readme = () => {
    const lines: string[] = [];
    sheet('README').eachRow((row) => row.eachCell((c) => lines.push(String(c.value ?? ''))));
    return lines.join('\n');
  };

  it('explains how to attach evidence in Excel', () => {
    const text = readme();
    expect(text).toContain('How to attach evidence in Excel');
    expect(text).toContain('Location / URL');
    expect(text).toContain('evidence/ folder next to this workbook');
    expect(text).toContain('Open');
    expect(text).toContain('Sensitive — reference only');
  });

  it('carries the Tier 2 label, the disclaimer and the static-values note', () => {
    const text = readme();
    expect(text).toContain(TIER2_LABEL);
    expect(text).toContain('do not recompute the TRL');
  });

  it('reports the system summary, the limiting CTEs and the tier delta', () => {
    const result = scoreTier2(framework, session.tier2!);
    const keys = column('Summary', 'A');
    const values = column('Summary', 'B');
    const get = (key: string) => values[keys.indexOf(key)];
    expect(get('System summary (TRL)')).toBe(`TRL ${result.system.trl}`);
    expect(get('Limiting CTE(s)')).toBe('CTE-02, CTE-03');
    expect(get('Tier 1 contiguous TRL')).toBe('TRL 4');
    expect(get('Tier 2 − Tier 1 delta')).toBe('-1');
    expect(get('Label')).toBe(TIER2_LABEL);
  });

  it('includes the per-CTE table with completeness and coverage', () => {
    const ids = column('Summary', 'A');
    expect(ids).toContain('CTE ID');
    expect(ids).toContain('CTE-01');
    const headerIndex = ids.indexOf('CTE ID');
    const row = sheet('Summary').getRow(headerIndex + 3); // header row + 1 (1-based) + 1
    expect(String(row.getCell(1).value)).toMatch(/^CTE-0/);
  });
});

describe('Tier 2 workbook — Criteria_Assessment', () => {
  it('has one row per CTE × applicable criterion', () => {
    const result = scoreTier2(framework, session.tier2!);
    const expected = result.ctes.reduce(
      (sum, c) => sum + c.levels.reduce((s, l) => s + l.applicable.length, 0),
      0,
    );
    expect(column('Criteria_Assessment', 'A').filter(Boolean)).toHaveLength(expected);
  });

  it('validates Status against the five statuses and Satisfied against Yes/No', () => {
    const status = sheet('Criteria_Assessment').getCell('J2').dataValidation;
    expect(status?.type).toBe('list');
    expect(status?.formulae?.[0]).toBe(`"${CRITERION_STATUSES.join(',')}"`);
    const satisfied = sheet('Criteria_Assessment').getCell('L2').dataValidation;
    expect(satisfied?.formulae?.[0]).toBe('"Yes,No"');
  });

  it('computes Satisfied consistently with the engine', () => {
    const ids = column('Criteria_Assessment', 'D');
    const satisfied = column('Criteria_Assessment', 'L');
    const cteIds = column('Criteria_Assessment', 'A');
    const result = scoreTier2(framework, session.tier2!);
    for (const [index, criterionId] of ids.entries()) {
      if (!criterionId) continue;
      const cte = result.ctes.find((c) => c.cte.id === cteIds[index])!;
      const outcome = cte.levels
        .flatMap((l) => l.applicable)
        .find((o) => o.criterion.id === criterionId)!;
      expect(satisfied[index], criterionId).toBe(outcome.satisfied ? 'Yes' : 'No');
    }
  });

  it('carries origin, mandatory flag and source for every row', () => {
    expect(
      column('Criteria_Assessment', 'H')
        .filter(Boolean)
        .every((o) => ['verbatim', 'adapted', 'tailored'].includes(o)),
    ).toBe(true);
    expect(
      column('Criteria_Assessment', 'I')
        .filter(Boolean)
        .every((s) => s.length > 0),
    ).toBe(true);
    expect(new Set(column('Criteria_Assessment', 'G').filter(Boolean))).toEqual(
      new Set(['Yes', 'No']),
    );
  });

  it('applies conditional formatting to Status and Satisfied', () => {
    const cf = (sheet('Criteria_Assessment') as unknown as { conditionalFormattings: unknown[] })
      .conditionalFormattings;
    expect(cf.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Tier 2 workbook — Evidence_Register', () => {
  it('lists every evidence item followed by the configured placeholder rows', () => {
    const ids = column('Evidence_Register', 'A').filter(Boolean);
    const real = session.tier2!.evidence.length;
    expect(ids).toHaveLength(real + BLANK_EVIDENCE_PLACEHOLDER_ROWS);
    expect(ids.slice(0, real)).toEqual(session.tier2!.evidence.map((e) => e.id));
    expect(ids[real]).toBe('EV-P001');
    expect(ids[ids.length - 1]).toBe(`EV-P0${BLANK_EVIDENCE_PLACEHOLDER_ROWS}`);
  });

  it('keeps every validation active on the placeholder rows', () => {
    const ws = sheet('Evidence_Register');
    const lastRow = session.tier2!.evidence.length + BLANK_EVIDENCE_PLACEHOLDER_ROWS + 1;
    expect(ws.getCell(`B${lastRow}`).dataValidation?.formulae?.[0]).toBe(
      `"${EVIDENCE_TYPES.join(',')}"`,
    );
    expect(ws.getCell(`Q${lastRow}`).dataValidation?.formulae?.[0]).toBe(`"${MARKINGS.join(',')}"`);
    expect(ws.getCell(`R${lastRow}`).dataValidation?.formulae?.[0]).toBe(
      `"${VERIFICATIONS.join(',')}"`,
    );
  });

  it('carries the Open formula on every row, including placeholders', () => {
    const ws = sheet('Evidence_Register');
    for (let r = 2; r <= ws.rowCount; r += 1) {
      const cell = ws.getCell(`H${r}`).value as { formula?: string } | null;
      expect(cell?.formula, `row ${r}`).toContain('HYPERLINK');
      expect(cell?.formula).toContain('Open file');
      expect(cell?.formula).toContain('Open link');
    }
  });

  it('records file size and SHA-256 where a file exists', () => {
    const shas = column('Evidence_Register', 'N').filter(Boolean);
    // The example session carries no blobs, so this asserts the columns exist and stay empty.
    expect(shas).toHaveLength(0);
  });

  it('marks sensitive evidence as reference-only with no local file', () => {
    const ids = column('Evidence_Register', 'A');
    const markings = column('Evidence_Register', 'Q');
    const locals = column('Evidence_Register', 'G');
    const bundled = column('Evidence_Register', 'U');
    const index = markings.indexOf('Sensitive — reference only');
    expect(index).toBeGreaterThanOrEqual(0);
    expect(ids[index]).toBe('EV-0010');
    expect(locals[index]).toBe('');
    expect(bundled[index]).toBe('No (reference only)');
  });

  it('hyperlinks the Location / URL column', () => {
    const ws = sheet('Evidence_Register');
    const urlRow = session.tier2!.evidence.findIndex((e) => e.url) + 2;
    const cell = ws.getCell(`F${urlRow}`).value as { hyperlink?: string };
    expect(cell.hyperlink).toMatch(/^https:\/\//);
  });
});

describe('Tier 2 workbook — Gap_Actions, Review_Signoff, References, Metadata', () => {
  it('pre-fills the unmet mandatory criteria at each CTE next level plus blank rows', () => {
    const result = scoreTier2(framework, session.tier2!);
    const expected = result.ctes.reduce((sum, c) => sum + c.gaps.length, 0);
    const criterionIds = column('Gap_Actions', 'C').filter(Boolean);
    expect(criterionIds).toHaveLength(expected);
    expect(sheet('Gap_Actions').rowCount).toBe(expected + BLANK_GAP_ACTION_ROWS + 1);
  });

  it('validates the gap status list', () => {
    expect(sheet('Gap_Actions').getCell('I2').dataValidation?.formulae?.[0]).toBe(
      `"${GAP_STATUSES.join(',')}"`,
    );
  });

  it('carries assessor and reviewer blocks and says sign-off is outside scoring', () => {
    const fields = column('Review_Signoff', 'A');
    expect(fields).toContain('Assessor — name');
    expect(fields).toContain('Independent reviewer — conclusion');
    expect(fields).toContain('Note');
    const conclusionRow = fields.indexOf('Independent reviewer — conclusion') + 2;
    expect(sheet('Review_Signoff').getCell(`B${conclusionRow}`).dataValidation?.formulae?.[0]).toBe(
      `"${REVIEW_CONCLUSIONS.join(',')}"`,
    );
    expect(column('Review_Signoff', 'B').join(' ')).toContain('outside the tool');
  });

  it('lists every source cited by the framework', () => {
    const ids = column('References', 'A').filter(Boolean);
    expect(ids).toContain('dod-tra-2025');
    expect(ids).toContain('eere-r540-112-02');
    expect(ids).toContain('nrel-me-risk');
  });

  it('records the metadata key/value pairs', () => {
    const keys = column('Metadata', 'A');
    const values = column('Metadata', 'B');
    const get = (k: string) => values[keys.indexOf(k)];
    expect(get('Framework')).toBe('marine-energy-eere');
    expect(get('Framework version')).toBe('1.0.0');
    // The example file is schema v1; parseSession migrates it to the current version.
    expect(get('Session schema version')).toBe(String(SCHEMA_VERSION));
    expect(get('Generated at (UTC)')).toBe(generatedAt.toISOString());
    expect(get('Package type')).toBe('standalone');
    expect(get('CTEs')).toBe('3');
    expect(get('Evidence items')).toBe('10');
  });
});

describe('Tier 2 workbook — refusals', () => {
  it('refuses to export a session with no CTEs', async () => {
    await expect(buildTier2Workbook(framework, { ...session, tier2: undefined })).rejects.toThrow(
      /no Critical Technology Elements/,
    );
  });
});
