import { checkAvailability } from '@/booking';
import { resultToReasonCode } from '@/explain/explainAvailability';
import type { Booking, Room } from '@/types';
import { minutesToTimeString } from '@/utils/time';
import type { ContractReasonCode, ContractRequest, ContractResult } from './types';
import { validateRequest } from './validate';

/**
 * Availability calculation for the Practice #12 contract.
 * 1. validateRequest  — input rules (AC1, AC2, AC6)
 * 2. checkAvailability — canonical Practice #11 rule engine, unchanged (AC3, AC4, AC5)
 * Pure: never mutates `room` or `bookings`.
 */
export function checkContract(
  req: ContractRequest,
  room: Room,
  nowMinutes: number,
  bookings: readonly Booking[] = room.bookings
): ContractResult {
  const v = validateRequest(req, nowMinutes);
  if (!v.ok) {
    return { available: false, reasonCode: v.reasonCode, message: v.message, validationError: true };
  }

  // Blocked flag is a contract input: evaluate a copy, never the fixture itself.
  const effectiveRoom: Room = { ...room, blocked: req.blocked };
  const result = checkAvailability(effectiveRoom, v.start, v.end, nowMinutes, [...bookings]);
  const slot = `${minutesToTimeString(v.start)}–${minutesToTimeString(v.end)}`;

  if (result.decision === 'available') {
    return {
      available: true,
      reasonCode: 'AVAILABLE',
      message: `Available: ${room.name} is free ${slot}.`,
      validationError: false,
    };
  }

  const engineCode = resultToReasonCode(result);
  const reasonCode: ContractReasonCode =
    engineCode === 'BLOCKED' || engineCode === 'OVERLAP' ? engineCode : 'OVERLAP';
  const message =
    reasonCode === 'BLOCKED'
      ? `Unavailable: ${room.name} is blocked and cannot be booked.`
      : `Unavailable: ${slot} ${result.reasons[0].charAt(0).toLowerCase()}${result.reasons[0].slice(1)}`;
  return { available: false, reasonCode, message, validationError: false };
}
