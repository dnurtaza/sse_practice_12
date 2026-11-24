import type { ValidationResult } from '@/types';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

interface DecisionPanelProps {
  result: ValidationResult | null;
}

export function DecisionPanel({ result }: DecisionPanelProps) {
  if (!result) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
        <p className="text-sm text-slate-500">
          Select a room and enter a start and end time, then press{' '}
          <span className="font-semibold text-slate-700">Check Availability</span> to see if the
          room is free.
        </p>
      </div>
    );
  }

  if (result.decision === 'available') {
    return (
      <div
        className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
        <div>
          <p className="text-base font-bold text-emerald-800">Available</p>
          <p className="mt-0.5 text-sm text-emerald-700">
            This room is free for the requested time slot. You may proceed with your booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" />
        <div className="min-w-0">
          <p className="text-base font-bold text-red-800">Unavailable</p>
          <p className="mt-0.5 text-sm text-red-700">
            This room cannot be booked for the requested time slot:
          </p>
          <ul className="mt-2 space-y-1">
            {result.reasons.map((reason, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-red-700"
              >
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-500" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
