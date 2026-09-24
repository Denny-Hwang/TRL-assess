/**
 * Guide pages. Markdown lives in src/content/guide/*.md and is imported as raw text so the
 * prose can be reviewed and edited without touching any component.
 *
 * Translations: a page body may also exist as src/content/guide/<lang>/<slug>.md. English ships
 * with the Guide chunk; every other language is loaded on demand, one page at a time, so adding a
 * translation never grows the Guide chunk. Titles and summaries are messages
 * (guide.page.<slug>.title / .summary) and translate with the interface catalogs.
 */
import type { MessageKey } from '@/i18n/en';
import type { Lang } from '@/i18n/languages';
import { EN } from '@/i18n/translate';
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
  titleKey: MessageKey;
  summaryKey: MessageKey;
  /** English title and summary, for code that runs outside the interface language. */
  title: string;
  summary: string;
  /** English markdown. */
  body: string;
}

type GuidePageEntry = Omit<GuidePage, 'title' | 'summary'>;

const ENTRIES: GuidePageEntry[] = [
  {
    slug: 'overview',
    titleKey: 'guide.page.overview.title',
    summaryKey: 'guide.page.overview.summary',
    body: overview,
  },
  {
    slug: 'how-to-use',
    titleKey: 'guide.page.how-to-use.title',
    summaryKey: 'guide.page.how-to-use.summary',
    body: howToUse,
  },
  {
    slug: 'methodology',
    titleKey: 'guide.page.methodology.title',
    summaryKey: 'guide.page.methodology.summary',
    body: methodology,
  },
  {
    slug: 'cte',
    titleKey: 'guide.page.cte.title',
    summaryKey: 'guide.page.cte.summary',
    body: cte,
  },
  {
    slug: 'evidence',
    titleKey: 'guide.page.evidence.title',
    summaryKey: 'guide.page.evidence.summary',
    body: evidence,
  },
  {
    slug: 'excel',
    titleKey: 'guide.page.excel.title',
    summaryKey: 'guide.page.excel.summary',
    body: excel,
  },
  {
    slug: 'frameworks',
    titleKey: 'guide.page.frameworks.title',
    summaryKey: 'guide.page.frameworks.summary',
    body: frameworks,
  },
  {
    slug: 'arl',
    titleKey: 'guide.page.arl.title',
    summaryKey: 'guide.page.arl.summary',
    body: arl,
  },
  {
    slug: 'marine-and-ocean',
    titleKey: 'guide.page.marine-and-ocean.title',
    summaryKey: 'guide.page.marine-and-ocean.summary',
    body: marineAndOcean,
  },
  {
    slug: 'stage-crosswalk',
    titleKey: 'guide.page.stage-crosswalk.title',
    summaryKey: 'guide.page.stage-crosswalk.summary',
    body: stageCrosswalk,
  },
  {
    slug: 'faq',
    titleKey: 'guide.page.faq.title',
    summaryKey: 'guide.page.faq.summary',
    body: faq,
  },
  {
    slug: 'glossary',
    titleKey: 'guide.page.glossary.title',
    summaryKey: 'guide.page.glossary.summary',
    body: glossary,
  },
];

export const GUIDE_PAGES: GuidePage[] = ENTRIES.map((p) => ({
  ...p,
  title: EN.t(p.titleKey),
  summary: EN.t(p.summaryKey),
}));

export function findGuidePage(slug: string): GuidePage | undefined {
  return GUIDE_PAGES.find((p) => p.slug === slug);
}

/** Translated page bodies, keyed './<lang>/<slug>.md'; each one is its own lazily loaded chunk. */
const TRANSLATED = import.meta.glob<string>('./*/*.md', { query: '?raw', import: 'default' });

/** True when a translated body exists for this page and language (English always has one). */
export function hasGuideTranslation(slug: string, lang: Lang): boolean {
  return lang === 'en' || `./${lang}/${slug}.md` in TRANSLATED;
}

/**
 * The page body in the given language, or undefined when that language has no translation of the
 * page (the caller then shows the English body with a notice).
 */
export async function loadGuideBody(slug: string, lang: Lang): Promise<string | undefined> {
  if (lang === 'en') return findGuidePage(slug)?.body;
  const load = TRANSLATED[`./${lang}/${slug}.md`];
  return load ? load() : undefined;
}
