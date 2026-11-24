import { describe, expect, it } from 'vitest';
import { checkAvailability } from '@/booking';
import { sampleRooms } from '@/sampleData';
import { buildRoomCriteria, collectEquipment, filterRooms } from '@/utils/roomFilters';

const CURRENT_TIME = 540;

function roomById(id: string) {
  const room = sampleRooms.find((r) => r.id === id);
  if (!room) throw new Error(`Missing sample room ${id}`);
  return room;
}

function idsFor(attendees: string, equipment: string[]) {
  return filterRooms(sampleRooms, buildRoomCriteria(attendees, equipment)).map((r) => r.id);
}

describe('room filtering rules', () => {
  it('F1 keeps a room whose capacity exactly matches the attendee count', () => {
    expect(idsFor('30', [])).toEqual(['r1', 'r3', 'r4']);
  });

  it('F1 excludes rooms with insufficient capacity', () => {
    expect(idsFor('31', [])).toEqual(['r1', 'r3']);
  });

  it('F2 requires every selected equipment item', () => {
    expect(idsFor('', ['Projector', 'Smart TV'])).toEqual(['r3']);
  });

  it('F2 keeps all rooms when no equipment is selected', () => {
    expect(idsFor('', [])).toEqual(sampleRooms.map((r) => r.id));
  });

  it('F3 reports a blocked room as unavailable even when the requested time is free', () => {
    const result = checkAvailability(roomById('r2'), 600, 660, CURRENT_TIME, []);
    expect(result.decision).toBe('unavailable');
    expect(result.reasons).toContain(
      'This room is currently marked as blocked and cannot be booked.'
    );
  });

  it('F4 returns an empty result when no room satisfies the criteria', () => {
    expect(idsFor('61', [])).toEqual([]);
  });

  it('F5 checks availability against the selected room bookings only', () => {
    const tech = roomById('r3');
    const allen = roomById('r1');

    expect(checkAvailability(tech, 600, 660, CURRENT_TIME, tech.bookings).decision).toBe(
      'available'
    );

    const allenResult = checkAvailability(allen, 600, 660, CURRENT_TIME, allen.bookings);
    expect(allenResult.decision).toBe('unavailable');
    expect(allenResult.reasons[0]).toContain('CS101 Lecture');
  });

  it('F5 uses the new room bookings when switching back to the other room', () => {
    const tech = roomById('r3');
    const allen = roomById('r1');

    expect(checkAvailability(tech, 780, 840, CURRENT_TIME, tech.bookings).decision).toBe(
      'unavailable'
    );
    expect(checkAvailability(allen, 780, 840, CURRENT_TIME, allen.bookings).decision).toBe(
      'available'
    );
  });

  it('buildRoomCriteria treats blank, zero and non-numeric attendee input as no capacity filter', () => {
    expect(buildRoomCriteria('', []).minCapacity).toBeNull();
    expect(buildRoomCriteria('0', []).minCapacity).toBeNull();
    expect(buildRoomCriteria('abc', []).minCapacity).toBeNull();
    expect(buildRoomCriteria('12', []).minCapacity).toBe(12);
  });

  it('collectEquipment lists each equipment item once, sorted', () => {
    expect(collectEquipment(sampleRooms)).toEqual([
      'Computer',
      'Projector',
      'Smart TV',
      'Whiteboard',
    ]);
  });
});
