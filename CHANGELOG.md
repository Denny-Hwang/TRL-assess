# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Phase 0: project bootstrap — Vite + React + TypeScript (strict), Tailwind, ESLint, Prettier,
  Vitest, Playwright.
- Central configuration module `src/config/app.config.ts`.
- App shell with HashRouter navigation, footer build metadata and a dismissible
  sensitive-data notice.
- Content-Security-Policy meta tag restricting the app to same-origin resources.
- CI workflow (lint, typecheck, unit tests, criteria validation, build, Playwright e2e) and a
  GitHub Pages deploy workflow.
- ExcelJS library spike proving hyperlink, list validation, `HYPERLINK()` formula, freeze panes,
  conditional formatting and relative-hyperlink round-trips (ADR-0001).
- Repository governance files: CLAUDE.md, docs/PROGRESS.md, SECURITY.md, CONTRIBUTING.md,
  PR and issue templates.
