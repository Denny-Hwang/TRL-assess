/** Quick Estimate (Tier 1) pages, plus the answer rail, ladder and cross-check matrix diagrams. */
export const tier1 = {
  'tier1.reset.button': 'Reset',
  'tier1.reset.confirm': 'Discard this assessment?',
  'tier1.reset.yes': 'Yes, reset',
  'tier1.reset.cancel': 'Cancel',

  'tier1.context.title': 'Quick Estimate — step 1 of 2: context',
  'tier1.context.framework': 'Framework',
  'tier1.context.projectName': 'Project name',
  'tier1.context.technologyName': 'Technology name',
  'tier1.context.assessorName': 'Assessor name',
  'tier1.context.assessorRole': 'Assessor role',
  'tier1.context.organization': 'Organization',
  'tier1.context.oneLineDescription': 'One-line description',
  'tier1.context.testHeading': 'Highest-fidelity test performed so far',
  'tier1.context.testWhat': 'What was tested',
  'tier1.context.testWhere': 'Where',
  'tier1.context.testWhen': 'When (month/year)',
  'tier1.context.testWhenPlaceholder': 'YYYY-MM',
  'tier1.context.crossCheckHeading': 'Cross-check inputs',
  'tier1.context.environment': 'Environment reached',
  'tier1.context.build': 'Build maturity',
  'tier1.context.crossCheckNote':
    'Used only for a heuristic cross-check ({status}); it never overrides your answers.',
  'tier1.context.missing.projectName': 'project name',
  'tier1.context.missing.technologyName': 'technology name',
  'tier1.context.missing.assessorName': 'assessor name',
  'tier1.context.missing': 'Please fill in: {fields}.',
  'tier1.context.continue': 'Continue to the questions',

  'tier1.q.title': 'Quick Estimate — step 2 of 2: screening questions',
  'tier1.q.lead':
    'Work from TRL 9 downwards. Answer for the technology as a whole, based on what has actually been done.',
  'tier1.q.progress': '{answered} / {total} answered',
  'tier1.q.counter': 'Question {n} of {total}',
  'tier1.q.helpSummary': 'What this level means',
  'tier1.q.answerGroup': 'Answer',
  'tier1.q.note': 'Note (optional)',
  'tier1.q.notePlaceholder': 'One line — what makes you answer that way?',
  'tier1.q.previous': '← Previous',
  'tier1.q.next': 'Next →',
  'tier1.q.keyboard': 'Keyboard: Y / N / U to answer, arrow keys to move.',
  'tier1.q.seeEstimate': 'See the estimate',

  'tier1.result.title': 'Quick Estimate — result',
  'tier1.result.marker.estimate': 'estimate',
  'tier1.result.marker.claimed': 'claimed',
  'tier1.result.marker.crossCheck': 'cross-check',
  'tier1.result.ladderLabel':
    'Estimated TRL {estimate} of 9. Highest level claimed: {claimed}. Build and environment cross-check: {matrix}.',
  'tier1.result.ladderNote':
    'Filled rungs are confirmed. A hatched rung is a level you claimed while a level below it is unconfirmed — the chain stops there.',
  'tier1.result.estimated': 'Estimated TRL',
  'tier1.result.estimatedHint': 'Highest level with every level below it also confirmed.',
  'tier1.result.claimed': 'Highest level claimed',
  'tier1.result.claimedHint': 'Highest single "Yes", ignoring gaps.',
  'tier1.result.matrix': 'Build × environment cross-check',
  'tier1.result.matrixHint': '{build} × {environment} — {status}.',
  'tier1.result.consistency': 'Consistency: {rating}',
  'tier1.result.consistencyHelp.High':
    'Your answers are internally consistent and agree with the build/environment cross-check. That says nothing about whether the answers are correct.',
  'tier1.result.consistencyHelp.Medium':
    'There is some tension between your answers and the cross-check, or an "Unsure" at or below the level you claimed.',
  'tier1.result.consistencyHelp.Low':
    'Your answers disagree strongly with the build/environment cross-check, or several levels below your claim are unconfirmed. Re-check before using this figure.',
  'tier1.result.nextHeading': 'What typically comes next',
  'tier1.result.nextMandatory':
    'What {trl} requires — each of these needs evidence in a Tier 2 assessment.',
  'tier1.result.nextNoMandatory':
    'Criteria at {trl}. This framework marks none of them mandatory, so an assessor decides.',
  'tier1.result.optional.one':
    '…plus {count} optional criterion at this level, shown in the evidence assessment.',
  'tier1.result.optional.other':
    '…plus {count} optional criteria at this level, shown in the evidence assessment.',
  'tier1.result.takeAway': 'Take it away',
  'tier1.result.building': 'Building the workbook…',
  'tier1.result.downloadExcel': 'Download Excel',
  'tier1.result.downloadJson': 'Download JSON',
  'tier1.result.continue': 'Continue to Evidence Assessment',
  'tier1.result.filesNote':
    'The JSON file restores this session in the app. The workbook is a static snapshot — editing it does not recompute the TRL.',

  'tier1.rail.label': 'Answers so far, TRL 1 to 9',
  'tier1.rail.yes': 'yes',
  'tier1.rail.no': 'no',
  'tier1.rail.unsure': 'unsure',
  'tier1.rail.notAnswered': 'not answered',
  'tier1.rail.item': '{trl} — {state}',
  'tier1.rail.go': '{item}. Go to this question.',
  'tier1.rail.goInChain': '{item}, part of the confirmed chain. Go to this question.',

  'tier1.ladder.achieved': 'achieved',
  'tier1.ladder.gap': 'claimed but not confirmed',
  'tier1.ladder.notAchieved': 'not achieved',
  'tier1.ladder.item': '{trl} — {state}',
  'tier1.ladder.show': '{item}. Show its criteria.',

  'tier1.matrix.caption.before': 'Build maturity × environment reached → suggested TRL. This is a ',
  'tier1.matrix.caption.after': ' and never overrides your answers.',
  'tier1.matrix.srCaption':
    'Cross-check matrix: each cell gives the TRL suggested by a build maturity and an environment.',
  'tier1.matrix.srCombination': 'Your combination is {build} × {environment}.',
  'tier1.matrix.corner': 'build \\ env',
  'tier1.matrix.cell': '{build} with {environment}: {trl}',
  'tier1.matrix.cellActive': '{build} with {environment}: {trl} — your combination',
  'tier1.matrix.yours': '(your combination)',
  'tier1.matrix.activeHead': '{build} × {environment} → {trl}',
  'tier1.matrix.activeText': '— {build} tested in {environment}.',
  'tier1.matrix.hint': 'Hover or focus a cell to see what that combination means.',
} as const;
