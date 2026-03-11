CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admin_settings (key, value)
VALUES ('admin_password', '9ijn@9ijn')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE admin_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_settings;
