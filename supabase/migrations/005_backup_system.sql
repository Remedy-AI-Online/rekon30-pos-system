-- Backup System Tables

-- Backup records table
CREATE TABLE IF NOT EXISTS backup_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL DEFAULT 'full' CHECK (backup_type IN ('full', 'incremental', 'manual')),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  data_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Backup restore requests table
CREATE TABLE IF NOT EXISTS restore_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  backup_id UUID REFERENCES backup_records(id),
  requested_by UUID REFERENCES super_admins(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  restore_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- API keys table for third-party integrations
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name TEXT NOT NULL,
  key_value TEXT UNIQUE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES super_admins(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- API usage logs
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time events table
CREATE TABLE IF NOT EXISTS realtime_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_backup_records_business_id ON backup_records(business_id);
CREATE INDEX IF NOT EXISTS idx_backup_records_created_at ON backup_records(created_at);
CREATE INDEX IF NOT EXISTS idx_restore_requests_business_id ON restore_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_business_id ON api_keys(business_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_value ON api_keys(key_value);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_realtime_events_business_id ON realtime_events(business_id);
CREATE INDEX IF NOT EXISTS idx_realtime_events_event_type ON realtime_events(event_type);

-- Enable RLS
ALTER TABLE backup_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE restore_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admins can access all backup records" ON backup_records
    FOR ALL USING (true);

CREATE POLICY "Super admins can access all restore requests" ON restore_requests
    FOR ALL USING (true);

CREATE POLICY "Super admins can access all api keys" ON api_keys
    FOR ALL USING (true);

CREATE POLICY "Super admins can access all api usage logs" ON api_usage_logs
    FOR ALL USING (true);

CREATE POLICY "Super admins can access all realtime events" ON realtime_events
    FOR ALL USING (true);

-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-backups', 'business-backups', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for backup files
CREATE POLICY "Super admins can upload backup files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'business-backups');

CREATE POLICY "Super admins can view backup files" ON storage.objects
    FOR SELECT USING (bucket_id = 'business-backups');

CREATE POLICY "Super admins can delete backup files" ON storage.objects
    FOR DELETE USING (bucket_id = 'business-backups');
