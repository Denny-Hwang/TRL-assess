# Frequently asked questions

## Is this an official Technology Readiness Assessment?

No. It is a self-assessment aid. A TRA is conducted by a team independent of the programme, under an
agency's own process, and it can reject your evidence. This tool records what you enter, applies the
published rules conservatively, and shows its working. Every result and every export says so.

## Can I use the result in a proposal?

You can use it the way you would use any self-assessment: as your own statement of maturity, with
the evidence attached. Say where the number came from — name the framework and version, and attach
the workbook or the evidence package. Do not present it as an independent assessment, and check the
solicitation: many programmes specify which TRL definitions apply, and if they name a framework this
tool does not implement, use theirs.

## Why is my Tier 2 result lower than my Tier 1 estimate?

That is the normal direction, for three reasons. Tier 2 requires _evidence_ for every claim, and
"Met" without evidence does not count. Tier 2 requires _every_ mandatory criterion at a level, not an
overall impression. And the system summary is the _minimum_ across critical CTEs, not an average. If
the difference is 2 or more, the results page explains it; look at the limiting CTE first.

## Why does "Unsure" count as "No"?

Because a readiness level is a claim that something was demonstrated. If you are unsure it was
demonstrated, you cannot claim it. Treating "Unsure" as "Yes" would produce a number that collapses
the moment anyone asks for the evidence — which is the failure mode readiness assessments exist to
prevent.

## Why do I need evidence for something I know we did?

Because the reader does not know. And in a year, neither will you. The discipline of linking a
document or a commit to each claim is most of the value here: it converts institutional memory into
something reviewable.

## What if a criterion genuinely does not apply?

Mark it **N/A** and write a justification. A justified N/A counts as satisfied. An unjustified one
does not, and the tool says so — this is deliberate, because "N/A" without a reason is the easiest
way to inflate a result.

## Where is my data?

In your browser. The assessment lives in `localStorage`; evidence file contents live in IndexedDB.
Nothing is uploaded — the app makes no network requests at runtime, and the end-to-end tests fail the
build if it ever does. Different browsers and devices do not share storage.

## Can I share the evidence package?

Yes — that is what it is for. Check the markings first. Items marked "Sensitive — reference only" are
never bundled, but everything else is, so treat the `.zip` as being as sensitive as its contents. The
`MANIFEST.sha256.txt` lets a recipient verify that nothing changed in transit.

## What happens if I clear my browser data?

The assessment and every stored evidence file are gone. Export JSON (or the evidence package)
regularly if the work matters. There is no server-side copy to recover.

## Why can I not attach a file to a "Sensitive — reference only" item?

Because this tool is designed to be hosted on a public static site, and the simplest way to prevent
controlled material from being placed there is to refuse the file outright. Record the title, the
custodian and a reference number instead, so a reviewer can request it properly.

## Can I edit the workbook and re-import it?

Not yet. Exported workbooks are static snapshots: editing one does not recompute anything, and the
app cannot read it back. To change a result, change it in the app and export again. Session JSON
_does_ round-trip losslessly. Importing an edited workbook is on the backlog.

## Why does my level say "No mandatory criteria — needs assessor confirmation"?

Because the framework's source document does not classify its criteria as mandatory or optional, so
the tool refuses to guess. That flag appears throughout the generic `dod-tra-2025` framework. The
`marine-energy-eere` framework promotes the level-defining criterion at each TRL to mandatory and
records why.

## Can I add my own framework or fix a criterion?

Yes. Frameworks are JSON files under `src/data/frameworks/<id>/`, validated by
`npm run validate:criteria`. Fixing a criterion is a data change, not a code change. Open a
**Criteria correction** issue with the source and page reference, and see `CONTRIBUTING.md`.

## Does the TRL 9 question really come from a different document than the rest?

Yes, in the marine framework. EERE R 540.112-02 as retrieved defines TRL 1–8 only, so the TRL 9
question is adapted from the DoD TRA Guidebook. The question's help text says so, and so does
`docs/sources/SOURCES.md`. Nothing was invented to fill the gap.
