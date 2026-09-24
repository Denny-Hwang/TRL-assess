import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSessionStore } from '@/state/sessionStore';
import { scoreTier2, tierDelta } from '@/domain/tier2';
import { scoreTier1 } from '@/domain/tier1';
import { deserializeSession, serializeSession } from '@/domain/json';
import { downloadBlob, sessionSlug, timestampForFilename } from '@/export/download';
import { Callout, Disclaimer, PageHeader, Stat } from '@/components/ui';
import { CteBars } from '@/components/viz/CteBars';
import { Meter } from '@/components/viz/Meter';
import { deltaText, gapReasonText, trlText } from '@/i18n/domainText';
import { useT } from '@/i18n/store';

export function AssessResult() {
  const tr = useT();
  const { t } = tr;
  const framework = useSessionStore((s) => s.framework);
  const session = useSessionStore((s) => s.session);
  const replaceSession = useSessionStore((s) => s.replaceSession);
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const result = useMemo(
    () => (session.tier2 ? scoreTier2(framework, session.tier2) : null),
    [framework, session.tier2],
  );
  const tier1 = useMemo(
    () => (session.tier1 ? scoreTier1(framework, session.tier1) : null),
    [framework, session.tier1],
  );
  const delta = result ? tierDelta(result.system, tier1?.contiguousTrl) : null;
  const deltaExplanation = delta ? deltaText(tr, delta) : undefined;

  const downloadJson = () => {
    downloadBlob(
      new Blob([serializeSession(session)], { type: 'application/json' }),
      `TRL_Tier2_${sessionSlug(session)}_${timestampForFilename()}.json`,
    );
  };

  const importJson = async (file: File) => {
    setError(null);
    setMessage(null);
    try {
      const { session: imported, warnings } = deserializeSession(await file.text());
      replaceSession(imported);
      setMessage(
        warnings.length
          ? t('tier2.result.importedWarnings', { warnings: warnings.join(' ') })
          : t('tier2.result.imported'),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const runExport = async (kind: 'excel' | 'zip') => {
    setBusy(kind === 'excel' ? 'excel' : t('tier2.export.preparingPackage'));
    setError(null);
    setMessage(null);
    try {
      if (kind === 'excel') {
        // Lazy-loaded so ExcelJS never lands in the initial bundle.
        const { exportTier2Workbook } = await import('@/export/excel/tier2');
        const name = await exportTier2Workbook(framework, session);
        setMessage(t('tier2.export.workbookCreated', { name }));
      } else {
        const { exportEvidencePackage } = await import('@/export/zip/package');
        const name = await exportEvidencePackage(framework, session, (msg) => setBusy(msg));
        setMessage(t('tier2.export.packageCreated', { name }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  if (!result || result.ctes.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader title={t('tier2.result.title')} />
        <Callout tone="info">
          {t('tier2.result.empty.before')}{' '}
          <Link className="underline" to="/assess">
            {t('tier2.result.empty.link')}
          </Link>{' '}
          {t('tier2.result.empty.after')}
        </Callout>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('tier2.result.title')}
        lead={session.tier1?.context.projectName ?? t('tier2.result.untitled')}
      />

      <div className="grid gap-4 sm:grid-cols-3" aria-live="polite">
        <Stat
          label={t('tier2.result.stat.system')}
          value={result.system.computed ? trlText(tr, result.system.trl ?? 0) : '—'}
          hint={result.system.computed ? t('tier2.systemNote') : t('tier2.noCritical')}
          emphasis
          testId="system-trl"
        />
        <Stat
          label={t('tier2.result.stat.limiting')}
          value={result.system.limitingCteIds.join(', ') || '—'}
          hint={t('tier2.result.stat.limitingHint')}
          testId="limiting-ctes"
        />
        <Stat
          label={t('tier2.result.stat.tier1')}
          value={
            tier1
              ? `${trlText(tr, tier1.contiguousTrl)} → ${delta?.delta === null ? '—' : `Δ ${delta?.delta}`}`
              : t('tier2.result.stat.noTier1')
          }
          hint={deltaExplanation ?? t('tier2.result.stat.tier1Hint')}
          testId="tier-delta"
        />
      </div>

      {delta?.significant && deltaExplanation ? (
        <Callout tone="warning" title={t('tier2.result.deltaTitle')}>
          {deltaExplanation}
        </Callout>
      ) : null}

      <section className="card">
        <h2 className="text-lg font-semibold">{t('tier2.result.standsHeading')}</h2>
        <div className="mt-3">
          <CteBars
            ctes={result.ctes}
            systemTrl={result.system.trl}
            limitingIds={result.system.limitingCteIds}
          />
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="text-lg font-semibold">{t('tier2.result.perCteHeading')}</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-start">
              <th className="py-2 pe-3">{t('tier2.result.col.cte')}</th>
              <th className="py-2 pe-3">{t('tier2.result.col.critical')}</th>
              <th className="py-2 pe-3">{t('tier2.result.col.assessed')}</th>
              <th className="py-2 pe-3">{t('tier2.result.col.target')}</th>
              <th className="py-2 pe-3">{t('tier2.result.col.completeness')}</th>
              <th className="py-2 pe-3">{t('tier2.evidenceCoverage')}</th>
            </tr>
          </thead>
          <tbody>
            {result.ctes.map((c) => (
              <tr key={c.cte.id} className="border-b border-slate-100">
                <td className="py-2 pe-3">
                  <span className="font-mono text-xs text-slate-500">{c.cte.id}</span> {c.cte.name}
                </td>
                <td className="py-2 pe-3">{c.cte.critical ? t('answer.Yes') : t('answer.No')}</td>
                <td className="py-2 pe-3 font-medium">{trlText(tr, c.trl)}</td>
                <td className="py-2 pe-3">{c.cte.targetTrl ?? '—'}</td>
                <td className="py-2 pe-3">
                  <Meter
                    value={c.nextLevelCompletenessPct}
                    label={t('tier2.result.meter.completeness', { id: c.cte.id })}
                    width={64}
                  />
                </td>
                <td className="py-2 pe-3">
                  <Meter
                    value={c.evidenceCoveragePct}
                    label={t('tier2.result.meter.coverage', { id: c.cte.id })}
                    width={64}
                    tone="good"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Disclaimer label={t('label.tier2')} />

      <section className="card">
        <h2 className="text-lg font-semibold">{t('tier2.result.gapsHeading')}</h2>
        {result.ctes.every((c) => c.gaps.length === 0) ? (
          <p className="mt-2 text-sm text-emerald-800">
            {t('tier2.result.noGaps')}
          </p>
        ) : (
          result.ctes
            .filter((c) => c.gaps.length)
            .map((c) => (
              <div key={c.cte.id} className="mt-3">
                <h3 className="text-sm font-semibold">
                  {t('tier2.result.gapHeading', {
                    id: c.cte.id,
                    name: c.cte.name,
                    level: c.nextLevel ?? '',
                  })}
                </h3>
                <ul className="mt-1 list-disc space-y-1 ps-5 text-sm text-slate-700">
                  {c.gaps.map((g) => (
                    <li key={g.criterionId}>
                      <span className="font-mono text-xs text-slate-500">{g.criterionId}</span>{' '}
                      {g.criterionText} <em className="text-slate-500">({gapReasonText(tr, g)})</em>
                    </li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">{t('tier2.result.takeAway')}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={() => void runExport('excel')}
            disabled={Boolean(busy)}
          >
            {busy === 'excel' ? t('tier2.export.buildingWorkbook') : t('tier2.export.excel')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void runExport('zip')}
            disabled={Boolean(busy)}
          >
            {busy && busy !== 'excel' ? busy : t('tier2.export.zip')}
          </button>
          <button type="button" className="btn-secondary" onClick={downloadJson}>
            {t('tier2.result.downloadJson')}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileInput.current?.click()}
          >
            {t('tier2.result.importJson')}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label={t('tier2.result.importAria')}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importJson(file);
              e.target.value = '';
            }}
          />
        </div>
        {message ? (
          <p className="mt-3 text-sm text-emerald-800" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
