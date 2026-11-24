# Practice #12 — Shared requirement / acceptance-criteria sheet

Applies unchanged to both solutions: **code-based** (this repository) and **low-code** (Appsmith).

## User story
As a student, I want to choose a future start time and a duration for the campus room
*Allen Hall 101* and immediately see whether it is **Available** or **Unavailable** with a
clear reason, so that I can plan a study session without changing anyone's booking.

## Acceptance criteria
| ID | Criterion |
|---|---|
| AC1 | Start time must be in the future (strictly after the reference time 09:00). |
| AC2 | Duration must be greater than zero and at most 120 minutes. |
| AC3 | A requested interval that overlaps an existing booking is Unavailable. Touching endpoints (e.g. 11:00 after a booking ending 11:00) do not overlap. |
| AC4 | A blocked room is Unavailable. |
| AC5 | A clear decision is displayed; existing bookings are never changed. |
| AC6 | Invalid input receives understandable feedback (a message, not an error trace). |

## Inputs
| Input | Type | Source |
|---|---|---|
| `startTime` | string `HH:MM` (24 h) | user (time field) |
| `durationMinutes` | whole number, raw form value | user (number field) |
| `blocked` | boolean | room-status control |
| bookings | fixed fictional list | fixture |

## Fixed fictional data
| Item | Value |
|---|---|
| Room | Allen Hall 101 (`r1`), capacity 40 — reused from Practice #11 fixtures |
| Existing booking | `b1` 10:00–11:00, "CS101 Lecture" |
| Reference "current time" | 09:00 (fixed, so both solutions are tested with identical inputs) |
| Day boundary | booking must end by 24:00 |

## Outputs
| Output | Values |
|---|---|
| `available` | `true` / `false` |
| `reasonCode` | `AVAILABLE`, `INVALID_START`, `INVALID_DURATION`, `TOO_LONG`, `PAST_TIME`, `OUT_OF_DAY`, `BLOCKED`, `OVERLAP` |
| `message` | human-readable text shown on screen |

**Evaluation order** (first failing rule wins): `INVALID_START` → `INVALID_DURATION` → `TOO_LONG` → `PAST_TIME` → `OUT_OF_DAY` → `BLOCKED` → `OVERLAP` → `AVAILABLE`.

## Common test inputs (prepared before implementation)
| ID | Start | Duration | Blocked | Expected available | Expected code | AC |
|---|---|---|---|---|---|---|
| T1 | 11:30 | 60 | no | true | AVAILABLE | AC3, AC5 |
| T2 | 10:30 | 60 | no | false | OVERLAP | AC3 |
| T3 | 11:30 | 60 | yes | false | BLOCKED | AC4 |
| T4 | 11:30 | 0 | no | false (validation) | INVALID_DURATION | AC2, AC6 |
| T5 | 11:30 | 121 | no | false (validation) | TOO_LONG | AC2, AC6 |
| T6 | 08:00 | 60 | no | false (validation) | PAST_TIME | AC1, AC6 |
| T7 | 11:00 | 60 | no | true | AVAILABLE | AC3 (adjacent) |
| T8 | — | — | — | bookings identical before/after T1–T7 | — | AC5 |
