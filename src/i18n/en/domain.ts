/** Labels, disclaimers and scoring messages shared by the pages and the workbooks. */
export const domain = {
  'label.tier1': 'Estimate — self-reported, no evidence',
  'label.tier2':
    'Evidence-backed self-assessment — not an independent Technology Readiness Assessment',
  'label.arl': 'Adoption readiness self-assessment — not reviewed or endorsed by DOE',
  'label.arlTarget': 'Target — planned, not achieved',
  'disclaimer.trl':
    '{app} produces a self-assessment only — not an independent Technology Readiness Assessment (TRA), an audit or a certification. Nothing you enter is verified; criteria differ between agencies, so check them before formal use.',
  'disclaimer.arl':
    '{app} produces a self-assessment only. The ARL applies the DOE rubric to your ratings; nothing is verified by the tool, and DOE does not review or endorse the result.',
  'notice.sensitive':
    'This is a public site: do not enter controlled, classified, export-controlled or otherwise sensitive information. Point to such material with a "Sensitive — reference only" evidence entry instead.',
  'notice.dismiss': 'Dismiss',
  'sourceText.note':
    'Criteria, questions and rubric text are shown in English as published; text in parentheses is an unofficial translation.',

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
    'Lowest TRL among critical CTEs — a conservative convention, not a mandated formula.',
  'tier2.noCritical': 'Not computed — mark at least one CTE as critical',
  'tier2.noMandatory': 'No mandatory criteria — needs assessor confirmation',
  'tier2.warn.metNoEvidenceMandatory':
    'Marked "Met" without usable evidence — a mandatory criterion is not satisfied until evidence is linked.',
  'tier2.warn.metNoEvidenceOptional': 'Marked "Met" without usable evidence — it does not count.',
  'tier2.warn.naNoJustification': '"N/A" needs a justification before it can count as satisfied.',
  'tier2.reason.Met': 'Marked "Met" but no usable evidence is linked.',
  'tier2.reason.Partially met': 'Partially met — a partial result never satisfies a criterion.',
  'tier2.reason.Not met': 'Not met.',
  'tier2.reason.N/A': 'Marked "N/A" without a justification.',
  'tier2.reason.Not assessed': 'Not assessed yet.',
  'tier2.reason.naOnly':
    'N/A cannot establish a level on its own — at least one criterion at this level must be Met with usable evidence.',
  'tier2.delta.lower':
    'The evidence-based result is well below the quick estimate. Check the limiting CTE and the criteria still lacking evidence.',
  'tier2.delta.higher':
    'The evidence-based result is well above the quick estimate. Check low-level "Unsure" or "No" answers, and whether each critical CTE is really critical.',

  'arl.flag.unsure':
    '"Unsure" at {ids} — counted as High risk. An unsure rating never counts as a lower risk.',
  'arl.flag.notAssessed': 'Not assessed: {count} of {total} ({ids}) — counted as High risk.',
  'arl.flag.naWithoutRationale':
    'N/A without a rationale at {ids} — counted as High risk until a reason is given.',
  'arl.flag.noRationale':
    'Rated without a rationale: {ids}. The source asks for a rationale behind every rating.',
  'arl.flag.noPlan':
    'Target set without a planned action: {ids}. Say how the project will get there.',
  'arl.reason.Unsure': 'Unsure — counted as High risk',
  'arl.reason.Not assessed': 'Not assessed — counted as High risk',
  'arl.reason.N/A': 'N/A without a rationale — counted as High risk until one is recorded',
  'flags.none': 'No flags raised.',
} as const;
