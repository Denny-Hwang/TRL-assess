import { Link } from 'react-router-dom';
import { APP_NAME, DISCLAIMER, TIER1_LABEL, TIER2_LABEL } from '@/config/app.config';

export function HomePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          A two-tier Technology Readiness Level (TRL) self-assessment tool. Start with a quick
          estimate, then build an evidence-backed assessment you can export to Excel and package
          with your proof files.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card">
          <h2 className="text-xl font-semibold">Tier 1 — Quick Estimate</h2>
          <p className="mt-2 text-sm text-slate-600">
            Nine high-level screening questions. Takes a few minutes and needs no documents.
          </p>
          <p className="mt-2 text-xs font-medium text-amber-700">{TIER1_LABEL}</p>
          <Link to="/quick" className="btn-primary mt-4">
            Start quick estimate
          </Link>
        </article>

        <article className="card">
          <h2 className="text-xl font-semibold">Tier 2 — Evidence-Based Assessment</h2>
          <p className="mt-2 text-sm text-slate-600">
            Break the system into Critical Technology Elements, assess detailed criteria per TRL,
            and attach or link the proof behind every claim.
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
