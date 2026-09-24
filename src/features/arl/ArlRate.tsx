import { memo, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  conservativeReason,
  countedAs,
  dimensionsByArea,
  guidance,
  scoreArl,
  type CountedAs,
} from '@/domain/arl';
import {
  ARL_RISKS,
  type ArlDimension,
  type ArlDimensionAssessment,
  type ArlFramework,
  type ArlRating,
  type ArlRisk,
} from '@/domain/schemas';
import { useSessionStore } from '@/state/sessionStore';
import { PageHeader, SourceNote } from '@/components/ui';
import { SaveIndicator } from '@/components/SaveIndicator';
import { Meter } from '@/components/viz/Meter';
import { RiskGlyph, RiskLegend } from '@/components/viz/RiskGlyph';
import { useT } from '@/i18n/store';
import { arlReasonText, ratingText } from '@/i18n/domainText';
import type { MessageKey } from '@/i18n/en';
import type { Translator } from '@/i18n/translate';

type Patch = Pick<ArlDimensionAssessment, 'dimensionId'> & Partial<ArlDimensionAssessment>;

const RISK_TONE: Record<ArlRisk, string> = {
  Low: 'peer-checked:border-emerald-600 peer-checked:bg-emerald-50',
  Medium: 'peer-checked:border-amber-600 peer-checked:bg-amber-50',
  High: 'peer-checked:border-red-600 peer-checked:bg-red-50',
};

function riskText(tr: Translator, risk: ArlRisk): string {
  return tr.t(`risk.${risk}` as MessageKey);
}

/** How the rating is counted, when no conservative reason applies. */
function countedText(tr: Translator, counted: CountedAs): string {
  return counted === 'N/A'
    ? tr.t('arl.rate.notCountedNa')
    : tr.t('arl.rate.countedAs', { risk: riskText(tr, counted) });
}

const DimensionCard = memo(function DimensionCard({
  dimension,
  assessment,
  onChange,
}: {
  dimension: ArlDimension;
  assessment: ArlDimensionAssessment | undefined;
  onChange: (patch: Patch) => void;
}) {
  const tr = useT();
  const { t } = tr;
  const id = dimension.id;
  const current: ArlRating = assessment?.current ?? 'Not assessed';
  const rationale = assessment?.rationale ?? '';
  const reason = conservativeReason(current, rationale);
  const counted = countedAs(current, rationale);
  const update = (patch: Omit<Patch, 'dimensionId'>) => onChange({ dimensionId: id, ...patch });

  return (
    <article
      id={id}
      className="card scroll-mt-4 space-y-3"
      aria-labelledby={`${id}-title`}
      data-testid={`dimension-${id}`}
    >
      <header>
        <h3 id={`${id}-title`} className="text-base font-semibold">
          <span className="me-2 font-mono text-xs text-slate-600">{id}</span>
          {dimension.title}
        </h3>
        <p className="mt-1 text-sm text-slate-600">{dimension.description}</p>
        <SourceNote {...dimension.source} compact />
      </header>

      <fieldset>
        <legend className="text-sm font-medium text-slate-800">{t('arl.rate.currentRisk')}</legend>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {ARL_RISKS.map((risk) => (
            <label key={risk} className="relative block cursor-pointer">
              <input
                type="radio"
                name={`${id}-current`}
                value={risk}
                checked={current === risk}
                onChange={() => update({ current: risk })}
                className="peer sr-only"
              />
              <span
                className={`block h-full rounded-md border border-slate-200 p-3 text-sm peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 ${RISK_TONE[risk]}`}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <RiskGlyph rating={risk} decorative />
                  {riskText(tr, risk)}
                </span>
                <span className="mt-1 block whitespace-pre-line text-slate-700">
                  {dimension.levels[risk]}
                </span>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['N/A', 'Unsure'] as const).map((rating) => (
            <label key={rating} className="relative cursor-pointer">
              <input
                type="radio"
                name={`${id}-current`}
                value={rating}
                checked={current === rating}
                onChange={() => update({ current: rating })}
                className="peer sr-only"
              />
              <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm peer-checked:border-slate-600 peer-checked:bg-slate-100 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600">
                <RiskGlyph rating={rating} decorative />
                {rating === 'N/A' ? t('arl.rate.naOption') : ratingText(tr, 'Unsure')}
              </span>
            </label>
          ))}
          {current !== 'Not assessed' ? (
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 underline hover:text-slate-900"
              onClick={() => update({ current: 'Not assessed' })}
            >
              {t('arl.rate.clear')}
            </button>
          ) : null}
        </div>
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-600" aria-live="polite">
          <RiskGlyph rating={current} withLabel />
          <span>
            — {arlReasonText(tr, current, reason) ?? countedText(tr, counted)}
          </span>
        </p>
      </fieldset>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label" htmlFor={`${id}-rationale`}>
            {t(current === 'N/A' ? 'arl.rate.rationaleRequired' : 'arl.rate.rationale')}
          </label>
          <textarea
            id={`${id}-rationale`}
            className="input min-h-[3.5rem]"
            value={rationale}
            onChange={(e) => update({ rationale: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor={`${id}-evidence`}>
            {t('arl.rate.evidence')}
          </label>
          <input
            id={`${id}-evidence`}
            className="input"
            placeholder={t('arl.rate.evidence.placeholder')}
            value={assessment?.evidence ?? ''}
            onChange={(e) => update({ evidence: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor={`${id}-target`}>
            {t('arl.rate.target')}
          </label>
          <select
            id={`${id}-target`}
            className="input"
            value={assessment?.target ?? ''}
            disabled={current === 'N/A'}
            onChange={(e) =>
              update({ target: e.target.value ? (e.target.value as ArlRisk) : undefined })
            }
          >
            <option value="">{t('arl.rate.sameAsCurrent')}</option>
            {ARL_RISKS.map((risk) => (
              <option key={risk} value={risk}>
                {riskText(tr, risk)}
              </option>
            ))}
          </select>
        </div>
        {assessment?.target ? (
          <div>
            <label className="label" htmlFor={`${id}-plan`}>
              {t('arl.rate.plannedAction')}
            </label>
            <input
              id={`${id}-plan`}
              className="input"
              placeholder={t('arl.rate.plannedAction.placeholder')}
              value={assessment?.plannedAction ?? ''}
              onChange={(e) => update({ plannedAction: e.target.value })}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
});

export function ArlRate({ framework }: { framework: ArlFramework }) {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const arl = useSessionStore((s) => s.session.arl);
  const setArlDimension = useSessionStore((s) => s.setArlDimension);
  const groups = useMemo(() => dimensionsByArea(framework), [framework]);
  const byId = useMemo(
    () => new Map((arl?.dimensions ?? []).map((d) => [d.dimensionId, d])),
    [arl?.dimensions],
  );
  const result = useMemo(() => (arl ? scoreArl(framework, arl) : null), [framework, arl]);

  if (!arl || !result) return <Navigate to="/arl" replace />;

  const total = framework.dimensions.length;
  const rated = result.start.outcomes.filter((o) => o.rating !== 'Not assessed').length;
  const rate = guidance(framework, 'rate');

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={t('arl.rate.title')}
        lead={`${arl.context.technologyName} · ${arl.context.projectName}`}
      >
        <SaveIndicator />
      </PageHeader>

      <section className="card space-y-3" aria-label={t('arl.rate.progress')}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Meter value={Math.round((rated / total) * 100)} label={t('arl.rate.meter')} />
          <span>{t('arl.rate.rated', { rated, total })}</span>
          <span data-testid="live-arl-start">
            {t('arl.common.start')} <strong>{result.start.arl}</strong>
          </span>
          <span data-testid="live-arl-end">
            {t('arl.common.endTarget')} <strong>{result.end.arl}</strong>
          </span>
        </div>
        {rate ? (
          <p className="text-xs text-slate-500">
            “{rate.text}” <SourceNote {...rate.source} compact /> {t('arl.rate.conservative')}
          </p>
        ) : null}
        {lang !== 'en' ? <p className="text-xs text-slate-500">{t('sourceText.note')}</p> : null}
        <RiskLegend />
        <nav aria-label={t('arl.rate.areasNav')} className="flex flex-wrap gap-2 text-sm">
          {groups.map(({ area }) => (
            <a key={area.id} href={`#area-${area.id}`} className="underline">
              {area.id}. {area.name}
            </a>
          ))}
        </nav>
      </section>

      {groups.map(({ area, dimensions }) => (
        <section key={area.id} className="space-y-3" aria-labelledby={`area-${area.id}`}>
          <div>
            <h2 id={`area-${area.id}`} className="scroll-mt-4 text-xl font-semibold">
              {area.id}. {area.name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {area.description} <SourceNote {...area.source} compact />
            </p>
          </div>
          {dimensions.map((dimension) => (
            <DimensionCard
              key={dimension.id}
              dimension={dimension}
              assessment={byId.get(dimension.id)}
              onChange={setArlDimension}
            />
          ))}
        </section>
      ))}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={() => navigate('/arl/result')}>
          {t('arl.rate.seeResult')}
        </button>
        <Link to="/arl" className="btn-secondary">
          {t('arl.rate.backToScope')}
        </Link>
      </div>
    </div>
  );
}
