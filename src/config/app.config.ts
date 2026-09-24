/**
 * Central configuration — the single source of truth for every tunable value.
 * Do not hard-code these values anywhere else in the codebase.
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

export const DEFAULT_FRAMEWORK = 'dod-tra-2025' as const;
export const UI_LANGUAGE = 'en' as const;

/** Limits for evidence handling. */
export const MAX_EVIDENCE_FILE_MB = 50;
export const MAX_PACKAGE_TOTAL_MB = 250;
export const MAX_EVIDENCE_FILE_BYTES = MAX_EVIDENCE_FILE_MB * 1024 * 1024;
export const MAX_PACKAGE_TOTAL_BYTES = MAX_PACKAGE_TOTAL_MB * 1024 * 1024;

/** Blank, pre-formatted rows appended to the Tier 2 Evidence_Register sheet. */
export const BLANK_EVIDENCE_PLACEHOLDER_ROWS = 50;
/** Blank rows appended to Tier 1 Next_Evidence_Placeholders and Tier 2 Gap_Actions. */
export const BLANK_NEXT_EVIDENCE_ROWS = 10;
export const BLANK_GAP_ACTION_ROWS = 20;

/** Session schema version — bump when AssessmentSession shape changes. v2 adds `arl`. */
export const SCHEMA_VERSION = 2;

/** Storage keys. */
export const STORAGE_KEY_SESSION = 'trl-assess:session:v1';
export const STORAGE_KEY_UI = 'trl-assess:ui:v1';
export const IDB_STORE_NAME = 'trl-assess-evidence';

/** Build-time constants injected by Vite (see vite.config.ts). */
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';
export const GIT_SHA: string = typeof __GIT_SHA__ === 'string' ? __GIT_SHA__ : 'unknown';
export const BUILD_TIME: string =
  typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : new Date(0).toISOString();

/** Honest-labelling strings. */
export const TIER1_LABEL = 'Estimate — self-reported, no evidence' as const;
export const TIER2_LABEL =
  'Evidence-backed self-assessment — not an independent Technology Readiness Assessment' as const;

export const DISCLAIMER = [
  `${APP_NAME} produces a self-assessment only.`,
  'It is not an independent Technology Readiness Assessment (TRA), not an audit, and not a certification.',
  'Results depend entirely on the information the user enters; nothing is verified by the tool.',
  'Assessment criteria differ between agencies and programmes — check the criteria and sources before using a result in any formal submission.',
].join(' ');

/** ARL side module: the rubric used, and its own honest labels. */
export const DEFAULT_ARL_FRAMEWORK = 'doe-otc-arl-2025' as const;
export const ARL_LABEL =
  'Adoption readiness self-assessment — not reviewed or endorsed by DOE' as const;
export const ARL_TARGET_LABEL = 'Target — planned, not achieved' as const;

export const ARL_DISCLAIMER = [
  `${APP_NAME} produces a self-assessment only.`,
  'The ARL figures apply the DOE Adoption Readiness Assessment rubric to the ratings you enter: nothing is verified by the tool, and DOE does not review or endorse the result.',
  'The source calls the numerical score optional and warns against false precision — the risk profile, not the number, shows where the barriers are.',
  'ARL complements TRL; this tool never combines the two into one figure.',
].join(' ');

export const SENSITIVE_DATA_NOTICE =
  'Do not enter controlled, classified, export-controlled or otherwise sensitive information. This tool runs in your browser on a public static site; use "Sensitive — reference only" evidence entries to point at such material instead of attaching it.';

/** Autosave debounce (ms). */
export const AUTOSAVE_DEBOUNCE_MS = 600;
