import React, { useState } from 'react';
import { Building2, Plus, Trash2, X, Upload } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { useApp } from '@/context/AppContext';
import { Company } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';
import { sendCompanyCreatedEmails } from '@/lib/emailService';

interface CompanyForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  gstNumber?: string;
  contactPerson?: string;
}

function AddCompanyModal({ onClose }: { onClose: () => void }) {
  const { addCompany } = useApp();
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyForm>();
  const [gstFileName, setGstFileName] = useState('');

  const onSubmit = async (data: CompanyForm) => {
    const company: Company = {
      id: crypto.randomUUID(),
      ...data,
      gstDocument: gstFileName || undefined,
      createdAt: new Date().toISOString(),
    };
    const result = await addCompany(company);
    if (result.success) {
      toast.success(`Company "${data.name}" created!`);
      onClose();

      // Send email notifications to client (with credentials) and admin
      try {
        await sendCompanyCreatedEmails({
          companyName: data.name,
          email: data.email,
          password: data.password,
          contactPerson: data.contactPerson,
          phone: data.phone,
          address: data.address,
        });
        toast.success('Credential emails sent to client & admin!');
      } catch (emailErr) {
        console.error('Failed to send company creation emails:', emailErr);
        toast.error('Company created but email notifications failed.');
      }
    } else {
      toast.error(result.error || 'Failed to create company.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-syne font-bold text-slate-900 text-lg">Add New Company</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Company Name *</label>
              <input {...register('name', { required: 'Required' })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" placeholder="Acme Corp" />
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Contact Person</label>
              <input {...register('contactPerson')} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Email Address *</label>
            <input {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" placeholder="hr@company.com" />
            {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Password *</label>
              <input {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} type="password" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" placeholder="••••••••" />
              {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Phone *</label>
              <input {...register('phone', { required: 'Required' })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" placeholder="+91 98765 43210" />
              {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Address *</label>
            <input {...register('address', { required: 'Required' })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" placeholder="123 Business Park, Mumbai" />
            {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">GST Number</label>
              <input {...register('gstNumber')} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" placeholder="22ABCDE1234F1Z5" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">GST Document</label>
              <label className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed cursor-pointer hover:border-[#2563EB] transition-colors text-xs font-jakarta',
                gstFileName ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-400'
              )}>
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{gstFileName || 'Upload file'}</span>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setGstFileName(e.target.files?.[0]?.name || '')} />
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-jakarta font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-jakarta font-semibold">Create Company</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminCompanies() {
  const { companies, deleteCompany, cases } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteCompany(id);
    toast.success('Company deleted.');
    setDeleteId(null);
  };

  return (
    <div className="p-6">
      <TopBar title="Companies" breadcrumb={['Admin', 'Companies']} />

      <div className="mt-6 bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-syne font-bold text-slate-800">All Companies</h3>
            <p className="text-slate-400 text-xs font-jakarta mt-0.5">Manage client company accounts</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-2.5 rounded-lg text-sm font-jakarta font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        {companies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No companies yet"
            description="Create client company accounts to get started with the BGV process."
            action={
              <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-jakarta font-semibold">
                <Plus className="w-4 h-4" />Add First Company
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {['#', 'Company', 'Contact', 'Email', 'Phone', 'Cases', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((company, i) => {
                  const companyCases = cases.filter(c => c.companyId === company.id);
                  return (
                    <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-slate-400 font-jakarta">{i + 1}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                            <span className="text-[#2563EB] text-xs font-bold">{company.name[0]}</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-800 text-sm font-jakarta">{company.name}</div>
                            {company.gstNumber && <div className="text-slate-400 text-xs font-jakarta">GST: {company.gstNumber}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{company.contactPerson || '-'}</td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{company.email}</td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{company.phone}</td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{companyCases.length}</td>
                      <td className="px-6 py-3 text-xs text-slate-500 font-jakarta">{formatDate(company.createdAt)}</td>
                      <td className="px-6 py-3">
                        <button onClick={() => setDeleteId(company.id)} className="flex items-center gap-1 px-2 py-1 rounded text-xs font-jakarta bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <AddCompanyModal onClose={() => setShowModal(false)} />}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="font-syne font-bold text-slate-900 text-lg mb-2">Delete Company?</h3>
            <p className="text-slate-500 text-sm font-jakarta mb-6">This will permanently delete the company account. This action cannot be undone.</p>
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
