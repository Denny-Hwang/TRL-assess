# Marine & ocean tailoring

The generic TRL definitions were written with aircraft, vehicles and spacecraft in mind. They
transfer to marine energy and ocean observing, but the usual laboratory proxies mislead at sea.

## What "relevant environment" can mean at sea

:::figure environment-fidelity:::

[Evidence](/guide/evidence) defines relevant and operational environment. What follows is what those
definitions mean once the deployment is at sea — the stressing aspects are rarely the ones a bench
reproduces.

| Axis        | Weak proxy          | Relevant                                              | Operational                         |
| ----------- | ------------------- | ----------------------------------------------------- | ----------------------------------- |
| Fluid       | Air, or fresh water | Conductive seawater at representative salinity        | The deployment site                 |
| Motion      | Static bench        | Wave tank with representative spectra                 | Open water in the target sea states |
| Depth       | Ambient             | Pressure vessel at design depth, cycled               | Deployed at depth                   |
| Temperature | Room temperature    | Chamber cycling across the range, including cold soak | A season at sea                     |
| Biofouling  | None                | Accelerated fouling or a fouled-surface analogue      | Months in the water                 |
| Duration    | Minutes             | Hours to days, continuous                             | The full deployment                 |
| Comms       | Bench-top radio     | Antenna at realistic height over water, sea clutter   | Ship-to-shore or satellite at sea   |

Three traps worth naming:

- **Seawater is not water.** Conductivity changes coupling, leakage paths and corrosion rates, so a
  fresh-water tank test does not demonstrate an element whose risk is electrical. Hence the tailored
  seawater criterion at TRL 5 — mark it N/A with a justification where it genuinely does not apply.
- **Deck is not sea.** Dockside tests are useful and prove little about communications, motion
  response, grounding or handling. The framework asks for a test plan that separates them at TRL 6.
- **A short deployment is not a full mission.** TRL 8 and 9 are about the _full range_ of expected
  conditions. One calm-season deployment is a strong TRL 7 result, not a TRL 8 claim.

## Related readiness scales

| Scale                                 | Asks                                                                                    | Relationship to TRL                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **TPL** (NREL, `nrel-tpl`)            | How well would it perform if mature — cost of energy, survivability, compliance         | Orthogonal. A device can be TRL 7 and TPL-poor: thoroughly demonstrated and not worth building.                               |
| **MRL** (DoD, `dod-mrl-matrix-2018`)  | Can it be produced — process, supply chain, workforce, quality                          | TRL 8 with MRL 4 means demonstrable but not producible. Not scored here; the matrix is reference only.                        |
| **IRL / SRL**                         | How mature is the _interface_ between two elements; the system view                     | Useful when the risk lives in integration. On the backlog.                                                                    |
| **ARL** (DOE OTC, `doe-otc-arl-2025`) | What stands between a working technology and its use — market, regulation, supply chain | Complementary, not a substitute. Scored in the [ARL side module](/guide/arl); never combined with TRL.                        |
| **GOOS FOO** (`goos-foo`)             | Is an observing element _concept_, _pilot_ or _mature_                                  | Roughly concept ≈ TRL 1–4, pilot ≈ 5–7, mature ≈ 8–9 — but it deliberately covers the data pipeline, not just the instrument. |

That last point drives two tailored criteria: an ocean-observing instrument that cannot get its
calibrated values into the observing system has not demonstrated the end-user specification, however
well the hardware performs.

## A practical ordering for marine work

1. Prove the physics in the laboratory (TRL 3–4); start the risk register and FMECA at TRL 4.
2. Take the component into a relevant environment — seawater, motion, temperature — and record the
   conditions, not just the results (TRL 5).
3. Integrate and demonstrate the system in a relevant environment, separating deck from open water
   (TRL 6).
4. Deploy a near-production prototype operationally; log duration and failures with root causes
   (TRL 7).
5. Qualify at full scale across the expected range, with calibration and the data pathway documented
   end to end (TRL 8).
