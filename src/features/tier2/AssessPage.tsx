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

function Workbench() {
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
        title="Evidence-Based Assessment"
        lead="Break the system into Critical Technology Elements, assess the criteria at each TRL, and link the evidence behind every claim."
      >
        <div className="flex flex-col items-end gap-1">
          <SaveIndicator />
          <div className="flex gap-2 text-xs">
            <Link className="underline" to="/assess/evidence">
              Evidence library
            </Link>
            <Link className="underline" to="/assess/result">
              Results
            </Link>
          </div>
        </div>
      </PageHeader>

      {ctes.length === 0 ? (
        <Callout tone="info" title="Nothing assessed yet">
          {confirmExample ? (
            <span className="flex flex-wrap items-center gap-2">
              Load “{FICTIONAL_EXAMPLE_NAME}”? This replaces the current session.
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  replaceSession(parseSession(FICTIONAL_EXAMPLE));
                  setConfirmExample(false);
                }}
              >
                Yes, load it
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmExample(false)}
              >
                Cancel
              </button>
            </span>
          ) : (
            <>
              Add a CTE below, or{' '}
              <button type="button" className="underline" onClick={() => setConfirmExample(true)}>
                open the fictional example
              </button>{' '}
              to see a completed assessment.
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
            <p className="text-sm text-slate-500">Select or add a CTE to assess its criteria.</p>
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
  return (
    <div className="max-w-4xl space-y-4">
      <PageHeader
        title="Evidence library"
        lead="Everything you have recorded as proof, and what each item is used for."
      >
        <Link className="text-xs underline" to="/assess">
          Back to the assessment
        </Link>
      </PageHeader>
      <div className="card">
        <EvidenceLibrary />
      </div>
    </div>
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
