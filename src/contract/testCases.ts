import type { ContractReasonCode, ContractRequest } from './types';

export interface ContractTestCase {
  id: string;
  title: string;
  request: ContractRequest;
  expectedAvailable: boolean;
  expectedCode: ContractReasonCode;
}

/**
 * Common test inputs T1–T7, prepared before implementation and used unchanged
 * for both solutions. Room: Allen Hall 101, existing booking 10:00–11:00,
 * reference time 09:00. T8 (bookings unchanged) is checked after running T1–T7.
 */
export const CONTRACT_TEST_CASES: ContractTestCase[] = [
  { id: 'T1', title: 'Valid free interval', request: { startTime: '11:30', durationMinutes: 60, blocked: false }, expectedAvailable: true, expectedCode: 'AVAILABLE' },
  { id: 'T2', title: 'Overlap with existing booking', request: { startTime: '10:30', durationMinutes: 60, blocked: false }, expectedAvailable: false, expectedCode: 'OVERLAP' },
  { id: 'T3', title: 'Blocked room', request: { startTime: '11:30', durationMinutes: 60, blocked: true }, expectedAvailable: false, expectedCode: 'BLOCKED' },
  { id: 'T4', title: 'Duration = 0', request: { startTime: '11:30', durationMinutes: 0, blocked: false }, expectedAvailable: false, expectedCode: 'INVALID_DURATION' },
  { id: 'T5', title: 'Duration = 121', request: { startTime: '11:30', durationMinutes: 121, blocked: false }, expectedAvailable: false, expectedCode: 'TOO_LONG' },
  { id: 'T6', title: 'Past start time', request: { startTime: '08:00', durationMinutes: 60, blocked: false }, expectedAvailable: false, expectedCode: 'PAST_TIME' },
  { id: 'T7', title: 'Adjacent, non-overlapping', request: { startTime: '11:00', durationMinutes: 60, blocked: false }, expectedAvailable: true, expectedCode: 'AVAILABLE' },
];
