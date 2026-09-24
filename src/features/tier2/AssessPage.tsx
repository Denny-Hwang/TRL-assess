import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { CteRegister } from './CteRegister';
import { CriteriaPanel } from './CriteriaPanel';
import { EvidenceLibrary } from './EvidenceLibrary';
import { AssessResult } from './AssessResult';
import { useSessionStore } from '@/state/sessionStore';
import { SaveIndicator } from '@/components/SaveIndicator';
import { Callout, PageHeader } from '@/components/ui';
import { FICTIONAL_EXAMPLE, FICTIONAL_EXAMPLE_NAME } from '@/data/examples';
import { parseSession } from '@/domain/session';
import { useT } from '@/i18n/store';

function Workbench() {
  const { t } = useT();
  const session = useSessionStore((s) => s.session);
  const replaceSession = useSessionStore((s) => s.replaceSession);
  const ctes = session.tier2?.ctes ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(ctes[0]?.id ?? null);
  const [drawer, setDrawer] = useState<{ cteId: string; criterionId: string } | null>(null);
  const [confirmExample, setConfirmExample] = useState(false);

  const selected = ctes.find((c) => c.id === selectedId) ?? ctes[0] ?? null;

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('tier2.page.title')}
        lead={t('tier2.page.lead')}
      >
        <div className="flex flex-col items-end gap-1">
          <SaveIndicator />
          <div className="flex gap-2 text-xs">
            <Link className="underline" to="/assess/evidence">
              {t('tier2.page.evidenceLink')}
            </Link>
            <Link className="underline" to="/assess/result">
              {t('tier2.page.resultsLink')}
            </Link>
          </div>
        </div>
      </PageHeader>

      {ctes.length === 0 ? (
        <Callout tone="info" title={t('tier2.page.empty.title')}>
          {confirmExample ? (
            <span className="flex flex-wrap items-center gap-2">
              {t('tier2.page.empty.confirm', { name: FICTIONAL_EXAMPLE_NAME })}
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  replaceSession(parseSession(FICTIONAL_EXAMPLE));
                  setConfirmExample(false);
                }}
              >
                {t('tier2.page.empty.confirmYes')}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmExample(false)}
              >
                {t('tier2.common.cancel')}
              </button>
            </span>
          ) : (
            <>
              {t('tier2.page.empty.before')}{' '}
              <button type="button" className="underline" onClick={() => setConfirmExample(true)}>
                {t('tier2.page.empty.link')}
              </button>{' '}
              {t('tier2.page.empty.after')}
            </>
          )}
        </Callout>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr] xl:grid-cols-[20rem_1fr_22rem]">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <CteRegister selectedId={selected?.id ?? null} onSelect={setSelectedId} />
        </div>

        <div>
          {selected ? (
            <CriteriaPanel
              cte={selected}
              onOpenEvidence={(criterionId) => setDrawer({ cteId: selected.id, criterionId })}
            />
          ) : (
            <p className="text-sm text-slate-500">{t('tier2.page.selectCte')}</p>
          )}
        </div>

        <aside
          className={`${drawer ? 'block' : 'hidden xl:block'} xl:sticky xl:top-4 xl:self-start`}
        >
          <div className="card max-h-[80vh] overflow-y-auto">
            <EvidenceLibrary focusCriterion={drawer} onClose={() => setDrawer(null)} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function EvidencePage() {
  const { t } = useT();
  return (
    <div className="max-w-4xl space-y-4">
      <PageHeader
        title={t('tier2.evidencePage.title')}
        lead={t('tier2.evidencePage.lead')}
      >
        <Link className="text-xs underline" to="/assess">
          {t('tier2.evidencePage.back')}
        </Link>
      </PageHeader>
      <div className="card">
        <EvidenceLibrary />
      </div>
      <EvidenceExports />
    </div>
  );
}

function EvidenceExports() {
  const framework = useSessionStore((s) => s.framework);
  const session = useSessionStore((s) => s.session);
  const { t } = useT();
  const [busyKind, setBusyKind] = useState<'excel' | 'zip' | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (kind: 'excel' | 'zip') => {
    setBusyKind(kind);
    setBusy(
      kind === 'excel' ? t('tier2.export.buildingWorkbook') : t('tier2.export.preparingPackage'),
    );
    setError(null);
    setMessage(null);
    try {
      if (kind === 'excel') {
        const { exportTier2Workbook } = await import('@/export/excel/tier2');
        const name = await exportTier2Workbook(framework, session);
        setMessage(t('tier2.export.workbookCreated', { name }));
      } else {
        const { exportEvidencePackage } = await import('@/export/zip/package');
        const name = await exportEvidencePackage(framework, session, setBusy);
        setMessage(t('tier2.export.packageCreated', { name }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyKind(null);
      setBusy(null);
    }
  };

  return (
    <section className="card">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t('tier2.export.heading')}
      </h2>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => void run('excel')}
          disabled={Boolean(busy)}
        >
          {busyKind === 'excel' && busy ? busy : t('tier2.export.excel')}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => void run('zip')}
          disabled={Boolean(busy)}
        >
          {busyKind === 'zip' && busy ? busy : t('tier2.export.zip')}
        </button>
      </div>
      {message ? (
        <p className="mt-2 text-sm text-emerald-800" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-slate-500">
        {t('tier2.export.sensitiveNote', { marking: t('marking.Sensitive — reference only') })}
      </p>
    </section>
  );
}

export function AssessPage() {
  return (
    <Routes>
      <Route index element={<Workbench />} />
      <Route path="evidence" element={<EvidencePage />} />
      <Route path="result" element={<AssessResult />} />
    </Routes>
  );
}
