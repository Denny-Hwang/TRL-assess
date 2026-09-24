# Evidence

A mandatory criterion marked _Met_ with no usable evidence does **not** count.

:::figure evidence-decision:::

## What counts

Anything a reviewer could examine without asking you.

| Type              | Strong                                                                 | Weak                                         |
| ----------------- | ---------------------------------------------------------------------- | -------------------------------------------- |
| Document          | A signed test report naming the article, conditions, date and operator | Undated, unattributed review notes           |
| Test data         | A data file plus the conditions and acceptance criteria                | A screenshot of a plot with unlabelled axes  |
| Code repository   | A URL **plus a pinned commit SHA**, path and tag                       | A link to `main`                             |
| Drawing / CAD     | A released drawing with a revision matching the tested article         | An untitled sketch in a slide                |
| Photo / Video     | A dated photograph of the article under test, with scale               | A render                                     |
| Publication (DOI) | A DOI that actually covers the claim                                   | A DOI for a related but different device     |
| Web link          | A stable public page — facility, standard, dataset                     | A search-results URL, or a page behind login |
| Other             | A calibration certificate, an audit record                             | "See the shared drive"                       |

Record the article and revision, date, operator, conditions, acceptance criteria and results —
including failures. A repository link needs a 7–40 character commit SHA and a path.

## Relevant versus operational environment

This distinction separates TRL 5/6 from 7/8.

:::figure environment-fidelity:::

- A **relevant environment** is "a set of stressing conditions, representative of the full spectrum
  of intended operational employments" applied to the element as part of a component (TRL 5) or a
  system/subsystem (TRL 6) — `dod-tra-2025`, p. 12.
- An **operational environment** is "a set of conditions, representative of the full spectrum of
  employments" applied to a prototype (TRL 7) or the actual system (TRL 8) — `dod-tra-2025`, p. 13.

"Full spectrum" means one favourable test is not enough.

## Markings

_Public_, _Internal (unrestricted)_, or **Sensitive — reference only**, for which the tool **refuses
to store a file**: record the title, custodian and a reference number instead. Never enter
classified, export-controlled or CUI content.

## Verification

Each item is **Unverified**, **Verified** or **Rejected**, with a verifier and date. Only _Rejected_
affects scoring: rejected evidence is excluded, so a criterion resting only on it stops being
satisfied.
