# Evidence

Evidence is what separates an assessment from an opinion. The rule in this tool is blunt: a
mandatory criterion marked _Met_ with no usable evidence linked to it does **not** count.

## What counts

Evidence is anything a reviewer could examine to check your claim, without asking you to remember
something. Eight types are supported.

| Type              | Strong example                                                                                 | Weak example                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Document          | A signed test report naming the article, the conditions, the date and the operator.            | "Design review notes" with no date and no author.               |
| Test data         | A data file plus the conditions under which it was taken and the acceptance criteria.          | A screenshot of a plot with no axes labelled.                   |
| Code repository   | A URL **plus a pinned commit SHA**, path and tag.                                              | A link to `main` — which is a different thing every week.       |
| Drawing / CAD     | A released drawing with a revision, matching the tested article.                               | An untitled sketch in a slide deck.                             |
| Photo / Video     | A dated photograph of the article under test, with something for scale.                        | A render.                                                       |
| Publication (DOI) | A DOI for peer-reviewed work that actually covers the claim.                                   | A DOI for a paper about a related but different device.         |
| Web link          | A stable, public page (a facility description, a standard, a dataset landing page).            | A search-results URL, or a link behind a login nobody else has. |
| Other             | A calibration certificate, an audit record, a purchase order proving a production-intent part. | "See the shared drive."                                         |

## Evidence has to be _about_ the criterion

The most common weakness is not missing evidence — it is evidence that does not support the specific
claim. A tank test proves you tested in a tank. It proves TRL 5 only if the tank is a _relevant
environment_ for this element, and your evidence says why. Put that reasoning in the description
field, not in your head.

## Code evidence: always pin a commit

Branches move. Tags can be re-pointed. A commit SHA is the only reference that means the same thing
next year, which is why the tool requires one (7–40 hexadecimal characters) for code evidence. Record
the path inside the repository too — "the firmware" is not a location.

## Test data: record the conditions

A test record without conditions cannot establish an environment. At minimum, capture: what article
was tested (and its revision), when, where, by whom, under what conditions (temperature, salinity,
pressure, sea state, duration), against what acceptance criteria, and what happened — including the
failures.

## Relevant versus operational environment

This is the distinction that decides TRL 5/6 against TRL 7/8, and the DoD guidebook is precise about
it:

- A **relevant environment** is "a set of stressing conditions, representative of the full spectrum
  of intended operational employments" applied to the element as part of a component (TRL 5) or a
  system/subsystem (TRL 6) (`dod-tra-2025`, p. 12).
- An **operational environment** is "a set of conditions, representative of the full spectrum of
  employments" applied to a prototype (TRL 7) or the actual system (TRL 8), to find previously
  unknown design problems (`dod-tra-2025`, p. 13).

Two consequences people miss. First, "full spectrum" means one favourable demonstration is not
enough — the guidebook allows you to test important employments and extend confidence analytically,
but it requires you to say so. Second, the step from 6 to 7 is a change of _scale_: the element must
be embedded in a prototype of the planned operational system, not in a laboratory stand-in.

## Markings, and what never to attach

Every evidence item carries a marking:

- **Public** — freely shareable.
- **Internal (unrestricted)** — internal, but not controlled.
- **Sensitive — reference only** — the tool **refuses to store a file** for these. Record the title,
  the custodian and a reference number so a reviewer can request it through the proper channel.

Do not enter classified, export-controlled or CUI content into a tool running on a public static
site. The reference-only marking exists so you can still show that the evidence exists.

## Verification

Each item has a verification status: **Unverified**, **Verified** or **Rejected**, with a verifier
name and date. Verification is a human process — the tool cannot check anything for you.

Only _Rejected_ affects scoring: rejected evidence is excluded, so a criterion resting solely on it
stops being satisfied. _Verified_ does not add weight; it records that someone checked.

A workable routine: the assessor links evidence as _Unverified_; a second person opens each item,
confirms it says what the criterion claims, and marks it _Verified_ or _Rejected_ with a note. The
evidence coverage figure on the results page tells you how much of your "Met" is actually backed.
