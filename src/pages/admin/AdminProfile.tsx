import React from 'react';
import { User, Mail, Lock, Save } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { useApp } from '@/context/AppContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ProfileForm {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}

export function AdminProfile() {
  const { authUser, login, updateAdminPassword } = useApp();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      name: authUser?.name || 'TSSPL Admin',
      email: authUser?.email || 'info@tsspl.org',
      currentPassword: '',
      newPassword: '',
    }
  });

  const onSubmit = async (data: ProfileForm) => {
    // Handle password change if fields are filled
    if (data.currentPassword || data.newPassword) {
      if (!data.currentPassword) {
        toast.error('Please enter your current password.');
        return;
      }
      if (!data.newPassword) {
        toast.error('Please enter a new password.');
        return;
      }
      const result = await updateAdminPassword(data.currentPassword, data.newPassword);
      if (!result.success) {
        toast.error(result.error || 'Failed to update password.');
        return;
      }
    }

    // Update name/email in session
    if (authUser?.role === 'admin') {
      login({ ...authUser, name: data.name, email: data.email });
    }
    
    // Reset password fields after successful save
    reset({
      name: data.name,
      email: data.email,
      currentPassword: '',
      newPassword: '',
    });
    
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="p-6">
      <TopBar title="Admin Profile" breadcrumb={['Admin', 'Profile']} />

      <div className="mt-6 max-w-lg">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#0F1C2E] to-[#1e3a5f] flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2563EB] flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-syne font-bold text-white text-lg">{authUser?.name}</div>
              <div className="text-slate-400 text-sm font-jakarta">{authUser?.email}</div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#2563EB]/30 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" />
                <span className="text-[#60A5FA] text-xs font-jakarta">Administrator</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
              </div>
              {errors.name && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.email.message}</p>}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-syne font-bold text-slate-700 text-sm mb-4">Change Password</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...register('currentPassword')} type="password" placeholder="Leave empty to skip" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 font-jakarta mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...register('newPassword')} type="password" placeholder="New password" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-2.5 rounded-lg text-sm font-jakarta font-semibold transition-colors"
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
