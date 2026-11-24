import { describe, expect, it } from 'vitest';
import { checkAvailability } from '@/booking';
import { sampleRooms } from '@/sampleData';

const CURRENT_TIME = 540;
const room = sampleRooms[0];

describe('booking boundary conditions', () => {
  it('B01 (AC2) allows a booking of exactly 120 minutes', () => {
    const result = checkAvailability(room, 660, 780, CURRENT_TIME, room.bookings);
    expect(result.decision).toBe('available');
    expect(result.reasons).toEqual([]);
  });

  it('B02 (AC2) rejects a booking of 121 minutes', () => {
    const result = checkAvailability(room, 660, 781, CURRENT_TIME, room.bookings);
    expect(result.decision).toBe('unavailable');
    expect(result.reasons).toContain('Booking duration cannot exceed 120 minutes (2 hours).');
  });

  it('B03 (AC4) allows a booking that touches the start of an existing booking', () => {
    const result = checkAvailability(room, 560, 600, CURRENT_TIME, room.bookings);
    expect(result.decision).toBe('available');
  });

  it('B04 (AC4) allows a booking that touches the end of an existing booking', () => {
    const result = checkAvailability(room, 660, 690, CURRENT_TIME, room.bookings);
    expect(result.decision).toBe('available');
  });

  it('B05 (AC4) rejects a one-minute overlap at the start of an existing booking', () => {
    const result = checkAvailability(room, 599, 630, CURRENT_TIME, room.bookings);
    expect(result.decision).toBe('unavailable');
    expect(result.reasons).toContain(
      'Overlaps with existing booking "CS101 Lecture" (10:00–11:00).'
    );
  });

  it('B06 (AC4) rejects a one-minute overlap at the end of an existing booking', () => {
    const result = checkAvailability(room, 659, 700, CURRENT_TIME, room.bookings);
    expect(result.decision).toBe('unavailable');
    expect(result.reasons.some((r) => r.startsWith('Overlaps with existing booking'))).toBe(true);
  });
});
