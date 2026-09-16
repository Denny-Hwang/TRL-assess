import { Link } from 'react-router-dom';
import { APP_NAME, DISCLAIMER, TIER1_LABEL, TIER2_LABEL } from '@/config/app.config';
import { FlowSteps } from '@/components/viz/FlowSteps';
import { TrlLadder } from '@/components/viz/TrlLadder';

export function HomePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          How far has this technology been demonstrated, and can you prove it?
        </p>
        <div className="card mt-4">
          <TrlLadder
            achieved={4}
            current={5}
            markers={[{ level: 4, label: 'where you are' }]}
            label="The TRL scale runs from 1 to 9; an assessment finds the highest level whose evidence holds."
          />
          <p className="mt-2 text-xs text-slate-500">
            A level counts only when every level below it does. This tool finds where the chain
            stops — and what it would take to move one rung.
          </p>
        </div>
      </section>

      <section>
        <h2 className="sr-only">How it works</h2>
        <FlowSteps
          steps={[
            {
              title: '1. Quick estimate',
              detail: 'Nine questions, about five minutes, no documents needed.',
            },
            {
              title: '2. Evidence assessment',
              detail: 'Break the system into critical elements and link proof to every claim.',
            },
            {
              title: '3. Export',
              detail: 'Excel workbook, or a zip with the evidence files and a SHA-256 manifest.',
            },
          ]}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card">
          <h2 className="text-xl font-semibold">Tier 1 — Quick Estimate</h2>
          <p className="mt-2 text-sm text-slate-600">
            Answer nine questions; get a TRL with the reasoning shown.
          </p>
          <p className="mt-2 text-xs font-medium text-amber-700">{TIER1_LABEL}</p>
          <Link to="/quick" className="btn-primary mt-4">
            Start quick estimate
          </Link>
        </article>

        <article className="card">
          <h2 className="text-xl font-semibold">Tier 2 — Evidence-Based Assessment</h2>
          <p className="mt-2 text-sm text-slate-600">
            Per-element criteria, each backed by a document, a test record or a pinned commit.
          </p>
          <p className="mt-2 text-xs font-medium text-amber-700">{TIER2_LABEL}</p>
          <Link to="/assess" className="btn-secondary mt-4">
            Start evidence assessment
          </Link>
        </article>
      </section>

      <section className="card bg-slate-50">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Disclaimer</h2>
        <p className="mt-2 text-sm text-slate-700">{DISCLAIMER}</p>
      </section>
    </div>
  );
}
