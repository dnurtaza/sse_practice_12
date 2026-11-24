import { useState } from 'react';
import { Building2 } from 'lucide-react';
import App from '@/App';
import { ContractChecker } from '@/components/ContractChecker';

type View = 'contract' | 'full';

/** Shell: Practice #12 contract checker (default) and the Practice #11 full checker. */
export default function Root() {
  const [view, setView] = useState<View>('contract');
  const tab = (v: View, label: string) => (
    <button
      role="tab"
      aria-selected={view === v}
      onClick={() => setView(v)}
      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        view === v ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 sm:text-base">Smart Campus</span>
          </div>
          <div role="tablist" className="flex gap-1 overflow-x-auto">
            {tab('contract', '#12 Checker')}
            {tab('full', '#11 Full checker')}
          </div>
        </div>
      </nav>
      {view === 'contract' ? <ContractChecker /> : <App />}
    </div>
  );
}
