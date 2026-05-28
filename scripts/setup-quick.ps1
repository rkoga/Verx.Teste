# Quick Setup Script - Cash Flow System
# Configura bancos de dados e dependências rapidamente

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quick Setup - Cash Flow System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Função para executar comando em diretório
function Invoke-InDirectory {
    param(
        [string]$Path,
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "  → $Description" -ForegroundColor Cyan
    $originalLocation = Get-Location
    try {
        Set-Location $Path
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Sucesso" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  ⚠ Aviso: Exit code $LASTEXITCODE" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "  ✗ Erro: $_" -ForegroundColor Red
        return $false
    } finally {
        Set-Location $originalLocation
    }
}

# 1. Verificar Docker
Write-Host "[1/4] Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker rodando" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker não está rodando!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Instalar dependências e gerar Prisma Clients
Write-Host "[2/4] Instalando dependências..." -ForegroundColor Yellow

Invoke-InDirectory "services/transactions" "npm install --silent" "Transactions Service"
Invoke-InDirectory "services/transactions" "npx prisma generate" "Prisma Client (Transactions)"

Invoke-InDirectory "services/consolidation" "npm install --silent" "Consolidation Service"
Invoke-InDirectory "services/consolidation" "npx prisma generate" "Prisma Client (Consolidation)"

Invoke-InDirectory "services/reporting" "npm install --silent" "Reporting Service"
Invoke-InDirectory "services/reporting" "npx prisma generate" "Prisma Client (Reporting)"

Write-Host ""

# 3. Executar migrações
Write-Host "[3/4] Executando migrações..." -ForegroundColor Yellow

Invoke-InDirectory "services/transactions" "npx prisma migrate deploy" "Transactions DB"
Invoke-InDirectory "services/consolidation" "npx prisma migrate deploy" "Consolidation DB"
Invoke-InDirectory "services/reporting" "npx prisma migrate deploy" "Reporting DB"

Write-Host ""

# 4. Verificar status
Write-Host "[4/4] Verificando configuração..." -ForegroundColor Yellow

$services = @("transactions", "consolidation", "reporting")
foreach ($service in $services) {
    if (Test-Path "services/$service/.env") {
        Write-Host "  ✓ .env encontrado em $service" -ForegroundColor Green
    } else {
        Write-Host "  ✗ .env não encontrado em $service" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Concluído!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute: .\start-all-services.ps1" -ForegroundColor White
Write-Host "  2. Ou inicie manualmente:" -ForegroundColor White
Write-Host "     cd services/transactions; npm run dev" -ForegroundColor Gray
Write-Host "     cd services/consolidation; npm run dev" -ForegroundColor Gray
Write-Host "     cd services/reporting; npm run dev" -ForegroundColor Gray
Write-Host ""
