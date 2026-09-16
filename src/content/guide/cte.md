# Critical Technology Elements

A Critical Technology Element (CTE) is a part of the system whose maturity actually decides whether
the system will work. A TRA assesses CTEs, not products: "the buoy is TRL 6" is a summary, while
"the seawater-exposed power take-off is TRL 4" is an assessment.

## Questions that identify a CTE

Ask these about every subsystem. A "yes" to any of them usually means you have a CTE:

1. **Is it new, or newly used?** New to the world, or existing technology used in a way, an
   environment or at a scale it has not been used in before.
2. **Does the system's performance depend on it?** If it under-performs, does the mission fail, or
   just get slower?
3. **Is there real uncertainty about whether it will work as intended?** If nobody on the team can
   point to a demonstration, that uncertainty is the definition of low readiness.
4. **Would a knowledgeable outsider ask about it first?** Reviewers have good instincts for where
   the risk sits.
5. **Is it on the critical path to the next milestone?**

Things that are usually _not_ CTEs: catalogue parts used within their ratings, standard fasteners
and connectors, software libraries used as intended, and anything you have already flown or deployed
in the same environment for the same duration.

## Example: the fictional wave buoy

The example session bundled with this tool decomposes a fictional nearshore wave buoy into:

| CTE                          | Kind     | Why it is critical                                                                                |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| Wave energy harvester        | hardware | The whole power budget depends on it and no off-the-shelf equivalent meets the size limit.        |
| Power conversion and storage | hardware | It must survive an irregular input and a marine environment; if it fails the payload stops.       |
| Telemetry firmware           | software | Data that is not transmitted is lost, and the scheduling logic is new work, not a reused library. |

Two further elements a real assessment would very likely add:

| CTE                         | Kind     | Why it is critical                                                                                                        |
| --------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| Enclosure and sealing       | hardware | Water ingress is the most common cause of loss for small marine deployments; the seal design is specific to this housing. |
| Mooring / deployment method | process  | The recovery procedure has never been exercised in the intended sea state, and a lost buoy ends the campaign.             |

Notice that a _process_ can be a CTE. So can a procedure that only exists on paper.

## Common mistakes

**Too coarse.** One CTE called "the buoy". Everything is then assessed against one set of criteria,
the evidence contradicts itself, and the result is a single number nobody can defend. If your CTE has
subsystems that are at visibly different stages, split it.

**Too fine.** Twenty CTEs, one per circuit board. The assessment becomes a chore, criteria repeat,
and the system summary is dominated by an element nobody would call critical. If two elements would
always carry the same status and the same evidence, merge them.

**Marking everything critical.** The system summary is the minimum across critical CTEs, so marking
a convenience feature critical drags the whole picture down. Mark _critical_ only what genuinely
gates the mission — and record why in the "why critical" field.

**Marking nothing critical.** Then no system summary is computed, and the tool says so.

**Confusing "critical" with "important".** The mooring rope is important. It is a CTE only if
something about it is unproven.

## How many is right?

For a device-scale project, three to eight CTEs is usually right. If you are above a dozen, check
whether you have started assessing components rather than technology elements.
