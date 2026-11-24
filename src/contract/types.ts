/**
 * Practice #12 shared contract (identical for the code-based and low-code solutions).
 *
 * Inputs : start time ("HH:MM"), duration in minutes, blocked flag, fictional bookings.
 * Outputs: availability boolean, reason code, visible message.
 */
export type ContractReasonCode =
  | 'AVAILABLE'
  | 'INVALID_START' // start time missing or not HH:MM
  | 'INVALID_DURATION' // duration missing, not a whole number, or <= 0
  | 'TOO_LONG' // duration > 120 minutes
  | 'PAST_TIME' // start not strictly after the reference time
  | 'OUT_OF_DAY' // start + duration ends after 24:00
  | 'BLOCKED'
  | 'OVERLAP';

export interface ContractRequest {
  startTime: string; // "HH:MM"
  durationMinutes: string | number; // raw form value; validated, never trusted
  blocked: boolean;
}

export interface ContractResult {
  available: boolean;
  reasonCode: ContractReasonCode;
  message: string;
  /** true when the request was rejected by input validation (AC1, AC2, AC6). */
  validationError: boolean;
}
