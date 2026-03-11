import React, { useState } from 'react';
import { FileText, Search, Download, Trash2 } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/utils';

function downloadReport(reportFile: string, employeeName: string) {
  // Use fetch + blob to force download without navigating away
  fetch(reportFile)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch file');
      return res.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Derive filename from URL or use employee name
      const urlParts = reportFile.split('/');
      const rawName = urlParts[urlParts.length - 1].split('?')[0];
      a.download = decodeURIComponent(rawName) || `${employeeName}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(() => {
      // Fallback: open in new tab if fetch fails (e.g. CORS)
      const a = document.createElement('a');
      a.href = reportFile;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
}

export function AdminCompletedCases() {
  const { cases, deleteCase } = useApp();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const completedCases = cases.filter(c =>
    c.status !== 'WIP' && (
      c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.employeeCode.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleDelete = (id: string) => {
    deleteCase(id);
    toast.success('Case deleted.');
    setDeleteId(null);
  };

  return (
    <div className="p-6">
      <TopBar title="Completed Cases" breadcrumb={['Admin', 'Completed Cases']} />

      <div className="mt-6 bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search completed cases..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
          </div>
          <span className="text-xs text-slate-400 font-jakarta bg-slate-100 px-2 py-1 rounded-full">{completedCases.length} cases</span>
        </div>

        {completedCases.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No completed cases"
            description="Completed cases will appear here once you finalize verification statuses."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {['#', 'Employee', 'Company', 'Code', 'Status', 'Docs Submitted', 'Completed', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedCases.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 font-jakarta">{i + 1}</td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-800 text-sm font-jakarta">{c.employeeName}</div>
                      <div className="text-slate-400 text-xs font-jakarta">{c.employeeEmail}</div>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{c.companyName}</td>
                    <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{c.employeeCode}</td>
                    <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-3 text-xs text-slate-500 font-jakarta">
                      {formatDateTime(c.uploadTimestamp)}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500 font-jakarta">
                      {c.completionTimestamp ? formatDateTime(c.completionTimestamp) : '-'}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5">
                        {c.reportFile ? (
                          <button
                            onClick={() => downloadReport(c.reportFile!, c.employeeName)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-jakarta bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          >
                            <Download className="w-3 h-3" />Report
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 font-jakarta">No report</span>
                        )}
                        <button onClick={() => setDeleteId(c.id)} className="flex items-center gap-1 px-2 py-1 rounded text-xs font-jakarta bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="font-syne font-bold text-slate-900 text-lg mb-2">Delete Case?</h3>
            <p className="text-slate-500 text-sm font-jakarta mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-jakarta font-medium hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-jakarta font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
