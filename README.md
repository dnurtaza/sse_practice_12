# Smart Campus Room Availability Checker — Practice #12

Code-based vs low-code comparison of the same feature (AI-Driven Software Engineering, Practice #12).
Student: Daniyal Nurtaza (24B031075), Tuesday 16:00–19:00. AI tool: Claude Opus 5.5 (Anthropic).

## Links
| What | Link |
|---|---|
| Live demo — code-based (GitHub Pages) | `https://<your-github-username>.github.io/<repository-name>/` (published by CI after push) |
| Live demo — low-code (Appsmith, public) | https://app.appsmith.com/app/smart-campus-checker-practice-12/page1-6b058982b238dbe867c49d06 |
| Report | [docs/PRACTICE12_REPORT.md](docs/PRACTICE12_REPORT.md) (also `docs/Practice12_Report.docx`) |
| Shared requirement / AC sheet | [docs/CONTRACT.md](docs/CONTRACT.md) |
| Low-code export | [lowcode/appsmith-export.json](lowcode/appsmith-export.json), logic: [lowcode/Checker.js](lowcode/Checker.js) |
| Evidence (logs, screenshots) | [evidence/](evidence/) |

> **Note:** the low-code Appsmith app was built by the AI agent in the browser on the student's account (see report).

## Structure
- `src/booking.ts` — Practice #11 rule engine (unchanged)
- `src/contract/` — Practice #12 contract: validation, availability calculation, shared test cases
- `src/components/ContractChecker.tsx`, `src/Root.tsx` — UI (Practice #12 tab + Practice #11 tab)
- `tests/` — Vitest suite (139 tests)
- `lowcode/` — Appsmith JS object, build guide and export
- `.github/workflows/pages.yml` — CI (test, typecheck, lint, build) and GitHub Pages deploy

## Run locally
```bash
npm ci
npm test            # 139 tests
npm run typecheck
npm run lint
npm run build
npm run dev
```

## Data
Fictional data only. No login, no database, no backend, no booking creation.
