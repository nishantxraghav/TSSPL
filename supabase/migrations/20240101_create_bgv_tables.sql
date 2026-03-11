-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  gst_number TEXT,
  gst_document TEXT,
  password TEXT NOT NULL,
  contact_person TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for anon" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for all" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow update by anyone" ON companies FOR UPDATE USING (true);
CREATE POLICY "Allow delete by anyone" ON companies FOR DELETE USING (true);

-- Create bgv_checklist_items table
CREATE TABLE IF NOT EXISTS bgv_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bgv_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for anon" ON bgv_checklist_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for all" ON bgv_checklist_items FOR SELECT USING (true);
CREATE POLICY "Allow delete by anyone" ON bgv_checklist_items FOR DELETE USING (true);

-- Create bgv_cases table
CREATE TABLE IF NOT EXISTS bgv_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  employee_phone TEXT NOT NULL,
  employee_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'WIP',
  remarks TEXT,
  report_file TEXT,
  bgv_checks TEXT[] DEFAULT ARRAY[]::TEXT[],
  upload_timestamp TIMESTAMPTZ DEFAULT NOW(),
  completion_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bgv_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for anon" ON bgv_cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for all" ON bgv_cases FOR SELECT USING (true);
CREATE POLICY "Allow update by anyone" ON bgv_cases FOR UPDATE USING (true);
CREATE POLICY "Allow delete by anyone" ON bgv_cases FOR DELETE USING (true);

-- Create case_documents table (for storing document metadata)
CREATE TABLE IF NOT EXISTS case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES bgv_cases(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for anon" ON case_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select for all" ON case_documents FOR SELECT USING (true);
CREATE POLICY "Allow delete by anyone" ON case_documents FOR DELETE USING (true);
