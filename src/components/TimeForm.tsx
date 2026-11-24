import { useMemo } from 'react';
import { Clock, CalendarClock } from 'lucide-react';
import {
  MINUTES_PER_DAY,
  TIME_STEP_MINUTES,
  generateTimeOptions,
  minutesToTimeString,
  timeStringToMinutes,
} from '@/utils/time';
import { MAX_BOOKING_DURATION_MINUTES } from '@/booking';

interface TimeFormProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (v: string) => void;
  onEndTimeChange: (v: string) => void;
  currentMinutes: number;
  onCheck: () => void;
  onReset: () => void;
  disabled: boolean;
}

export function TimeForm({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  currentMinutes,
  onCheck,
  onReset,
  disabled,
}: TimeFormProps) {
  // AC1: start must be strictly after current time; range [0, 1440].
  const startOptions = useMemo(
    () => generateTimeOptions(currentMinutes, MINUTES_PER_DAY - TIME_STEP_MINUTES),
    [currentMinutes]
  );

  const startMinutes = startTime ? timeStringToMinutes(startTime) : NaN;

  // End time is enabled only when a valid start is selected.
  const isStartValid = !isNaN(startMinutes) && startMinutes > currentMinutes;
  const isEndDisabled = disabled || !isStartValid;

  // AC1: end must be strictly greater than start; range (start, 1440].
  const endOptions = useMemo(() => {
    if (!isStartValid) return [];
    return generateTimeOptions(
      startMinutes,
      Math.min(startMinutes + MAX_BOOKING_DURATION_MINUTES, MINUTES_PER_DAY)
    );
  }, [startMinutes, isStartValid]);

  const hasStartOptions = startOptions.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start time dropdown */}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
            Start time
          </span>
          <select
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            disabled={disabled || !hasStartOptions}
            className={[
              'w-full rounded-lg border px-3 py-2.5 text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-sky-400',
              disabled || !hasStartOptions
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 bg-white hover:border-slate-400',
            ].join(' ')}
            aria-label="Start time"
          >
            <option value="">
              {hasStartOptions ? 'Select start time…' : 'No available start times'}
            </option>
            {startOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* End time dropdown — disabled until a valid start is chosen */}
        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <Clock className="h-4 w-4 text-slate-400" />
            End time
          </span>
          <select
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            disabled={isEndDisabled}
            className={[
              'w-full rounded-lg border px-3 py-2.5 text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-sky-400',
              isEndDisabled
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 bg-white hover:border-slate-400',
            ].join(' ')}
            aria-label="End time"
          >
            <option value="">
              {isEndDisabled ? 'Select a start time first' : 'Select end time…'}
            </option>
            {endOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600 border border-slate-200">
        <CalendarClock className="h-4 w-4 flex-shrink-0 text-slate-400" />
        <span>
          Current time reference: <strong className="text-slate-800">{minutesToTimeString(currentMinutes)}</strong>
          {' '}
          — your start must be after this.
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onCheck}
          disabled={disabled}
          className={[
            'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
            disabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-[0.98] shadow-sm',
          ].join(' ')}
        >
          Check Availability
        </button>
        <button
          onClick={onReset}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
