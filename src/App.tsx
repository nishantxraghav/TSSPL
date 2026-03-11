import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { LandingPage } from "@/pages/LandingPage";
import { AdminLogin } from "@/pages/auth/AdminLogin";
import { ClientLogin } from "@/pages/auth/ClientLogin";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminCompanies } from "@/pages/admin/AdminCompanies";
import { AdminWIPCases } from "@/pages/admin/AdminWIPCases";
import { AdminCompletedCases } from "@/pages/admin/AdminCompletedCases";
import { AdminBGVChecklist } from "@/pages/admin/AdminBGVChecklist";
import { AdminProfile } from "@/pages/admin/AdminProfile";
import { ClientDashboard } from "@/pages/client/ClientDashboard";
import { ClientEmployees } from "@/pages/client/ClientEmployees";
import { ClientWIPCases } from "@/pages/client/ClientWIPCases";
import { ClientCompletedCases } from "@/pages/client/ClientCompletedCases";
import { ClientProfile } from "@/pages/client/ClientProfile";
import { ClientBGVChecklist } from "@/pages/client/ClientBGVChecklist";
import { EmployeeSubmit } from "@/pages/employee/EmployeeSubmit";

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F1C2E]"><div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" /></div>}>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/employee-submit/:companyId" element={<EmployeeSubmit />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="wip-cases" element={<AdminWIPCases />} />
          <Route path="completed-cases" element={<AdminCompletedCases />} />
          <Route path="bgv-checklist" element={<AdminBGVChecklist />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Client Routes */}
        <Route
          path="/client"
          element={
            <ProtectedRoute role="client">
              <DashboardLayout role="client" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="employees" element={<ClientEmployees />} />
          <Route path="wip-cases" element={<ClientWIPCases />} />
          <Route path="completed-cases" element={<ClientCompletedCases />} />
          <Route path="bgv-checklist" element={<ClientBGVChecklist />} />
          <Route path="profile" element={<ClientProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
