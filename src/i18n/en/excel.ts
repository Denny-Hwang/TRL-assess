/**
 * Workbook and evidence-package text. Sheet names, the values written into validated cells and all
 * source content (criteria, questions, rubric text, band labels) stay in English on purpose.
 */
export const excel = {
  // Shared infrastructure
  'excel.readme.title': '{app} — how to read this workbook',
  'excel.readme.label': 'Label',
  'excel.readme.disclaimer': 'Disclaimer',
  'excel.readme.important': 'Important',
  'excel.readme.provenance': 'Provenance',
  'excel.readme.contents': 'What this workbook contains',
  'excel.staticNote.trl':
    'Edits in this workbook do not recompute the TRL; re-import JSON into the app to recompute.',
  'excel.staticNote.arl':
    'Edits in this workbook do not recompute the ARL; re-import JSON into the app to recompute.',
  'excel.validation.list.title': 'Value not in the list',
  'excel.validation.list.error': 'Choose one of: {values}',
  'excel.validation.range.title': 'Out of range',
  'excel.validation.range.error': 'Enter a whole number between {min} and {max}.',
  'excel.placeholder': 'placeholder',
  'excel.source.page': 'p. {page}',
  'excel.source.clause': 'clause {clause}',

  // Provenance / metadata keys
  'excel.meta.tool': 'Tool',
  'excel.meta.toolVersion': 'Tool version',
  'excel.meta.gitSha': 'Git SHA',
  'excel.meta.buildTime': 'Tool build time (UTC)',
  'excel.meta.framework': 'Framework',
  'excel.meta.frameworkVersion': 'Framework version',
  'excel.meta.schemaVersion': 'Session schema version',
  'excel.meta.generatedAt': 'Generated at (UTC)',
  'excel.meta.packageType': 'Package type',

  // Column headers used on several sheets
  'excel.col.item': 'Item',
  'excel.col.value': 'Value',
  'excel.col.field': 'Field',
  'excel.col.key': 'Key',
  'excel.col.notes': 'Notes',
  'excel.col.trl': 'TRL',
  'excel.col.criterionId': 'Criterion ID',
  'excel.col.criterion': 'Criterion',
  'excel.col.origin': 'Origin',
  'excel.col.source': 'Source',
  'excel.col.sourceDetail': 'Source (doc, section, page)',
  'excel.col.open': 'Open',
  'excel.col.owner': 'Owner',
  'excel.col.status': 'Status',
  'excel.col.title': 'Title',
  'excel.col.description': 'Description',
  'excel.col.plannedEvidence': 'Planned evidence (placeholder)',
  'excel.col.plannedAction': 'Planned action',
  'excel.col.cteId': 'CTE ID',
  'excel.col.cte': 'CTE',
  'excel.col.critical': 'Critical',
  'excel.col.targetTrl': 'Target TRL',
  'excel.col.sourceId': 'Source ID',
  'excel.col.issuer': 'Issuer',
  'excel.col.versionDate': 'Version/Date',
  'excel.col.url': 'URL',

  // Row labels used on several sheets
  'excel.row.project': 'Project',
  'excel.row.technology': 'Technology',
  'excel.row.assessor': 'Assessor',
  'excel.row.assessorRole': 'Assessor role',
  'excel.row.organization': 'Organization',
  'excel.row.assessmentDate': 'Assessment date (UTC)',
  'excel.row.framework': 'Framework',
  'excel.row.label': 'Label',
  'excel.row.disclaimer': 'Disclaimer',
  'excel.row.projectName': 'Project name',
  'excel.row.technologyName': 'Technology name',
  'excel.row.assessorName': 'Assessor name',
  'excel.row.sessionCreated': 'Session created (UTC)',
  'excel.row.sessionUpdated': 'Session updated (UTC)',
  'excel.row.note': 'Note',
  'excel.row.source': 'Source',

  // Tier 1 workbook
  'excel.tier1.error.noAnswers': 'This session has no Tier 1 answers to export.',
  'excel.tier1.count.answered': 'Questions answered',
  'excel.tier1.readme.contents.summary':
    'Summary — the estimate, the cross-check and any flags raised.',
  'excel.tier1.readme.contents.context':
    'Context — what was assessed, by whom, and the highest-fidelity test performed.',
  'excel.tier1.readme.contents.responses':
    'Responses — every screening question, your answer, your note and the source of the question.',
  'excel.tier1.readme.contents.next':
    'Next_Evidence_Placeholders — the criteria that come next, with blank rows for planning evidence.',
  'excel.tier1.readme.contents.references':
    'References — the source documents behind the questions.',
  'excel.tier1.readme.fill.heading': 'How to fill the placeholders',
  'excel.tier1.readme.fill.planned':
    'On Next_Evidence_Placeholders, describe the evidence you plan to produce in "Planned evidence".',
  'excel.tier1.readme.fill.link':
    'Put a URL or a file path in "Evidence link / path"; the "Open" column then becomes a clickable link.',
  'excel.tier1.readme.fill.owner':
    'Owner and Target date are free text — this workbook is a planning aid, not a tracker.',
  'excel.tier1.readme.fill.sensitive':
    'Never paste controlled or sensitive content into this workbook. Record a pointer instead.',
  'excel.tier1.readme.calc.heading': 'How the estimate is calculated',
  'excel.tier1.readme.calc.estimate':
    'Estimated TRL is the highest level where that level and every level below it were answered "Yes".',
  'excel.tier1.readme.calc.unsure': '"Unsure" never counts as "Yes".',
  'excel.tier1.readme.calc.claimed':
    'Highest level claimed is the highest single "Yes", ignoring gaps.',
  'excel.tier1.readme.calc.matrix':
    'The build × environment cross-check is a heuristic aid, not a standard, and never overrides your answers.',
  'excel.tier1.summary.estimate': 'Estimated TRL (headline)',
  'excel.tier1.summary.claimed': 'Highest level claimed (first "Yes")',
  'excel.tier1.summary.matrix': 'Build × environment cross-check',
  'excel.tier1.summary.consistency': 'Consistency rating',
  'excel.tier1.summary.flags': 'Flags',
  'excel.tier1.context.description': 'One-line description',
  'excel.tier1.context.test': 'Highest-fidelity test performed',
  'excel.tier1.context.testLocation': 'Test location',
  'excel.tier1.context.testDate': 'Test date',
  'excel.tier1.context.envCode': 'Environment code',
  'excel.tier1.context.envDescription': 'Environment description',
  'excel.tier1.context.buildCode': 'Build code',
  'excel.tier1.context.buildDescription': 'Build description',
  'excel.tier1.col.questionId': 'Question ID',
  'excel.tier1.col.question': 'Question',
  'excel.tier1.col.answer': 'Answer',
  'excel.tier1.col.note': 'Note',
  'excel.tier1.col.link': 'Evidence link / path (placeholder)',
  'excel.tier1.col.targetDate': 'Target date',

  // Tier 2 workbook
  'excel.tier2.error.noCtes': 'This session has no Critical Technology Elements to export.',
  'excel.tier2.count.ctes': 'CTEs',
  'excel.tier2.count.criteria': 'Criteria assessed',
  'excel.tier2.count.evidence': 'Evidence items',
  'excel.tier2.count.gaps': 'Gap actions',
  'excel.tier2.readme.contents.summary':
    'Summary — the conservative system summary, the limiting CTE(s) and a per-CTE table.',
  'excel.tier2.readme.contents.cteRegister':
    'CTE_Register — the Critical Technology Elements and why each is critical.',
  'excel.tier2.readme.contents.criteria':
    'Criteria_Assessment — one row per CTE × applicable criterion, with status, evidence and whether it is satisfied.',
  'excel.tier2.readme.contents.evidence':
    'Evidence_Register — every evidence item, plus blank placeholder rows you can fill in.',
  'excel.tier2.readme.contents.gaps':
    'Gap_Actions — the unmet mandatory criteria at each CTE next level, ready to plan against.',
  'excel.tier2.readme.contents.review':
    'Review_Signoff — space for the assessor and an independent reviewer.',
  'excel.tier2.readme.contents.references':
    'References — the source documents behind the criteria.',
  'excel.tier2.readme.contents.metadata': 'Metadata — provenance of this export.',
  'excel.tier2.readme.attach.heading': 'How to attach evidence in Excel',
  'excel.tier2.readme.attach.url':
    '(a) Put a URL in "Location / URL" for anything that already lives somewhere reachable.',
  'excel.tier2.readme.attach.local':
    '(b) Put a relative path in "Local file (relative path)" and keep the file in the evidence/ folder next to this workbook.',
  'excel.tier2.readme.attach.open':
    '(c) The "Open" column turns either of those into a clickable link.',
  'excel.tier2.readme.attach.sensitive':
    '(d) Never paste sensitive content into this workbook. Use a row marked "Sensitive — reference only" that points at the material instead.',
  'excel.tier2.readme.attach.zip':
    'This workbook was exported inside an evidence package: the relative paths already point at the bundled evidence/ folder.',
  'excel.tier2.readme.attach.standalone':
    'This workbook was exported on its own. Relative paths are shown for reference but the files are not bundled — export the evidence package to get them.',
  'excel.tier2.readme.calc.heading': 'How the assessment is calculated',
  'excel.tier2.readme.calc.satisfied':
    'A criterion is satisfied when it is "Met" with at least one linked, non-rejected evidence item, or "N/A" with a justification.',
  'excel.tier2.readme.calc.level':
    'A level is achieved when every applicable mandatory criterion at that level is satisfied and the level below is achieved.',
  'excel.tier2.readme.calc.cte': "A CTE's TRL is the highest achieved level.",
  'excel.tier2.readme.calc.system':
    'The system summary is the minimum TRL across the CTEs marked critical — a conservative reporting convention, not a mandated formula.',
  'excel.tier2.summary.system': 'System summary (TRL)',
  'excel.tier2.summary.notComputed': 'Not computed',
  'excel.tier2.summary.limiting': 'Limiting CTE(s)',
  'excel.tier2.summary.tier1': 'Tier 1 contiguous TRL',
  'excel.tier2.summary.noTier1': 'No quick estimate',
  'excel.tier2.summary.delta': 'Tier 2 − Tier 1 delta',
  'excel.tier2.summary.cteTrl': 'CTE TRL',
  'excel.tier2.summary.completeness': 'Next-level completeness %',
  'excel.tier2.summary.coverage': 'Evidence coverage %',
  'excel.tier2.col.name': 'Name',
  'excel.tier2.col.kind': 'Kind',
  'excel.tier2.col.whyCritical': 'Why critical',
  'excel.tier2.col.assessedTrl': 'Assessed TRL',
  'excel.tier2.col.category': 'Category',
  'excel.tier2.col.mandatory': 'Mandatory',
  'excel.tier2.col.justification': 'Justification (N/A)',
  'excel.tier2.col.satisfied': 'Satisfied',
  'excel.tier2.col.evidenceIds': 'Evidence IDs',
  'excel.tier2.col.additional': 'Additional evidence (placeholder)',
  'excel.tier2.col.assessorNote': 'Assessor note',
  'excel.tier2.col.evidenceId': 'Evidence ID',
  'excel.tier2.col.type': 'Type',
  'excel.tier2.col.linked': 'Linked CTE/Criteria',
  'excel.tier2.col.location': 'Location / URL',
  'excel.tier2.col.local': 'Local file (relative path)',
  'excel.tier2.col.repoUrl': 'Repo URL',
  'excel.tier2.col.commit': 'Commit SHA',
  'excel.tier2.col.repoPath': 'Repo path / tag',
  'excel.tier2.col.doi': 'DOI',
  'excel.tier2.col.size': 'File size (bytes)',
  'excel.tier2.col.sha': 'SHA-256',
  'excel.tier2.col.date': 'Date',
  'excel.tier2.col.custodian': 'Owner / custodian',
  'excel.tier2.col.marking': 'Marking',
  'excel.tier2.col.verification': 'Verification',
  'excel.tier2.col.verifiedBy': 'Verified by',
  'excel.tier2.col.verifiedDate': 'Verified date',
  'excel.tier2.col.bundled': 'Bundled in package',
  'excel.tier2.col.nextTrl': 'Next TRL',
  'excel.tier2.col.gap': 'Gap description',
  'excel.tier2.col.dueDate': 'Due date',
  'excel.tier2.evidence.placeholderNote':
    'Placeholder rows: fill them in by hand, or add the evidence in the app and export again.',
  'excel.tier2.review.assessorName': 'Assessor — name',
  'excel.tier2.review.assessorRole': 'Assessor — role',
  'excel.tier2.review.assessorOrganization': 'Assessor — organization',
  'excel.tier2.review.assessorDate': 'Assessor — date',
  'excel.tier2.review.assessorSignature': 'Assessor — signature',
  'excel.tier2.review.reviewerName': 'Independent reviewer — name',
  'excel.tier2.review.reviewerAffiliation': 'Independent reviewer — affiliation',
  'excel.tier2.review.reviewerDate': 'Independent reviewer — date',
  'excel.tier2.review.reviewerConclusion': 'Independent reviewer — conclusion',
  'excel.tier2.review.reviewerComments': 'Independent reviewer — comments',
  'excel.tier2.review.reviewerSignature': 'Independent reviewer — signature',
  'excel.tier2.review.note':
    "Reviewer sign-off is recorded here for convenience only. It is outside the tool's scoring: nothing in this workbook changes because a reviewer concurs or does not concur.",

  // ARL workbook
  'excel.arl.error.noRatings': 'This session has no ARL ratings to export.',
  'excel.arl.count.rated': 'Dimensions rated',
  'excel.arl.count.total': 'Dimensions in the rubric',
  'excel.arl.readme.contents.summary':
    'Summary — ARL Start, ARL End (target), the tallies behind them and any flags raised.',
  'excel.arl.readme.contents.scope':
    'Scope — the technology scope, value chain scope, timeline and policy environment the ratings assume.',
  'excel.arl.readme.contents.risk':
    'Risk_Assessment — every dimension: current rating, rationale, evidence, target and planned action, with the rubric text.',
  'excel.arl.readme.contents.lookup':
    'ARL_Lookup — the source look-up table, with this assessment’s cells marked.',
  'excel.arl.readme.contents.references': 'References — the source documents.',
  'excel.arl.readme.contents.metadata': 'Metadata — provenance of this export.',
  'excel.arl.readme.calc.heading': 'How the ARL is calculated',
  'excel.arl.readme.calc.rated':
    'Each dimension is rated Low, Medium or High risk, or N/A, against the DOE Adoption Readiness Assessment rubric.',
  'excel.arl.readme.calc.tally':
    'The Medium- and High-risk dimensions are tallied and the ARL is read from the source look-up table on p. 13, unmodified.',
  'excel.arl.readme.calc.conservative':
    'This tool counts Unsure, Not assessed, and N/A without a rationale as High risk — a conservative convention of the tool, not a rule of the source.',
  'excel.arl.readme.calc.end':
    'ARL End uses the end-of-project targets; where none is set the current rating carries forward. {target}.',
  'excel.arl.readme.calc.trl':
    'ARL complements TRL. The TRL results are in the separate TRL workbooks and are never combined with the ARL.',
  'excel.arl.readme.use.heading': 'How to use the placeholders',
  'excel.arl.readme.use.freeText':
    'Rationale, Evidence / reference and Planned action are free text for the team to complete.',
  'excel.arl.readme.use.dropdowns':
    'The Current rating and Target rating columns keep their dropdowns, but changing them does not recompute the ARL.',
  'excel.arl.readme.use.sensitive':
    'Never paste controlled or sensitive content into this workbook. Record a pointer instead.',
  'excel.arl.tally': 'Low {low} · Medium {medium} · High {high} · N/A {na}',
  'excel.arl.summary.rubric': 'ARL rubric',
  'excel.arl.summary.start': 'ARL Start',
  'excel.arl.summary.end': 'ARL End (target)',
  'excel.arl.summary.change': 'Change over the project',
  'excel.arl.summary.currentTally': 'Current ratings, as counted',
  'excel.arl.summary.targetTally': 'Targets, as counted',
  'excel.arl.summary.areaCurrent': '{area} (current)',
  'excel.arl.summary.flagsCurrent': 'Flags — current ratings',
  'excel.arl.summary.flagsTarget': 'Flags — targets',
  'excel.arl.summary.rubricNote': 'Rubric note',
  'excel.arl.scope.technologyScope': 'Technology scope',
  'excel.arl.scope.valueChain': 'Value chain scope',
  'excel.arl.scope.timeline': 'Timeline for evaluation',
  'excel.arl.scope.policy': 'Policy environment assumed',
  'excel.arl.scope.trlFramework': 'TRL framework of this session',
  'excel.arl.col.area': 'Core area',
  'excel.arl.col.dimensionId': 'Dimension ID',
  'excel.arl.col.dimension': 'Dimension',
  'excel.arl.col.current': 'Current rating',
  'excel.arl.col.counted': 'Counted as',
  'excel.arl.col.why': 'Why counted so',
  'excel.arl.col.rationale': 'Rationale',
  'excel.arl.col.evidence': 'Evidence / reference',
  'excel.arl.col.target': 'Target rating (end of project)',
  'excel.arl.col.targetCounted': 'Target counted as',
  'excel.arl.col.low': 'Low risk (rubric)',
  'excel.arl.col.medium': 'Medium risk (rubric)',
  'excel.arl.col.high': 'High risk (rubric)',
  'excel.arl.lookup.axis': 'Medium \\ High',
  'excel.arl.lookup.start': 'Start',
  'excel.arl.lookup.target': 'Target',
  'excel.arl.lookup.counts': '{medium} Medium, {high} High → ARL {arl}',
  'excel.arl.lookup.note':
    'The marked cells carry a note naming them; the printed table is used unmodified.',
  'excel.arl.meta.workbook': 'Workbook',
  'excel.arl.meta.workbookValue': 'ARL (side module)',
  'excel.arl.meta.trlFramework': 'TRL framework of the session',
  'excel.arl.meta.trlFrameworkName': 'TRL framework name',

  // Evidence package (README.txt, progress and errors)
  'excel.package.tooLarge':
    'The evidence files total {total} MB, over the {limit} MB package limit. Remove or unlink a large file, or record it as a reference instead of attaching it. Largest files: {files}',
  'excel.package.fileSize': '{name} ({size} MB)',
  'excel.package.error.folder': 'Could not create the package folder.',
  'excel.package.progress.library': 'Loading the packaging library…',
  'excel.package.progress.workbook': 'Building the workbook…',
  'excel.package.progress.session': 'Writing the session…',
  'excel.package.progress.evidence': 'Adding evidence {n} of {total}…',
  'excel.package.progress.compress': 'Compressing…',
  'excel.package.readme.title': '{app} evidence package',
  'excel.package.readme.createdBy': 'Created by {app} {version} (build {sha}).',
  'excel.package.readme.contents': 'Contents',
  'excel.package.readme.workbook': 'the Tier 2 workbook',
  'excel.package.readme.session': 'the full assessment, re-importable into the app',
  'excel.package.readme.evidence': '{count} evidence file(s), named <EV-ID>_<original name>',
  'excel.package.readme.manifest': 'SHA-256 of every file in this package',
  'excel.package.readme.links.heading': 'Opening the links',
  'excel.package.readme.links.body':
    'Unzip the whole folder first, keeping the structure intact. The "Local file (relative\npath)" cells in Evidence_Register point at evidence/… relative to the workbook, so the\n"Open" column works once the folder is unzipped.',
  'excel.package.readme.hashes.heading': 'Verifying the hashes',
  'excel.package.readme.not.heading': 'What this package is not',
  'excel.package.readme.not.body':
    'A self-assessment, not an independent Technology Readiness Assessment. Evidence marked\n"Sensitive — reference only" is never bundled: those rows point at material held\nelsewhere.',
} as const;
