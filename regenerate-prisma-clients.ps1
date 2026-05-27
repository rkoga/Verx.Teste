# Script para regenerar Prisma Clients após remoção do merchant_id
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Regenerando Prisma Clients" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Consolidation Service
Write-Host "1. Regenerando Prisma Client - Consolidation Service..." -ForegroundColor Yellow
Set-Location services/consolidation
try {
    npx prisma generate
    Write-Host "✓ Consolidation Prisma Client gerado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao gerar Consolidation Prisma Client: $_" -ForegroundColor Red
}
Write-Host ""

# Reporting Service
Write-Host "2. Regenerando Prisma Client - Reporting Service..." -ForegroundColor Yellow
Set-Location ../reporting
try {
    npx prisma generate
    Write-Host "✓ Reporting Prisma Client gerado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao gerar Reporting Prisma Client: $_" -ForegroundColor Red
}
Write-Host ""

# Voltar ao diretório raiz
Set-Location ../..

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Prisma Clients regenerados!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximo passo: Criar migrations" -ForegroundColor Yellow
Write-Host "Execute: .\create-migrations.ps1" -ForegroundColor Yellow

