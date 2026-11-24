import type { Room } from '@/types';
import { Users, Lock, CheckCircle2, MapPin, Search } from 'lucide-react';

interface RoomPickerProps {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RoomPicker({ rooms, selectedId, onSelect }: RoomPickerProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <Search className="h-8 w-8 text-slate-400" />
        <p className="text-sm font-semibold text-slate-700">No rooms match your filters</p>
        <p className="text-xs text-slate-500">
          Try a smaller attendee count or fewer required equipment items.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {rooms.map((room) => {
        const isSelected = room.id === selectedId;
        return (
          <button
            key={room.id}
            onClick={() => onSelect(room.id)}
            disabled={room.blocked}
            className={[
              'relative text-left rounded-xl border p-4 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-sky-400',
              room.blocked
                ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-75'
                : isSelected
                  ? 'border-sky-500 bg-sky-50 shadow-md ring-1 ring-sky-300'
                  : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm',
            ].join(' ')}
            aria-pressed={isSelected}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm leading-snug truncate">
                  {room.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{room.building}</span>
                </p>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-sky-600" />
              )}
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <Users className="h-3.5 w-3.5" />
                {room.capacity} seats
              </span>
              {room.blocked && (
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <Lock className="h-3.5 w-3.5" />
                  Blocked
                </span>
              )}
            </div>
            <p className="mt-2 truncate text-[11px] text-slate-500">
              {room.equipment.join(' · ')}
            </p>
          </button>
        );
      })}
    </div>
  );
}
