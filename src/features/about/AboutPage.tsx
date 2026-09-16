import { Link } from 'react-router-dom';
import {
  APP_NAME,
  APP_VERSION,
  BUILD_TIME,
  DISCLAIMER,
  GIT_SHA,
  ISSUES_URL,
  LICENSE,
  REPO_URL,
  TIER1_LABEL,
  TIER2_LABEL,
} from '@/config/app.config';
import { listFrameworks } from '@/domain/frameworks';
import { SOURCES } from '@/data/sources';

export function AboutPage() {
  const frameworks = listFrameworks();

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">About {APP_NAME}</h1>
        <p className="mt-2 text-sm text-slate-600">
          A two-tier Technology Readiness Level self-assessment tool. Tier 1 gives a quick,
          self-reported estimate; Tier 2 produces an evidence-backed assessment of Critical
          Technology Elements, exportable to Excel and packageable with the evidence files and a
          SHA-256 manifest. Everything runs in your browser — there is no backend, no account and no
          telemetry.
        </p>
      </header>

      <section className="card">
        <h2 className="text-lg font-semibold">Build</h2>
        <dl className="mt-2 grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
          <dt className="font-medium text-slate-600">Version</dt>
          <dd>{APP_VERSION}</dd>
          <dt className="font-medium text-slate-600">Git SHA</dt>
          <dd className="font-mono">{GIT_SHA}</dd>
          <dt className="font-medium text-slate-600">Built at (UTC)</dt>
          <dd>{BUILD_TIME}</dd>
          <dt className="font-medium text-slate-600">License</dt>
          <dd>{LICENSE}</dd>
          <dt className="font-medium text-slate-600">Source</dt>
          <dd>
            <a className="underline" href={REPO_URL} rel="noreferrer noopener" target="_blank">
              {REPO_URL}
            </a>
          </dd>
          <dt className="font-medium text-slate-600">Changelog</dt>
          <dd>
            <a
              className="underline"
              href={`${REPO_URL}/blob/main/CHANGELOG.md`}
              rel="noreferrer noopener"
              target="_blank"
            >
              CHANGELOG.md
            </a>
          </dd>
          <dt className="font-medium text-slate-600">Contact</dt>
          <dd>
            <a className="underline" href={ISSUES_URL} rel="noreferrer noopener" target="_blank">
              Open an issue
            </a>
          </dd>
        </dl>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Frameworks in this build</h2>
        <ul className="mt-2 space-y-3 text-sm">
          {frameworks.map((f) => (
            <li key={f.id}>
              <p className="font-medium">
                {f.name}{' '}
                <span className="font-mono text-xs text-slate-500">
                  {f.id} · v{f.version}
                </span>
              </p>
              <p className="mt-1 text-slate-600">{f.description}</p>
              <p className="mt-1 text-xs text-slate-500">Sources: {f.sources.join(', ')}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          <Link className="underline" to="/guide/frameworks">
            What each framework contains, and its limitations →
          </Link>
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">Sources</h2>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="py-1 pr-3">Id</th>
              <th className="py-1 pr-3">Document</th>
              <th className="py-1 pr-3">Use</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-1 pr-3 font-mono text-xs">{s.id}</td>
                <td className="py-1 pr-3">
                  {s.url ? (
                    <a className="underline" href={s.url} rel="noreferrer noopener" target="_blank">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </td>
                <td className="py-1 pr-3 text-slate-600">
                  {s.quotable ? 'Quotable (public domain)' : 'Reference only'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="disclaimer" className="card border-amber-200 bg-amber-50">
        <h2 className="text-lg font-semibold text-amber-900">Disclaimer</h2>
        <p className="mt-2 text-sm text-amber-900">{DISCLAIMER}</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900">
          <li>Tier 1 results are labelled “{TIER1_LABEL}”.</li>
          <li>Tier 2 results are labelled “{TIER2_LABEL}”.</li>
          <li>
            The build × environment matrix is a heuristic aid created for this tool, not a standard.
          </li>
          <li>
            The system summary is the minimum across critical CTEs — a conservative reporting
            convention, not a mandated formula.
          </li>
          <li>Nothing you enter is verified by the tool.</li>
        </ul>
      </section>
    </div>
  );
}
