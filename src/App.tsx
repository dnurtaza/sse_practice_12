import { useMemo, useRef, useState } from 'react';
import { sampleRooms } from '@/sampleData';
import type { ExplainInput, ExplainResult, ValidationResult } from '@/types';
import { MAX_BOOKING_DURATION_MINUTES, checkAvailability } from '@/booking';
import {
  MINUTES_PER_DAY,
  formatDuration,
  isSelectableEnd,
  minutesToTimeString,
  timeStringToMinutes,
} from '@/utils/time';
import { buildRoomCriteria, collectEquipment, filterRooms } from '@/utils/roomFilters';
import { createMockLlmAdapter } from '@/explain/mockLlmAdapter';
import { explainAvailability, resultToReasonCode } from '@/explain/explainAvailability';
import { createRequestGuard } from '@/explain/requestGuard';
import { RoomFilters } from '@/components/RoomFilters';
import { RoomPicker } from '@/components/RoomPicker';
import { TimeForm } from '@/components/TimeForm';
import { DecisionPanel } from '@/components/DecisionPanel';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { Building2, ListChecks, ShieldCheck, Sparkles } from 'lucide-react';

const mockAdapter = createMockLlmAdapter({ delayMs: 300 });
const EXPLAIN_TIMEOUT_MS = 2000;

const roomsMatching = (attendees: string, requiredEquipment: string[]) =>
  filterRooms(sampleRooms, buildRoomCriteria(attendees, requiredEquipment));

function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState('');
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [explanation, setExplanation] = useState<ExplainResult | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  // Fix 1 (M1): ignore explanations that arrive after the inputs or result changed.
  const explainGuard = useRef(createRequestGuard()).current;

  // "Current time" for the demo — a slider lets users explore AC1 without waiting.
  // Defaults to 09:00 (540 min) so the first check is meaningful.
  const [demoMinutes, setDemoMinutesRaw] = useState(540);

  const selectedRoom = useMemo(
    () => sampleRooms.find((r) => r.id === selectedRoomId) ?? null,
    [selectedRoomId]
  );

  // When the demo current time moves past the selected start, clear stale
  // time selections so the dropdowns never show an invalid value.
  const setDemoMinutes = (m: number) => {
    setDemoMinutesRaw(m);
    setResult(null);
    clearExplanation();
    const startNum = timeStringToMinutes(startTime);
    if (!isNaN(startNum) && startNum <= m) {
      setStartTime('');
      setEndTime('');
    }
  };

  const filteredRooms = useMemo(
    () => roomsMatching(attendees, requiredEquipment),
    [attendees, requiredEquipment]
  );

  const equipmentOptions = useMemo(() => collectEquipment(sampleRooms), []);

  const hasActiveFilters = attendees !== '' || requiredEquipment.length > 0;

  const applyFilters = (nextAttendees: string, nextEquipment: string[]) => {
    setAttendees(nextAttendees);
    setRequiredEquipment(nextEquipment);
    const selectedStillVisible = roomsMatching(nextAttendees, nextEquipment).some(
      (r) => r.id === selectedRoomId
    );
    if (selectedRoomId && !selectedStillVisible) {
      setSelectedRoomId(null);
      setResult(null);
      clearExplanation();
    }
  };

  const toggleEquipment = (item: string) =>
    applyFilters(
      attendees,
      requiredEquipment.includes(item)
        ? requiredEquipment.filter((e) => e !== item)
        : [...requiredEquipment, item]
    );

  const handleSelectRoom = (id: string) => {
    setSelectedRoomId(id);
    setResult(null);
    clearExplanation();
  };

  const roomBookings = useMemo(
    () =>
      selectedRoom
        ? [...selectedRoom.bookings].sort((a, b) => a.start - b.start)
        : [],
    [selectedRoom]
  );

  const clearExplanation = () => {
    explainGuard.invalidate();
    setExplanation(null);
    setExplainLoading(false);
  };

  const handleExplain = async () => {
    if (!result || !selectedRoom) return;
    const requestId = explainGuard.start();
    setExplanation(null);
    setExplainLoading(true);
    const input: ExplainInput = {
      roomLabel: selectedRoom.name,
      start: startTime,
      end: endTime,
      isAvailable: result.decision === 'available',
      reasonCode: resultToReasonCode(result),
    };
    const res = await explainAvailability(input, mockAdapter, EXPLAIN_TIMEOUT_MS);
    if (!explainGuard.isCurrent(requestId)) return; // stale response
    setExplanation(res);
    setExplainLoading(false);
  };

  const handleCheck = () => {
    if (!selectedRoom) {
      setResult({
        decision: 'unavailable',
        reasons: ['Please select a room first.'],
      });
      return;
    }
    const start = timeStringToMinutes(startTime);
    const end = timeStringToMinutes(endTime);
    setResult(checkAvailability(selectedRoom, start, end, demoMinutes, selectedRoom.bookings));
    clearExplanation();
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    setResult(null);
    clearExplanation();
    const start = timeStringToMinutes(value);
    const end = timeStringToMinutes(endTime);
    if (endTime && !isSelectableEnd(start, end, MAX_BOOKING_DURATION_MINUTES)) {
      setEndTime('');
    }
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    setResult(null);
    clearExplanation();
  };

  const handleReset = () => {
    setStartTime('');
    setEndTime('');
    setResult(null);
    clearExplanation();
  };

  const durationLabel = (() => {
    const s = timeStringToMinutes(startTime);
    const e = timeStringToMinutes(endTime);
    if (isNaN(s) || isNaN(e) || e <= s) return null;
    return formatDuration(e - s);
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Smart Campus Room Availability Checker
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm">
                Check whether a campus room is free for your requested time slot.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1 — Room selection */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                  1
                </span>
                <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                  Select a room
                </h2>
              </div>
              <RoomFilters
                attendees={attendees}
                onAttendeesChange={(value) => applyFilters(value, requiredEquipment)}
                equipmentOptions={equipmentOptions}
                selectedEquipment={requiredEquipment}
                onToggleEquipment={toggleEquipment}
                onClear={() => applyFilters('', [])}
                isActive={hasActiveFilters}
              />
              <RoomPicker
                rooms={filteredRooms}
                selectedId={selectedRoomId}
                onSelect={handleSelectRoom}
              />
            </section>

            {/* Step 2 — Time input */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                  2
                </span>
                <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                  Enter your time slot
                </h2>
              </div>

              {/* Demo current-time slider */}
              <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
                <label className="mb-2 flex items-center justify-between gap-2 text-xs font-medium text-amber-800">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Demo: "current time" reference
                  </span>
                  <span className="font-bold tabular-nums">{minutesToTimeString(demoMinutes)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={MINUTES_PER_DAY - 1}
                  value={demoMinutes}
                  onChange={(e) => setDemoMinutes(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-600"
                  aria-label="Demo current time slider"
                />
                <p className="mt-1.5 text-[11px] leading-snug text-amber-700">
                  Slide to simulate the current time. Bookings must start strictly after this value
                  (acceptance criterion AC1).
                </p>
              </div>

              <TimeForm
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
                currentMinutes={demoMinutes}
                onCheck={handleCheck}
                onReset={handleReset}
                disabled={!selectedRoomId}
              />

              {durationLabel && (
                <p className="mt-3 text-xs text-slate-500">
                  Requested duration:{' '}
                  <span className="font-semibold text-slate-700">{durationLabel}</span>
                  <span className="ml-1 text-slate-400">(max {MAX_BOOKING_DURATION_MINUTES} min allowed)</span>
                </p>
              )}
            </section>

            {/* Step 3 — Decision */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                  3
                </span>
                <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                  Availability result
                </h2>
              </div>
              <DecisionPanel result={result} />
              {result && (
                <div className="mt-4">
                  <button
                    onClick={handleExplain}
                    disabled={explainLoading}
                    className={[
                      'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
                      explainLoading
                        ? 'bg-amber-200 text-amber-500 cursor-not-allowed'
                        : 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] shadow-sm',
                    ].join(' ')}
                  >
                    <Sparkles className="h-4 w-4" />
                    {explainLoading ? 'Explaining…' : 'Explain availability'}
                  </button>
                  <ExplanationPanel result={explanation} loading={explainLoading} />
                </div>
              )}
            </section>
          </div>

          {/* Right sidebar — existing bookings */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
              <div className="mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                  Existing bookings
                </h2>
              </div>

              {!selectedRoom ? (
                <p className="text-sm text-slate-400">
                  Select a room to see its current booking schedule.
                </p>
              ) : roomBookings.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No existing bookings for {selectedRoom.name}.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {roomBookings.map((b) => (
                    <li
                      key={b.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-medium text-slate-700">{b.purpose}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span className="tabular-nums font-medium text-slate-600">
                          {minutesToTimeString(b.start)}–{minutesToTimeString(b.end)}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>{b.bookedBy}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 rounded-lg bg-sky-50 p-3.5 text-[11px] leading-relaxed text-sky-700 border border-sky-100">
                <p className="mb-1 font-semibold text-sky-800">Booking rules</p>
                <ul className="space-y-0.5">
                  <li>• 00:00–24:00 only; start must be after "current time".</li>
                  <li>• Maximum duration: {MAX_BOOKING_DURATION_MINUTES} minutes.</li>
                  <li>• Blocked rooms cannot be booked.</li>
                  <li>• No overlapping slots (touching endpoints OK).</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/60 py-4">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400 sm:px-6">
          Fictional sample data — for demonstration purposes only.
        </p>
      </footer>
    </div>
  );
}

export default App;
