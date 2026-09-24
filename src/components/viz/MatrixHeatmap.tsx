import { useState } from 'react';
import type { BuildCode, EnvironmentCode, Tier1Matrix } from '@/domain/schemas';
import { useT } from '@/i18n/store';
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
  const { t, st } = useT();
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
        {t('tier1.matrix.caption.before')}
        <span className="font-medium">{matrix.status}</span>
        {t('tier1.matrix.caption.after')}
      </figcaption>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0.5 text-center text-xs">
          <caption className="sr-only">
            {t('tier1.matrix.srCaption')}{' '}
            {build && environment ? t('tier1.matrix.srCombination', { build, environment }) : ''}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="px-1 py-1 text-start font-medium text-slate-500">
                {t('tier1.matrix.corner')}
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
                <th scope="row" className="px-1 py-1 text-start font-medium text-slate-600">
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
                        aria-label={t(isActive ? 'tier1.matrix.cellActive' : 'tier1.matrix.cell', {
                          build: `${b.code} ${b.label}`,
                          environment: `${e.code} ${e.label}`,
                          trl: t('trl.level', { level: value }),
                        })}
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
                        {isActive ? (
                          <span className="sr-only"> {t('tier1.matrix.yours')}</span>
                        ) : null}
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
              {t('tier1.matrix.activeHead', {
                build: activeBuild.code,
                environment: activeEnv.code,
                trl: t('trl.level', { level: String(activeValue) }),
              })}
            </strong>{' '}
            {t('tier1.matrix.activeText', {
              build: (st(activeBuild.label) ?? activeBuild.label).toLowerCase(),
              environment: (st(activeEnv.label) ?? activeEnv.label).toLowerCase(),
            })}
          </>
        ) : (
          t('tier1.matrix.hint')
        )}
      </p>
    </figure>
  );
}
