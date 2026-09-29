import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { guidance, scoreArl, type ArlFlag } from '@/domain/arl';
import type { ArlFramework } from '@/domain/schemas';
import { serializeSession } from '@/domain/json';
import { downloadBlob, slugify, timestampForFilename } from '@/export/download';
import { useSessionStore } from '@/state/sessionStore';
import {
  Callout,
  PageHeader,
  SourceNote,
  SourceText,
  SourceTranslation,
  Stat,
  withTranslation,
} from '@/components/ui';
import { ArlScale } from '@/components/viz/ArlScale';
import { ArlLookupGrid } from '@/components/viz/ArlLookupGrid';
import { VIZ } from '@/components/viz/tokens';
import { RiskGlyph, RiskLegend } from '@/components/viz/RiskGlyph';
import { RiskTallyBar } from '@/components/viz/RiskTallyBar';
import { useT } from '@/i18n/store';
import { arlFlagText, disclaimerText } from '@/i18n/domainText';

function FlagList({ flags, total }: { flags: ArlFlag[]; total: number }) {
  const tr = useT();
  if (!flags.length) return <p className="text-sm text-emerald-800">{tr.t('flags.none')}</p>;
  return (
    <ul className="space-y-2">
      {flags.map((flag) => (
        <li key={flag.code}>
          <Callout tone={flag.affectsScore ? 'warning' : 'info'}>
            {arlFlagText(tr, flag, total)}
          </Callout>
        </li>
      ))}
    </ul>
  );
}

export function ArlResultPage({ framework }: { framework: ArlFramework }) {
  const tr = useT();
  const { t } = tr;
  const session = useSessionStore((s) => s.session);
  const trlFramework = useSessionStore((s) => s.framework);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const arl = session.arl;

  const result = useMemo(() => (arl ? scoreArl(framework, arl) : null), [framework, arl]);
  if (!arl || !result) return <Navigate to="/arl" replace />;

  const { start, end } = result;
  const scopeMissing =
    !arl.context.technologyScope?.trim() || !arl.context.evaluationTimeline?.trim();
  const falsePrecision = guidance(framework, 'false-precision');
  const targetById = new Map(end.outcomes.map((o) => [o.dimension.id, o]));

  const downloadJson = () => {
    const name = `ARL_${slugify(arl.context.projectName || 'assessment')}_${timestampForFilename()}.json`;
    downloadBlob(new Blob([serializeSession(session)], { type: 'application/json' }), name);
  };

  const downloadExcel = async () => {
    setBusy(true);
    setError(null);
    try {
      // Lazy-loaded so ExcelJS never lands in the initial bundle.
      const { exportArlWorkbook } = await import('@/export/excel/arl');
      await exportArlWorkbook(framework, session, trlFramework);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title={t('arl.result.title')}
        lead={`${arl.context.technologyName} · ${arl.context.projectName}`}
      />

      <section className="card" aria-live="polite">
        <ArlScale
          framework={framework}
          start={start.arl}
          end={end.arl}
          label={t('arl.result.scaleLabel', {
            start: start.arl,
            startBand: withTranslation(tr, start.band),
            end: end.arl,
            endBand: withTranslation(tr, end.band),
          })}
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label={t('arl.common.start')}
          value={t('arl.common.value', { level: start.arl })}
          hint={t('arl.result.startHint', {
            band: withTranslation(tr, start.band),
            medium: start.tally.Medium,
            high: start.tally.High,
          })}
          emphasis
          accent={{ color: VIZ.brand }}
          testId="arl-start"
        />
        <Stat
          label={t('arl.common.endTarget')}
          value={t('arl.common.value', { level: end.arl })}
          hint={t('arl.result.endHint', {
            band: withTranslation(tr, end.band),
            target: t('label.arlTarget'),
          })}
          accent={{ color: VIZ.target, dashed: true }}
          testId="arl-end"
        />
        <Stat
          label={t('arl.result.change')}
          value={result.change > 0 ? `+${result.change}` : String(result.change)}
          testId="arl-change"
        />
      </div>

      {scopeMissing ? (
        <Callout tone="info">
          {t('arl.result.scopeMissing.before')}{' '}
          <Link to="/arl" className="underline">
            {t('arl.result.scopeMissing.link')}
          </Link>
          {t('arl.result.scopeMissing.after')}
        </Callout>
      ) : null}

      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{t('arl.result.profile')}</h2>
          {falsePrecision ? (
            <p className="mt-1 text-xs text-slate-600">
              “{falsePrecision.text}” <SourceNote {...falsePrecision.source} compact />
              <SourceTranslation text={falsePrecision.text} />
            </p>
          ) : null}
        </div>
        <RiskLegend />
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <caption className="sr-only">{t('arl.result.caption')}</caption>
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-2 pe-3">
                  {t('arl.result.col.dimension')}
                </th>
                <th scope="col" className="py-2 pe-3">
                  {t('arl.result.col.current')}
                </th>
                <th scope="col" className="py-2 pe-3">
                  {t('arl.result.col.target')}
                </th>
                <th scope="col" className="py-2">
                  {t('arl.result.col.plannedAction')}
                </th>
              </tr>
            </thead>
            {start.byArea.map(({ area, tally, outcomes }) => (
              <tbody key={area.id}>
                <tr className="bg-slate-50">
                  <th scope="rowgroup" colSpan={4} className="px-2 py-2 text-start">
                    <span className="font-semibold">
                      {area.id}. <SourceText text={area.name} inline />
                    </span>{' '}
                    <RiskTallyBar tally={tally} className="ms-2 align-middle" />
                  </th>
                </tr>
                {outcomes.map((o) => {
                  const target = targetById.get(o.dimension.id)!;
                  return (
                    <tr key={o.dimension.id} className="border-b border-slate-100 align-top">
                      <th scope="row" className="py-2 pe-3 font-normal">
                        <span className="me-2 font-mono text-xs text-slate-600">
                          {o.dimension.id}
                        </span>
                        <SourceText text={o.dimension.title} inline />
                      </th>
                      <td className="py-2 pe-3">
                        <RiskGlyph rating={o.rating} withLabel />
                        {o.conservativeReason ? (
                          <span className="block text-xs text-amber-800">
                            {t('arl.result.countedHigh')}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 pe-3">
                        <RiskGlyph rating={target.rating} withLabel />
                        {target.inherited ? (
                          <span className="block text-xs text-slate-500">
                            {t('arl.result.sameAsCurrent')}
                          </span>
                        ) : target.reducesRisk ? (
                          <span className="block text-xs text-emerald-800">
                            {t('arl.result.plannedReduction')}
                          </span>
                        ) : null}
                        {target.conservativeReason ? (
                          <span className="block text-xs text-amber-800">
                            {t('arl.result.countedHigh')}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 text-xs text-slate-700">{o.plannedAction ?? ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">{t('arl.result.flags')}</h2>
        <h3 className="text-sm font-semibold text-slate-600">{t('arl.result.flags.current')}</h3>
        <FlagList flags={start.flags} total={framework.dimensions.length} />
        <h3 className="text-sm font-semibold text-slate-600">{t('arl.result.flags.targets')}</h3>
        <FlagList flags={end.flags} total={framework.dimensions.length} />
      </section>

      <section className="card space-y-4" aria-labelledby="arl-how-read">
        <h2 id="arl-how-read" className="text-xl font-semibold">
          {t('arl.result.howRead')}
        </h2>
        <ol className="list-decimal space-y-1.5 ps-6 text-base leading-relaxed text-slate-800">
          <li>{t('arl.result.howRead.step1')}</li>
          <li>{t('arl.result.howRead.step2')}</li>
          <li>{t('arl.result.howRead.step3')}</li>
        </ol>
        <div className="grid gap-3 md:grid-cols-2">
          <ReadingCard
            kind="start"
            cap={framework.lookup.cap}
            medium={start.tally.Medium}
            high={start.tally.High}
            arl={start.arl}
            band={start.band}
          />
          <ReadingCard
            kind="target"
            cap={framework.lookup.cap}
            medium={end.tally.Medium}
            high={end.tally.High}
            arl={end.arl}
            band={end.band}
            unchanged={
              end.tally.Medium === start.tally.Medium && end.tally.High === start.tally.High
            }
          />
        </div>
        <ArlLookupGrid
          framework={framework}
          marks={[
            {
              medium: start.tally.Medium,
              high: start.tally.High,
              label: t('arl.result.mark.start'),
              style: 'solid',
            },
            {
              medium: end.tally.Medium,
              high: end.tally.High,
              label: t('arl.result.mark.target'),
              style: 'dashed',
            },
          ]}
        />
      </section>

      <section className="card border-amber-200 bg-amber-50" aria-label={t('ui.disclaimer.aria')}>
        <p className="text-sm font-semibold text-amber-900">{t('label.arl')}</p>
        <p className="mt-2 text-xs text-amber-900/90">{disclaimerText(tr, 'arl')}</p>
        <p className="mt-2 text-xs text-amber-900/90">
          <SourceText text={framework.disclaimer} />
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">{t('arl.result.takeAway')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={downloadExcel} disabled={busy}>
            {busy ? t('arl.result.building') : t('arl.result.downloadExcel')}
          </button>
          <button type="button" className="btn-secondary" onClick={downloadJson}>
            {t('arl.result.downloadJson')}
          </button>
          <Link className="btn-secondary" to="/arl/rate">
            {t('arl.result.backToRatings')}
          </Link>
          <Link className="btn-secondary" to="/guide/arl">
            {t('arl.result.howScored')}
          </Link>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-slate-500">{t('arl.result.jsonNote')}</p>
      </section>
    </div>
  );
}

/**
 * One reading of the look-up table, spelled out with the assessment's own numbers:
 * the two counts, the cell they point to, and the ARL printed there. Start is solid brand blue,
 * the target dashed violet — the same marks as on the scale and in the table.
 */
function ReadingCard({
  kind,
  cap,
  medium,
  high,
  arl,
  band,
  unchanged = false,
}: {
  kind: 'start' | 'target';
  cap: number;
  medium: number;
  high: number;
  arl: number;
  band: string;
  unchanged?: boolean;
}) {
  const tr = useT();
  const { t } = tr;
  const isStart = kind === 'start';
  const colour = isStart ? VIZ.brand : VIZ.target;
  const cell = (n: number) => (n >= cap ? `${cap}+` : String(n));
  return (
    <div
      className="rounded-xl p-4"
      style={{
        border: `3px ${isStart ? 'solid' : 'dashed'} ${colour}`,
        background: isStart ? VIZ.brandSoft : VIZ.targetSoft,
      }}
      data-testid={`arl-read-${kind}`}
    >
      <p className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-base font-bold"
          style={
            isStart
              ? { background: colour, color: VIZ.surface }
              : { background: VIZ.surface, color: colour, border: `2px dashed ${colour}` }
          }
        >
          {t(isStart ? 'arl.result.mark.start' : 'arl.result.mark.target')}
        </span>
        {unchanged ? (
          <span className="text-sm text-slate-700">{t('arl.result.read.noChange')}</span>
        ) : null}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <dt className="text-sm text-slate-700">{t('risk.Medium')}</dt>
          <dd className="text-2xl font-bold text-slate-900">{medium}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-700">{t('risk.High')}</dt>
          <dd className="text-2xl font-bold text-slate-900">{high}</dd>
        </div>
      </dl>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-base text-slate-800">
        <span>{t('arl.result.read.cell', { medium: cell(medium), high: cell(high) })}</span>
        <span aria-hidden="true">→</span>
        <strong className="text-3xl font-extrabold text-slate-900">
          {t('arl.common.value', { level: arl })}
        </strong>
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{withTranslation(tr, band)}</p>
    </div>
  );
}
