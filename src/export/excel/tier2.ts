/**
 * Tier 2 workbook (BUILD_SPEC D-3.2).
 * Sheets, in order: README, Summary, CTE_Register, Criteria_Assessment, Evidence_Register,
 * Gap_Actions, Review_Signoff, References, Metadata.
 */
import {
  BLANK_EVIDENCE_PLACEHOLDER_ROWS,
  BLANK_GAP_ACTION_ROWS,
  DISCLAIMER,
  TIER2_LABEL,
} from '@/config/app.config';
import { sourcesFor } from '@/data/sources';
import type { ResolvedFramework } from '@/domain/frameworks';
import { formatTrl, scoreTier1 } from '@/domain/tier1';
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
  type SourceRef,
} from '@/domain/schemas';
import { downloadBlob, workbookFilename } from '@/export/download';
import {
  addTableSheet,
  applyListValidation,
  applyWholeNumberValidation,
  createWorkbook,
  fillRow,
  highlightValues,
  safeText,
  setFormula,
  setHyperlink,
  STYLE,
  workbookToBlob,
  writeMetaBlock,
  writeReadmeSheet,
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

function sourceText(source: SourceRef): string {
  return [
    source.sourceId,
    source.section,
    source.page ? `p. ${source.page}` : undefined,
    source.clause ? `clause ${source.clause}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
}

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
): Promise<Workbook> {
  const tier2Data = session.tier2;
  if (!tier2Data || tier2Data.ctes.length === 0) {
    throw new Error('This session has no Critical Technology Elements to export.');
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
      CTEs: tier2Data.ctes.length,
      'Criteria assessed': tier2Data.assessments.length,
      'Evidence items': tier2Data.evidence.length,
      'Gap actions': tier2Data.gapActions.length,
    },
  };

  writeReadmeSheet(
    workbook,
    meta,
    [
      {
        heading: 'What this workbook contains',
        lines: [
          'Summary — the conservative system summary, the limiting CTE(s) and a per-CTE table.',
          'CTE_Register — the Critical Technology Elements and why each is critical.',
          'Criteria_Assessment — one row per CTE × applicable criterion, with status, evidence and whether it is satisfied.',
          'Evidence_Register — every evidence item, plus blank placeholder rows you can fill in.',
          'Gap_Actions — the unmet mandatory criteria at each CTE next level, ready to plan against.',
          'Review_Signoff — space for the assessor and an independent reviewer.',
          'References — the source documents behind the criteria.',
          'Metadata — provenance of this export.',
        ],
      },
      {
        heading: 'How to attach evidence in Excel',
        lines: [
          '(a) Put a URL in "Location / URL" for anything that already lives somewhere reachable.',
          '(b) Put a relative path in "Local file (relative path)" and keep the file in the evidence/ folder next to this workbook.',
          '(c) The "Open" column turns either of those into a clickable link.',
          '(d) Never paste sensitive content into this workbook. Use a row marked "Sensitive — reference only" that points at the material instead.',
          packageType === 'zip'
            ? 'This workbook was exported inside an evidence package: the relative paths already point at the bundled evidence/ folder.'
            : 'This workbook was exported on its own. Relative paths are shown for reference but the files are not bundled — export the evidence package to get them.',
        ],
      },
      {
        heading: 'How the assessment is calculated',
        lines: [
          'A criterion is satisfied when it is "Met" with at least one linked, non-rejected evidence item, or "N/A" with a justification.',
          'A level is achieved when every applicable mandatory criterion at that level is satisfied and the level below is achieved.',
          "A CTE's TRL is the highest achieved level.",
          'The system summary is the minimum TRL across the CTEs marked critical — a conservative reporting convention, not a mandated formula.',
        ],
      },
    ],
    TIER2_LABEL,
  );

  buildSummarySheet(workbook, framework, session, result, tier1?.contiguousTrl);
  buildCteRegisterSheet(workbook, result);
  buildCriteriaSheet(workbook, result);
  buildEvidenceSheet(workbook, session, packageType, bundledPaths);
  buildGapActionsSheet(workbook, session, result);
  buildReviewSheet(workbook, session);
  buildReferencesSheet(workbook, framework);
  buildMetadataSheet(workbook, meta);

  return workbook;
}

function buildSummarySheet(
  workbook: Workbook,
  framework: ResolvedFramework,
  session: AssessmentSession,
  result: Tier2Result,
  tier1Contiguous: number | undefined,
): void {
  const sheet = workbook.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = [
    { header: 'Item', key: 'a', width: 34 },
    { header: 'Value', key: 'b', width: 26 },
    { header: 'Notes', key: 'c', width: 70 },
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
    ['Project', safeText(session.tier1?.context.projectName ?? ''), ''],
    ['Technology', safeText(session.tier1?.context.technologyName ?? ''), ''],
    ['Assessor', safeText(session.tier1?.context.assessorName ?? ''), ''],
    [
      'Framework',
      `${framework.framework.id} (${framework.framework.version})`,
      framework.framework.name,
    ],
    [
      'System summary (TRL)',
      result.system.computed ? formatTrl(result.system.trl ?? 0) : 'Not computed',
      result.system.computed ? result.system.note : (result.system.message ?? ''),
    ],
    ['Limiting CTE(s)', result.system.limitingCteIds.join(', ') || '—', ''],
    [
      'Tier 1 contiguous TRL',
      tier1Contiguous === undefined ? 'No quick estimate' : formatTrl(tier1Contiguous),
      '',
    ],
    [
      'Tier 2 − Tier 1 delta',
      delta.delta === null ? '—' : String(delta.delta),
      delta.explanation ?? '',
    ],
    ['Label', TIER2_LABEL, ''],
    ['Disclaimer', '', DISCLAIMER],
  ];
  for (const [a, b, c] of rows) {
    const row = sheet.addRow({ a, b, c });
    row.getCell(1).font = { bold: true };
  }

  sheet.addRow({});
  const headerRow = sheet.addRow({
    a: 'CTE ID',
    b: 'CTE',
    c: 'Critical',
    d: 'CTE TRL',
    e: 'Target TRL',
    f: 'Next-level completeness %',
    g: 'Evidence coverage %',
  });
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STYLE.sectionFill } };
  for (const cte of result.ctes) {
    sheet.addRow({
      a: cte.cte.id,
      b: safeText(cte.cte.name),
      c: cte.cte.critical ? 'Yes' : 'No',
      d: formatTrl(cte.trl),
      e: cte.cte.targetTrl ?? '',
      f: cte.nextLevelCompletenessPct,
      g: cte.evidenceCoveragePct,
    });
  }
}

function buildCteRegisterSheet(workbook: Workbook, result: Tier2Result): void {
  const sheet = addTableSheet(workbook, 'CTE_Register', [
    { header: 'CTE ID', key: 'id', width: 12 },
    { header: 'Name', key: 'name', width: 32 },
    { header: 'Kind', key: 'kind', width: 14 },
    { header: 'Critical', key: 'critical', width: 12 },
    { header: 'Description', key: 'description', width: 50, wrap: true },
    { header: 'Why critical', key: 'why', width: 50, wrap: true },
    { header: 'Owner', key: 'owner', width: 22 },
    { header: 'Target TRL', key: 'target', width: 12 },
    { header: 'Assessed TRL', key: 'assessed', width: 14 },
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
  applyListValidation(sheet, 'D', ['Yes', 'No'], 2, last, { allowBlank: false });
  applyWholeNumberValidation(sheet, 'H', 1, 9, 2, last);
  highlightValues(sheet, `D2:D${last}`, [{ text: 'Yes', fill: STYLE.warnFill }]);
}

function buildCriteriaSheet(workbook: Workbook, result: Tier2Result): void {
  const sheet = addTableSheet(
    workbook,
    'Criteria_Assessment',
    [
      { header: 'CTE ID', key: 'cteId', width: 12 },
      { header: 'CTE', key: 'cte', width: 26 },
      { header: 'TRL', key: 'trl', width: 8 },
      { header: 'Criterion ID', key: 'id', width: 22 },
      { header: 'Criterion', key: 'criterion', width: 64, wrap: true },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Mandatory', key: 'mandatory', width: 12 },
      { header: 'Origin', key: 'origin', width: 12 },
      { header: 'Source', key: 'source', width: 44, wrap: true },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Justification (N/A)', key: 'justification', width: 36, wrap: true },
      { header: 'Satisfied', key: 'satisfied', width: 12 },
      { header: 'Evidence IDs', key: 'evidence', width: 24 },
      { header: 'Additional evidence (placeholder)', key: 'additional', width: 34, wrap: true },
      { header: 'Assessor note', key: 'note', width: 36, wrap: true },
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
          source: sourceText(outcome.criterion.source),
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
    applyListValidation(sheet, 'J', CRITERION_STATUSES, 2, last, { allowBlank: false });
    applyListValidation(sheet, 'L', ['Yes', 'No'], 2, last, { allowBlank: false });
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

const EVIDENCE_COLUMNS = [
  { header: 'Evidence ID', key: 'id', width: 14 },
  { header: 'Type', key: 'type', width: 20 },
  { header: 'Title', key: 'title', width: 38, wrap: true },
  { header: 'Description', key: 'description', width: 44, wrap: true },
  { header: 'Linked CTE/Criteria', key: 'linked', width: 32, wrap: true },
  { header: 'Location / URL', key: 'url', width: 40 },
  { header: 'Local file (relative path)', key: 'local', width: 36 },
  { header: 'Open', key: 'open', width: 14 },
  { header: 'Repo URL', key: 'repoUrl', width: 34 },
  { header: 'Commit SHA', key: 'commit', width: 24 },
  { header: 'Repo path / tag', key: 'repoPath', width: 24 },
  { header: 'DOI', key: 'doi', width: 24 },
  { header: 'File size (bytes)', key: 'size', width: 16 },
  { header: 'SHA-256', key: 'sha', width: 34 },
  { header: 'Date', key: 'date', width: 14 },
  { header: 'Owner / custodian', key: 'owner', width: 24 },
  { header: 'Marking', key: 'marking', width: 26 },
  { header: 'Verification', key: 'verification', width: 16 },
  { header: 'Verified by', key: 'verifiedBy', width: 20 },
  { header: 'Verified date', key: 'verifiedDate', width: 16 },
  { header: 'Bundled in package', key: 'bundled', width: 22 },
];

function buildEvidenceSheet(
  workbook: Workbook,
  session: AssessmentSession,
  packageType: 'standalone' | 'zip',
  bundledPaths: Record<string, string>,
): void {
  const sheet = addTableSheet(workbook, 'Evidence_Register', EVIDENCE_COLUMNS, {
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
      description: 'placeholder',
      bundled: '',
    });
    setFormula(sheet, `H${row}`, openFormula(row));
    fillRow(sheet, row, STYLE.placeholderFill, EVIDENCE_COLUMNS.length);
    row += 1;
  }
  const last = row - 1;

  applyListValidation(sheet, 'B', EVIDENCE_TYPES, 2, last);
  applyListValidation(sheet, 'Q', MARKINGS, 2, last);
  applyListValidation(sheet, 'R', VERIFICATIONS, 2, last);
  applyListValidation(sheet, 'U', ['Yes', 'No (reference only)', 'No (no file)'], 2, last);
  highlightValues(sheet, `R2:R${last}`, [
    { text: 'Rejected', fill: STYLE.badFill },
    { text: 'Verified', fill: STYLE.goodFill },
  ]);
  highlightValues(sheet, `Q2:Q${last}`, [{ text: 'Sensitive', fill: STYLE.warnFill }]);
  sheet.getCell(`A${firstPlaceholder}`).note =
    'Placeholder rows: fill them in by hand, or add the evidence in the app and export again.';
}

function buildGapActionsSheet(
  workbook: Workbook,
  session: AssessmentSession,
  result: Tier2Result,
): void {
  const sheet = addTableSheet(workbook, 'Gap_Actions', [
    { header: 'CTE ID', key: 'cteId', width: 12 },
    { header: 'Next TRL', key: 'level', width: 12 },
    { header: 'Criterion ID', key: 'criterionId', width: 22 },
    { header: 'Gap description', key: 'gap', width: 60, wrap: true },
    { header: 'Planned action', key: 'action', width: 40, wrap: true },
    { header: 'Planned evidence (placeholder)', key: 'evidence', width: 34, wrap: true },
    { header: 'Owner', key: 'owner', width: 22 },
    { header: 'Due date', key: 'due', width: 16 },
    { header: 'Status', key: 'status', width: 16 },
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
        gap: `${safeText(gap.criterionText)} — ${gap.reason}`,
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
  applyListValidation(sheet, 'I', GAP_STATUSES, 2, row - 1);
  applyWholeNumberValidation(sheet, 'B', 1, 9, 2, row - 1);
  highlightValues(sheet, `I2:I${row - 1}`, [
    { text: 'Open', fill: STYLE.badFill },
    { text: 'Done', fill: STYLE.goodFill },
  ]);
}

function buildReviewSheet(workbook: Workbook, session: AssessmentSession): void {
  const sheet = addTableSheet(workbook, 'Review_Signoff', [
    { header: 'Field', key: 'field', width: 34 },
    { header: 'Value', key: 'value', width: 60, wrap: true },
  ]);
  const rows: Array<[string, string]> = [
    ['Assessor — name', safeText(session.tier1?.context.assessorName ?? '')],
    ['Assessor — role', safeText(session.tier1?.context.assessorRole ?? '')],
    ['Assessor — organization', safeText(session.tier1?.context.organization ?? '')],
    ['Assessor — date', ''],
    ['Assessor — signature', ''],
    ['', ''],
    ['Independent reviewer — name', ''],
    ['Independent reviewer — affiliation', ''],
    ['Independent reviewer — date', ''],
    ['Independent reviewer — conclusion', ''],
    ['Independent reviewer — comments', ''],
    ['Independent reviewer — signature', ''],
    ['', ''],
    [
      'Note',
      "Reviewer sign-off is recorded here for convenience only. It is outside the tool's scoring: " +
        'nothing in this workbook changes because a reviewer concurs or does not concur.',
    ],
  ];
  for (const [field, value] of rows) {
    const row = sheet.addRow({ field, value });
    if (field) row.getCell(1).font = { bold: true };
  }
  applyListValidation(sheet, 'B', REVIEW_CONCLUSIONS, 11, 11);
}

function buildReferencesSheet(workbook: Workbook, framework: ResolvedFramework): void {
  const sheet = addTableSheet(workbook, 'References', [
    { header: 'Source ID', key: 'id', width: 24 },
    { header: 'Title', key: 'title', width: 60, wrap: true },
    { header: 'Issuer', key: 'issuer', width: 42, wrap: true },
    { header: 'Version/Date', key: 'version', width: 34, wrap: true },
    { header: 'URL', key: 'url', width: 60 },
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

function buildMetadataSheet(workbook: Workbook, meta: WorkbookMeta): void {
  const sheet = addTableSheet(workbook, 'Metadata', [
    { header: 'Key', key: 'key', width: 30 },
    { header: 'Value', key: 'value', width: 60, wrap: true },
  ]);
  writeMetaBlock(sheet, meta, 2);
}

/** Levels that exist in the framework — used by the tests to assert full coverage. */
export const ALL_LEVELS = TRL_LEVELS;

export async function exportTier2Workbook(
  framework: ResolvedFramework,
  session: AssessmentSession,
  options: Tier2ExportOptions = {},
): Promise<string> {
  const at = options.generatedAt ?? new Date();
  const workbook = await buildTier2Workbook(framework, session, { ...options, generatedAt: at });
  const filename = workbookFilename('Tier2', session, at);
  downloadBlob(await workbookToBlob(workbook), filename);
  return filename;
}
