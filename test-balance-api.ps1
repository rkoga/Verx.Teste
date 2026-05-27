# Script para testar a API de Balanco (Balance API)
# Data: 27/05/2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Balance API Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Funcao para fazer requisicoes HTTP
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [int]$TimeoutSec = 30
    )
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $jsonBody -ContentType "application/json" -TimeoutSec $TimeoutSec -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -TimeoutSec $TimeoutSec -ErrorAction Stop
        }
        return @{Success=$true; Data=$response}
    } catch {
        return @{Success=$false; Error=$_.Exception.Message; StatusCode=$_.Exception.Response.StatusCode.value__}
    }
}

# Funcao para exibir resultado
function Show-Result {
    param(
        [object]$Result,
        [string]$TestName
    )
    
    if ($Result.Success) {
        Write-Host "[OK] $TestName" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[ERRO] $TestName" -ForegroundColor Red
        Write-Host "  Erro: $($Result.Error)" -ForegroundColor Gray
        if ($Result.StatusCode) {
            Write-Host "  Status Code: $($Result.StatusCode)" -ForegroundColor Gray
        }
        return $false
    }
}

$baseUrl = "http://localhost:3003"
$transactionsUrl = "http://localhost:3001"
$testsPassed = 0
$testsFailed = 0

# Teste 1: Health Check do Reporting Service
Write-Host "[1/7] Verificando Health do Reporting Service..." -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/health"

if (Show-Result -Result $result -TestName "Health Check") {
    Write-Host "  Status: $($result.Data.status)" -ForegroundColor Gray
    Write-Host "  Timestamp: $($result.Data.timestamp)" -ForegroundColor Gray
    $testsPassed++
} else {
    $testsFailed++
    Write-Host ""
    Write-Host "ERRO: Reporting Service nao esta respondendo!" -ForegroundColor Red
    Write-Host "Execute: .\start-all-services.ps1" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
Write-Host ""

# Criar algumas transacoes de teste primeiro
Write-Host "[2/7] Criando transacoes de teste..." -ForegroundColor Yellow

$transactions = @(
    @{
        idempotencyKey = [guid]::NewGuid().ToString()
        amount = 1000.00
        type = "CREDIT"
        date = (Get-Date -Format "yyyy-MM-dd")
        description = "Venda inicial - Teste Balance API"
    },
    @{
        idempotencyKey = [guid]::NewGuid().ToString()
        amount = 250.50
        type = "DEBIT"
        date = (Get-Date -Format "yyyy-MM-dd")
        description = "Despesa operacional - Teste Balance API"
    },
    @{
        idempotencyKey = [guid]::NewGuid().ToString()
        amount = 500.00
        type = "CREDIT"
        date = (Get-Date -Format "yyyy-MM-dd")
        description = "Recebimento - Teste Balance API"
    }
)

$transactionsCreated = 0
foreach ($tx in $transactions) {
    $result = Invoke-ApiRequest -Method "POST" -Url "$transactionsUrl/api/v1/transactions" -Body $tx
    if ($result.Success) {
        $transactionsCreated++
        Write-Host "  [OK] Transacao criada: $($tx.type) R$ $($tx.amount)" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] Erro ao criar transacao: $($result.Error)" -ForegroundColor Red
    }
}

Write-Host "  Total criadas: $transactionsCreated de $($transactions.Count)" -ForegroundColor Cyan
if ($transactionsCreated -gt 0) {
    $testsPassed++
} else {
    $testsFailed++
}
Write-Host ""

# Buscar transacoes do dia para consolidacao
Write-Host "[3/8] Buscando transacoes do dia..." -ForegroundColor Yellow
$today = Get-Date -Format "yyyy-MM-dd"
$result = Invoke-ApiRequest -Method "GET" -Url "$transactionsUrl/api/v1/transactions?startDate=$today&endDate=$today"

$transactionsForConsolidation = @()
if ($result.Success -and $result.Data.data) {
    $transactionsForConsolidation = $result.Data.data | ForEach-Object {
        # Ensure date is in correct format
        $txDate = if ($_.transactionDate -match '^\d{4}-\d{2}-\d{2}') {
            $_.transactionDate.Substring(0, 10)
        } else {
            $today
        }
        @{
            amount = [decimal]$_.amount
            type = $_.type
            date = $txDate
        }
    }
    Write-Host "  Transacoes encontradas: $($transactionsForConsolidation.Count)" -ForegroundColor Gray
    Write-Host "  Exemplo de transacao: amount=$($transactionsForConsolidation[0].amount), type=$($transactionsForConsolidation[0].type), date=$($transactionsForConsolidation[0].date)" -ForegroundColor Gray
} else {
    Write-Host "  Nenhuma transacao encontrada para consolidar" -ForegroundColor Yellow
}
Write-Host ""

# Consolidar o balanco
Write-Host "[4/8] Consolidando balanco diario..." -ForegroundColor Yellow
$consolidationUrl = "http://localhost:3002"

$consolidationBody = @{
    transactions = $transactionsForConsolidation
}

$result = Invoke-ApiRequest -Method "POST" -Url "$consolidationUrl/api/v1/consolidation/trigger/$today" -Body $consolidationBody

if (Show-Result -Result $result -TestName "Consolidacao de Balanco") {
    Write-Host "  Data consolidada: $today" -ForegroundColor Gray
    if ($result.Data.data) {
        Write-Host "  Saldo Inicial: R$ $($result.Data.data.openingBalance)" -ForegroundColor Gray
        Write-Host "  Total Creditos: R$ $($result.Data.data.totalCredits)" -ForegroundColor Gray
        Write-Host "  Total Debitos: R$ $($result.Data.data.totalDebits)" -ForegroundColor Gray
        Write-Host "  Saldo Final: R$ $($result.Data.data.closingBalance)" -ForegroundColor Cyan
    }
    $testsPassed++
} else {
    Write-Host "  AVISO: Consolidacao falhou, mas continuando testes..." -ForegroundColor Yellow
    $testsFailed++
}
Write-Host ""

# Aguardar processamento
Write-Host "  Aguardando processamento (2 segundos)..." -ForegroundColor Gray
Start-Sleep -Seconds 2

# Teste 5: Obter Balanco Diario (Data Especifica)
Write-Host "[5/8] Testando GET /api/v1/reports/balance/:date" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/api/v1/reports/balance/$today"

if (Show-Result -Result $result -TestName "Obter Balanco Diario") {
    Write-Host "  Data: $($result.Data.data.date)" -ForegroundColor Gray
    Write-Host "  Saldo Inicial: R$ $($result.Data.data.openingBalance)" -ForegroundColor Gray
    Write-Host "  Total Creditos: R$ $($result.Data.data.totalCredits)" -ForegroundColor Gray
    Write-Host "  Total Debitos: R$ $($result.Data.data.totalDebits)" -ForegroundColor Gray
    Write-Host "  Saldo Final: R$ $($result.Data.data.closingBalance)" -ForegroundColor Cyan
    $testsPassed++
} else {
    $testsFailed++
}
Write-Host ""

# Teste 6: Obter Historico de Balanco
Write-Host "[6/8] Testando GET /api/v1/reports/balance/history" -ForegroundColor Yellow
$startDate = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
$endDate = (Get-Date).ToString("yyyy-MM-dd")
$result = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/api/v1/reports/balance/history?startDate=$startDate&endDate=$endDate"

if (Show-Result -Result $result -TestName "Obter Historico de Balanco") {
    $historyCount = $result.Data.data.Count
    Write-Host "  Periodo: $startDate a $endDate" -ForegroundColor Gray
    Write-Host "  Registros encontrados: $historyCount" -ForegroundColor Gray
    
    if ($result.Data.summary) {
        Write-Host "  Resumo do Periodo:" -ForegroundColor Cyan
        Write-Host "    - Saldo Inicial: R$ $($result.Data.summary.openingBalance)" -ForegroundColor Gray
        Write-Host "    - Total Creditos: R$ $($result.Data.summary.totalCredits)" -ForegroundColor Gray
        Write-Host "    - Total Debitos: R$ $($result.Data.summary.totalDebits)" -ForegroundColor Gray
        Write-Host "    - Saldo Final: R$ $($result.Data.summary.closingBalance)" -ForegroundColor Gray
        Write-Host "    - Variacao: R$ $($result.Data.summary.netChange)" -ForegroundColor Gray
    }
    
    if ($historyCount -gt 0) {
        Write-Host "  Ultimos 3 dias:" -ForegroundColor Cyan
        $result.Data.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - $($_.date): R$ $($_.closingBalance)" -ForegroundColor Gray
        }
    }
    $testsPassed++
} else {
    $testsFailed++
}
Write-Host ""

# Teste 7: Obter Dados para Grafico
Write-Host "[7/8] Testando GET /api/v1/reports/balance/chart" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/api/v1/reports/balance/chart?startDate=$startDate&endDate=$endDate"

if (Show-Result -Result $result -TestName "Obter Dados para Grafico") {
    $chartDataCount = $result.Data.data.Count
    Write-Host "  Pontos de dados: $chartDataCount" -ForegroundColor Gray
    
    if ($chartDataCount -gt 0) {
        Write-Host "  Amostra de dados (primeiros 3):" -ForegroundColor Cyan
        $result.Data.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - $($_.date):" -ForegroundColor Gray
            Write-Host "      Balance: R$ $($_.balance)" -ForegroundColor Gray
            Write-Host "      Credits: R$ $($_.credits)" -ForegroundColor Gray
            Write-Host "      Debits: R$ $($_.debits)" -ForegroundColor Gray
        }
    }
    $testsPassed++
} else {
    $testsFailed++
}
Write-Host ""

# Teste 8: Teste de Validacao - Data Invalida
Write-Host "[8/8] Testando validacao - Data invalida" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/api/v1/reports/balance/invalid-date"

if (-not $result.Success) {
    Write-Host "[OK] Validacao funcionando corretamente (erro esperado)" -ForegroundColor Green
    Write-Host "  Status Code: $($result.StatusCode)" -ForegroundColor Gray
    $testsPassed++
} else {
    Write-Host "[ERRO] Validacao nao funcionou (deveria retornar erro)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Teste 9: Teste de Validacao - Parametros Faltando
Write-Host "[9/9] Testando validacao - Parametros faltando" -ForegroundColor Yellow
$result = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/api/v1/reports/balance/history"

if (-not $result.Success -or $result.Data.success -eq $false) {
    Write-Host "[OK] Validacao funcionando corretamente (erro esperado)" -ForegroundColor Green
    if ($result.Data.message) {
        Write-Host "  Mensagem: $($result.Data.message)" -ForegroundColor Gray
    }
    $testsPassed++
} else {
    Write-Host "[ERRO] Validacao nao funcionou (deveria retornar erro)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# Resumo dos Testes
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumo dos Testes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = $testsPassed + $testsFailed
$successRate = [math]::Round(($testsPassed / $totalTests) * 100, 2)

Write-Host "Total de Testes: $totalTests" -ForegroundColor White
Write-Host "Testes Passados: $testsPassed" -ForegroundColor Green
Write-Host "Testes Falhados: $testsFailed" -ForegroundColor Red
Write-Host "Taxa de Sucesso: $successRate%" -ForegroundColor Cyan
Write-Host ""

# Endpoints Disponiveis
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Endpoints da Balance API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Balanco Diario:" -ForegroundColor Yellow
Write-Host "   GET $baseUrl/api/v1/reports/balance/:date" -ForegroundColor Gray
Write-Host "   Exemplo: $baseUrl/api/v1/reports/balance/$today" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Historico de Balanco:" -ForegroundColor Yellow
Write-Host "   GET $baseUrl/api/v1/reports/balance/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD" -ForegroundColor Gray
Write-Host "   Exemplo: $baseUrl/api/v1/reports/balance/history?startDate=$startDate&endDate=$endDate" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Dados para Grafico:" -ForegroundColor Yellow
Write-Host "   GET $baseUrl/api/v1/reports/balance/chart?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD" -ForegroundColor Gray
Write-Host "   Exemplo: $baseUrl/api/v1/reports/balance/chart?startDate=$startDate&endDate=$endDate" -ForegroundColor Gray
Write-Host ""

# Exemplos de uso com curl
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Exemplos com cURL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Obter balanco de hoje:" -ForegroundColor Yellow
Write-Host "curl http://localhost:3003/api/v1/reports/balance/$today" -ForegroundColor Gray
Write-Host ""
Write-Host "# Obter historico dos ultimos 7 dias:" -ForegroundColor Yellow
Write-Host "curl 'http://localhost:3003/api/v1/reports/balance/history?startDate=$startDate&endDate=$endDate'" -ForegroundColor Gray
Write-Host ""
Write-Host "# Obter dados para grafico:" -ForegroundColor Yellow
Write-Host "curl 'http://localhost:3003/api/v1/reports/balance/chart?startDate=$startDate&endDate=$endDate'" -ForegroundColor Gray
Write-Host ""

# Links Uteis
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Links Uteis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Reporting Service Health: http://localhost:3003/health" -ForegroundColor Gray
Write-Host "Consolidation Service:    http://localhost:3002/api/v1/health" -ForegroundColor Gray
Write-Host "Transactions Service:     http://localhost:3001/api/v1/health" -ForegroundColor Gray
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "Todos os testes passaram com sucesso!" -ForegroundColor Green
} else {
    Write-Host "Alguns testes falharam. Verifique os logs acima." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Made with Bob
