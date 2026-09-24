import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';
import { criteriaByLevel } from '@/domain/frameworks';
import { scoreTier1 } from '@/domain/tier1';
import { serializeSession } from '@/domain/json';
import { downloadBlob, sessionSlug, timestampForFilename } from '@/export/download';
import { Callout, Disclaimer, PageHeader, Stat } from '@/components/ui';
import { TrlLadder } from '@/components/viz/TrlLadder';
import { StatusGlyph } from '@/components/viz/StatusGlyph';
import { MatrixHeatmap } from '@/components/viz/MatrixHeatmap';
import type { TrlLevel } from '@/domain/schemas';
import type { MessageKey } from '@/i18n/en';
import { useT } from '@/i18n/store';
import { tier1FlagText, trlText } from '@/i18n/domainText';

export function QuickResult() {
  const framework = useSessionStore((s) => s.framework);
  const session = useSessionStore((s) => s.session);
  const tr = useT();
  const { t } = tr;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(
    () => (session.tier1 ? scoreTier1(framework, session.tier1) : null),
    [framework, session.tier1],
  );

  if (!session.tier1 || !result) return <Navigate to="/quick" replace />;

  const nextLevel = Math.min(9, result.contiguousTrl + 1) as TrlLevel;
  const allNext = criteriaByLevel(framework, nextLevel);
  // The mandatory ones are what actually gate the level; the rest are counted, not listed.
  const nextCriteria = allNext.filter((c) => c.mandatory);
  const optionalCount = allNext.length - nextCriteria.length;

  const downloadJson = () => {
    const name = `TRL_Tier1_${sessionSlug(session)}_${timestampForFilename()}.json`;
    downloadBlob(new Blob([serializeSession(session)], { type: 'application/json' }), name);
  };

  const downloadExcel = async () => {
    setBusy(true);
    setError(null);
    try {
      // Lazy-loaded so ExcelJS never lands in the initial bundle.
      const { exportTier1Workbook } = await import('@/export/excel/tier1');
      await exportTier1Workbook(framework, session);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={t('tier1.result.title')}
        lead={`${session.tier1.context.technologyName} · ${session.tier1.context.projectName}`}
      />

      <section className="card" aria-live="polite">
        <TrlLadder
          achieved={result.contiguousTrl}
          gaps={result.flags.find((f) => f.code === 'gap')?.levels ?? []}
          current={nextLevel}
          markers={[
            { level: Math.max(1, result.contiguousTrl), label: t('tier1.result.marker.estimate') },
            ...(result.firstYesTrl > result.contiguousTrl
              ? [
                  {
                    level: result.firstYesTrl,
                    label: t('tier1.result.marker.claimed'),
                    tone: 'critical' as const,
                  },
                ]
              : []),
            ...(result.matrixTrl > 0 && result.matrixTrl !== result.contiguousTrl
              ? [
                  {
                    level: result.matrixTrl,
                    label: t('tier1.result.marker.crossCheck'),
                    tone: 'muted' as const,
                  },
                ]
              : []),
          ]}
          label={t('tier1.result.ladderLabel', {
            estimate: result.contiguousTrl,
            claimed: result.firstYesTrl,
            matrix: result.matrixTrl,
          })}
        />
        <p className="mt-2 text-xs text-slate-500">{t('tier1.result.ladderNote')}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label={t('tier1.result.estimated')}
          value={trlText(tr, result.contiguousTrl)}
          hint={t('tier1.result.estimatedHint')}
          emphasis
          testId="estimated-trl"
        />
        <Stat
          label={t('tier1.result.claimed')}
          value={trlText(tr, result.firstYesTrl)}
          hint={t('tier1.result.claimedHint')}
          testId="first-yes-trl"
        />
        <Stat
          label={t('tier1.result.matrix')}
          value={trlText(tr, result.matrixTrl)}
          hint={t('tier1.result.matrixHint', {
            build: session.tier1.context.build,
            environment: session.tier1.context.environment,
            status: framework.matrix.status,
          })}
          testId="matrix-trl"
        />
      </div>

      <section className="card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('tier1.result.consistency', {
            rating: t(`consistency.${result.consistency}` as MessageKey),
          })}
        </h2>
        <div className="mt-3">
          <MatrixHeatmap
            matrix={framework.matrix}
            build={session.tier1.context.build}
            environment={session.tier1.context.environment}
          />
        </div>
        <p className="mt-2 text-sm text-slate-700">
          {t(`tier1.result.consistencyHelp.${result.consistency}` as MessageKey)}
        </p>
        {result.flags.length ? (
          <ul className="mt-3 space-y-2">
            {result.flags.map((flag) => (
              <li key={flag.code}>
                <Callout tone={flag.code === 'gap' ? 'warning' : 'info'}>
                  {tier1FlagText(tr, flag)}
                </Callout>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-emerald-800">{t('flags.none')}</p>
        )}
      </section>

      <Disclaimer label={t('label.tier1')} />

      <section className="card">
        <h2 className="text-lg font-semibold">{t('tier1.result.nextHeading')}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {nextCriteria.length > 0
            ? t('tier1.result.nextMandatory', { trl: trlText(tr, nextLevel) })
            : t('tier1.result.nextNoMandatory', { trl: trlText(tr, nextLevel) })}
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {(nextCriteria.length > 0 ? nextCriteria : allNext.slice(0, 5)).map((c) => (
            <li key={c.id} className="flex gap-2">
              <StatusGlyph kind="Not assessed" size={14} className="mt-0.5 shrink-0" />
              <span>
                {c.text} <span className="font-mono text-xs text-slate-500">{c.id}</span>
              </span>
            </li>
          ))}
        </ul>
        {optionalCount > 0 ? (
          <p className="mt-2 text-xs text-slate-500">
            {t(optionalCount === 1 ? 'tier1.result.optional.one' : 'tier1.result.optional.other', {
              count: optionalCount,
            })}
          </p>
        ) : null}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">{t('tier1.result.takeAway')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={downloadExcel} disabled={busy}>
            {busy ? t('tier1.result.building') : t('tier1.result.downloadExcel')}
          </button>
          <button type="button" className="btn-secondary" onClick={downloadJson}>
            {t('tier1.result.downloadJson')}
          </button>
          <Link className="btn-secondary" to="/assess">
            {t('tier1.result.continue')}
          </Link>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-slate-500">{t('tier1.result.filesNote')}</p>
      </section>
    </div>
  );
}
