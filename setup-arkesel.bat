@echo off
echo ================================================
echo   Arkesel SMS Integration Setup - Rekon360
echo ================================================
echo.

echo Step 1: Setting Arkesel API Key in Supabase Secrets...
echo.
npx supabase secrets set ARKESEL_API_KEY=a2p6RlpOd1RrYkRaTU1NdFJKS3U
echo.

if %errorlevel% neq 0 (
    echo [ERROR] Failed to set secret. Make sure you're logged in to Supabase.
    echo Run: npx supabase login
    pause
    exit /b 1
)

echo [SUCCESS] API Key set successfully!
echo.
echo Step 2: Deploying backend with SMS functionality...
echo.
npx supabase functions deploy make-server-86b98184
echo.

if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy backend.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Next Steps:
echo 1. Login as Cashier
echo 2. Make a sale
echo 3. Click "SMS Receipt"
echo 4. Enter your phone: 024XXXXXXX
echo 5. Check your phone for the SMS!
echo.
echo Cost: ~4 pesewas per SMS
echo Sender ID: Rekon360 (make sure it's approved by Arkesel)
echo.
pause
