/**
 * Shared workbook infrastructure.
 * ExcelJS is imported dynamically by the callers so it never lands in the initial bundle.
 */
import type ExcelJS from 'exceljs';
import { APP_NAME, APP_VERSION, BUILD_TIME, GIT_SHA } from '@/config/app.config';
import { excel } from '@/i18n/en/excel';
import { disclaimerText } from '@/i18n/domainText';
import { useLangStore } from '@/i18n/store';
import type { Translator } from '@/i18n/translate';

export type Workbook = ExcelJS.Workbook;
export type { Translator };
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
 * The interface language at the moment of export. Workbooks are written in it; sheet names,
 * validated cell values and source content stay in English.
 */
export function currentTranslator(): Translator {
  return useLangStore.getState().translator;
}

/** "eere-r540-112-02 · 3.1 · p. 12 · clause 4" — the citation of a criterion, question or table. */
export function sourceText(
  source: { sourceId: string; section?: string; page?: string; clause?: string },
  tr: Translator = currentTranslator(),
): string {
  return [
    source.sourceId,
    source.section,
    source.page ? tr.t('excel.source.page', { page: source.page }) : undefined,
    source.clause ? tr.t('excel.source.clause', { clause: source.clause }) : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
}

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

/** A list data validation on a whole column range. */
export function applyListValidation(
  sheet: Worksheet,
  column: string,
  values: readonly string[],
  fromRow: number,
  toRow: number,
  options: { allowBlank?: boolean } = {},
  tr: Translator = currentTranslator(),
): void {
  for (let row = fromRow; row <= toRow; row += 1) {
    sheet.getCell(`${column}${row}`).dataValidation = {
      type: 'list',
      allowBlank: options.allowBlank ?? true,
      formulae: [`"${values.join(',')}"`],
      showErrorMessage: true,
      errorStyle: 'warning',
      errorTitle: tr.t('excel.validation.list.title'),
      error: tr.t('excel.validation.list.error', { values: values.join(', ') }),
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
  tr: Translator = currentTranslator(),
): void {
  for (let row = fromRow; row <= toRow; row += 1) {
    sheet.getCell(`${column}${row}`).dataValidation = {
      type: 'whole',
      operator: 'between',
      allowBlank: true,
      formulae: [min, max],
      showErrorMessage: true,
      errorStyle: 'warning',
      errorTitle: tr.t('excel.validation.range.title'),
      error: tr.t('excel.validation.range.error', { min, max }),
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
  tier: 'Tier 1' | 'Tier 2' | 'ARL';
  frameworkId: string;
  frameworkVersion: string;
  schemaVersion: number;
  generatedAt: Date;
  packageType?: 'standalone' | 'zip';
  counts?: Record<string, number>;
}

export function metaRows(
  meta: WorkbookMeta,
  tr: Translator = currentTranslator(),
): Array<[string, string]> {
  const { t } = tr;
  return [
    [t('excel.meta.tool'), APP_NAME],
    [t('excel.meta.toolVersion'), APP_VERSION],
    [t('excel.meta.gitSha'), GIT_SHA],
    [t('excel.meta.buildTime'), BUILD_TIME],
    [t('excel.meta.framework'), meta.frameworkId],
    [t('excel.meta.frameworkVersion'), meta.frameworkVersion],
    [t('excel.meta.schemaVersion'), String(meta.schemaVersion)],
    [t('excel.meta.generatedAt'), meta.generatedAt.toISOString()],
    [t('excel.meta.packageType'), meta.packageType ?? 'standalone'],
    ...Object.entries(meta.counts ?? {}).map(([k, v]) => [k, String(v)] as [string, string]),
  ];
}

/** Writes the metadata block onto a key/value sheet, starting at `startRow`. */
export function writeMetaBlock(
  sheet: Worksheet,
  meta: WorkbookMeta,
  startRow: number,
  tr: Translator = currentTranslator(),
): number {
  let row = startRow;
  for (const [key, value] of metaRows(meta, tr)) {
    sheet.getCell(`A${row}`).value = key;
    sheet.getCell(`A${row}`).font = { bold: true };
    sheet.getCell(`B${row}`).value = value;
    row += 1;
  }
  return row;
}

/** English text of the static-values notes (the README writes them in the export language). */
export const STATIC_VALUES_NOTE = excel['excel.staticNote.trl'];

export const ARL_STATIC_VALUES_NOTE = excel['excel.staticNote.arl'];

export function writeReadmeSheet(
  workbook: Workbook,
  meta: WorkbookMeta,
  sections: Array<{ heading: string; lines: string[] }>,
  label: string,
  options: { disclaimer?: string; staticNote?: string } = {},
  tr: Translator = currentTranslator(),
): Worksheet {
  const { t } = tr;
  const sheet = workbook.addWorksheet('README', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  sheet.columns = [
    { header: t('excel.readme.title', { app: APP_NAME }), key: 'a', width: 40 },
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

  writeSection(t('excel.readme.label'), [label]);
  writeSection(t('excel.readme.disclaimer'), [options.disclaimer ?? disclaimerText(tr)]);
  writeSection(t('excel.readme.important'), [options.staticNote ?? t('excel.staticNote.trl')]);
  for (const section of sections) writeSection(section.heading, section.lines);
  writeSection(
    t('excel.readme.provenance'),
    metaRows(meta, tr).map(([k, v]) => `${k}: ${v}`),
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

export function placeholderNote(tr: Translator = currentTranslator()): string {
  return tr.t('excel.placeholder');
}
