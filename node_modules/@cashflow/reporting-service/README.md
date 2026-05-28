# Reporting Service

Serviço de relatórios otimizado para leitura com cache Redis e read models desnormalizados.

## 📋 Visão Geral

O Reporting Service é responsável por fornecer consultas rápidas e eficientes de dados consolidados, utilizando:

- **Read Models**: Dados desnormalizados otimizados para consultas
- **Cache Redis**: Cache-aside pattern para reduzir carga no banco
- **Express**: Framework leve e performático
- **Prisma**: ORM type-safe para PostgreSQL

## 🏗️ Arquitetura

```
src/
├── controllers/          # Controllers HTTP
│   ├── transactions.controller.ts
│   ├── balance.controller.ts
│   ├── dashboard.controller.ts
│   └── health.controller.ts
├── services/            # Business logic
│   └── reporting.service.ts
├── infrastructure/      # Infrastructure layer
│   ├── cache/
│   │   └── redis.service.ts
│   ├── persistence/
│   │   └── prisma.service.ts
│   └── logging/
│       └── logger.ts
├── routes/             # Route definitions
│   └── index.ts
└── server.ts           # Express server setup
```

## 🚀 Endpoints

### Health Check
- `GET /api/v1/health` - Health check completo
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/live` - Liveness probe

### Transaction Reports
- `GET /api/v1/reports/transactions/:merchantId` - Listar transações com filtros
  - Query params: `startDate`, `endDate`, `type`, `status`, `categoryId`, `minAmount`, `maxAmount`, `page`, `limit`
- `GET /api/v1/reports/transactions/:merchantId/export` - Exportar para CSV

### Balance Reports
- `GET /api/v1/reports/balance/:merchantId/:date` - Saldo de um dia específico
- `GET /api/v1/reports/balance/:merchantId/history` - Histórico de saldos
  - Query params: `startDate`, `endDate`
- `GET /api/v1/reports/balance/:merchantId/chart` - Dados para gráficos

### Dashboard
- `GET /api/v1/reports/dashboard/:merchantId` - Dashboard completo
- `GET /api/v1/reports/dashboard/:merchantId/categories` - Resumo por categoria
  - Query params: `month` (opcional, default: mês atual)
- `POST /api/v1/reports/dashboard/:merchantId/invalidate-cache` - Invalidar cache

## 🗄️ Read Models

### TransactionReadModel
Dados desnormalizados de transações para consultas rápidas.

**Índices otimizados:**
- `merchantId + transactionDate`
- `merchantId + type + transactionDate`
- `merchantId + status + transactionDate`
- `categoryId + transactionDate`

### DailyBalanceReadModel
Snapshots diários de saldos consolidados.

**Índices otimizados:**
- `merchantId + date` (unique)
- `date`

### MerchantStatistics
Estatísticas agregadas por merchant.

### CategorySummary
Resumo mensal por categoria.

## 💾 Cache Strategy

### Cache-Aside Pattern
1. Verifica se dados estão no cache
2. Se não estiver, busca no banco
3. Armazena no cache antes de retornar
4. Define TTL apropriado

### TTL Configuration
- Transações: 5 minutos (300s)
- Saldos: 10 minutos (600s)
- Dashboard: 3 minutos (180s)

### Cache Keys
```typescript
transactions:{merchantId}:{filters_hash}
balance:{merchantId}:{date}
balance-history:{merchantId}:{startDate}:{endDate}
dashboard:{merchantId}
statistics:{merchantId}
category-summary:{merchantId}:{month}
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Server
PORT=3003
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/reporting_db

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start
```

## 🐳 Docker

```bash
# Build
docker build -t reporting-service .

# Run
docker run -p 3003:3003 \
  -e DATABASE_URL=postgresql://user:password@host:5432/reporting_db \
  -e REDIS_URL=redis://host:6379 \
  reporting-service
```

## 📊 Monitoramento

### Métricas Disponíveis
- Response time por endpoint
- Cache hit/miss ratio
- Database query performance
- Error rates

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "reporting-service",
  "version": "1.0.0",
  "uptime": 3600,
  "responseTime": "5ms",
  "checks": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

## 🧪 Testes

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📈 Performance

### Otimizações Implementadas
- ✅ Read models desnormalizados
- ✅ Índices otimizados no PostgreSQL
- ✅ Cache Redis com TTL apropriado
- ✅ Compression middleware
- ✅ Connection pooling
- ✅ Query result streaming para exports

### Benchmarks Esperados
- Consulta com cache: < 10ms
- Consulta sem cache: < 100ms
- Export CSV (1000 registros): < 2s

## 🔐 Segurança

- ✅ Helmet.js para headers de segurança
- ✅ CORS configurável
- ✅ Rate limiting (recomendado adicionar)
- ✅ Input validation (recomendado adicionar)
- ✅ SQL injection protection (Prisma)

## 📝 Logs

Logs estruturados em JSON com Winston:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "service": "ReportingService",
  "message": "Transactions retrieved from cache",
  "merchantId": "merchant-123"
}
```
