# Quick deployment script - Run this with your service key
param(
    [Parameter(Mandatory=$false)]
    [string]$ServiceRoleKey
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       DEPLOYING MIGRATIONS TO SUPABASE                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$SUPABASE_URL = "https://cddoboboxeangripcqrn.supabase.co"

# Get service key if not provided
if (-not $ServiceRoleKey) {
    $SecureKey = Read-Host "Enter your Supabase Service Role Key" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureKey)
    $ServiceRoleKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

Write-Host "🔑 Service key received" -ForegroundColor Green
Write-Host ""

# Function to execute SQL using psql connection string
function Invoke-SupabaseSQL {
    param([string]$SQLFile, [string]$Description)
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "📄 $Description" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    if (-not (Test-Path $SQLFile)) {
        Write-Host "❌ File not found: $SQLFile" -ForegroundColor Red
        return $false
    }
    
    $sql = Get-Content $SQLFile -Raw
    
    # Try using Supabase Management API
    $headers = @{
        "apikey" = $ServiceRoleKey
        "Authorization" = "Bearer $ServiceRoleKey"
        "Content-Type" = "application/json"
    }
    
    # Split SQL into statements
    $statements = $sql -split ";" | Where-Object { 
        $_.Trim() -ne "" -and 
        $_.Trim() -notmatch "^--" -and
        $_.Trim() -notmatch "^DO \$\$" -and
        $_.Trim().Length -gt 10
    }
    
    Write-Host "📊 Found $($statements.Count) SQL statements to execute" -ForegroundColor Yellow
    Write-Host ""
    
    $successCount = 0
    $errorCount = 0
    
    foreach ($statement in $statements) {
        $trimmed = $statement.Trim()
        if ($trimmed.Length -eq 0) { continue }
        
        # Show preview
        $preview = $trimmed.Substring(0, [Math]::Min(70, $trimmed.Length))
        Write-Host "  ▶ $preview..." -ForegroundColor Gray
        
        # For now, we'll count them as prepared
        # Actual execution requires pgAdmin or SQL Editor access
        $successCount++
    }
    
    Write-Host ""
    Write-Host "✅ $successCount statements prepared and ready" -ForegroundColor Green
    Write-Host ""
    
    return $true
}

# Deploy Migration 028
Write-Host ""
$result1 = Invoke-SupabaseSQL -SQLFile "RUN_THIS_IN_SUPABASE_SQL_EDITOR.sql" -Description "Migration 028: Add Business Details & Enable RLS"

if ($result1) {
    Write-Host "✅ Migration 028 prepared successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Migration 028 failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Deploy Migration 029
$result2 = Invoke-SupabaseSQL -SQLFile "RUN_THIS_SECOND_IN_SUPABASE_SQL_EDITOR.sql" -Description "Migration 029: Update Approval Function"

if ($result2) {
    Write-Host "✅ Migration 029 prepared successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Migration 029 failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANT: Final Step Required" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Supabase doesn't allow DDL commands (ALTER TABLE, CREATE POLICY)" -ForegroundColor White
Write-Host "via REST API for security reasons." -ForegroundColor White
Write-Host ""
Write-Host "YOU MUST run these SQL files in Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to: https://supabase.com/dashboard/project/cddoboboxeangripcqrn/sql/new" -ForegroundColor Cyan
Write-Host "2. Copy contents of: RUN_THIS_IN_SUPABASE_SQL_EDITOR.sql" -ForegroundColor Cyan
Write-Host "3. Paste and click 'Run'" -ForegroundColor Cyan
Write-Host "4. Copy contents of: RUN_THIS_SECOND_IN_SUPABASE_SQL_EDITOR.sql" -ForegroundColor Cyan
Write-Host "5. Paste and click 'Run'" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Would you like me to open the SQL Editor for you? (Y/N): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Start-Process "https://supabase.com/dashboard/project/cddoboboxeangripcqrn/sql/new"
    Write-Host "✅ Opening Supabase SQL Editor..." -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 SQL files are ready in this folder for copy-paste" -ForegroundColor Cyan
Write-Host ""

