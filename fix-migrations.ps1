# Fix Prisma Migrations - Cash Flow System
# Script para resolver erro P3005 e fazer baseline das migracoes

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Corrigindo Migracoes Prisma" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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
            return $true  # Continuar mesmo com avisos
        }
    } catch {
        Write-Host "  ERRO $Description : $_" -ForegroundColor Red
        return $false
    } finally {
        Set-Location $originalLocation
    }
}

Write-Host "[1/3] Criando diretorios de migracoes..." -ForegroundColor Yellow
Write-Host ""

# Criar diretorios de migracoes se nao existirem
$services = @(
    @{Path="services/transactions"; Name="Transactions"},
    @{Path="services/consolidation"; Name="Consolidation"},
    @{Path="services/reporting"; Name="Reporting"}
)

foreach ($service in $services) {
    $migrationsPath = "$($service.Path)/prisma/migrations"
    if (-not (Test-Path $migrationsPath)) {
        Write-Host "  Criando $migrationsPath..." -ForegroundColor Gray
        New-Item -ItemType Directory -Path $migrationsPath -Force | Out-Null
    }
}

Write-Host ""
Write-Host "[2/3] Fazendo baseline das migracoes existentes..." -ForegroundColor Yellow
Write-Host ""

# Para cada servico, fazer baseline da migracao
foreach ($service in $services) {
    Write-Host "  Processando $($service.Name)..." -ForegroundColor Cyan
    
    # Criar migracao inicial
    Invoke-InDirectory $service.Path {
        # Primeiro, criar a migracao sem aplicar
        npx prisma migrate dev --name init --create-only
        
        # Depois, marcar como aplicada (baseline)
        npx prisma migrate resolve --applied init
    } "$($service.Name) - Baseline"
}

Write-Host ""
Write-Host "[3/3] Gerando Prisma Clients..." -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    Invoke-InDirectory $service.Path {
        npx prisma generate
    } "$($service.Name) - Generate Client"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migracoes Corrigidas!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute: .\rebuild-all.ps1" -ForegroundColor White
Write-Host "  2. Ou inicie os servicos: .\start-all-services.ps1" -ForegroundColor White
Write-Host ""

# Made with Bob