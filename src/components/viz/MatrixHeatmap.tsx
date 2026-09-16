import { useState } from 'react';
import type { BuildCode, EnvironmentCode, Tier1Matrix } from '@/domain/schemas';
import { inkOn, sequentialFill, VIZ } from './tokens';

/**
 * The build × environment cross-check as a grid instead of a footnote: every cell prints its
 * TRL, the shade is a single blue hue for magnitude, and the cell the user landed on is ringed.
 * Hovering or focusing a cell says what that combination means in words.
 */
export function MatrixHeatmap({
  matrix,
  build,
  environment,
  className,
}: {
  matrix: Tier1Matrix;
  build?: BuildCode;
  environment?: EnvironmentCode;
  className?: string;
}) {
  const [hover, setHover] = useState<{ b: string; e: string } | null>(null);
  const builds = matrix.builds;
  const environments = matrix.environments;

  const active = hover ?? (build && environment ? { b: build, e: environment } : null);
  const activeBuild = builds.find((b) => b.code === active?.b);
  const activeEnv = environments.find((e) => e.code === active?.e);
  const activeValue = active ? matrix.matrix[active.b]?.[active.e] : undefined;

  return (
    <figure className={className}>
      <figcaption className="mb-2 text-xs text-slate-600">
        Build maturity × environment reached → suggested TRL. This is a{' '}
        <span className="font-medium">{matrix.status}</span> and never overrides your answers.
      </figcaption>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0.5 text-center text-xs">
          <caption className="sr-only">
            Cross-check matrix: each cell gives the TRL suggested by a build maturity and an
            environment.{' '}
            {build && environment ? `Your combination is ${build} × ${environment}.` : ''}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="px-1 py-1 text-left font-medium text-slate-500">
                build \ env
              </th>
              {environments.map((e) => (
                <th key={e.code} scope="col" className="px-1 py-1 font-medium text-slate-600">
                  {e.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {builds.map((b) => (
              <tr key={b.code}>
                <th scope="row" className="px-1 py-1 text-left font-medium text-slate-600">
                  {b.code}
                </th>
                {environments.map((e) => {
                  const value = matrix.matrix[b.code]?.[e.code] ?? 0;
                  const isActive = build === b.code && environment === e.code;
                  const fill = sequentialFill(value);
                  return (
                    <td key={e.code} className="p-0">
                      <button
                        type="button"
                        tabIndex={0}
                        onMouseEnter={() => setHover({ b: b.code, e: e.code })}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover({ b: b.code, e: e.code })}
                        onBlur={() => setHover(null)}
                        aria-label={`${b.code} ${b.label} with ${e.code} ${e.label}: TRL ${value}${
                          isActive ? ' — your combination' : ''
                        }`}
                        className="h-7 w-9 rounded-sm"
                        style={{
                          background: fill,
                          color: inkOn(fill),
                          outline: isActive ? `2px solid ${VIZ.ink.primary}` : undefined,
                          outlineOffset: isActive ? '-2px' : undefined,
                          fontWeight: isActive ? 700 : 500,
                        }}
                      >
                        {value}
                        {isActive ? <span className="sr-only"> (your combination)</span> : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 min-h-[2.5rem] text-xs text-slate-600" aria-live="polite">
        {activeBuild && activeEnv ? (
          <>
            <strong>
              {activeBuild.code} × {activeEnv.code} → TRL {activeValue}
            </strong>{' '}
            — {activeBuild.label.toLowerCase()} tested in {activeEnv.label.toLowerCase()}.
          </>
        ) : (
          'Hover or focus a cell to see what that combination means.'
        )}
      </p>
    </figure>
  );
}
