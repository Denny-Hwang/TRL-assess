/** Browser download helpers. Files are generated in the page and saved via an object URL. */
import type { AssessmentSession } from '@/domain/schemas';

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** A filesystem-safe slug from the project name (BUILD_SPEC D-3.0). */
export function slugify(value: string, max = 40): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .slice(0, max)
    .replace(/^-|-$/g, '');
  return slug || 'assessment';
}

export function sessionSlug(session: AssessmentSession): string {
  return slugify(session.tier1?.context.projectName ?? 'assessment');
}

/** Local-time stamp, YYYYMMDD-HHmm (BUILD_SPEC D-3.0). */
export function timestampForFilename(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`
  );
}

export function workbookFilename(
  tier: 'Tier1' | 'Tier2',
  session: AssessmentSession,
  date?: Date,
  extension = 'xlsx',
): string {
  return `TRL_${tier}_${sessionSlug(session)}_${timestampForFilename(date)}.${extension}`;
}
