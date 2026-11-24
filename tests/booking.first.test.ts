import { describe, expect, it } from 'vitest';
import { checkAvailability } from '@/booking';
import type { Booking, Room } from '@/types';

const CURRENT_TIME = 540;

function createFixtures(blocked = false): { room: Room; bookings: Booking[] } {
  return {
    room: {
      id: 'r1',
      name: 'Test Room',
      building: 'Test Building',
      capacity: 20,
      blocked,
    },
    bookings: [
      {
        id: 'b1',
        roomId: 'r1',
        start: 600,
        end: 660,
        bookedBy: 'Test User',
        purpose: 'Existing booking',
      },
    ],
  };
}

describe('checkAvailability', () => {
  const reviewedCases = [
    { id: 'T01', start: 660, end: 720, expected: 'available', ac: 'AC4' },
    { id: 'T02', start: 540, end: 570, expected: 'unavailable', ac: 'AC1' },
    { id: 'T03', start: 720, end: 720, expected: 'unavailable', ac: 'AC1' },
    { id: 'T04', start: 750, end: 720, expected: 'unavailable', ac: 'AC1' },
    { id: 'T05', start: 1380, end: 1441, expected: 'unavailable', ac: 'AC1' },
    { id: 'T06', start: 720, end: 840, expected: 'available', ac: 'AC2' },
    { id: 'T07', start: 720, end: 841, expected: 'unavailable', ac: 'AC2' },
    { id: 'T08', start: 570, end: 600, expected: 'available', ac: 'AC4' },
    { id: 'T09', start: 630, end: 690, expected: 'unavailable', ac: 'AC4' },
    { id: 'T10', start: 570, end: 690, expected: 'unavailable', ac: 'AC4' },
    { id: 'T11', start: 615, end: 645, expected: 'unavailable', ac: 'AC4' },
    { id: 'T12', start: 600, end: 660, expected: 'unavailable', ac: 'AC4' },
  ] as const;

  it.each(reviewedCases)('$id ($ac) returns $expected', ({ start, end, expected }) => {
    const { room, bookings } = createFixtures();
    const before = structuredClone(bookings);

    const result = checkAvailability(room, start, end, CURRENT_TIME, bookings);

    expect(result.decision).toBe(expected);
    expect(bookings).toEqual(before);
  });

  it('T13 (AC3) rejects a blocked room without an overlap', () => {
    const { room, bookings } = createFixtures(true);
    const before = structuredClone(bookings);

    const result = checkAvailability(room, 660, 720, CURRENT_TIME, bookings);

    expect(result.decision).toBe('unavailable');
    expect(bookings).toEqual(before);
  });

  it('T14 (AC4) allows a valid interval when there are no bookings', () => {
    const { room } = createFixtures();
    const bookings: Booking[] = [];
    const before = structuredClone(bookings);

    const result = checkAvailability(room, 630, 690, CURRENT_TIME, bookings);

    expect(result.decision).toBe('available');
    expect(bookings).toEqual(before);
  });

  it('T15 (AC5) leaves booking data unchanged for available and unavailable checks', () => {
    const { room, bookings } = createFixtures();
    const before = structuredClone(bookings);

    const availableResult = checkAvailability(room, 660, 720, CURRENT_TIME, bookings);
    const unavailableResult = checkAvailability(room, 630, 690, CURRENT_TIME, bookings);

    expect(availableResult.decision).toBe('available');
    expect(unavailableResult.decision).toBe('unavailable');
    expect(bookings).toEqual(before);
  });

  it('T16 (AC1) allows an interval ending exactly at 1440', () => {
    const { room, bookings } = createFixtures();
    const before = structuredClone(bookings);

    const result = checkAvailability(room, 1320, 1440, CURRENT_TIME, bookings);

    expect(result.decision).toBe('available');
    expect(bookings).toEqual(before);
  });

  it('T17 (AC1) rejects an interval that starts before the current time', () => {
    const { room, bookings } = createFixtures();
    const before = structuredClone(bookings);

    const result = checkAvailability(room, 500, 560, CURRENT_TIME, bookings);

    expect(result.decision).toBe('unavailable');
    expect(bookings).toEqual(before);
  });
});
