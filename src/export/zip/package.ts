/**
 * Evidence package (BUILD_SPEC D-4).
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
import { workbookToBlob } from '@/export/excel/shared';

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

export function preflight(session: AssessmentSession): PackagePreflight {
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
          message:
            `The evidence files total ${(totalBytes / 1024 / 1024).toFixed(1)} MB, over the ` +
            `${MAX_PACKAGE_TOTAL_MB} MB package limit. Remove or unlink a large file, or record it ` +
            `as a reference instead of attaching it. Largest files: ` +
            items
              .slice()
              .sort((a, b) => b.sizeBytes - a.sizeBytes)
              .slice(0, 5)
              .map((i) => `${i.name} (${(i.sizeBytes / 1024 / 1024).toFixed(1)} MB)`)
              .join(', '),
        }),
  };
}

function readmeText(rootName: string, workbookName: string, fileCount: number): string {
  return [
    `${APP_NAME} evidence package`,
    '',
    `Created by ${APP_NAME} ${APP_VERSION} (build ${GIT_SHA}).`,
    '',
    'Contents',
    `  ${workbookName}      the Tier 2 workbook`,
    '  session.json          the full assessment, re-importable into the app',
    `  evidence/             ${fileCount} evidence file(s), named <EV-ID>_<original name>`,
    '  MANIFEST.sha256.txt   SHA-256 of every file in this package',
    '',
    'Opening the links',
    '  Unzip the whole folder first, keeping the structure intact. The "Local file (relative',
    '  path)" cells in Evidence_Register point at evidence/… relative to the workbook, so the',
    '  "Open" column works once the folder is unzipped.',
    '',
    'Verifying the hashes',
    `  Linux / macOS:   cd ${rootName} && sha256sum -c MANIFEST.sha256.txt`,
    '  Windows (PowerShell):',
    '    Get-Content MANIFEST.sha256.txt | ForEach-Object {',
    '      $parts = $_ -split "\\s+", 2',
    '      $hash = (Get-FileHash -Algorithm SHA256 $parts[1].Trim()).Hash.ToLower()',
    '      if ($hash -eq $parts[0]) { "OK   $($parts[1])" } else { "FAIL $($parts[1])" }',
    '    }',
    '',
    'What this package is not',
    '  A self-assessment, not an independent Technology Readiness Assessment. Evidence marked',
    '  "Sensitive — reference only" is never bundled: those rows point at material held',
    '  elsewhere.',
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
): Promise<BuiltPackage> {
  const check = preflight(session);
  if (!check.withinLimit) throw new Error(check.message);

  onProgress('Loading the packaging library…');
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  const slug = sessionSlug(session);
  const stamp = timestampForFilename(at);
  const rootName = `TRL_Tier2_${slug}_${stamp}`;
  const workbookName = `${rootName}.xlsx`;
  const root = zip.folder(rootName);
  if (!root) throw new Error('Could not create the package folder.');

  const bundled = bundleableEvidence(session);
  const bundledPaths: Record<string, string> = {};
  for (const item of bundled) bundledPaths[item.id] = `evidence/${evidenceEntryName(item)}`;

  onProgress('Building the workbook…');
  const workbook = await buildTier2Workbook(framework, session, {
    packageType: 'zip',
    bundledPaths,
    generatedAt: at,
  });
  const workbookBlob = await workbookToBlob(workbook);
  const workbookBytes = new Uint8Array(await blobToArrayBuffer(workbookBlob));
  root.file(workbookName, workbookBytes);

  onProgress('Writing the session…');
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
    onProgress(`Adding evidence ${index} of ${bundled.length}…`);
    const blob = await readBlob(item.file!.blobKey);
    if (!blob) continue;
    const bytes = new Uint8Array(await blobToArrayBuffer(blob));
    const path = bundledPaths[item.id]!;
    root.file(path, bytes);
    manifestEntries.push([await sha256Hex(bytes), path]);
    entries.push(path);
  }

  const readme = readmeText(rootName, workbookName, bundled.length);
  root.file('README.txt', readme);
  manifestEntries.push([await sha256Hex(readme), 'README.txt']);

  // Every file in the package is hashed except the manifest itself.
  const manifest = `${manifestEntries.map(([hash, path]) => `${hash}  ${path}`).join('\n')}\n`;
  root.file('MANIFEST.sha256.txt', manifest);
  entries.push('README.txt', 'MANIFEST.sha256.txt');

  onProgress('Compressing…');
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  return { blob, filename: `${rootName}.zip`, rootName, manifest, entries };
}

export async function exportEvidencePackage(
  framework: ResolvedFramework,
  session: AssessmentSession,
  onProgress?: (message: string) => void,
  at: Date = new Date(),
): Promise<string> {
  const built = await buildEvidencePackage(framework, session, onProgress, at, getBlob);
  downloadBlob(built.blob, built.filename);
  return built.filename;
}
