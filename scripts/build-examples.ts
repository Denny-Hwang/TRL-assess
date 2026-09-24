#!/usr/bin/env tsx
/**
 * Generates the example export files attached to a release:
 * a Tier 1 workbook, a Tier 2 workbook and an evidence package, all built from the fictional
 * example session. Output goes to release-artifacts/ (git-ignored).
 */
// Must come first: it defines the build-time constants the app modules read at import time.
import './build-globals.ts';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { resolveFramework } from '../src/domain/frameworks.ts';
import { parseSession } from '../src/domain/session.ts';
import { FICTIONAL_EXAMPLE } from '../src/data/examples/index.ts';
import { buildTier1Workbook } from '../src/export/excel/tier1.ts';
import { buildTier2Workbook } from '../src/export/excel/tier2.ts';
import { buildEvidencePackage } from '../src/export/zip/package.ts';
import { sha256Hex } from '../src/domain/hash.ts';
import { workbookToBlob } from '../src/export/excel/shared.ts';
import { workbookFilename } from '../src/export/download.ts';
import { linkEvidence, addEvidence } from '../src/domain/session.ts';

const OUT = path.resolve('release-artifacts');
const at = new Date();

async function writeBlob(blob: Blob, name: string) {
  await writeFile(path.join(OUT, name), Buffer.from(await blob.arrayBuffer()));
  console.log(`  ${name} (${(blob.size / 1024).toFixed(0)} kB)`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const base = parseSession(FICTIONAL_EXAMPLE);
  const framework = resolveFramework(base.frameworkId);
  console.log('Building example exports from the fictional sensor-node session:');

  // One fictional attachment so the package example actually contains an evidence file.
  const attachment = new Blob([
    'Fictional bench test record\n',
    'Article: harvester alpha prototype, rev B\n',
    'Date: 2024-06-05  Operator: Example Laboratory\n',
    'Conditions: laboratory bench, 23 C, 40 minutes\n',
    'Result: mean output 19 mW against a predicted 20 mW (-5%).\n',
  ]);
  const sha256 = await sha256Hex(new Uint8Array(await attachment.arrayBuffer()));
  const added = addEvidence(base, {
    type: 'Test data',
    title: 'Harvester bench test record (fictional)',
    description: 'Example attachment showing how a bundled evidence file appears in the package.',
    date: '2024-06-05',
    owner: 'Example Laboratory',
    marking: 'Internal (unrestricted)',
    verification: 'Verified',
    verifiedBy: 'Example Reviewer',
    verifiedDate: '2024-06-20',
    linkedCriteria: [],
    file: {
      name: 'harvester-bench-test.txt',
      sizeBytes: attachment.size,
      sha256,
      mime: 'text/plain',
      blobKey: 'blob:example',
    },
  });
  const session = linkEvidence(added.session, added.id, 'CTE-01', 'DOD-T2-L4-01');
  const readBlob = async (key: string) => (key === 'blob:example' ? attachment : undefined);

  const tier1 = await buildTier1Workbook(framework, session, at);
  await writeBlob(await workbookToBlob(tier1), workbookFilename('Tier1', session, at));

  const tier2 = await buildTier2Workbook(framework, session, { generatedAt: at });
  await writeBlob(await workbookToBlob(tier2), workbookFilename('Tier2', session, at));

  const built = await buildEvidencePackage(framework, session, () => {}, at, readBlob);
  await writeBlob(built.blob, built.filename);

  console.log(`\nWritten to ${OUT}`);
}

await main();
