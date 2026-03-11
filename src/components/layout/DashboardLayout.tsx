import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';

interface DashboardLayoutProps {
  role: 'admin' | 'client';
}

export function DashboardLayout({ role }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F4F6FA' }}>
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F4F6FA' }}>
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
