# Script para verificar dados nos bancos
Write-Host "Verificando dados nos bancos..." -ForegroundColor Cyan
Write-Host ""

$today = Get-Date -Format "yyyy-MM-dd"

# Verificar banco de consolidation
Write-Host "=== Banco CONSOLIDATION ===" -ForegroundColor Yellow
try {
    $result = docker exec cashflow-postgres psql -U cashflow -d consolidation -c "SELECT id, date, opening_balance, closing_balance, transaction_count FROM daily_balances WHERE date = '$today';"
    Write-Host $result
} catch {
    Write-Host "Erro ao consultar banco consolidation: $_" -ForegroundColor Red
}
Write-Host ""

# Verificar banco de reporting
Write-Host "=== Banco REPORTING ===" -ForegroundColor Yellow
try {
    $result = docker exec cashflow-postgres psql -U cashflow -d reporting -c "SELECT id, date, \"openingBalance\", \"closingBalance\", \"transactionCount\" FROM daily_balance_read_model WHERE date = '$today';"
    Write-Host $result
} catch {
    Write-Host "Erro ao consultar banco reporting: $_" -ForegroundColor Red
}
Write-Host ""

# Verificar transações
Write-Host "=== Transacoes do dia ===" -ForegroundColor Yellow
try {
    $result = docker exec cashflow-postgres psql -U cashflow -d transactions -c "SELECT id, amount, type, status, transaction_date FROM transactions WHERE transaction_date::date = '$today';"
    Write-Host $result
} catch {
    Write-Host "Erro ao consultar transacoes: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Made with Bob