# Methodology

Every rule below is implemented exactly as written, in `src/domain/tier1.ts` and
`src/domain/tier2.ts`, and each has a named test. Nothing is weighted; nothing is inferred.

## Tier 1 rules

| Rule                               | What it does                                                                                                                                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Estimated TRL** (the headline)   | The highest level L where L _and every level below it_ were answered "Yes". If TRL 1 is not "Yes", the result is "< TRL 1".                     |
| **Highest level claimed**          | The highest single "Yes", scanning from 9 down, ignoring gaps.                                                                                  |
| **"Unsure" never counts as "Yes"** | Neither does "No". An honest "Unsure" at TRL 3 caps the estimate at TRL 2 — if you are not sure it was demonstrated, you cannot claim it.       |
| **Gap flag**                       | Raised when the highest claim sits above the estimate; the message names the missing levels. Common, and not an error — but it must be visible. |
| **Unsure flag**                    | Raised when any answer at or below the highest claim is "Unsure".                                                                               |

**Cross-check.** Build maturity (B0–B5) × environment (E0–E4) suggests a TRL. It is a **heuristic
aid built for this tool, not a standard**, and never changes your result — it only feeds the
consistency rating.

:::figure cross-check-matrix:::

**Consistency rating.** _High_: no flags and the cross-check within 1 of the estimate. _Low_: the
cross-check differs by 3 or more, or a gap covering 2+ levels. _Medium_: everything else. It
describes **internal consistency only** — a perfectly consistent set of wrong answers rates High.

## Tier 2 rules

**Applicability.** A criterion applies unless it declares kinds (`hardware`, `software`, `process`)
that exclude the CTE's kind. A CTE with no kind set gets everything.

**Satisfied.** Either status **Met** with at least one linked evidence item not marked _Rejected_,
or status **N/A** with a non-empty justification.

:::figure evidence-decision:::

:::figure status-legend:::

_Partially met_ is not a fraction of a level; it is a statement that the criterion has not been met.

**Evidence requirement.** For a mandatory criterion, "Met" without usable evidence is **not
satisfied** — the interface says so. For an optional one it raises a warning and does not count
towards completeness.

**Level achieved.** Every applicable _mandatory_ criterion at L is satisfied **and** level L−1 is
achieved. Level 0 counts as achieved, so nothing blocks TRL 1. A level whose predecessor is not
achieved shows as _locked_.

If a level has **no** applicable mandatory criteria, it is achieved only if at least one applicable
criterion is satisfied, and it is flagged "No mandatory criteria — needs assessor confirmation".
That flag matters: the generic `dod-tra-2025` framework marks nothing mandatory, because its source
does not classify criteria that way.

**CTE TRL.** The highest achieved level; 0 shows as "< TRL 1".

**Next-level completeness.** At the level above: satisfied applicable criteria ÷ applicable criteria,
excluding N/A.

**System summary.** The **minimum** across CTEs marked _critical_, naming the limiting one(s). With
no critical CTE, nothing is computed. A conservative reporting convention, not a mandated formula.

**Evidence coverage.** Per CTE: _Met_ criteria with at least one non-rejected evidence item ÷ _Met_
criteria.

**Tier delta.** Tier 2 summary minus Tier 1 estimate; a difference of 2 or more comes with an
explanation.

Evidence _type_ is never weighted — a DOI counts no more than a test record — and verification
matters only through the _Rejected_ exclusion. Both tiers carry their honest label on every result
and in every export.

## Worked example 1 — a clean Tier 1

Yes at TRL 1–4, Unsure at 5, No above. Build B2, environment E2.

:::figure tier1-clean:::

No gap flag; the "Unsure" sits above the highest claim so no unsure flag either. The estimate is
coherent, and the open question is TRL 5 — which the team already knows.

## Worked example 2 — a gap flag

Yes at 1, No at 2, Yes at 3 and 4, No above. Build B1, environment E1 (cross-check 3).

:::figure tier1-gap:::

Consistency **Medium** (a single-level gap). Reading: the team has done TRL 3–4 work but never
formulated the concept and application at TRL 2 — more often, never wrote it down. Usually an
afternoon with a document, not a laboratory.

## Worked example 3 — one CTE limits the system

Three critical CTEs: a harvester, a power converter, telemetry firmware.

:::figure tier2-system:::

The converter fails the FMECA criterion at TRL 4; the firmware is only _Partially met_ on module
integration. The gap list says exactly what would move the system to 4 — extend the FMECA, finish
the integration.
