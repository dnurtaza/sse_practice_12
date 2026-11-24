import { sampleRooms } from '@/sampleData';
import type { Room } from '@/types';

/** One fictional campus room, reused unchanged from the Practice #11 fixtures (r1). */
export const CONTRACT_ROOM: Room = sampleRooms.find((r) => r.id === 'r1')!;

/**
 * Fixed reference "current time" (09:00) so that the code-based and low-code
 * solutions can be tested with identical, reproducible inputs.
 */
export const CONTRACT_NOW_MINUTES = 9 * 60;
