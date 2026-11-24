import type { ExplainAdapter, ExplainInput, ExplainOutput, ReasonCode } from '@/types';

export interface MockLlmOptions {
  /** Simulate network latency / a slow provider. */
  delayMs?: number;
  /** Simulate an API failure (the adapter rejects). */
  shouldFail?: boolean;
}

const REASON_TEXT: Record<ReasonCode, string> = {
  AVAILABLE: '',
  OVERLAP: 'the requested time overlaps an existing booking',
  BLOCKED: 'the room is currently blocked',
  INVALID_INTERVAL: 'the requested time interval is invalid',
  PAST_TIME: 'the start time is in the past',
  TOO_LONG: 'the requested duration exceeds the maximum allowed',
};

/**
 * MOCK LLM adapter — no network calls, no secrets, no external dependencies.
 * Builds an explanation solely from the structured ExplainInput. Use
 * MockLlmOptions to simulate a timeout (delayMs) or an API failure (shouldFail).
 */
export function createMockLlmAdapter(options: MockLlmOptions = {}): ExplainAdapter {
  const { delayMs = 0, shouldFail = false } = options;
  return {
    async explain(input: ExplainInput): Promise<ExplainOutput> {
      if (shouldFail) {
        throw new Error('Mock LLM API failure');
      }
      if (delayMs > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
      }
      if (input.isAvailable) {
        return {
          explanation: `${input.roomLabel} is available from ${input.start} to ${input.end}. This is a mock explanation and not a booking confirmation.`,
        };
      }
      const reason = REASON_TEXT[input.reasonCode] || 'the request could not be processed';
      return {
        explanation: `${input.roomLabel} is unavailable from ${input.start} to ${input.end} because ${reason}. This is a mock explanation and not a booking confirmation.`,
      };
    },
  };
}
