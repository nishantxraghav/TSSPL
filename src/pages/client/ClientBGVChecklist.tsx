import React from 'react';
import { CheckSquare } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/utils';

export function ClientBGVChecklist() {
  const { bgvChecklist } = useApp();

  return (
    <div className="p-6">
      <TopBar title="BGV Checklist" breadcrumb={['Client', 'BGV Checklist']} />

      <div className="mt-6 bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-syne font-bold text-slate-800">Active BGV Verification Checks</h3>
          <span className="text-xs text-slate-400 font-jakarta bg-slate-100 px-2 py-1 rounded-full">
            {bgvChecklist.length} items
          </span>
        </div>

        {bgvChecklist.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No checklist items yet"
            description="BGV checklist items will appear here once the admin creates them. These items will be used in the employee submission form."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {bgvChecklist.map((item, i) => (
              <div key={item.id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-jakarta font-semibold text-slate-800 text-sm">{item.title}</h4>
                  {item.description && (
                    <p className="text-slate-500 text-xs font-jakarta mt-1">{item.description}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-jakarta shrink-0">
                  Added {formatDate(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
