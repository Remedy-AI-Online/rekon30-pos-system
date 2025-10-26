# 🚀 Rekon30 Backend Setup Guide

## ✅ Step 1: Create API Keys

### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `setup-api-keys.sql`
4. Click **Run** to execute the script
5. **Save the generated API keys** - you'll need them for integrations!

### Option B: Using Supabase CLI
```bash
# Run the SQL script directly
supabase db reset --db-url "your-database-url" < setup-api-keys.sql
```

## ✅ Step 2: Set Up Automated Backups

### For Linux/Mac Users:
```bash
# Make the script executable
chmod +x setup-cron-jobs.sh

# Run the setup script
./setup-cron-jobs.sh
```

### For Windows Users:
```cmd
# Run as Administrator
setup-cron-jobs-windows.bat
```

### Manual Setup (Any OS):

#### 1. Create Backup Script
Create a file called `backup-script.sh` (Linux/Mac) or `backup-script.bat` (Windows):

**Linux/Mac (`backup-script.sh`):**
```bash
#!/bin/bash
curl -X POST "https://your-project.supabase.co/functions/v1/cron-backup" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**Windows (`backup-script.bat`):**
```batch
@echo off
curl -X POST "https://your-project.supabase.co/functions/v1/cron-backup" ^
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" ^
  -H "Content-Type: application/json"
```

#### 2. Set Up Cron Job

**Linux/Mac:**
```bash
# Add to crontab (runs every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /path/to/backup-script.sh") | crontab -
```

**Windows (Task Scheduler):**
1. Open **Task Scheduler**
2. Create **Basic Task**
3. Name: "Rekon30 Backup"
4. Trigger: **Daily** → **Repeat every 5 minutes**
5. Action: **Start a program** → Select your `backup-script.bat`

## ✅ Step 3: Test Your Setup

### Test API Keys:
```bash
# Test analytics API
curl -X GET "https://your-project.supabase.co/functions/v1/analytics?type=overview" \
  -H "x-api-key: YOUR_API_KEY"

# Test backup system
curl -X POST "https://your-project.supabase.co/functions/v1/backup-system" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"business_id": "your-business-id", "backup_type": "full"}'
```

### Test Cron Job:
```bash
# Run backup manually
curl -X POST "https://your-project.supabase.co/functions/v1/cron-backup" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## 📊 Monitor Your System

### Check Backup Logs:
```bash
# Linux/Mac
tail -f /var/log/rekon30-backup.log

# Windows
type C:\temp\rekon30-backup.log
```

### View Cron Jobs:
```bash
# Linux/Mac
crontab -l

# Windows
schtasks /query /tn "Rekon30-Backup"
```

## 🔧 Troubleshooting

### Common Issues:

1. **Cron job not running:**
   - Check if the script has execute permissions: `chmod +x backup-script.sh`
   - Verify the cron job exists: `crontab -l`
   - Check system logs: `journalctl -f`

2. **API key not working:**
   - Verify the key exists in the database: `SELECT * FROM api_keys;`
   - Check if the key is active: `SELECT * FROM api_keys WHERE is_active = true;`

3. **Backup failures:**
   - Check Supabase function logs in the dashboard
   - Verify your Service Role Key has the correct permissions
   - Ensure businesses exist in the database

### Support:
- Check Supabase dashboard for function logs
- Review the `BACKEND_SYSTEM_README.md` for detailed documentation
- Monitor the backup logs for any errors

## 🎉 Success!

Once everything is set up, your Rekon30 backend will:
- ✅ **Automatically backup all businesses every 5 minutes**
- ✅ **Provide secure API access for third-party integrations**
- ✅ **Handle manual payment verification**
- ✅ **Support real-time dashboard updates**
- ✅ **Enable data restore capabilities**

Your backend system is now fully operational! 🚀
