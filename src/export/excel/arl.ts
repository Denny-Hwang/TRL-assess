/**
 * ARL workbook (BUILD_SPEC D-3.3, ADR-0005).
 * Sheets, in order: README, Summary, Scope, Risk_Assessment, ARL_Lookup, References, Metadata.
 * The TRL workbooks are not touched.
 */
import { ARL_DISCLAIMER, ARL_LABEL, ARL_TARGET_LABEL } from '@/config/app.config';
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
import {
  addTableSheet,
  applyListValidation,
  ARL_STATIC_VALUES_NOTE,
  createWorkbook,
  highlightValues,
  safeText,
  setHyperlink,
  STYLE,
  workbookToBlob,
  writeMetaBlock,
  writeReadmeSheet,
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

function sourceText(source: { sourceId: string; section?: string; page?: string }) {
  return [source.sourceId, source.section, source.page ? `p. ${source.page}` : undefined]
    .filter(Boolean)
    .join(' · ');
}

function tallyText(tally: ArlTally): string {
  return `Low ${tally.Low} · Medium ${tally.Medium} · High ${tally.High} · N/A ${tally['N/A']}`;
}

function arlText(profile: ArlProfileResult): string {
  return `ARL ${profile.arl} — ${profile.band}`;
}

function flagsText(profile: ArlProfileResult): string {
  return profile.flags.length ? profile.flags.map((f) => f.message).join('\n') : 'None raised.';
}

export async function buildArlWorkbook(
  arlFramework: ArlFramework,
  session: AssessmentSession,
  trlFramework: ResolvedFramework,
  generatedAt: Date = new Date(),
): Promise<Workbook> {
  const arl = session.arl;
  if (!arl) throw new Error('This session has no ARL ratings to export.');
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
      'Dimensions rated': rated,
      'Dimensions in the rubric': arlFramework.dimensions.length,
    },
  };

  writeReadmeSheet(
    workbook,
    meta,
    [
      {
        heading: 'What this workbook contains',
        lines: [
          'Summary — ARL Start, ARL End (target), the tallies behind them and any flags raised.',
          'Scope — the technology scope, value chain scope, timeline and policy environment the ratings assume.',
          'Risk_Assessment — every dimension: current rating, rationale, evidence, target and planned action, with the rubric text.',
          'ARL_Lookup — the source look-up table, with this assessment’s cells marked.',
          'References — the source documents.',
          'Metadata — provenance of this export.',
        ],
      },
      {
        heading: 'How the ARL is calculated',
        lines: [
          'Each dimension is rated Low, Medium or High risk, or N/A, against the DOE Adoption Readiness Assessment rubric.',
          'The Medium- and High-risk dimensions are tallied and the ARL is read from the source look-up table on p. 13, unmodified.',
          'This tool counts Unsure, Not assessed, and N/A without a rationale as High risk — a conservative convention of the tool, not a rule of the source.',
          `ARL End uses the end-of-project targets; where none is set the current rating carries forward. ${ARL_TARGET_LABEL}.`,
          'ARL complements TRL. The TRL results are in the separate TRL workbooks and are never combined with the ARL.',
        ],
      },
      {
        heading: 'How to use the placeholders',
        lines: [
          'Rationale, Evidence / reference and Planned action are free text for the team to complete.',
          'The Current rating and Target rating columns keep their dropdowns, but changing them does not recompute the ARL.',
          'Never paste controlled or sensitive content into this workbook. Record a pointer instead.',
        ],
      },
    ],
    ARL_LABEL,
    { disclaimer: ARL_DISCLAIMER, staticNote: ARL_STATIC_VALUES_NOTE },
  );

  buildSummarySheet(workbook, arlFramework, session, result, generatedAt);
  buildScopeSheet(workbook, session, trlFramework);
  buildRiskSheet(workbook, result);
  buildLookupSheet(workbook, arlFramework, result);
  buildReferencesSheet(workbook, arlFramework);
  buildMetadataSheet(workbook, meta, session, trlFramework);
  return workbook;
}

function keyValueSheet(workbook: Workbook, name: string): Worksheet {
  return addTableSheet(workbook, name, [
    { header: 'Item', key: 'item', width: 36 },
    { header: 'Value', key: 'value', width: 90, wrap: true },
  ]);
}

function buildSummarySheet(
  workbook: Workbook,
  framework: ArlFramework,
  session: AssessmentSession,
  result: ArlResult,
  generatedAt: Date,
): void {
  const { context } = session.arl!;
  const sheet = keyValueSheet(workbook, 'Summary');
  const rows: Array<[string, string]> = [
    ['Project', safeText(context.projectName)],
    ['Technology', safeText(context.technologyName)],
    ['Assessor', safeText(context.assessorName)],
    ['Organization', safeText(context.organization ?? '')],
    ['Assessment date (UTC)', session.updatedAt],
    ['ARL rubric', `${framework.name} — ${framework.id} (${framework.version})`],
    ['', ''],
    ['ARL Start', arlText(result.start)],
    ['ARL End (target)', `${arlText(result.end)} (${ARL_TARGET_LABEL})`],
    ['Change over the project', result.change > 0 ? `+${result.change}` : String(result.change)],
    ['Current ratings, as counted', tallyText(result.start.tally)],
    ['Targets, as counted', tallyText(result.end.tally)],
    ...result.start.byArea.map(
      ({ area, tally }) =>
        [`${area.id}. ${area.name} (current)`, tallyText(tally)] as [string, string],
    ),
    ['Flags — current ratings', flagsText(result.start)],
    ['Flags — targets', flagsText(result.end)],
  ];
  rows.push(
    ['', ''],
    ['Label', ARL_LABEL],
    ['Disclaimer', ARL_DISCLAIMER],
    ['Rubric note', framework.disclaimer],
    ['Generated at (UTC)', generatedAt.toISOString()],
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
): void {
  const { context } = session.arl!;
  const sheet = addTableSheet(workbook, 'Scope', [
    { header: 'Field', key: 'field', width: 36 },
    { header: 'Value', key: 'value', width: 90, wrap: true },
  ]);
  const rows: Array<[string, string]> = [
    ['Project name', safeText(context.projectName)],
    ['Technology name', safeText(context.technologyName)],
    ['Assessor name', safeText(context.assessorName)],
    ['Organization', safeText(context.organization ?? '')],
    ['Technology scope', safeText(context.technologyScope ?? '')],
    ['Value chain scope', safeText(context.valueChainScope ?? '')],
    ['Timeline for evaluation', safeText(context.evaluationTimeline ?? '')],
    ['Policy environment assumed', safeText(context.policyEnvironment ?? '')],
    [
      'TRL framework of this session',
      `${trlFramework.framework.name} — ${trlFramework.framework.id} (${trlFramework.framework.version})`,
    ],
    ['Session created (UTC)', session.createdAt],
    ['Session updated (UTC)', session.updatedAt],
  ];
  for (const [field, value] of rows) sheet.addRow({ field, value });
}

function buildRiskSheet(workbook: Workbook, result: ArlResult): void {
  const sheet = addTableSheet(
    workbook,
    'Risk_Assessment',
    [
      { header: 'Core area', key: 'area', width: 22, wrap: true },
      { header: 'Dimension ID', key: 'id', width: 13 },
      { header: 'Dimension', key: 'dimension', width: 30, wrap: true },
      { header: 'Current rating', key: 'current', width: 15 },
      { header: 'Counted as', key: 'counted', width: 12 },
      { header: 'Why counted so', key: 'why', width: 34, wrap: true },
      { header: 'Rationale', key: 'rationale', width: 48, wrap: true },
      { header: 'Evidence / reference', key: 'evidence', width: 32, wrap: true },
      { header: 'Target rating (end of project)', key: 'target', width: 18 },
      { header: 'Target counted as', key: 'targetCounted', width: 14 },
      { header: 'Planned action', key: 'plan', width: 40, wrap: true },
      { header: 'Low risk (rubric)', key: 'low', width: 48, wrap: true },
      { header: 'Medium risk (rubric)', key: 'medium', width: 48, wrap: true },
      { header: 'High risk (rubric)', key: 'high', width: 48, wrap: true },
      { header: 'Origin', key: 'origin', width: 10 },
      { header: 'Source (doc, section, page)', key: 'source', width: 44, wrap: true },
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
      why: o.conservativeReason ?? '',
      rationale: safeText(o.rationale ?? ''),
      evidence: safeText(o.evidence ?? ''),
      target: target.inherited ? SAME_AS_CURRENT : target.rating,
      targetCounted: target.countedAs,
      plan: safeText(o.plannedAction ?? ''),
      low: o.dimension.levels.Low,
      medium: o.dimension.levels.Medium,
      high: o.dimension.levels.High,
      origin: o.dimension.origin,
      source: sourceText(o.dimension.source),
    });
  }
  const last = result.start.outcomes.length + 1;
  applyListValidation(sheet, 'D', ARL_RATINGS, 2, last);
  applyListValidation(sheet, 'I', [...ARL_RISKS, SAME_AS_CURRENT], 2, last);
  const fills = [
    { text: 'Low', fill: STYLE.goodFill },
    { text: 'Medium', fill: STYLE.warnFill },
    { text: 'High', fill: STYLE.badFill },
  ];
  highlightValues(sheet, `D2:E${last}`, fills);
  highlightValues(sheet, `I2:J${last}`, fills);
}

function buildLookupSheet(workbook: Workbook, framework: ArlFramework, result: ArlResult): void {
  const { cap, table } = framework.lookup;
  const axis = Array.from({ length: cap + 1 }, (_, i) => i);
  const label = (i: number) => (i === cap ? `${cap}+` : String(i));
  const sheet = addTableSheet(workbook, 'ARL_Lookup', [
    { header: 'Medium \\ High', key: 'm', width: 16 },
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
    cell.note = `${previous}${name}: ${profile.tally.Medium} Medium, ${profile.tally.High} High → ARL ${profile.arl}`;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
  };
  mark(result.end, 'Target', STYLE.sectionFill);
  mark(result.start, 'Start', STYLE.warnFill);

  const notes: Array<[string, string]> = [
    ['', ''],
    [
      'Start',
      `${result.start.tally.Medium} Medium, ${result.start.tally.High} High → ARL ${result.start.arl} (${result.start.band})`,
    ],
    [
      'Target',
      `${result.end.tally.Medium} Medium, ${result.end.tally.High} High → ARL ${result.end.arl} (${result.end.band})`,
    ],
    ['', ''],
    ...framework.bands.map((b) => [`ARL ${b.min}–${b.max}`, b.label] as [string, string]),
    ['', ''],
    ['Source', sourceText(framework.lookup.source)],
    ['Note', 'The marked cells carry a note naming them; the printed table is used unmodified.'],
  ];
  for (const [a, b] of notes) {
    const row = sheet.addRow({ m: a, h0: b });
    if (a) row.getCell(1).font = { bold: true };
  }
}

function buildReferencesSheet(workbook: Workbook, framework: ArlFramework): void {
  const sheet = addTableSheet(workbook, 'References', [
    { header: 'Source ID', key: 'id', width: 24 },
    { header: 'Title', key: 'title', width: 60, wrap: true },
    { header: 'Issuer', key: 'issuer', width: 42, wrap: true },
    { header: 'Version/Date', key: 'version', width: 40, wrap: true },
    { header: 'URL', key: 'url', width: 60 },
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
): void {
  const sheet = addTableSheet(workbook, 'Metadata', [
    { header: 'Key', key: 'key', width: 30 },
    { header: 'Value', key: 'value', width: 60, wrap: true },
  ]);
  const next = writeMetaBlock(sheet, meta, 2);
  const extra: Array<[string, string]> = [
    ['Workbook', 'ARL (side module)'],
    ['TRL framework of the session', `${session.frameworkId} (${session.frameworkVersion})`],
    ['TRL framework name', trlFramework.framework.name],
    ['Session created (UTC)', session.createdAt],
    ['Session updated (UTC)', session.updatedAt],
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
): Promise<string> {
  const workbook = await buildArlWorkbook(arlFramework, session, trlFramework, at);
  const filename = arlWorkbookFilename(session, at);
  downloadBlob(await workbookToBlob(workbook), filename);
  return filename;
}
