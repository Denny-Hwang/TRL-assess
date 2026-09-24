# Methodology

Every rule below is applied exactly as written. Nothing is weighted and nothing is inferred.

## Tier 1 rules

| Rule                               | What it does                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Estimated TRL** (the headline)   | The highest level L where L _and every level below it_ were answered "Yes". If TRL 1 is not "Yes", it is "< TRL 1". |
| **Highest level claimed**          | The highest single "Yes", ignoring gaps.                                                                            |
| **"Unsure" never counts as "Yes"** | Neither does "No". An "Unsure" at TRL 3 caps the estimate at TRL 2.                                                 |
| **Gap flag**                       | Raised when the highest claim is above the estimate; it names the levels not confirmed.                             |
| **Unsure flag**                    | Raised when any answer at or below the highest claim is "Unsure".                                                   |

**Cross-check.** Build maturity (B0–B5) × environment (E0–E4) suggests a TRL. It is a heuristic aid
built for this tool, not a standard, and it never changes your result — it only feeds the
consistency rating.

:::figure cross-check-matrix:::

**Consistency rating.** _Low_: the cross-check differs from the estimate by 3 or more, or a gap
covers 2 or more levels. _High_: no gap or unsure flag and the cross-check within 1 of the estimate.
_Medium_: everything else. It rates internal consistency only, not accuracy.

## Tier 2 rules

**Applicability.** A criterion applies unless it lists kinds (`hardware`, `software`, `process`)
that exclude the CTE's kind. A CTE with no kind set gets every criterion.

**Satisfied.** Status **Met** with at least one linked evidence item not marked _Rejected_, or status
**N/A** with a non-empty justification. _Partially met_, _Not met_ and _Not assessed_ are never
satisfied.

:::figure evidence-decision:::

**Met without evidence.** Never satisfied. For a mandatory criterion the interface says so; for an
optional one it raises a warning.

**Level achieved.** Every applicable _mandatory_ criterion at L is satisfied **and** level L−1 is
achieved (level 0 always counts). A level above an unachieved one shows as _locked_.

If a level has **no** applicable mandatory criteria, it is achieved when at least one applicable
criterion is satisfied, and it is flagged "No mandatory criteria — needs assessor confirmation". The
`dod-tra-2025` framework marks nothing mandatory, so this applies to every level there.

**CTE TRL.** The highest achieved level; 0 shows as "< TRL 1".

**Next-level completeness.** At the level above: satisfied applicable criteria ÷ applicable criteria,
both excluding N/A.

**System summary.** The **minimum** TRL across CTEs marked _critical_, naming the limiting one(s).
With no critical CTE, nothing is computed. This is a reporting convention, not a mandated formula.

**Evidence coverage.** Per CTE: _Met_ criteria with at least one non-rejected evidence item ÷ _Met_
criteria.

**Tier delta.** Tier 2 summary minus Tier 1 estimate; a difference of 2 or more comes with an
explanation.

Evidence type is never weighted, and _Verified_ adds nothing — only _Rejected_ changes the score.

## Worked example 1 — a clean Tier 1

Yes at TRL 1–4, Unsure at 5, No above. Build B2, environment E2.

:::figure tier1-clean:::

No gap flag, and the "Unsure" sits above the highest claim, so no unsure flag either.

## Worked example 2 — a gap flag

Yes at 1, No at 2, Yes at 3 and 4, No above. Build B1, environment E1 (cross-check 3).

:::figure tier1-gap:::

Consistency is **Medium**: a one-level gap. Often TRL 2 was done but never written down.

## Worked example 3 — one CTE limits the system

A remote sensor node with three critical CTEs: an energy harvester, a power management module and
telemetry firmware.

:::figure tier2-system:::

The power management module and the firmware have not achieved TRL 4, so the system summary is
TRL 3 and both are named as limiting. The gap list shows what each still needs at TRL 4.
