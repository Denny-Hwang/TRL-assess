#!/usr/bin/env tsx
/**
 * Framework criteria validator (BUILD_SPEC Phase 1, task 5).
 * Phase 0: stub that succeeds when no frameworks exist yet.
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const FRAMEWORK_DIR = path.resolve('src/data/frameworks');

function main(): void {
  if (!existsSync(FRAMEWORK_DIR) || readdirSync(FRAMEWORK_DIR).length === 0) {
    console.log('validate:criteria — no frameworks present yet (Phase 0 stub). OK');
    return;
  }
  console.log('validate:criteria — frameworks present; full validation lands in Phase 1.');
}

main();
