# Script to check if balance data exists in the database
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Checking Balance Data in Database" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$today = Get-Date -Format "yyyy-MM-dd"

Write-Host "Checking for date: $today" -ForegroundColor Yellow
Write-Host ""

# Check consolidation database
Write-Host "1. Checking Consolidation Database..." -ForegroundColor Yellow
try {
    $query = "SELECT * FROM daily_balance WHERE date::date = '$today'::date;"
    $result = docker exec verxteste-consolidation-db-1 psql -U cashflow -d consolidation -c "$query" 2>&1
    Write-Host $result -ForegroundColor Gray
} catch {
    Write-Host "Error checking consolidation DB: $_" -ForegroundColor Red
}
Write-Host ""

# Check reporting database
Write-Host "2. Checking Reporting Database..." -ForegroundColor Yellow
try {
    $query = "SELECT * FROM daily_balance_read_model WHERE date::date = '$today'::date;"
    $result = docker exec verxteste-reporting-db-1 psql -U cashflow -d reporting -c "$query" 2>&1
    Write-Host $result -ForegroundColor Gray
} catch {
    Write-Host "Error checking reporting DB: $_" -ForegroundColor Red
}
Write-Host ""

# Check all dates in reporting database
Write-Host "3. All dates in Reporting Database..." -ForegroundColor Yellow
try {
    $query = "SELECT date, \"closingBalance\", \"transactionCount\" FROM daily_balance_read_model ORDER BY date DESC LIMIT 5;"
    $result = docker exec verxteste-reporting-db-1 psql -U cashflow -d reporting -c "$query" 2>&1
    Write-Host $result -ForegroundColor Gray
} catch {
    Write-Host "Error checking reporting DB: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnostic complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Made with Bob
