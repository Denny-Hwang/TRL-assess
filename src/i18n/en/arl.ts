/** Adoption readiness (ARL) pages and the ARL figures. Rubric text stays in the framework data. */
export const arl = {
  'arl.common.start': 'ARL Start',
  'arl.common.endTarget': 'ARL End (target)',
  'arl.common.value': 'ARL {level}',

  'arl.reset.button': 'Reset ARL',
  'arl.reset.confirm': 'Discard the ARL ratings? The TRL assessment is kept.',
  'arl.reset.yes': 'Yes, reset ARL',
  'arl.reset.cancel': 'Cancel',
  'arl.unavailable.title': 'The ARL rubric for this session is not available',
  'arl.unavailable.body':
    'This session was rated against the ARL rubric "{id}", which this version of the app does not include ({detail}). Reset the ARL ratings to start again with the current rubric.',

  'arl.scope.title': 'Adoption readiness — step 1 of 3: scope',
  'arl.scope.lead':
    'What is being assessed, and against which market. Nothing here leaves your browser.',
  'arl.scope.versionSource': 'Version: {version} · Source: {source}',
  'arl.scope.projectName': 'Project name',
  'arl.scope.technologyName': 'Technology name',
  'arl.scope.assessorName': 'Assessor name',
  'arl.scope.organization': 'Organization',
  'arl.scope.missing.projectName': 'project name',
  'arl.scope.missing.technologyName': 'technology name',
  'arl.scope.missing.assessorName': 'assessor name',
  'arl.scope.missing': 'Please fill in: {fields}.',
  'arl.scope.heading': 'Scope of the assessment',
  'arl.scope.technologyScope': 'Technology scope',
  'arl.scope.valueChainScope': 'Value chain scope',
  'arl.scope.evaluationTimeline': 'Timeline for evaluation',
  'arl.scope.evaluationTimeline.placeholder':
    'e.g. as of today, commercialization window of 5 years',
  'arl.scope.policyEnvironment': 'Policy environment assumed',
  'arl.scope.continue': 'Continue to the ratings',

  'arl.rate.title': 'Adoption readiness — step 2 of 3: rate the dimensions',
  'arl.rate.progress': 'Progress',
  'arl.rate.meter': 'Dimensions rated',
  'arl.rate.rated': '{rated} of {total} rated',
  'arl.rate.conservative':
    'Anything left unrated, Unsure, or N/A without a rationale counts as High risk until it is resolved. Targets describe the end of the project: target — planned, not achieved.',
  'arl.rate.areasNav': 'Core risk areas',
  'arl.rate.currentRisk': 'Current risk',
  'arl.rate.naOption': 'N/A — does not apply to this scope',
  'arl.rate.clear': 'Clear rating',
  'arl.rate.countedAs': 'counted as {risk}',
  'arl.rate.notCountedNa': 'not counted (N/A) — the rationale explains why it does not apply',
  'arl.rate.rationale': 'Comments / rationale',
  'arl.rate.rationaleRequired': 'Comments / rationale (required for N/A)',
  'arl.rate.evidence': 'Evidence or reference',
  'arl.rate.evidence.placeholder': 'e.g. EV-0004, a letter of interest, a market study',
  'arl.rate.target': 'Target at the end of the project',
  'arl.rate.sameAsCurrent': 'Same as current',
  'arl.rate.plannedAction': 'Planned action',
  'arl.rate.plannedAction.placeholder': 'What the project will do to reach the target',
  'arl.rate.seeResult': 'See the result',
  'arl.rate.backToScope': 'Back to the scope',

  'arl.result.title': 'Adoption readiness — result',
  'arl.result.scaleLabel':
    'ARL Start {start} ({startBand}). ARL End, target: {end} ({endBand}).',
  'arl.result.startHint': '{band} — {medium} Medium, {high} High counted.',
  'arl.result.endHint': '{band} — {target}.',
  'arl.result.change': 'Change over the project',
  'arl.result.changeHint': 'ARL End minus ARL Start.',
  'arl.result.scopeMissing.before':
    'The technology scope or the timeline for evaluation is blank. The source asks you to define both before rating — the same technology can rate differently at another scope.',
  'arl.result.scopeMissing.link': 'Complete the scope',
  'arl.result.scopeMissing.after': '.',
  'arl.result.profile': 'Risk profile',
  'arl.result.caption':
    'Current and target risk rating of each dimension, grouped by core risk area.',
  'arl.result.col.dimension': 'Dimension',
  'arl.result.col.current': 'Current',
  'arl.result.col.target': 'Target',
  'arl.result.col.plannedAction': 'Planned action',
  'arl.result.countedHigh': 'counted as High',
  'arl.result.sameAsCurrent': 'same as current',
  'arl.result.plannedReduction': 'planned reduction',
  'arl.result.flags': 'Flags',
  'arl.result.flags.current': 'Current ratings',
  'arl.result.flags.targets': 'Targets',
  'arl.result.howRead': 'How the number is read',
  'arl.result.howRead.body':
    'The source tallies the Medium- and High-risk dimensions and reads the ARL from its look-up table. This tool uses the table exactly as printed.',
  'arl.result.mark.start': 'Start',
  'arl.result.mark.target': 'Target',
  'arl.result.modify':
    'This tool does not: every result uses the printed table, so results stay comparable.',
  'arl.result.takeAway': 'Take it away',
  'arl.result.building': 'Building the workbook…',
  'arl.result.downloadExcel': 'Download Excel',
  'arl.result.downloadJson': 'Download JSON',
  'arl.result.backToRatings': 'Back to the ratings',
  'arl.result.howScored': 'How ARL is scored',
  'arl.result.jsonNote':
    'The JSON file restores the whole session, TRL and ARL. The workbook is a static snapshot — editing it does not recompute the ARL.',

  'arl.scale.start': 'Start: ARL {level}',
  'arl.scale.target': 'Target: ARL {level}',
  'arl.scale.targetNoChange': 'Target: ARL {level} (no change)',

  'arl.grid.caption':
    'Rows: number of Medium-risk dimensions. Columns: number of High-risk dimensions.',
  'arl.grid.corner': 'M \\ H',
  'arl.grid.summary': '{label}: {medium} Medium and {high} High → ARL {arl}',
  'arl.grid.mark': '{label}: {medium} Medium, {high} High',

  'arl.glyph.na': 'Not applicable',
  'arl.glyph.legend': 'Risk rating legend',

  'arl.tally.item': '{count} {rating}',
  'arl.tally.none': 'none',

  'arl.map.aria': 'Core risk areas and their dimensions',
  'arl.map.count.one': '{count} dimension',
  'arl.map.count.other': '{count} dimensions',
  'arl.map.caption':
    '{dimensions} dimensions in {areas} core risk areas, as numbered in the {name} ({version}).',
} as const;
