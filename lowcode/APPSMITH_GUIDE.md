# Low-code track — Appsmith build guide

Target: the same contract as `docs/CONTRACT.md` (room Allen Hall 101, booking 10:00–11:00,
reference time 09:00, T1–T8). Free plan only; no datasource, no login, no connectors.

**Record your time** for each phase (setup / implementation / debugging / testing) in minutes.
Measured times go into the comparison matrix; estimates must be labelled as estimates.

## 1. Setup
1. Sign in at app.appsmith.com (free plan) → **Create new** → **Application** → name it
   `Smart Campus Checker (Practice 12)`.
2. Do **not** add any datasource or API. The app uses fixed fictional data only.

## 2. Widgets (UI tab → drag onto the canvas)
Rename each widget exactly as in the **Name** column (click the widget name label to rename).

| Widget | Name | Properties |
|---|---|---|
| Text | `TitleText` | Text: `Check Allen Hall 101` |
| Text | `BookingsText` | Text: `Existing booking (read-only): 10:00–11:00 CS101 Lecture · Reference time 09:00` |
| Input | `StartInput` | Data type: **Single-line text**; Label: `Start time (HH:MM)`; Placeholder: `11:30` |
| Input | `DurationInput` | Data type: **Single-line text**; Label: `Duration (minutes)`; Placeholder: `60` |
| Switch | `BlockedSwitch` | Label: `Room blocked`; Default state: off |
| Button | `CheckButton` | Label: `Check`; onClick → *Execute a JS function* → `Checker.check` |
| Button | `ResetButton` | Label: `Reset`; onClick → `Checker.reset` |
| Text | `ResultText` | see below |
| Button | `RunTestsButton` | Label: `Run all tests`; onClick → `Checker.runTests` |
| Table | `TestsTable` | Table data: `{{appsmith.store.tests || []}}` |

`ResultText` properties (use the `JS` toggle next to each property):
- Text:
  `{{appsmith.store.result ? (appsmith.store.result.available ? 'AVAILABLE' : (appsmith.store.result.validationError ? 'CHECK YOUR INPUT' : 'UNAVAILABLE')) + ' [' + appsmith.store.result.reasonCode + '] — ' + appsmith.store.result.message : 'Enter a start time and duration, then press Check.'}}`
- Text color:
  `{{!appsmith.store.result ? '#64748b' : appsmith.store.result.available ? '#047857' : appsmith.store.result.validationError ? '#b45309' : '#b91c1c'}}`

Use Single-line text for both inputs (not Number/Date) so that invalid values reach the
same validation rules as the code-based solution instead of being blocked by the widget.

## 3. Logic (JS tab → **+ New JS object**)
Rename the JS object to `Checker` and replace its whole content with `lowcode/Checker.js`
from this repository. Save. This is the only script in the app; everything else is
widget configuration.

## 4. Run the identical tests
1. Click **Run all tests** → the table should list T1–T8. Screenshot it.
2. Manually enter each case and press **Check**; screenshot each result:

| ID | Start | Duration | Blocked | Expected |
|---|---|---|---|---|
| T1 | 11:30 | 60 | off | AVAILABLE |
| T2 | 10:30 | 60 | off | UNAVAILABLE [OVERLAP] |
| T3 | 11:30 | 60 | on | UNAVAILABLE [BLOCKED] |
| T4 | 11:30 | 0 | off | CHECK YOUR INPUT [INVALID_DURATION] |
| T5 | 11:30 | 121 | off | CHECK YOUR INPUT [TOO_LONG] |
| T6 | 08:00 | 60 | off | CHECK YOUR INPUT [PAST_TIME] |
| T7 | 11:00 | 60 | off | AVAILABLE |
| T8 | — | — | — | `BookingsText` and table row T8 still show 10:00–11:00 unchanged |

Write down the **observed** result for each case, even if it differs from the expected one.

## 5. Narrow screen
Switch the editor to **Mobile** preview (canvas size selector) and take one screenshot.

## 6. Publish and export
1. **Deploy** (top right) → open the deployed app → **Share** → enable
   *Make application public* → copy the public URL (live demo link).
2. App name menu → **Export** → save the `.json` file as `lowcode/appsmith-export.json`
   in this repository. Before committing, open it and confirm it contains no tokens,
   e-mails or datasource credentials.

## 7. Record limitations
Note anything the platform could not do as specified (for example: no unit-test runner,
no diff review of widget changes, behaviour of the time input). These go into the report
as **incomplete or simulated low-code behaviour**.
