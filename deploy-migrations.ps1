# PowerShell script to deploy migrations via Supabase REST API

Write-Host "🚀 Supabase Migration Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SUPABASE_URL = "https://cddoboboxeangripcqrn.supabase.co"
$SUPABASE_SERVICE_KEY = Read-Host "Enter your Supabase Service Role Key" -AsSecureString
$SERVICE_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SUPABASE_SERVICE_KEY))

Write-Host ""
Write-Host "📋 Deployment Plan:" -ForegroundColor Yellow
Write-Host "  1. Migration 028: Add business details & enable RLS" -ForegroundColor White
Write-Host "  2. Migration 029: Update approval function" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with deployment? (y/n)"
if ($confirm -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Function to execute SQL via Supabase REST API
function Invoke-SupabaseSQL {
    param (
        [string]$SQL,
        [string]$MigrationName
    )
    
    Write-Host ""
    Write-Host "🔄 Running: $MigrationName" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    try {
        # Split SQL into individual statements (simplified)
        $statements = $SQL -split ";" | Where-Object { $_.Trim() -ne "" -and $_.Trim() -notmatch "^--" }
        
        $successCount = 0
        $errorCount = 0
        
        foreach ($statement in $statements) {
            $trimmedStatement = $statement.Trim()
            if ($trimmedStatement.Length -eq 0) { continue }
            
            # Show first 60 chars of statement
            $preview = $trimmedStatement.Substring(0, [Math]::Min(60, $trimmedStatement.Length))
            Write-Host "  Executing: $preview..." -ForegroundColor Gray
            
            # Note: Supabase REST API doesn't directly support SQL execution
            # This would need to be done via SQL Editor in dashboard
            # Or via pg_dump/restore tools
            
            $successCount++
        }
        
        Write-Host "  ✅ $successCount statements prepared" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
        return $false
    }
}

Write-Host ""
Write-Host "⚠️  IMPORTANT NOTE:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Supabase migrations should be run via:" -ForegroundColor White
Write-Host ""
Write-Host "Option 1: Supabase Dashboard SQL Editor (RECOMMENDED)" -ForegroundColor Cyan
Write-Host "  1. Go to: https://supabase.com/dashboard/project/cddoboboxeangripcqrn/sql/new" -ForegroundColor Gray
Write-Host "  2. Copy contents of: supabase\migrations\028_add_business_details_and_fix_rls.sql" -ForegroundColor Gray
Write-Host "  3. Paste and click 'Run'" -ForegroundColor Gray
Write-Host "  4. Repeat for: supabase\migrations\029_update_approval_function.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Use the HTML Tool" -ForegroundColor Cyan
Write-Host "  Open: apply-business-details-migration.html" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 3: Use Supabase CLI (if installed)" -ForegroundColor Cyan
Write-Host "  npx supabase db push" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$openHtml = Read-Host "Would you like to open the HTML migration tool? (y/n)"
if ($openHtml -eq "y") {
    $htmlPath = Join-Path $PSScriptRoot "apply-business-details-migration.html"
    if (Test-Path $htmlPath) {
        Start-Process $htmlPath
        Write-Host "✅ Opened migration tool in browser" -ForegroundColor Green
    } else {
        Write-Host "❌ HTML tool not found at: $htmlPath" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Manual Deployment Instructions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open Supabase Dashboard SQL Editor" -ForegroundColor White
Write-Host "2. Run Migration 028 (Add business details & RLS)" -ForegroundColor White
Write-Host "3. Run Migration 029 (Update approval function)" -ForegroundColor White
Write-Host "4. Test in your app" -ForegroundColor White
Write-Host ""
Write-Host "Migration files are in: supabase\migrations\" -ForegroundColor Gray
Write-Host ""

