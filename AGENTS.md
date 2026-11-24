## Project
Smart Campus room availability checker; web app (React + TypeScript).
Fictional data only. No login, no database, no backend, no booking creation.
No secrets in the repository. Agents never deploy or publish; the human owner publishes the live demo by pushing to GitHub (CI workflow `.github/workflows/pages.yml`, Practice #12 requirement).

## Structure
- src/booking.ts: checkAvailability (pure rule function, canonical)
- src/contract/: Practice #12 shared contract (validate.ts, checkContract.ts, testCases.ts, runSharedTests.ts)
- src/Root.tsx, src/components/ContractChecker.tsx: Practice #12 UI shell and checker
- lowcode/: Appsmith JS object, build guide, export (low-code comparison)
- src/App.tsx, src/components/ (RoomFilters, RoomPicker, TimeForm, DecisionPanel): UI
- src/utils/time.ts: time helpers
- src/utils/roomFilters.ts: room filtering predicates
- src/types.ts: shared types
- src/sampleData.ts: fictional fixtures (six rooms)
- tests/: regression tests (Vitest)

## Acceptance criteria
- AC1 Interval validity: 0 <= start < end <= 1440, and start strictly after the current time.
- AC2 Duration: duration must not exceed 120 minutes.
- AC3 Blocked room: a blocked room cannot be booked.
- AC4 No overlap: no overlap with existing bookings; touching endpoints allowed.
- AC5: checkAvailability never mutates booking data (see test T15).
- AC6: an "available" result has no reasons; an "unavailable" result has at least one reason (see test T19).

## Constraints
- Preserve AC1-AC6 exactly.
- Change UI behaviour only for an approved risk-register item.
- Do not change fixture data.
- Scope = the files named in the task. Ask before touching others.
- No new dependencies without approval.
- Never merge or push to main.
- A human reviews and approves every change before it is applied or merged.
- No database, storage or backend, even if a platform note suggests one.

## Engineering rules
- Prefer pure functions and minimal changes.
- Use at most 2 justified patterns; "no pattern" is an acceptable outcome.
- Do not mutate booking fixtures.
- Do not weaken or delete existing test assertions.

## Verification
- Before proposing acceptance, run: npm test, npm run typecheck, npm run lint, npm run build.
- Report the actual output of each run. Never claim a pass without running it.
- Run existing tests and add focused regression tests.
- Report changed files, rationale and test evidence.
