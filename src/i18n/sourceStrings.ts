/**
 * Every piece of English source content the interface can display: framework names and
 * descriptions, Tier 1 questions and help, the build × environment codes, Tier 2 criteria with
 * their guidance and rationale, and the ARL rubric. The reference translations in
 * src/i18n/source/<lang>.json must cover exactly this set (checked by tests/unit/i18n.test.ts).
 *
 * Used by tests and scripts only — the app itself looks translations up by the English text.
 */
import { RAW_FRAMEWORKS } from '@/data/frameworks';
import { RAW_ARL_FRAMEWORKS } from '@/data/frameworks/arl';

/** Fields whose string values are shown to the user. Ids, codes and citations are not. */
const DISPLAYED = new Set([
  'name',
  'shortDescription',
  'description',
  'disclaimer',
  'text',
  'helpText',
  'help',
  'label',
  'title',
  'guidance',
  'rationale',
  'note',
  'status',
  'mandatoryBasis',
  'Low',
  'Medium',
  'High',
]);

/** Containers that hold citations, not prose. */
const SKIPPED = new Set(['source', 'bandsSource', 'lookup', 'sources']);

function collect(value: unknown, into: Set<string>, field?: string): void {
  if (Array.isArray(value)) {
    for (const item of value) collect(item, into, field);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (!SKIPPED.has(key)) collect(child, into, key);
    }
    return;
  }
  if (typeof value === 'string' && field && DISPLAYED.has(field) && /[A-Za-z]/.test(value)) {
    into.add(value.trim());
  }
}

export function collectSourceStrings(): string[] {
  const strings = new Set<string>();
  for (const bundle of Object.values(RAW_FRAMEWORKS)) collect(bundle, strings);
  for (const rubric of Object.values(RAW_ARL_FRAMEWORKS)) collect(rubric, strings);
  return [...strings].sort();
}
