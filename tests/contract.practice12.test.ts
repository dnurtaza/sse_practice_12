import { describe, expect, it } from 'vitest';
import { checkContract } from '@/contract/checkContract';
import { CONTRACT_NOW_MINUTES, CONTRACT_ROOM } from '@/contract/fixture';
import { CONTRACT_TEST_CASES } from '@/contract/testCases';
import { validateRequest } from '@/contract/validate';
import { sampleRooms } from '@/sampleData';

const run = (startTime: string, durationMinutes: string | number, blocked = false) =>
  checkContract({ startTime, durationMinutes, blocked }, CONTRACT_ROOM, CONTRACT_NOW_MINUTES);

describe('Practice #12 shared test cases T1–T8 (code-based)', () => {
  const snapshot = JSON.stringify(sampleRooms);

  for (const tc of CONTRACT_TEST_CASES) {
    it(`${tc.id} ${tc.title} -> ${tc.expectedCode}`, () => {
      const r = checkContract(tc.request, CONTRACT_ROOM, CONTRACT_NOW_MINUTES);
      expect(r.available).toBe(tc.expectedAvailable);
      expect(r.reasonCode).toBe(tc.expectedCode);
      expect(r.message.length).toBeGreaterThan(10);
    });
  }

  it('T8 booking data unchanged after running T1–T7', () => {
    for (const tc of CONTRACT_TEST_CASES) checkContract(tc.request, CONTRACT_ROOM, CONTRACT_NOW_MINUTES);
    expect(JSON.stringify(sampleRooms)).toBe(snapshot);
    expect(CONTRACT_ROOM.blocked).toBe(false); // T3 must not flip the fixture flag
    expect(CONTRACT_ROOM.bookings).toEqual([
      { id: 'b1', roomId: 'r1', start: 600, end: 660, bookedBy: 'Prof. Chen', purpose: 'CS101 Lecture' },
    ]);
  });
});

describe('contract boundaries and invalid input (AC1, AC2, AC6)', () => {
  it('duration 120 is accepted, 121 rejected', () => {
    expect(run('11:00', 120).reasonCode).toBe('AVAILABLE');
    expect(run('11:00', 121).reasonCode).toBe('TOO_LONG');
  });

  it('start equal to reference time is PAST_TIME; one minute later is allowed', () => {
    expect(run('09:00', 30).reasonCode).toBe('PAST_TIME');
    expect(run('09:01', 30).reasonCode).toBe('AVAILABLE');
  });

  it('interval ending exactly at booking start is available (09:30 + 30 -> 10:00)', () => {
    expect(run('09:30', 30).reasonCode).toBe('AVAILABLE');
    expect(run('09:30', 31).reasonCode).toBe('OVERLAP');
  });

  it.each([
    ['', 'INVALID_START'],
    ['25:00', 'INVALID_START'],
    ['11:5', 'INVALID_START'],
    ['<script>', 'INVALID_START'],
  ])('start %j -> %s', (start, code) => {
    expect(run(start, 30).reasonCode).toBe(code);
  });

  it.each([['', 'INVALID_DURATION'], ['abc', 'INVALID_DURATION'], ['-15', 'INVALID_DURATION'], ['30.5', 'INVALID_DURATION'], ['NaN', 'INVALID_DURATION'], ['Infinity', 'INVALID_DURATION']])(
    'duration %j -> %s',
    (d, code) => {
      expect(run('11:30', d).reasonCode).toBe(code);
    }
  );

  it('ending after 24:00 is OUT_OF_DAY', () => {
    expect(run('23:30', 60).reasonCode).toBe('OUT_OF_DAY');
    expect(run('23:00', 60).reasonCode).toBe('AVAILABLE');
  });

  it('validation errors are flagged and take precedence over blocked/overlap', () => {
    const r = run('10:30', 0, true);
    expect(r.validationError).toBe(true);
    expect(r.reasonCode).toBe('INVALID_DURATION');
  });

  it('blocked takes precedence over overlap', () => {
    expect(run('10:30', 60, true).reasonCode).toBe('BLOCKED');
  });

  it('validateRequest reads no booking data and returns computed interval', () => {
    expect(validateRequest({ startTime: '11:30', durationMinutes: '45', blocked: false }, 540)).toEqual({
      ok: true,
      start: 690,
      end: 735,
      duration: 45,
    });
  });

  it('overlap message names the conflicting booking', () => {
    expect(run('10:30', 60).message).toContain('CS101 Lecture');
  });
});
