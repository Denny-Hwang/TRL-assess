# How to use this tool

Everything runs in your browser. Nothing is uploaded, and there is no account.

## Tier 1 — Quick Estimate (about 5 minutes)

1. **Context.** Enter project, technology and assessor. Set _environment reached_ (E0–E4) — where
   the most demanding test happened — and _build maturity_ (B0–B5) — what was actually built. They
   drive the cross-check.
2. **Nine questions, TRL 9 first.** Answer **Yes**, **No** or **Unsure** for the technology as a
   whole. Keyboard: `Y` `N` `U` to answer, arrows to move. "Unsure" never counts as "Yes".
3. **Result.** Estimated TRL, highest level claimed, cross-check, consistency rating and flags.
   Download the workbook or the JSON.

## Tier 2 — Evidence-Based Assessment

1. **Identify the CTEs** — see [Critical Technology Elements](/guide/cte). Name each one, say why it
   is critical, set its kind, and mark it critical if it should count towards the system summary.
2. **Assess the criteria** for each CTE, working up from TRL 1:

:::figure status-legend:::

3. **Attach evidence** with **Manage** beside a criterion. A mandatory criterion marked _Met_
   without evidence does **not** count. See [Evidence](/guide/evidence).
4. **Read the results.** Each CTE's TRL, the system summary and the limiting CTE, the gap list for
   the next level, and the difference from your quick estimate.
5. **Export.** The workbook is the record; the evidence package (.zip) adds the files with a SHA-256
   manifest.

## Adoption readiness — ARL

1. **Scope.** Project, technology scope, value chain scope, timeline and policy environment.
2. **Rate** each of the 17 dimensions Low, Medium or High against the rubric, or N/A or Unsure, with
   a rationale. Set an end-of-project target where the project will reduce a risk, and say how.
3. **Result.** ARL Start and ARL End, the risk profile and flags. Download the ARL workbook or JSON.

_Reset ARL_ clears only the ARL ratings. See [Adoption readiness](/guide/arl).

## Saving, sharing, clearing

|           |                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------- |
| Autosave  | To this browser: `localStorage` for the assessment, IndexedDB for evidence files. Clearing site data deletes them.      |
| Hand over | **Download JSON** / **Import JSON** round-trip everything except file contents; the evidence package includes the files. |
| Sync      | None. Different browsers, profiles and devices do not share storage.                                                    |
| Clear     | **Clear all local data** removes the session and every stored file from this browser. Export first.                     |
