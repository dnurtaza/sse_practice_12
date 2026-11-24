import { Sparkles, AlertTriangle } from 'lucide-react';
import type { ExplainResult } from '@/types';

interface ExplanationPanelProps {
  result: ExplainResult | null;
  loading: boolean;
}

export function ExplanationPanel({ result, loading }: ExplanationPanelProps) {
  if (loading && !result) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span>Generating explanation…</span>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div
      className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4"
      aria-live="polite"
    >
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
            AI-generated explanation (mock) — not a booking confirmation
          </p>
          <p className="mt-1.5 text-sm text-amber-900">{result.explanation}</p>
          {result.source === 'fallback' && (
            <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              A fallback message was used because the explanation service was unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
