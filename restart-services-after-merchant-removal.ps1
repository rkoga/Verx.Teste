# Script para Reiniciar Serviços Após Remoção do merchant_id
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reiniciando Serviços" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos Node existentes
Write-Host "[1/4] Parando processos Node existentes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✅ Processos parados" -ForegroundColor Green
Write-Host ""

# Limpar cache e recompilar Transactions
Write-Host "[2/4] Recompilando Transactions Service..." -ForegroundColor Yellow
Push-Location services/transactions
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules/.cache, dist, .nest
npm run build
Pop-Location
Write-Host "✅ Transactions compilado" -ForegroundColor Green
Write-Host ""

# Limpar cache e recompilar Consolidation
Write-Host "[3/4] Recompilando Consolidation Service..." -ForegroundColor Yellow
Push-Location services/consolidation
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules/.cache, dist, .nest
npm run build
Pop-Location
Write-Host "✅ Consolidation compilado" -ForegroundColor Green
Write-Host ""

# Limpar cache e recompilar Reporting
Write-Host "[4/4] Recompilando Reporting Service..." -ForegroundColor Yellow
Push-Location services/reporting
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules/.cache, dist
npm run build
Pop-Location
Write-Host "✅ Reporting compilado" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Compilação Concluída!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Agora execute:" -ForegroundColor Cyan
Write-Host "  .\start-all-services.ps1" -ForegroundColor White
Write-Host ""

# Made with Bob
