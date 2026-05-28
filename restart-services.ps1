# Script to restart services after code changes
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Restarting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop all services
Write-Host "Stopping all services..." -ForegroundColor Yellow
docker-compose down
Write-Host ""

# Rebuild services
Write-Host "Rebuilding services..." -ForegroundColor Yellow
docker-compose build consolidation reporting
Write-Host ""

# Start services
Write-Host "Starting services..." -ForegroundColor Yellow
docker-compose up -d
Write-Host ""

# Wait for services to be ready
Write-Host "Waiting for services to be ready (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host ""

# Check health
Write-Host "Checking service health..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{Name="Transactions"; Url="http://localhost:3001/api/v1/health"},
    @{Name="Consolidation"; Url="http://localhost:3002/api/v1/health"},
    @{Name="Reporting"; Url="http://localhost:3003/health"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-RestMethod -Uri $service.Url -Method GET -TimeoutSec 5
        Write-Host "[OK] $($service.Name) is healthy" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] $($service.Name) is not responding" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Services restarted successfully!" -ForegroundColor Green
Write-Host "You can now run: .\test-balance-api.ps1" -ForegroundColor Cyan
Write-Host ""

# Made with Bob
