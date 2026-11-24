import type { Room, Booking, ValidationResult } from './types';
import { MINUTES_PER_DAY, minutesToTimeString } from '@/utils/time';

export const MAX_BOOKING_DURATION_MINUTES = 120;

/**
 * AC1: 0 ≤ start < end ≤ 1440 and start strictly after current time.
 * AC2: duration must not exceed 120 minutes.
 * AC3: room must not be blocked.
 * AC4: no overlap with existing bookings (touching endpoints allowed).
 * Returns an Available/Unavailable decision without modifying booking data.
 */
export function checkAvailability(
  room: Room,
  start: number,
  end: number,
  currentTime: number,
  bookings: Booking[]
): ValidationResult {
  const reasons: string[] = [];

  // AC1 — interval validity
  if (!(Number.isFinite(start) && Number.isFinite(end))) {
    reasons.push('Start and end times must be valid numbers.');
    return { decision: 'unavailable', reasons };
  }
  if (start < 0 || end > MINUTES_PER_DAY) {
    reasons.push('Times must fall within a single day (00:00–24:00).');
  }
  if (!(start < end)) {
    reasons.push('Start time must be earlier than end time.');
  }
  if (start <= currentTime) {
    reasons.push('Start time must be strictly after the current time.');
  }

  // AC2 — duration cap
  const duration = end - start;
  if (duration > MAX_BOOKING_DURATION_MINUTES) {
    reasons.push(
      `Booking duration cannot exceed ${MAX_BOOKING_DURATION_MINUTES} minutes (2 hours).`
    );
  }

  // AC3 — blocked room
  if (room.blocked) {
    reasons.push(`This room is currently marked as blocked and cannot be booked.`);
  }

  // AC4 — overlap check (touching endpoints allowed)
  const isWithinDay = start >= 0 && end <= MINUTES_PER_DAY && start < end;
  if (isWithinDay) {
    const overlapping = bookings.filter(
      (b) => b.roomId === room.id && start < b.end && end > b.start
    );
    if (overlapping.length > 0) {
      const first = overlapping[0];
      reasons.push(
        `Overlaps with existing booking "${first.purpose}" (${minutesToTimeString(first.start)}–${minutesToTimeString(first.end)}).`
      );
    }
  }

  return {
    decision: reasons.length === 0 ? 'available' : 'unavailable',
    reasons,
  };
}
