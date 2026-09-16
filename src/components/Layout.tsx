import { NavLink, Link, Outlet } from 'react-router-dom';
import { APP_NAME, APP_VERSION, GIT_SHA, REPO_URL } from '@/config/app.config';
import { SensitiveDataNotice } from './SensitiveDataNotice';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/quick', label: 'Quick Estimate', end: false },
  { to: '/assess', label: 'Evidence Assessment', end: false },
  { to: '/guide/overview', label: 'Guide', end: false },
  { to: '/about', label: 'About', end: false },
];

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SensitiveDataNotice />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <nav aria-label="Main" className="flex flex-wrap gap-1">
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
                {item.label}
              </NavLink>
            ))}
          </nav>
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
          <span className="font-mono">build {GIT_SHA}</span>
          <Link to="/about#disclaimer" className="underline hover:text-slate-700">
            Disclaimer
          </Link>
          <a href={REPO_URL} className="underline hover:text-slate-700" rel="noreferrer">
            Source
          </a>
          <span className="ml-auto">
            Runs entirely in your browser — no data leaves this device.
          </span>
        </div>
      </footer>
    </div>
  );
}
