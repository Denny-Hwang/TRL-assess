/**
 * Stable, collision-free id generators (BUILD_SPEC Phase 2, task 8).
 */
const EVIDENCE_PREFIX = 'EV-';
const CTE_PREFIX = 'CTE-';

function nextNumber(existing: readonly string[], prefix: string): number {
  let max = 0;
  for (const id of existing) {
    if (!id.startsWith(prefix)) continue;
    const n = Number.parseInt(id.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return max + 1;
}

/** EV-0001, EV-0002, … — never reuses an id that is already present. */
export function nextEvidenceId(existing: readonly string[]): string {
  return `${EVIDENCE_PREFIX}${String(nextNumber(existing, EVIDENCE_PREFIX)).padStart(4, '0')}`;
}

/** CTE-01, CTE-02, … */
export function nextCteId(existing: readonly string[]): string {
  return `${CTE_PREFIX}${String(nextNumber(existing, CTE_PREFIX)).padStart(2, '0')}`;
}

/** Placeholder evidence ids used in the exported workbook (EV-P001 …). */
export function placeholderEvidenceId(index: number): string {
  return `EV-P${String(index).padStart(3, '0')}`;
}

/** Opaque key for an evidence blob in IndexedDB. */
export function blobKeyFor(evidenceId: string): string {
  return `blob:${evidenceId}`;
}
