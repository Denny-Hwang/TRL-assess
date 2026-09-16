/**
 * Central configuration — the single source of truth for every tunable value.
 * Mirrors PROJECT CONFIG in docs/spec/BUILD_SPEC.md. Do not hard-code these
 * values anywhere else in the codebase.
 */

export const APP_NAME = 'TRL Assess' as const;
export const REPO_NAME = 'TRL-assess' as const;
export const GITHUB_OWNER = 'Denny-Hwang' as const;
export const REPO_URL = `https://github.com/${GITHUB_OWNER}/${REPO_NAME}` as const;
export const ISSUES_URL = `${REPO_URL}/issues` as const;
export const PAGES_URL = `https://${GITHUB_OWNER.toLowerCase()}.github.io/${REPO_NAME}/` as const;
export const PAGES_BASE_PATH = `/${REPO_NAME}/` as const;
export const LICENSE = 'MIT' as const;
export const MAINTAINER_CONTACT = ISSUES_URL;

export const DEFAULT_FRAMEWORK = 'marine-energy-eere' as const;
export const UI_LANGUAGE = 'en' as const;

/** Limits for evidence handling (see BUILD_SPEC D-4). */
export const MAX_EVIDENCE_FILE_MB = 50;
export const MAX_PACKAGE_TOTAL_MB = 250;
export const MAX_EVIDENCE_FILE_BYTES = MAX_EVIDENCE_FILE_MB * 1024 * 1024;
export const MAX_PACKAGE_TOTAL_BYTES = MAX_PACKAGE_TOTAL_MB * 1024 * 1024;

/** Blank, pre-formatted rows appended to the Tier 2 Evidence_Register sheet. */
export const BLANK_EVIDENCE_PLACEHOLDER_ROWS = 50;
/** Blank rows appended to Tier 1 Next_Evidence_Placeholders and Tier 2 Gap_Actions. */
export const BLANK_NEXT_EVIDENCE_ROWS = 10;
export const BLANK_GAP_ACTION_ROWS = 20;

/** Session schema version — bump when AssessmentSession shape changes. */
export const SCHEMA_VERSION = 1;

/** Storage keys. */
export const STORAGE_KEY_SESSION = 'trl-assess:session:v1';
export const STORAGE_KEY_UI = 'trl-assess:ui:v1';
export const IDB_STORE_NAME = 'trl-assess-evidence';

/** Build-time constants injected by Vite (see vite.config.ts). */
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';
export const GIT_SHA: string = typeof __GIT_SHA__ === 'string' ? __GIT_SHA__ : 'unknown';
export const BUILD_TIME: string =
  typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : new Date(0).toISOString();

/** Honest-labelling strings (BUILD_SPEC Part A, principle 4). */
export const TIER1_LABEL = 'Estimate — self-reported, no evidence' as const;
export const TIER2_LABEL =
  'Evidence-backed self-assessment — not an independent Technology Readiness Assessment' as const;

export const DISCLAIMER = [
  `${APP_NAME} produces a self-assessment only.`,
  'It is not an independent Technology Readiness Assessment (TRA), not an audit, and not a certification.',
  'Results depend entirely on the information the user enters; nothing is verified by the tool.',
  'Assessment criteria differ between agencies and programmes — check the criteria and sources before using a result in any formal submission.',
].join(' ');

export const SENSITIVE_DATA_NOTICE =
  'Do not enter controlled, classified, export-controlled or otherwise sensitive information. This tool runs in your browser on a public static site; use "Sensitive — reference only" evidence entries to point at such material instead of attaching it.';

/** Autosave debounce (ms). */
export const AUTOSAVE_DEBOUNCE_MS = 600;
