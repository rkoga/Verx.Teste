# Build Frontend Script
# This script builds the Angular frontend application for production

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Cash Flow Frontend Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to the frontend directory
$frontendPath = Join-Path $PSScriptRoot "cash-flow-app"

if (-not (Test-Path $frontendPath)) {
    Write-Host "Error: Frontend directory not found at $frontendPath" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Build the application
Write-Host ""
Write-Host "Building application for production..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Build output location: $frontendPath\dist\cash-flow-app" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Build failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}

# Made with Bob
