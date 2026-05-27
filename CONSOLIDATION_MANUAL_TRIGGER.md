# Como Resolver: "Saldo ainda não consolidado"

## 🎯 Problema

Quando você cria transações e tenta buscar o saldo consolidado imediatamente, recebe o erro:
```
AVISO - Saldo ainda nao consolidado (normal para primeira execucao)
```

## ✅ Solução

Foi adicionado um endpoint **POST /trigger/:date** que permite triggerar a consolidação manualmente.

---

## 🚀 Como Usar

### Opção 1: Script PowerShell Automatizado (Recomendado)

Criei um script que faz tudo automaticamente:

```powershell
.\test-consolidation-with-trigger.ps1
```

Este script:
1. Cria transações de teste
2. Busca as transações criadas
3. **Triggera a consolidação manualmente**
4. Verifica o saldo consolidado
5. Testa todos os endpoints

### Opção 2: Manualmente via curl/Postman

#### Passo 1: Criar Transações

```powershell
# Criar transação de crédito
curl -X POST http://localhost:3001/api/v1/transactions `
  -H "Content-Type: application/json" `
  -d '{
    "idempotencyKey": "test-001",
    "amount": 1000.00,
    "type": "CREDIT",
    "date": "2026-05-27",
    "description": "Venda teste"
  }'

# Criar transação de débito
curl -X POST http://localhost:3001/api/v1/transactions `
  -H "Content-Type: application/json" `
  -d '{
    "idempotencyKey": "test-002",
    "amount": 300.00,
    "type": "DEBIT",
    "date": "2026-05-27",
    "description": "Despesa teste"
  }'
```

#### Passo 2: Listar Transações do Dia

```powershell
$today = Get-Date -Format "yyyy-MM-dd"
$transactions = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/transactions?date=$today"
```

#### Passo 3: Triggerar Consolidação

```powershell
$today = Get-Date -Format "yyyy-MM-dd"

# Preparar dados das transações
$consolidationData = @{
    transactions = @(
        @{
            amount = 1000.00
            type = "CREDIT"
            date = $today
        },
        @{
            amount = 300.00
            type = "DEBIT"
            date = $today
        }
    )
}

# Triggerar consolidação
$result = Invoke-RestMethod `
    -Uri "http://localhost:3002/api/v1/consolidation/trigger/$today" `
    -Method POST `
    -Body ($consolidationData | ConvertTo-Json) `
    -ContentType "application/json"

# Exibir resultado
$result | ConvertTo-Json
```

#### Passo 4: Verificar Saldo Consolidado

```powershell
$today = Get-Date -Format "yyyy-MM-dd"
curl http://localhost:3002/api/v1/consolidation/balance/$today
```

---

## 📝 Exemplo Completo em PowerShell

```powershell
# Data de hoje
$today = Get-Date -Format "yyyy-MM-dd"

# 1. Criar transações
Write-Host "Criando transacoes..." -ForegroundColor Yellow

$tx1 = @{
    idempotencyKey = [guid]::NewGuid().ToString()
    amount = 1500.00
    type = "CREDIT"
    date = $today
    description = "Venda produto A"
}

$tx2 = @{
    idempotencyKey = [guid]::NewGuid().ToString()
    amount = 450.00
    type = "DEBIT"
    date = $today
    description = "Compra material"
}

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/transactions" `
    -Method POST -Body ($tx1 | ConvertTo-Json) -ContentType "application/json"

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/transactions" `
    -Method POST -Body ($tx2 | ConvertTo-Json) -ContentType "application/json"

Write-Host "Transacoes criadas!" -ForegroundColor Green

# 2. Triggerar consolidação
Write-Host "Triggerando consolidacao..." -ForegroundColor Yellow

$consolidationData = @{
    transactions = @(
        @{ amount = 1500.00; type = "CREDIT"; date = $today },
        @{ amount = 450.00; type = "DEBIT"; date = $today }
    )
}

$balance = Invoke-RestMethod `
    -Uri "http://localhost:3002/api/v1/consolidation/trigger/$today" `
    -Method POST `
    -Body ($consolidationData | ConvertTo-Json) `
    -ContentType "application/json"

Write-Host "Consolidacao concluida!" -ForegroundColor Green

# 3. Exibir resultado
Write-Host "`nSaldo Consolidado:" -ForegroundColor Cyan
Write-Host "  Data: $($balance.date)"
Write-Host "  Saldo Inicial: R$ $($balance.openingBalance)"
Write-Host "  Total Creditos: R$ $($balance.totalCredits)" -ForegroundColor Green
Write-Host "  Total Debitos: R$ $($balance.totalDebits)" -ForegroundColor Red
Write-Host "  Saldo Final: R$ $($balance.closingBalance)" -ForegroundColor Cyan
```

---

## 🔧 Detalhes Técnicos

### Endpoint Adicionado

```
POST /api/v1/consolidation/trigger/:date
```

**Parâmetros:**
- `date` (path): Data no formato YYYY-MM-DD

**Body:**
```json
{
  "transactions": [
    {
      "amount": 100.50,
      "type": "CREDIT",
      "date": "2026-05-27"
    },
    {
      "amount": 50.25,
      "type": "DEBIT",
      "date": "2026-05-27"
    }
  ]
}
```

**Resposta:**
```json
{
  "date": "2026-05-27",
  "openingBalance": 0,
  "totalCredits": 100.50,
  "totalDebits": 50.25,
  "closingBalance": 50.25,
  "transactionCount": 2
}
```

---

## 🎓 Quando Usar

### Use o Trigger Manual quando:
- ✅ Estiver testando a API
- ✅ Precisar de consolidação imediata
- ✅ Estiver desenvolvendo/debugando
- ✅ Quiser forçar reconsolidação de um dia

### Use a Consolidação Automática quando:
- ✅ Em produção (roda a cada hora)
- ✅ Para operação normal do sistema
- ✅ Não precisa de resultado imediato

---

## 📊 Swagger

Acesse a documentação interativa:
```
http://localhost:3002/api-docs
```

Procure por: **POST /consolidation/trigger/{date}**

---

## ⚠️ Notas Importantes

1. **Dados das Transações**: Você precisa passar as transações no body do request
2. **Idempotência**: Pode executar múltiplas vezes - atualiza o saldo existente
3. **Saldo Anterior**: O endpoint busca automaticamente o saldo do dia anterior
4. **Validação**: A data deve estar no formato YYYY-MM-DD

---

## 🐛 Troubleshooting

### Erro: "Cannot POST /api/v1/consolidation/trigger/..."

**Causa:** Serviço não foi reiniciado após adicionar o endpoint  
**Solução:**
```powershell
cd services/consolidation
npm run start:dev
```

### Erro: "transactions is required"

**Causa:** Body do request está vazio ou mal formatado  
**Solução:** Certifique-se de enviar o JSON correto com o array de transactions

### Saldo não aparece após trigger

**Causa:** Pode haver erro no processamento  
**Solução:** Verifique os logs:
```powershell
cd services/consolidation
# Verificar logs no console ou arquivo de log
```

---

## 📚 Referências

- [CONSOLIDATION_API_TEST_RESULTS.md](CONSOLIDATION_API_TEST_RESULTS.md) - Resultados dos testes
- [TESTING.md](TESTING.md) - Guia geral de testes
- Swagger: http://localhost:3002/api-docs

---

*Documento criado por Bob 🤖*  
*Última atualização: 2026-05-27*