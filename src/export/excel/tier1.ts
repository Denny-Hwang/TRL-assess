/**
 * Tier 1 workbook.
 * Sheets, in order: README, Summary, Context, Responses, Next_Evidence_Placeholders, References.
 */
import { BLANK_NEXT_EVIDENCE_ROWS } from '@/config/app.config';
import { sourcesFor } from '@/data/sources';
import type { ResolvedFramework } from '@/domain/frameworks';
import { criteriaByLevel } from '@/domain/frameworks';
import { scoreTier1, type Tier1Result } from '@/domain/tier1';
import type { AssessmentSession, TrlLevel } from '@/domain/schemas';
import { downloadBlob, workbookFilename } from '@/export/download';
import { disclaimerText, tier1FlagText, trlText } from '@/i18n/domainText';
import {
  addTableSheet,
  applyListValidation,
  createWorkbook,
  currentTranslator,
  fillRow,
  highlightValues,
  placeholderNote,
  safeText,
  setFormula,
  setHyperlink,
  sourceText,
  STYLE,
  workbookToBlob,
  writeReadmeSheet,
  type Translator,
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

export async function buildTier1Workbook(
  framework: ResolvedFramework,
  session: AssessmentSession,
  generatedAt: Date = new Date(),
  tr: Translator = currentTranslator(),
): Promise<Workbook> {
  const { t } = tr;
  if (!session.tier1) throw new Error(t('excel.tier1.error.noAnswers'));
  const result: Tier1Result = scoreTier1(framework, session.tier1);
  const { workbook } = await createWorkbook();

  const meta: WorkbookMeta = {
    tier: 'Tier 1',
    frameworkId: session.frameworkId,
    frameworkVersion: session.frameworkVersion,
    schemaVersion: session.schemaVersion,
    generatedAt,
    counts: { [t('excel.tier1.count.answered')]: result.answeredLevels.length },
  };

  writeReadmeSheet(
    workbook,
    meta,
    [
      {
        heading: t('excel.readme.contents'),
        lines: [
          t('excel.tier1.readme.contents.summary'),
          t('excel.tier1.readme.contents.context'),
          t('excel.tier1.readme.contents.responses'),
          t('excel.tier1.readme.contents.next'),
          t('excel.tier1.readme.contents.references'),
        ],
      },
      {
        heading: t('excel.tier1.readme.fill.heading'),
        lines: [
          t('excel.tier1.readme.fill.planned'),
          t('excel.tier1.readme.fill.link'),
          t('excel.tier1.readme.fill.owner'),
          t('excel.tier1.readme.fill.sensitive'),
        ],
      },
      {
        heading: t('excel.tier1.readme.calc.heading'),
        lines: [
          t('excel.tier1.readme.calc.estimate'),
          t('excel.tier1.readme.calc.unsure'),
          t('excel.tier1.readme.calc.claimed'),
          t('excel.tier1.readme.calc.matrix'),
        ],
      },
    ],
    t('label.tier1'),
    {},
    tr,
  );

  buildSummarySheet(workbook, framework, session, result, meta, tr);
  buildContextSheet(workbook, framework, session, tr);
  buildResponsesSheet(workbook, framework, session, tr);
  buildNextEvidenceSheet(workbook, framework, result, tr);
  buildReferencesSheet(workbook, framework, tr);

  return workbook;
}

function buildSummarySheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  session: AssessmentSession,
  result: Tier1Result,
  meta: WorkbookMeta,
  tr: Translator,
): void {
  const { t } = tr;
  const { context } = session.tier1!;
  const sheet = workbook.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    { header: t('excel.col.item'), key: 'item', width: 34 },
    { header: t('excel.col.value'), key: 'value', width: 76 },
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: STYLE.headerFont } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.headerFill } };
  sheet.getColumn(2).alignment = { wrapText: true, vertical: 'top' };

  const rows: Array<[string, string]> = [
    [t('excel.row.project'), safeText(context.projectName)],
    [t('excel.row.technology'), safeText(context.technologyName)],
    [t('excel.row.assessor'), safeText(context.assessorName)],
    [t('excel.row.assessorRole'), safeText(context.assessorRole ?? '')],
    [t('excel.row.organization'), safeText(context.organization ?? '')],
    [t('excel.row.assessmentDate'), session.updatedAt],
    [
      t('excel.row.framework'),
      `${framework.framework.name} — ${framework.framework.id} (${framework.framework.version})`,
    ],
    ['', ''],
    [t('excel.tier1.summary.estimate'), trlText(tr, result.contiguousTrl)],
    [t('excel.tier1.summary.claimed'), trlText(tr, result.firstYesTrl)],
    [
      t('excel.tier1.summary.matrix'),
      `${trlText(tr, result.matrixTrl)} (${context.build} × ${context.environment}; ${framework.matrix.status})`,
    ],
    [t('excel.tier1.summary.consistency'), result.consistency],
    [
      t('excel.tier1.summary.flags'),
      result.flags.length
        ? result.flags.map((f) => tier1FlagText(tr, f)).join('\n')
        : t('flags.none'),
    ],
    ['', ''],
    [t('excel.row.label'), t('label.tier1')],
    [t('excel.row.disclaimer'), disclaimerText(tr)],
    [t('excel.meta.generatedAt'), meta.generatedAt.toISOString()],
  ];
  for (const [item, value] of rows) {
    const row = sheet.addRow({ item, value });
    if (item) row.getCell(1).font = { bold: true };
  }
  sheet.getRow(10).getCell(2).font = { bold: true, size: 14 };
  highlightValues(sheet, `B${10}:B${10}`, [{ text: 'TRL', fill: STYLE.goodFill }]);
}

function buildContextSheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  session: AssessmentSession,
  tr: Translator,
): void {
  const { t } = tr;
  const { context } = session.tier1!;
  const sheet = addTableSheet(workbook, 'Context', [
    { header: t('excel.col.field'), key: 'field', width: 34 },
    { header: t('excel.col.value'), key: 'value', width: 76, wrap: true },
  ]);
  const env = framework.matrix.environments.find((e) => e.code === context.environment);
  const build = framework.matrix.builds.find((b) => b.code === context.build);

  const rows: Array<[string, string]> = [
    [t('excel.row.projectName'), safeText(context.projectName)],
    [t('excel.row.technologyName'), safeText(context.technologyName)],
    [t('excel.row.assessorName'), safeText(context.assessorName)],
    [t('excel.row.assessorRole'), safeText(context.assessorRole ?? '')],
    [t('excel.row.organization'), safeText(context.organization ?? '')],
    [t('excel.tier1.context.description'), safeText(context.oneLineDescription ?? '')],
    [t('excel.tier1.context.test'), safeText(context.highestFidelityTest ?? '')],
    [t('excel.tier1.context.testLocation'), safeText(context.testLocation ?? '')],
    [t('excel.tier1.context.testDate'), safeText(context.testDate ?? '')],
    [t('excel.tier1.context.envCode'), `${context.environment} — ${env?.label ?? ''}`],
    [t('excel.tier1.context.envDescription'), env?.help ?? ''],
    [t('excel.tier1.context.buildCode'), `${context.build} — ${build?.label ?? ''}`],
    [t('excel.tier1.context.buildDescription'), build?.help ?? ''],
    [t('excel.row.sessionCreated'), session.createdAt],
    [t('excel.row.sessionUpdated'), session.updatedAt],
  ];
  for (const [field, value] of rows) sheet.addRow({ field, value });
}

function buildResponsesSheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  session: AssessmentSession,
  tr: Translator,
): void {
  const { t } = tr;
  const sheet = addTableSheet(workbook, 'Responses', [
    { header: t('excel.col.trl'), key: 'trl', width: 8 },
    { header: t('excel.tier1.col.questionId'), key: 'id', width: 16 },
    { header: t('excel.tier1.col.question'), key: 'question', width: 70, wrap: true },
    { header: t('excel.tier1.col.answer'), key: 'answer', width: 12 },
    { header: t('excel.tier1.col.note'), key: 'note', width: 40, wrap: true },
    { header: t('excel.col.origin'), key: 'origin', width: 12 },
    { header: t('excel.col.sourceDetail'), key: 'source', width: 52, wrap: true },
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
      source: sourceText(q.source, tr),
    });
  }
  const last = questions.length + 1;
  applyListValidation(sheet, 'D', ANSWERS, 2, last, {}, tr);
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
  tr: Translator,
): void {
  const { t } = tr;
  const sheet = addTableSheet(workbook, 'Next_Evidence_Placeholders', [
    { header: t('excel.col.trl'), key: 'trl', width: 8 },
    { header: t('excel.col.criterionId'), key: 'id', width: 20 },
    { header: t('excel.col.criterion'), key: 'criterion', width: 66, wrap: true },
    { header: t('excel.col.plannedEvidence'), key: 'planned', width: 36, wrap: true },
    { header: t('excel.tier1.col.link'), key: 'link', width: 40 },
    { header: t('excel.col.open'), key: 'open', width: 12 },
    { header: t('excel.col.owner'), key: 'owner', width: 20 },
    { header: t('excel.tier1.col.targetDate'), key: 'due', width: 16 },
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
    sheet.addRow({ trl: '', id: '', criterion: placeholderNote(tr), planned: '', link: '' });
    setFormula(sheet, `F${row}`, `IF(E${row}="","",HYPERLINK(E${row},"Open"))`);
    fillRow(sheet, row, STYLE.placeholderFill, 8);
    row += 1;
  }
}

function buildReferencesSheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  tr: Translator,
): void {
  const { t } = tr;
  const sheet = addTableSheet(workbook, 'References', [
    { header: t('excel.col.sourceId'), key: 'id', width: 24 },
    { header: t('excel.col.title'), key: 'title', width: 60, wrap: true },
    { header: t('excel.col.issuer'), key: 'issuer', width: 42, wrap: true },
    { header: t('excel.col.versionDate'), key: 'version', width: 34, wrap: true },
    { header: t('excel.col.url'), key: 'url', width: 60 },
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
  tr: Translator = currentTranslator(),
): Promise<string> {
  const workbook = await buildTier1Workbook(framework, session, at, tr);
  const filename = workbookFilename('Tier1', session, at);
  downloadBlob(await workbookToBlob(workbook), filename);
  return filename;
}
