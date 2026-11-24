import { describe, expect, it } from 'vitest';
import { createMockLlmAdapter } from '@/explain/mockLlmAdapter';
import { explainAvailability, resultToReasonCode } from '@/explain/explainAvailability';
import type { ExplainInput, ReasonCode, ValidationResult } from '@/types';

const validAvailable: ExplainInput = {
  roomLabel: 'Allen Hall 101',
  start: '10:00',
  end: '11:00',
  isAvailable: true,
  reasonCode: 'AVAILABLE',
};

const validUnavailable: ExplainInput = {
  roomLabel: 'Allen Hall 204',
  start: '10:00',
  end: '11:00',
  isAvailable: false,
  reasonCode: 'BLOCKED',
};

describe('explainAvailability - happy path', () => {
  it('returns an adapter explanation for valid available input', async () => {
    const r = await explainAvailability(validAvailable, createMockLlmAdapter(), 1000);
    expect(r.source).toBe('adapter');
    expect(r.explanation).toContain('Allen Hall 101');
    expect(r.explanation.length).toBeLessThanOrEqual(300);
    expect(r.error).toBeUndefined();
  });

  it('returns an adapter explanation for valid unavailable input', async () => {
    const r = await explainAvailability(validUnavailable, createMockLlmAdapter(), 1000);
    expect(r.source).toBe('adapter');
    expect(r.explanation).toContain('unavailable');
  });
});

describe('explainAvailability - input validation', () => {
  it('falls back on empty roomLabel', async () => {
    const r = await explainAvailability(
      { ...validAvailable, roomLabel: '' },
      createMockLlmAdapter(),
      1000
    );
    expect(r.source).toBe('fallback');
    expect(r.error).toBe('invalid input');
  });

  it('falls back on overly long roomLabel', async () => {
    const r = await explainAvailability(
      { ...validAvailable, roomLabel: 'x'.repeat(101) },
      createMockLlmAdapter(),
      1000
    );
    expect(r.source).toBe('fallback');
  });

  it('falls back on malformed start time', async () => {
    const r = await explainAvailability(
      { ...validAvailable, start: '9:0' },
      createMockLlmAdapter(),
      1000
    );
    expect(r.source).toBe('fallback');
  });

  it('falls back on malformed end time', async () => {
    const r = await explainAvailability(
      { ...validAvailable, end: '25:00' },
      createMockLlmAdapter(),
      1000
    );
    expect(r.source).toBe('fallback');
  });

  it('falls back on invalid reasonCode', async () => {
    const r = await explainAvailability(
      { ...validAvailable, reasonCode: 'BOGUS' as ReasonCode },
      createMockLlmAdapter(),
      1000
    );
    expect(r.source).toBe('fallback');
  });

  it('falls back on non-object input', async () => {
    const r = await explainAvailability(
      null as unknown as ExplainInput,
      createMockLlmAdapter(),
      1000
    );
    expect(r.source).toBe('fallback');
  });
});

describe('explainAvailability - adapter failures', () => {
  it('falls back on adapter failure', async () => {
    const r = await explainAvailability(
      validAvailable,
      createMockLlmAdapter({ shouldFail: true }),
      1000
    );
    expect(r.source).toBe('fallback');
    expect(r.error).toBe('Mock LLM API failure');
  });

  it('falls back on adapter timeout', async () => {
    const r = await explainAvailability(
      validAvailable,
      createMockLlmAdapter({ delayMs: 200 }),
      50
    );
    expect(r.source).toBe('fallback');
    expect(r.error).toBe('adapter timeout');
  });
});

describe('explainAvailability - output validation', () => {
  it('falls back when explanation exceeds 300 characters', async () => {
    const longAdapter = {
      async explain() {
        return { explanation: 'A. '.repeat(160) };
      },
    };
    const r = await explainAvailability(validAvailable, longAdapter, 1000);
    expect(r.source).toBe('fallback');
    expect(r.error).toBe('invalid output');
  });

  it('falls back when explanation has more than 2 sentences', async () => {
    const verboseAdapter = {
      async explain() {
        return { explanation: 'One. Two. Three.' };
      },
    };
    const r = await explainAvailability(validAvailable, verboseAdapter, 1000);
    expect(r.source).toBe('fallback');
  });

  it('falls back when explanation contradicts isAvailable', async () => {
    const contradictionAdapter = {
      async explain() {
        return { explanation: 'This room is unavailable and cannot be booked.' };
      },
    };
    const r = await explainAvailability(validAvailable, contradictionAdapter, 1000);
    expect(r.source).toBe('fallback');
  });

  it('falls back when explanation output is empty', async () => {
    const emptyAdapter = { async explain() {
      return { explanation: '' };
    } };
    const r = await explainAvailability(validAvailable, emptyAdapter, 1000);
    expect(r.source).toBe('fallback');
  });
});

describe('resultToReasonCode', () => {
  const mk = (reasons: string[]): ValidationResult => ({
    decision: reasons.length === 0 ? 'available' : 'unavailable',
    reasons,
  });

  it('maps available result', () => {
    expect(resultToReasonCode(mk([]))).toBe('AVAILABLE');
  });

  it('maps invalid interval reasons', () => {
    expect(resultToReasonCode(mk(['Start and end times must be valid numbers.']))).toBe(
      'INVALID_INTERVAL'
    );
    expect(resultToReasonCode(mk(['Times must fall within a single day (00:00–24:00).']))).toBe(
      'INVALID_INTERVAL'
    );
    expect(resultToReasonCode(mk(['Start time must be earlier than end time.']))).toBe(
      'INVALID_INTERVAL'
    );
  });

  it('maps past-time reason', () => {
    expect(resultToReasonCode(mk(['Start time must be strictly after the current time.']))).toBe(
      'PAST_TIME'
    );
  });

  it('maps too-long reason', () => {
    expect(
      resultToReasonCode(mk(['Booking duration cannot exceed 120 minutes (2 hours).']))
    ).toBe('TOO_LONG');
  });

  it('maps blocked reason', () => {
    expect(
      resultToReasonCode(mk(['This room is currently marked as blocked and cannot be booked.']))
    ).toBe('BLOCKED');
  });

  it('maps overlap reason', () => {
    expect(
      resultToReasonCode(mk(['Overlaps with existing booking "CS101 Lecture" (10:00–11:00).']))
    ).toBe('OVERLAP');
  });
});
