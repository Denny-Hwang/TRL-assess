# Critical Technology Elements

A CTE is a part of the system whose maturity decides whether the system works. A TRA assesses CTEs,
not products: "the buoy is TRL 6" is a summary; "the seawater-exposed power take-off is TRL 4" is an
assessment.

:::figure cte-tree:::

## Five questions that find a CTE

A "yes" to any of these usually means you have one:

1. **Is it new, or newly used?** New to the world, or used in an environment, a way or at a scale it
   has not been used before.
2. **Does performance depend on it?** If it under-performs, does the mission fail — or just slow down?
3. **Is there real uncertainty that it will work?** If nobody can point to a demonstration, that
   uncertainty _is_ low readiness.
4. **Would a knowledgeable outsider ask about it first?** Reviewers have good instincts for risk.
5. **Is it on the critical path to the next milestone?**

Usually **not** CTEs: catalogue parts used within their ratings, standard fasteners and connectors,
libraries used as intended, and anything already deployed in the same environment for the same
duration.

## The wave-buoy example

The bundled example uses the three elements above the line: harvester, power conversion, telemetry
firmware. A real assessment would likely add the enclosure and sealing — water ingress is the most
common cause of loss for small marine deployments — and the mooring and recovery _procedure_, which
is a process CTE: a procedure that exists only on paper is still unproven.

## Common mistakes

| Mistake                        | What goes wrong                                                                                                     | Fix                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| One CTE called "the buoy"      | Everything is assessed against one set of criteria, the evidence contradicts itself, and the number is indefensible | Split where subsystems are at visibly different stages           |
| Twenty CTEs, one per board     | Criteria repeat, the work becomes a chore, and the summary is dominated by something nobody calls critical          | Merge elements that would always share a status and its evidence |
| Everything marked critical     | The summary is the minimum across critical CTEs, so a convenience feature drags the whole picture down              | Mark only what gates the mission, and say why in "why critical"  |
| Nothing marked critical        | No system summary is computed at all                                                                                | Mark at least one                                                |
| "Critical" read as "important" | The mooring rope is important; it is a CTE only if something about it is unproven                                   | Ask question 3 again                                             |

For a device-scale project, three to eight CTEs is usually right. Above a dozen, you have probably
started assessing components rather than technology elements.
