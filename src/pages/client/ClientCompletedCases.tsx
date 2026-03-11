import React, { useState } from 'react';
import { FileText, Search, Download, Eye, X } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { formatDateTime } from '@/lib/utils';
import { BGVCase } from '@/types';

function DocumentPreviewModal({ bgvCase, onClose }: { bgvCase: BGVCase; onClose: () => void }) {
  const { bgvChecklist } = useApp();

  const resolvedCase = React.useMemo(() => {
    try {
      const docDataRaw = localStorage.getItem(`bgv_case_docs_${bgvCase.id}`);
      if (docDataRaw) {
        const docData = JSON.parse(docDataRaw);
        return {
          ...bgvCase,
          documents: (docData.documents && docData.documents.length > 0) ? docData.documents : bgvCase.documents,
          bgvFormFile: docData.bgvFormFile || bgvCase.bgvFormFile,
          cifFormFile: docData.cifFormFile || bgvCase.cifFormFile,
        };
      }
    } catch { /* ignore */ }
    return bgvCase;
  }, [bgvCase]);

  const downloadDocument = (doc: any) => {
    if (!doc.data) {
      alert(`File "${doc.name}" data is not available for download in this session.`);
      return;
    }
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  const resolvedBgvChecks = (resolvedCase.bgvChecks || []).map(check => {
    if (isUUID(check)) {
      const found = bgvChecklist.find(item => item.id === check);
      return found ? found.title : check;
    }
    return check;
  });

  const hasAnyDocs =
    (resolvedCase.documents && resolvedCase.documents.length > 0) ||
    resolvedCase.bgvFormFile ||
    resolvedCase.cifFormFile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-syne font-bold text-slate-900 text-lg">Submitted Documents</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Employee Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-[#2563EB]/15 flex items-center justify-center">
              <span className="text-[#2563EB] font-bold text-sm">{resolvedCase.employeeName[0]}</span>
            </div>
            <div>
              <div className="font-syne font-bold text-slate-800 text-sm">{resolvedCase.employeeName}</div>
              <div className="text-slate-500 text-xs font-jakarta">{resolvedCase.employeeCode} · {resolvedCase.employeeEmail}</div>
            </div>
          </div>

          {/* Submission Time */}
          <div className="text-xs font-jakarta text-slate-500">
            Submitted: <span className="font-medium text-slate-700">{formatDateTime(resolvedCase.uploadTimestamp)}</span>
          </div>

          {/* BGV Checks */}
          {resolvedBgvChecks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-600 font-jakarta mb-2">BGV Checks Selected:</p>
              <div className="flex flex-wrap gap-1.5">
                {resolvedBgvChecks.map(check => (
                  <span key={check} className="px-2.5 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-jakarta">{check}</span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div>
            <p className="text-xs font-medium text-slate-600 font-jakarta mb-2">Uploaded Documents:</p>
            {resolvedCase.documents && resolvedCase.documents.length > 0 ? (
              <div className="space-y-1.5">
                {resolvedCase.documents.map((doc: any, i: number) => {
                  const docObj = typeof doc === 'string' ? { name: doc, data: '', type: '' } : doc;
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-jakarta text-slate-700 flex-1 truncate">{docObj.name}</span>
                      {docObj.data ? (
                        <button onClick={() => downloadDocument(docObj)} className="text-[#2563EB] hover:text-[#1d4ed8] transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 font-jakarta">unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-sm font-jakarta text-center py-3">No general documents uploaded</p>
            )}
          </div>

          {/* Form Files */}
          {(resolvedCase.bgvFormFile || resolvedCase.cifFormFile) && (
            <div>
              <p className="text-xs font-medium text-slate-600 font-jakarta mb-2">Form Uploads:</p>
              <div className="space-y-1.5">
                {resolvedCase.bgvFormFile && (() => {
                  const f = typeof resolvedCase.bgvFormFile === 'string' ? { name: resolvedCase.bgvFormFile, data: '', type: '' } : resolvedCase.bgvFormFile;
                  return (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-jakarta text-blue-700 flex-1 truncate">BGV Form: {f?.name}</span>
                      {f?.data && (
                        <button onClick={() => downloadDocument(f)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })()}
                {resolvedCase.cifFormFile && (() => {
                  const f = typeof resolvedCase.cifFormFile === 'string' ? { name: resolvedCase.cifFormFile, data: '', type: '' } : resolvedCase.cifFormFile;
                  return (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-purple-50 border border-purple-200">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-jakarta text-purple-700 flex-1 truncate">CIF Form: {f?.name}</span>
                      {f?.data && (
                        <button onClick={() => downloadDocument(f)} className="text-purple-600 hover:text-purple-800 transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {!hasAnyDocs && (
            <p className="text-slate-400 text-sm font-jakarta text-center py-4">No documents available for this case.</p>
          )}

          <button onClick={onClose} className="w-full mt-2 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-jakarta font-medium hover:bg-slate-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

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

export function ClientCompletedCases() {
  const { authUser, cases } = useApp();
  const clientUser = authUser?.role === 'client' ? authUser : null;
  const [search, setSearch] = useState('');
  const [viewDocsCase, setViewDocsCase] = useState<BGVCase | null>(null);

  const completedCases = cases.filter(c =>
    c.companyId === clientUser?.id &&
    c.status !== 'WIP' && (
      c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      c.employeeCode.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <TopBar title="Completed Cases" breadcrumb={['Client', 'Completed Cases']} />

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
          <span className="text-xs text-slate-400 font-jakarta bg-slate-100 px-2 py-1 rounded-full">{completedCases.length} completed</span>
        </div>

        {completedCases.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No completed cases"
            description="Completed verification reports will appear here once TSSPL finalizes the cases."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {['#', 'Employee', 'Code', 'Status', 'Remarks', 'Completed', 'Report', 'Documents'].map(h => (
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
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono">{c.employeeCode}</span>
                    </td>
                    <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-3 text-sm text-slate-600 font-jakarta max-w-xs truncate">{c.remarks || '-'}</td>
                    <td className="px-6 py-3 text-xs text-slate-500 font-jakarta">
                      {c.completionTimestamp ? formatDateTime(c.completionTimestamp) : '-'}
                    </td>
                    <td className="px-6 py-3">
                      {c.reportFile ? (
                        <button
                          onClick={() => downloadReport(c.reportFile!, c.employeeName)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-jakarta bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        >
                          <Download className="w-3 h-3" />Download
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 font-jakarta">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => setViewDocsCase(c)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-jakarta font-medium bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Docs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewDocsCase && (
        <DocumentPreviewModal bgvCase={viewDocsCase} onClose={() => setViewDocsCase(null)} />
      )}
    </div>
  );
}
