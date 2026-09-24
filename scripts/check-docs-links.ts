#!/usr/bin/env tsx
/**
 * Documentation link check (BUILD_SPEC Phase 7, task 7).
 *
 * Verifies, without touching the network:
 *   - relative links and image paths in markdown files resolve to a file that exists
 *   - in-page anchors (#heading) match a heading in the same document
 *   - in-app guide links (/guide/<slug>, /assess, /quick, /about) resolve to a real route
 *   - every guide page registered in src/content/guide/index.ts has a markdown file, and vice versa
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const APP_ROUTES = new Set([
  '/',
  '/quick',
  '/assess',
  '/assess/evidence',
  '/assess/result',
  '/arl',
  '/arl/rate',
  '/arl/result',
  '/about',
  '/guide',
]);

const errors: string[] = [];
let checked = 0;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (
      ['node_modules', 'dist', '.git', 'coverage', 'references', 'test-results'].includes(entry)
    ) {
      continue;
    }
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

function headingAnchors(markdown: string): Set<string> {
  const anchors = new Set<string>();
  for (const line of markdown.split('\n')) {
    const match = /^#{1,6}\s+(.*)$/.exec(line);
    if (!match) continue;
    anchors.add(
      match[1]!
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-'),
    );
  }
  return anchors;
}

const guideSlugs = new Set(
  readdirSync(path.join(ROOT, 'src/content/guide'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, '')),
);

// Registry ↔ files must agree.
const registry = readFileSync(path.join(ROOT, 'src/content/guide/index.ts'), 'utf8');
for (const slug of guideSlugs) {
  if (!registry.includes(`slug: '${slug}'`)) {
    errors.push(`src/content/guide/index.ts does not register the page "${slug}"`);
  }
}
for (const match of registry.matchAll(/slug: '([^']+)'/g)) {
  if (!guideSlugs.has(match[1]!)) {
    errors.push(`src/content/guide/index.ts registers "${match[1]}" but there is no markdown file`);
  }
}

for (const file of walk(ROOT)) {
  const markdown = readFileSync(file, 'utf8');
  const anchors = headingAnchors(markdown);
  const relative = path.relative(ROOT, file);

  for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1]!;
    checked += 1;

    if (/^(https?:|mailto:|tel:)/.test(target)) continue;

    if (target.startsWith('#')) {
      if (!anchors.has(target.slice(1).toLowerCase())) {
        errors.push(`${relative}: anchor ${target} has no matching heading`);
      }
      continue;
    }

    if (target.startsWith('/')) {
      const [route] = target.split('#');
      const isGuide = route!.startsWith('/guide/');
      if (isGuide) {
        const slug = route!.slice('/guide/'.length);
        if (!guideSlugs.has(slug)) errors.push(`${relative}: unknown guide page ${route}`);
      } else if (!APP_ROUTES.has(route!)) {
        errors.push(`${relative}: unknown in-app route ${route}`);
      }
      continue;
    }

    const [filePart, anchor] = target.split('#');
    const resolved = path.resolve(path.dirname(file), filePart!);
    if (!existsSync(resolved)) {
      errors.push(`${relative}: relative link ${target} does not exist`);
      continue;
    }
    if (anchor && resolved.endsWith('.md')) {
      const targetAnchors = headingAnchors(readFileSync(resolved, 'utf8'));
      if (!targetAnchors.has(anchor.toLowerCase())) {
        errors.push(`${relative}: ${target} — no heading matches #${anchor}`);
      }
    }
  }

  // Image paths.
  for (const match of markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const target = match[1]!;
    if (/^https?:/.test(target)) continue;
    checked += 1;
    if (!existsSync(path.resolve(path.dirname(file), target))) {
      errors.push(`${relative}: image ${target} does not exist`);
    }
  }
}

console.log(`check:links — ${checked} link(s) checked across markdown files.`);
if (errors.length) {
  console.error(`\n${errors.length} broken link(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('All documentation links resolve.');
