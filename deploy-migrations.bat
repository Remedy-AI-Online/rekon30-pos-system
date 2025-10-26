@echo off
echo.
echo ========================================
echo   DEPLOY MIGRATIONS - Quick Start
echo ========================================
echo.
echo This will open the migration tool in your browser
echo.
pause
start apply-business-details-migration.html
echo.
echo ✅ Migration tool opened!
echo.
echo Follow these steps:
echo   1. Enter your Supabase URL and Service Role Key
echo   2. Click "Step 1: Add Columns & Enable RLS"
echo   3. Click "Step 2: Update Approval Function"
echo   4. Click "Step 3: Test Migration"
echo.
echo Alternatively, you can run migrations manually in Supabase Dashboard:
echo   1. Go to SQL Editor in Supabase Dashboard
echo   2. Copy/paste contents of: supabase\migrations\028_add_business_details_and_fix_rls.sql
echo   3. Click Run
echo   4. Copy/paste contents of: supabase\migrations\029_update_approval_function.sql
echo   5. Click Run
echo.
pause

