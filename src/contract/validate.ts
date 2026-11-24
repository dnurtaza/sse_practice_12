import { MAX_BOOKING_DURATION_MINUTES } from '@/booking';
import { MINUTES_PER_DAY, minutesToTimeString } from '@/utils/time';
import type { ContractReasonCode, ContractRequest } from './types';

export type ValidationOutcome =
  | { ok: true; start: number; end: number; duration: number }
  | { ok: false; reasonCode: ContractReasonCode; message: string };

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Input validation only (AC1, AC2, AC6). No booking data is read here.
 * Order of checks defines which message the user sees first.
 */
export function validateRequest(req: ContractRequest, nowMinutes: number): ValidationOutcome {
  const match = HHMM.exec(String(req.startTime ?? '').trim());
  if (!match) {
    return { ok: false, reasonCode: 'INVALID_START', message: 'Enter a start time in HH:MM format.' };
  }
  const start = Number(match[1]) * 60 + Number(match[2]);

  const rawDuration = String(req.durationMinutes ?? '').trim();
  const duration = rawDuration === '' ? NaN : Number(rawDuration);
  if (!Number.isInteger(duration) || duration <= 0) {
    return {
      ok: false,
      reasonCode: 'INVALID_DURATION',
      message: 'Duration must be a whole number of minutes greater than 0.',
    };
  }
  if (duration > MAX_BOOKING_DURATION_MINUTES) {
    return {
      ok: false,
      reasonCode: 'TOO_LONG',
      message: `Duration must be at most ${MAX_BOOKING_DURATION_MINUTES} minutes (you entered ${duration}).`,
    };
  }
  if (start <= nowMinutes) {
    return {
      ok: false,
      reasonCode: 'PAST_TIME',
      message: `Start time must be in the future (after ${minutesToTimeString(nowMinutes)}).`,
    };
  }
  const end = start + duration;
  if (end > MINUTES_PER_DAY) {
    return {
      ok: false,
      reasonCode: 'OUT_OF_DAY',
      message: 'The booking must end by 24:00 on the same day.',
    };
  }
  return { ok: true, start, end, duration };
}
