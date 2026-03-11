import React, { useState } from 'react';
import { Building2, FileText, Clock, CheckCircle, AlertTriangle, Plus, X, Upload } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/shared/StatCard';
import { useApp } from '@/context/AppContext';
import { useForm } from 'react-hook-form';
import { Company } from '@/types';
import { toast } from 'sonner';
import { cn, formatDate } from '@/lib/utils';

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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CompanyForm>();
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
      toast.success(`Company "${data.name}" created successfully!`);
      onClose();
    } else {
      toast.error(result.error || 'Failed to create company.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-syne font-bold text-slate-900 text-lg">Add New Company</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
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
                'flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 cursor-pointer hover:border-[#2563EB] transition-colors text-sm font-jakarta',
                gstFileName ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'text-slate-400'
              )}>
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate text-xs">{gstFileName || 'Upload file'}</span>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setGstFileName(e.target.files?.[0]?.name || '')} />
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-jakarta font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-jakarta font-semibold transition-colors disabled:opacity-50">
              Create Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { companies, cases } = useApp();
  const [showAddCompany, setShowAddCompany] = useState(false);

  const wipCases = cases.filter(c => c.status === 'WIP');
  const completedCases = cases.filter(c => c.status !== 'WIP');
  const redFlagCases = cases.filter(c => c.status === 'MajorIssue');

  return (
    <div className="p-6">
      <TopBar title="Dashboard" breadcrumb={['Admin', 'Dashboard']} />

      <div className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-syne font-bold text-slate-800 text-xl">Overview</h2>
            <p className="text-slate-500 text-sm font-jakarta">Platform-wide statistics at a glance</p>
          </div>
          <button
            onClick={() => setShowAddCompany(true)}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-2.5 rounded-lg text-sm font-jakarta font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Companies" value={companies.length} icon={Building2} accentColor="#2563EB" bgColor="#EFF6FF" iconColor="#2563EB" delay={0.05} />
          <StatCard label="Total Cases" value={cases.length} icon={FileText} accentColor="#8B5CF6" bgColor="#F5F3FF" iconColor="#8B5CF6" delay={0.1} />
          <StatCard label="WIP Cases" value={wipCases.length} icon={Clock} accentColor="#F59E0B" bgColor="#FFFBEB" iconColor="#F59E0B" delay={0.15} />
          <StatCard label="Completed Cases" value={completedCases.length} icon={CheckCircle} accentColor="#10B981" bgColor="#ECFDF5" iconColor="#10B981" delay={0.2} />
          <StatCard label="Red Flag Cases" value={redFlagCases.length} icon={AlertTriangle} accentColor="#EF4444" bgColor="#FEF2F2" iconColor="#EF4444" delay={0.25} />
        </div>

        {/* Companies List */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-syne font-bold text-slate-800">Companies</h3>
            <span className="text-xs text-slate-400 font-jakarta bg-slate-100 px-2 py-1 rounded-full">{companies.length} total</span>
          </div>
          {companies.length === 0 ? (
            <div className="py-12 flex flex-col items-center">
              <Building2 className="w-10 h-10 text-slate-200 mb-3" />
              <p className="font-syne font-bold text-slate-600">No companies yet</p>
              <p className="text-slate-400 text-sm font-jakarta mt-1">Click "Add Company" to create the first client account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">Company</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">Phone</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">Cases</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map(company => {
                    const companyCases = cases.filter(c => c.companyId === company.id);
                    return (
                      <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                              <span className="text-[#2563EB] text-xs font-bold">{company.name[0]}</span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-800 text-sm font-jakarta">{company.name}</div>
                              {company.contactPerson && <div className="text-slate-400 text-xs font-jakarta">{company.contactPerson}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{company.email}</td>
                        <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{company.phone}</td>
                        <td className="px-6 py-3">
                          <span className="text-sm font-jakarta text-slate-700">{companyCases.length}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-500 font-jakarta">
                          {formatDate(company.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddCompany && <AddCompanyModal onClose={() => setShowAddCompany(false)} />}
    </div>
  );
}
