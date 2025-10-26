#!/bin/bash

# Rekon30 Cron Job Setup Script
# This script sets up automated backups every 5 minutes

echo "🚀 Setting up Rekon30 Cron Jobs..."

# Get your Supabase project details
echo "📝 Please provide your Supabase project details:"
read -p "Enter your Supabase Project URL (e.g., https://your-project.supabase.co): " SUPABASE_URL
read -p "Enter your Supabase Service Role Key: " SERVICE_ROLE_KEY

# Validate inputs
if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Both URL and Service Role Key are required!"
    exit 1
fi

# Create the cron job script
cat > /tmp/rekon30-backup-cron.sh << EOF
#!/bin/bash

# Rekon30 Automated Backup Script
# Runs every 5 minutes to backup all businesses

TIMESTAMP=\$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="/var/log/rekon30-backup.log"

echo "[\$TIMESTAMP] Starting Rekon30 backup process..." >> \$LOG_FILE

# Call the backup scheduler function
RESPONSE=\$(curl -s -X POST "\$SUPABASE_URL/functions/v1/cron-backup" \\
  -H "Authorization: Bearer \$SERVICE_ROLE_KEY" \\
  -H "Content-Type: application/json" \\
  -w "HTTPSTATUS:%{http_code}")

# Extract HTTP status code
HTTP_STATUS=\$(echo \$RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

# Extract response body
RESPONSE_BODY=\$(echo \$RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

if [ "\$HTTP_STATUS" -eq 200 ]; then
    echo "[\$TIMESTAMP] ✅ Backup completed successfully" >> \$LOG_FILE
    echo "[\$TIMESTAMP] Response: \$RESPONSE_BODY" >> \$LOG_FILE
else
    echo "[\$TIMESTAMP] ❌ Backup failed with status: \$HTTP_STATUS" >> \$LOG_FILE
    echo "[\$TIMESTAMP] Error: \$RESPONSE_BODY" >> \$LOG_FILE
fi

echo "[\$TIMESTAMP] Backup process finished" >> \$LOG_FILE
EOF

# Make the script executable
chmod +x /tmp/rekon30-backup-cron.sh

# Create the cron job
echo "📅 Creating cron job for every 5 minutes..."

# Add the cron job (runs every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /tmp/rekon30-backup-cron.sh") | crontab -

echo "✅ Cron job setup complete!"
echo ""
echo "📋 Setup Summary:"
echo "• Backup script: /tmp/rekon30-backup-cron.sh"
echo "• Log file: /var/log/rekon30-backup.log"
echo "• Frequency: Every 5 minutes"
echo "• Supabase URL: $SUPABASE_URL"
echo ""
echo "🔍 To monitor backups:"
echo "tail -f /var/log/rekon30-backup.log"
echo ""
echo "📝 To view cron jobs:"
echo "crontab -l"
echo ""
echo "🗑️ To remove cron job:"
echo "crontab -e  # Then delete the line with rekon30-backup-cron.sh"
