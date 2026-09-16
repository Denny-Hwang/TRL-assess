# Evidence

Evidence separates an assessment from an opinion. The rule here is blunt: a mandatory criterion
marked _Met_ with no usable evidence does **not** count.

:::figure evidence-decision:::

## What counts

Anything a reviewer could examine without asking you to remember something.

| Type              | Strong                                                                                    | Weak                                            |
| ----------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Document          | A signed test report naming the article, conditions, date and operator                    | "Design review notes", undated, unattributed    |
| Test data         | A data file plus the conditions and the acceptance criteria                               | A screenshot of a plot with unlabelled axes     |
| Code repository   | A URL **plus a pinned commit SHA**, path and tag                                          | A link to `main` — a different thing every week |
| Drawing / CAD     | A released drawing with a revision, matching the tested article                           | An untitled sketch in a slide                   |
| Photo / Video     | A dated photograph of the article under test, with scale                                  | A render                                        |
| Publication (DOI) | A DOI that actually covers the claim                                                      | A DOI for a related but different device        |
| Web link          | A stable public page — facility, standard, dataset landing page                           | A search-results URL, or a link behind a login  |
| Other             | A calibration certificate, an audit record, a purchase order for a production-intent part | "See the shared drive"                          |

Three habits carry most of the weight:

- **Make it about the criterion.** A tank test proves you tested in a tank; it proves TRL 5 only if
  the tank is a _relevant environment_ for this element, and your description says why.
- **Pin the commit.** Branches move and tags can be re-pointed, so the tool requires a 7–40 character
  SHA and a path inside the repository.
- **Record the conditions.** What article and revision, when, where, by whom, under what conditions
  (temperature, salinity, pressure, sea state, duration), against what acceptance criteria, and what
  happened — including the failures.

## Relevant versus operational environment

This distinction decides TRL 5/6 against 7/8.

:::figure environment-fidelity:::

- A **relevant environment** is "a set of stressing conditions, representative of the full spectrum
  of intended operational employments" applied to the element as part of a component (TRL 5) or a
  system/subsystem (TRL 6) — `dod-tra-2025`, p. 12.
- An **operational environment** is "a set of conditions, representative of the full spectrum of
  employments" applied to a prototype (TRL 7) or the actual system (TRL 8), to find previously
  unknown design problems — `dod-tra-2025`, p. 13.

Two things people miss. "Full spectrum" means one favourable demonstration is not enough — you may
test important employments and extend confidence analytically, but you must say so. And the step
from 6 to 7 is a change of _scale_: the element must sit in a prototype of the planned operational
system, not a laboratory stand-in.

## Markings, and what never to attach

Three markings: _Public_, _Internal (unrestricted)_, and **Sensitive — reference only**, for which
the tool **refuses to store a file**. Record the title, custodian and a reference number instead, so
a reviewer can request it properly. Never enter classified, export-controlled or CUI content into a
tool running on a public static site.

## Verification

Each item is **Unverified**, **Verified** or **Rejected**, with a verifier and date. Only _Rejected_
affects scoring: rejected evidence is excluded, so a criterion resting solely on it stops being
satisfied. _Verified_ adds no weight; it records that someone checked.

A workable routine: the assessor links evidence as _Unverified_; a second person opens each item,
confirms it says what the criterion claims, and marks it _Verified_ or _Rejected_ with a note. The
evidence coverage figure on the results page tells you how much of your "Met" is actually backed.
