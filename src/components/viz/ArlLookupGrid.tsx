import type { ArlFramework } from '@/domain/schemas';
import { inkOn, sequentialFill, VIZ } from './tokens';

export interface LookupMark {
  medium: number;
  high: number;
  label: string;
  /** Solid ring for the current position, dashed for a target. */
  style: 'solid' | 'dashed';
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
  const { cap, table } = framework.lookup;
  const axis = Array.from({ length: cap + 1 }, (_, i) => i);
  const heading = (i: number) => (i === cap ? `${cap}+` : String(i));
  const marksAt = (row: number, column: number) =>
    marks.filter((m) => Math.min(m.medium, cap) === row && Math.min(m.high, cap) === column);
  const summary = marks
    .map(
      (m) =>
        `${m.label}: ${m.medium} Medium and ${m.high} High → ARL ${
          table[Math.min(m.medium, cap)]![Math.min(m.high, cap)]
        }`,
    )
    .join('; ');

  return (
    <figure className={className}>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0.5 text-center text-xs">
          <caption className="mb-2 text-left text-xs text-slate-600">
            Rows: number of Medium-risk dimensions. Columns: number of High-risk dimensions.{' '}
            <span className="sr-only">{summary}</span>
          </caption>
          <thead>
            <tr>
              <th scope="col" className="px-1 py-1 text-left font-medium text-slate-500">
                M \ H
              </th>
              {axis.map((h) => (
                <th key={h} scope="col" className="px-1 py-1 font-medium text-slate-600">
                  {heading(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {axis.map((m) => (
              <tr key={m}>
                <th scope="row" className="px-1 py-1 text-left font-medium text-slate-600">
                  {heading(m)}
                </th>
                {axis.map((h) => {
                  const value = table[m]![h]!;
                  const fill = sequentialFill(value);
                  const here = marksAt(m, h);
                  const solid = here.find((x) => x.style === 'solid');
                  const dashed = here.find((x) => x.style === 'dashed');
                  return (
                    <td
                      key={h}
                      className="h-7 w-8 rounded-sm"
                      style={{
                        background: fill,
                        color: inkOn(fill),
                        outline: solid
                          ? `2px solid ${VIZ.ink.primary}`
                          : dashed
                            ? `2px dashed ${VIZ.ink.primary}`
                            : undefined,
                        outlineOffset: here.length ? '-2px' : undefined,
                        fontWeight: here.length ? 700 : 500,
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
      {marks.length ? (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {marks.map((m) => (
            <li key={m.label} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-3 w-4 rounded-sm"
                style={{ outline: `2px ${m.style} ${VIZ.ink.primary}`, outlineOffset: '-2px' }}
              />
              {m.label}: {m.medium} Medium, {m.high} High
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}
