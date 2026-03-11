import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  CheckSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import logoImage from '@/../public/images/transparent black Logo.png';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Building2, label: 'Companies', path: '/admin/companies' },
  { icon: FileText, label: 'WIP Cases', path: '/admin/wip-cases' },
  { icon: FileText, label: 'Completed Cases', path: '/admin/completed-cases' },
  { icon: CheckSquare, label: 'BGV Checklist', path: '/admin/bgv-checklist' },
  { icon: User, label: 'Profile', path: '/admin/profile' },
];

const clientNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/client/dashboard' },
  { icon: User, label: 'Employees', path: '/client/employees' },
  { icon: FileText, label: 'WIP Cases', path: '/client/wip-cases' },
  { icon: FileText, label: 'Completed Cases', path: '/client/completed-cases' },
  { icon: CheckSquare, label: 'BGV Checklist', path: '/client/bgv-checklist' },
  { icon: User, label: 'Profile', path: '/client/profile' },
];

interface SidebarProps {
  role: 'admin' | 'client';
}

export function Sidebar({ role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { authUser, logout } = useApp();
  const navigate = useNavigate();
  const navItems = role === 'admin' ? adminNavItems : clientNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-[#0F1C2E] border-r border-white/5 transition-all duration-300 relative shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
      }}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/5', collapsed && 'justify-center px-0')}>
        <img src={logoImage} alt="TSSPL Logo" className="w-8 h-8 object-contain shrink-0" />
        {!collapsed && (
          <div>
            <div className="font-syne font-extrabold text-white text-sm tracking-tight leading-none">TSSPL</div>
            <div className="text-[10px] text-slate-400 font-jakarta mt-0.5">BGV Platform</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-jakarta font-medium transition-all',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'active bg-[#2563EB]/15 text-[#60A5FA]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#2563EB]' : '')} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-[#0F1C2E] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* User */}
      <div className={cn('px-3 py-4 border-t border-white/5', collapsed && 'px-1')}>
        <div className={cn('flex items-center gap-3 px-2 py-2 rounded-lg', !collapsed && 'mb-2')}>
          <div className="w-8 h-8 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center shrink-0">
            <span className="text-[#60A5FA] text-xs font-bold">
              {authUser?.name?.[0]?.toUpperCase() || (role === 'admin' ? 'A' : 'C')}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate font-jakarta">
                {authUser?.name || (role === 'admin' ? 'Administrator' : 'Client')}
              </div>
              <div className={cn(
                'text-[10px] font-jakarta px-1.5 py-0.5 rounded-full w-fit mt-0.5',
                role === 'admin'
                  ? 'bg-[#2563EB]/20 text-[#60A5FA]'
                  : 'bg-emerald-500/20 text-emerald-400'
              )}>
                {role === 'admin' ? 'Admin' : 'Client'}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-2 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full text-sm font-jakarta',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
