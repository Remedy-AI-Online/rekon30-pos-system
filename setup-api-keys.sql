-- API Key Setup for Rekon30 Backend System
-- Run this in your Supabase SQL Editor

-- Create system-wide API key for integrations
INSERT INTO api_keys (key_name, key_value, business_id, permissions, rate_limit, is_active)
VALUES (
  'System Integration Key',
  'sk_' || substr(md5(random()::text), 1, 32),
  NULL, -- System-wide key
  '["analytics", "backup_status", "realtime_events"]'::jsonb,
  1000, -- 1000 requests per hour
  true
);

-- Create analytics-only API key
INSERT INTO api_keys (key_name, key_value, business_id, permissions, rate_limit, is_active)
VALUES (
  'Analytics API Key',
  'sk_analytics_' || substr(md5(random()::text), 1, 28),
  NULL, -- System-wide key
  '["analytics"]'::jsonb,
  500, -- 500 requests per hour
  true
);

-- Create backup monitoring API key
INSERT INTO api_keys (key_name, key_value, business_id, permissions, rate_limit, is_active)
VALUES (
  'Backup Monitor Key',
  'sk_backup_' || substr(md5(random()::text), 1, 28),
  NULL, -- System-wide key
  '["backup_status", "realtime_events"]'::jsonb,
  200, -- 200 requests per hour
  true
);

-- Display the created API keys
SELECT 
  key_name,
  key_value,
  permissions,
  rate_limit,
  is_active,
  created_at
FROM api_keys 
WHERE created_at >= NOW() - INTERVAL '1 minute'
ORDER BY created_at DESC;
