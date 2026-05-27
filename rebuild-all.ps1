# Rebuild All Services - Cash Flow System
# Script completo para rebuild da solucao

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cash Flow System - Complete Rebuild" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# Funcao para executar comando em diretorio
function Invoke-InDirectory {
    param(
        [string]$Path,
        [scriptblock]$ScriptBlock,
        [string]$Description
    )
    
    Write-Host "  -> $Description" -ForegroundColor Cyan
    $originalLocation = Get-Location
    try {
        Set-Location $Path
        & $ScriptBlock
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Host "  OK $Description" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ERRO $Description (Exit: $LASTEXITCODE)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  ERRO $Description : $_" -ForegroundColor Red
        return $false
    } finally {
        Set-Location $originalLocation
    }
}

# 1. Limpar node_modules e builds anteriores
Write-Host "[1/5] Limpando builds anteriores..." -ForegroundColor Yellow
Write-Host ""

$services = @("shared", "services/transactions", "services/consolidation", "services/reporting")

foreach ($service in $services) {
    if (Test-Path "$service/node_modules") {
        Write-Host "  Removendo $service/node_modules..." -ForegroundColor Gray
        Remove-Item -Path "$service/node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "$service/dist") {
        Write-Host "  Removendo $service/dist..." -ForegroundColor Gray
        Remove-Item -Path "$service/dist" -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""

# 2. Instalar dependencias
Write-Host "[2/5] Instalando dependencias..." -ForegroundColor Yellow
Write-Host ""

$success = $true

$success = $success -and (Invoke-InDirectory "shared" { npm install } "Shared Module")
$success = $success -and (Invoke-InDirectory "services/transactions" { npm install } "Transactions Service")
$success = $success -and (Invoke-InDirectory "services/consolidation" { npm install } "Consolidation Service")
$success = $success -and (Invoke-InDirectory "services/reporting" { npm install } "Reporting Service")

if (-not $success) {
    Write-Host ""
    Write-Host "ERRO: Falha ao instalar dependencias!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Gerar Prisma Clients
Write-Host "[3/5] Gerando Prisma Clients..." -ForegroundColor Yellow
Write-Host ""

$success = $success -and (Invoke-InDirectory "services/transactions" { npx prisma generate } "Transactions Prisma")
$success = $success -and (Invoke-InDirectory "services/consolidation" { npx prisma generate } "Consolidation Prisma")
$success = $success -and (Invoke-InDirectory "services/reporting" { npx prisma generate } "Reporting Prisma")

Write-Host ""

# 4. Build TypeScript
Write-Host "[4/5] Compilando TypeScript..." -ForegroundColor Yellow
Write-Host ""

$success = $success -and (Invoke-InDirectory "shared" { npm run build } "Shared Module Build")
$success = $success -and (Invoke-InDirectory "services/transactions" { npm run build } "Transactions Build")
$success = $success -and (Invoke-InDirectory "services/consolidation" { npm run build } "Consolidation Build")
$success = $success -and (Invoke-InDirectory "services/reporting" { npm run build } "Reporting Build")

Write-Host ""

# 5. Executar migracoes
Write-Host "[5/5] Executando migracoes..." -ForegroundColor Yellow
Write-Host ""

Invoke-InDirectory "services/transactions" { npx prisma migrate deploy } "Transactions DB" | Out-Null
Invoke-InDirectory "services/consolidation" { npx prisma migrate deploy } "Consolidation DB" | Out-Null
Invoke-InDirectory "services/reporting" { npx prisma migrate deploy } "Reporting DB" | Out-Null

Write-Host ""

# Resumo
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Rebuild Concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tempo total: $($duration.TotalSeconds) segundos" -ForegroundColor Cyan
Write-Host ""

if ($success) {
    Write-Host "Status: SUCESSO" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Inicie os servicos: .\start-all-services.ps1" -ForegroundColor White
    Write-Host "  2. Ou manualmente em 3 terminais:" -ForegroundColor White
    Write-Host "     cd services/transactions; npm run dev" -ForegroundColor Gray
    Write-Host "     cd services/consolidation; npm run dev" -ForegroundColor Gray
    Write-Host "     cd services/reporting; npm run dev" -ForegroundColor Gray
    Write-Host ""
    exit 0
} else {
    Write-Host "Status: FALHA" -ForegroundColor Red
    Write-Host "Verifique os erros acima e tente novamente." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
