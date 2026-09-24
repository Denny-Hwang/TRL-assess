/**
 * Guide pages. Markdown lives in src/content/guide/*.md and is imported as raw text so the
 * prose can be reviewed and edited without touching any component.
 */
import overview from './overview.md?raw';
import howToUse from './how-to-use.md?raw';
import methodology from './methodology.md?raw';
import cte from './cte.md?raw';
import evidence from './evidence.md?raw';
import excel from './excel.md?raw';
import frameworks from './frameworks.md?raw';
import arl from './arl.md?raw';
import marineAndOcean from './marine-and-ocean.md?raw';
import stageCrosswalk from './stage-crosswalk.md?raw';
import faq from './faq.md?raw';
import glossary from './glossary.md?raw';

export interface GuidePage {
  slug: string;
  title: string;
  summary: string;
  body: string;
}

export const GUIDE_PAGES: GuidePage[] = [
  {
    slug: 'overview',
    title: 'Overview',
    summary: 'What TRLs are, where the 1–9 scale came from, and where this tool fits.',
    body: overview,
  },
  {
    slug: 'how-to-use',
    title: 'How to use this tool',
    summary: 'Step by step through both tiers, plus saving, resuming and clearing data.',
    body: howToUse,
  },
  {
    slug: 'methodology',
    title: 'Methodology',
    summary: 'Every scoring rule in plain language, with three worked examples.',
    body: methodology,
  },
  {
    slug: 'cte',
    title: 'Critical Technology Elements',
    summary: 'How to decompose a system into CTEs, with examples and common mistakes.',
    body: cte,
  },
  {
    slug: 'evidence',
    title: 'Evidence',
    summary: 'What counts as evidence, good and weak examples, markings and verification.',
    body: evidence,
  },
  {
    slug: 'excel',
    title: 'Excel output',
    summary: 'Both workbooks sheet by sheet, and how the placeholders work.',
    body: excel,
  },
  {
    slug: 'frameworks',
    title: 'Frameworks & sources',
    summary: 'What each framework contains, where it comes from, and its limitations.',
    body: frameworks,
  },
  {
    slug: 'arl',
    title: 'Adoption readiness (ARL)',
    summary: 'The ARL side module: 17 adoption-risk dimensions and the look-up table.',
    body: arl,
  },
  {
    slug: 'marine-and-ocean',
    title: 'Marine & ocean tailoring',
    summary: 'What "relevant environment" means at sea, and related readiness scales.',
    body: marineAndOcean,
  },
  {
    slug: 'stage-crosswalk',
    title: 'Stage crosswalk',
    summary: 'A sensor development-stage model mapped to TRL — informational only.',
    body: stageCrosswalk,
  },
  { slug: 'faq', title: 'FAQ', summary: 'Fifteen questions people actually ask.', body: faq },
  {
    slug: 'glossary',
    title: 'Glossary',
    summary: 'TRL, TRA, CTE, relevant environment, TPL, MRL, IRL, SRL, ARL and more.',
    body: glossary,
  },
];

export function findGuidePage(slug: string): GuidePage | undefined {
  return GUIDE_PAGES.find((p) => p.slug === slug);
}
