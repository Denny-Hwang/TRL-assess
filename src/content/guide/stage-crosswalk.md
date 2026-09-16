# Stage crosswalk

> **This is a user-provided reference model, not an official standard.** Stage models are
> organization-specific. Use them for communication, not as the basis for TRL scoring.

Many hardware teams run a stage model for sensor development that is more granular than TRL near the
prototype end and says nothing about environments. The table below maps one such model onto TRL for
translation purposes.

| Stage | Development term                           | Typical TRL | Primary goal                                                                                                                  |
| ----- | ------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 0     | Concept                                    | 1–2         | Define the sensor opportunity and establish a technically credible development approach.                                      |
| 1     | Component-Level Evaluation                 | 2–3         | Select key components and understand performance limits, variability and integration risks.                                   |
| 2     | Proof of Concept                           | 3           | Demonstrate fundamental technical feasibility of the sensor concept.                                                          |
| 3     | Breadboard Prototype                       | 3–4         | Develop and optimize the signal chain, electronics, algorithms, firmware and measurement method.                              |
| 4     | Board-Level Prototype (PCB)                | 4           | Validate custom electronics, PCB layout, noise performance, power consumption, firmware and electrical interfaces.            |
| 5     | Integrated Prototype                       | 5           | Validate end-to-end system functionality and performance in representative operating conditions.                              |
| 6     | Miniaturized Prototype                     | 5–6         | Validate target form factor, size, weight, thermal behaviour, packaging, usability and performance after miniaturization.     |
| 7     | Production-Intent Prototype                | 6–7         | Support design validation, reliability, regulatory testing and manufacturing-readiness assessment.                            |
| 8     | Pilot Production Build                     | 7–8         | Verify manufacturability, yield, quality, calibration, end-of-line testing, supply-chain readiness and process repeatability. |
| 9     | Technology Transfer / Commercial Licensing | 8–9         | Enable a commercial partner to complete qualification, manufacture, market, sell and support the product.                     |

## How to read the ranges

The ranges are wide because a stage says what you **built**, while a TRL says what you
**demonstrated and where**. A miniaturized prototype tested only on a bench is TRL 4, not 6, however
polished it looks. The same prototype tested in a relevant environment is TRL 5, and integrated into
the system and demonstrated there, TRL 6.

That is exactly what the Tier 1 cross-check encodes: your build code (B0–B5) alone cannot produce a
high TRL without an environment code (E0–E4) to match.

## Where stage models and TRL disagree

- **Stages 8 and 9 are mostly manufacturing and commercial questions.** TRL does not measure them —
  MRL and ARL do. A pilot production build tells you little about whether the device has been
  operated through a full mission.
- **Stage models rarely mention the operational environment.** Two teams at "Stage 7" can be at TRL 6
  and TRL 7 depending on whether anything went to sea.
- **Stage models are linear; readiness is not.** Elements of one system routinely sit at different
  TRLs, which is why an assessment is done per CTE.

Use the crosswalk to answer "what does our Stage 6 mean in TRL terms?" — then run the actual
assessment to find out.
