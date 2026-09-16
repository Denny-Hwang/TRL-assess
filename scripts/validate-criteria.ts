#!/usr/bin/env tsx
/**
 * Framework validator (BUILD_SPEC Phase 1, task 5).
 *
 * Checks, for every framework in the registry:
 *   1. schema validity (zod)
 *   2. unique ids across Tier 1 and Tier 2
 *   3. every level 1–9 has ≥ 1 Tier 1 question and ≥ 1 Tier 2 criterion
 *   4. every item has a source; "verbatim" only from public-domain, quotable sources;
 *      "tailored" requires a rationale; "adapted" requires a rationale
 *   5. `refId` references across frameworks resolve
 *   6. no ISO body text — `iso-16290` may only be cited by clause, never quoted
 */
import { RAW_FRAMEWORKS } from '../src/data/frameworks/index.ts';
import { SOURCES_BY_ID } from '../src/data/sources.ts';
import { resolveFramework } from '../src/domain/frameworks.ts';
import { TRL_LEVELS } from '../src/domain/schemas.ts';

const errors: string[] = [];
const warnings: string[] = [];

function err(fw: string, msg: string) {
  errors.push(`[${fw}] ${msg}`);
}
function warn(fw: string, msg: string) {
  warnings.push(`[${fw}] ${msg}`);
}

for (const id of Object.keys(RAW_FRAMEWORKS)) {
  let resolved;
  try {
    resolved = resolveFramework(id);
  } catch (e) {
    err(id, `failed to load: ${e instanceof Error ? e.message : String(e)}`);
    continue;
  }

  const { framework, tier1, tier2 } = resolved;

  // 2. unique ids
  const seen = new Set<string>();
  for (const item of [...tier1, ...tier2]) {
    if (seen.has(item.id)) err(id, `duplicate id "${item.id}"`);
    seen.add(item.id);
  }

  // 3. coverage of levels 1–9
  for (const level of TRL_LEVELS) {
    if (!tier1.some((q) => q.level === level)) err(id, `no Tier 1 question for TRL ${level}`);
    if (!tier2.some((c) => c.level === level)) err(id, `no Tier 2 criterion for TRL ${level}`);
  }

  // framework.sources must be known
  for (const sourceId of framework.sources) {
    if (!SOURCES_BY_ID[sourceId]) err(id, `framework lists unknown source "${sourceId}"`);
  }

  // 4 + 6. provenance rules
  for (const item of [...tier1, ...tier2]) {
    const src = SOURCES_BY_ID[item.source.sourceId];
    if (!src) {
      err(id, `${item.id}: unknown source id "${item.source.sourceId}"`);
      continue;
    }
    if (!framework.sources.includes(item.source.sourceId)) {
      const base = framework.extends ? resolveFramework(framework.extends).framework.sources : [];
      if (!base.includes(item.source.sourceId)) {
        err(id, `${item.id}: source "${item.source.sourceId}" is not listed by the framework`);
      }
    }
    if (item.origin === 'verbatim') {
      if (!src.publicDomain || !src.quotable) {
        err(
          id,
          `${item.id}: origin "verbatim" is only allowed for public-domain, quotable sources ` +
            `("${src.id}" is publicDomain=${src.publicDomain}, quotable=${src.quotable})`,
        );
      }
      if (!item.source.page && !item.source.section) {
        err(id, `${item.id}: verbatim items need a section or page reference`);
      }
    }
    if (item.origin === 'tailored' && !item.rationale?.trim()) {
      err(id, `${item.id}: origin "tailored" requires a rationale`);
    }
    if (item.origin === 'adapted' && !item.rationale?.trim()) {
      err(id, `${item.id}: origin "adapted" requires a rationale explaining the adaptation`);
    }
    // 6. ISO may be cited by clause only — never with quoted text.
    if (item.source.sourceId === 'iso-16290') {
      if (item.origin !== 'tailored' || !item.source.clause) {
        err(id, `${item.id}: ISO 16290 may only be referenced by clause, never transcribed`);
      }
    }
  }

  // extra quality signals (not fatal)
  const noMandatory = TRL_LEVELS.filter((l) => !tier2.some((c) => c.level === l && c.mandatory));
  if (noMandatory.length) {
    warn(
      id,
      `levels without any mandatory criterion: ${noMandatory.join(', ')} — R2-4 will flag these ` +
        `as "No mandatory criteria — needs assessor confirmation"`,
    );
  }

  console.log(
    `✓ ${id} (${framework.version}) — ${tier1.length} Tier 1 questions, ${tier2.length} Tier 2 criteria`,
  );
}

for (const w of warnings) console.warn(`warning: ${w}`);

if (errors.length) {
  console.error(`\n${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`\nAll frameworks valid (${warnings.length} warning(s)).`);
