import { describe, expect, it } from 'vitest';
import { checkAvailability } from '@/booking';
import { sampleRooms } from '@/sampleData';
import { createMockLlmAdapter } from '@/explain/mockLlmAdapter';
import { explainAvailability, resultToReasonCode } from '@/explain/explainAvailability';
import { minutesToTimeString } from '@/utils/time';
import type { ExplainInput } from '@/types';

const NOW = 540; // 09:00
const room = (id: string) => sampleRooms.find((r) => r.id === id)!;

/** Same chain as the UI: rules -> reason code -> mock LLM -> validated explanation. */
async function run(roomId: string, start: number, end: number, adapter = createMockLlmAdapter()) {
  const r = room(roomId);
  const before = structuredClone(r.bookings);
  const result = checkAvailability(r, start, end, NOW, r.bookings);
  const snapshot = structuredClone(result);
  const input: ExplainInput = {
    roomLabel: r.name,
    start: Number.isFinite(start) ? minutesToTimeString(start) : '',
    end: Number.isFinite(end) ? minutesToTimeString(end) : '',
    isAvailable: result.decision === 'available',
    reasonCode: resultToReasonCode(result),
  };
  const explained = await explainAvailability(input, adapter, 1000);
  return { result, snapshot, explained, bookingsBefore: before, bookingsAfter: r.bookings, input };
}

describe('Practice 11 — Task 05 test cases', () => {
  it('TC1 available slot: explanation says available, decision unchanged', async () => {
    const c = await run('r1', 660, 720);
    expect(c.result.decision).toBe('available');
    expect(c.input.reasonCode).toBe('AVAILABLE');
    expect(c.explained.source).toBe('adapter');
    expect(c.explained.explanation).toMatch(/is available/);
    expect(c.result).toEqual(c.snapshot);
  });

  it('TC2 overlap: explanation mentions overlap, no booking owner or purpose leaked', async () => {
    const c = await run('r1', 630, 690);
    expect(c.result.decision).toBe('unavailable');
    expect(c.input.reasonCode).toBe('OVERLAP');
    expect(c.explained.explanation).toMatch(/overlaps an existing booking/);
    expect(c.explained.explanation).not.toMatch(/Prof\. Chen|CS101/);
  });

  it('TC3 blocked room: reason code BLOCKED, explanation says blocked', async () => {
    const c = await run('r2', 660, 720);
    expect(c.input.reasonCode).toBe('BLOCKED');
    expect(c.explained.explanation).toMatch(/blocked/);
  });

  it('TC4 invalid interval (end before start): INVALID_INTERVAL', async () => {
    const c = await run('r1', 720, 690);
    expect(c.input.reasonCode).toBe('INVALID_INTERVAL');
    expect(c.explained.explanation).toMatch(/interval is invalid/);
  });

  it('TC5 past time (start before 09:00): PAST_TIME', async () => {
    const c = await run('r4', 480, 510);
    expect(c.input.reasonCode).toBe('PAST_TIME');
    expect(c.explained.explanation).toMatch(/in the past/);
  });

  it('TC6 too long (3 hours): TOO_LONG', async () => {
    const c = await run('r4', 600, 780);
    expect(c.input.reasonCode).toBe('TOO_LONG');
    expect(c.explained.explanation).toMatch(/exceeds the maximum/);
  });

  it('TC7 empty input (no times selected): rejected, deterministic fallback', async () => {
    const c = await run('r1', NaN, NaN);
    expect(c.result.decision).toBe('unavailable');
    expect(c.explained.source).toBe('fallback');
    expect(c.explained.error).toBe('invalid input');
  });

  it('TC8 overly long room label (101 chars): rejected', async () => {
    const r = await explainAvailability(
      { roomLabel: 'R'.repeat(101), start: '10:00', end: '11:00', isAvailable: true, reasonCode: 'AVAILABLE' },
      createMockLlmAdapter(),
      1000
    );
    expect(r.source).toBe('fallback');
  });

  it('TC9 timeout (adapter 300 ms, limit 50 ms): fallback keeps the real decision', async () => {
    const r = await explainAvailability(
      { roomLabel: 'Allen Hall 101', start: '10:30', end: '11:30', isAvailable: false, reasonCode: 'OVERLAP' },
      createMockLlmAdapter({ delayMs: 300 }),
      50
    );
    expect(r.source).toBe('fallback');
    expect(r.error).toBe('adapter timeout');
    expect(r.explanation).toMatch(/unavailable/);
  });

  it('TC10 simulated API failure: fallback keeps the real decision', async () => {
    const r = await explainAvailability(
      { roomLabel: 'Allen Hall 101', start: '11:00', end: '12:00', isAvailable: true, reasonCode: 'AVAILABLE' },
      createMockLlmAdapter({ shouldFail: true }),
      1000
    );
    expect(r.source).toBe('fallback');
    expect(r.explanation).toMatch(/is available/);
  });

  it('TC11 explaining never changes the decision or the booking data', async () => {
    for (const [id, s, e] of [['r1', 660, 720], ['r1', 630, 690], ['r2', 660, 720]] as const) {
      const c = await run(id, s, e);
      expect(c.result).toEqual(c.snapshot);
      expect(c.bookingsAfter).toEqual(c.bookingsBefore);
    }
  });
});
