export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
  equipment: string[];
  bookings: Booking[];
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from 00:00 (0–1440)
  end: number; // minutes from 00:00 (0–1440)
  bookedBy: string;
  purpose: string;
}

export type Decision = 'available' | 'unavailable';

export interface ValidationResult {
  decision: Decision;
  reasons: string[];
}

export type ReasonCode =
  | 'AVAILABLE'
  | 'OVERLAP'
  | 'BLOCKED'
  | 'INVALID_INTERVAL'
  | 'PAST_TIME'
  | 'TOO_LONG';

/** Structured, non-personal input for the mock explanation feature. */
export interface ExplainInput {
  roomLabel: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  isAvailable: boolean;
  reasonCode: ReasonCode;
}

export interface ExplainOutput {
  explanation: string;
}

export interface ExplainAdapter {
  explain(input: ExplainInput): Promise<ExplainOutput>;
}

export type ExplainSource = 'adapter' | 'fallback';

export interface ExplainResult {
  explanation: string;
  source: ExplainSource;
  error?: string;
}
