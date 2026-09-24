import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Navigate, useParams } from 'react-router-dom';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GUIDE_PAGES, findGuidePage, hasGuideTranslation, loadGuideBody } from '@/content/guide';
import type { Lang } from '@/i18n/languages';
import { useT } from '@/i18n/store';
import { GuideFigure, splitFigures } from './figures';

/** Letters and digits of any script survive, so translated headings get usable anchors too. */
function slugifyHeading(children: React.ReactNode): string {
  return String(children)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}_\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function headings(markdown: string): Array<{ id: string; text: string }> {
  return markdown
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => {
      const text = line.replace(/^##\s+/, '').trim();
      return { id: slugifyHeading(text), text };
    });
}

const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => <h1 className="mb-3 text-2xl font-semibold tracking-tight">{children}</h1>,
  h2: ({ children }) => (
    <h2 id={slugifyHeading(children)} className="mt-8 scroll-mt-20 text-xl font-semibold">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="mt-5 text-base font-semibold">{children}</h3>,
  p: ({ children }) => <p className="mt-3 text-sm leading-6 text-slate-700">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-1 ps-6 text-sm text-slate-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-1 ps-6 text-sm text-slate-700">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-3 border-s-4 border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">{children}</code>
  ),
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-slate-300 bg-slate-50 px-2 py-1 text-start font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-2 py-1 align-top">{children}</td>
  ),
  a: ({ href, children }) =>
    href?.startsWith('/') ? (
      <Link className="text-brand-700 underline" to={href}>
        {children}
      </Link>
    ) : (
      <a className="text-brand-700 underline" href={href} rel="noreferrer noopener" target="_blank">
        {children}
      </a>
    ),
};

interface LoadedBody {
  slug: string;
  lang: Lang;
  body: string | undefined;
}

/**
 * The page body in the interface language. English is immediate; a translation loads on demand.
 * `translated: false` means the language has no translation of this page, so English is shown.
 */
function useGuideBody(
  slug: string | undefined,
  lang: Lang,
): { body: string | undefined; translated: boolean; loading: boolean } {
  const english = slug ? findGuidePage(slug)?.body : undefined;
  const wanted = !!slug && !!english && lang !== 'en' && hasGuideTranslation(slug, lang);
  const [loaded, setLoaded] = useState<LoadedBody | undefined>(undefined);

  useEffect(() => {
    if (!wanted || !slug) return;
    let cancelled = false;
    loadGuideBody(slug, lang).then(
      (body) => {
        if (!cancelled) setLoaded({ slug, lang, body });
      },
      () => {
        if (!cancelled) setLoaded({ slug, lang, body: undefined });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug, lang, wanted]);

  if (lang === 'en' || !english) return { body: english, translated: true, loading: false };
  if (!wanted) return { body: english, translated: false, loading: false };
  const current = loaded && loaded.slug === slug && loaded.lang === lang ? loaded : undefined;
  if (!current) return { body: undefined, translated: true, loading: true };
  return current.body === undefined
    ? { body: english, translated: false, loading: false }
    : { body: current.body, translated: true, loading: false };
}

export function GuideRoute() {
  const { t, lang } = useT();
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? findGuidePage(slug) : undefined;
  const index = page ? GUIDE_PAGES.findIndex((p) => p.slug === page.slug) : -1;
  const { body, translated, loading } = useGuideBody(page?.slug, lang);
  const toc = useMemo(() => (body ? headings(body) : []), [body]);
  const chunks = useMemo(() => (body ? splitFigures(body) : []), [body]);

  if (!slug || !page) return <Navigate to="/guide/overview" replace />;

  const previous = index > 0 ? GUIDE_PAGES[index - 1] : undefined;
  const next = index < GUIDE_PAGES.length - 1 ? GUIDE_PAGES[index + 1] : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)_14rem]">
      <nav aria-label={t('guide.nav.label')} className="lg:sticky lg:top-4 lg:self-start">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t('guide.nav.heading')}
        </h2>
        <ul className="space-y-1 text-sm">
          {GUIDE_PAGES.map((p) => (
            <li key={p.slug}>
              <NavLink
                to={`/guide/${p.slug}`}
                className={({ isActive }) =>
                  `block rounded px-2 py-1 ${
                    isActive ? 'bg-brand-50 font-medium text-brand-800' : 'hover:bg-slate-100'
                  }`
                }
              >
                {t(p.titleKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <article className="min-w-0">
        {!translated ? (
          <p
            role="note"
            className="mb-4 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
          >
            {t('guide.untranslated')}
          </p>
        ) : null}
        {loading ? <p className="text-sm text-slate-500">{t('ui.loading')}</p> : null}
        <div className="guide-prose" lang={translated ? undefined : 'en'}>
          {chunks.map((chunk, i) =>
            chunk.kind === 'figure' ? (
              <GuideFigure key={`figure-${chunk.value}-${i}`} id={chunk.value} />
            ) : (
              <ReactMarkdown
                key={`markdown-${i}`}
                remarkPlugins={[remarkGfm]}
                components={MARKDOWN_COMPONENTS}
              >
                {chunk.value}
              </ReactMarkdown>
            ),
          )}
        </div>

        <nav className="mt-10 flex justify-between border-t border-slate-200 pt-4 text-sm">
          {previous ? (
            <Link className="underline" to={`/guide/${previous.slug}`}>
              {t('guide.previous', { title: t(previous.titleKey) })}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="underline" to={`/guide/${next.slug}`}>
              {t('guide.next', { title: t(next.titleKey) })}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <aside className="hidden lg:sticky lg:top-4 lg:block lg:self-start">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t('guide.toc')}
        </h2>
        <ul className="space-y-1 text-xs">
          {toc.map((h) => (
            <li key={h.id}>
              <a className="text-slate-600 hover:text-brand-700" href={`#${h.id}`}>
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

export function GuideIndex() {
  const { t } = useT();
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">{t('guide.index.title')}</h1>
      <ul className="mt-4 space-y-3">
        {GUIDE_PAGES.map((p) => (
          <li key={p.slug} className="card">
            <Link className="font-medium text-brand-700 underline" to={`/guide/${p.slug}`}>
              {t(p.titleKey)}
            </Link>
            <p className="mt-1 text-sm text-slate-600">{t(p.summaryKey)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
