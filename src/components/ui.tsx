import type { ReactNode } from 'react';
import { useT } from '@/i18n/store';
import { disclaimerText } from '@/i18n/domainText';
import type { Origin } from '@/domain/schemas';

export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {lead ? <p className="mt-1 max-w-3xl text-sm text-slate-600">{lead}</p> : null}
        </div>
        {children}
      </div>
    </header>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${htmlFor}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const ORIGIN_STYLE: Record<Origin, string> = {
  verbatim: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  adapted: 'border-sky-300 bg-sky-50 text-sky-800',
  tailored: 'border-violet-300 bg-violet-50 text-violet-800',
};

export function OriginBadge({ origin }: { origin: Origin }) {
  const { t } = useT();
  return (
    <span className={`badge ${ORIGIN_STYLE[origin]}`} title={t(`ui.origin.${origin}.title`)}>
      {t(`ui.origin.${origin}`)}
    </span>
  );
}

export function MandatoryBadge({ mandatory, basis }: { mandatory: boolean; basis?: string }) {
  const { t } = useT();
  return (
    <span
      className={`badge ${
        mandatory
          ? 'border-slate-400 bg-slate-100 text-slate-800'
          : 'border-slate-200 bg-white text-slate-500'
      }`}
      title={basis ?? t(mandatory ? 'ui.mandatory.title' : 'ui.optional.title')}
    >
      {t(mandatory ? 'ui.mandatory' : 'ui.optional')}
    </span>
  );
}

/** The honest label and the disclaimer every result page carries. */
export function Disclaimer({
  label,
  which = 'trl',
  children,
}: {
  label: string;
  which?: 'trl' | 'arl';
  children?: ReactNode;
}) {
  const tr = useT();
  return (
    <section className="card border-amber-200 bg-amber-50" aria-label={tr.t('ui.disclaimer.aria')}>
      <p className="text-sm font-semibold text-amber-900">{label}</p>
      <p className="mt-2 text-xs text-amber-900/90">{disclaimerText(tr, which)}</p>
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  emphasis,
  testId,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
  testId?: string;
}) {
  return (
    <div className="card" data-testid={testId}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={emphasis ? 'mt-1 text-4xl font-semibold' : 'mt-1 text-xl font-semibold'}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: 'border-sky-200 bg-sky-50 text-sky-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  }[tone];
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${styles}`}>
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? 'mt-1' : ''}>{children}</div>
    </div>
  );
}

/** "Table 2-1. DoD Hardware TRL Definitions, …" → "Table 2-1"; the full text stays in the tooltip. */
function shortSection(section: string): string {
  const head = section.split(/[.—:]/)[0]!.trim();
  return head.length > 0 && head.length <= 28 ? head : `${section.slice(0, 26).trim()}…`;
}

export function SourceNote({
  sourceId,
  section,
  page,
  clause,
  compact = false,
}: {
  sourceId: string;
  section?: string;
  page?: string;
  clause?: string;
  /** Show only the document and page; the section stays in the tooltip. */
  compact?: boolean;
}) {
  const { t } = useT();
  const full = [
    sourceId,
    section,
    page ? `p. ${page}` : undefined,
    clause ? `clause ${clause}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
  const short = [
    sourceId,
    section && !compact ? shortSection(section) : undefined,
    page ? `p. ${page}` : undefined,
    clause ? `clause ${clause}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <span className="text-xs text-slate-500" title={t('ui.source', { ref: full })}>
      {t('ui.source', { ref: short })}
    </span>
  );
}
