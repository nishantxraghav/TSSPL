import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { AuthUser, Company, BGVCase, BGVChecklistItem } from '@/types';
import { createClient } from '@supabase/supabase-js';

interface AppContextType {
  authUser: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  companies: Company[];
  addCompany: (company: Company) => Promise<{ success: boolean; error?: string }>;
  updateCompany: (id: string, data: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  cases: BGVCase[];
  addCase: (bgvCase: BGVCase) => Promise<{ success: boolean; error?: string }>;
  updateCase: (id: string, data: Partial<BGVCase>) => void;
  deleteCase: (id: string) => void;
  bgvChecklist: BGVChecklistItem[];
  addChecklistItem: (item: BGVChecklistItem) => void;
  deleteChecklistItem: (id: string) => void;
  loading: boolean;
  adminPassword: string;
  updateAdminPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Persist auth in sessionStorage so it survives page refreshes
function loadAuthFromSession(): AuthUser | null {
  try {
    const stored = sessionStorage.getItem('bgv_auth');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveAuthToSession(user: AuthUser | null) {
  try {
    if (user) {
      sessionStorage.setItem('bgv_auth', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('bgv_auth');
    }
  } catch { /* ignore */ }
}

// Helper to map snake_case to camelCase
const mapCompany = (row: any): Company => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  gstNumber: row.gst_number,
  gstDocument: row.gst_document,
  password: row.password,
  contactPerson: row.contact_person,
  createdAt: row.created_at,
});

const mapCase = (row: any): BGVCase => ({
  id: row.id,
  companyId: row.company_id,
  companyName: row.company_name,
  employeeName: row.employee_name,
  employeeEmail: row.employee_email,
  employeePhone: row.employee_phone,
  employeeCode: row.employee_code,
  status: row.status,
  remarks: row.remarks,
  reportFile: row.report_file,
  bgvChecks: row.bgv_checks || [],
  uploadTimestamp: row.upload_timestamp,
  completionTimestamp: row.completion_timestamp,
  createdAt: row.created_at,
});

const mapChecklistItem = (row: any): BGVChecklistItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  createdAt: row.created_at,
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => loadAuthFromSession());
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cases, setCases] = useState<BGVCase[]>([]);
  const [bgvChecklist, setBgvChecklist] = useState<BGVChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState<string>('9ijn@9ijn');

  // Load initial data from Supabase
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not configured, running without backend');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        // Add a timeout to prevent hanging forever
        const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms));

        // Load companies
        const companiesPromise = supabase.from('companies').select('*');
        const { data: companiesData, error: companiesError } = await Promise.race([companiesPromise, timeout(10000)]) as any;
        if (cancelled) return;
        if (companiesError) throw companiesError;
        setCompanies((companiesData || []).map(mapCompany));

        // Load cases
        const casesPromise = supabase.from('bgv_cases').select('*');
        const { data: casesData, error: casesError } = await Promise.race([casesPromise, timeout(10000)]) as any;
        if (cancelled) return;
        if (casesError) throw casesError;
        setCases((casesData || []).map(mapCase));

        // Load BGV checklist
        const checklistPromise = supabase.from('bgv_checklist_items').select('*');
        const { data: checklistData, error: checklistError } = await Promise.race([checklistPromise, timeout(10000)]) as any;
        if (cancelled) return;
        if (checklistError) throw checklistError;
        setBgvChecklist((checklistData || []).map(mapChecklistItem));

        // Load admin password
        const adminPwPromise = supabase.from('admin_settings').select('value').eq('key', 'admin_password').single();
        const { data: adminPwData, error: adminPwError } = await Promise.race([adminPwPromise, timeout(10000)]) as any;
        if (cancelled) return;
        if (!adminPwError && adminPwData?.value) {
          setAdminPassword(adminPwData.value);
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;
    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Use unique channel names to avoid conflicts with StrictMode double-mount
    const uniqueId = Math.random().toString(36).slice(2, 8);

    try {
      const companiesChannel = supabase
        .channel(`companies-${uniqueId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, (payload) => {
          if (cancelled) return;
          if (payload.eventType === 'INSERT') {
            setCompanies(prev => prev.some(c => c.id === payload.new.id) ? prev : [...prev, mapCompany(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setCompanies(prev => prev.map(c => c.id === payload.new.id ? mapCompany(payload.new) : c));
          } else if (payload.eventType === 'DELETE') {
            setCompanies(prev => prev.filter(c => c.id !== payload.old.id));
          }
        })
        .subscribe();
      channels.push(companiesChannel);

      const casesChannel = supabase
        .channel(`bgv_cases-${uniqueId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bgv_cases' }, (payload) => {
          if (cancelled) return;
          if (payload.eventType === 'INSERT') {
            setCases(prev => prev.some(c => c.id === payload.new.id) ? prev : [...prev, mapCase(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setCases(prev => prev.map(c => c.id === payload.new.id ? mapCase(payload.new) : c));
          } else if (payload.eventType === 'DELETE') {
            setCases(prev => prev.filter(c => c.id !== payload.old.id));
          }
        })
        .subscribe();
      channels.push(casesChannel);

      const checklistChannel = supabase
        .channel(`bgv_checklist_items-${uniqueId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bgv_checklist_items' }, (payload) => {
          if (cancelled) return;
          if (payload.eventType === 'INSERT') {
            setBgvChecklist(prev => prev.some(i => i.id === payload.new.id) ? prev : [...prev, mapChecklistItem(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setBgvChecklist(prev => prev.map(i => i.id === payload.new.id ? mapChecklistItem(payload.new) : i));
          } else if (payload.eventType === 'DELETE') {
            setBgvChecklist(prev => prev.filter(i => i.id !== payload.old.id));
          }
        })
        .subscribe();
      channels.push(checklistChannel);
    } catch (err) {
      console.error('Error setting up realtime subscriptions:', err);
    }

    return () => {
      cancelled = true;
      channels.forEach(ch => {
        try { supabase.removeChannel(ch); } catch { /* ignore cleanup errors */ }
      });
    };
  }, []);

  const login = useCallback((user: AuthUser) => {
    setAuthUser(user);
    saveAuthToSession(user);
  }, []);
  const logout = useCallback(() => {
    setAuthUser(null);
    saveAuthToSession(null);
  }, []);

  const addCompany = async (company: Company): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: 'Database not connected' };
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          id: company.id,
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          gst_number: company.gstNumber,
          gst_document: company.gstDocument,
          password: company.password,
          contact_person: company.contactPerson,
        }])
        .select()
        .single();
      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'A company with this email already exists.' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error adding company:', err);
      return { success: false, error: err?.message || 'An unexpected error occurred' };
    }
  };

  const updateCompany = async (id: string, data: Partial<Company>) => {
    if (!supabase) return;
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.gstNumber !== undefined) updateData.gst_number = data.gstNumber;
      if (data.gstDocument !== undefined) updateData.gst_document = data.gstDocument;
      if (data.password !== undefined) updateData.password = data.password;
      if (data.contactPerson !== undefined) updateData.contact_person = data.contactPerson;

      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating company:', err);
    }
  };

  const deleteCompany = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  const addCase = async (bgvCase: BGVCase): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: 'Database not connected' };
    try {
      const { data, error } = await supabase
        .from('bgv_cases')
        .insert([{
          id: bgvCase.id,
          company_id: bgvCase.companyId,
          company_name: bgvCase.companyName,
          employee_name: bgvCase.employeeName,
          employee_email: bgvCase.employeeEmail,
          employee_phone: bgvCase.employeePhone,
          employee_code: bgvCase.employeeCode,
          status: bgvCase.status,
          remarks: bgvCase.remarks,
          report_file: bgvCase.reportFile,
          bgv_checks: bgvCase.bgvChecks,
          upload_timestamp: bgvCase.uploadTimestamp,
          completion_timestamp: bgvCase.completionTimestamp,
        }])
        .select()
        .single();
      if (error) throw error;
      // Update local state immediately (deduplicate in case realtime fires too)
      setCases(prev => prev.some(c => c.id === data.id) ? prev : [...prev, mapCase(data)]);
      return { success: true };
    } catch (err: any) {
      console.error('Error adding case:', err);
      return { success: false, error: err?.message || 'Failed to add employee' };
    }
  };

  const updateCase = async (id: string, data: Partial<BGVCase>) => {
    if (!supabase) return;
    try {
      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.remarks !== undefined) updateData.remarks = data.remarks;
      if (data.reportFile !== undefined) updateData.report_file = data.reportFile;
      if (data.bgvChecks !== undefined) updateData.bgv_checks = data.bgvChecks;
      if (data.completionTimestamp !== undefined) updateData.completion_timestamp = data.completionTimestamp;

      const { error } = await supabase
        .from('bgv_cases')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating case:', err);
    }
  };

  const deleteCase = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('bgv_cases')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting case:', err);
    }
  };

  const addChecklistItem = async (item: BGVChecklistItem) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('bgv_checklist_items')
        .insert([{
          title: item.title,
          description: item.description,
        }]);
      if (error) throw error;
      // Real-time subscription will handle updating local state
    } catch (err) {
      console.error('Error adding checklist item:', err);
    }
  };

  const deleteChecklistItem = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('bgv_checklist_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setBgvChecklist(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Error deleting checklist item:', err);
    }
  };

  const updateAdminPassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (currentPassword !== adminPassword) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: 'New password must be at least 4 characters.' };
    }
    if (!supabase) return { success: false, error: 'Database not connected' };
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ value: newPassword, updated_at: new Date().toISOString() })
        .eq('key', 'admin_password');
      if (error) throw error;
      setAdminPassword(newPassword);
      return { success: true };
    } catch (err: any) {
      console.error('Error updating admin password:', err);
      return { success: false, error: err?.message || 'Failed to update password' };
    }
  };

  const contextValue = useMemo(() => ({
    authUser, login, logout,
    companies, addCompany, updateCompany, deleteCompany,
    cases, addCase, updateCase, deleteCase,
    bgvChecklist, addChecklistItem, deleteChecklistItem,
    loading,
    adminPassword, updateAdminPassword,
  }), [authUser, login, logout, companies, cases, bgvChecklist, loading, adminPassword]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
