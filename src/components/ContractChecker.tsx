import { useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  FlaskConical,
  Lock,
  LockOpen,
  Timer,
  XCircle,
} from 'lucide-react';
import { checkContract } from '@/contract/checkContract';
import { CONTRACT_NOW_MINUTES, CONTRACT_ROOM } from '@/contract/fixture';
import { runSharedTests, type TestRow } from '@/contract/runSharedTests';
import type { ContractResult } from '@/contract/types';
import { MAX_BOOKING_DURATION_MINUTES } from '@/booking';
import { minutesToTimeString } from '@/utils/time';

/* ---------------------------------------------------------------- display */

export function ContractResultPanel({ result }: { result: ContractResult | null }) {
  if (!result) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Enter a start time and duration, then press <strong className="text-slate-700">Check</strong>.
      </div>
    );
  }
  const tone = result.available
    ? { box: 'border-emerald-200 bg-emerald-50', title: 'text-emerald-800', text: 'text-emerald-700', Icon: CheckCircle2, icon: 'text-emerald-600', label: 'Available' }
    : result.validationError
      ? { box: 'border-amber-200 bg-amber-50', title: 'text-amber-800', text: 'text-amber-700', Icon: AlertTriangle, icon: 'text-amber-600', label: 'Check your input' }
      : { box: 'border-red-200 bg-red-50', title: 'text-red-800', text: 'text-red-700', Icon: XCircle, icon: 'text-red-600', label: 'Unavailable' };
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 ${tone.box}`}
      role={result.available ? 'status' : 'alert'}
      aria-live="polite"
      data-testid="contract-result"
    >
      <tone.Icon className={`mt-0.5 h-6 w-6 flex-shrink-0 ${tone.icon}`} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`text-base font-bold ${tone.title}`}>{tone.label}</p>
          <code className="rounded bg-white/70 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
            {result.reasonCode}
          </code>
        </div>
        <p className={`mt-1 break-words text-sm ${tone.text}`}>{result.message}</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- test runner */

function TestRunner() {
  const [rows, setRows] = useState<TestRow[] | null>(null);
  const passed = rows?.filter((r) => r.pass).length ?? 0;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-sky-600" />
          <h2 className="text-base font-semibold text-slate-900">Shared test cases T1–T8</h2>
        </div>
        <button
          onClick={() => setRows(runSharedTests())}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Run all tests
        </button>
      </div>
      {rows && (
        <>
          <p className="mt-3 text-sm font-semibold text-slate-700" data-testid="test-summary">
            {passed} / {rows.length} passed
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 pr-3">Case</th>
                  <th className="py-2 pr-3">Expected</th>
                  <th className="py-2 pr-3">Observed</th>
                  <th className="py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-3 font-semibold text-slate-800">{r.id}</td>
                    <td className="py-2 pr-3 text-slate-600">{r.title}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-slate-600">{r.expected}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-slate-800">{r.observed}</td>
                    <td className={`py-2 font-semibold ${r.pass ? 'text-emerald-600' : 'text-red-600'}`}>
                      {r.pass ? 'PASS' : 'FAIL'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- form */

export function ContractChecker() {
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<ContractResult | null>(null);

  const reset = () => {
    setStartTime('');
    setDuration('');
    setBlocked(false);
    setResult(null);
  };

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Check {CONTRACT_ROOM.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a future start time and a duration of 1–{MAX_BOOKING_DURATION_MINUTES} minutes.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Clock className="h-4 w-4 text-slate-400" /> Start time
                </span>
                <input
                  type="time"
                  aria-label="Start time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setResult(null);
                  }}
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Timer className="h-4 w-4 text-slate-400" /> Duration (minutes)
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  step={1}
                  aria-label="Duration in minutes"
                  placeholder="e.g. 60"
                  value={duration}
                  onChange={(e) => {
                    setDuration(e.target.value);
                    setResult(null);
                  }}
                  className={inputCls}
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <span className="flex items-center gap-2 text-sm text-slate-700">
                {blocked ? <Lock className="h-4 w-4 text-red-500" /> : <LockOpen className="h-4 w-4 text-emerald-600" />}
                Room status: <strong>{blocked ? 'Blocked' : 'Open'}</strong>
              </span>
              <button
                role="switch"
                aria-checked={blocked}
                aria-label="Room blocked"
                onClick={() => {
                  setBlocked((b) => !b);
                  setResult(null);
                }}
                className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${blocked ? 'bg-red-500' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${blocked ? 'left-[22px]' : 'left-0.5'}`}
                />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <CalendarClock className="h-4 w-4 flex-shrink-0 text-slate-400" />
              Reference current time (fixed for reproducible tests):{' '}
              <strong className="text-slate-800">{minutesToTimeString(CONTRACT_NOW_MINUTES)}</strong>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  setResult(
                    checkContract({ startTime, durationMinutes: duration, blocked }, CONTRACT_ROOM, CONTRACT_NOW_MINUTES)
                  )
                }
                className="flex-1 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[0.98]"
              >
                Check
              </button>
              <button
                onClick={reset}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>

            <div className="mt-5">
              <ContractResultPanel result={result} />
            </div>
          </section>

          <TestRunner />
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <h3 className="text-sm font-semibold text-slate-900">{CONTRACT_ROOM.name}</h3>
            <p className="text-xs text-slate-500">
              {CONTRACT_ROOM.building} · capacity {CONTRACT_ROOM.capacity}
            </p>
            <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Existing bookings (read-only)
            </h4>
            <ul className="mt-2 space-y-2">
              {CONTRACT_ROOM.bookings.map((b) => (
                <li key={b.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-semibold tabular-nums text-slate-800">
                    {minutesToTimeString(b.start)}–{minutesToTimeString(b.end)}
                  </span>
                  <span className="block text-xs text-slate-500">{b.purpose}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Fictional data only. Checking never creates or changes bookings.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
