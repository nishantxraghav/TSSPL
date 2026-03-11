import React from 'react';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/shared/StatCard';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/utils';

export function ClientDashboard() {
  const { authUser, cases } = useApp();
  const clientUser = authUser?.role === 'client' ? authUser : null;

  const myCases = cases.filter(c => c.companyId === clientUser?.id);
  const wipCases = myCases.filter(c => c.status === 'WIP');
  const completedCases = myCases.filter(c => c.status !== 'WIP');
  const uniqueEmployees = new Set(myCases.map(c => c.employeeCode)).size;

  return (
    <div className="p-6">
      <TopBar title="Dashboard" breadcrumb={['Client', 'Dashboard']} />

      <div className="mt-6">
        <div className="mb-6">
          <h2 className="font-syne font-bold text-slate-800 text-xl">
            Welcome back, {clientUser?.name || clientUser?.companyName}
          </h2>
          <p className="text-slate-500 text-sm font-jakarta">Here's an overview of your verification cases</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Employees" value={uniqueEmployees} icon={Users} accentColor="#2563EB" bgColor="#EFF6FF" iconColor="#2563EB" delay={0.05} />
          <StatCard label="Cases Submitted" value={myCases.length} icon={FileText} accentColor="#8B5CF6" bgColor="#F5F3FF" iconColor="#8B5CF6" delay={0.1} />
          <StatCard label="WIP Cases" value={wipCases.length} icon={Clock} accentColor="#F59E0B" bgColor="#FFFBEB" iconColor="#F59E0B" delay={0.15} />
          <StatCard label="Completed Cases" value={completedCases.length} icon={CheckCircle} accentColor="#10B981" bgColor="#ECFDF5" iconColor="#10B981" delay={0.2} />
        </div>

        {/* Recent cases */}
        {myCases.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-syne font-bold text-slate-800">Recent Cases</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    {['Employee', 'Code', 'Status', 'Submitted'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 font-jakarta uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myCases.slice(0, 5).map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-slate-800 text-sm font-jakarta">{c.employeeName}</div>
                        <div className="text-slate-400 text-xs font-jakarta">{c.employeeEmail}</div>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600 font-jakarta">{c.employeeCode}</td>
                      <td className="px-6 py-3">
                        {c.status === 'WIP' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-jakarta font-medium bg-amber-50 text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            WIP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-jakarta font-medium bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500 font-jakarta">
                        {formatDate(c.uploadTimestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {myCases.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 py-16 flex flex-col items-center">
            <FileText className="w-10 h-10 text-slate-200 mb-3" />
            <p className="font-syne font-bold text-slate-600">No cases yet</p>
            <p className="text-slate-400 text-sm font-jakarta mt-1 text-center max-w-xs">
              Share the employee submission link with your candidates to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
