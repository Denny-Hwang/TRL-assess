# How to use this tool

Everything runs in your browser. Nothing is uploaded, and there is no account.

## Tier 1 — Quick Estimate (about 5 minutes)

1. **Context.** Project, technology and assessor are required. Two dropdowns matter more than they
   look: _environment reached_ (E0–E4) — where the most demanding test actually happened — and
   _build maturity_ (B0–B5) — what was actually built. They drive the cross-check that flags answers
   inconsistent with what exists.
2. **Nine questions, TRL 9 first.** Answer **Yes**, **No** or **Unsure** for the technology as a
   whole. Keyboard: `Y` `N` `U` to answer, arrows to move. The rail above the card shows the chain
   of "Yes" forming from TRL 1 — that chain is your estimate.
3. **Result.** Estimated TRL, highest level claimed, cross-check, consistency rating and flags.
   Download the workbook or the JSON.

Answer honestly rather than optimistically: "Unsure" never counts as "Yes", and an estimate built on
an unconfirmed level is worth nothing to whoever reads it.

## Tier 2 — Evidence-Based Assessment

1. **Identify the CTEs** — the parts whose maturity decides whether the system works. See
   [Critical Technology Elements](/guide/cte). Name each one, say why it is critical, set its kind,
   and mark it critical if it should count towards the system summary.
2. **Assess the criteria** for the selected CTE, working up from TRL 1:

:::figure status-legend:::

3. **Attach evidence.** A mandatory criterion marked _Met_ without evidence does **not** count. Use
   **Manage** beside a criterion to add or link an item. See [Evidence](/guide/evidence).
4. **Read the results.** Each CTE's TRL, the system summary, which CTE limits it, the gap list for
   the next level, and the difference from your quick estimate.
5. **Export.** The workbook is the record; the evidence package (.zip) adds the files themselves
   with a SHA-256 manifest, so a reviewer can verify nothing changed in transit.

## Adoption readiness — ARL (side module)

1. **Scope.** Name the project, then the technology scope, value chain scope, timeline and policy
   environment the ratings assume.
2. **Rate.** For each of the 17 dimensions pick Low, Medium or High against the rubric text, or N/A
   or Unsure, and write the rationale. Set an end-of-project target where the project will reduce a
   risk, and say how.
3. **Result.** ARL Start and ARL End, the risk profile, the look-up cell and flags. Download the ARL
   workbook or the session JSON.

Resetting the Quick Estimate, or switching TRL framework, keeps the ARL ratings; _Reset ARL_ clears
only them. See [Adoption readiness](/guide/arl) for the scoring.

## Saving, resuming, sharing, clearing

|           |                                                                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Autosave  | To this browser: `localStorage` for the assessment, IndexedDB for evidence files. Closing the tab is safe; clearing site data is not.          |
| Hand over | Send the JSON (small) or the evidence package (complete). **Download JSON** / **Import JSON** round-trip losslessly, except for file contents. |
| Sync      | None, by design. Different browsers, profiles and devices do not share storage.                                                                |
| Clear     | **Clear all local data** removes the session and every stored file from this browser. It cannot be undone — export first.                      |

The useful output is rarely the number; it is the gap list — what you would have to demonstrate to
justify the next one.
