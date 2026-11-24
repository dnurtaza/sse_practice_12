import { Users, Check } from 'lucide-react';

interface RoomFiltersProps {
  attendees: string;
  onAttendeesChange: (value: string) => void;
  equipmentOptions: string[];
  selectedEquipment: string[];
  onToggleEquipment: (item: string) => void;
  onClear: () => void;
  isActive: boolean;
}

export function RoomFilters({
  attendees,
  onAttendeesChange,
  equipmentOptions,
  selectedEquipment,
  onToggleEquipment,
  onClear,
  isActive,
}: RoomFiltersProps) {
  return (
    <div className="mb-5 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">Filter rooms</p>
        {isActive && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-sky-700 transition-colors hover:text-sky-800 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <label className="block sm:max-w-xs">
        <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Users className="h-4 w-4 text-slate-400" />
          Attendees
        </span>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={attendees}
          onChange={(e) => onAttendeesChange(e.target.value)}
          placeholder="Any"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Required equipment</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Required equipment">
          {equipmentOptions.map((item) => {
            const isSelected = selectedEquipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggleEquipment(item)}
                aria-pressed={isSelected}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-sky-400',
                  isSelected
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-sky-300',
                ].join(' ')}
              >
                {isSelected && <Check className="h-3 w-3" />}
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
