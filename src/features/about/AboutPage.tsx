import { Link } from 'react-router-dom';
import {
  APP_NAME,
  APP_VERSION,
  BUILD_TIME,
  DEFAULT_ARL_FRAMEWORK,
  GIT_SHA,
  ISSUES_URL,
  LICENSE,
  REPO_URL,
} from '@/config/app.config';
import { listFrameworks } from '@/domain/frameworks';
import { SOURCES, SOURCES_BY_ID } from '@/data/sources';
import { disclaimerText } from '@/i18n/domainText';
import { useT } from '@/i18n/store';

export function AboutPage() {
  const tr = useT();
  const { t } = tr;
  const frameworks = listFrameworks();

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('about.title', { app: APP_NAME })}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{t('about.lead')}</p>
      </header>

      <section className="card">
        <h2 className="text-lg font-semibold">{t('about.build.heading')}</h2>
        <dl className="mt-2 grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
          <dt className="font-medium text-slate-600">{t('about.build.version')}</dt>
          <dd>{APP_VERSION}</dd>
          <dt className="font-medium text-slate-600">{t('about.build.sha')}</dt>
          <dd className="font-mono">{GIT_SHA}</dd>
          <dt className="font-medium text-slate-600">{t('about.build.time')}</dt>
          <dd>{BUILD_TIME}</dd>
          <dt className="font-medium text-slate-600">{t('about.build.license')}</dt>
          <dd>{LICENSE}</dd>
          <dt className="font-medium text-slate-600">{t('about.build.source')}</dt>
          <dd>
            <a className="underline" href={REPO_URL} rel="noreferrer noopener" target="_blank">
              {REPO_URL}
            </a>
          </dd>
          <dt className="font-medium text-slate-600">{t('about.build.changelog')}</dt>
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
          <dt className="font-medium text-slate-600">{t('about.build.contact')}</dt>
          <dd>
            <a className="underline" href={ISSUES_URL} rel="noreferrer noopener" target="_blank">
              {t('about.build.issue')}
            </a>
          </dd>
        </dl>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">{t('about.frameworks.heading')}</h2>
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
              <p className="mt-1 text-xs text-slate-500">
                {t('about.frameworks.sources', { list: f.sources.join(', ') })}
              </p>
            </li>
          ))}
          <li>
            <p className="font-medium">
              {t('about.frameworks.arl.name', {
                title: SOURCES_BY_ID[DEFAULT_ARL_FRAMEWORK]?.title ?? '',
              })}{' '}
              <span className="font-mono text-xs text-slate-500">{DEFAULT_ARL_FRAMEWORK}</span>
            </p>
            <p className="mt-1 text-slate-600">
              {t('about.frameworks.arl.body')}{' '}
              <Link className="underline" to="/guide/arl">
                {t('about.frameworks.arl.link')}
              </Link>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t('about.frameworks.arl.source', {
                id: DEFAULT_ARL_FRAMEWORK,
                version: SOURCES_BY_ID[DEFAULT_ARL_FRAMEWORK]?.version ?? '',
              })}
            </p>
          </li>
        </ul>
        <p className="mt-3 text-sm">
          <Link className="underline" to="/guide/frameworks">
            {t('about.frameworks.more')}
          </Link>
        </p>
      </section>

      <section className="card">
        <h2 className="text-lg font-semibold">{t('about.sources.heading')}</h2>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-start">
              <th className="py-1 pe-3">{t('about.sources.id')}</th>
              <th className="py-1 pe-3">{t('about.sources.document')}</th>
              <th className="py-1 pe-3">{t('about.sources.use')}</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => (
              <tr key={s.id} className="border-b border-slate-100">
                <td className="py-1 pe-3 font-mono text-xs">{s.id}</td>
                <td className="py-1 pe-3">
                  {s.url ? (
                    <a className="underline" href={s.url} rel="noreferrer noopener" target="_blank">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </td>
                <td className="py-1 pe-3 text-slate-600">
                  {s.quotable ? t('about.sources.quotable') : t('about.sources.reference')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="disclaimer" className="card border-amber-200 bg-amber-50">
        <h2 className="text-lg font-semibold text-amber-900">{t('about.disclaimer.heading')}</h2>
        <p className="mt-2 text-sm text-amber-900">{disclaimerText(tr)}</p>
        <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-amber-900">
          <li>{t('about.disclaimer.tier1', { label: t('label.tier1') })}</li>
          <li>{t('about.disclaimer.tier2', { label: t('label.tier2') })}</li>
          <li>
            {t('about.disclaimer.arl', { label: t('label.arl') })} {disclaimerText(tr, 'arl')}
          </li>
          <li>{t('about.disclaimer.matrix')}</li>
          <li>{t('about.disclaimer.system')}</li>
        </ul>
      </section>
    </div>
  );
}
