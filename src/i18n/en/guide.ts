/** Guide: navigation, figures and diagrams. Page bodies are markdown, translated per file. */
export const guide = {
  'guide.nav.label': 'Guide',
  'guide.nav.heading': 'Guide',
  'guide.index.title': 'Guide',
  'guide.toc': 'On this page',
  'guide.previous': '← {title}',
  'guide.next': '{title} →',
  'guide.untranslated': 'This page is not yet available in your language; showing English.',

  // Figures embedded in the guide (src/features/guide/figures.tsx).
  'guide.fig.unknown': 'Unknown figure “{id}”.',
  'guide.fig.trlScale.marker': 'highest confirmed',
  'guide.fig.trlScale.label':
    'The nine levels. A level counts only when every level below it is confirmed.',
  'guide.fig.trlScale.caption':
    'The chain, not the highest claim: TRL 4 here even if TRL 6 was answered “yes”.',
  'guide.fig.tier1.estimate': 'estimate',
  'guide.fig.tier1.crossCheck': 'cross-check',
  'guide.fig.tier1Clean.label':
    'Worked example 1: yes at TRL 1 to 4, unsure at 5. Estimate TRL 4; cross-check TRL 5; consistency high.',
  'guide.fig.tier1Clean.caption.before': 'Example 1 — yes up to 4, unsure at 5. Estimate ',
  'guide.fig.tier1Clean.caption.middle': ', cross-check 5, consistency ',
  'guide.fig.tier1Clean.caption.after': '.',
  'guide.fig.tier1Gap.claimed': 'claimed',
  'guide.fig.tier1Gap.label':
    'Worked example 2: yes at TRL 1, no at 2, yes at 3 and 4. The chain breaks at TRL 2, so the estimate is TRL 1 while TRL 4 was claimed.',
  'guide.fig.tier1Gap.caption.before':
    'Example 2 — the hatched rung is TRL 2, answered “no”. Estimate ',
  'guide.fig.tier1Gap.caption.after': ', highest claim 4, gap flag raised.',
  'guide.fig.tier2.harvester': 'Energy harvester',
  'guide.fig.tier2.converter': 'Power management module',
  'guide.fig.tier2.firmware': 'Telemetry firmware',
  'guide.fig.tier2.cteLabel': '{name}: {trl}',
  'guide.fig.tier2.limiting': '◀ limits the system',
  'guide.fig.tier2.caption.before': 'Example 3 — the system summary is ',
  'guide.fig.tier2.caption.formula': 'min(4, 3, 3) = TRL 3',
  'guide.fig.tier2.caption.after': '. Nothing is averaged.',
  'guide.fig.statusLegend.caption':
    'Only the first two count towards a level: “Met” with usable evidence, and “N/A” with a justification.',
  'guide.fig.arlLookup.mark': 'Example',
  'guide.fig.arlLookup.caption.before':
    'Example — three Medium-risk and one High-risk dimension read as ',
  'guide.fig.arlLookup.caption.value': 'ARL 6',
  'guide.fig.arlLookup.caption.after': '. High risks weigh heaviest.',

  // CTE decomposition tree. "\n" marks where a box label wraps onto its second line.
  'guide.fig.cte.label':
    'A remote sensor node split into five elements: energy harvester, power management, telemetry firmware, enclosure and sealing — all critical — and the installation procedure, which is a process and not critical here.',
  'guide.fig.cte.system': 'Remote sensor node (system)',
  'guide.fig.cte.harvester': 'Energy\nharvester',
  'guide.fig.cte.power': 'Power\nmanagement',
  'guide.fig.cte.firmware': 'Telemetry\nfirmware',
  'guide.fig.cte.enclosure': 'Enclosure\n& sealing',
  'guide.fig.cte.install': 'Installation\nprocedure',
  'guide.fig.cte.critical': 'critical',
  'guide.fig.cte.notCritical': 'not critical',
  'guide.fig.cte.caption':
    'Each element is assessed on its own; only critical ones count towards the system summary.',

  // Evidence decision diagram.
  'guide.fig.evidence.label':
    'How a criterion becomes satisfied: status Met plus at least one non-rejected evidence item, or status N/A with a justification. Partially met, Not met and Not assessed are never satisfied.',
  'guide.fig.evidence.criterion': 'Criterion',
  'guide.fig.evidence.linked': 'evidence linked?',
  'guide.fig.evidence.justified': 'justification?',
  'guide.fig.evidence.other.line1': 'Partially / Not met /',
  'guide.fig.evidence.other.line2': 'Not assessed',
  'guide.fig.evidence.satisfied': '✓ Satisfied',
  'guide.fig.evidence.counts': 'counts towards the level',
  'guide.fig.evidence.notSatisfied': '✕ Not satisfied',
  'guide.fig.evidence.gapList': 'appears in the gap list',
  'guide.fig.evidence.caption':
    '“Met” with no usable evidence, and “N/A” with no justification, both fall to the lower path.',

  // Environment fidelity diagram.
  'guide.fig.env.label':
    'Environment fidelity rises from analysis only, through laboratory and a relevant environment that reproduces the key stresses, to a limited operational trial and the full mission range. TRL 5 and 6 need a relevant environment; TRL 7 and 8 need the operational one.',
  'guide.fig.env.e0.name': 'Analysis only',
  'guide.fig.env.e0.note': 'models, no hardware',
  'guide.fig.env.e1.name': 'Laboratory',
  'guide.fig.env.e1.note': 'bench, ambient conditions',
  'guide.fig.env.e2.name': 'Relevant',
  'guide.fig.env.e2.note': 'key stresses reproduced',
  'guide.fig.env.e3.name': 'Operational (limited)',
  'guide.fig.env.e3.note': 'short field trial',
  'guide.fig.env.e4.name': 'Operational (full)',
  'guide.fig.env.e4.note': 'full mission range',
  'guide.fig.env.relevantNeed': 'TRL 5–6 need this',
  'guide.fig.env.operationalNeed': 'TRL 7–8 need this',
  'guide.fig.env.caption':
    'A test is a relevant environment only if it reproduces the stresses that matter for this element.',

  // Workbook sheet map. Sheet names are fixed workbook identifiers and are not translated.
  'guide.fig.sheets.label':
    'The Tier 1 workbook has {tier1Count} sheets: {tier1}. The Tier 2 workbook has {tier2Count}: {tier2}.',
  'guide.fig.sheets.tier1': 'Tier 1 workbook',
  'guide.fig.sheets.tier2': 'Tier 2 workbook',
  'guide.fig.sheets.caption': 'Sheet order is fixed, and every workbook opens on its README.',

  // Framework relation diagram. Framework ids and document titles are not translated.
  'guide.fig.frameworks.label':
    'dod-tra-2025, the default, holds the DoD criteria. marine-energy-eere extends it: it reuses the DoD criteria, adds eight marine tailoring items, and takes its Tier 1 questions from the EERE definitions, with TRL 9 from the DoD table.',
  'guide.fig.frameworks.dodCriteria': '58 criteria, verbatim',
  'guide.fig.frameworks.dodTables': 'hardware + software tables',
  'guide.fig.frameworks.extends': 'extends',
  'guide.fig.frameworks.default': '{id} (default)',
  'guide.fig.frameworks.marineCriteria': 'references the DoD criteria + 8 tailored items',
  'guide.fig.frameworks.marineMandatory': 'promotes the level-defining criterion to mandatory',
  'guide.fig.frameworks.marineQuestions': 'Tier 1 questions adapted from EERE R 540.112-02',
  'guide.fig.frameworks.dodPages': 'Tables 2-1 / 2-2, pp. 6–10',
  'guide.fig.frameworks.eere': 'EERE R 540.112-02 (TRL 1–8) + NREL / GOOS rationales',
  'guide.fig.frameworks.eereTrl9': 'TRL 9 comes from the DoD table — EERE defines no TRL 9',
  'guide.fig.frameworks.caption':
    'An extending framework can change how a criterion is used, never what its source says.',

  // Development-stage crosswalk.
  'guide.fig.stage.s0': 'Concept',
  'guide.fig.stage.s1': 'Component evaluation',
  'guide.fig.stage.s2': 'Proof of concept',
  'guide.fig.stage.s3': 'Breadboard',
  'guide.fig.stage.s4': 'Board-level (PCB)',
  'guide.fig.stage.s5': 'Integrated prototype',
  'guide.fig.stage.s6': 'Miniaturized',
  'guide.fig.stage.s7': 'Production-intent',
  'guide.fig.stage.s8': 'Pilot production',
  'guide.fig.stage.s9': 'Transfer / licensing',
  'guide.fig.stage.label': 'Development stages mapped to TRL ranges: {items}.',
  'guide.fig.stage.item': 'stage {stage} {name} covers TRL {from}',
  'guide.fig.stage.itemRange': 'stage {stage} {name} covers TRL {from} to {to}',
  'guide.fig.stage.separator': '; ',
  'guide.fig.stage.row': '{stage}. {name}',
  'guide.fig.stage.caption.before': 'Ranges are wide because a stage says what you ',
  'guide.fig.stage.caption.built': 'built',
  'guide.fig.stage.caption.middle': '; a TRL says what you ',
  'guide.fig.stage.caption.demonstrated': 'demonstrated, and where',
  'guide.fig.stage.caption.after':
    '. Stage models are organization-specific — not a basis for scoring.',

  // Guide page titles and summaries (the page bodies are markdown in src/content/guide).
  'guide.page.overview.title': 'Overview',
  'guide.page.overview.summary': 'What TRLs are, the nine levels, and where this tool fits.',
  'guide.page.how-to-use.title': 'How to use this tool',
  'guide.page.how-to-use.summary':
    'Step by step through both tiers and ARL, plus saving and clearing data.',
  'guide.page.methodology.title': 'Methodology',
  'guide.page.methodology.summary':
    'Every scoring rule in plain language, with three worked examples.',
  'guide.page.cte.title': 'Critical Technology Elements',
  'guide.page.cte.summary': 'How to decompose a system into CTEs, and common mistakes.',
  'guide.page.evidence.title': 'Evidence',
  'guide.page.evidence.summary':
    'What counts as evidence, good and weak examples, markings and verification.',
  'guide.page.excel.title': 'Excel output',
  'guide.page.excel.summary': 'The workbooks, and how to add evidence in Excel.',
  'guide.page.frameworks.title': 'Frameworks & sources',
  'guide.page.frameworks.summary': 'What each framework contains and where it comes from.',
  'guide.page.arl.title': 'Adoption readiness (ARL)',
  'guide.page.arl.summary':
    'The ARL side module: 17 adoption-risk dimensions and the look-up table.',
  'guide.page.stage-crosswalk.title': 'Stage crosswalk',
  'guide.page.stage-crosswalk.summary':
    'A hardware development-stage model mapped to TRL — informational only.',
  'guide.page.faq.title': 'FAQ',
  'guide.page.faq.summary': 'Common questions, answered briefly.',
  'guide.page.glossary.title': 'Glossary',
  'guide.page.glossary.summary': 'TRL, TRA, CTE, relevant environment, ARL, MRL, TPL and more.',
} as const;
