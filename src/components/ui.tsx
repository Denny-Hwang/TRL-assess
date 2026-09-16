import type { ReactNode } from 'react';
import { DISCLAIMER } from '@/config/app.config';
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

const ORIGIN_TITLE: Record<Origin, string> = {
  verbatim: 'Text copied exactly from a U.S. Government public-domain source.',
  adapted: 'Source wording restructured; the meaning is preserved.',
  tailored: 'Added by this framework; it is not in any source. See the rationale.',
};

export function OriginBadge({ origin }: { origin: Origin }) {
  return (
    <span className={`badge ${ORIGIN_STYLE[origin]}`} title={ORIGIN_TITLE[origin]}>
      {origin}
    </span>
  );
}

export function MandatoryBadge({ mandatory, basis }: { mandatory: boolean; basis?: string }) {
  return (
    <span
      className={`badge ${
        mandatory
          ? 'border-slate-400 bg-slate-100 text-slate-800'
          : 'border-slate-200 bg-white text-slate-500'
      }`}
      title={basis ?? (mandatory ? 'Required for the level' : 'Not required for the level')}
    >
      {mandatory ? 'mandatory' : 'optional'}
    </span>
  );
}

export function Disclaimer({ label }: { label: string }) {
  return (
    <section className="card border-amber-200 bg-amber-50" aria-label="Result label and disclaimer">
      <p className="text-sm font-semibold text-amber-900">{label}</p>
      <p className="mt-2 text-xs text-amber-900/90">{DISCLAIMER}</p>
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
}: {
  sourceId: string;
  section?: string;
  page?: string;
  clause?: string;
}) {
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
    section ? shortSection(section) : undefined,
    page ? `p. ${page}` : undefined,
    clause ? `clause ${clause}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <span className="text-xs text-slate-500" title={`Source: ${full}`}>
      Source: {short}
    </span>
  );
}
