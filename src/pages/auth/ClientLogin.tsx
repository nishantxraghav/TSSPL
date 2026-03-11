import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight, Building2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
const logoImage = '/images/transparent black Logo.png';

interface LoginForm {
  email: string;
  password: string;
}

export function ClientLogin() {
  const navigate = useNavigate();
  const { login, companies } = useApp();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    const company = companies.find(
      c => c.email === data.email && c.password === data.password
    );
    if (company) {
      login({
        role: 'client',
        id: company.id,
        email: company.email,
        name: company.contactPerson || company.name,
        companyName: company.name,
        phone: company.phone,
        address: company.address,
      });
      toast.success(`Welcome back, ${company.name}!`);
      navigate('/client/dashboard');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F4F6FA' }}>
      {/* Left panel */}
      <div className="hidden lg:flex w-[420px] flex-col justify-between p-10"
        style={{ background: 'linear-gradient(160deg, #0F2D17 0%, #1a4d2e 100%)' }}
      >
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="TSSPL Logo" className="w-9 h-9 object-contain" />
          <div>
            <div className="font-syne font-bold text-white text-base">TSSPL</div>
            <div className="text-[10px] text-slate-400">BGV Platform</div>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-xs font-jakarta">Client Portal</span>
          </div>
          <h2 className="font-syne font-bold text-white text-3xl leading-tight mb-4">
            HR Management<br />Portal
          </h2>
          <p className="text-slate-400 text-sm font-jakarta leading-relaxed">
            Track employee verification cases, share submission links with candidates, and download completed reports.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Case Tracking', val: 'Real-Time' },
            { label: 'Reports', val: 'Downloadable' },
            { label: 'Notifications', val: 'Email Alerts' },
            { label: 'Employees', val: 'Managed' },
          ].map(item => (
            <div key={item.label} className="bg-white/5 rounded-lg p-3">
              <div className="text-white font-syne font-bold text-sm">{item.val}</div>
              <div className="text-slate-400 text-xs font-jakarta">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-scale-in">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="font-syne font-bold text-slate-900 text-2xl mb-1">Client Login</h1>
              <p className="text-slate-500 text-sm font-jakarta">Sign in to your company portal</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 font-jakarta mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    placeholder="company@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
                {errors.email && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 font-jakarta mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
                {errors.password && <p className="text-rose-500 text-xs mt-1 font-jakarta">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-jakarta font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 font-jakarta mt-6">
              Admin?{' '}
              <Link to="/admin/login" className="text-[#2563EB] hover:underline">Admin Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
