# Script simplificado para testar API de Consolidacao
# Sem caracteres especiais que causam problemas no PowerShell

Write-Host "========================================"
Write-Host "  Consolidation API Testing"
Write-Host "========================================"
Write-Host ""

# Funcao para fazer requisicoes HTTP
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null
    )
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -ContentType "application/json" -TimeoutSec 30 -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -TimeoutSec 30 -ErrorAction Stop
        }
        return @{Success=$true; Data=$response}
    } catch {
        return @{Success=$false; Error=$_.Exception.Message}
    }
}

# TESTE 1: Health Checks
Write-Host "[1/6] Verificando Health Checks..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{Name="Transactions"; Url="http://localhost:3001/api/v1/health"},
    @{Name="Consolidation"; Url="http://localhost:3002/api/v1/health"},
    @{Name="Reporting"; Url="http://localhost:3003/health"}
)

$allHealthy = $true
foreach ($service in $services) {
    Write-Host "  -> $($service.Name)..." -ForegroundColor Cyan
    $result = Invoke-ApiRequest -Method "GET" -Url $service.Url
    
    if ($result.Success) {
        Write-Host "  OK" -ForegroundColor Green
    } else {
        Write-Host "  ERRO: $($result.Error)" -ForegroundColor Red
        $allHealthy = $false
    }
}

Write-Host ""

if (-not $allHealthy) {
    Write-Host "Alguns servicos nao estao rodando!" -ForegroundColor Yellow
    Write-Host "Execute: .\start-all-services.ps1" -ForegroundColor Gray
    exit 1
}

# TESTE 2: Criar Transacoes de Teste
Write-Host "[2/6] Criando Transacoes de Teste..." -ForegroundColor Yellow
Write-Host ""

$today = Get-Date -Format "yyyy-MM-dd"

$transactions = @(
    @{
        idempotencyKey = [guid]::NewGuid().ToString()
        amount = 1000.00
        type = "CREDIT"
        date = $today
        description = "Venda - Teste Consolidacao 1"
    },
    @{
        idempotencyKey = [guid]::NewGuid().ToString()
        amount = 500.50
        type = "CREDIT"
        date = $today
        description = "Venda - Teste Consolidacao 2"
    },
    @{
        idempotencyKey = [guid]::NewGuid().ToString()
        amount = 300.25
        type = "DEBIT"
        date = $today
        description = "Despesa - Teste Consolidacao 1"
    },
    @{
        idempotencyKey = [guid]::NewGuid().ToString()
        amount = 150.75
        type = "DEBIT"
        date = $today
        description = "Despesa - Teste Consolidacao 2"
    }
)

$createdCount = 0
foreach ($tx in $transactions) {
    $result = Invoke-ApiRequest -Method "POST" -Url "http://localhost:3001/api/v1/transactions" -Body $tx
    
    if ($result.Success) {
        Write-Host "  OK: $($tx.type) R$ $($tx.amount)" -ForegroundColor Green
        $createdCount++
    } else {
        Write-Host "  ERRO: $($result.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Total criadas: $createdCount" -ForegroundColor Cyan
Write-Host ""

# Aguardar processamento
Write-Host "Aguardando processamento..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# TESTE 3: Buscar Saldo do Dia
Write-Host "[3/6] Testando GET /balance/:date..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Buscando saldo de $today..." -ForegroundColor Cyan
$result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:3002/api/v1/consolidation/balance/$today"

if ($result.Success) {
    Write-Host "  OK - Saldo encontrado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Detalhes do Saldo:" -ForegroundColor Cyan
    Write-Host "    Data: $($result.Data.date)"
    Write-Host "    Saldo Inicial: R$ $($result.Data.openingBalance)"
    Write-Host "    Total Creditos: R$ $($result.Data.totalCredits)" -ForegroundColor Green
    Write-Host "    Total Debitos: R$ $($result.Data.totalDebits)" -ForegroundColor Red
    Write-Host "    Saldo Final: R$ $($result.Data.closingBalance)" -ForegroundColor Cyan
    Write-Host "    Transacoes: $($result.Data.transactionCount)"
    
    # Validar calculos
    $expectedClosing = $result.Data.openingBalance + $result.Data.totalCredits - $result.Data.totalDebits
    if ([Math]::Abs($expectedClosing - $result.Data.closingBalance) -lt 0.01) {
        Write-Host "    Calculo correto!" -ForegroundColor Green
    } else {
        Write-Host "    ERRO no calculo!" -ForegroundColor Red
    }
} else {
    Write-Host "  Saldo nao encontrado (normal se consolidacao nao rodou)" -ForegroundColor Yellow
    Write-Host "  Erro: $($result.Error)" -ForegroundColor Gray
}

Write-Host ""

# TESTE 4: Buscar Historico (sem query params por enquanto)
Write-Host "[4/6] Testando GET /balance (historico)..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Buscando historico..." -ForegroundColor Cyan
$result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:3002/api/v1/consolidation/balance"

if ($result.Success) {
    $balances = $result.Data
    Write-Host "  OK - Historico encontrado!" -ForegroundColor Green
    Write-Host "    Total de dias: $($balances.Count)"
    
    if ($balances.Count -gt 0) {
        Write-Host "  Ultimos saldos:"
        $balances | Select-Object -First 5 | ForEach-Object {
            Write-Host "    $($_.date): R$ $($_.closingBalance)"
        }
    }
} else {
    Write-Host "  Erro: $($result.Error)" -ForegroundColor Red
}

Write-Host ""

# TESTE 5: Buscar Resumo (sem query params por enquanto)
Write-Host "[5/6] Testando GET /summary..." -ForegroundColor Yellow
Write-Host ""

Write-Host "  Buscando resumo..." -ForegroundColor Cyan
$result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:3002/api/v1/consolidation/summary"

if ($result.Success) {
    Write-Host "  OK - Resumo obtido!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Resumo do Periodo:"
    Write-Host "    Total Creditos: R$ $($result.Data.totalCredits)" -ForegroundColor Green
    Write-Host "    Total Debitos: R$ $($result.Data.totalDebits)" -ForegroundColor Red
    Write-Host "    Variacao Liquida: R$ $($result.Data.netChange)" -ForegroundColor Cyan
    Write-Host "    Dias com Dados: $($result.Data.daysCount)"
} else {
    Write-Host "  Erro: $($result.Error)" -ForegroundColor Red
}

Write-Host ""

# TESTE 6: Testar Casos de Erro
Write-Host "[6/6] Testando Casos de Erro..." -ForegroundColor Yellow
Write-Host ""

# Data invalida
Write-Host "  6.1 - Testando data invalida..." -ForegroundColor Cyan
$result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:3002/api/v1/consolidation/balance/invalid-date"

if (-not $result.Success) {
    Write-Host "    OK - Erro esperado retornado" -ForegroundColor Green
} else {
    Write-Host "    AVISO - Deveria retornar erro" -ForegroundColor Yellow
}

# Data futura
Write-Host "  6.2 - Testando data futura..." -ForegroundColor Cyan
$futureDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
$result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:3002/api/v1/consolidation/balance/$futureDate"

if (-not $result.Success) {
    Write-Host "    OK - 404 Not Found retornado" -ForegroundColor Green
} else {
    Write-Host "    AVISO - Resposta inesperada" -ForegroundColor Yellow
}

Write-Host ""

# RESUMO FINAL
Write-Host "========================================"
Write-Host "  Testes Concluidos!"
Write-Host "========================================"
Write-Host ""

Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "  - Health checks verificados"
Write-Host "  - Transacoes de teste criadas"
Write-Host "  - Endpoints de consolidacao testados"
Write-Host ""

Write-Host "URLs Uteis:" -ForegroundColor Cyan
Write-Host "  - Swagger: http://localhost:3002/api-docs"
Write-Host "  - Prisma Studio: cd services/consolidation && npx prisma studio"
Write-Host ""

Write-Host "Proximos Passos:" -ForegroundColor Cyan
Write-Host "  1. Verificar dados no Prisma Studio"
Write-Host "  2. Testar consolidacao automatica (aguardar 1 hora)"
Write-Host "  3. Verificar logs em services/consolidation/"
Write-Host ""

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Made with Bob
