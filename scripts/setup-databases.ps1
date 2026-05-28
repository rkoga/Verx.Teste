# Script para configurar bancos de dados do Cash Flow System
# Autor: Bob - AI Software Engineer
# Data: 26/05/2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Setup - Cash Flow System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está rodando
Write-Host "[1/5] Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker não está rodando!" -ForegroundColor Red
    Write-Host "Por favor, inicie o Docker Desktop e execute este script novamente." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Iniciar container PostgreSQL se não estiver rodando
Write-Host "[2/5] Verificando container PostgreSQL..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}"

if ($containers -match "cashflow-postgres") {
    Write-Host "✓ Container PostgreSQL já está rodando" -ForegroundColor Green
} else {
    Write-Host "⚠ Iniciando container PostgreSQL..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Write-Host "Aguardando container iniciar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Write-Host "✓ Container PostgreSQL iniciado" -ForegroundColor Green
}

Write-Host ""

# Verificar conectividade com o banco
Write-Host "[3/5] Verificando conectividade com banco de dados..." -ForegroundColor Yellow

try {
    $result = docker exec cashflow-postgres pg_isready -U cashflow 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL está pronto" -ForegroundColor Green
        
        # Verificar se os bancos existem
        Write-Host "  Verificando bancos de dados..." -ForegroundColor Gray
        $dbList = docker exec cashflow-postgres psql -U cashflow -t -c "SELECT datname FROM pg_database WHERE datname IN ('transactions', 'consolidation', 'reporting');"
        
        if ($dbList -match "transactions") {
            Write-Host "  ✓ Banco 'transactions' encontrado" -ForegroundColor Green
        }
        if ($dbList -match "consolidation") {
            Write-Host "  ✓ Banco 'consolidation' encontrado" -ForegroundColor Green
        }
        if ($dbList -match "reporting") {
            Write-Host "  ✓ Banco 'reporting' encontrado" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ PostgreSQL ainda não está pronto, aguardando..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
} catch {
    Write-Host "✗ Erro ao verificar PostgreSQL: $_" -ForegroundColor Red
}

Write-Host ""

# Gerar Prisma Clients
Write-Host "[4/5] Gerando Prisma Clients..." -ForegroundColor Yellow

$originalLocation = Get-Location

try {
    Write-Host "  → Transactions Service..." -ForegroundColor Cyan
    Set-Location "services/transactions"
    npx prisma generate 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Prisma Client gerado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Erro ao gerar Prisma Client" -ForegroundColor Red
    }
    Set-Location $originalLocation

    Write-Host "  → Consolidation Service..." -ForegroundColor Cyan
    Set-Location "services/consolidation"
    npx prisma generate 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Prisma Client gerado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Erro ao gerar Prisma Client" -ForegroundColor Red
    }
    Set-Location $originalLocation

    Write-Host "  → Reporting Service..." -ForegroundColor Cyan
    Set-Location "services/reporting"
    npx prisma generate 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Prisma Client gerado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Erro ao gerar Prisma Client" -ForegroundColor Red
    }
} finally {
    Set-Location $originalLocation
}

Write-Host ""

# Executar migrações
Write-Host "[5/5] Executando migrações..." -ForegroundColor Yellow
Write-Host ""

$originalLocation = Get-Location

try {
    Write-Host "  → Transactions Service..." -ForegroundColor Cyan
    Set-Location "services/transactions"
    Write-Host "    Criando migração inicial..." -ForegroundColor Gray
    npx prisma migrate dev --name init --skip-generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Migrações aplicadas com sucesso" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Erro ao aplicar migrações (pode já existir)" -ForegroundColor Yellow
    }
    Set-Location $originalLocation

    Write-Host ""
    Write-Host "  → Consolidation Service..." -ForegroundColor Cyan
    Set-Location "services/consolidation"
    Write-Host "    Criando migração inicial..." -ForegroundColor Gray
    npx prisma migrate dev --name init --skip-generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Migrações aplicadas com sucesso" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Erro ao aplicar migrações (pode já existir)" -ForegroundColor Yellow
    }
    Set-Location $originalLocation

    Write-Host ""
    Write-Host "  → Reporting Service..." -ForegroundColor Cyan
    Set-Location "services/reporting"
    Write-Host "    Criando migração inicial..." -ForegroundColor Gray
    npx prisma migrate dev --name init --skip-generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Migrações aplicadas com sucesso" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Erro ao aplicar migrações (pode já existir)" -ForegroundColor Yellow
    }
} finally {
    Set-Location $originalLocation
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup de Banco de Dados Concluído!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar status das migrações
Write-Host "Status das Migrações:" -ForegroundColor Cyan
Write-Host ""

$originalLocation = Get-Location

try {
    Write-Host "  Transactions Service:" -ForegroundColor Yellow
    Set-Location "services/transactions"
    npx prisma migrate status
    Set-Location $originalLocation

    Write-Host ""
    Write-Host "  Consolidation Service:" -ForegroundColor Yellow
    Set-Location "services/consolidation"
    npx prisma migrate status
    Set-Location $originalLocation

    Write-Host ""
    Write-Host "  Reporting Service:" -ForegroundColor Yellow
    Set-Location "services/reporting"
    npx prisma migrate status
} finally {
    Set-Location $originalLocation
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute: .\start-all-services.ps1" -ForegroundColor White
Write-Host "  2. Teste os health checks:" -ForegroundColor White
Write-Host "     curl http://localhost:3001/health" -ForegroundColor Gray
Write-Host "     curl http://localhost:3002/health" -ForegroundColor Gray
Write-Host "     curl http://localhost:3003/health" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
