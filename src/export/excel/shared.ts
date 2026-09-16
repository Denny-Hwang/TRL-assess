/**
 * Shared workbook infrastructure (BUILD_SPEC D-3.0).
 * ExcelJS is imported dynamically by the callers so it never lands in the initial bundle.
 */
import type ExcelJS from 'exceljs';
import { APP_NAME, APP_VERSION, BUILD_TIME, DISCLAIMER, GIT_SHA } from '@/config/app.config';

export type Workbook = ExcelJS.Workbook;
export type Worksheet = ExcelJS.Worksheet;

export const STYLE = {
  headerFill: 'FF1B63F0',
  headerFont: 'FFFFFFFF',
  sectionFill: 'FFEEF6FF',
  placeholderFill: 'FFFFF7E6',
  goodFill: 'FFE6F4EA',
  badFill: 'FFFCE8E6',
  warnFill: 'FFFFF4CE',
  border: 'FFD9D9D9',
} as const;

/**
 * Excel treats a leading =, +, - or @ as a formula. Anything a user typed is written with a
 * leading apostrophe so a spreadsheet cannot be turned into a script by pasted content.
 */
export function safeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

export interface ColumnSpec {
  header: string;
  key: string;
  width: number;
  wrap?: boolean;
}

export function addTableSheet(
  workbook: Workbook,
  name: string,
  columns: ColumnSpec[],
  options: { freezeColumns?: number } = {},
): Worksheet {
  const sheet = workbook.addWorksheet(name, {
    views: [
      {
        state: 'frozen',
        ySplit: 1,
        ...(options.freezeColumns ? { xSplit: options.freezeColumns } : {}),
      },
    ],
  });
  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  styleHeaderRow(sheet);
  for (const [index, column] of columns.entries()) {
    if (column.wrap) {
      sheet.getColumn(index + 1).alignment = { wrapText: true, vertical: 'top' };
    }
  }
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };
  return sheet;
}

export function styleHeaderRow(sheet: Worksheet, rowNumber = 1): void {
  const row = sheet.getRow(rowNumber);
  row.font = { bold: true, color: { argb: STYLE.headerFont } };
  row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.headerFill } };
  row.alignment = { vertical: 'middle', wrapText: true };
  row.height = 28;
  row.commit();
}

/** A list data validation on a whole column range (BUILD_SPEC D-3.0). */
export function applyListValidation(
  sheet: Worksheet,
  column: string,
  values: readonly string[],
  fromRow: number,
  toRow: number,
  options: { allowBlank?: boolean } = {},
): void {
  for (let row = fromRow; row <= toRow; row += 1) {
    sheet.getCell(`${column}${row}`).dataValidation = {
      type: 'list',
      allowBlank: options.allowBlank ?? true,
      formulae: [`"${values.join(',')}"`],
      showErrorMessage: true,
      errorStyle: 'warning',
      errorTitle: 'Value not in the list',
      error: `Choose one of: ${values.join(', ')}`,
    };
  }
}

export function applyWholeNumberValidation(
  sheet: Worksheet,
  column: string,
  min: number,
  max: number,
  fromRow: number,
  toRow: number,
): void {
  for (let row = fromRow; row <= toRow; row += 1) {
    sheet.getCell(`${column}${row}`).dataValidation = {
      type: 'whole',
      operator: 'between',
      allowBlank: true,
      formulae: [min, max],
      showErrorMessage: true,
      errorStyle: 'warning',
      errorTitle: 'Out of range',
      error: `Enter a whole number between ${min} and ${max}.`,
    };
  }
}

/** Colour is never the only signal: the text value always stays in the cell. */
export function highlightValues(
  sheet: Worksheet,
  ref: string,
  rules: Array<{ text: string; fill: string }>,
): void {
  sheet.addConditionalFormatting({
    ref,
    rules: rules.map((rule, index) => ({
      type: 'containsText' as const,
      operator: 'containsText' as const,
      text: rule.text,
      priority: index + 1,
      style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: rule.fill } } },
    })),
  });
}

export function setHyperlink(
  sheet: Worksheet,
  cellRef: string,
  target: string,
  text = target,
): void {
  if (!target) return;
  sheet.getCell(cellRef).value = { text, hyperlink: target };
  sheet.getCell(cellRef).font = { color: { argb: 'FF1B63F0' }, underline: true };
}

export function setFormula(sheet: Worksheet, cellRef: string, formula: string): void {
  sheet.getCell(cellRef).value = { formula };
}

export function fillRow(sheet: Worksheet, rowNumber: number, argb: string, columns: number): void {
  for (let c = 1; c <= columns; c += 1) {
    sheet.getCell(rowNumber, c).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb },
    };
  }
}

export interface WorkbookMeta {
  tier: 'Tier 1' | 'Tier 2';
  frameworkId: string;
  frameworkVersion: string;
  schemaVersion: number;
  generatedAt: Date;
  packageType?: 'standalone' | 'zip';
  counts?: Record<string, number>;
}

export function metaRows(meta: WorkbookMeta): Array<[string, string]> {
  return [
    ['Tool', APP_NAME],
    ['Tool version', APP_VERSION],
    ['Git SHA', GIT_SHA],
    ['Tool build time (UTC)', BUILD_TIME],
    ['Framework', meta.frameworkId],
    ['Framework version', meta.frameworkVersion],
    ['Session schema version', String(meta.schemaVersion)],
    ['Generated at (UTC)', meta.generatedAt.toISOString()],
    ['Package type', meta.packageType ?? 'standalone'],
    ...Object.entries(meta.counts ?? {}).map(([k, v]) => [k, String(v)] as [string, string]),
  ];
}

/** Writes the metadata block onto a key/value sheet, starting at `startRow`. */
export function writeMetaBlock(sheet: Worksheet, meta: WorkbookMeta, startRow: number): number {
  let row = startRow;
  for (const [key, value] of metaRows(meta)) {
    sheet.getCell(`A${row}`).value = key;
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`B${row}`).value = value;
    row += 1;
  }
  return row;
}

export const STATIC_VALUES_NOTE =
  'Edits in this workbook do not recompute the TRL; re-import JSON into the app to recompute.';

export function writeReadmeSheet(
  workbook: Workbook,
  meta: WorkbookMeta,
  sections: Array<{ heading: string; lines: string[] }>,
  label: string,
): Worksheet {
  const sheet = workbook.addWorksheet('README', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  sheet.columns = [
    { header: 'TRL Assess — how to read this workbook', key: 'a', width: 40 },
    { header: '', key: 'b', width: 90 },
  ];
  styleHeaderRow(sheet);
  sheet.getColumn(2).alignment = { wrapText: true, vertical: 'top' };
  sheet.getColumn(1).alignment = { wrapText: true, vertical: 'top' };

  let row = 2;
  const writeSection = (heading: string, lines: string[]) => {
    sheet.getCell(`A${row}`).value = heading;
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: STYLE.sectionFill },
    };
    sheet.getCell(`B${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: STYLE.sectionFill },
    };
    row += 1;
    for (const line of lines) {
      sheet.getCell(`B${row}`).value = line;
      row += 1;
    }
    row += 1;
  };

  writeSection('Label', [label]);
  writeSection('Disclaimer', [DISCLAIMER]);
  writeSection('Important', [STATIC_VALUES_NOTE]);
  for (const section of sections) writeSection(section.heading, section.lines);
  writeSection(
    'Provenance',
    metaRows(meta).map(([k, v]) => `${k}: ${v}`),
  );
  return sheet;
}

export async function createWorkbook(): Promise<{
  workbook: Workbook;
  ExcelJSModule: typeof ExcelJS;
}> {
  const mod = await import('exceljs');
  const ExcelJSModule = (mod.default ?? mod) as unknown as typeof ExcelJS;
  const workbook = new ExcelJSModule.Workbook();
  workbook.creator = APP_NAME;
  workbook.lastModifiedBy = APP_NAME;
  workbook.created = new Date();
  workbook.modified = new Date();
  return { workbook, ExcelJSModule };
}

export async function workbookToBlob(workbook: Workbook): Promise<Blob> {
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer as ArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function placeholderNote(): string {
  return 'placeholder';
}
