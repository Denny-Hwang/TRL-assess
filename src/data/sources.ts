/**
 * Machine-readable mirror of docs/sources/SOURCES.md. The validator checks that every
 * `source.sourceId` used by a framework appears here, and that `verbatim` text is only ever
 * attributed to a public-domain, quotable document.
 */
import type { SourceDoc } from '@/domain/schemas';

export const SOURCES: SourceDoc[] = [
  {
    id: 'eere-r540-112-02',
    title: 'Technology Readiness Levels (TRLs)',
    issuer: 'U.S. DOE, Office of Energy Efficiency and Renewable Energy',
    version: 'EERE R 540.112-02 (template version 11/17/15; PDF created 2022-08-26)',
    url: 'https://www.energy.gov/sites/default/files/2022-08/EERE_R_540.112-02_Technology_Readiness_Levels_%28TRLs%29.pdf',
    retrieved: '2026-09-16',
    publicDomain: true,
    quotable: true,
    note: 'Defines TRL 1 through TRL 8 only; the document contains no TRL 9 definition.',
  },
  {
    id: 'dod-tra-2025',
    title: 'Technology Readiness Assessment Guidebook',
    issuer: 'U.S. Department of Defense, OUSD(R&E)',
    version: 'February 2025, v2 (cleared for public release)',
    url: 'https://www.cto.mil/wp-content/uploads/2025/03/TRA-Guide-Feb2025.v2-Cleared.pdf',
    retrieved: '2026-09-16',
    publicDomain: true,
    quotable: true,
  },
  {
    id: 'dod-mrl-matrix-2018',
    title: 'Manufacturing Readiness Level (MRL) Matrix',
    issuer: 'U.S. Department of Defense',
    version: 'V2018',
    url: 'https://www.dodmrl.com/',
    retrieved: '2026-09-16',
    publicDomain: true,
    quotable: false,
    note: 'Reference only — MRLs are not scored by this tool.',
  },
  {
    id: 'nrel-me-risk',
    title: 'Marine Energy Technology Development Risk Management Framework',
    issuer: 'NREL for DOE Water Power Technologies Office',
    version: 'report number to be confirmed',
    publicDomain: true,
    quotable: false,
    note: 'Not obtained. Cited as the basis of tailored rationales only; no text is reproduced.',
  },
  {
    id: 'nrel-tpl',
    title: 'Technology Performance Level (TPL) Assessment',
    issuer: 'NREL',
    url: 'https://tpl.nrel.gov/',
    publicDomain: true,
    quotable: false,
    note: 'Reference only.',
  },
  {
    id: 'iso-16290',
    title:
      'ISO 16290:2013, Space systems — Definition of the Technology Readiness Levels (TRLs) and their criteria of assessment',
    issuer: 'ISO',
    version: '2013',
    publicDomain: false,
    quotable: false,
    note: 'Cite by clause number only. Never reproduce ISO text in this repository.',
  },
  {
    id: 'goos-foo',
    title: 'Framework for Ocean Observing',
    issuer: 'GOOS / UNESCO-IOC',
    url: 'https://goosocean.org/what-we-do/framework/',
    publicDomain: false,
    quotable: false,
    note: 'Reference only — readiness levels are referred to, never quoted.',
  },
  {
    id: 'doe-g413-3-4a',
    title: 'DOE G 413.3-4A, Technology Readiness Assessment Guide',
    issuer: 'U.S. DOE',
    version: '2011, chg 1 2015',
    url: 'https://www.directives.doe.gov/directives-documents/400-series/0413.3-EGuide-04a/@@images/file',
    publicDomain: true,
    quotable: true,
    note: 'Not obtained — the build environment blocks the issuing site. No content from this document is used.',
  },
  {
    id: 'gao-20-48g',
    title: 'GAO-20-48G, Technology Readiness Assessment Guide',
    issuer: 'U.S. GAO',
    version: 'January 2020',
    url: 'https://www.gao.gov/assets/gao-20-48g.pdf',
    publicDomain: true,
    quotable: true,
    note: 'Not obtained — the build environment blocks the issuing site. No content from this document is used.',
  },
];

export const SOURCES_BY_ID: Record<string, SourceDoc> = Object.fromEntries(
  SOURCES.map((s) => [s.id, s]),
);

/** Sources that a framework actually draws on, for the References sheet and the Guide. */
export function sourcesFor(ids: readonly string[]): SourceDoc[] {
  return ids.map((id) => SOURCES_BY_ID[id]).filter((s): s is SourceDoc => Boolean(s));
}
