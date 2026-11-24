import { checkContract } from './checkContract';
import { CONTRACT_NOW_MINUTES, CONTRACT_ROOM } from './fixture';
import { CONTRACT_TEST_CASES } from './testCases';

/** Runs T1–T7 through the same rule path as the UI, then checks T8 (bookings unchanged). */
export interface TestRow {
  id: string;
  title: string;
  expected: string;
  observed: string;
  pass: boolean;
}

export function runSharedTests(): TestRow[] {
  const before = JSON.stringify(CONTRACT_ROOM);
  const rows: TestRow[] = CONTRACT_TEST_CASES.map((tc) => {
    const r = checkContract(tc.request, CONTRACT_ROOM, CONTRACT_NOW_MINUTES);
    return {
      id: tc.id,
      title: `${tc.title} (${tc.request.startTime}, ${tc.request.durationMinutes} min${tc.request.blocked ? ', blocked' : ''})`,
      expected: `${tc.expectedAvailable ? 'Available' : 'Unavailable'} · ${tc.expectedCode}`,
      observed: `${r.available ? 'Available' : 'Unavailable'} · ${r.reasonCode}`,
      pass: r.available === tc.expectedAvailable && r.reasonCode === tc.expectedCode,
    };
  });
  const unchanged = JSON.stringify(CONTRACT_ROOM) === before;
  rows.push({
    id: 'T8',
    title: 'Booking data unchanged after T1–T7',
    expected: 'unchanged',
    observed: unchanged ? 'unchanged' : 'CHANGED',
    pass: unchanged,
  });
  return rows;
}

