/**
 * Tier 2 workbook.
 * Sheets, in order: README, Summary, CTE_Register, Criteria_Assessment, Evidence_Register,
 * Gap_Actions, Review_Signoff, References, Metadata.
 */
import { BLANK_EVIDENCE_PLACEHOLDER_ROWS, BLANK_GAP_ACTION_ROWS } from '@/config/app.config';
import { sourcesFor } from '@/data/sources';
import type { ResolvedFramework } from '@/domain/frameworks';
import { scoreTier1 } from '@/domain/tier1';
import { placeholderEvidenceId } from '@/domain/ids';
import { scoreTier2, tierDelta, type Tier2Result } from '@/domain/tier2';
import {
  CRITERION_STATUSES,
  EVIDENCE_TYPES,
  MARKINGS,
  SENSITIVE_MARKING,
  TRL_LEVELS,
  VERIFICATIONS,
  type AssessmentSession,
} from '@/domain/schemas';
import { downloadBlob, workbookFilename } from '@/export/download';
import { deltaText, disclaimerText, gapReasonText, trlText } from '@/i18n/domainText';
import {
  addTableSheet,
  applyListValidation,
  applyWholeNumberValidation,
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
  writeMetaBlock,
  writeReadmeSheet,
  type ColumnSpec,
  type Translator,
  type Workbook,
  type WorkbookMeta,
} from './shared';

export const TIER2_SHEETS = [
  'README',
  'Summary',
  'CTE_Register',
  'Criteria_Assessment',
  'Evidence_Register',
  'Gap_Actions',
  'Review_Signoff',
  'References',
  'Metadata',
] as const;

export const GAP_STATUSES = ['Open', 'In progress', 'Done'] as const;
export const REVIEW_CONCLUSIONS = ['Concur', 'Concur with comments', 'Do not concur'] as const;

export interface Tier2ExportOptions {
  /** "zip" makes the Local file column point at the bundled evidence/ folder. */
  packageType?: 'standalone' | 'zip';
  /** Relative paths of bundled evidence files, keyed by evidence id. */
  bundledPaths?: Record<string, string>;
  generatedAt?: Date;
}

export async function buildTier2Workbook(
  framework: ResolvedFramework,
  session: AssessmentSession,
  options: Tier2ExportOptions = {},
  tr: Translator = currentTranslator(),
): Promise<Workbook> {
  const { t } = tr;
  const tier2Data = session.tier2;
  if (!tier2Data || tier2Data.ctes.length === 0) {
    throw new Error(t('excel.tier2.error.noCtes'));
  }
  const generatedAt = options.generatedAt ?? new Date();
  const packageType = options.packageType ?? 'standalone';
  const bundledPaths = options.bundledPaths ?? {};
  const result = scoreTier2(framework, tier2Data);
  const tier1 = session.tier1 ? scoreTier1(framework, session.tier1) : null;
  const { workbook } = await createWorkbook();

  const meta: WorkbookMeta = {
    tier: 'Tier 2',
    frameworkId: session.frameworkId,
    frameworkVersion: session.frameworkVersion,
    schemaVersion: session.schemaVersion,
    generatedAt,
    packageType,
    counts: {
      [t('excel.tier2.count.ctes')]: tier2Data.ctes.length,
      [t('excel.tier2.count.criteria')]: tier2Data.assessments.length,
      [t('excel.tier2.count.evidence')]: tier2Data.evidence.length,
      [t('excel.tier2.count.gaps')]: tier2Data.gapActions.length,
    },
  };

  writeReadmeSheet(
    workbook,
    meta,
    [
      {
        heading: t('excel.readme.contents'),
        lines: [
          t('excel.tier2.readme.contents.summary'),
          t('excel.tier2.readme.contents.cteRegister'),
          t('excel.tier2.readme.contents.criteria'),
          t('excel.tier2.readme.contents.evidence'),
          t('excel.tier2.readme.contents.gaps'),
          t('excel.tier2.readme.contents.review'),
          t('excel.tier2.readme.contents.references'),
          t('excel.tier2.readme.contents.metadata'),
        ],
      },
      {
        heading: t('excel.tier2.readme.attach.heading'),
        lines: [
          t('excel.tier2.readme.attach.url'),
          t('excel.tier2.readme.attach.local'),
          t('excel.tier2.readme.attach.open'),
          t('excel.tier2.readme.attach.sensitive'),
          packageType === 'zip'
            ? t('excel.tier2.readme.attach.zip')
            : t('excel.tier2.readme.attach.standalone'),
        ],
      },
      {
        heading: t('excel.tier2.readme.calc.heading'),
        lines: [
          t('excel.tier2.readme.calc.satisfied'),
          t('excel.tier2.readme.calc.level'),
          t('excel.tier2.readme.calc.cte'),
          t('excel.tier2.readme.calc.system'),
        ],
      },
    ],
    t('label.tier2'),
    {},
    tr,
  );

  buildSummarySheet(workbook, framework, session, result, tier1?.contiguousTrl, tr);
  buildCteRegisterSheet(workbook, result, tr);
  buildCriteriaSheet(workbook, result, tr);
  buildEvidenceSheet(workbook, session, packageType, bundledPaths, tr);
  buildGapActionsSheet(workbook, session, result, tr);
  buildReviewSheet(workbook, session, tr);
  buildReferencesSheet(workbook, framework, tr);
  buildMetadataSheet(workbook, meta, tr);

  return workbook;
}

function buildSummarySheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  session: AssessmentSession,
  result: Tier2Result,
  tier1Contiguous: number | undefined,
  tr: Translator,
): void {
  const { t } = tr;
  const sheet = workbook.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    { header: t('excel.col.item'), key: 'a', width: 34 },
    { header: t('excel.col.value'), key: 'b', width: 26 },
    { header: t('excel.col.notes'), key: 'c', width: 70 },
    { header: 'd', key: 'd', width: 20 },
    { header: 'e', key: 'e', width: 20 },
    { header: 'f', key: 'f', width: 20 },
    { header: 'g', key: 'g', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: STYLE.headerFont } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.headerFill } };
  sheet.getColumn(3).alignment = { wrapText: true, vertical: 'top' };

  const delta = tierDelta(result.system, tier1Contiguous as never);
  const rows: Array<[string, string, string]> = [
    [t('excel.row.project'), safeText(session.tier1?.context.projectName ?? ''), ''],
    [t('excel.row.technology'), safeText(session.tier1?.context.technologyName ?? ''), ''],
    [t('excel.row.assessor'), safeText(session.tier1?.context.assessorName ?? ''), ''],
    [
      t('excel.row.framework'),
      `${framework.framework.id} (${framework.framework.version})`,
      framework.framework.name,
    ],
    [
      t('excel.tier2.summary.system'),
      result.system.computed
        ? trlText(tr, result.system.trl ?? 0)
        : t('excel.tier2.summary.notComputed'),
      result.system.computed ? t('tier2.systemNote') : t('tier2.noCritical'),
    ],
    [t('excel.tier2.summary.limiting'), result.system.limitingCteIds.join(', ') || '—', ''],
    [
      t('excel.tier2.summary.tier1'),
      tier1Contiguous === undefined
        ? t('excel.tier2.summary.noTier1')
        : trlText(tr, tier1Contiguous),
      '',
    ],
    [
      t('excel.tier2.summary.delta'),
      delta.delta === null ? '—' : String(delta.delta),
      deltaText(tr, delta) ?? '',
    ],
    [t('excel.row.label'), t('label.tier2'), ''],
    [t('excel.row.disclaimer'), '', disclaimerText(tr)],
  ];
  for (const [a, b, c] of rows) {
    const row = sheet.addRow({ a, b, c });
    row.getCell(1).font = { bold: true };
  }

  sheet.addRow({});
  const headerRow = sheet.addRow({
    a: t('excel.col.cteId'),
    b: t('excel.col.cte'),
    c: t('excel.col.critical'),
    d: t('excel.tier2.summary.cteTrl'),
    e: t('excel.col.targetTrl'),
    f: t('excel.tier2.summary.completeness'),
    g: t('excel.tier2.summary.coverage'),
  });
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.sectionFill } };
  for (const cte of result.ctes) {
    sheet.addRow({
      a: cte.cte.id,
      b: safeText(cte.cte.name),
      c: cte.cte.critical ? 'Yes' : 'No',
      d: trlText(tr, cte.trl),
      e: cte.cte.targetTrl ?? '',
      f: cte.nextLevelCompletenessPct,
      g: cte.evidenceCoveragePct,
    });
  }
}

function buildCteRegisterSheet(workbook: Workbook, result: Tier2Result, tr: Translator): void {
  const { t } = tr;
  const sheet = addTableSheet(workbook, 'CTE_Register', [
    { header: t('excel.col.cteId'), key: 'id', width: 12 },
    { header: t('excel.tier2.col.name'), key: 'name', width: 32 },
    { header: t('excel.tier2.col.kind'), key: 'kind', width: 14 },
    { header: t('excel.col.critical'), key: 'critical', width: 12 },
    { header: t('excel.col.description'), key: 'description', width: 50, wrap: true },
    { header: t('excel.tier2.col.whyCritical'), key: 'why', width: 50, wrap: true },
    { header: t('excel.col.owner'), key: 'owner', width: 22 },
    { header: t('excel.col.targetTrl'), key: 'target', width: 12 },
    { header: t('excel.tier2.col.assessedTrl'), key: 'assessed', width: 14 },
  ]);
  for (const cte of result.ctes) {
    sheet.addRow({
      id: cte.cte.id,
      name: safeText(cte.cte.name),
      kind: cte.cte.kind ?? '',
      critical: cte.cte.critical ? 'Yes' : 'No',
      description: safeText(cte.cte.description ?? ''),
      why: safeText(cte.cte.whyCritical ?? ''),
      owner: safeText(cte.cte.owner ?? ''),
      target: cte.cte.targetTrl ?? '',
      assessed: cte.trl,
    });
  }
  const last = result.ctes.length + 1;
  applyListValidation(sheet, 'D', ['Yes', 'No'], 2, last, { allowBlank: false }, tr);
  applyWholeNumberValidation(sheet, 'H', 1, 9, 2, last, tr);
  highlightValues(sheet, `D2:D${last}`, [{ text: 'Yes', fill: STYLE.warnFill }]);
}

function buildCriteriaSheet(workbook: Workbook, result: Tier2Result, tr: Translator): void {
  const { t } = tr;
  const sheet = addTableSheet(
    workbook,
    'Criteria_Assessment',
    [
      { header: t('excel.col.cteId'), key: 'cteId', width: 12 },
      { header: t('excel.col.cte'), key: 'cte', width: 26 },
      { header: t('excel.col.trl'), key: 'trl', width: 8 },
      { header: t('excel.col.criterionId'), key: 'id', width: 22 },
      { header: t('excel.col.criterion'), key: 'criterion', width: 64, wrap: true },
      { header: t('excel.tier2.col.category'), key: 'category', width: 18 },
      { header: t('excel.tier2.col.mandatory'), key: 'mandatory', width: 12 },
      { header: t('excel.col.origin'), key: 'origin', width: 12 },
      { header: t('excel.col.source'), key: 'source', width: 44, wrap: true },
      { header: t('excel.col.status'), key: 'status', width: 16 },
      { header: t('excel.tier2.col.justification'), key: 'justification', width: 36, wrap: true },
      { header: t('excel.tier2.col.satisfied'), key: 'satisfied', width: 12 },
      { header: t('excel.tier2.col.evidenceIds'), key: 'evidence', width: 24 },
      { header: t('excel.tier2.col.additional'), key: 'additional', width: 34, wrap: true },
      { header: t('excel.tier2.col.assessorNote'), key: 'note', width: 36, wrap: true },
    ],
    { freezeColumns: 1 },
  );

  let row = 2;
  for (const cte of result.ctes) {
    for (const level of cte.levels) {
      for (const outcome of level.applicable) {
        sheet.addRow({
          cteId: cte.cte.id,
          cte: safeText(cte.cte.name),
          trl: level.level,
          id: outcome.criterion.id,
          criterion: safeText(outcome.criterion.text),
          category: outcome.criterion.category ?? '',
          mandatory: outcome.criterion.mandatory ? 'Yes' : 'No',
          origin: outcome.criterion.origin,
          source: sourceText(outcome.criterion.source, tr),
          status: outcome.status,
          justification: safeText(outcome.justification ?? ''),
          satisfied: outcome.satisfied ? 'Yes' : 'No',
          evidence: outcome.evidenceIds.join(', '),
          additional: '',
          note: safeText(outcome.note ?? ''),
        });
        sheet.getRow(row).outlineLevel = 1;
        row += 1;
      }
    }
  }
  const last = row - 1;
  if (last >= 2) {
    applyListValidation(sheet, 'J', CRITERION_STATUSES, 2, last, { allowBlank: false }, tr);
    applyListValidation(sheet, 'L', ['Yes', 'No'], 2, last, { allowBlank: false }, tr);
    highlightValues(sheet, `J2:J${last}`, [
      { text: 'Not met', fill: STYLE.badFill },
      { text: 'Partially met', fill: STYLE.warnFill },
      { text: 'Not assessed', fill: STYLE.warnFill },
      { text: 'Met', fill: STYLE.goodFill },
    ]);
    highlightValues(sheet, `L2:L${last}`, [
      { text: 'Yes', fill: STYLE.goodFill },
      { text: 'No', fill: STYLE.badFill },
    ]);
  }
}

function evidenceColumns({ t }: Translator): ColumnSpec[] {
  return [
    { header: t('excel.tier2.col.evidenceId'), key: 'id', width: 14 },
    { header: t('excel.tier2.col.type'), key: 'type', width: 20 },
    { header: t('excel.col.title'), key: 'title', width: 38, wrap: true },
    { header: t('excel.col.description'), key: 'description', width: 44, wrap: true },
    { header: t('excel.tier2.col.linked'), key: 'linked', width: 32, wrap: true },
    { header: t('excel.tier2.col.location'), key: 'url', width: 40 },
    { header: t('excel.tier2.col.local'), key: 'local', width: 36 },
    { header: t('excel.col.open'), key: 'open', width: 14 },
    { header: t('excel.tier2.col.repoUrl'), key: 'repoUrl', width: 34 },
    { header: t('excel.tier2.col.commit'), key: 'commit', width: 24 },
    { header: t('excel.tier2.col.repoPath'), key: 'repoPath', width: 24 },
    { header: t('excel.tier2.col.doi'), key: 'doi', width: 24 },
    { header: t('excel.tier2.col.size'), key: 'size', width: 16 },
    { header: t('excel.tier2.col.sha'), key: 'sha', width: 34 },
    { header: t('excel.tier2.col.date'), key: 'date', width: 14 },
    { header: t('excel.tier2.col.custodian'), key: 'owner', width: 24 },
    { header: t('excel.tier2.col.marking'), key: 'marking', width: 26 },
    { header: t('excel.tier2.col.verification'), key: 'verification', width: 16 },
    { header: t('excel.tier2.col.verifiedBy'), key: 'verifiedBy', width: 20 },
    { header: t('excel.tier2.col.verifiedDate'), key: 'verifiedDate', width: 16 },
    { header: t('excel.tier2.col.bundled'), key: 'bundled', width: 22 },
  ];
}

function buildEvidenceSheet(
  workbook: Workbook,
  session: AssessmentSession,
  packageType: 'standalone' | 'zip',
  bundledPaths: Record<string, string>,
  tr: Translator,
): void {
  const { t } = tr;
  const columns = evidenceColumns(tr);
  const sheet = addTableSheet(workbook, 'Evidence_Register', columns, {
    freezeColumns: 1,
  });
  const evidence = session.tier2?.evidence ?? [];

  const openFormula = (r: number) =>
    `IF(G${r}<>"",HYPERLINK(G${r},"Open file"),IF(F${r}<>"",HYPERLINK(F${r},"Open link"),""))`;

  let row = 2;
  for (const item of evidence) {
    const sensitive = item.marking === SENSITIVE_MARKING;
    const relative = item.file
      ? (bundledPaths[item.id] ?? `evidence/${item.id}_${item.file.name}`)
      : '';
    const bundled = sensitive
      ? 'No (reference only)'
      : packageType === 'zip' && item.file
        ? 'Yes'
        : item.file
          ? 'No (not bundled — export the evidence package)'
          : 'No (no file)';

    sheet.addRow({
      id: item.id,
      type: item.type,
      title: safeText(item.title),
      description: safeText(item.description ?? ''),
      linked: item.linkedCriteria.map((l) => `${l.cteId}/${l.criterionId}`).join(', '),
      url: item.url ?? '',
      local: sensitive ? '' : relative,
      open: '',
      repoUrl: item.repoUrl ?? '',
      commit: item.commitSha ?? '',
      repoPath: [item.repoPath, item.tag].filter(Boolean).join(' @ '),
      doi: item.doi ?? '',
      size: item.file?.sizeBytes ?? '',
      sha: item.file?.sha256 ?? '',
      date: item.date ?? '',
      owner: safeText(item.owner ?? ''),
      marking: item.marking,
      verification: item.verification,
      verifiedBy: safeText(item.verifiedBy ?? ''),
      verifiedDate: item.verifiedDate ?? '',
      bundled,
    });
    if (item.url) setHyperlink(sheet, `F${row}`, item.url);
    if (!sensitive && relative && packageType === 'zip') setHyperlink(sheet, `G${row}`, relative);
    setFormula(sheet, `H${row}`, openFormula(row));
    row += 1;
  }

  const firstPlaceholder = row;
  for (let i = 1; i <= BLANK_EVIDENCE_PLACEHOLDER_ROWS; i += 1) {
    sheet.addRow({
      id: placeholderEvidenceId(i),
      type: '',
      title: '',
      description: placeholderNote(tr),
      bundled: '',
    });
    setFormula(sheet, `H${row}`, openFormula(row));
    fillRow(sheet, row, STYLE.placeholderFill, columns.length);
    row += 1;
  }
  const last = row - 1;

  applyListValidation(sheet, 'B', EVIDENCE_TYPES, 2, last, {}, tr);
  applyListValidation(sheet, 'Q', MARKINGS, 2, last, {}, tr);
  applyListValidation(sheet, 'R', VERIFICATIONS, 2, last, {}, tr);
  applyListValidation(sheet, 'U', ['Yes', 'No (reference only)', 'No (no file)'], 2, last, {}, tr);
  highlightValues(sheet, `R2:R${last}`, [
    { text: 'Rejected', fill: STYLE.badFill },
    { text: 'Verified', fill: STYLE.goodFill },
  ]);
  highlightValues(sheet, `Q2:Q${last}`, [{ text: 'Sensitive', fill: STYLE.warnFill }]);
  sheet.getCell(`A${firstPlaceholder}`).note = t('excel.tier2.evidence.placeholderNote');
}

function buildGapActionsSheet(
  workbook: Workbook,
  session: AssessmentSession,
  result: Tier2Result,
  tr: Translator,
): void {
  const { t } = tr;
  const sheet = addTableSheet(workbook, 'Gap_Actions', [
    { header: t('excel.col.cteId'), key: 'cteId', width: 12 },
    { header: t('excel.tier2.col.nextTrl'), key: 'level', width: 12 },
    { header: t('excel.col.criterionId'), key: 'criterionId', width: 22 },
    { header: t('excel.tier2.col.gap'), key: 'gap', width: 60, wrap: true },
    { header: t('excel.col.plannedAction'), key: 'action', width: 40, wrap: true },
    { header: t('excel.col.plannedEvidence'), key: 'evidence', width: 34, wrap: true },
    { header: t('excel.col.owner'), key: 'owner', width: 22 },
    { header: t('excel.tier2.col.dueDate'), key: 'due', width: 16 },
    { header: t('excel.col.status'), key: 'status', width: 16 },
  ]);

  const planned = session.tier2?.gapActions ?? [];
  let row = 2;
  for (const cte of result.ctes) {
    for (const gap of cte.gaps) {
      const action = planned.find(
        (a) => a.cteId === gap.cteId && a.criterionId === gap.criterionId,
      );
      sheet.addRow({
        cteId: gap.cteId,
        level: gap.level,
        criterionId: gap.criterionId,
        gap: `${safeText(gap.criterionText)} — ${gapReasonText(tr, gap)}`,
        action: safeText(action?.action ?? ''),
        evidence: '',
        owner: safeText(action?.owner ?? ''),
        due: action?.dueDate ?? '',
        status: action ? 'In progress' : 'Open',
      });
      row += 1;
    }
  }
  for (let i = 0; i < BLANK_GAP_ACTION_ROWS; i += 1) {
    sheet.addRow({});
    fillRow(sheet, row, STYLE.placeholderFill, 9);
    row += 1;
  }
  applyListValidation(sheet, 'I', GAP_STATUSES, 2, row - 1, {}, tr);
  applyWholeNumberValidation(sheet, 'B', 1, 9, 2, row - 1, tr);
  highlightValues(sheet, `I2:I${row - 1}`, [
    { text: 'Open', fill: STYLE.badFill },
    { text: 'Done', fill: STYLE.goodFill },
  ]);
}

function buildReviewSheet(workbook: Workbook, session: AssessmentSession, tr: Translator): void {
  const { t } = tr;
  const sheet = addTableSheet(workbook, 'Review_Signoff', [
    { header: t('excel.col.field'), key: 'field', width: 34 },
    { header: t('excel.col.value'), key: 'value', width: 60, wrap: true },
  ]);
  const rows: Array<[string, string]> = [
    [t('excel.tier2.review.assessorName'), safeText(session.tier1?.context.assessorName ?? '')],
    [t('excel.tier2.review.assessorRole'), safeText(session.tier1?.context.assessorRole ?? '')],
    [
      t('excel.tier2.review.assessorOrganization'),
      safeText(session.tier1?.context.organization ?? ''),
    ],
    [t('excel.tier2.review.assessorDate'), ''],
    [t('excel.tier2.review.assessorSignature'), ''],
    ['', ''],
    [t('excel.tier2.review.reviewerName'), ''],
    [t('excel.tier2.review.reviewerAffiliation'), ''],
    [t('excel.tier2.review.reviewerDate'), ''],
    [t('excel.tier2.review.reviewerConclusion'), ''],
    [t('excel.tier2.review.reviewerComments'), ''],
    [t('excel.tier2.review.reviewerSignature'), ''],
    ['', ''],
    [t('excel.row.note'), t('excel.tier2.review.note')],
  ];
  for (const [field, value] of rows) {
    const row = sheet.addRow({ field, value });
    if (field) row.getCell(1).font = { bold: true };
  }
  applyListValidation(sheet, 'B', REVIEW_CONCLUSIONS, 11, 11, {}, tr);
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
  const ids = new Set(framework.framework.sources);
  for (const criterion of framework.tier2) ids.add(criterion.source.sourceId);
  sourcesFor([...ids]).forEach((source, index) => {
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

function buildMetadataSheet(workbook: Workbook, meta: WorkbookMeta, tr: Translator): void {
  const { t } = tr;
  const sheet = addTableSheet(workbook, 'Metadata', [
    { header: t('excel.col.key'), key: 'key', width: 30 },
    { header: t('excel.col.value'), key: 'value', width: 60, wrap: true },
  ]);
  writeMetaBlock(sheet, meta, 2, tr);
}

/** Levels that exist in the framework — used by the tests to assert full coverage. */
export const ALL_LEVELS = TRL_LEVELS;

export async function exportTier2Workbook(
  framework: ResolvedFramework,
  session: AssessmentSession,
  options: Tier2ExportOptions = {},
  tr: Translator = currentTranslator(),
): Promise<string> {
  const at = options.generatedAt ?? new Date();
  const workbook = await buildTier2Workbook(
    framework,
    session,
    { ...options, generatedAt: at },
    tr,
  );
  const filename = workbookFilename('Tier2', session, at);
  downloadBlob(await workbookToBlob(workbook), filename);
  return filename;
}
