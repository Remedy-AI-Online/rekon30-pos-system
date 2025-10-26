# Rekon30 Backend System Documentation

## 🏗️ Architecture Overview

The Rekon30 backend is built on **Supabase** with a comprehensive set of Edge Functions for business management, automated backups, real-time updates, and analytics.

## 📁 System Components

### 🔧 Core Functions

#### 1. **Backup System** (`backup-system`)
- **Purpose**: Automated backup creation for individual businesses
- **Trigger**: Manual or scheduled
- **Data**: Full business data (products, customers, workers, sales, payments)
- **Storage**: Supabase Storage bucket `business-backups`
- **Frequency**: Every 5 minutes per business

#### 2. **Backup Scheduler** (`backup-scheduler`)
- **Purpose**: Orchestrates backups for all active businesses
- **Trigger**: Cron job every 5 minutes
- **Process**: Calls backup-system for each business
- **Monitoring**: Logs success/failure for each business

#### 3. **Data Restore** (`data-restore`)
- **Purpose**: Restore lost data from backups
- **Types**: Full restore or selective restore
- **Process**: Downloads backup file and restores data
- **Security**: Super admin verification required

#### 4. **Payment Verification** (`payment-verification`)
- **Purpose**: Manual payment verification system
- **Process**: Verifies payment amount against plan pricing
- **Updates**: Business payment status and next payment date
- **Real-time**: Broadcasts payment events to dashboard

#### 5. **Analytics** (`analytics`)
- **Purpose**: Comprehensive analytics for dashboard
- **Types**: Overview, business-specific, revenue, growth
- **Data**: Real-time metrics and trends
- **Performance**: Optimized queries with caching

#### 6. **API Security** (`api-security`)
- **Purpose**: API key management and rate limiting
- **Features**: Key validation, permission checking, usage tracking
- **Rate Limits**: Configurable per API key
- **Monitoring**: Detailed usage logs

#### 7. **Real-time Events** (`realtime-events`)
- **Purpose**: Real-time dashboard updates
- **Events**: Business updates, payments, backups, system events
- **Broadcasting**: Supabase Realtime channels
- **Integration**: Frontend real-time subscriptions

#### 8. **Cron Backup** (`cron-backup`)
- **Purpose**: Scheduled backup execution
- **Frequency**: Every 5 minutes
- **Process**: Triggers backup-scheduler for all businesses
- **Monitoring**: System-wide backup status

## 🗄️ Database Schema

### Core Tables
- **businesses**: Business management and status
- **business_features**: Feature flags per business
- **payment_records**: Payment tracking and verification
- **super_admins**: Super admin user management
- **system_settings**: Configurable system parameters

### Backup Tables
- **backup_records**: Backup metadata and status
- **restore_requests**: Data restore requests and status
- **realtime_events**: Real-time event logging

### API Management
- **api_keys**: Third-party integration keys
- **api_usage_logs**: API usage tracking and monitoring

## 🔐 Security Features

### Row Level Security (RLS)
- All tables protected with RLS policies
- Super admin access to all data
- Business-specific data isolation

### API Security
- API key validation
- Rate limiting (configurable per key)
- Permission-based access control
- Usage monitoring and logging

### Data Protection
- Automated backups every 5 minutes
- Encrypted storage in Supabase Storage
- Secure data restore process
- Audit trails for all operations

## 🚀 Deployment

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy Functions
```bash
# Run the deployment script
node deploy-backend-functions.js

# Or deploy individually
supabase functions deploy backup-system
supabase functions deploy backup-scheduler
supabase functions deploy data-restore
supabase functions deploy api-security
supabase functions deploy realtime-events
supabase functions deploy payment-verification
supabase functions deploy analytics
supabase functions deploy cron-backup
```

### Database Migrations
```bash
# Push migrations to database
supabase db push

# Or run specific migration
supabase db push --include-all
```

## ⚙️ Configuration

### Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### Cron Job Setup
```bash
# Add to crontab (runs every 5 minutes)
*/5 * * * * curl -X POST "https://your-project.supabase.co/functions/v1/cron-backup" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### API Key Management
```sql
-- Create system-wide API key
INSERT INTO api_keys (key_name, key_value, business_id, permissions, rate_limit)
VALUES (
  'System Integration',
  'sk_' || substr(md5(random()::text), 1, 32),
  NULL,
  '["analytics", "backup_status"]'::jsonb,
  1000
);
```

## 📊 Monitoring & Analytics

### Real-time Dashboard Updates
- New business registrations
- Payment verifications
- Backup completions
- System status changes

### Analytics Endpoints
- `/analytics?type=overview` - System overview
- `/analytics?type=business&business_id=xxx` - Business-specific
- `/analytics?type=revenue` - Revenue analytics
- `/analytics?type=growth` - Growth metrics

### Backup Monitoring
- Automated backup status
- Failed backup alerts
- Storage usage tracking
- Restore request monitoring

## 🔄 Data Flow

### Backup Process
1. **Trigger**: Cron job every 5 minutes
2. **Collection**: Gather all business data
3. **Storage**: Save to Supabase Storage
4. **Recording**: Log backup metadata
5. **Notification**: Real-time dashboard update

### Payment Verification
1. **Manual Entry**: Super admin enters payment details
2. **Validation**: Check amount against plan pricing
3. **Recording**: Create payment record
4. **Update**: Update business payment status
5. **Notification**: Real-time dashboard update

### Data Restore
1. **Request**: Super admin initiates restore
2. **Download**: Retrieve backup file
3. **Restore**: Update business data
4. **Verification**: Confirm restore completion
5. **Notification**: Real-time dashboard update

## 🛠️ API Endpoints

### Backup System
```bash
POST /functions/v1/backup-system
{
  "business_id": "uuid",
  "backup_type": "full|incremental|manual"
}
```

### Data Restore
```bash
POST /functions/v1/data-restore
{
  "business_id": "uuid",
  "backup_id": "uuid",
  "restore_type": "full|selective"
}
```

### Payment Verification
```bash
POST /functions/v1/payment-verification
{
  "business_id": "uuid",
  "payment_amount": 200.00,
  "payment_method": "bank_transfer",
  "payment_reference": "TXN123456",
  "verified_by": "admin_uuid"
}
```

### Analytics
```bash
GET /functions/v1/analytics?type=overview
GET /functions/v1/analytics?type=business&business_id=uuid
GET /functions/v1/analytics?type=revenue
GET /functions/v1/analytics?type=growth
```

## 🔧 Maintenance

### Regular Tasks
- Monitor backup success rates
- Check API usage and rate limits
- Review restore requests
- Update system settings

### Troubleshooting
- Check function logs in Supabase dashboard
- Monitor storage usage in Supabase Storage
- Review API usage logs for anomalies
- Verify cron job execution

## 📈 Scalability

### Current Capacity
- **Businesses**: 1-5 businesses (as requested)
- **Backups**: Every 5 minutes per business
- **API Calls**: 1000/hour per API key
- **Storage**: 50MB per backup file

### Future Scaling
- Increase backup frequency as needed
- Add more API key permissions
- Implement backup compression
- Add backup retention policies

## 🆘 Support

### Common Issues
1. **Backup Failures**: Check business data integrity
2. **API Rate Limits**: Increase rate limit or create new key
3. **Restore Issues**: Verify backup file integrity
4. **Real-time Updates**: Check Supabase Realtime connection

### Debugging
- Check function logs in Supabase dashboard
- Review database logs for errors
- Monitor API usage patterns
- Verify cron job execution

---

**Built with ❤️ for Rekon30 Business Management System**
