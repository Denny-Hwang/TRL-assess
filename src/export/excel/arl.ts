/**
 * ARL workbook.
 * Sheets, in order: README, Summary, Scope, Risk_Assessment, ARL_Lookup, References, Metadata.
 * The TRL workbooks are not touched.
 */
import { sourcesFor } from '@/data/sources';
import { scoreArl, type ArlProfileResult, type ArlResult, type ArlTally } from '@/domain/arl';
import type { ResolvedFramework } from '@/domain/frameworks';
import {
  ARL_RATINGS,
  ARL_RISKS,
  type ArlFramework,
  type AssessmentSession,
} from '@/domain/schemas';
import { arlWorkbookFilename, downloadBlob } from '@/export/download';
import { arlFlagText, arlReasonText, disclaimerText } from '@/i18n/domainText';
import {
  addTableSheet,
  applyListValidation,
  createWorkbook,
  currentTranslator,
  highlightValues,
  safeText,
  setHyperlink,
  sourceText as citation,
  STYLE,
  workbookToBlob,
  writeMetaBlock,
  writeReadmeSheet,
  type Translator,
  type Workbook,
  type WorkbookMeta,
  type Worksheet,
} from './shared';

export const ARL_SHEETS = [
  'README',
  'Summary',
  'Scope',
  'Risk_Assessment',
  'ARL_Lookup',
  'References',
  'Metadata',
] as const;

/** Written in the "Target rating" column when no end-of-project target differs from today. */
export const SAME_AS_CURRENT = 'Same as current';

/** The rubric citations carry no clause numbers: document, section and page only. */
function sourceText(
  source: { sourceId: string; section?: string; page?: string },
  tr: Translator,
): string {
  return citation({ sourceId: source.sourceId, section: source.section, page: source.page }, tr);
}

function tallyText(tally: ArlTally, { t }: Translator): string {
  return t('excel.arl.tally', {
    low: tally.Low,
    medium: tally.Medium,
    high: tally.High,
    na: tally['N/A'],
  });
}

function arlText(profile: ArlProfileResult): string {
  return `ARL ${profile.arl} — ${profile.band}`;
}

function flagsText(profile: ArlProfileResult, total: number, tr: Translator): string {
  return profile.flags.length
    ? profile.flags.map((f) => arlFlagText(tr, f, total)).join('\n')
    : tr.t('flags.none');
}

export async function buildArlWorkbook(
  arlFramework: ArlFramework,
  session: AssessmentSession,
  trlFramework: ResolvedFramework,
  generatedAt: Date = new Date(),
  tr: Translator = currentTranslator(),
): Promise<Workbook> {
  const { t } = tr;
  const arl = session.arl;
  if (!arl) throw new Error(t('excel.arl.error.noRatings'));
  const result = scoreArl(arlFramework, arl);
  const { workbook } = await createWorkbook();

  const rated = result.start.outcomes.filter((o) => o.rating !== 'Not assessed').length;
  const meta: WorkbookMeta = {
    tier: 'ARL',
    frameworkId: arlFramework.id,
    frameworkVersion: arlFramework.version,
    schemaVersion: session.schemaVersion,
    generatedAt,
    counts: {
      [t('excel.arl.count.rated')]: rated,
      [t('excel.arl.count.total')]: arlFramework.dimensions.length,
    },
  };

  writeReadmeSheet(
    workbook,
    meta,
    [
      {
        heading: t('excel.readme.contents'),
        lines: [
          t('excel.arl.readme.contents.summary'),
          t('excel.arl.readme.contents.scope'),
          t('excel.arl.readme.contents.risk'),
          t('excel.arl.readme.contents.lookup'),
          t('excel.arl.readme.contents.references'),
          t('excel.arl.readme.contents.metadata'),
        ],
      },
      {
        heading: t('excel.arl.readme.calc.heading'),
        lines: [
          t('excel.arl.readme.calc.rated'),
          t('excel.arl.readme.calc.tally'),
          t('excel.arl.readme.calc.conservative'),
          t('excel.arl.readme.calc.end', { target: t('label.arlTarget') }),
          t('excel.arl.readme.calc.trl'),
        ],
      },
      {
        heading: t('excel.arl.readme.use.heading'),
        lines: [
          t('excel.arl.readme.use.freeText'),
          t('excel.arl.readme.use.dropdowns'),
          t('excel.arl.readme.use.sensitive'),
        ],
      },
    ],
    t('label.arl'),
    { disclaimer: disclaimerText(tr, 'arl'), staticNote: t('excel.staticNote.arl') },
    tr,
  );

  buildSummarySheet(workbook, arlFramework, session, result, generatedAt, tr);
  buildScopeSheet(workbook, session, trlFramework, tr);
  buildRiskSheet(workbook, result, tr);
  buildLookupSheet(workbook, arlFramework, result, tr);
  buildReferencesSheet(workbook, arlFramework, tr);
  buildMetadataSheet(workbook, meta, session, trlFramework, tr);
  return workbook;
}

function keyValueSheet(workbook: Workbook, name: string, { t }: Translator): Worksheet {
  return addTableSheet(workbook, name, [
    { header: t('excel.col.item'), key: 'item', width: 36 },
    { header: t('excel.col.value'), key: 'value', width: 90, wrap: true },
  ]);
}

function buildSummarySheet(
  workbook: Workbook,
  framework: ArlFramework,
  session: AssessmentSession,
  result: ArlResult,
  generatedAt: Date,
  tr: Translator,
): void {
  const { t } = tr;
  const { context } = session.arl!;
  const sheet = keyValueSheet(workbook, 'Summary', tr);
  const total = framework.dimensions.length;
  const rows: Array<[string, string]> = [
    [t('excel.row.project'), safeText(context.projectName)],
    [t('excel.row.technology'), safeText(context.technologyName)],
    [t('excel.row.assessor'), safeText(context.assessorName)],
    [t('excel.row.organization'), safeText(context.organization ?? '')],
    [t('excel.row.assessmentDate'), session.updatedAt],
    [t('excel.arl.summary.rubric'), `${framework.name} — ${framework.id} (${framework.version})`],
    ['', ''],
    [t('excel.arl.summary.start'), arlText(result.start)],
    [t('excel.arl.summary.end'), `${arlText(result.end)} (${t('label.arlTarget')})`],
    [
      t('excel.arl.summary.change'),
      result.change > 0 ? `+${result.change}` : String(result.change),
    ],
    [t('excel.arl.summary.currentTally'), tallyText(result.start.tally, tr)],
    [t('excel.arl.summary.targetTally'), tallyText(result.end.tally, tr)],
    ...result.start.byArea.map(
      ({ area, tally }) =>
        [
          t('excel.arl.summary.areaCurrent', { area: `${area.id}. ${area.name}` }),
          tallyText(tally, tr),
        ] as [string, string],
    ),
    [t('excel.arl.summary.flagsCurrent'), flagsText(result.start, total, tr)],
    [t('excel.arl.summary.flagsTarget'), flagsText(result.end, total, tr)],
  ];
  rows.push(
    ['', ''],
    [t('excel.row.label'), t('label.arl')],
    [t('excel.row.disclaimer'), disclaimerText(tr, 'arl')],
    [t('excel.arl.summary.rubricNote'), framework.disclaimer],
    [t('excel.meta.generatedAt'), generatedAt.toISOString()],
  );
  for (const [item, value] of rows) {
    const row = sheet.addRow({ item, value });
    if (item) row.getCell(1).font = { bold: true };
  }
  for (const r of [9, 10]) sheet.getRow(r).getCell(2).font = { bold: true, size: 14 };
}

function buildScopeSheet(
  workbook: Workbook,
  session: AssessmentSession,
  trlFramework: ResolvedFramework,
  tr: Translator,
): void {
  const { t } = tr;
  const { context } = session.arl!;
  const sheet = addTableSheet(workbook, 'Scope', [
    { header: t('excel.col.field'), key: 'field', width: 36 },
    { header: t('excel.col.value'), key: 'value', width: 90, wrap: true },
  ]);
  const rows: Array<[string, string]> = [
    [t('excel.row.projectName'), safeText(context.projectName)],
    [t('excel.row.technologyName'), safeText(context.technologyName)],
    [t('excel.row.assessorName'), safeText(context.assessorName)],
    [t('excel.row.organization'), safeText(context.organization ?? '')],
    [t('excel.arl.scope.technologyScope'), safeText(context.technologyScope ?? '')],
    [t('excel.arl.scope.valueChain'), safeText(context.valueChainScope ?? '')],
    [t('excel.arl.scope.timeline'), safeText(context.evaluationTimeline ?? '')],
    [t('excel.arl.scope.policy'), safeText(context.policyEnvironment ?? '')],
    [
      t('excel.arl.scope.trlFramework'),
      `${trlFramework.framework.name} — ${trlFramework.framework.id} (${trlFramework.framework.version})`,
    ],
    [t('excel.row.sessionCreated'), session.createdAt],
    [t('excel.row.sessionUpdated'), session.updatedAt],
  ];
  for (const [field, value] of rows) sheet.addRow({ field, value });
}

function buildRiskSheet(workbook: Workbook, result: ArlResult, tr: Translator): void {
  const { t } = tr;
  const sheet = addTableSheet(
    workbook,
    'Risk_Assessment',
    [
      { header: t('excel.arl.col.area'), key: 'area', width: 22, wrap: true },
      { header: t('excel.arl.col.dimensionId'), key: 'id', width: 13 },
      { header: t('excel.arl.col.dimension'), key: 'dimension', width: 30, wrap: true },
      { header: t('excel.arl.col.current'), key: 'current', width: 15 },
      { header: t('excel.arl.col.counted'), key: 'counted', width: 12 },
      { header: t('excel.arl.col.why'), key: 'why', width: 34, wrap: true },
      { header: t('excel.arl.col.rationale'), key: 'rationale', width: 48, wrap: true },
      { header: t('excel.arl.col.evidence'), key: 'evidence', width: 32, wrap: true },
      { header: t('excel.arl.col.target'), key: 'target', width: 18 },
      { header: t('excel.arl.col.targetCounted'), key: 'targetCounted', width: 14 },
      { header: t('excel.col.plannedAction'), key: 'plan', width: 40, wrap: true },
      { header: t('excel.arl.col.low'), key: 'low', width: 48, wrap: true },
      { header: t('excel.arl.col.medium'), key: 'medium', width: 48, wrap: true },
      { header: t('excel.arl.col.high'), key: 'high', width: 48, wrap: true },
      { header: t('excel.col.origin'), key: 'origin', width: 10 },
      { header: t('excel.col.sourceDetail'), key: 'source', width: 44, wrap: true },
    ],
    { freezeColumns: 3 },
  );

  const targets = new Map(result.end.outcomes.map((o) => [o.dimension.id, o]));
  const areaName = new Map(
    result.start.byArea.map(({ area }) => [area.id, `${area.id}. ${area.name}`]),
  );
  for (const o of result.start.outcomes) {
    const target = targets.get(o.dimension.id)!;
    sheet.addRow({
      area: areaName.get(o.dimension.areaId) ?? o.dimension.areaId,
      id: o.dimension.id,
      dimension: o.dimension.title,
      current: o.rating,
      counted: o.countedAs,
      why: arlReasonText(tr, o.rating, o.conservativeReason) ?? '',
      rationale: safeText(o.rationale ?? ''),
      evidence: safeText(o.evidence ?? ''),
      target: target.inherited ? SAME_AS_CURRENT : target.rating,
      targetCounted: target.countedAs,
      plan: safeText(o.plannedAction ?? ''),
      low: o.dimension.levels.Low,
      medium: o.dimension.levels.Medium,
      high: o.dimension.levels.High,
      origin: o.dimension.origin,
      source: sourceText(o.dimension.source, tr),
    });
  }
  const last = result.start.outcomes.length + 1;
  applyListValidation(sheet, 'D', ARL_RATINGS, 2, last, {}, tr);
  applyListValidation(sheet, 'I', [...ARL_RISKS, SAME_AS_CURRENT], 2, last, {}, tr);
  const fills = [
    { text: 'Low', fill: STYLE.goodFill },
    { text: 'Medium', fill: STYLE.warnFill },
    { text: 'High', fill: STYLE.badFill },
  ];
  highlightValues(sheet, `D2:E${last}`, fills);
  highlightValues(sheet, `I2:J${last}`, fills);
}

function buildLookupSheet(
  workbook: Workbook,
  framework: ArlFramework,
  result: ArlResult,
  tr: Translator,
): void {
  const { t } = tr;
  const { cap, table } = framework.lookup;
  const axis = Array.from({ length: cap + 1 }, (_, i) => i);
  const label = (i: number) => (i === cap ? `${cap}+` : String(i));
  const counts = (profile: ArlProfileResult) =>
    t('excel.arl.lookup.counts', {
      medium: profile.tally.Medium,
      high: profile.tally.High,
      arl: profile.arl,
    });
  const sheet = addTableSheet(workbook, 'ARL_Lookup', [
    { header: t('excel.arl.lookup.axis'), key: 'm', width: 16 },
    ...axis.map((h) => ({ header: label(h), key: `h${h}`, width: 7 })),
  ]);
  for (const m of axis) {
    const row: Record<string, string | number> = { m: label(m) };
    for (const h of axis) row[`h${h}`] = table[m]![h]!;
    sheet.addRow(row);
  }

  const mark = (profile: ArlProfileResult, name: string, fill: string) => {
    const m = Math.min(profile.tally.Medium, cap);
    const h = Math.min(profile.tally.High, cap);
    const cell = sheet.getCell(m + 2, h + 2);
    const previous = typeof cell.note === 'string' ? `${cell.note}; ` : '';
    cell.note = `${previous}${name}: ${counts(profile)}`;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
  };
  mark(result.end, t('excel.arl.lookup.target'), STYLE.sectionFill);
  mark(result.start, t('excel.arl.lookup.start'), STYLE.warnFill);

  const notes: Array<[string, string]> = [
    ['', ''],
    [t('excel.arl.lookup.start'), `${counts(result.start)} (${result.start.band})`],
    [t('excel.arl.lookup.target'), `${counts(result.end)} (${result.end.band})`],
    ['', ''],
    ...framework.bands.map((b) => [`ARL ${b.min}–${b.max}`, b.label] as [string, string]),
    ['', ''],
    [t('excel.row.source'), sourceText(framework.lookup.source, tr)],
    [t('excel.row.note'), t('excel.arl.lookup.note')],
  ];
  for (const [a, b] of notes) {
    const row = sheet.addRow({ m: a, h0: b });
    if (a) row.getCell(1).font = { bold: true };
  }
}

function buildReferencesSheet(workbook: Workbook, framework: ArlFramework, tr: Translator): void {
  const { t } = tr;
  const sheet = addTableSheet(workbook, 'References', [
    { header: t('excel.col.sourceId'), key: 'id', width: 24 },
    { header: t('excel.col.title'), key: 'title', width: 60, wrap: true },
    { header: t('excel.col.issuer'), key: 'issuer', width: 42, wrap: true },
    { header: t('excel.col.versionDate'), key: 'version', width: 40, wrap: true },
    { header: t('excel.col.url'), key: 'url', width: 60 },
  ]);
  sourcesFor(framework.sources).forEach((source, index) => {
    sheet.addRow({
      id: source.id,
      title: source.title,
      issuer: source.issuer,
      version: source.version ?? '',
      url: source.url ?? '',
    });
    if (source.url) setHyperlink(sheet, `E${index + 2}`, source.url);
  });
}

function buildMetadataSheet(
  workbook: Workbook,
  meta: WorkbookMeta,
  session: AssessmentSession,
  trlFramework: ResolvedFramework,
  tr: Translator,
): void {
  const { t } = tr;
  const sheet = addTableSheet(workbook, 'Metadata', [
    { header: t('excel.col.key'), key: 'key', width: 30 },
    { header: t('excel.col.value'), key: 'value', width: 60, wrap: true },
  ]);
  const next = writeMetaBlock(sheet, meta, 2, tr);
  const extra: Array<[string, string]> = [
    [t('excel.arl.meta.workbook'), t('excel.arl.meta.workbookValue')],
    [t('excel.arl.meta.trlFramework'), `${session.frameworkId} (${session.frameworkVersion})`],
    [t('excel.arl.meta.trlFrameworkName'), trlFramework.framework.name],
    [t('excel.row.sessionCreated'), session.createdAt],
    [t('excel.row.sessionUpdated'), session.updatedAt],
  ];
  extra.forEach(([key, value], i) => {
    sheet.getCell(`A${next + i}`).value = key;
    sheet.getCell(`A${next + i}`).font = { bold: true };
    sheet.getCell(`B${next + i}`).value = value;
  });
}

export async function exportArlWorkbook(
  arlFramework: ArlFramework,
  session: AssessmentSession,
  trlFramework: ResolvedFramework,
  at: Date = new Date(),
  tr: Translator = currentTranslator(),
): Promise<string> {
  const workbook = await buildArlWorkbook(arlFramework, session, trlFramework, at, tr);
  const filename = arlWorkbookFilename(session, at);
  downloadBlob(await workbookToBlob(workbook), filename);
  return filename;
}
