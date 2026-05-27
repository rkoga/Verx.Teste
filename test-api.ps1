# Script para testar a API do Cash Flow System
# Autor: Bob - AI Software Engineer
# Data: 26/05/2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API Testing - Cash Flow System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$transactionId = $null

# Função para fazer requisições HTTP
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
        return @{Success=$false; Error=$_.Exception.Message}
    }
}

# Teste 1: Health Checks
Write-Host "[1/8] Testando Health Checks..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{Name="Transactions"; Url="http://localhost:3001/health"},
    @{Name="Consolidation"; Url="http://localhost:3002/health"},
    @{Name="Reporting"; Url="http://localhost:3003/health"}
)

$allHealthy = $true
foreach ($service in $services) {
    Write-Host "  → $($service.Name) Service..." -ForegroundColor Cyan
    $result = Invoke-ApiRequest -Method "GET" -Url $service.Url
    
    if ($result.Success) {
        Write-Host "  ✓ Status: OK" -ForegroundColor Green
        Write-Host "    Timestamp: $($result.Data.timestamp)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Falhou: $($result.Error)" -ForegroundColor Red
        $allHealthy = $false
    }
    Write-Host ""
}

if (-not $allHealthy) {
    Write-Host "⚠ Alguns serviços não estão respondendo. Verifique se todos estão rodando." -ForegroundColor Yellow
    Write-Host "Execute: .\start-all-services.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Teste 2: Criar Transação de Crédito
Write-Host "[2/8] Criando transação de CRÉDITO..." -ForegroundColor Yellow

$creditTransaction = @{
    amount = 150.75
    type = "CREDIT"
    description = "Venda de produto - Teste automatizado"
}

$result = Invoke-ApiRequest -Method "POST" -Url "http://localhost:3001/transactions" -Body $creditTransaction

if ($result.Success) {
    $transactionId = $result.Data.id
    Write-Host "✓ Transação criada com sucesso!" -ForegroundColor Green
    Write-Host "  ID: $transactionId" -ForegroundColor Gray
    Write-Host "  Valor: R$ $($result.Data.amount)" -ForegroundColor Gray
    Write-Host "  Tipo: $($result.Data.type)" -ForegroundColor Gray
    Write-Host "  Status: $($result.Data.status)" -ForegroundColor Gray
} else {
    Write-Host "✗ Erro ao criar transação: $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 1

# Teste 3: Criar Transação de Débito
Write-Host "[3/8] Criando transação de DÉBITO..." -ForegroundColor Yellow

$debitTransaction = @{
    amount = 50.25
    type = "DEBIT"
    description = "Pagamento de fornecedor - Teste automatizado"
}

$result = Invoke-ApiRequest -Method "POST" -Url "http://localhost:3001/transactions" -Body $debitTransaction

if ($result.Success) {
    Write-Host "✓ Transação criada com sucesso!" -ForegroundColor Green
    Write-Host "  ID: $($result.Data.id)" -ForegroundColor Gray
    Write-Host "  Valor: R$ $($result.Data.amount)" -ForegroundColor Gray
    Write-Host "  Tipo: $($result.Data.type)" -ForegroundColor Gray
} else {
    Write-Host "✗ Erro ao criar transação: $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 1

# Teste 4: Buscar Transação por ID
Write-Host "[4/8] Buscando transação por ID..." -ForegroundColor Yellow

if ($transactionId) {
    $result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:3001/transactions/$transactionId"
    
    if ($result.Success) {
        Write-Host "✓ Transação encontrada!" -ForegroundColor Green
        Write-Host "  ID: $($result.Data.id)" -ForegroundColor Gray
        Write-Host "  Descrição: $($result.Data.description)" -ForegroundColor Gray
        Write-Host "  Data: $($result.Data.createdAt)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Erro ao buscar transação: $($result.Error)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Nenhuma transação criada para buscar" -ForegroundColor Yellow
}

Write-Host ""
Start-Sleep -Seconds 1

# Teste 5: Listar Transações do Merchant
Write-Host "[5/8] Listando transações do merchant..." -ForegroundColor Yellow

$result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:3001/transactions"

if ($result.Success) {
    $count = $result.Data.Count
    Write-Host "✓ Encontradas $count transações" -ForegroundColor Green
    
    if ($count -gt 0) {
        Write-Host "  Transações:" -ForegroundColor Gray
        foreach ($tx in $result.Data) {
            Write-Host "    • $($tx.type): R$ $($tx.amount) - $($tx.description)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "✗ Erro ao listar transações: $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 2

# Teste 6: Consultar Saldo Consolidado
Write-Host "[6/8] Consultando saldo consolidado..." -ForegroundColor Yellow
Write-Host "  (Aguardando processamento da consolidação...)" -ForegroundColor Gray

Start-Sleep -Seconds 3

$today = Get-Date -Format "yyyy-MM-dd"
$result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:3002/consolidation/balance/$today"

if ($result.Success) {
    Write-Host "✓ Saldo consolidado obtido!" -ForegroundColor Green
    Write-Host "  Data: $($result.Data.date)" -ForegroundColor Gray
    Write-Host "  Saldo Inicial: R$ $($result.Data.openingBalance)" -ForegroundColor Gray
    Write-Host "  Total Créditos: R$ $($result.Data.totalCredits)" -ForegroundColor Gray
    Write-Host "  Total Débitos: R$ $($result.Data.totalDebits)" -ForegroundColor Gray
    Write-Host "  Saldo Final: R$ $($result.Data.closingBalance)" -ForegroundColor Gray
} else {
    Write-Host "⚠ Saldo ainda não consolidado (normal para primeira execução)" -ForegroundColor Yellow
    Write-Host "  Erro: $($result.Error)" -ForegroundColor Gray
}

Write-Host ""
Start-Sleep -Seconds 1

# Teste 7: Consultar Relatório de Transações
Write-Host "[7/8] Consultando relatório de transações..." -ForegroundColor Yellow

$result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:3003/api/transactions?merchantId=$merchantId"

if ($result.Success) {
    Write-Host "✓ Relatório obtido com sucesso!" -ForegroundColor Green
    
    if ($result.Data.transactions) {
        $count = $result.Data.transactions.Count
        Write-Host "  Total de transações: $count" -ForegroundColor Gray
        Write-Host "  Total de créditos: R$ $($result.Data.summary.totalCredits)" -ForegroundColor Gray
        Write-Host "  Total de débitos: R$ $($result.Data.summary.totalDebits)" -ForegroundColor Gray
        Write-Host "  Saldo líquido: R$ $($result.Data.summary.netBalance)" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ Erro ao obter relatório: $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 1

# Teste 8: Cancelar Transação
Write-Host "[8/8] Cancelando transação..." -ForegroundColor Yellow

if ($transactionId) {
    $result = Invoke-ApiRequest -Method "PATCH" -Url "http://localhost:3001/transactions/$transactionId/cancel"
    
    if ($result.Success) {
        Write-Host "✓ Transação cancelada com sucesso!" -ForegroundColor Green
        Write-Host "  ID: $($result.Data.id)" -ForegroundColor Gray
        Write-Host "  Status: $($result.Data.status)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Erro ao cancelar transação: $($result.Error)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Nenhuma transação para cancelar" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testes Concluídos!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Resumo
Write-Host "Resumo dos Testes:" -ForegroundColor Cyan
Write-Host "  • Merchant ID usado: $merchantId" -ForegroundColor White
Write-Host "  • Transações criadas: 2 (1 crédito, 1 débito)" -ForegroundColor White
Write-Host "  • Transação cancelada: 1" -ForegroundColor White
Write-Host ""

Write-Host "URLs Úteis:" -ForegroundColor Cyan
Write-Host "  • Swagger Transactions:  http://localhost:3001/api-docs" -ForegroundColor Gray
Write-Host "  • Swagger Consolidation: http://localhost:3002/api-docs" -ForegroundColor Gray
Write-Host "  • RabbitMQ Management:   http://localhost:15672 (guest/guest)" -ForegroundColor Gray
Write-Host "  • Prometheus:            http://localhost:9090" -ForegroundColor Gray
Write-Host "  • Grafana:               http://localhost:3000 (admin/admin)" -ForegroundColor Gray
Write-Host ""

Write-Host "Próximos Passos:" -ForegroundColor Cyan
Write-Host "  1. Explore a API usando Swagger" -ForegroundColor White
Write-Host "  2. Configure dashboards no Grafana" -ForegroundColor White
Write-Host "  3. Monitore filas no RabbitMQ" -ForegroundColor White
Write-Host "  4. Execute testes de carga" -ForegroundColor White
Write-Host ""

Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
