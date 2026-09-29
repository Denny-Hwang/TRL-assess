import type { ArlFramework } from '@/domain/schemas';
import { useT } from '@/i18n/store';
import { inkOn, sequentialFill, VIZ } from './tokens';

export interface LookupMark {
  medium: number;
  high: number;
  label: string;
  /** Solid brand ring for the current position (Start), dashed violet for a target. */
  style: 'solid' | 'dashed';
}

/** The ring a mark draws around its cell — also used for the legend swatches. */
export function markOutline(style: LookupMark['style']): string {
  return style === 'solid' ? `3px solid ${VIZ.brand}` : `3px dashed ${VIZ.target}`;
}

/**
 * The source's look-up table drawn as it is printed — rows count Medium-risk dimensions, columns
 * High-risk ones, "8+" collects the rest — with the assessment's own cells ringed. Every cell
 * prints its ARL; the single-hue shade is a second cue for magnitude only. The table is static:
 * 81 focusable cells would cost keyboard users more than a hover detail is worth.
 */
export function ArlLookupGrid({
  framework,
  marks,
  className,
}: {
  framework: ArlFramework;
  marks: LookupMark[];
  className?: string;
}) {
  const { t } = useT();
  const { cap, table } = framework.lookup;
  const axis = Array.from({ length: cap + 1 }, (_, i) => i);
  const heading = (i: number) => (i === cap ? `${cap}+` : String(i));
  const marksAt = (row: number, column: number) =>
    marks.filter((m) => Math.min(m.medium, cap) === row && Math.min(m.high, cap) === column);
  const summary = marks
    .map((m) =>
      t('arl.grid.summary', {
        label: m.label,
        medium: m.medium,
        high: m.high,
        arl: table[Math.min(m.medium, cap)]![Math.min(m.high, cap)]!,
      }),
    )
    .join('; ');

  return (
    <figure className={className}>
      {/* Axis titles as the source prints them: across the top, and down the side. */}
      <div className="flex items-stretch gap-1 overflow-x-auto">
        <p
          aria-hidden="true"
          className="flex items-center justify-center pt-10 text-sm font-semibold text-slate-700 [writing-mode:vertical-rl]"
        >
          {t('arl.grid.rows')}
        </p>
        <div>
          <p aria-hidden="true" className="ps-10 text-center text-sm font-semibold text-slate-700">
            {t('arl.grid.columns')}
          </p>
          <table className="border-separate border-spacing-1 text-center text-sm">
            <caption className="sr-only">
              {t('arl.grid.caption')} {summary}
            </caption>
            <thead>
              <tr>
                <td className="px-1 py-1" />
                {axis.map((h) => (
                  <th key={h} scope="col" className="px-1 py-1 font-semibold text-slate-700">
                    {heading(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {axis.map((m) => (
                <tr key={m}>
                  <th scope="row" className="px-1 py-1 text-start font-semibold text-slate-700">
                    {heading(m)}
                  </th>
                  {axis.map((h) => {
                    const value = table[m]![h]!;
                    const fill = sequentialFill(value);
                    const here = marksAt(m, h);
                    // Start wins the ring when both land on the same cell; the legend and the
                    // reading cards above still name both.
                    const ring = here.find((x) => x.style === 'solid') ?? here[0];
                    return (
                      <td
                        key={h}
                        className="h-9 w-10 rounded"
                        style={{
                          background: fill,
                          color: inkOn(fill),
                          outline: ring ? markOutline(ring.style) : undefined,
                          outlineOffset: ring ? '1px' : undefined,
                          fontWeight: here.length ? 800 : 500,
                          fontSize: here.length ? '1rem' : undefined,
                        }}
                      >
                        {value}
                        {here.length ? (
                          <span className="sr-only"> ({here.map((x) => x.label).join(', ')})</span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {marks.length ? (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-800">
          {marks.map((m) => (
            <li key={m.label} className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-4 w-5 rounded-sm"
                style={{ outline: markOutline(m.style), outlineOffset: '-3px' }}
              />
              <span className="font-semibold">{m.label}</span>
              <span className="text-slate-600">
                {t('arl.grid.markCounts', { medium: m.medium, high: m.high })}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
