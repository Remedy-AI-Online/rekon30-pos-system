@echo off
echo ========================================
echo Clear Admin and Cashier Data
echo ========================================
echo.
echo WARNING: This will delete ALL admin and cashier data!
echo Super Admin data will remain intact.
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo ========================================
echo Step 1: Clear Authentication
echo ========================================
echo.

REM Check if service role key is set
if "%SUPABASE_SERVICE_ROLE_KEY%"=="" (
    echo ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set!
    echo.
    echo Please set it first:
    echo    set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
    echo.
    echo Get your service role key from:
    echo    https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api
    echo.
    pause
    exit /b 1
)

echo Running authentication cleanup...
node clear-admin-cashier-auth.js

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Authentication cleanup failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Step 2: Clear Database Data
echo ========================================
echo.
echo Running database cleanup...

supabase db execute -f clear-admin-cashier-data.sql

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Database cleanup failed!
    echo.
    echo You may need to run the SQL manually in Supabase Dashboard.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo All admin and cashier data has been removed.
echo Super Admin data remains intact.
echo.
echo You can now:
echo - Create new businesses via Super Admin
echo - Allow new businesses to sign up
echo - Import fresh data
echo.
pause

