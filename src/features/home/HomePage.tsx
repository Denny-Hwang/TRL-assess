import { Link } from 'react-router-dom';
import { APP_NAME } from '@/config/app.config';
import { FlowSteps } from '@/components/viz/FlowSteps';
import { TrlLadder } from '@/components/viz/TrlLadder';
import { disclaimerText } from '@/i18n/domainText';
import { useT } from '@/i18n/store';

export function HomePage() {
  const tr = useT();
  const { t } = tr;
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">{t('home.lead')}</p>
        <div className="card mt-4">
          <TrlLadder
            achieved={4}
            current={5}
            markers={[{ level: 4, label: t('home.ladder.marker') }]}
            label={t('home.ladder.label')}
          />
          <p className="mt-2 text-xs text-slate-500">{t('home.ladder.caption')}</p>
        </div>
      </section>

      <section>
        <h2 className="sr-only">{t('home.flow.heading')}</h2>
        <FlowSteps
          steps={[
            {
              title: t('home.flow.quick.title'),
              detail: t('home.flow.quick.detail'),
            },
            {
              title: t('home.flow.assess.title'),
              detail: t('home.flow.assess.detail'),
            },
            {
              title: t('home.flow.export.title'),
              detail: t('home.flow.export.detail'),
            },
          ]}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card">
          <h2 className="text-xl font-semibold">{t('home.tier1.heading')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('home.tier1.body')}</p>
          <p className="mt-2 text-xs font-medium text-amber-700">{t('label.tier1')}</p>
          <Link to="/quick" className="btn-primary mt-4">
            {t('home.tier1.start')}
          </Link>
        </article>

        <article className="card">
          <h2 className="text-xl font-semibold">{t('home.tier2.heading')}</h2>
          <p className="mt-2 text-sm text-slate-600">{t('home.tier2.body')}</p>
          <p className="mt-2 text-xs font-medium text-amber-700">{t('label.tier2')}</p>
          <Link to="/assess" className="btn-secondary mt-4">
            {t('home.tier2.start')}
          </Link>
        </article>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">{t('home.arl.heading')}</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{t('home.arl.body')}</p>
        <p className="mt-2 text-xs font-medium text-amber-700">{t('label.arl')}</p>
        <Link to="/arl" className="btn-secondary mt-4">
          {t('home.arl.start')}
        </Link>
      </section>

      <section className="card bg-slate-50">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t('home.disclaimer.heading')}
        </h2>
        <p className="mt-2 text-sm text-slate-700">{disclaimerText(tr)}</p>
      </section>
    </div>
  );
}
