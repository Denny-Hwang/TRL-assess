/** Labels, disclaimers and scoring messages shared by the pages and the workbooks. */
export const domain = {
  'label.tier1': 'Estimate — self-reported, no evidence',
  'label.tier2':
    'Evidence-backed self-assessment — not an independent Technology Readiness Assessment',
  'label.arl': 'Adoption readiness self-assessment — not reviewed or endorsed by DOE',
  'label.arlTarget': 'Target — planned, not achieved',
  'disclaimer.trl':
    '{app} produces a self-assessment only. It is not an independent Technology Readiness Assessment (TRA), not an audit, and not a certification. Results depend entirely on the information the user enters; nothing is verified by the tool. Assessment criteria differ between agencies and programmes — check the criteria and sources before using a result in any formal submission.',
  'disclaimer.arl':
    '{app} produces a self-assessment only. The ARL figures apply the DOE Adoption Readiness Assessment rubric to the ratings you enter: nothing is verified by the tool, and DOE does not review or endorse the result. The source calls the numerical score optional and warns against false precision — the risk profile, not the number, shows where the barriers are. ARL complements TRL; this tool never combines the two into one figure.',
  'notice.sensitive':
    'Do not enter controlled, classified, export-controlled or otherwise sensitive information. This tool runs in your browser on a public static site; use "Sensitive — reference only" evidence entries to point at such material instead of attaching it.',
  'notice.dismiss': 'Dismiss',
  'sourceText.note':
    'Criteria, screening questions and rubric text are shown in English, exactly as their sources publish them.',

  'trl.belowOne': '< TRL 1',
  'trl.level': 'TRL {level}',

  'answer.Yes': 'Yes',
  'answer.No': 'No',
  'answer.Unsure': 'Unsure',
  'consistency.High': 'High',
  'consistency.Medium': 'Medium',
  'consistency.Low': 'Low',

  'status.Met': 'Met',
  'status.Partially met': 'Partially met',
  'status.Not met': 'Not met',
  'status.N/A': 'N/A',
  'status.Not assessed': 'Not assessed',
  'status.Satisfied': 'Satisfied',

  'kind.hardware': 'hardware',
  'kind.software': 'software',
  'kind.process': 'process',

  'evidenceType.Document': 'Document',
  'evidenceType.Test data': 'Test data',
  'evidenceType.Code repository': 'Code repository',
  'evidenceType.Drawing/CAD': 'Drawing/CAD',
  'evidenceType.Photo/Video': 'Photo/Video',
  'evidenceType.Publication (DOI)': 'Publication (DOI)',
  'evidenceType.Web link': 'Web link',
  'evidenceType.Other': 'Other',
  'marking.Public': 'Public',
  'marking.Internal (unrestricted)': 'Internal (unrestricted)',
  'marking.Sensitive — reference only': 'Sensitive — reference only',
  'verification.Unverified': 'Unverified',
  'verification.Verified': 'Verified',
  'verification.Rejected': 'Rejected',

  'rating.Low': 'Low',
  'rating.Medium': 'Medium',
  'rating.High': 'High',
  'rating.N/A': 'N/A',
  'rating.Unsure': 'Unsure',
  'rating.Not assessed': 'Not assessed',
  'risk.Low': 'Low risk',
  'risk.Medium': 'Medium risk',
  'risk.High': 'High risk',

  'tier1.flag.gap':
    'Higher level claimed while a lower level is not confirmed: {levels} not confirmed.',
  'tier1.flag.unsure':
    '"Unsure" was selected at {levels}. An "Unsure" answer never counts as a "Yes", so the estimate stays at or below that level.',
  'tier1.flag.noAnswers': 'No screening questions have been answered yet.',

  'tier2.systemNote':
    'Conservative summary (minimum of critical CTEs). This is a reporting convention, not a mandated formula.',
  'tier2.noCritical': 'Not computed — mark at least one CTE as critical',
  'tier2.noMandatory': 'No mandatory criteria — needs assessor confirmation',
  'tier2.warn.metNoEvidenceMandatory':
    'Marked "Met" but no evidence is linked (or all linked evidence is Rejected). A mandatory criterion is not satisfied without evidence.',
  'tier2.warn.metNoEvidenceOptional':
    'Marked "Met" but no evidence is linked (or all linked evidence is Rejected). It does not count towards completeness.',
  'tier2.warn.naNoJustification': '"N/A" needs a justification before it can count as satisfied.',
  'tier2.reason.Met': 'Marked "Met" but no usable evidence is linked.',
  'tier2.reason.Partially met': 'Partially met — a partial result never satisfies a criterion.',
  'tier2.reason.Not met': 'Not met.',
  'tier2.reason.N/A': 'Marked "N/A" without a justification.',
  'tier2.reason.Not assessed': 'Not assessed yet.',
  'tier2.delta.lower':
    'The evidence-based assessment is markedly lower than the quick estimate. That is the usual direction: Tier 2 requires evidence for every claim, counts a level only when all lower levels are achieved, and takes the minimum across critical CTEs. Check which CTE is limiting and which criteria still lack evidence.',
  'tier2.delta.higher':
    'The evidence-based assessment is markedly higher than the quick estimate. Check whether the quick estimate answered "Unsure" or "No" at a low level, and whether every CTE marked critical really is critical.',

  'arl.flag.unsure':
    '"Unsure" at {ids} — counted as High risk. An unsure rating never counts as a lower risk.',
  'arl.flag.notAssessed': 'Not assessed: {count} of {total} ({ids}) — counted as High risk.',
  'arl.flag.naWithoutRationale':
    'N/A without a rationale at {ids} — counted as High risk until the rationale says why the dimension does not apply.',
  'arl.flag.noRationale':
    'Rated without a rationale: {ids}. The source asks for the rationale and details behind every rating.',
  'arl.flag.noPlan':
    'Risk reduction targeted without a planned action: {ids}. Say what the project will do to get there.',
  'arl.reason.Unsure': 'Unsure — counted as High risk',
  'arl.reason.Not assessed': 'Not assessed — counted as High risk',
  'arl.reason.N/A': 'N/A without a rationale — counted as High risk until one is recorded',
  'flags.none': 'No flags raised.',
} as const;
