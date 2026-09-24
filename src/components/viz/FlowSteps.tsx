import { VIZ } from './tokens';

export interface FlowStep {
  title: string;
  detail: string;
  /** Optional short note under the arrow leading to this step. */
  via?: string;
}

/**
 * A three-step flow drawn once instead of explained three times. Arrows are decorative; the
 * ordered list underneath is what assistive technology reads.
 */
export function FlowSteps({
  steps,
  className,
}: {
  steps: readonly FlowStep[];
  className?: string;
}) {
  return (
    <ol className={`grid gap-3 md:grid-cols-${steps.length} ${className ?? ''}`}>
      {steps.map((step, index) => (
        <li key={step.title} className="relative rounded-lg border border-slate-200 bg-white p-3">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: VIZ.brand }}
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <p className="mt-2 text-sm font-semibold">{step.title}</p>
          <p className="mt-1 text-xs text-slate-600">{step.detail}</p>
          {index < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute end-[-14px] top-1/2 hidden -translate-y-1/2 text-slate-300 md:block rtl:rotate-180"
            >
              ▶
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
