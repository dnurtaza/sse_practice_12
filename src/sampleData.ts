import type { Room } from './types';

export const sampleRooms: Room[] = [
  {
    id: 'r1',
    name: 'Allen Hall 101',
    building: 'Allen Hall',
    capacity: 40,
    blocked: false,
    equipment: ['Projector', 'Computer', 'Whiteboard'],
    bookings: [
      { id: 'b1', roomId: 'r1', start: 600, end: 660, bookedBy: 'Prof. Chen', purpose: 'CS101 Lecture' },
    ],
  },
  {
    id: 'r2',
    name: 'Allen Hall 204',
    building: 'Allen Hall',
    capacity: 25,
    blocked: true,
    equipment: ['Smart TV', 'Whiteboard'],
    bookings: [],
  },
  {
    id: 'r3',
    name: 'Tech Center A',
    building: 'Tech Center',
    capacity: 60,
    blocked: false,
    equipment: ['Projector', 'Computer', 'Whiteboard', 'Smart TV'],
    bookings: [
      { id: 'b2', roomId: 'r3', start: 780, end: 840, bookedBy: 'Dr. Patel', purpose: 'Robotics Club Meeting' },
    ],
  },
  {
    id: 'r4',
    name: 'Tech Center B',
    building: 'Tech Center',
    capacity: 30,
    blocked: false,
    equipment: ['Computer', 'Smart TV'],
    bookings: [],
  },
  {
    id: 'r5',
    name: 'Library Study Rm 3',
    building: 'Main Library',
    capacity: 12,
    blocked: false,
    equipment: ['Whiteboard', 'Smart TV'],
    bookings: [
      { id: 'b3', roomId: 'r5', start: 900, end: 960, bookedBy: 'Maya Lopez', purpose: 'Group Project Review' },
    ],
  },
  {
    id: 'r6',
    name: 'Library Study Rm 7',
    building: 'Main Library',
    capacity: 8,
    blocked: true,
    equipment: ['Whiteboard'],
    bookings: [],
  },
];
