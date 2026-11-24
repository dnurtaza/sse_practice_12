import { describe, expect, it } from 'vitest';
import { explainAvailability } from '@/explain/explainAvailability';
import { createRequestGuard } from '@/explain/requestGuard';
import { createMockLlmAdapter } from '@/explain/mockLlmAdapter';
import type { ExplainInput } from '@/types';

const available: ExplainInput = { roomLabel: 'Allen Hall 101', start: '11:00', end: '12:00', isAvailable: true, reasonCode: 'AVAILABLE' };
const overlap: ExplainInput = { roomLabel: 'Allen Hall 101', start: '10:30', end: '11:30', isAvailable: false, reasonCode: 'OVERLAP' };
const says = (text: string) => ({ async explain() { return { explanation: text }; } });

describe('Fix 1 (M1): a stale explanation is never shown for a newer result', () => {
  it('F1-a an older request id is no longer current after a new request or a reset', () => {
    const guard = createRequestGuard();
    const first = guard.start();
    expect(guard.isCurrent(first)).toBe(true);
    guard.invalidate(); // user changed the inputs / pressed Check again
    expect(guard.isCurrent(first)).toBe(false);
    const second = guard.start();
    expect(guard.isCurrent(second)).toBe(true);
    expect(guard.isCurrent(first)).toBe(false);
  });

  it('F1-b race: the slow "available" answer for the old slot is dropped', async () => {
    const guard = createRequestGuard();
    let shown: string | null = null;
    const ask = async (input: ExplainInput, delayMs: number) => {
      const id = guard.start();
      const r = await explainAvailability(input, createMockLlmAdapter({ delayMs }), 1000);
      if (guard.isCurrent(id)) shown = r.explanation;
    };
    const old = ask(available, 80); // Explain for 11:00-12:00 (slow)
    guard.invalidate(); // Check pressed for 10:30-11:30
    const fresh = ask(overlap, 10); // Explain for the new result
    await Promise.all([old, fresh]);
    expect(shown).toMatch(/unavailable from 10:30 to 11:30/);
  });
});

describe('Fix 2 (M2): the explanation must state the real status and use only supplied facts', () => {
  it('F2-a rejects a positive-sounding text for an unavailable room', async () => {
    const r = await explainAvailability(overlap, says('Good news, the room is open for you at that time.'), 500);
    expect(r.source).toBe('fallback');
  });

  it('F2-b rejects invented booking details and names', async () => {
    const r = await explainAvailability(overlap, says('Allen Hall 101 is unavailable because it is booked by Prof. Chen for CS101 Lecture.'), 500);
    expect(r.source).toBe('fallback');
  });

  it('F2-c rejects times that were not supplied', async () => {
    const r = await explainAvailability(overlap, says('Allen Hall 101 is unavailable from 10:30 to 11:30 because a lecture runs 10:00 to 11:00.'), 500);
    expect(r.source).toBe('fallback');
  });

  it('F2-d no longer rejects a correct text that mentions "no overlap"', async () => {
    const r = await explainAvailability(available, says('Allen Hall 101 is free from 11:00 to 12:00 because there is no overlap with existing bookings.'), 500);
    expect(r.source).toBe('adapter');
  });

  it('F2-e accepts the real Gemini outputs of Prompt B and C (Task 04)', async () => {
    const ok = [
      [available, 'Allen Hall 101 is available from 11:00 to 12:00 because there are no conflicting reservations.'],
      [overlap, 'Allen Hall 101 is unavailable from 10:30 to 11:30 because the requested time overlaps with an existing booking.'],
      [available, 'Allen Hall 101 from 11:00 to 12:00 is available as no rule blocks the slot.'],
      [overlap, 'Allen Hall 101 from 10:30 to 11:30 is not available because it overlaps an existing booking.'],
    ] as const;
    for (const [input, text] of ok) {
      expect((await explainAvailability(input, says(text), 500)).source).toBe('adapter');
    }
  });

  it('F2-f rejects the booking-like promise from Prompt A ("You can book this room")', async () => {
    const r = await explainAvailability(available, says('Available. You can book this room for this time slot.'), 500);
    expect(r.source).toBe('fallback');
  });
});
