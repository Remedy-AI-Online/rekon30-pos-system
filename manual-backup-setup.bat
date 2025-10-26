@echo off
echo 🚀 Rekon30 Manual Backup Setup
echo.

REM Get Supabase details
set /p SUPABASE_URL="Enter your Supabase Project URL: "
set /p SERVICE_ROLE_KEY="Enter your Supabase Service Role Key: "

echo.
echo Creating backup script...

REM Create the backup script
(
echo @echo off
echo REM Rekon30 Automated Backup Script
echo set TIMESTAMP=%%date%% %%time%%
echo echo [%%TIMESTAMP%%] Starting Rekon30 backup process... ^>^> C:\temp\rekon30-backup.log
echo.
echo curl -s -X POST "%SUPABASE_URL%/functions/v1/cron-backup" ^
echo   -H "Authorization: Bearer %SERVICE_ROLE_KEY%" ^
echo   -H "Content-Type: application/json" ^
echo   -w "HTTPSTATUS:%%{http_code}" ^
echo   -o C:\temp\rekon30-backup-response.json
echo.
echo if %%errorlevel%% neq 0 ^(
echo     echo [%%TIMESTAMP%%] ❌ curl command failed ^>^> C:\temp\rekon30-backup.log
echo     exit /b 1
echo ^)
echo.
echo for /f "tokens=2 delims=:" %%a in ^('findstr "HTTPSTATUS" C:\temp\rekon30-backup-response.json'^) do set HTTP_STATUS=%%a
echo.
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

echo.
echo 📅 Creating Windows Task Scheduler job...

REM Create Windows Task Scheduler job
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
) else (
    echo ❌ Failed to create Windows Task Scheduler job
    echo Please run this script as Administrator
)

echo.
echo Press any key to continue...
pause >nul
