/** About page. Framework names, descriptions and source titles come from data and stay as they are. */
export const about = {
  'about.title': 'About {app}',
  'about.lead':
    'A two-tier Technology Readiness Level self-assessment tool. Tier 1 gives a quick, self-reported estimate; Tier 2 produces an evidence-backed assessment of Critical Technology Elements, exportable to Excel and packageable with the evidence files and a SHA-256 manifest. Everything runs in your browser — there is no backend, no account and no telemetry.',
  'about.build.heading': 'Build',
  'about.build.version': 'Version',
  'about.build.sha': 'Git SHA',
  'about.build.time': 'Built at (UTC)',
  'about.build.license': 'License',
  'about.build.source': 'Source',
  'about.build.changelog': 'Changelog',
  'about.build.contact': 'Contact',
  'about.build.issue': 'Open an issue',
  'about.frameworks.heading': 'Frameworks in this build',
  'about.frameworks.sources': 'Sources: {list}',
  'about.frameworks.arl.name': 'ARL side module — {title}',
  'about.frameworks.arl.body':
    "Adoption readiness, scored apart from TRL: the DOE rubric's 17 adoption-risk dimensions and its look-up table, transcribed verbatim.",
  'about.frameworks.arl.link': 'How it works',
  'about.frameworks.arl.source': 'Source: {id} ({version})',
  'about.frameworks.more': 'What each framework contains, and its limitations →',
  'about.sources.heading': 'Sources',
  'about.sources.id': 'Id',
  'about.sources.document': 'Document',
  'about.sources.use': 'Use',
  'about.sources.quotable': 'Quotable (public domain)',
  'about.sources.reference': 'Reference only',
  'about.disclaimer.heading': 'Disclaimer',
  'about.disclaimer.tier1': 'Tier 1 results are labelled “{label}”.',
  'about.disclaimer.tier2': 'Tier 2 results are labelled “{label}”.',
  'about.disclaimer.arl': 'ARL results are labelled “{label}”.',
  'about.disclaimer.matrix':
    'The build × environment matrix is a heuristic aid created for this tool, not a standard.',
  'about.disclaimer.system':
    'The system summary is the minimum across critical CTEs — a conservative reporting convention, not a mandated formula.',
  'about.disclaimer.unverified': 'Nothing you enter is verified by the tool.',
} as const;
