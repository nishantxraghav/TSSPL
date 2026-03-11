INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read on reports" ON storage.objects;
CREATE POLICY "Allow public read on reports"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reports');

DROP POLICY IF EXISTS "Allow public insert on reports" ON storage.objects;
CREATE POLICY "Allow public insert on reports"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reports');

DROP POLICY IF EXISTS "Allow public update on reports" ON storage.objects;
CREATE POLICY "Allow public update on reports"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'reports');

DROP POLICY IF EXISTS "Allow public delete on reports" ON storage.objects;
CREATE POLICY "Allow public delete on reports"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'reports');
