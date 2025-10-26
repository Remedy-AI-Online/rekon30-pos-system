@echo off
REM Rekon30 Cron Job Setup Script for Windows
REM This script sets up automated backups every 5 minutes using Windows Task Scheduler

echo 🚀 Setting up Rekon30 Cron Jobs for Windows...

REM Get Supabase project details
set /p SUPABASE_URL="Enter your Supabase Project URL (e.g., https://your-project.supabase.co): "
set /p SERVICE_ROLE_KEY="Enter your Supabase Service Role Key: "

REM Validate inputs
if "%SUPABASE_URL%"=="" (
    echo ❌ Error: Supabase URL is required!
    pause
    exit /b 1
)
if "%SERVICE_ROLE_KEY%"=="" (
    echo ❌ Error: Service Role Key is required!
    pause
    exit /b 1
)

REM Create the backup script
echo Creating backup script...
(
echo @echo off
echo REM Rekon30 Automated Backup Script
echo REM Runs every 5 minutes to backup all businesses
echo.
echo set TIMESTAMP=%%date%% %%time%%
echo echo [%%TIMESTAMP%%] Starting Rekon30 backup process... ^>^> C:\temp\rekon30-backup.log
echo.
echo REM Call the backup scheduler function
echo curl -s -X POST "%SUPABASE_URL%/functions/v1/cron-backup" ^
echo   -H "Authorization: Bearer %SERVICE_ROLE_KEY%" ^
echo   -H "Content-Type: application/json" ^
echo   -w "HTTPSTATUS:%%{http_code}" ^
echo   -o C:\temp\rekon30-backup-response.json
echo.
echo REM Check if curl was successful
echo if %%errorlevel%% neq 0 ^(
echo     echo [%%TIMESTAMP%%] ❌ curl command failed ^>^> C:\temp\rekon30-backup.log
echo     exit /b 1
echo ^)
echo.
echo REM Extract HTTP status from response
echo for /f "tokens=2 delims=:" %%a in ^('findstr "HTTPSTATUS" C:\temp\rekon30-backup-response.json'^) do set HTTP_STATUS=%%a
echo.
echo REM Check response status
echo if %%HTTP_STATUS%%==200 ^(
echo     echo [%%TIMESTAMP%%] ✅ Backup completed successfully ^>^> C:\temp\rekon30-backup.log
echo ^) else ^(
echo     echo [%%TIMESTAMP%%] ❌ Backup failed with status: %%HTTP_STATUS%% ^>^> C:\temp\rekon30-backup.log
echo ^)
echo.
echo echo [%%TIMESTAMP%%] Backup process finished ^>^> C:\temp\rekon30-backup.log
echo del C:\temp\rekon30-backup-response.json
) > C:\temp\rekon30-backup-cron.bat

echo ✅ Backup script created: C:\temp\rekon30-backup-cron.bat

REM Create Windows Task Scheduler job
echo 📅 Creating Windows Task Scheduler job...

schtasks /create /tn "Rekon30-Backup" /tr "C:\temp\rekon30-backup-cron.bat" /sc minute /mo 5 /f

if %errorlevel% equ 0 (
    echo ✅ Windows Task Scheduler job created successfully!
    echo.
    echo 📋 Setup Summary:
    echo • Backup script: C:\temp\rekon30-backup-cron.bat
    echo • Log file: C:\temp\rekon30-backup.log
    echo • Frequency: Every 5 minutes
    echo • Supabase URL: %SUPABASE_URL%
    echo.
    echo 🔍 To monitor backups:
    echo type C:\temp\rekon30-backup.log
    echo.
    echo 📝 To view scheduled tasks:
    echo schtasks /query /tn "Rekon30-Backup"
    echo.
    echo 🗑️ To remove the scheduled task:
    echo schtasks /delete /tn "Rekon30-Backup" /f
) else (
    echo ❌ Failed to create Windows Task Scheduler job
    echo Please run this script as Administrator
)

pause
