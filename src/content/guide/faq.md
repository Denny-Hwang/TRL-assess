# Frequently asked questions

## Is this an official Technology Readiness Assessment?

No. A TRA is run by a team independent of the programme, under an agency's process, and it can
reject your evidence. This tool records what you enter, applies the published rules conservatively,
and shows its working. Every result and export says so.

## What is the ARL module, and does it change my TRL?

It rates the 17 adoption-risk dimensions of the DOE Adoption Readiness Assessment and reads ARL Start
and ARL End from the source's look-up table. It never changes a TRL result and is never combined
with one. See [Adoption readiness](/guide/arl).

## Can I use the result in a proposal?

As your own statement of maturity, with the evidence attached — name the framework and version.
Do not present it as independent, and check the solicitation: if it names TRL definitions this tool
does not implement, use theirs.

## Why is my Tier 2 result lower than my Tier 1 estimate?

The normal direction, for three reasons: Tier 2 requires _evidence_ for every claim; it requires
_every_ mandatory criterion at a level, not an overall impression; and the summary is the _minimum_
across critical CTEs, not an average. If the difference is 2 or more, the results page explains it —
look at the limiting CTE first.

## Why does "Unsure" count as "No"?

A readiness level is a claim that something was demonstrated. If you are unsure it was, you cannot
claim it. Treating "Unsure" as "Yes" produces a number that collapses the moment anyone asks for the
evidence — the failure mode readiness assessments exist to prevent.

## Why do I need evidence for something I know we did?

Because the reader does not know, and in a year neither will you. Linking a document or a commit to
each claim is most of the value here: it turns institutional memory into something reviewable.

## What if a criterion genuinely does not apply?

Mark it **N/A** and write a justification — that counts as satisfied. An unjustified N/A does not,
deliberately: it is the easiest way to inflate a result.

## Where is my data?

In your browser: the assessment in `localStorage`, evidence file contents in IndexedDB. Nothing is
uploaded — the app makes no network requests at runtime, and the end-to-end tests fail the build if
it ever does. Different browsers and devices do not share storage.

## Can I share the evidence package?

That is what it is for — but check the markings. Items marked "Sensitive — reference only" are never
bundled; everything else is, so treat the `.zip` as being as sensitive as its contents. The manifest
lets a recipient verify nothing changed in transit.

## What happens if I clear my browser data?

The assessment and every stored file are gone. Export JSON or the package regularly if the work
matters; there is no server-side copy.

## Why can I not attach a file to a "Sensitive — reference only" item?

Because this tool is designed to be hosted publicly, and refusing the file outright is the simplest
way to keep controlled material off it. Record the title, custodian and a reference number instead.

## Can I edit the workbook and re-import it?

Not yet — workbooks are static snapshots; session JSON round-trips losslessly. On the backlog.

## Why does my level say "No mandatory criteria — needs assessor confirmation"?

Because that framework's source does not classify criteria as mandatory, and the tool refuses to
guess — see [Frameworks](/guide/frameworks).

## Can I add my own framework or fix a criterion?

Yes — frameworks are JSON, so fixing a criterion is a data change, not a code change. Open a
**Criteria correction** issue with the source and page reference; see `CONTRIBUTING.md`.

## Does the TRL 9 question really come from a different document?

In the marine framework, yes — EERE R 540.112-02 defines TRL 1–8 only. Nothing was invented to fill
the gap; see [Frameworks](/guide/frameworks).
