# Reset Databases Script
# This script completely resets all databases by dropping and recreating them

Write-Host "========================================================" -ForegroundColor Red
Write-Host "   WARNING: This will DELETE ALL DATA!" -ForegroundColor Red
Write-Host "========================================================" -ForegroundColor Red
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Drop all databases (transactions, consolidation, reporting)" -ForegroundColor Yellow
Write-Host "  2. Recreate them" -ForegroundColor Yellow
Write-Host "  3. Run all migrations" -ForegroundColor Yellow
Write-Host ""
Write-Host "Type 'YES' (in uppercase) to continue: " -ForegroundColor Red -NoNewline
$confirmation = Read-Host

if ($confirmation -ne "YES") {
    Write-Host "Operation cancelled." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Resetting databases..." -ForegroundColor Yellow

# Drop and recreate databases using docker exec
Write-Host "Dropping and recreating databases..." -ForegroundColor Cyan

docker exec -i verx-postgres psql -U postgres -c "DROP DATABASE IF EXISTS transactions;"
docker exec -i verx-postgres psql -U postgres -c "DROP DATABASE IF EXISTS consolidation;"
docker exec -i verx-postgres psql -U postgres -c "DROP DATABASE IF EXISTS reporting;"

docker exec -i verx-postgres psql -U postgres -c "CREATE DATABASE transactions;"
docker exec -i verx-postgres psql -U postgres -c "CREATE DATABASE consolidation;"
docker exec -i verx-postgres psql -U postgres -c "CREATE DATABASE reporting;"

Write-Host "[OK] Databases recreated" -ForegroundColor Green

# Run migrations for each service
Write-Host ""
Write-Host "Running migrations..." -ForegroundColor Yellow

# Transactions
Write-Host "  - Transactions service..." -ForegroundColor Cyan
Push-Location services/transactions
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "[ERROR] Failed to migrate Transactions database" -ForegroundColor Red
    exit 1
}
Pop-Location
Write-Host "  [OK] Transactions database ready" -ForegroundColor Green

# Consolidation
Write-Host "  - Consolidation service..." -ForegroundColor Cyan
Push-Location services/consolidation
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "[ERROR] Failed to migrate Consolidation database" -ForegroundColor Red
    exit 1
}
Pop-Location
Write-Host "  [OK] Consolidation database ready" -ForegroundColor Green

# Reporting
Write-Host "  - Reporting service..." -ForegroundColor Cyan
Push-Location services/reporting
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "[ERROR] Failed to migrate Reporting database" -ForegroundColor Red
    exit 1
}
Pop-Location
Write-Host "  [OK] Reporting database ready" -ForegroundColor Green

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   All databases reset successfully!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

# Made with Bob
