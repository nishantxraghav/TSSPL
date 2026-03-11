export type UserRole = 'admin' | 'client' | null;

export interface AdminUser {
  role: 'admin';
  email: string;
  name: string;
}

export interface ClientUser {
  role: 'client';
  id: string;
  email: string;
  name: string;
  companyName: string;
  phone?: string;
  address?: string;
}

export type AuthUser = AdminUser | ClientUser;

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  gstDocument?: string;
  password: string;
  createdAt: string;
  contactPerson?: string;
}

export type CaseStatus = 'WIP' | 'Clear' | 'MinorIssue' | 'MajorIssue' | 'Interim';

export interface SubmittedDocument {
  name: string;
  data: string; // base64 encoded file data
  type: string; // MIME type
}

export interface BGVCase {
  id: string;
  companyId: string;
  companyName: string;
  employeeName: string;
  employeeEmail: string;
  employeePhone: string;
  employeeCode: string;
  costCentre?: string;
  entity?: string;
  status: CaseStatus;
  remarks?: string;
  reportFile?: string;
  documents?: SubmittedDocument[];
  bgvFormFile?: SubmittedDocument;
  cifFormFile?: SubmittedDocument;
  bgvChecks: string[];
  uploadTimestamp: string;
  completionTimestamp?: string;
  createdAt: string;
}

export interface BGVChecklistItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface AppState {
  companies: Company[];
  cases: BGVCase[];
  bgvChecklist: BGVChecklistItem[];
}
