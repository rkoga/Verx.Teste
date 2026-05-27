# Build All Services - Cash Flow System
# Este script compila todos os microservicos do sistema

$ErrorActionPreference = "Stop"

Write-Host "[BUILD] Cash Flow System - Build Completo" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# Funcao para exibir status
function Show-Status {
    param($message, $type = "info")
    $color = switch ($type) {
        "success" { "Green" }
        "error" { "Red" }
        "warning" { "Yellow" }
        default { "Cyan" }
    }
    Write-Host $message -ForegroundColor $color
}

# Funcao para build de servico
function Build-Service {
    param($name, $path)
    
    Write-Host ""
    Write-Host "[*] Building $name..." -ForegroundColor Cyan
    Write-Host "   Path: $path" -ForegroundColor Gray
    
    try {
        Push-Location $path
        
        # Instalar dependencias
        Write-Host "   > Installing dependencies..." -ForegroundColor Gray
        npm install --silent 2>&1 | Out-Null
        
        # Gerar Prisma Client (se existir)
        if (Test-Path "prisma/schema.prisma") {
            Write-Host "   > Generating Prisma Client..." -ForegroundColor Gray
            npx prisma generate 2>&1 | Out-Null
        }
        
        # Build TypeScript
        Write-Host "   > Compiling TypeScript..." -ForegroundColor Gray
        npm run build 2>&1 | Out-Null
        
        Show-Status "   [OK] $name built successfully!" "success"
        Pop-Location
        return $true
    }
    catch {
        Show-Status "   [FAIL] $name build failed: $_" "error"
        Pop-Location
        return $false
    }
}

# Array para rastrear resultados
$results = @()

# Build Shared Module
$results += @{
    Name = "Shared Module"
    Success = (Build-Service "Shared Module" "shared")
}

# Build Transactions Service
$results += @{
    Name = "Transactions Service"
    Success = (Build-Service "Transactions Service" "services/transactions")
}

# Build Consolidation Service
$results += @{
    Name = "Consolidation Service"
    Success = (Build-Service "Consolidation Service" "services/consolidation")
}

# Build Reporting Service
$results += @{
    Name = "Reporting Service"
    Success = (Build-Service "Reporting Service" "services/reporting")
}

# Resumo
Write-Host ""
Write-Host "[*] Build Summary" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($result in $results) {
    if ($result.Success) {
        Show-Status "[OK] $($result.Name)" "success"
        $successCount++
    } else {
        Show-Status "[FAIL] $($result.Name)" "error"
        $failCount++
    }
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "[TIME] Total Time: $($duration.TotalSeconds) seconds" -ForegroundColor Cyan
Write-Host "[OK] Success: $successCount" -ForegroundColor Green
Write-Host "[FAIL] Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Show-Status "[SUCCESS] All services built successfully!" "success"
    Write-Host ""
    Write-Host "[NEXT] Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Start infrastructure: docker-compose up -d postgres redis rabbitmq"
    Write-Host "  2. Run migrations for each service"
    Write-Host "  3. Start services: npm run dev (in each service directory)"
    Write-Host ""
    exit 0
} else {
    Show-Status "[WARNING] Some services failed to build. Check errors above." "warning"
    exit 1
}

# Made with Bob
