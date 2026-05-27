# Script para iniciar todos os serviços do Cash Flow System
# Autor: Bob - AI Software Engineer
# Data: 26/05/2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cash Flow System - Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar se porta está em uso
function Test-PortInUse {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $null -ne $connection
    } catch {
        return $false
    }
}

# Verificar se Docker está rodando
Write-Host "[1/7] Verificando Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "OK Docker esta rodando" -ForegroundColor Green
} catch {
    Write-Host "ERRO Docker nao esta rodando!" -ForegroundColor Red
    Write-Host "Por favor, inicie o Docker Desktop e execute este script novamente." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verificar se os containers estão rodando
Write-Host "[2/7] Verificando containers de infraestrutura..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}"

if ($containers -match "postgres") {
    Write-Host "OK Containers PostgreSQL encontrados" -ForegroundColor Green
} else {
    Write-Host "AVISO Containers PostgreSQL nao encontrados" -ForegroundColor Yellow
    Write-Host "Iniciando infraestrutura com docker-compose..." -ForegroundColor Yellow
    docker-compose up -d
    Start-Sleep -Seconds 10
    Write-Host "OK Infraestrutura iniciada" -ForegroundColor Green
}

Write-Host ""

# Verificar portas necessárias
Write-Host "[3/7] Verificando disponibilidade de portas..." -ForegroundColor Yellow

$requiredPorts = @(
    @{Port=3001; Service="Transactions"},
    @{Port=3002; Service="Consolidation"},
    @{Port=3003; Service="Reporting"}
)

$portsInUse = @()
foreach ($portInfo in $requiredPorts) {
    if (Test-PortInUse -Port $portInfo.Port) {
        Write-Host "ERRO Porta $($portInfo.Port) ($($portInfo.Service)) ja esta em uso!" -ForegroundColor Red
        $portsInUse += $portInfo.Port
    } else {
        Write-Host "OK Porta $($portInfo.Port) ($($portInfo.Service)) disponivel" -ForegroundColor Green
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host ""
    Write-Host "AVISO Portas em uso detectadas. Libere as portas ou pare os servicos existentes." -ForegroundColor Yellow
    Write-Host "Execute: Get-Process -Id (Get-NetTCPConnection -LocalPort PORTA).OwningProcess" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Deseja continuar mesmo assim? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne "S" -and $response -ne "s") {
        Write-Host "Operacao cancelada pelo usuario." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""

# Verificar arquivos .env
Write-Host "[4/7] Verificando arquivos de configuracao..." -ForegroundColor Yellow

$envFiles = @(
    "services/transactions/.env",
    "services/consolidation/.env",
    "services/reporting/.env"
)

$missingEnv = @()
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "OK $envFile encontrado" -ForegroundColor Green
    } else {
        Write-Host "ERRO $envFile nao encontrado" -ForegroundColor Red
        $missingEnv += $envFile
    }
}

if ($missingEnv.Count -gt 0) {
    Write-Host ""
    Write-Host "AVISO Arquivos .env faltando. Criando arquivos padrao..." -ForegroundColor Yellow
    
    # Criar .env para Transactions
    if ($missingEnv -contains "services/transactions/.env") {
        $envContent = @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transactions?schema=public"
PORT=3001
NODE_ENV=development
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
REDIS_URL="redis://localhost:6379"
LOG_LEVEL=debug
"@
        $envPath = Join-Path $PWD "services/transactions/.env"
        [System.IO.File]::WriteAllText($envPath, $envContent, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "OK Criado services/transactions/.env" -ForegroundColor Green
    }
    
    # Criar .env para Consolidation
    if ($missingEnv -contains "services/consolidation/.env") {
        $envContent = @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/consolidation?schema=public"
PORT=3002
NODE_ENV=development
RABBITMQ_URL="amqp://guest:guest@localhost:5672"
REDIS_URL="redis://localhost:6379"
LOG_LEVEL=debug
"@
        $envPath = Join-Path $PWD "services/consolidation/.env"
        [System.IO.File]::WriteAllText($envPath, $envContent, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "OK Criado services/consolidation/.env" -ForegroundColor Green
    }
    
    # Criar .env para Reporting
    if ($missingEnv -contains "services/reporting/.env") {
        $envContent = @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reporting?schema=public"
PORT=3003
NODE_ENV=development
REDIS_URL="redis://localhost:6379"
LOG_LEVEL=debug
"@
        $envPath = Join-Path $PWD "services/reporting/.env"
        [System.IO.File]::WriteAllText($envPath, $envContent, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "OK Criado services/reporting/.env" -ForegroundColor Green
    }
}

Write-Host ""

# Aguardar bancos de dados estarem prontos
Write-Host "[5/7] Aguardando bancos de dados ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "OK Bancos de dados prontos" -ForegroundColor Green

Write-Host ""

# Verificar se as migrações foram executadas
Write-Host "[6/7] Verificando migracoes do banco de dados..." -ForegroundColor Yellow
Write-Host "AVISO Execute as migracoes manualmente se necessario:" -ForegroundColor Yellow
Write-Host "  cd services/transactions; npx prisma migrate dev --name init" -ForegroundColor Gray
Write-Host "  cd services/consolidation; npx prisma migrate dev --name init" -ForegroundColor Gray
Write-Host "  cd services/reporting; npx prisma migrate dev --name init" -ForegroundColor Gray

Write-Host ""

# Iniciar serviços
Write-Host "[7/7] Iniciando servicos..." -ForegroundColor Yellow
Write-Host ""

$currentPath = $PWD.Path

Write-Host "Iniciando Transactions Service (porta 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$currentPath\services\transactions'; Write-Host 'Transactions Service' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Iniciando Consolidation Service (porta 3002)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$currentPath\services\consolidation'; Write-Host 'Consolidation Service' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Iniciando Reporting Service (porta 3003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$currentPath\services\reporting'; Write-Host 'Reporting Service' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Todos os servicos foram iniciados!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aguarde alguns segundos para os servicos iniciarem completamente..." -ForegroundColor Yellow
Write-Host ""
Write-Host "URLs dos servicos:" -ForegroundColor Cyan
Write-Host "  - Transactions:   http://localhost:3001" -ForegroundColor White
Write-Host "  - Consolidation:  http://localhost:3002" -ForegroundColor White
Write-Host "  - Reporting:      http://localhost:3003" -ForegroundColor White
Write-Host ""
Write-Host "Health Checks:" -ForegroundColor Cyan
Write-Host "  - curl http://localhost:3001/health" -ForegroundColor Gray
Write-Host "  - curl http://localhost:3002/health" -ForegroundColor Gray
Write-Host "  - curl http://localhost:3003/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Swagger Docs:" -ForegroundColor Cyan
Write-Host "  - http://localhost:3001/api-docs" -ForegroundColor Gray
Write-Host "  - http://localhost:3002/api-docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Observabilidade:" -ForegroundColor Cyan
Write-Host "  - Prometheus:  http://localhost:9090" -ForegroundColor Gray
Write-Host "  - Grafana:     http://localhost:3000 (admin/admin)" -ForegroundColor Gray
Write-Host "  - RabbitMQ:    http://localhost:15672 (guest/guest)" -ForegroundColor Gray
Write-Host "  - Jaeger:      http://localhost:16686" -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

