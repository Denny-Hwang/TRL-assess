/**
 * Tier 1 workbook (BUILD_SPEC D-3.1).
 * Sheets, in order: README, Summary, Context, Responses, Next_Evidence_Placeholders, References.
 */
import { BLANK_NEXT_EVIDENCE_ROWS, TIER1_LABEL } from '@/config/app.config';
import { sourcesFor } from '@/data/sources';
import type { ResolvedFramework } from '@/domain/frameworks';
import { criteriaByLevel } from '@/domain/frameworks';
import { formatTrl, scoreTier1, type Tier1Result } from '@/domain/tier1';
import type { AssessmentSession, TrlLevel } from '@/domain/schemas';
import { downloadBlob, workbookFilename } from '@/export/download';
import {
  addTableSheet,
  applyListValidation,
  createWorkbook,
  fillRow,
  highlightValues,
  placeholderNote,
  safeText,
  setFormula,
  setHyperlink,
  STYLE,
  workbookToBlob,
  writeReadmeSheet,
  type Workbook,
  type WorkbookMeta,
} from './shared';

const ANSWERS = ['Yes', 'No', 'Unsure'] as const;

export const TIER1_SHEETS = [
  'README',
  'Summary',
  'Context',
  'Responses',
  'Next_Evidence_Placeholders',
  'References',
] as const;

function sourceText(source: {
  sourceId: string;
  section?: string;
  page?: string;
  clause?: string;
}) {
  return [
    source.sourceId,
    source.section,
    source.page ? `p. ${source.page}` : undefined,
    source.clause ? `clause ${source.clause}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
}

export async function buildTier1Workbook(
  framework: ResolvedFramework,
  session: AssessmentSession,
  generatedAt: Date = new Date(),
): Promise<Workbook> {
  if (!session.tier1) throw new Error('This session has no Tier 1 answers to export.');
  const result: Tier1Result = scoreTier1(framework, session.tier1);
  const { workbook } = await createWorkbook();

  const meta: WorkbookMeta = {
    tier: 'Tier 1',
    frameworkId: session.frameworkId,
    frameworkVersion: session.frameworkVersion,
    schemaVersion: session.schemaVersion,
    generatedAt,
    counts: { 'Questions answered': result.answeredLevels.length },
  };

  writeReadmeSheet(
    workbook,
    meta,
    [
      {
        heading: 'What this workbook contains',
        lines: [
          'Summary — the estimate, the cross-check and any flags raised.',
          'Context — what was assessed, by whom, and the highest-fidelity test performed.',
          'Responses — every screening question, your answer, your note and the source of the question.',
          'Next_Evidence_Placeholders — the criteria that come next, with blank rows for planning evidence.',
          'References — the source documents behind the questions.',
        ],
      },
      {
        heading: 'How to fill the placeholders',
        lines: [
          'On Next_Evidence_Placeholders, describe the evidence you plan to produce in "Planned evidence".',
          'Put a URL or a file path in "Evidence link / path"; the "Open" column then becomes a clickable link.',
          'Owner and Target date are free text — this workbook is a planning aid, not a tracker.',
          'Never paste controlled or sensitive content into this workbook. Record a pointer instead.',
        ],
      },
      {
        heading: 'How the estimate is calculated',
        lines: [
          'Estimated TRL is the highest level where that level and every level below it were answered "Yes".',
          '"Unsure" never counts as "Yes".',
          'Highest level claimed is the highest single "Yes", ignoring gaps.',
          'The build × environment cross-check is a heuristic aid, not a standard, and never overrides your answers.',
        ],
      },
    ],
    TIER1_LABEL,
  );

  buildSummarySheet(workbook, framework, session, result, meta);
  buildContextSheet(workbook, framework, session);
  buildResponsesSheet(workbook, framework, session);
  buildNextEvidenceSheet(workbook, framework, result);
  buildReferencesSheet(workbook, framework);

  return workbook;
}

function buildSummarySheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  session: AssessmentSession,
  result: Tier1Result,
  meta: WorkbookMeta,
): void {
  const { context } = session.tier1!;
  const sheet = workbook.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    { header: 'Item', key: 'item', width: 34 },
    { header: 'Value', key: 'value', width: 76 },
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: STYLE.headerFont } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.headerFill } };
  sheet.getColumn(2).alignment = { wrapText: true, vertical: 'top' };

  const rows: Array<[string, string]> = [
    ['Project', safeText(context.projectName)],
    ['Technology', safeText(context.technologyName)],
    ['Assessor', safeText(context.assessorName)],
    ['Assessor role', safeText(context.assessorRole ?? '')],
    ['Organization', safeText(context.organization ?? '')],
    ['Assessment date (UTC)', session.updatedAt],
    [
      'Framework',
      `${framework.framework.name} — ${framework.framework.id} (${framework.framework.version})`,
    ],
    ['', ''],
    ['Estimated TRL (headline)', formatTrl(result.contiguousTrl)],
    ['Highest level claimed (first "Yes")', formatTrl(result.firstYesTrl)],
    [
      'Build × environment cross-check',
      `${formatTrl(result.matrixTrl)} (${context.build} × ${context.environment}; ${framework.matrix.status})`,
    ],
    ['Consistency rating', result.consistency],
    ['Flags', result.flags.length ? result.flags.map((f) => f.message).join('\n') : 'None raised.'],
    ['', ''],
    ['Label', TIER1_LABEL],
    ['Disclaimer', DISCLAIMER_TEXT],
    ['Generated at (UTC)', meta.generatedAt.toISOString()],
  ];
  for (const [item, value] of rows) {
    const row = sheet.addRow({ item, value });
    if (item) row.getCell(1).font = { bold: true };
  }
  sheet.getRow(10).getCell(2).font = { bold: true, size: 14 };
  highlightValues(sheet, `B${10}:B${10}`, [{ text: 'TRL', fill: STYLE.goodFill }]);
}

const DISCLAIMER_TEXT =
  'TRL Assess produces a self-assessment only. It is not an independent Technology Readiness ' +
  'Assessment (TRA), not an audit, and not a certification. Results depend entirely on the ' +
  'information entered; nothing is verified by the tool.';

function buildContextSheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  session: AssessmentSession,
): void {
  const { context } = session.tier1!;
  const sheet = addTableSheet(workbook, 'Context', [
    { header: 'Field', key: 'field', width: 34 },
    { header: 'Value', key: 'value', width: 76, wrap: true },
  ]);
  const env = framework.matrix.environments.find((e) => e.code === context.environment);
  const build = framework.matrix.builds.find((b) => b.code === context.build);

  const rows: Array<[string, string]> = [
    ['Project name', safeText(context.projectName)],
    ['Technology name', safeText(context.technologyName)],
    ['Assessor name', safeText(context.assessorName)],
    ['Assessor role', safeText(context.assessorRole ?? '')],
    ['Organization', safeText(context.organization ?? '')],
    ['One-line description', safeText(context.oneLineDescription ?? '')],
    ['Highest-fidelity test performed', safeText(context.highestFidelityTest ?? '')],
    ['Test location', safeText(context.testLocation ?? '')],
    ['Test date', safeText(context.testDate ?? '')],
    ['Environment code', `${context.environment} — ${env?.label ?? ''}`],
    ['Environment description', env?.help ?? ''],
    ['Build code', `${context.build} — ${build?.label ?? ''}`],
    ['Build description', build?.help ?? ''],
    ['Session created (UTC)', session.createdAt],
    ['Session updated (UTC)', session.updatedAt],
  ];
  for (const [field, value] of rows) sheet.addRow({ field, value });
}

function buildResponsesSheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  session: AssessmentSession,
): void {
  const sheet = addTableSheet(workbook, 'Responses', [
    { header: 'TRL', key: 'trl', width: 8 },
    { header: 'Question ID', key: 'id', width: 16 },
    { header: 'Question', key: 'question', width: 70, wrap: true },
    { header: 'Answer', key: 'answer', width: 12 },
    { header: 'Note', key: 'note', width: 40, wrap: true },
    { header: 'Origin', key: 'origin', width: 12 },
    { header: 'Source (doc, section, page)', key: 'source', width: 52, wrap: true },
  ]);

  const answers = session.tier1!.answers;
  const questions = [...framework.tier1].sort((a, b) => b.level - a.level);
  for (const q of questions) {
    sheet.addRow({
      trl: q.level,
      id: q.id,
      question: safeText(q.text),
      answer: answers[q.id]?.value ?? '',
      note: safeText(answers[q.id]?.note ?? ''),
      origin: q.origin,
      source: sourceText(q.source),
    });
  }
  const last = questions.length + 1;
  applyListValidation(sheet, 'D', ANSWERS, 2, last);
  highlightValues(sheet, `D2:D${last}`, [
    { text: 'Yes', fill: STYLE.goodFill },
    { text: 'Unsure', fill: STYLE.warnFill },
    { text: 'No', fill: STYLE.badFill },
  ]);
}

function buildNextEvidenceSheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  result: Tier1Result,
): void {
  const sheet = addTableSheet(workbook, 'Next_Evidence_Placeholders', [
    { header: 'TRL', key: 'trl', width: 8 },
    { header: 'Criterion ID', key: 'id', width: 20 },
    { header: 'Criterion', key: 'criterion', width: 66, wrap: true },
    { header: 'Planned evidence (placeholder)', key: 'planned', width: 36, wrap: true },
    { header: 'Evidence link / path (placeholder)', key: 'link', width: 40 },
    { header: 'Open', key: 'open', width: 12 },
    { header: 'Owner', key: 'owner', width: 20 },
    { header: 'Target date', key: 'due', width: 16 },
  ]);

  const start = Math.min(9, result.contiguousTrl + 1);
  const end = Math.min(9, result.contiguousTrl + 2);
  let row = 2;
  for (let level = start; level <= end; level += 1) {
    for (const criterion of criteriaByLevel(framework, level as TrlLevel)) {
      sheet.addRow({
        trl: level,
        id: criterion.id,
        criterion: safeText(criterion.text),
        planned: '',
        link: '',
        owner: '',
        due: '',
      });
      setFormula(sheet, `F${row}`, `IF(E${row}="","",HYPERLINK(E${row},"Open"))`);
      row += 1;
    }
  }
  for (let i = 0; i < BLANK_NEXT_EVIDENCE_ROWS; i += 1) {
    sheet.addRow({ trl: '', id: '', criterion: placeholderNote(), planned: '', link: '' });
    setFormula(sheet, `F${row}`, `IF(E${row}="","",HYPERLINK(E${row},"Open"))`);
    fillRow(sheet, row, STYLE.placeholderFill, 8);
    row += 1;
  }
}

function buildReferencesSheet(workbook: Workbook, framework: ResolvedFramework): void {
  const sheet = addTableSheet(workbook, 'References', [
    { header: 'Source ID', key: 'id', width: 24 },
    { header: 'Title', key: 'title', width: 60, wrap: true },
    { header: 'Issuer', key: 'issuer', width: 42, wrap: true },
    { header: 'Version/Date', key: 'version', width: 34, wrap: true },
    { header: 'URL', key: 'url', width: 60 },
  ]);
  const sources = sourcesFor(framework.framework.sources);
  sources.forEach((source, index) => {
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

export async function exportTier1Workbook(
  framework: ResolvedFramework,
  session: AssessmentSession,
  at: Date = new Date(),
): Promise<string> {
  const workbook = await buildTier1Workbook(framework, session, at);
  const filename = workbookFilename('Tier1', session, at);
  downloadBlob(await workbookToBlob(workbook), filename);
  return filename;
}
