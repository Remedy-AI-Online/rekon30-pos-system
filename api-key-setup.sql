
-- Create API key for third-party integrations
INSERT INTO api_keys (key_name, key_value, business_id, permissions, rate_limit, created_by)
VALUES (
  'Third Party Integration',
  'sk_' || substr(md5(random()::text), 1, 32),
  NULL, -- System-wide key
  '["analytics", "backup_status"]'::jsonb,
  1000,
  (SELECT id FROM super_admins LIMIT 1)
);
    