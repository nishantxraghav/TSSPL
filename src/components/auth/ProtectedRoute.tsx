import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'client';
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { authUser, loading } = useApp();

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
        <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!authUser || authUser.role !== role) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/client/login'} replace />;
  }

  return <>{children}</>;
}
