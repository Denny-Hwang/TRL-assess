# Stage crosswalk

> **A reference model, not an official standard.** Stage models are organization-specific. Use them
> for communication, not as a basis for TRL scoring.

This maps one common hardware development-stage model onto TRL.

:::figure stage-crosswalk:::

| Stage | Development term                | Typical TRL | Primary goal                                                                    |
| ----- | ------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| 0     | Concept                         | 1–2         | Define the opportunity and a technically credible approach.                     |
| 1     | Component-level evaluation      | 2–3         | Select key components; understand limits, variability, integration risk.        |
| 2     | Proof of concept                | 3           | Demonstrate fundamental technical feasibility.                                  |
| 3     | Breadboard prototype            | 3–4         | Develop the signal chain, electronics, algorithms, firmware, method.            |
| 4     | Board-level prototype (PCB)     | 4           | Validate custom electronics, layout, noise, power, interfaces.                  |
| 5     | Integrated prototype            | 5           | Validate end-to-end function in representative conditions.                      |
| 6     | Miniaturized prototype          | 5–6         | Validate form factor, weight, thermal behaviour, packaging, usability.          |
| 7     | Production-intent prototype     | 6–7         | Support design validation, reliability, regulatory and manufacturing readiness. |
| 8     | Pilot production build          | 7–8         | Verify manufacturability, yield, calibration, end-of-line test, supply chain.   |
| 9     | Technology transfer / licensing | 8–9         | Enable a partner to qualify, manufacture, sell and support the product.         |

## Why the ranges are wide

A stage says what you **built**; a TRL says what you **demonstrated, and where**. A miniaturized
prototype tested only on a bench is TRL 4; in a relevant environment, 5; integrated into the system
and demonstrated there, 6. Stages 8–9 are mostly manufacturing and commercial questions, which TRL
does not measure.
