import {
  APP_NAME,
  APP_VERSION,
  BUILD_TIME,
  DISCLAIMER,
  GIT_SHA,
  LICENSE,
  REPO_URL,
} from '@/config/app.config';

export function AboutPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">About {APP_NAME}</h1>
      <dl className="card grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
        <dt className="font-medium text-slate-600">Version</dt>
        <dd>{APP_VERSION}</dd>
        <dt className="font-medium text-slate-600">Build (git SHA)</dt>
        <dd className="font-mono">{GIT_SHA}</dd>
        <dt className="font-medium text-slate-600">Built at</dt>
        <dd>{BUILD_TIME}</dd>
        <dt className="font-medium text-slate-600">License</dt>
        <dd>{LICENSE}</dd>
        <dt className="font-medium text-slate-600">Source</dt>
        <dd>
          <a className="underline" href={REPO_URL} rel="noreferrer">
            {REPO_URL}
          </a>
        </dd>
      </dl>
      <section id="disclaimer" className="card">
        <h2 className="text-lg font-semibold">Disclaimer</h2>
        <p className="mt-2 text-sm text-slate-700">{DISCLAIMER}</p>
      </section>
    </div>
  );
}
