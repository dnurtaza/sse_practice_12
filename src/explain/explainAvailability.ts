import { timeStringToMinutes } from '@/utils/time';
import type {
  ExplainAdapter,
  ExplainInput,
  ExplainOutput,
  ExplainResult,
  ReasonCode,
  ValidationResult,
} from '@/types';

const MAX_LENGTH = 300;
const MAX_SENTENCES = 2;
const LABEL_MAX = 100;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const REASON_CODES: ReasonCode[] = [
  'AVAILABLE',
  'OVERLAP',
  'BLOCKED',
  'INVALID_INTERVAL',
  'PAST_TIME',
  'TOO_LONG',
];

const FALLBACK_AVAILABLE =
  'This room is available for the requested time slot. This is a mock explanation and not a booking confirmation.';
const FALLBACK_UNAVAILABLE =
  'This room is unavailable for the requested time slot. This is a mock explanation and not a booking confirmation.';

function fallback(isAvailable: boolean): string {
  return isAvailable ? FALLBACK_AVAILABLE : FALLBACK_UNAVAILABLE;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function validateInput(input: unknown): input is ExplainInput {
  if (!isPlainObject(input)) return false;
  const roomLabel = input.roomLabel;
  if (typeof roomLabel !== 'string' || roomLabel.trim() === '' || roomLabel.length > LABEL_MAX) {
    return false;
  }
  if (typeof input.start !== 'string' || !TIME_PATTERN.test(input.start)) return false;
  if (typeof input.end !== 'string' || !TIME_PATTERN.test(input.end)) return false;
  if (Number.isNaN(timeStringToMinutes(input.start as string))) return false;
  if (Number.isNaN(timeStringToMinutes(input.end as string))) return false;
  if (typeof input.isAvailable !== 'boolean') return false;
  if (!REASON_CODES.includes(input.reasonCode as ReasonCode)) return false;
  return true;
}

// Fix 2 (M2): the explanation must positively state the deterministic status,
// and must not add people, booking details or times that were not supplied.
const SAYS_AVAILABLE = /\b(is|are) (available|free)\b|\bcan be (booked|used)\b/i;
const SAYS_UNAVAILABLE = /\bunavailable\b|\bnot available\b|\bcannot be (booked|used)\b|\bis blocked\b/i;
const INVENTED_DETAIL = /\b(booked|reserved) (by|for)\b|\b(Prof|Dr|Mr|Mrs|Ms)\.\s/i;

function agreesWithStatus(text: string, isAvailable: boolean): boolean {
  return isAvailable
    ? SAYS_AVAILABLE.test(text) && !SAYS_UNAVAILABLE.test(text)
    : SAYS_UNAVAILABLE.test(text) && !SAYS_AVAILABLE.test(text);
}

function usesOnlySuppliedFacts(text: string, input: ExplainInput): boolean {
  if (INVENTED_DETAIL.test(text)) return false;
  const times = text.match(/\b\d{1,2}:\d{2}\b/g) ?? [];
  return times.every((t) => t === input.start || t === input.end);
}

function validateOutput(output: unknown, input: ExplainInput): output is ExplainOutput {
  if (!isPlainObject(output)) return false;
  if (typeof output.explanation !== 'string') return false;
  const text = output.explanation as string;
  if (text.trim() === '') return false;
  if (text.length > MAX_LENGTH) return false;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim() !== '');
  if (sentences.length > MAX_SENTENCES) return false;
  if (!agreesWithStatus(text, input.isAvailable)) return false;
  if (!usesOnlySuppliedFacts(text, input)) return false;
  return true;
}

/**
 * Validate input, call the adapter with a timeout, validate the output
 * (non-empty, at most 2 sentences, at most 300 characters, must not contradict
 * isAvailable), and return a deterministic fallback message on any error.
 */
export async function explainAvailability(
  input: unknown,
  adapter: ExplainAdapter,
  timeoutMs: number
): Promise<ExplainResult> {
  if (!validateInput(input)) {
    const isAv =
      typeof (input as { isAvailable?: unknown })?.isAvailable === 'boolean'
        ? (input as { isAvailable: boolean }).isAvailable
        : false;
    return { explanation: fallback(isAv), source: 'fallback', error: 'invalid input' };
  }

  let output: ExplainOutput;
  try {
    output = await Promise.race([
      adapter.explain(input),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('adapter timeout')), timeoutMs)
      ),
    ]);
  } catch (e) {
    return {
      explanation: fallback(input.isAvailable),
      source: 'fallback',
      error: e instanceof Error ? e.message : 'adapter error',
    };
  }

  if (!validateOutput(output, input)) {
    return { explanation: fallback(input.isAvailable), source: 'fallback', error: 'invalid output' };
  }

  return { explanation: output.explanation, source: 'adapter' };
}

/** Derive a single ReasonCode from the deterministic ValidationResult. */
export function resultToReasonCode(result: ValidationResult): ReasonCode {
  if (result.decision === 'available') return 'AVAILABLE';
  const reason = result.reasons[0] ?? '';
  const t = reason.toLowerCase();
  if (
    t.includes('valid numbers') ||
    t.includes('within a single day') ||
    t.includes('earlier than end time')
  ) {
    return 'INVALID_INTERVAL';
  }
  if (t.includes('strictly after the current time')) return 'PAST_TIME';
  if (t.includes('cannot exceed') || t.includes('duration')) return 'TOO_LONG';
  if (t.includes('blocked')) return 'BLOCKED';
  if (t.includes('overlaps')) return 'OVERLAP';
  return 'INVALID_INTERVAL';
}
