import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Users, Copy, Check, ExternalLink, Plus, X, Upload, Download, FileText } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { BGVCase } from '@/types';
import { formatDateTime } from '@/lib/utils';

const BASE_URL = 'https://sv.tsspl.org';

interface AddEmployeeForm {
  name: string;
  email: string;
  phone: string;
  employeeCode: string;
  costCentre: string;
  entity: string;
  documents: File[];
  cifFile: File | null;
  bgvChecks: string[];
}

const emptyForm: AddEmployeeForm = { name: '', email: '', phone: '', employeeCode: '', costCentre: '', entity: '', documents: [], cifFile: null, bgvChecks: [] };

export function ClientEmployees() {
  const { authUser, cases, addCase, bgvChecklist } = useApp();
  const clientUser = authUser?.role === 'client' ? authUser : null;
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AddEmployeeForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<AddEmployeeForm>>({});
  const [submitting, setSubmitting] = useState(false);

  const submissionUrl = `${BASE_URL}/employee-submit/${clientUser?.id}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(submissionUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCIF = () => {
    // Download the actual CIF form file from public folder
    const a = document.createElement('a');
    a.href = '/CIF-Form.doc';
    a.download = 'CIF_Form_TSSPL.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('CIF Form downloaded!');
  };

  // Build employee list from cases
  const myCases = cases.filter(c => c.companyId === clientUser?.id);
  const employeeMap = new Map<string, typeof myCases[0]>();
  myCases.forEach(c => {
    if (!employeeMap.has(c.employeeCode)) employeeMap.set(c.employeeCode, c);
  });
  const employees = Array.from(employeeMap.values());

  const validate = (): boolean => {
    const errs: Partial<AddEmployeeForm> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.employeeCode.trim()) errs.employeeCode = 'Employee code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Helper to convert a File to base64 data URL
  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !clientUser) return;
    setSubmitting(true);

    const now = new Date().toISOString();
    // Convert checklist IDs to human-readable titles
    const selectedCheckTitles = bgvChecklist
      .filter(item => form.bgvChecks.includes(item.id))
      .map(item => item.title);
    const bgvChecksToStore = selectedCheckTitles.length > 0 ? selectedCheckTitles : form.bgvChecks;

    const caseId = uuidv4();

    const newCase: BGVCase = {
      id: caseId,
      companyId: clientUser.id,
      companyName: clientUser.companyName,
      employeeName: form.name.trim(),
      employeeEmail: form.email.trim(),
      employeePhone: form.phone.trim(),
      employeeCode: form.employeeCode.trim(),
      costCentre: form.costCentre.trim(),
      entity: form.entity.trim(),
      status: 'WIP',
      bgvChecks: bgvChecksToStore,
      uploadTimestamp: now,
      createdAt: now,
    };

    const result = await addCase(newCase);

    if (result.success) {
      // Save uploaded documents to localStorage so the admin's DocumentPreviewModal can display them
      try {
        const docsData: { name: string; data: string; type: string }[] = [];
        for (const file of form.documents) {
          const data = await fileToDataUrl(file);
          docsData.push({ name: file.name, data, type: file.type });
        }

        let cifFileData: { name: string; data: string; type: string } | null = null;
        if (form.cifFile) {
          const data = await fileToDataUrl(form.cifFile);
          cifFileData = { name: form.cifFile.name, data, type: form.cifFile.type };
        }

        localStorage.setItem(`bgv_case_docs_${caseId}`, JSON.stringify({
          documents: docsData,
          bgvFormFile: null,
          cifFormFile: cifFileData,
        }));
      } catch (err) {
        console.error('Failed to save documents to local storage:', err);
      }

      toast.success(`Employee "${form.name}" added successfully!`);
      setForm(emptyForm);
      setErrors({});
      setShowModal(false);
    } else {
      toast.error(result.error || 'Failed to add employee. Please try again.');
    }

    setSubmitting(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setErrors({});
  };

  return (
    <div className="p-6">
      <TopBar title="Employees" breadcrumb={['Client', 'Employees']} />

      <div className="mt-6 space-y-5">
        {/* Submission Link Banner */}
        <div className="bg-[#0F1C2E] rounded-xl p-5 border border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-[#60A5FA]" />
                <span className="text-[#60A5FA] text-sm font-syne font-bold">Employee Submission Link</span>
              </div>
              <p className="text-slate-400 text-xs font-jakarta mb-3">
                Share this unique link with candidates. They can submit their documents and information directly through this page.
              </p>
              <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2.5 border border-white/10">
                <code className="text-[#60A5FA] text-xs font-mono flex-1 truncate">{submissionUrl}</code>
                <button
                  onClick={copyUrl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-jakarta font-semibold transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CIF Form Download Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-syne font-bold text-slate-800 text-sm">CIF Form (Candidate Information Form)</h3>
                <p className="text-slate-500 text-xs font-jakarta mt-0.5">
                  Download the blank CIF form to share with candidates before they submit their BGV.
                </p>
              </div>
            </div>
            <button
              onClick={downloadCIF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-jakarta font-semibold transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              Download CIF Form
            </button>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-syne font-bold text-slate-800">Submitted Employees</h3>
              <span className="text-xs text-slate-400 font-jakarta bg-slate-100 px-2 py-1 rounded-full">{employees.length} employees</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-jakarta font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          </div>

          {employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No employees yet"
              description="Share the submission link above with candidates, or add an employee manually using the button above."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    {['#', 'Name', 'Email', 'Phone', 'Emp Code', 'BGV Checks', 'Submitted'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp, i) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-slate-400 font-jakarta">{i + 1}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                            <span className="text-[#2563EB] text-xs font-bold">{emp.employeeName[0]}</span>
                          </div>
                          <span className="font-medium text-slate-800 text-sm font-jakarta">{emp.employeeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{emp.employeeEmail}</td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{emp.employeePhone}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono">{emp.employeeCode}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(emp.bgvChecks || []).slice(0, 3).map(check => (
                            <span key={check} className="px-2 py-0.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-jakarta">{check}</span>
                          ))}
                          {(emp.bgvChecks || []).length > 3 && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-jakarta">+{emp.bgvChecks.length - 3}</span>
                          )}
                          {(!emp.bgvChecks || emp.bgvChecks.length === 0) && (
                            <span className="text-xs text-slate-400 font-jakarta">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500 font-jakarta">
                        {formatDateTime(emp.uploadTimestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="font-syne font-bold text-lg text-slate-900">Add Employee</h2>
                <p className="text-slate-500 text-xs font-jakarta mt-0.5">Manually register an employee for BGV</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-jakarta mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ravi Kumar"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm font-jakarta outline-none transition-colors ${errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-[#2563EB]'}`}
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-jakarta mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. ravi@example.com"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm font-jakarta outline-none transition-colors ${errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-[#2563EB]'}`}
                />
                {errors.email && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-jakarta mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm font-jakarta outline-none transition-colors ${errors.phone ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-[#2563EB]'}`}
                />
                {errors.phone && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-jakarta mb-1.5">
                  Employee Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.employeeCode}
                  onChange={e => setForm(f => ({ ...f, employeeCode: e.target.value }))}
                  placeholder="e.g. EMP-0042"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm font-jakarta outline-none transition-colors ${errors.employeeCode ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-[#2563EB]'}`}
                />
                {errors.employeeCode && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.employeeCode}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-jakarta mb-1.5">
                  Cost Centre
                </label>
                <input
                  type="text"
                  value={form.costCentre}
                  onChange={e => setForm(f => ({ ...f, costCentre: e.target.value }))}
                  placeholder="e.g. CC001"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-jakarta mb-1.5">
                  Entity
                </label>
                <input
                  type="text"
                  value={form.entity}
                  onChange={e => setForm(f => ({ ...f, entity: e.target.value }))}
                  placeholder="e.g. Entity Name"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>

              {/* BGV Checklist */}
              {bgvChecklist.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-jakarta mb-2">
                    BGV Checks
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 max-h-44 overflow-y-auto">
                    {bgvChecklist.map(item => {
                      const checked = form.bgvChecks.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className="flex items-start gap-2.5 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setForm(f => ({
                                ...f,
                                bgvChecks: checked
                                  ? f.bgvChecks.filter(id => id !== item.id)
                                  : [...f.bgvChecks, item.id],
                              }));
                            }}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-[#2563EB] cursor-pointer shrink-0"
                          />
                          <div>
                            <span className="text-sm font-jakarta font-medium text-slate-800 group-hover:text-[#2563EB] transition-colors">
                              {item.title}
                            </span>
                            {item.description && (
                              <p className="text-xs text-slate-500 font-jakarta mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Documents Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-jakarta mb-1.5">
                  Upload Documents
                </label>
                <label className="block w-full px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#2563EB] transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600 font-jakarta font-medium">
                      {form.documents.length > 0 ? `${form.documents.length} file(s) selected` : 'Click to upload documents'}
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={e => setForm(f => ({ ...f, documents: e.target.files ? Array.from(e.target.files) : [] }))}
                    className="hidden"
                  />
                </label>
                {form.documents.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {form.documents.map((doc, i) => (
                      <div key={i} className="text-xs text-slate-600 font-jakarta px-2 py-1 bg-slate-50 rounded flex items-center justify-between">
                        <span className="truncate">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CIF Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-jakarta mb-1.5">
                  Upload CIF Form
                </label>
                <label className="block w-full px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#2563EB] transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600 font-jakarta font-medium">
                      {form.cifFile ? form.cifFile.name : 'Click to upload CIF form'}
                    </span>
                  </div>
                  <input
                    type="file"
                    onChange={e => setForm(f => ({ ...f, cifFile: e.target.files?.[0] || null }))}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-jakarta font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-jakarta font-semibold transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
