import React, { useState } from 'react';
import { FileText, Search, Eye, Edit3, Trash2, X, Upload, CheckCircle, Download as DownloadIcon } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { BGVCase, CaseStatus } from '@/types';
import { toast } from 'sonner';
import { cn, formatDateTime } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { sendReportSubmittedEmails } from '@/lib/emailService';
import { createClient } from '@supabase/supabase-js';

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface StatusUpdateForm {
  status: CaseStatus;
  remarks: string;
}

function StatusUpdateModal({ bgvCase, onClose }: { bgvCase: BGVCase; onClose: () => void }) {
  const { updateCase, companies } = useApp();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StatusUpdateForm>({
    defaultValues: { status: bgvCase.status as CaseStatus, remarks: bgvCase.remarks || '' }
  });
  const [reportFileName, setReportFileName] = useState(
    bgvCase.reportFile ? 'Report uploaded' : ''
  );
  const [reportFile, setReportFile] = useState<File | null>(null);

  const handleReportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReportFileName(file.name);
    setReportFile(file);
  };

  const onSubmit = async (data: StatusUpdateForm) => {
    if (data.status === 'WIP') {
      toast.error('Please select a final status (Clear / Minor Issue / Major Issue / Interim)');
      return;
    }

    let reportFileUrl: string | undefined = bgvCase.reportFile || undefined;

    // Upload new file to Supabase Storage if one was selected
    if (reportFile) {
      const filePath = `reports/${bgvCase.id}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabaseClient.storage
        .from('reports')
        .upload(filePath, reportFile, { upsert: true, contentType: 'application/pdf' });

      if (uploadError) {
        toast.error('Failed to upload report: ' + uploadError.message);
        return;
      }

      const { data: urlData } = supabaseClient.storage
        .from('reports')
        .getPublicUrl(filePath);
      reportFileUrl = urlData.publicUrl;
    }

    await updateCase(bgvCase.id, {
      status: data.status,
      remarks: data.remarks,
      reportFile: reportFileUrl,
      completionTimestamp: new Date().toISOString(),
    });

    // Look up company email for the case
    const company = companies.find(c => c.id === bgvCase.companyId);
    const companyEmail = company?.email || '';

    // Send report emails to client, employee, and admin
    try {
      await sendReportSubmittedEmails({
        companyName: bgvCase.companyName,
        companyEmail,
        employeeName: bgvCase.employeeName,
        employeeEmail: bgvCase.employeeEmail,
        employeeCode: bgvCase.employeeCode,
        status: data.status,
        remarks: data.remarks || '',
      });
    } catch (emailErr) {
      console.error('Failed to send report emails:', emailErr);
      // Don't block the status update if email fails
    }

    toast.success('Case status updated & emails sent to client, employee & admin!');
    onClose();
  };

  const statusOptions: { value: CaseStatus; label: string; color: string }[] = [
    { value: 'Clear', label: 'Clear', color: 'text-emerald-600' },
    { value: 'MinorIssue', label: 'Minor Issue', color: 'text-amber-600' },
    { value: 'MajorIssue', label: 'Major Issue', color: 'text-rose-600' },
    { value: 'Interim', label: 'Interim', color: 'text-blue-600' },
    { value: 'WIP', label: 'Keep as WIP', color: 'text-slate-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-syne font-bold text-slate-900 text-lg">Update Case Status</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Employee Info Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2563EB]/15 flex items-center justify-center">
              <span className="text-[#2563EB] font-bold text-sm">{bgvCase.employeeName[0]}</span>
            </div>
            <div>
              <div className="font-syne font-bold text-slate-800 text-sm">{bgvCase.employeeName}</div>
              <div className="text-slate-500 text-xs font-jakarta">{bgvCase.companyName} · {bgvCase.employeeCode}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 font-jakarta mb-2">Verification Status *</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(opt => (
                <label key={opt.value} className="relative flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors has-[:checked]:border-[#2563EB] has-[:checked]:bg-[#2563EB]/5">
                  <input type="radio" value={opt.value} {...register('status', { required: true })} className="sr-only" />
                  <span className={cn('w-2 h-2 rounded-full', opt.value === 'Clear' ? 'bg-emerald-500' : opt.value === 'MinorIssue' ? 'bg-amber-500' : opt.value === 'MajorIssue' ? 'bg-rose-500' : opt.value === 'Interim' ? 'bg-blue-500' : 'bg-slate-400')} />
                  <span className={cn('text-xs font-jakarta font-medium', opt.color)}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Remarks</label>
            <textarea {...register('remarks')} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] resize-none" placeholder="Add verification remarks..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Attach Report</label>
            <label className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed cursor-pointer transition-colors text-sm font-jakarta',
              reportFileName ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-400 hover:border-[#2563EB]'
            )}>
              {reportFileName ? <CheckCircle className="w-4 h-4 shrink-0" /> : <Upload className="w-4 h-4 shrink-0" />}
              <span className="truncate text-xs">{reportFileName || 'Upload report PDF'}</span>
              <input type="file" className="hidden" accept=".pdf" onChange={handleReportFileChange} />
            </label>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-jakarta font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-jakarta font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocumentPreviewModal({ bgvCase, onClose }: { bgvCase: BGVCase; onClose: () => void }) {
  const { bgvChecklist } = useApp();

  // Always load the freshest document data directly from localStorage
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

  // Resolve BGV check values: if a value looks like a UUID (old data stored IDs), look up the title
  const isUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  const resolvedBgvChecks = (resolvedCase.bgvChecks || []).map(check => {
    if (isUUID(check)) {
      const found = bgvChecklist.find(item => item.id === check);
      return found ? found.title : check; // fallback to raw value if not found
    }
    return check;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-syne font-bold text-slate-900 text-lg">Case Details</h2>
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
              <div className="text-slate-500 text-xs font-jakarta">{resolvedCase.companyName} · {resolvedCase.employeeCode}</div>
              <div className="text-slate-400 text-xs font-jakarta">{resolvedCase.employeeEmail} · {resolvedCase.employeePhone}</div>
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
                {resolvedCase.documents.map((doc, i) => {
                  const docObj = typeof doc === 'string' ? { name: doc, data: '', type: '' } : doc;
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-jakarta text-slate-700 flex-1 truncate">{docObj.name}</span>
                      {docObj.data ? (
                        <button onClick={() => downloadDocument(docObj)} className="text-[#2563EB] hover:text-[#1d4ed8] transition-colors" title="Download">
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 font-jakarta">no data</span>
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
                          <DownloadIcon className="w-4 h-4" />
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
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <button onClick={onClose} className="w-full mt-2 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-jakarta font-medium hover:bg-slate-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

// Helper: get doc counts directly from localStorage for a case
function getCaseDocCounts(c: BGVCase) {
  try {
    const raw = localStorage.getItem(`bgv_case_docs_${c.id}`);
    if (raw) {
      const d = JSON.parse(raw);
      return {
        docCount: (d.documents || []).length,
        hasBgv: !!d.bgvFormFile,
        hasCif: !!d.cifFormFile,
      };
    }
  } catch { /* ignore */ }
  return {
    docCount: (c.documents || []).length,
    hasBgv: !!c.bgvFormFile,
    hasCif: !!c.cifFormFile,
  };
}

export function AdminWIPCases() {
  const { cases, deleteCase, bgvChecklist } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState<BGVCase | null>(null);
  const [docsCase, setDocsCase] = useState<BGVCase | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const wipCases = cases.filter(c => c.status === 'WIP' && (
    c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.employeeCode.toLowerCase().includes(search.toLowerCase())
  ));

  // Resolve BGV check values: if a value looks like a UUID (old data stored IDs), look up the title
  const isUUID = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  const resolveBgvChecks = (checks: string[]) => 
    (checks || []).map(check => {
      if (isUUID(check)) {
        const found = bgvChecklist.find(item => item.id === check);
        return found ? found.title : check;
      }
      return check;
    });

  const handleDelete = (id: string) => {
    deleteCase(id);
    toast.success('Case deleted.');
    setDeleteId(null);
  };

  return (
    <div className="p-6">
      <TopBar title="WIP Cases" breadcrumb={['Admin', 'WIP Cases']} />

      <div className="mt-6 bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cases..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
          </div>
          <span className="text-xs text-slate-400 font-jakarta bg-slate-100 px-2 py-1 rounded-full">{wipCases.length} cases</span>
        </div>

        {wipCases.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No WIP cases"
            description="No cases in progress. Cases will appear here once employees submit their documents."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {['#', 'Employee', 'Company', 'Code', 'BGV Checks', 'Docs', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wipCases.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 font-jakarta">{i + 1}</td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-800 text-sm font-jakarta">{c.employeeName}</div>
                      <div className="text-slate-400 text-xs font-jakarta">{c.employeeEmail}</div>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{c.companyName}</td>
                    <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{c.employeeCode}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.bgvChecks && c.bgvChecks.length > 0 ? (
                          <>
                            {resolveBgvChecks(c.bgvChecks).slice(0, 2).map((check, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-jakarta">{check}</span>
                            ))}
                            {c.bgvChecks.length > 2 && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-jakarta">+{c.bgvChecks.length - 2}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-300 font-jakarta">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        {(() => {
                          const { docCount, hasBgv, hasCif } = getCaseDocCounts(c);
                          return (
                            <>
                              {docCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-jakarta">{docCount} files</span>
                              )}
                              {hasBgv && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-jakarta">BGV</span>
                              )}
                              {hasCif && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-jakarta">CIF</span>
                              )}
                              {!docCount && !hasBgv && !hasCif && (
                                <span className="text-xs text-slate-300 font-jakarta">None</span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500 font-jakarta">
                      {formatDateTime(c.uploadTimestamp)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setDocsCase(c)} className="flex items-center gap-1 px-2 py-1 rounded text-xs font-jakarta bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                          <Eye className="w-3 h-3" />Docs
                        </button>
                        <button onClick={() => setSelectedCase(c)} className="flex items-center gap-1 px-2 py-1 rounded text-xs font-jakarta bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] transition-colors">
                          <Edit3 className="w-3 h-3" />Status
                        </button>
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

      {selectedCase && <StatusUpdateModal bgvCase={selectedCase} onClose={() => setSelectedCase(null)} />}
      {docsCase && <DocumentPreviewModal bgvCase={docsCase} onClose={() => setDocsCase(null)} />}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="font-syne font-bold text-slate-900 text-lg mb-2">Delete Case?</h3>
            <p className="text-slate-500 text-sm font-jakarta mb-6">This action cannot be undone. The case and all associated data will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-jakarta font-medium hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-jakarta font-semibold transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
