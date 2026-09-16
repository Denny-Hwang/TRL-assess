import { useMemo } from 'react';
import { Link, NavLink, Navigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GUIDE_PAGES, findGuidePage } from '@/content/guide';

function slugifyHeading(children: React.ReactNode): string {
  return String(children)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
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

export function GuideRoute() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? findGuidePage(slug) : undefined;
  const index = page ? GUIDE_PAGES.findIndex((p) => p.slug === page.slug) : -1;
  const toc = useMemo(() => (page ? headings(page.body) : []), [page]);

  if (!slug) return <Navigate to="/guide/overview" replace />;
  if (!page) return <Navigate to="/guide/overview" replace />;

  const previous = index > 0 ? GUIDE_PAGES[index - 1] : undefined;
  const next = index < GUIDE_PAGES.length - 1 ? GUIDE_PAGES[index + 1] : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)_14rem]">
      <nav aria-label="Guide" className="lg:sticky lg:top-4 lg:self-start">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Guide</h2>
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
                {p.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <article className="min-w-0">
        <div className="guide-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mb-3 text-2xl font-semibold tracking-tight">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2
                  id={slugifyHeading(children)}
                  className="mt-8 scroll-mt-20 text-xl font-semibold"
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => <h3 className="mt-5 text-base font-semibold">{children}</h3>,
              p: ({ children }) => (
                <p className="mt-3 text-sm leading-6 text-slate-700">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-700">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mt-3 list-decimal space-y-1 pl-6 text-sm text-slate-700">
                  {children}
                </ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="mt-3 border-l-4 border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">
                  {children}
                </code>
              ),
              table: ({ children }) => (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border-b border-slate-300 bg-slate-50 px-2 py-1 text-left font-semibold">
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
                  <a
                    className="text-brand-700 underline"
                    href={href}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    {children}
                  </a>
                ),
            }}
          >
            {page.body}
          </ReactMarkdown>
        </div>

        <nav className="mt-10 flex justify-between border-t border-slate-200 pt-4 text-sm">
          {previous ? (
            <Link className="underline" to={`/guide/${previous.slug}`}>
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="underline" to={`/guide/${next.slug}`}>
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <aside className="hidden lg:sticky lg:top-4 lg:block lg:self-start">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          On this page
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
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Guide</h1>
      <ul className="mt-4 space-y-3">
        {GUIDE_PAGES.map((p) => (
          <li key={p.slug} className="card">
            <Link className="font-medium text-brand-700 underline" to={`/guide/${p.slug}`}>
              {p.title}
            </Link>
            <p className="mt-1 text-sm text-slate-600">{p.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
