import { NavLink, Link, Outlet } from 'react-router-dom';
import { APP_NAME, APP_VERSION, GIT_SHA, REPO_URL } from '@/config/app.config';
import { useT } from '@/i18n/store';
import type { MessageKey } from '@/i18n/en';
import { SensitiveDataNotice } from './SensitiveDataNotice';
import { LanguageSelect } from './LanguageSelect';

const NAV: Array<{ to: string; label: MessageKey; end: boolean }> = [
  { to: '/', label: 'nav.home', end: true },
  { to: '/quick', label: 'nav.quick', end: false },
  { to: '/assess', label: 'nav.assess', end: false },
  { to: '/arl', label: 'nav.arl', end: false },
  { to: '/guide/overview', label: 'nav.guide', end: false },
  { to: '/about', label: 'nav.about', end: false },
];

export function Layout() {
  const { t } = useT();
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        {t('layout.skip')}
      </a>
      <SensitiveDataNotice />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <nav aria-label={t('nav.main')} className="flex flex-wrap gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'rounded-md px-3 py-1.5 text-sm font-medium',
                    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                {t(item.label)}
              </NavLink>
            ))}
          </nav>
          <LanguageSelect />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            {APP_NAME} v{APP_VERSION}
          </span>
          <span className="font-mono">{t('layout.build', { sha: GIT_SHA })}</span>
          <Link to="/about#disclaimer" className="underline hover:text-slate-700">
            {t('layout.disclaimer')}
          </Link>
          <a href={REPO_URL} className="underline hover:text-slate-700" rel="noreferrer">
            {t('layout.source')}
          </a>
          <span className="ms-auto">{t('layout.local')}</span>
        </div>
      </footer>
    </div>
  );
}
