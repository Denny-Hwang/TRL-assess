# Security review checklist

Reviewed against the threat model in [SECURITY.md](../SECURITY.md): a static, client-side
application where the user's own evidence is the sensitive asset, and the page itself is public.

Status key: **Done** — implemented and covered by a test; **Done (manual)** — implemented, verified
by review.

| #   | Control                                                                                                                                  | Status        | Where                                                                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | Content-Security-Policy restricts the page to same-origin resources; `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'none'` | Done (manual) | `index.html`                                                                                                                |
| 2   | No runtime network calls — no `fetch`, `XMLHttpRequest`, `WebSocket` or `sendBeacon` in application code                                 | Done          | ESLint `no-restricted-globals` / `no-restricted-properties`; Playwright cross-origin request guard in `tests/e2e/*.spec.ts` |
| 3   | No analytics, telemetry or third-party scripts, fonts or styles                                                                          | Done (manual) | No external `<script>`/`<link>`; audited in the Phase 9 final audit                                                         |
| 4   | Evidence file contents never leave the browser                                                                                           | Done          | Blobs only in IndexedDB; the only egress is a user-initiated download                                                       |
| 5   | Formula-injection guard: user text starting with `=`, `+`, `-` or `@` is written to Excel with a leading apostrophe                      | Done          | `safeText()` in `src/export/excel/shared.ts`; tests in `tests/unit/excel-tier1.test.ts`                                     |
| 6   | Zip-slip-safe file names: `[A-Za-z0-9._-]` only, 80 characters, no `..`, no absolute paths, basename only                                | Done          | `sanitizeFileName()` in `src/export/zip/package.ts`; tests in `tests/unit/evidence-package.test.ts`                         |
| 7   | URL scheme allow-list — evidence links accept `http`/`https` only                                                                        | Done          | `httpUrlSchema` in `src/domain/schemas.ts`; rejected at import and in the evidence form                                     |
| 8   | No `dangerouslySetInnerHTML` anywhere; user content is rendered as text                                                                  | Done (manual) | Verified by grep in the final audit                                                                                         |
| 9   | Markdown is rendered without raw HTML (`react-markdown` default, no `rehype-raw`), and only from repository-controlled files             | Done (manual) | `src/features/guide/GuidePage.tsx`                                                                                          |
| 10  | External links carry `rel="noreferrer noopener"` and `target="_blank"`                                                                   | Done (manual) | Evidence library, Guide link renderer                                                                                       |
| 11  | Sensitive-marked evidence cannot hold a file blob                                                                                        | Done          | Schema refinement in `evidenceItemSchema`; UI hides the file input; package excludes them                                   |
| 12  | Imported JSON is schema-validated before it can touch the UI, with typed version errors                                                  | Done          | `deserializeSession()`; tests for malformed, foreign and out-of-version files                                               |
| 13  | A corrupt autosave cannot block startup                                                                                                  | Done          | `loadSession()` returns `null` on any parse failure; test in `tests/unit/storage.test.ts`                                   |
| 14  | Storage failures (quota, private mode) surface as typed errors rather than data loss                                                     | Done          | `QuotaExceededError` / `StorageUnavailableError`                                                                            |
| 15  | "Clear all local data" removes the session **and** every evidence blob                                                                   | Done          | `clearAllLocalData()`; test asserts both stores are empty and unrelated keys survive                                        |
| 16  | Package pre-flight refuses oversized archives instead of failing mid-write                                                               | Done          | `preflight()`; test asserts the refusal names the largest files                                                             |
| 17  | Manifest hashes are computed over the bytes actually packaged                                                                            | Done          | Test recomputes every hash from the zip entries                                                                             |
| 18  | No secrets, tokens or credentials in the repository or the build                                                                         | Done (manual) | No `.env` is read at build time beyond `VITE_BASE_PATH` / `VITE_GIT_SHA`                                                    |
| 19  | Dependencies are pinned by `package-lock.json` and installed with `npm ci` in CI                                                         | Done (manual) | `.github/workflows/*.yml`                                                                                                   |
| 20  | The example session contains no real project, device, person or measurement                                                              | Done          | Test asserts `example.org` URLs and `10.5555/fictional.*` DOIs only                                                         |

## Residual risks

- **A user can still paste sensitive text into a free-text field.** The tool warns persistently and
  refuses files on sensitive-marked evidence, but it cannot inspect what is typed. Hosting the site
  privately is the mitigation where that risk is unacceptable.
- **Browser storage is not encrypted.** Anyone with access to the profile can read the assessment and
  the evidence files. Clear local data on a shared machine.
- **Exported packages are unencrypted.** The manifest proves integrity, not confidentiality.
- **`HYPERLINK()` targets are user-supplied.** Excel warns before following a link; the workbook
  contains no macros and cannot execute anything on open.
