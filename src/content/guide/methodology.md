# Methodology

Every rule below is implemented exactly as written, in `src/domain/tier1.ts` and
`src/domain/tier2.ts`, and each has a named test. Nothing is weighted, and nothing is inferred.

## Tier 1 rules

**Estimated TRL (the headline).** The highest level L where level L _and every level below it_ were
answered "Yes". If TRL 1 is not "Yes", the result is "< TRL 1".

**Highest level claimed.** The highest single "Yes", scanning from 9 downwards, ignoring gaps.

**"Unsure" never counts as "Yes".** Neither does "No". An honest "Unsure" at TRL 3 caps the estimate
at TRL 2, which is the correct answer: if you are not sure the level was demonstrated, you cannot
claim it.

**Gap flag.** Raised when the highest level claimed is above the estimated TRL. The message names
the missing levels. A gap is not an error — it is common when a later demonstration happened before
an earlier one was written up — but it must be visible.

**Unsure flag.** Raised when any answer at or below the highest claimed level is "Unsure".

**Cross-check.** Your build maturity (B0–B5) and environment (E0–E4) are looked up in a matrix that
suggests a TRL. This matrix is a **heuristic aid created for this tool, not a standard**. It never
changes your result; it only feeds the consistency rating.

**Consistency rating.** _High_: no flags and the cross-check is within 1 of your estimate.
_Low_: the cross-check differs by 3 or more, or a gap flag covers 2 or more levels.
_Medium_: everything else. The rating describes **internal consistency only** — a perfectly
consistent set of wrong answers rates High.

**Label.** Always "Estimate — self-reported, no evidence".

## Tier 2 rules

**Applicability.** A criterion applies to a CTE unless it declares kinds (`hardware`, `software`,
`process`) that exclude the CTE's kind. A CTE with no kind set gets everything.

**Satisfied.** A criterion is satisfied when either:

- its status is **Met** _and_ at least one linked evidence item is not marked _Rejected_; or
- its status is **N/A** _and_ a non-empty justification is recorded.

_Partially met_, _Not met_ and _Not assessed_ are never satisfied. "Partially" is not a fraction of
a level; it is a statement that the criterion has not been met.

**Evidence requirement.** For a mandatory criterion, "Met" without usable evidence is **not
satisfied** — the tool says so in the interface. For an optional criterion the same situation raises
a warning and does not count towards completeness.

**Level achieved.** Level L is achieved when every applicable _mandatory_ criterion at L is
satisfied **and** level L−1 is achieved. Level 0 counts as achieved, so TRL 1 has nothing below it
to block it. A level whose predecessor is not achieved is shown as _locked_.

If a level has **no** applicable mandatory criteria, it is achieved only if at least one applicable
criterion at that level is satisfied, and it is flagged "No mandatory criteria — needs assessor
confirmation". That flag matters: the generic `dod-tra-2025` framework marks nothing mandatory,
because the source document does not classify its criteria that way.

**CTE TRL.** The highest achieved level; 0 is displayed as "< TRL 1".

**Next-level completeness.** At the level above the CTE's TRL: satisfied applicable criteria ÷
applicable criteria, excluding those marked N/A.

**System summary.** The **minimum** TRL across the CTEs marked _critical_, naming the limiting
CTE(s). If no CTE is marked critical, nothing is computed. This is a conservative reporting
convention, not a mandated formula: a system is rarely more mature than its least mature critical
part, but your programme may report differently.

**Evidence coverage.** Per CTE: criteria marked _Met_ that have at least one non-rejected evidence
item ÷ criteria marked _Met_.

**Tier delta.** Tier 2 system summary minus Tier 1 estimated TRL. A difference of 2 or more comes
with an explanation.

**Label.** Always "Evidence-backed self-assessment — not an independent Technology Readiness
Assessment".

Evidence _type_ is never weighted: a DOI does not count more than a test record. Verification status
matters only through the _Rejected_ exclusion.

## Worked example 1 — a clean Tier 1

A team answers Yes at TRL 1–4, Unsure at 5, No above. Build maturity B2 (component prototype),
environment E2 (relevant).

- Estimated TRL: **4**.
- Highest claimed: 4. No gap flag.
- Unsure flag: not raised — the "Unsure" is at TRL 5, above the highest claim.
- Cross-check: B2 × E2 → 5. |4 − 5| = 1.
- Consistency: **High**.

Reading: the estimate is coherent. The open question is TRL 5, and the team already knows it.

## Worked example 2 — a gap flag

Answers: Yes at 1, No at 2, Yes at 3 and 4, No above. Build B1, environment E1.

- Highest claimed: **4**. Estimated TRL: **1** — the chain breaks at TRL 2.
- Gap flag: raised, naming TRL 2.
- Cross-check: B1 × E1 → 3. |1 − 3| = 2.
- Consistency: **Medium** (a single-level gap).

Reading: the team has done TRL 3–4 work but never formulated the concept and application at TRL 2 —
or, more often, never wrote it down. The fix is usually an afternoon with a document, not a
laboratory.

## Worked example 3 — a Tier 2 where one CTE limits the system

Three critical CTEs: a harvester (hardware), a power converter (hardware) and telemetry firmware
(software).

- The harvester has TRL 1–4 satisfied with evidence: **TRL 4**.
- The converter reaches TRL 3. At TRL 4 the FMECA criterion is _Not met_, so TRL 4 is not achieved:
  **TRL 3**.
- The firmware reaches TRL 3. At TRL 4 the module-integration criterion is _Partially met_: **TRL 3**.
- System summary: **min(4, 3, 3) = 3**, limited by the converter and the firmware.

Note what does _not_ happen: the harvester's TRL 4 does not pull the system up, and nothing is
averaged. The gap list tells you precisely what would move the system to 4 — extend the FMECA to the
converter, and finish integrating the firmware modules.
