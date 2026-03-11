import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Download, Upload, CheckSquare, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BGVCase, SubmittedDocument } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { sendDocumentSubmittedEmails } from '@/lib/emailService';
import { Toaster } from 'sonner';
const logoImage = '/images/transparent black Logo.png';

interface EmployeeForm {
  employeeName: string;
  employeeEmail: string;
  employeePhone: string;
  employeeCode: string;
  costCentre: string;
  entity: string;
}

type StoredDocument = SubmittedDocument;

export function EmployeeSubmit() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { companies, bgvChecklist, addCase, loading } = useApp();

  const company = companies.find(c => c.id === companyId);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmployeeForm>();
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [bgvFile, setBgvFile] = useState<StoredDocument | null>(null);
  const [cifFile, setCifFile] = useState<StoredDocument | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isSubmittingRef = React.useRef(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F6FA' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F6FA' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="font-syne font-bold text-slate-800 text-2xl mb-2">Invalid Link</h1>
          <p className="text-slate-500 font-jakarta">This submission link is not valid or has expired.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F6FA' }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="font-syne font-bold text-slate-800 text-2xl mb-3">Submission Successful!</h1>
          <p className="text-slate-500 font-jakarta mb-2">
            Your documents have been submitted to <strong>{company.name}</strong> for verification.
          </p>
          <p className="text-slate-400 text-sm font-jakarta">
            You will receive an email notification once the verification is complete.
          </p>
        </div>
      </div>
    );
  }

  const toggleCheck = (id: string) => {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setDocuments(prev => [...prev, {
          name: file.name,
          data: base64,
          type: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDocument = (name: string) => {
    setDocuments(prev => prev.filter(d => d.name !== name));
  };

  const handleBgvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgvFile({ name: file.name, data: event.target?.result as string, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCifUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCifFile({ name: file.name, data: event.target?.result as string, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EmployeeForm) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      const selectedChecks = bgvChecklist
        .filter(item => checkedItems.includes(item.id))
        .map(item => item.title);
      
      // Fallback: if checklist lookup failed but items were checked, store the IDs
      // This can happen if checklist data isn't available in this browser session
      const bgvChecksToStore = selectedChecks.length > 0 ? selectedChecks : checkedItems;

      const newCase: BGVCase = {
        id: crypto.randomUUID(),
        companyId: company.id,
        companyName: company.name,
        employeeName: data.employeeName,
        employeeEmail: data.employeeEmail,
        employeePhone: data.employeePhone,
        employeeCode: data.employeeCode,
        costCentre: data.costCentre,
        entity: data.entity,
        status: 'WIP',
        bgvChecks: bgvChecksToStore,
        documents: documents,
        bgvFormFile: bgvFile || undefined,
        cifFormFile: cifFile || undefined,
        uploadTimestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const result = await addCase(newCase);
      if (!result.success) {
        toast.error(result.error || 'Failed to submit. Please try again.');
        return;
      }

      // Persist documents to localStorage so admin's DocumentPreviewModal can display them
      try {
        localStorage.setItem(`bgv_case_docs_${newCase.id}`, JSON.stringify({
          documents: documents,
          bgvFormFile: bgvFile || null,
          cifFormFile: cifFile || null,
        }));
      } catch (err) {
        console.error('Failed to save documents to localStorage:', err);
      }

      // Send email notifications to client and admin
      try {
        await sendDocumentSubmittedEmails({
          companyName: company.name,
          companyEmail: company.email,
          employeeName: data.employeeName,
          employeeCode: data.employeeCode,
          employeeEmail: data.employeeEmail,
          bgvChecks: bgvChecksToStore,
        });
      } catch (emailErr) {
        console.error('Failed to send document submission emails:', emailErr);
        // Don't block submission success if email fails
      }

      toast.success('Documents submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit. Please try again.');
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F6FA' }}>
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="bg-[#0F1C2E] border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-4">
          <img src={logoImage} alt="TSSPL Logo" className="w-9 h-9 object-contain" />
          <div>
            <div className="font-syne font-bold text-white text-base">TSSPL Background Verification</div>
            <div className="text-slate-400 text-xs font-jakarta">{company.name} — Employee Submission</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Download Forms */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="font-syne font-bold text-slate-800 text-sm mb-1">Step 1: Download Forms</h3>
          <p className="text-slate-500 text-xs font-jakarta mb-4">Download, fill out, and upload these forms along with your documents.</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                toast.info('BGV Form download — please contact your HR for the BGV form template.');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 hover:bg-[#2563EB]/15 transition-colors"
            >
              <Download className="w-4 h-4 text-[#2563EB]" />
              <div className="text-left">
                <div className="text-[#2563EB] text-xs font-syne font-bold">BGV Form</div>
                <div className="text-slate-400 text-[10px] font-jakarta">Background Verification Form</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                const a = document.createElement('a');
                a.href = '/CIF-Form.doc';
                a.download = 'CIF_Form_TSSPL.doc';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                toast.success('CIF Form downloaded!');
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <Download className="w-4 h-4 text-purple-600" />
              <div className="text-left">
                <div className="text-purple-700 text-xs font-syne font-bold">CIF Form</div>
                <div className="text-slate-400 text-[10px] font-jakarta">Candidate Information Form</div>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Personal Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-syne font-bold text-slate-800 text-sm mb-4">Step 2: Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Full Name *</label>
                <input
                  {...register('employeeName', { required: 'Name is required' })}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
                {errors.employeeName && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.employeeName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Employee Code *</label>
                <input
                  {...register('employeeCode', { required: 'Employee code is required' })}
                  placeholder="EMP001"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
                {errors.employeeCode && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.employeeCode.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Email Address *</label>
                <input
                  {...register('employeeEmail', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' }
                  })}
                  type="email"
                  placeholder="john@email.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
                {errors.employeeEmail && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.employeeEmail.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Phone Number *</label>
                <input
                  {...register('employeePhone', { required: 'Phone is required' })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
                {errors.employeePhone && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.employeePhone.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Cost Centre *</label>
                <input
                  {...register('costCentre', { required: 'Cost centre is required' })}
                  placeholder="CC001"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
                {errors.costCentre && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.costCentre.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Entity *</label>
                <input
                  {...register('entity', { required: 'Entity is required' })}
                  placeholder="Entity Name"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
                {errors.entity && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.entity.message}</p>}
              </div>
            </div>
          </div>

          {/* BGV Checklist */}
          {bgvChecklist.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-syne font-bold text-slate-800 text-sm mb-1">Step 3: BGV Checklist</h3>
              <p className="text-slate-500 text-xs font-jakarta mb-4">Select all verification checks that apply to you.</p>
              <div className="space-y-2">
                {bgvChecklist.map(item => (
                  <label
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                      checkedItems.includes(item.id)
                        ? 'border-[#2563EB]/40 bg-[#2563EB]/5'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                      checkedItems.includes(item.id)
                        ? 'bg-[#2563EB] border-[#2563EB]'
                        : 'border-slate-300'
                    )}>
                      {checkedItems.includes(item.id) && (
                        <CheckSquare className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-jakarta font-medium text-slate-800">{item.title}</div>
                      <div className="text-xs font-jakarta text-slate-400">{item.description}</div>
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checkedItems.includes(item.id)}
                      onChange={() => toggleCheck(item.id)}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Document Upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-syne font-bold text-slate-800 text-sm mb-4">
              {bgvChecklist.length > 0 ? 'Step 4' : 'Step 3'}: Upload Documents
            </h3>

            {/* General Documents */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-2">General Documents</label>
              <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-slate-200 cursor-pointer hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition-all">
                <Upload className="w-6 h-6 text-slate-300" />
                <div className="text-center">
                  <div className="text-sm font-jakarta font-medium text-slate-500">Click to upload documents</div>
                  <div className="text-xs font-jakarta text-slate-400">PDF, JPG, PNG — max 10MB each</div>
                </div>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocUpload} />
              </label>
              {documents.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {documents.map(doc => (
                    <div key={doc.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-xs font-jakarta text-slate-700 flex-1 truncate">{doc.name}</span>
                      <button type="button" onClick={() => removeDocument(doc.name)} className="text-slate-300 hover:text-rose-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* BGV Form Upload */}
              <div>
                <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Completed BGV Form</label>
                <label className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed cursor-pointer transition-colors text-xs font-jakarta',
                  bgvFile
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 text-slate-400 hover:border-[#2563EB]'
                )}>
                  {bgvFile ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Upload className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{bgvFile?.name || 'Upload BGV form'}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={handleBgvUpload} />
                </label>
              </div>

              {/* CIF Form Upload */}
              <div>
                <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Completed CIF Form</label>
                <label className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed cursor-pointer transition-colors text-xs font-jakarta',
                  cifFile
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 text-slate-400 hover:border-[#2563EB]'
                )}>
                  {cifFile ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Upload className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{cifFile?.name || 'Upload CIF form'}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={handleCifUpload} />
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-3.5 rounded-xl text-sm font-jakarta font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-[#2563EB]/25"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Documents for Verification'}
          </button>

          <p className="text-center text-xs text-slate-400 font-jakarta pb-4">
            Your data is handled securely by TSSPL in accordance with our privacy policy.
          </p>
        </form>
      </div>
    </div>
  );
}
