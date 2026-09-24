import type { MessageKey } from '@/i18n/en';
import { useT } from '@/i18n/store';
import { MARK_GAP, MARK_RADIUS, VIZ } from './tokens';
import { StatusGlyph, type GlyphKind } from './StatusGlyph';

export interface LevelCounts {
  satisfied: number;
  partial: number;
  notMet: number;
  na: number;
  notAssessed: number;
}

const ORDER: Array<{ key: keyof LevelCounts; fill: string; kind: GlyphKind; label: MessageKey }> =
  [
    { key: 'satisfied', fill: VIZ.status.good, kind: 'Satisfied', label: 'tier2.levelBar.satisfied' },
    {
      key: 'partial',
      fill: VIZ.status.warning,
      kind: 'Partially met',
      label: 'tier2.levelBar.partial',
    },
    { key: 'notMet', fill: VIZ.status.critical, kind: 'Not met', label: 'tier2.levelBar.notMet' },
    { key: 'na', fill: VIZ.neutral.na, kind: 'N/A', label: 'tier2.levelBar.na' },
    {
      key: 'notAssessed',
      fill: VIZ.neutral.empty,
      kind: 'Not assessed',
      label: 'tier2.levelBar.notAssessed',
    },
  ];

/**
 * One bar per TRL level: how its criteria stand. Segments carry a 2px surface gap so adjacent
 * fills never blur into one, and the count is printed beside the bar — the bar is the glance,
 * the number is the fact.
 */
export function LevelBar({
  counts,
  width = 120,
  height = 10,
  showCounts = true,
  className,
}: {
  counts: LevelCounts;
  width?: number;
  height?: number;
  showCounts?: boolean;
  className?: string;
}) {
  const { t } = useT();
  const total = ORDER.reduce((sum, seg) => sum + counts[seg.key], 0);
  const summary =
    total === 0
      ? t('tier2.levelBar.none')
      : ORDER.filter((seg) => counts[seg.key] > 0)
          .map((seg) => t(seg.label, { count: counts[seg.key] }))
          .join(', ');

  let x = 0;
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={summary}
      >
        <title>{summary}</title>
        <rect x={0} y={0} width={width} height={height} rx={MARK_RADIUS} fill={VIZ.neutral.empty} />
        {total > 0
          ? ORDER.map((seg) => {
              const value = counts[seg.key];
              if (value === 0) return null;
              const w = Math.max(0, (value / total) * width - MARK_GAP);
              const rect = (
                <rect
                  key={seg.key}
                  x={x}
                  y={0}
                  width={w}
                  height={height}
                  rx={MARK_RADIUS}
                  fill={seg.fill}
                />
              );
              x += w + MARK_GAP;
              return rect;
            })
          : null}
      </svg>
      {showCounts ? (
        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
          <StatusGlyph kind="Satisfied" size={12} />
          {counts.satisfied}/{total}
        </span>
      ) : null}
    </span>
  );
}
