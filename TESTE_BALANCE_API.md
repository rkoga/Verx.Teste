# Guia para Testar a API de Balanço

## ✅ Correções Aplicadas

Foi corrigido um problema no schema do Prisma onde os nomes das tabelas estavam incorretos:
- `daily_balance_read_models` → `daily_balance_read_model` ✅
- `transaction_read_models` → `transaction_read_model` ✅
- `category_summaries` → `category_summary` ✅

## 📋 Pré-requisitos

1. Docker containers rodando (PostgreSQL, Redis, RabbitMQ)
2. Todos os 3 serviços iniciados

## 🚀 Como Iniciar os Serviços

### Opção 1: Usar o script automático (Recomendado)

```powershell
.\start-all-services.ps1
```

### Opção 2: Iniciar manualmente cada serviço

**Terminal 1 - Transactions Service:**
```powershell
cd services/transactions
npm start
```

**Terminal 2 - Consolidation Service:**
```powershell
cd services/consolidation
npm start
```

**Terminal 3 - Reporting Service:**
```powershell
cd services/reporting
npx prisma generate
npm start
```

## 🧪 Executar os Testes

Após todos os serviços estarem rodando:

```powershell
.\test-balance-api.ps1
```

## 📊 Endpoints da Balance API

### 1. Balanço Diário
```
GET http://localhost:3003/api/v1/reports/balance/:date
```

**Exemplo:**
```powershell
curl http://localhost:3003/api/v1/reports/balance/2026-05-27
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "date": "2026-05-27",
    "openingBalance": "0.00",
    "totalCredits": "1500.00",
    "totalDebits": "250.50",
    "closingBalance": "1249.50",
    "transactionCount": 3
  }
}
```

### 2. Histórico de Balanço
```
GET http://localhost:3003/api/v1/reports/balance/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

**Exemplo:**
```powershell
curl "http://localhost:3003/api/v1/reports/balance/history?startDate=2026-05-20&endDate=2026-05-27"
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-05-27",
      "openingBalance": "0.00",
      "totalCredits": "1500.00",
      "totalDebits": "250.50",
      "closingBalance": "1249.50"
    }
  ],
  "summary": {
    "openingBalance": "0.00",
    "totalCredits": "1500.00",
    "totalDebits": "250.50",
    "closingBalance": "1249.50",
    "netChange": "1249.50"
  }
}
```

### 3. Dados para Gráfico
```
GET http://localhost:3003/api/v1/reports/balance/chart?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

**Exemplo:**
```powershell
curl "http://localhost:3003/api/v1/reports/balance/chart?startDate=2026-05-20&endDate=2026-05-27"
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-05-27",
      "balance": 1249.50,
      "credits": 1500.00,
      "debits": 250.50
    }
  ],
  "summary": {
    "openingBalance": "0.00",
    "closingBalance": "1249.50",
    "totalCredits": "1500.00",
    "totalDebits": "250.50"
  }
}
```

## 🔍 Verificar Status dos Serviços

```powershell
# Transactions Service
curl http://localhost:3001/api/v1/health

# Consolidation Service
curl http://localhost:3002/api/v1/health

# Reporting Service
curl http://localhost:3003/health
```

## ⚠️ Troubleshooting

### Erro: "The table does not exist"
**Solução:** Regenerar o Prisma Client
```powershell
cd services/reporting
npx prisma generate
npm start
```

### Erro: "Cannot connect to server"
**Solução:** Verificar se o serviço está rodando
```powershell
# Verificar portas em uso
netstat -ano | findstr "3001 3002 3003"
```

### Erro: "No balance found"
**Solução:** Criar transações e aguardar consolidação
```powershell
# Criar uma transação de teste
curl -X POST http://localhost:3001/api/v1/transactions -H "Content-Type: application/json" -d '{\"idempotencyKey\":\"test-123\",\"amount\":100,\"type\":\"CREDIT\",\"date\":\"2026-05-27\",\"description\":\"Teste\"}'

# Aguardar 5 segundos para consolidação
Start-Sleep -Seconds 5

# Consultar balanço
curl http://localhost:3003/api/v1/reports/balance/2026-05-27
```

## 📝 Notas

- O serviço de consolidação processa transações automaticamente
- Os dados de balanço são atualizados em tempo real
- Use o Redis para cache de consultas frequentes
- Todos os endpoints retornam JSON

## 🎯 Próximos Passos

1. ✅ Testar todos os endpoints da Balance API
2. ✅ Verificar performance com múltiplas transações
3. ✅ Testar validações de parâmetros
4. ✅ Integrar com o frontend Angular

---

**Criado por Bob** 🤖