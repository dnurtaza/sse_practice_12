import type { Room } from '@/types';

export interface RoomCriteria {
  minCapacity: number | null;
  requiredEquipment: string[];
}

export function buildRoomCriteria(attendees: string, requiredEquipment: string[]): RoomCriteria {
  const count = parseInt(attendees, 10);
  return { minCapacity: count >= 1 ? count : null, requiredEquipment };
}

export function filterRooms(rooms: Room[], criteria: RoomCriteria): Room[] {
  return rooms.filter(
    (room) =>
      (criteria.minCapacity === null || room.capacity >= criteria.minCapacity) &&
      criteria.requiredEquipment.every((item) => room.equipment.includes(item))
  );
}

export function collectEquipment(rooms: Room[]): string[] {
  return [...new Set(rooms.flatMap((room) => room.equipment))].sort();
}
