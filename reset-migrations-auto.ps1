# Reset Migrations - Cash Flow System (Automatico)
# Script para resetar e recriar migracoes do zero SEM confirmacao

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reset de Migracoes Prisma (AUTO)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Executando reset automatico dos bancos de dados..." -ForegroundColor Yellow
Write-Host ""

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
            Write-Host "  AVISO $Description (Exit: $LASTEXITCODE)" -ForegroundColor Yellow
            return $true
        }
    } catch {
        Write-Host "  ERRO $Description : $_" -ForegroundColor Red
        return $false
    } finally {
        Set-Location $originalLocation
    }
}

Write-Host "[1/4] Removendo diretorios de migracoes antigas..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    "services/transactions",
    "services/consolidation",
    "services/reporting"
)

foreach ($service in $services) {
    $migrationsPath = "$service/prisma/migrations"
    if (Test-Path $migrationsPath) {
        Write-Host "  Removendo $migrationsPath..." -ForegroundColor Gray
        Remove-Item -Path $migrationsPath -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "[2/4] Resetando bancos de dados (DROP + CREATE)..." -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    $serviceName = Split-Path $service -Leaf
    Invoke-InDirectory $service {
        npx prisma migrate reset --force --skip-seed
    } "$serviceName - Reset DB"
}

Write-Host ""
Write-Host "[3/4] Gerando Prisma Clients..." -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    $serviceName = Split-Path $service -Leaf
    Invoke-InDirectory $service {
        npx prisma generate
    } "$serviceName - Generate Client"
}

Write-Host ""
Write-Host "[4/4] Verificando status..." -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    $serviceName = Split-Path $service -Leaf
    Invoke-InDirectory $service {
        npx prisma migrate status
    } "$serviceName - Status"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reset Concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Os bancos de dados foram recriados do zero." -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute: .\rebuild-all.ps1" -ForegroundColor White
Write-Host "  2. Ou inicie os servicos: .\start-all-services.ps1" -ForegroundColor White
Write-Host ""
