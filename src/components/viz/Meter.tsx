import { useT } from '@/i18n/store';
import { MARK_RADIUS, VIZ } from './tokens';

/**
 * A single proportion — completeness, evidence coverage. The number is always printed;
 * the bar is the glance.
 */
export function Meter({
  value,
  label,
  width = 96,
  height = 8,
  tone = 'brand',
  className,
}: {
  value: number;
  label: string;
  width?: number;
  height?: number;
  tone?: 'brand' | 'good' | 'muted';
  className?: string;
}) {
  const { t } = useT();
  const pct = Math.max(0, Math.min(100, value));
  const name = t('tier2.meter.value', { label, pct });
  const fill = tone === 'good' ? VIZ.status.good : tone === 'muted' ? VIZ.ink.muted : VIZ.brand;
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={name}
      >
        <title>{name}</title>
        <rect x={0} y={0} width={width} height={height} rx={MARK_RADIUS} fill={VIZ.neutral.empty} />
        {pct > 0 ? (
          <rect
            x={0}
            y={0}
            width={(pct / 100) * width}
            height={height}
            rx={MARK_RADIUS}
            fill={fill}
          />
        ) : null}
      </svg>
      <span className="text-xs tabular-nums text-slate-600">{pct}%</span>
    </span>
  );
}
