import React from 'react';
import { User, Mail, Phone, MapPin, Building2, Save } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { useApp } from '@/context/AppContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function ClientProfile() {
  const { authUser, login, companies, updateCompany } = useApp();
  const clientUser = authUser?.role === 'client' ? authUser : null;

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      name: clientUser?.name || '',
      email: clientUser?.email || '',
      phone: clientUser?.phone || '',
      address: clientUser?.address || '',
    }
  });

  const onSubmit = (data: ProfileForm) => {
    if (clientUser && authUser?.role === 'client') {
      updateCompany(clientUser.id, {
        contactPerson: data.name,
        phone: data.phone,
        address: data.address,
      });
      login({ ...authUser, name: data.name, phone: data.phone, address: data.address });
    }
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="p-6">
      <TopBar title="Profile" breadcrumb={['Client', 'Profile']} />

      <div className="mt-6 max-w-lg">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#0F2D17] to-[#1a4d2e] flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-syne font-bold text-white text-lg">{clientUser?.companyName}</div>
              <div className="text-slate-400 text-sm font-jakarta">{clientUser?.email}</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/30 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-xs font-jakarta">Client Account</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Contact Person Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
              {errors.name && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm font-jakarta cursor-not-allowed"
                />
              </div>
              <p className="text-slate-400 text-xs mt-1 font-jakarta">Email cannot be changed. Contact admin.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('phone')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-jakarta font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
