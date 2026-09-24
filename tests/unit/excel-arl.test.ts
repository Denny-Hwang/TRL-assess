/**
 * BUILD_SPEC D-3.0 / D-3.3 — the ARL workbook is generated, read back with ExcelJS and asserted
 * sheet by sheet.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import ExcelJS from 'exceljs';
import { ARL_SHEETS, buildArlWorkbook, SAME_AS_CURRENT } from '@/export/excel/arl';
import { ARL_STATIC_VALUES_NOTE } from '@/export/excel/shared';
import { arlWorkbookFilename, timestampForFilename } from '@/export/download';
import { loadArlFramework, scoreArl } from '@/domain/arl';
import { resolveFramework } from '@/domain/frameworks';
import { parseSession, setArl } from '@/domain/session';
import { FICTIONAL_EXAMPLE } from '@/data/examples';
import type { ArlData, AssessmentSession } from '@/domain/schemas';
import {
  ARL_DISCLAIMER,
  ARL_LABEL,
  DEFAULT_ARL_FRAMEWORK,
  SCHEMA_VERSION,
} from '@/config/app.config';

const arlFramework = loadArlFramework(DEFAULT_ARL_FRAMEWORK);
const base = parseSession(FICTIONAL_EXAMPLE);
const trlFramework = resolveFramework(base.frameworkId);
const generatedAt = new Date('2026-09-24T10:11:12.000Z');
const INJECTION = '=HYPERLINK("http://example.invalid","click")';

const arl: ArlData = {
  frameworkId: arlFramework.id,
  frameworkVersion: arlFramework.version,
  context: {
    projectName: 'Fictional buoy project',
    technologyName: 'Fictional wave buoy',
    assessorName: 'A. Assessor',
    technologyScope: 'The buoy and its data link',
    valueChainScope: 'Manufacture to deployment',
    evaluationTimeline: 'As of today; 5-year window',
    policyEnvironment: 'Current policy, no changes assumed',
  },
  dimensions: [
    ...arlFramework.dimensions.map((d) => ({
      dimensionId: d.id,
      current: 'Low' as const,
      rationale: 'fictional rationale',
    })),
  ].map((d) => {
    if (d.dimensionId === 'ARL-A1') {
      return { ...d, current: 'High' as const, target: 'Medium' as const, plannedAction: 'pilot' };
    }
    if (d.dimensionId === 'ARL-B2')
      return { ...d, current: 'Medium' as const, rationale: INJECTION };
    if (d.dimensionId === 'ARL-D3') return { ...d, current: 'Unsure' as const };
    if (d.dimensionId === 'ARL-C5') return { ...d, current: 'N/A' as const, rationale: '' };
    return d;
  }),
};

const session: AssessmentSession = setArl(base, arl);

let back: ExcelJS.Workbook;

async function readBack(session: AssessmentSession) {
  const workbook = await buildArlWorkbook(arlFramework, session, trlFramework, generatedAt);
  const buffer = await workbook.xlsx.writeBuffer();
  const out = new ExcelJS.Workbook();
  await out.xlsx.load(buffer as ArrayBuffer);
  return out;
}

beforeAll(async () => {
  back = await readBack(session);
});

function sheet(name: string, wb: ExcelJS.Workbook = back): ExcelJS.Worksheet {
  const ws = wb.getWorksheet(name);
  if (!ws) throw new Error(`sheet ${name} missing`);
  return ws;
}

function headers(name: string): string[] {
  const out: string[] = [];
  sheet(name)
    .getRow(1)
    .eachCell((cell) => out.push(String(cell.value ?? '')));
  return out;
}

function keyValues(name: string, wb: ExcelJS.Workbook = back): Record<string, string> {
  const ws = sheet(name, wb);
  const out: Record<string, string> = {};
  for (let r = 2; r <= ws.rowCount; r += 1) {
    const key = String(ws.getCell(`A${r}`).value ?? '');
    if (key) out[key] = String(ws.getCell(`B${r}`).value ?? '');
  }
  return out;
}

describe('ARL workbook — structure', () => {
  it('has exactly the specified sheets, in order', () => {
    expect(back.worksheets.map((w) => w.name)).toEqual([...ARL_SHEETS]);
  });

  it('snapshots the column structure of the table sheets', () => {
    expect(headers('Risk_Assessment')).toEqual([
      'Core area',
      'Dimension ID',
      'Dimension',
      'Current rating',
      'Counted as',
      'Why counted so',
      'Rationale',
      'Evidence / reference',
      'Target rating (end of project)',
      'Target counted as',
      'Planned action',
      'Low risk (rubric)',
      'Medium risk (rubric)',
      'High risk (rubric)',
      'Origin',
      'Source (doc, section, page)',
    ]);
    expect(headers('ARL_Lookup')).toEqual([
      'Medium \\ High',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8+',
    ]);
  });

  it('freezes and bolds the header row on every sheet and filters every table sheet', () => {
    for (const name of ARL_SHEETS) {
      const ws = sheet(name);
      const view = ws.views?.[0] as { state?: string; ySplit?: number } | undefined;
      expect(view?.state, name).toBe('frozen');
      expect(view?.ySplit, name).toBe(1);
      expect(ws.getRow(1).font?.bold, name).toBe(true);
      if (name !== 'README') expect(ws.autoFilter, name).toBeTruthy();
    }
  });

  it('names the file ARL_<project-slug>_<timestamp>.xlsx', () => {
    expect(arlWorkbookFilename(session, generatedAt)).toBe(
      `ARL_fictional-buoy-project_${timestampForFilename(generatedAt)}.xlsx`,
    );
  });
});

describe('ARL workbook — README', () => {
  const text = () => {
    const lines: string[] = [];
    sheet('README').eachRow((row) => row.eachCell((cell) => lines.push(String(cell.value ?? ''))));
    return lines.join('\n');
  };

  it('carries the ARL label, the ARL disclaimer and the static-values warning', () => {
    expect(text()).toContain(ARL_LABEL);
    expect(text()).toContain(ARL_DISCLAIMER);
    expect(text()).toContain(ARL_STATIC_VALUES_NOTE);
    expect(text()).not.toContain('Edits in this workbook do not recompute the TRL');
  });

  it('records the rubric, its version and the generation timestamp', () => {
    expect(text()).toContain('Framework: doe-otc-arl-2025');
    expect(text()).toContain('Framework version: April 2025');
    expect(text()).toContain(`Generated at (UTC): ${generatedAt.toISOString()}`);
  });
});

describe('ARL workbook — Summary', () => {
  it('reports ARL Start and ARL End from the engine', () => {
    const result = scoreArl(arlFramework, session.arl!);
    const v = keyValues('Summary');
    expect(v['ARL Start']).toBe(`ARL ${result.start.arl} — ${result.start.band}`);
    expect(v['ARL End (target)']).toContain(`ARL ${result.end.arl} — ${result.end.band}`);
    expect(v['ARL End (target)']).toContain('Target — planned, not achieved');
    expect(v['Label']).toBe(ARL_LABEL);
    expect(v['Disclaimer']).toBe(ARL_DISCLAIMER);
  });

  it('shows the conservative counts in the flags', () => {
    const v = keyValues('Summary');
    expect(v['Flags — current ratings']).toMatch(/ARL-D3/);
    expect(v['Flags — current ratings']).toMatch(/N\/A without a rationale at ARL-C5/);
  });
});

describe('ARL workbook — Risk_Assessment', () => {
  const ws = () => sheet('Risk_Assessment');

  it('lists all 17 dimensions with the rubric text', () => {
    expect(ws().rowCount).toBe(18);
    expect(ws().getCell('B2').value).toBe('ARL-A1');
    expect(ws().getCell('L2').value).toBe(arlFramework.dimensions[0]!.levels.Low);
    expect(ws().getCell('O2').value).toBe('verbatim');
    expect(String(ws().getCell('P2').value)).toContain('p. 3');
  });

  it('writes the conservative count and its reason', () => {
    const row = ws()
      .getColumn('B')
      .values.findIndex((v) => v === 'ARL-D3');
    expect(ws().getCell(`D${row}`).value).toBe('Unsure');
    expect(ws().getCell(`E${row}`).value).toBe('High');
    expect(String(ws().getCell(`F${row}`).value)).toMatch(/counted as High/);
  });

  it('writes the target, or "Same as current" where none is set', () => {
    expect(ws().getCell('I2').value).toBe('Medium');
    expect(ws().getCell('K2').value).toBe('pilot');
    expect(ws().getCell('I3').value).toBe(SAME_AS_CURRENT);
  });

  it('guards user text against formula injection', () => {
    const row = ws()
      .getColumn('B')
      .values.findIndex((v) => v === 'ARL-B2');
    expect(ws().getCell(`G${row}`).value).toBe(`'${INJECTION}`);
  });

  it('keeps dropdowns on the rating columns', () => {
    const current = ws().getCell('D2').dataValidation;
    expect(current?.type).toBe('list');
    expect(current?.formulae?.[0]).toContain('Not assessed');
    expect(ws().getCell('I2').dataValidation?.formulae?.[0]).toContain(SAME_AS_CURRENT);
  });
});

describe('ARL workbook — ARL_Lookup', () => {
  it('reproduces the table and marks the start and target cells', () => {
    const ws = sheet('ARL_Lookup');
    const result = scoreArl(arlFramework, session.arl!);
    expect(ws.getCell('B2').value).toBe(9);
    expect(ws.getCell('J10').value).toBe(1);
    const startCell = ws.getCell(result.start.tally.Medium + 2, result.start.tally.High + 2);
    expect(String(startCell.note)).toContain(`Start: ${result.start.tally.Medium} Medium`);
    const endCell = ws.getCell(result.end.tally.Medium + 2, result.end.tally.High + 2);
    expect(String(endCell.note)).toContain('Target');
    const labels = ws.getColumn('A').values.map((v) => String(v ?? ''));
    expect(labels).toContain('ARL 7–9');
  });
});

describe('ARL workbook — References, Metadata', () => {
  it('references the rubric', () => {
    expect(sheet('References').getColumn('A').values).toContain('doe-otc-arl-2025');
  });

  it('records the provenance of the export', () => {
    const v = keyValues('Metadata');
    expect(v['Framework']).toBe('doe-otc-arl-2025');
    expect(v['Session schema version']).toBe(String(SCHEMA_VERSION));
    expect(v['TRL framework of the session']).toContain(base.frameworkId);
    expect(v['Dimensions rated']).toBe('17');
  });

  it('refuses a session without ARL ratings', async () => {
    await expect(buildArlWorkbook(arlFramework, base, trlFramework)).rejects.toThrow(
      /no ARL ratings/,
    );
  });
});
