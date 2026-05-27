# Run Frontend Script
# This script starts the Angular development server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Cash Flow Frontend Application" -ForegroundColor Cyan
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

# Start the development server
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "The application will be available at: http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm start

# Made with Bob
