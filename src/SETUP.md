# Latex Foam Shop Management System - Setup Instructions

## First-Time Setup: Create Admin Account

Before you can use the system, you need to create an admin account. Follow these steps:

### Option 1: Using Browser Console (Recommended)

1. Open your application in a web browser
2. Press `F12` to open Developer Tools
3. Go to the "Console" tab
4. Copy and paste the following code, replacing the email and password with your own:

```javascript
const setupAdmin = async () => {
  const response = await fetch(
    'https://cddoboboxeangripcqrn.supabase.co/functions/v1/make-server-86b98184/auth/create-admin',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZG9ib2JveGVhbmdyaXBjcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NTgyNTQsImV4cCI6MjA3NTMzNDI1NH0.JS5pdOsT8xocAIA9uPYnWsoE0FwChKJ1jfOIObJRpEo'
      },
      body: JSON.stringify({
        email: 'uncle@latexfoam.com',        // Change this to your email
        password: 'SecurePassword123!',       // Change this to your secure password
        name: 'Uncle Manager'                 // Change this to your name
      })
    }
  );
  const data = await response.json();
  console.log('Admin account created:', data);
};
setupAdmin();
```

4. Press Enter to run the code
5. You should see a success message in the console
6. Now you can log in with your email and password!

### Important Notes

- **Keep your credentials safe!** Write down your email and password in a secure location.
- The password must be at least 6 characters long.
- After creating your admin account, you can log in and start adding workers and creating cashier logins.

## How the System Works

### Admin Workflow:

1. **Login** as admin using your email and password
2. **Add Workers** in the Workers & Cashiers section
3. **Create Cashier Logins** for workers who need POS access
   - The system auto-generates: Shop ID, Cashier ID, and Password
   - You'll see these credentials only once - copy them and give to the cashier
4. **Manage Shops** through the admin dashboard
5. **View Reports** - Filter by shop, cashier, daily/weekly/monthly
6. **Download Reports** as Excel files

### Cashier Workflow:

1. **Login** using credentials provided by admin:
   - Shop ID (e.g., SHOP001)
   - Cashier ID (e.g., CSH123456)  
   - Password (auto-generated)
2. **Record Sales** in the POS system
3. **Print Receipts**
4. **View Daily Reports**

### Admin Capabilities:

- ✅ View all shops in real-time
- ✅ Monitor cashier activity and last login times
- ✅ Deactivate/Activate cashier accounts
- ✅ Reset cashier passwords
- ✅ Transfer cashiers between shops
- ✅ Generate and download Excel reports
- ✅ Receive real-time notifications for new sales
- ✅ Track profit margins by product and time period

## Troubleshooting

**Can't log in as admin?**
- Make sure you've run the setup script above
- Check that you're using the correct email and password
- The email must be the same one you used in the setup script

**Need to reset admin password?**
- Contact the system administrator or re-run the setup script with a new password

**Cashier can't log in?**
- Make sure the admin has created a cashier login for that worker
- Check that the account is marked as "Active" in the Cashiers tab
- Verify all credentials are entered correctly (Shop ID, Cashier ID, Password)

## Support

For additional help or questions, refer to the system documentation or contact your system administrator.
