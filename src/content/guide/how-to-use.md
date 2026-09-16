# How to use this tool

Everything runs in your browser. Nothing is uploaded, and there is no account.

## Tier 1 — Quick Estimate (about 5 minutes)

1. Open **Quick Estimate**. Pick a framework — the marine-energy one is the default.
2. **Step 1: context.** Project, technology and assessor are required; the rest is optional but
   makes the export far more useful later. Two dropdowns matter more than they look:
   - _Environment reached_ (E0–E4): where the most demanding test actually happened.
   - _Build maturity_ (B0–B5): what was actually built and tested.
     These feed a cross-check that flags answers inconsistent with what you have built.
3. **Step 2: screening questions.** Nine questions, presented TRL 9 first. Answer **Yes**, **No** or
   **Unsure** for the technology as a whole. Use `Y`, `N`, `U` on the keyboard, and the arrow keys to
   move without answering. Add a one-line note wherever the answer is not obvious — your future self
   will want it.
4. **Result.** You get the estimated TRL (the headline), the highest level you claimed, the
   cross-check value, a consistency rating and any flags. Download the Excel workbook or the JSON.

Answer honestly rather than optimistically. "Unsure" never counts as "Yes", and that is the point:
an estimate built on an unconfirmed level is worth nothing to the person reading it.

## Tier 2 — Evidence-Based Assessment

1. Open **Evidence Assessment**. If you have run a quick estimate, you can import the technology
   name as your first CTE.
2. **Identify the CTEs.** A Critical Technology Element is a part of the system whose maturity
   actually decides whether the system works. See [Critical Technology Elements](/guide/cte).
   For each one: name it, say why it is critical, set its kind (hardware, software or process), and
   mark it critical if it should count towards the system summary.
3. **Assess the criteria.** For the selected CTE, work up from TRL 1. Each criterion gets a status:
   _Met_, _Partially met_, _Not met_, _N/A_ (with a justification) or _Not assessed_.
4. **Attach evidence.** A mandatory criterion marked _Met_ without evidence does **not** count. Use
   the **Manage** link next to a criterion to add or link an evidence item. See
   [Evidence](/guide/evidence).
5. **Read the results.** `/assess/result` shows each CTE's TRL, the conservative system summary,
   which CTE is limiting it, the gap list for the next level, and the difference from your quick
   estimate.
6. **Export.** The Tier 2 workbook is a complete record. The evidence package (.zip) additionally
   bundles the files themselves with a SHA-256 manifest, so a reviewer can verify nothing changed in
   transit.

## Saving, resuming and sharing

- Work is saved to this browser automatically (`localStorage` for the assessment, IndexedDB for
  evidence files). Closing the tab is safe; clearing site data is not.
- **Download JSON** produces a file that restores everything except the evidence file contents.
  **Import JSON** on the results page reads it back.
- To hand work to a colleague, send the JSON (small) or the evidence package (complete).
- Different browsers, profiles and devices do not share storage. There is no sync, by design.

## Clearing your data

Use **Clear all local data** to remove the session and every stored evidence file from this browser.
It cannot be undone — export first if you want a copy. Clearing site data in the browser has the
same effect.

## What to do with the result

Take the gap list to your next planning meeting. The useful output of a readiness assessment is
rarely the number; it is the list of things you would need to demonstrate to justify the next one.
