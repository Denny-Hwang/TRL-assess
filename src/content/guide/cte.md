# Critical Technology Elements

A CTE is a part of the system whose maturity decides whether the system works. Assess CTEs, not
products: "the node is TRL 6" is a summary; "the energy harvester is TRL 4" is an assessment.

:::figure cte-tree:::

## Five questions that find a CTE

A "yes" to any of these usually means you have one:

1. **Is it new, or newly used** — in a new environment, way or scale?
2. **Does performance depend on it?** If it under-performs, does the mission fail?
3. **Is there real uncertainty that it will work?** No demonstration means low readiness.
4. **Would a knowledgeable reviewer ask about it first?**
5. **Is it on the critical path to the next milestone?**

Usually **not** CTEs: catalogue parts used within their ratings, standard fasteners and connectors,
libraries used as intended, and anything already proven in the same environment for the same
duration.

## The example

The example session has three CTEs: energy harvester, power management module and telemetry
firmware. A real assessment might add the enclosure and sealing, and the installation _procedure_ —
a process CTE: a procedure that exists only on paper is unproven.

## Common mistakes

| Mistake                        | Fix                                                                  |
| ------------------------------ | -------------------------------------------------------------------- |
| One CTE for the whole system   | Split where subsystems are at visibly different stages.              |
| One CTE per board or part      | Merge elements that would always share a status and its evidence.    |
| Everything marked critical     | Mark only what gates the mission; the summary is the minimum.        |
| Nothing marked critical        | Mark at least one, or no system summary is computed.                 |
| "Critical" read as "important" | An important part is a CTE only if something about it is unproven.   |

Three to eight CTEs is usually right for a device-scale project.
