# Marine & ocean tailoring

The generic TRL definitions were written with aircraft, vehicles, missiles and spacecraft in mind.
They transfer to marine energy and ocean observing, but a few things need saying out loud, because
the usual laboratory proxies are misleading at sea.

## What "relevant environment" can mean at sea

A relevant environment simulates "both the most important and most stressing aspects of the
operational environment" (`dod-tra-2025`, Table 2-3, p. 11). For a marine device the stressing
aspects are rarely the ones a bench test reproduces.

| Axis             | Weak proxy           | Relevant                                                         | Operational                         |
| ---------------- | -------------------- | ---------------------------------------------------------------- | ----------------------------------- |
| Fluid            | Air, or fresh water  | Conductive seawater at representative salinity                   | The deployment site                 |
| Motion           | Static bench         | Wave tank with representative spectra                            | Open water in the target sea states |
| Depth / pressure | Ambient              | Pressure vessel at the design depth, cycled                      | Deployed at depth                   |
| Temperature      | Room temperature     | Chamber cycling across the deployment range, including cold soak | A season at sea                     |
| Biofouling       | None                 | Accelerated fouling or a fouled-surface analogue                 | Months in the water                 |
| Duration         | Minutes              | Hours to days, continuous                                        | The full deployment                 |
| Communications   | Bench-top radio link | Antenna at realistic height over water, with sea clutter         | Ship-to-shore or satellite at sea   |

**Seawater is not water.** Conductivity changes electrical coupling, leakage paths and corrosion
rates; a fresh-water tank test does not demonstrate an element whose risk is electrical. That is why
the marine framework makes conductive-seawater testing a tailored criterion at TRL 5, with the
option to mark it _N/A_ and justify it when it genuinely does not apply.

**Deck is not sea.** Dockside and on-deck tests are enormously useful and prove very little about
communications, motion response, grounding or handling. Keep the two sets of results separate; the
framework asks for a test plan that distinguishes them at TRL 6.

**A short deployment is not a full mission.** TRL 8 and 9 are about the _full range_ of expected
conditions. One calm-season deployment is a strong TRL 7 result and not a TRL 8 claim.

## Related readiness scales

TRL is one axis. Several others are used alongside it, and confusing them wastes time.

**TPL — Technology Performance Level** (NREL, `nrel-tpl`). TPL asks _how well would this work if it
were mature?_ — cost of energy, survivability, environmental compliance, manufacturability. TRL asks
_how far has it been demonstrated?_ A device can be TRL 7 and TPL-poor: thoroughly demonstrated and
not worth building. Marine energy programmes commonly plot the two together, and the message is that
advancing TRL on a low-TPL concept is expensive.

**MRL — Manufacturing Readiness Level** (DoD, `dod-mrl-matrix-2018`). MRL 1–10 covers whether the
manufacturing process, supply chain, workforce and quality systems are ready. TRL 8 with MRL 4 is a
device you can demonstrate but not produce. This tool does not score MRL; the MRL matrix is held as a
reference only.

**IRL / SRL — Integration and System Readiness Levels.** IRL scores the maturity of the _interface_
between two elements; SRL combines TRL and IRL into a system view. Useful when the risk lives in
integration rather than in any single element. Not implemented here; on the backlog.

**ARL — Adoption Readiness Level** (DOE Office of Technology Transitions). ARL looks at what stands
between a working technology and its use: value proposition, market, regulatory acceptance, supply
chain. Complementary to TRL, not a substitute.

**GOOS Framework for Ocean Observing** (`goos-foo`). The ocean-observing community classifies
observing elements as _concept_, _pilot_ or _mature_, applied to requirements, observations and data
management together. Roughly: concept ≈ TRL 1–4, pilot ≈ TRL 5–7, mature ≈ TRL 8–9 — but the mapping
is loose, and the GOOS view deliberately includes the data pipeline, not just the instrument.

That last point drives two of the tailored criteria: an ocean-observing instrument that cannot get
its calibrated values into the observing system has not demonstrated the end-user specification,
however well the hardware performs.

## A practical ordering for marine work

1. Prove the physics in the laboratory (TRL 3–4), and start the risk register and FMECA at TRL 4.
2. Take the component into a relevant environment — seawater, motion, temperature — and record the
   conditions, not just the results (TRL 5).
3. Integrate and demonstrate the system in a relevant environment, separating deck from open water
   (TRL 6).
4. Deploy a near-production prototype in the operational environment and log duration and failures
   with root causes (TRL 7).
5. Qualify at full scale across the expected range, with calibration and the data pathway documented
   end to end (TRL 8).
