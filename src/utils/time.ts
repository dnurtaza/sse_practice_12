export const MINUTES_PER_DAY = 1440;

/** Granularity of the time dropdowns in minutes. */
export const TIME_STEP_MINUTES = 15;

/** Convert "HH:MM" to minutes from midnight. Returns NaN on invalid input. */
export function timeStringToMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return NaN;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 24 || m < 0 || m > 59) return NaN;
  if (h === 24 && m !== 0) return NaN; // 24:00 valid only as exact midnight end
  return h * 60 + m;
}

/** True only if both times are finite, end is after start, the span is within maxDuration, and end is within the day. */
export function isSelectableEnd(start: number, end: number, maxDuration: number): boolean {
  if (!(Number.isFinite(start) && Number.isFinite(end))) return false;
  return end > start && end - start <= maxDuration && end <= MINUTES_PER_DAY;
}

/** Convert minutes from midnight to "HH:MM". */
export function minutesToTimeString(min: number): string {
  const clamped = Math.max(0, Math.min(MINUTES_PER_DAY, Math.round(min)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Format a duration in minutes, e.g. "1h 30m" or "45m". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export interface TimeOption {
  value: string; // "HH:MM"
  minutes: number;
  label: string; // "HH:MM" for display
}

/**
 * Generate evenly-spaced time options strictly after `minMinutesExclusive`,
 * up to and including `maxMinutes`.
 */
export function generateTimeOptions(
  minMinutesExclusive: number,
  maxMinutes: number,
  step: number = TIME_STEP_MINUTES
): TimeOption[] {
  const options: TimeOption[] = [];
  // First step boundary strictly after the exclusive lower bound
  let m = Math.floor(minMinutesExclusive / step) * step + step;
  if (m <= minMinutesExclusive) m += step;
  for (; m <= maxMinutes; m += step) {
    options.push({
      value: minutesToTimeString(m),
      minutes: m,
      label: minutesToTimeString(m),
    });
  }
  return options;
}
