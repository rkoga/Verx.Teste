# Script to check service logs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Service Logs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Consolidation Service Logs (last 30 lines):" -ForegroundColor Yellow
docker logs verxteste-consolidation-service-1 --tail 30
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reporting Service Logs (last 30 lines):" -ForegroundColor Yellow
docker logs verxteste-reporting-service-1 --tail 30
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Made with Bob
