# Reporting Service - Database Setup Script (PowerShell)
# Este script configura o banco de dados do Reporting Service

$ErrorActionPreference = "Stop"

Write-Host "🚀 Reporting Service - Database Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Erro: Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "Criando arquivo .env com configurações padrão..." -ForegroundColor Yellow
    
    $envContent = @"
# Server Configuration
PORT=3003
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://cashflow:cashflow123@localhost:5432/reporting_db

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
"@
    # UTF8 without BOM for better compatibility
    [System.IO.File]::WriteAllText("$PWD/.env", $envContent, (New-Object System.Text.UTF8Encoding $false))
    
    Write-Host "✅ Arquivo .env criado!" -ForegroundColor Green
}

Write-Host "📋 Configurações:" -ForegroundColor Cyan
Write-Host "  - Database: reporting_db"
Write-Host "  - Host: localhost:5432"
Write-Host "  - User: cashflow"
Write-Host ""

# Step 1: Check if PostgreSQL is running
Write-Host "1️⃣  Verificando PostgreSQL..." -ForegroundColor Cyan

# Função compatível com PowerShell 5.1 e 7+
function Test-PostgresConnection {
    param([int]$Port = 5432)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", $Port)
        $tcpClient.Close()
        return $true
    } catch {
        return $false
    }
}

$originalLocation = Get-Location

try {
    if (Test-PostgresConnection -Port 5432) {
        Write-Host "✅ PostgreSQL está rodando" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL não está rodando!" -ForegroundColor Yellow
        Write-Host "   Iniciando com Docker Compose..." -ForegroundColor Yellow
        Set-Location ../..
        docker-compose up -d postgres
        Set-Location $originalLocation
        Write-Host "   Aguardando PostgreSQL iniciar..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Write-Host "✅ PostgreSQL iniciado" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Erro ao verificar PostgreSQL: $_" -ForegroundColor Yellow
} finally {
    Set-Location $originalLocation
}
Write-Host ""

# Step 2: Create database if not exists
Write-Host "2️⃣  Criando banco de dados 'reporting_db'..." -ForegroundColor Cyan

# Usar Docker exec ao invés de psql local (mais confiável)
try {
    # Verificar se container postgres existe
    $containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "postgres"
    
    if ($containerExists) {
        # Tentar criar banco usando Docker exec
        $result = docker exec postgres-reporting psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'reporting_db'" 2>&1
        
        if ($result -notmatch "1") {
            docker exec postgres-reporting psql -U postgres -c "CREATE DATABASE reporting_db;" 2>&1 | Out-Null
            Write-Host "✅ Banco de dados criado" -ForegroundColor Green
        } else {
            Write-Host "✅ Banco de dados já existe" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  Container PostgreSQL não encontrado. Execute docker-compose primeiro." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Não foi possível verificar/criar o banco via Docker." -ForegroundColor Yellow
    Write-Host "   Tentando método alternativo..." -ForegroundColor Gray
    
    # Fallback: tentar com psql se disponível
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        try {
            $env:PGPASSWORD = "postgres"
            psql -h localhost -U postgres -d postgres -c "CREATE DATABASE reporting_db;" 2>&1 | Out-Null
            Write-Host "✅ Banco de dados criado (método alternativo)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Execute manualmente: CREATE DATABASE reporting_db;" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  psql não encontrado. Continuando..." -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 3: Generate Prisma Client
Write-Host "3️⃣  Gerando Prisma Client..." -ForegroundColor Cyan
npx prisma generate
Write-Host "✅ Prisma Client gerado" -ForegroundColor Green
Write-Host ""

# Step 4: Run migrations
Write-Host "4️⃣  Executando migrations..." -ForegroundColor Cyan
npx prisma migrate dev --name init
Write-Host "✅ Migrations executadas" -ForegroundColor Green
Write-Host ""

# Step 5: Verify tables
Write-Host "5️⃣  Verificando tabelas criadas..." -ForegroundColor Cyan
try {
    # Tentar via Docker primeiro
    $containerExists = docker ps --format "{{.Names}}" | Select-String -Pattern "postgres"
    
    if ($containerExists) {
        docker exec postgres-reporting psql -U postgres -d reporting_db -c "\dt"
    } elseif (Get-Command psql -ErrorAction SilentlyContinue) {
        # Fallback para psql local
        $env:PGPASSWORD = "postgres"
        psql -h localhost -U postgres -d reporting_db -c "\dt"
    } else {
        Write-Host "⚠️  Não foi possível listar tabelas" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Erro ao listar tabelas: $_" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "🎉 Setup concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Iniciar o serviço: npm run dev"
Write-Host "  2. Testar health check: curl http://localhost:3003/api/v1/health"
Write-Host "  3. Abrir Prisma Studio: npx prisma studio"
Write-Host ""

# Made with Bob
