/**
 * Evidence package.
 *
 *   TRL_Tier2_<slug>_<ts>/
 *   ├─ TRL_Tier2_<slug>_<ts>.xlsx
 *   ├─ session.json
 *   ├─ evidence/EV-0001_<sanitized-name.ext>
 *   ├─ MANIFEST.sha256.txt
 *   └─ README.txt
 *
 * Everything is built in the browser; nothing is uploaded.
 */
import {
  APP_NAME,
  APP_VERSION,
  GIT_SHA,
  MAX_PACKAGE_TOTAL_BYTES,
  MAX_PACKAGE_TOTAL_MB,
} from '@/config/app.config';
import { blobToArrayBuffer, sha256Hex } from '@/domain/hash';
import { serializeSession } from '@/domain/json';
import { SENSITIVE_MARKING, type AssessmentSession, type EvidenceItem } from '@/domain/schemas';
import type { ResolvedFramework } from '@/domain/frameworks';
import { getBlob } from '@/storage/blobStore';
import { downloadBlob, sessionSlug, timestampForFilename } from '@/export/download';
import { buildTier2Workbook } from '@/export/excel/tier2';
import { currentTranslator, workbookToBlob, type Translator } from '@/export/excel/shared';

/**
 * Sanitize a file name for the archive: `[A-Za-z0-9._-]` only, at most 80 characters, never
 * `..`, never absolute. Defends against zip-slip and against odd names breaking a link.
 */
export function sanitizeFileName(name: string, max = 80): string {
  const base = name.split(/[\\/]/).pop() ?? name;
  const cleaned = base
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^[.]+/, '')
    .slice(0, max);
  return cleaned || 'file';
}

export function evidenceEntryName(item: EvidenceItem): string {
  const name = sanitizeFileName(item.file?.name ?? `${item.id}.bin`);
  return `${item.id}_${name}`;
}

/** Evidence that can be bundled: it has a file and is not marked sensitive. */
export function bundleableEvidence(session: AssessmentSession): EvidenceItem[] {
  return (session.tier2?.evidence ?? []).filter((e) => e.file && e.marking !== SENSITIVE_MARKING);
}

export interface PackagePreflight {
  items: Array<{ id: string; name: string; sizeBytes: number }>;
  totalBytes: number;
  withinLimit: boolean;
  message?: string;
}

export function preflight(
  session: AssessmentSession,
  tr: Translator = currentTranslator(),
): PackagePreflight {
  const items = bundleableEvidence(session).map((e) => ({
    id: e.id,
    name: evidenceEntryName(e),
    sizeBytes: e.file!.sizeBytes,
  }));
  const totalBytes = items.reduce((sum, i) => sum + i.sizeBytes, 0);
  const withinLimit = totalBytes <= MAX_PACKAGE_TOTAL_BYTES;
  return {
    items,
    totalBytes,
    withinLimit,
    ...(withinLimit
      ? {}
      : {
          message: tr.t('excel.package.tooLarge', {
            total: (totalBytes / 1024 / 1024).toFixed(1),
            limit: MAX_PACKAGE_TOTAL_MB,
            files: items
              .slice()
              .sort((a, b) => b.sizeBytes - a.sizeBytes)
              .slice(0, 5)
              .map((i) =>
                tr.t('excel.package.fileSize', {
                  name: i.name,
                  size: (i.sizeBytes / 1024 / 1024).toFixed(1),
                }),
              )
              .join(', '),
          }),
        }),
  };
}

/** Indents every line of a (possibly multi-line) paragraph by two spaces. */
function indented(text: string): string[] {
  return text.split('\n').map((line) => `  ${line}`);
}

function readmeText(
  rootName: string,
  workbookName: string,
  fileCount: number,
  { t }: Translator,
): string {
  return [
    t('excel.package.readme.title', { app: APP_NAME }),
    '',
    t('excel.package.readme.createdBy', { app: APP_NAME, version: APP_VERSION, sha: GIT_SHA }),
    '',
    t('excel.package.readme.contents'),
    `  ${workbookName}      ${t('excel.package.readme.workbook')}`,
    `  session.json          ${t('excel.package.readme.session')}`,
    `  evidence/             ${t('excel.package.readme.evidence', { count: fileCount })}`,
    `  MANIFEST.sha256.txt   ${t('excel.package.readme.manifest')}`,
    '',
    t('excel.package.readme.links.heading'),
    ...indented(t('excel.package.readme.links.body')),
    '',
    t('excel.package.readme.hashes.heading'),
    `  Linux / macOS:   cd ${rootName} && sha256sum -c MANIFEST.sha256.txt`,
    '  Windows (PowerShell):',
    '    Get-Content MANIFEST.sha256.txt | ForEach-Object {',
    '      $parts = $_ -split "\\s+", 2',
    '      $hash = (Get-FileHash -Algorithm SHA256 $parts[1].Trim()).Hash.ToLower()',
    '      if ($hash -eq $parts[0]) { "OK   $($parts[1])" } else { "FAIL $($parts[1])" }',
    '    }',
    '',
    t('excel.package.readme.not.heading'),
    ...indented(t('excel.package.readme.not.body')),
  ].join('\n');
}

export interface BuiltPackage {
  blob: Blob;
  filename: string;
  rootName: string;
  manifest: string;
  entries: string[];
}

export type BlobReader = (blobKey: string) => Promise<Blob | undefined>;

export async function buildEvidencePackage(
  framework: ResolvedFramework,
  session: AssessmentSession,
  onProgress: (message: string) => void = () => {},
  at: Date = new Date(),
  /** Seam for tests and for the release-artifact script, which run outside a browser. */
  readBlob: BlobReader = getBlob,
  tr: Translator = currentTranslator(),
): Promise<BuiltPackage> {
  const { t } = tr;
  const check = preflight(session, tr);
  if (!check.withinLimit) throw new Error(check.message);

  onProgress(t('excel.package.progress.library'));
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  const slug = sessionSlug(session);
  const stamp = timestampForFilename(at);
  const rootName = `TRL_Tier2_${slug}_${stamp}`;
  const workbookName = `${rootName}.xlsx`;
  const root = zip.folder(rootName);
  if (!root) throw new Error(t('excel.package.error.folder'));

  const bundled = bundleableEvidence(session);
  const bundledPaths: Record<string, string> = {};
  for (const item of bundled) bundledPaths[item.id] = `evidence/${evidenceEntryName(item)}`;

  onProgress(t('excel.package.progress.workbook'));
  const workbook = await buildTier2Workbook(
    framework,
    session,
    { packageType: 'zip', bundledPaths, generatedAt: at },
    tr,
  );
  const workbookBlob = await workbookToBlob(workbook);
  const workbookBytes = new Uint8Array(await blobToArrayBuffer(workbookBlob));
  root.file(workbookName, workbookBytes);

  onProgress(t('excel.package.progress.session'));
  const sessionJson = serializeSession(session, at);
  root.file('session.json', sessionJson);

  const manifestEntries: Array<[string, string]> = [
    [await sha256Hex(workbookBytes), workbookName],
    [await sha256Hex(sessionJson), 'session.json'],
  ];

  const entries: string[] = [workbookName, 'session.json'];
  let index = 0;
  for (const item of bundled) {
    index += 1;
    onProgress(t('excel.package.progress.evidence', { n: index, total: bundled.length }));
    const blob = await readBlob(item.file!.blobKey);
    if (!blob) continue;
    const bytes = new Uint8Array(await blobToArrayBuffer(blob));
    const path = bundledPaths[item.id]!;
    root.file(path, bytes);
    manifestEntries.push([await sha256Hex(bytes), path]);
    entries.push(path);
  }

  const readme = readmeText(rootName, workbookName, bundled.length, tr);
  root.file('README.txt', readme);
  manifestEntries.push([await sha256Hex(readme), 'README.txt']);

  // Every file in the package is hashed except the manifest itself.
  const manifest = `${manifestEntries.map(([hash, path]) => `${hash}  ${path}`).join('\n')}\n`;
  root.file('MANIFEST.sha256.txt', manifest);
  entries.push('README.txt', 'MANIFEST.sha256.txt');

  onProgress(t('excel.package.progress.compress'));
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  return { blob, filename: `${rootName}.zip`, rootName, manifest, entries };
}

export async function exportEvidencePackage(
  framework: ResolvedFramework,
  session: AssessmentSession,
  onProgress?: (message: string) => void,
  at: Date = new Date(),
  tr: Translator = currentTranslator(),
): Promise<string> {
  const built = await buildEvidencePackage(framework, session, onProgress, at, getBlob, tr);
  downloadBlob(built.blob, built.filename);
  return built.filename;
}
