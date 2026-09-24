import type { ArlFramework } from '@/domain/schemas';
import { useT } from '@/i18n/store';
import { SourceText } from '@/components/ui';

const AREA_TONE = ['border-teal-300', 'border-sky-300', 'border-blue-300', 'border-indigo-300'];

/**
 * The rubric at a glance: the four core risk areas, each with its dimensions, in source order.
 * Built from the transcribed data, so it cannot drift from the rubric the app scores against.
 */
export function ArlDimensionMap({
  framework,
  className,
}: {
  framework: ArlFramework;
  className?: string;
}) {
  const { t } = useT();
  return (
    <figure className={className}>
      <ul className="grid gap-2 md:grid-cols-2" aria-label={t('arl.map.aria')}>
        {framework.areas.map((area, index) => {
          const dimensions = framework.dimensions.filter((d) => d.areaId === area.id);
          return (
            <li
              key={area.id}
              className={`rounded-md border-s-4 bg-white p-3 shadow-sm ${AREA_TONE[index % AREA_TONE.length]}`}
            >
              <p className="text-sm font-semibold">
                {area.id}. <SourceText text={area.name} inline />{' '}
                <span className="font-normal text-slate-500">
                  —{' '}
                  {t(dimensions.length === 1 ? 'arl.map.count.one' : 'arl.map.count.other', {
                    count: dimensions.length,
                  })}
                </span>
              </p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {dimensions.map((d) => (
                  <li
                    key={d.id}
                    className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-800"
                  >
                    <span className="font-mono text-slate-600">{d.id.replace('ARL-', '')}</span>{' '}
                    <SourceText text={d.title} inline />
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <figcaption className="mt-2 text-xs text-slate-500">
        {t('arl.map.caption', {
          dimensions: framework.dimensions.length,
          areas: framework.areas.length,
          name: framework.name,
          version: framework.version,
        })}
      </figcaption>
    </figure>
  );
}
