import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import logoImage from '@/../public/images/transparent black Logo.png';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0F1C2E' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="TSSPL Logo" className="w-9 h-9 object-contain" />
          <div>
            <div className="font-syne font-bold text-white text-base">TSSPL</div>
            <div className="text-[10px] text-slate-400">Background Verification Platform</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/client/login" className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-jakarta font-medium transition-colors">
            Client Login
          </Link>
          <Link to="/admin/login" className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-jakarta font-semibold transition-colors">
            Admin Login
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2563EB]/15 border border-[#2563EB]/30 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-[#60A5FA] text-sm font-jakarta">Trusted Background Verification</span>
          </div>
          
          <h1 className="font-syne font-extrabold text-white text-5xl leading-tight mb-6">
            End-to-End BGV<br />
            <span className="text-[#2563EB]">Lifecycle Management</span>
          </h1>
          
          <p className="text-slate-400 font-jakarta text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            A comprehensive platform for managing background verification from document collection to final report delivery.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
            {[
              { icon: 'logo' as const, label: 'Admin Portal', desc: 'Full oversight & management', href: '/admin/login', color: '#2563EB' },
              { icon: 'building' as const, label: 'Client Portal', desc: 'HR team case tracking', href: '/client/login', color: '#10B981' },
              { icon: 'users' as const, label: 'Employee Submission', desc: 'Document upload portal', href: '#', color: '#F59E0B' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                  {item.icon === 'logo' ? (
                    <img src={logoImage} alt={item.label} className="w-6 h-6 object-contain" />
                  ) : item.icon === 'building' ? (
                    <Building2 className="w-6 h-6" style={{ color: item.color }} />
                  ) : (
                    <Users className="w-6 h-6" style={{ color: item.color }} />
                  )}
                </div>
                <div>
                  <div className="font-syne font-bold text-white text-sm">{item.label}</div>
                  <div className="text-slate-400 text-xs font-jakarta mt-0.5">{item.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-sm font-jakarta text-slate-500">
            {['Role-Based Access', 'Email Automation', 'Secure Document Storage', 'Real-Time Tracking'].map(feat => (
              <div key={feat} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="px-8 py-4 border-t border-white/5 text-center text-xs text-slate-600 font-jakarta">
        © 2024 TSSPL — Background Verification Platform. All rights reserved.
      </footer>
    </div>
  );
}
