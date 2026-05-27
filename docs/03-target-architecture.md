# Arquitetura Alvo - Sistema de Controle de Fluxo de Caixa

## 1. Visão Geral da Arquitetura

### 1.1 Estilo Arquitetural
**Event-Driven Microservices Architecture** com padrões CQRS e Event Sourcing parcial.

### 1.2 Princípios Arquiteturais
- **Desacoplamento:** Serviços independentes comunicando via eventos
- **Resiliência:** Circuit breakers, retries, fallbacks
- **Escalabilidade:** Horizontal scaling de serviços stateless
- **Observabilidade:** Logs, métricas e traces centralizados
- **Segurança:** Defense in depth, zero trust

## 2. Diagrama de Arquitetura de Alto Nível (C4 - Contexto)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SISTEMA DE FLUXO DE CAIXA                   │
│                                                                     │
│  ┌──────────────┐                                                  │
│  │              │                                                  │
│  │  Comerciante │──────────────┐                                  │
│  │   (Usuário)  │              │                                  │
│  │              │              │                                  │
│  └──────────────┘              │                                  │
│                                │                                  │
│                                ▼                                  │
│                    ┌───────────────────────┐                      │
│                    │                       │                      │
│                    │   API Gateway         │                      │
│                    │   (Kong/NGINX)        │                      │
│                    │                       │                      │
│                    └───────────┬───────────┘                      │
│                                │                                  │
│                ┌───────────────┼───────────────┐                 │
│                │               │               │                 │
│                ▼               ▼               ▼                 │
│    ┌──────────────────┐ ┌──────────────┐ ┌─────────────────┐   │
│    │  Transactions    │ │ Consolidation│ │  Reporting      │   │
│    │  Service         │ │ Service      │ │  Service        │   │
│    │  (Write Model)   │ │ (Processor)  │ │  (Read Model)   │   │
│    └────────┬─────────┘ └──────┬───────┘ └────────┬────────┘   │
│             │                   │                  │            │
│             │    ┌──────────────┼──────────────────┘            │
│             │    │              │                               │
│             ▼    ▼              ▼                               │
│        ┌────────────────────────────┐                          │
│        │   Message Broker           │                          │
│        │   (RabbitMQ/Kafka)         │                          │
│        └────────────────────────────┘                          │
│                     │                                           │
│    ┌────────────────┼────────────────┐                         │
│    │                │                │                         │
│    ▼                ▼                ▼                         │
│ ┌─────────┐  ┌──────────┐  ┌──────────────┐                  │
│ │PostgreSQL│  │  Redis   │  │ Elasticsearch│                  │
│ │ (Primary)│  │ (Cache)  │  │   (Logs)     │                  │
│ └─────────┘  └──────────┘  └──────────────┘                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │         Observability Stack                          │     │
│  │  Prometheus + Grafana + Jaeger + ELK                 │     │
│  └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Diagrama de Containers (C4 - Container)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CASH FLOW SYSTEM - CONTAINERS                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        API GATEWAY LAYER                        │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  Kong API Gateway / NGINX                                │  │   │
│  │  │  - Authentication (JWT)                                  │  │   │
│  │  │  - Rate Limiting                                         │  │   │
│  │  │  - Request Routing                                       │  │   │
│  │  │  - Load Balancing                                        │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                │                                        │
│                                │                                        │
│  ┌─────────────────────────────┼──────────────────────────────────┐   │
│  │          APPLICATION LAYER  │                                  │   │
│  │                             │                                  │   │
│  │  ┌──────────────────────────▼───────────────────────────┐     │   │
│  │  │  Transactions Service (Node.js + TypeScript)         │     │   │
│  │  │  Port: 3001                                          │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ Controllers (REST API)                         │ │     │   │
│  │  │  │ - POST /transactions                           │ │     │   │
│  │  │  │ - GET /transactions                            │ │     │   │
│  │  │  │ - GET /transactions/:id                        │ │     │   │
│  │  │  │ - DELETE /transactions/:id (soft)              │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ Business Logic (Domain Layer)                  │ │     │   │
│  │  │  │ - Transaction Aggregate                        │ │     │   │
│  │  │  │ - Validation Rules                             │ │     │   │
│  │  │  │ - Event Publishing                             │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ Data Access (Repository Pattern)               │ │     │   │
│  │  │  │ - Prisma ORM                                   │ │     │   │
│  │  │  │ - PostgreSQL Connection                        │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  └──────────────────────────────────────────────────────┘     │   │
│  │                             │                                  │   │
│  │                             │ publishes events                 │   │
│  │                             ▼                                  │   │
│  │  ┌──────────────────────────────────────────────────────┐     │   │
│  │  │  Consolidation Service (Node.js + TypeScript)        │     │   │
│  │  │  Port: 3002                                          │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ Event Consumers                                │ │     │   │
│  │  │  │ - TransactionCreated Handler                   │ │     │   │
│  │  │  │ - TransactionCancelled Handler                 │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ Scheduled Jobs (node-cron)                     │ │     │   │
│  │  │  │ - Daily Consolidation (00:00)                  │ │     │   │
│  │  │  │ - Retry Failed Consolidations                  │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ Business Logic                                 │ │     │   │
│  │  │  │ - Consolidation Aggregate                      │ │     │   │
│  │  │  │ - Balance Calculation                          │ │     │   │
│  │  │  │ - Idempotency Control                          │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ REST API (for queries)                         │ │     │   │
│  │  │  │ - GET /consolidations/daily/:date              │ │     │   │
│  │  │  │ - GET /consolidations/period                   │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  └──────────────────────────────────────────────────────┘     │   │
│  │                             │                                  │   │
│  │                             │ publishes events                 │   │
│  │                             ▼                                  │   │
│  │  ┌──────────────────────────────────────────────────────┐     │   │
│  │  │  Reporting Service (Node.js + TypeScript)            │     │   │
│  │  │  Port: 3003                                          │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ Event Consumers                                │ │     │   │
│  │  │  │ - ConsolidationCompleted Handler               │ │     │   │
│  │  │  │ - Updates Read Model                           │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ REST API (Read-Optimized)                      │ │     │   │
│  │  │  │ - GET /reports/daily/:date                     │ │     │   │
│  │  │  │ - GET /reports/monthly/:month                  │ │     │   │
│  │  │  │ - GET /reports/summary                         │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  │  ┌────────────────────────────────────────────────┐ │     │   │
│  │  │  │ Materialized Views                             │ │     │   │
│  │  │  │ - Denormalized data for fast queries           │ │     │   │
│  │  │  │ - Cached aggregations                          │ │     │   │
│  │  │  └────────────────────────────────────────────────┘ │     │   │
│  │  └──────────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    MESSAGING LAYER                              │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  RabbitMQ / Apache Kafka                                 │  │   │
│  │  │  Exchanges/Topics:                                       │  │   │
│  │  │  - transactions.events (TransactionCreated, etc)         │  │   │
│  │  │  - consolidations.events (ConsolidationCompleted, etc)   │  │   │
│  │  │  - dlq.* (Dead Letter Queues)                            │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      DATA LAYER                                 │   │
│  │  ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐  │   │
│  │  │  PostgreSQL 15+  │  │  Redis 7+    │  │  Elasticsearch  │  │   │
│  │  │                  │  │              │  │                 │  │   │
│  │  │  Databases:      │  │  Caches:     │  │  Indices:       │  │   │
│  │  │  - transactions  │  │  - queries   │  │  - logs         │  │   │
│  │  │  - consolidation │  │  - sessions  │  │  - metrics      │  │   │
│  │  │  - reporting     │  │  - rate-lim  │  │  - traces       │  │   │
│  │  └──────────────────┘  └──────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  OBSERVABILITY LAYER                            │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐   │   │
│  │  │ Prometheus   │ │   Grafana    │ │  Jaeger/OpenTelemetry│   │   │
│  │  │ (Metrics)    │ │ (Dashboards) │ │  (Distributed Trace) │   │   │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  ELK Stack (Elasticsearch + Logstash + Kibana)           │  │   │
│  │  │  - Centralized Logging                                   │  │   │
│  │  │  - Log Analysis                                          │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4. Componentes Detalhados

### 4.1 Transactions Service

**Responsabilidades:**
- Receber e validar lançamentos
- Persistir transações no banco
- Publicar eventos de domínio
- Fornecer APIs de consulta

**Stack Tecnológica:**
- **Runtime:** Node.js 20 LTS
- **Linguagem:** TypeScript 5+
- **Framework:** NestJS (modular, enterprise-ready)
- **ORM:** Prisma (type-safe, migrations)
- **Validação:** Zod (runtime validation)
- **Testes:** Jest + Supertest

**Estrutura Interna:**
```
transactions-service/
├── src/
│   ├── application/          # Application Layer (Use Cases)
│   │   ├── commands/
│   │   │   ├── create-transaction.command.ts
│   │   │   └── cancel-transaction.command.ts
│   │   ├── queries/
│   │   │   ├── get-transaction.query.ts
│   │   │   └── list-transactions.query.ts
│   │   └── handlers/
│   ├── domain/               # Domain Layer (Business Logic)
│   │   ├── entities/
│   │   │   ├── transaction.entity.ts
│   │   │   └── category.entity.ts
│   │   ├── value-objects/
│   │   │   ├── money.vo.ts
│   │   │   └── transaction-type.vo.ts
│   │   ├── events/
│   │   │   └── transaction-created.event.ts
│   │   └── repositories/
│   │       └── transaction.repository.interface.ts
│   ├── infrastructure/       # Infrastructure Layer
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   └── repositories/
│   │   ├── messaging/
│   │   │   └── rabbitmq.publisher.ts
│   │   └── http/
│   │       └── controllers/
│   ├── shared/               # Shared Utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   └── interceptors/
│   └── main.ts
├── test/
├── prisma/
│   └── schema.prisma
├── Dockerfile
└── package.json
```

**APIs Expostas:**
```typescript
POST   /api/v1/transactions          # Criar lançamento
GET    /api/v1/transactions          # Listar lançamentos (com filtros)
GET    /api/v1/transactions/:id      # Buscar por ID
DELETE /api/v1/transactions/:id      # Cancelar (soft delete)
GET    /api/v1/health                # Health check
GET    /api/v1/ready                 # Readiness check
```

### 4.2 Consolidation Service

**Responsabilidades:**
- Consumir eventos de transações
- Processar consolidação diária (job agendado)
- Calcular saldos
- Garantir idempotência

**Stack Tecnológica:**
- **Runtime:** Node.js 20 LTS
- **Linguagem:** TypeScript 5+
- **Framework:** NestJS
- **ORM:** Prisma
- **Scheduler:** node-cron
- **Message Consumer:** amqplib (RabbitMQ)

**Estrutura Interna:**
```
consolidation-service/
├── src/
│   ├── application/
│   │   ├── commands/
│   │   │   ├── process-consolidation.command.ts
│   │   │   └── reprocess-consolidation.command.ts
│   │   ├── queries/
│   │   │   └── get-daily-balance.query.ts
│   │   └── handlers/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── daily-consolidation.entity.ts
│   │   │   └── balance-snapshot.entity.ts
│   │   ├── services/
│   │   │   └── balance-calculator.service.ts
│   │   └── events/
│   │       └── consolidation-completed.event.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── messaging/
│   │   │   ├── consumers/
│   │   │   │   └── transaction-created.consumer.ts
│   │   │   └── publishers/
│   │   ├── schedulers/
│   │   │   └── daily-consolidation.scheduler.ts
│   │   └── http/
│   └── main.ts
├── test/
└── package.json
```

**APIs Expostas:**
```typescript
GET    /api/v1/consolidations/daily/:date    # Saldo de um dia
GET    /api/v1/consolidations/period         # Saldo de período
POST   /api/v1/consolidations/reprocess      # Reprocessar (admin)
GET    /api/v1/health
GET    /api/v1/ready
```

**Jobs Agendados:**
- **Daily Consolidation:** 00:00 (processa D-1)
- **Retry Failed:** A cada 30 minutos
- **Cleanup Old Data:** Semanal

### 4.3 Reporting Service

**Responsabilidades:**
- Manter read model otimizado
- Gerar relatórios consolidados
- Fornecer APIs de consulta rápida
- Materializar views

**Stack Tecnológica:**
- **Runtime:** Node.js 20 LTS
- **Linguagem:** TypeScript 5+
- **Framework:** Express (lightweight para reads)
- **ORM:** Prisma
- **Cache:** Redis

**Estrutura Interna:**
```
reporting-service/
├── src/
│   ├── application/
│   │   ├── queries/
│   │   │   ├── get-daily-report.query.ts
│   │   │   ├── get-monthly-report.query.ts
│   │   │   └── get-summary.query.ts
│   │   └── handlers/
│   ├── domain/
│   │   ├── read-models/
│   │   │   ├── daily-report.model.ts
│   │   │   └── monthly-summary.model.ts
│   │   └── projections/
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── materialized-views/
│   │   ├── cache/
│   │   │   └── redis.service.ts
│   │   ├── messaging/
│   │   │   └── consumers/
│   │   └── http/
│   └── main.ts
└── package.json
```

**APIs Expostas:**
```typescript
GET /api/v1/reports/daily/:date           # Relatório diário
GET /api/v1/reports/monthly/:yearMonth    # Relatório mensal
GET /api/v1/reports/summary               # Resumo geral
GET /api/v1/reports/categories            # Por categoria
GET /api/v1/health
```

## 5. Padrões de Comunicação

### 5.1 Síncrona (REST)
- Cliente → API Gateway → Services
- Request/Response
- Timeout: 30s
- Retry: 3 tentativas com backoff exponencial

### 5.2 Assíncrona (Events)
- Service → Message Broker → Service
- Fire and forget
- At-least-once delivery
- Dead Letter Queue para falhas

### 5.3 Formato de Eventos

```typescript
interface DomainEvent {
  eventId: string;           // UUID
  eventType: string;         // "TransactionCreated"
  aggregateId: string;       // ID da entidade
  aggregateType: string;     // "Transaction"
  occurredAt: Date;          // Timestamp
  version: number;           // Versão do evento
  payload: Record<string, any>;
  metadata: {
    userId?: string;
    correlationId: string;
    causationId?: string;
  };
}
```

**Exemplo:**
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "TransactionCreated",
  "aggregateId": "txn_123",
  "aggregateType": "Transaction",
  "occurredAt": "2026-05-26T10:00:00Z",
  "version": 1,
  "payload": {
    "amount": 1000.00,
    "type": "CREDIT",
    "description": "Venda produto X",
    "date": "2026-05-26"
  },
  "metadata": {
    "userId": "user_456",
    "correlationId": "req_789"
  }
}
```

## 6. Estratégias de Resiliência

### 6.1 Circuit Breaker
- **Threshold:** 50% de falhas em 10 requisições
- **Timeout:** 30 segundos
- **Half-Open:** Tenta 1 requisição após 60s
- **Biblioteca:** opossum

### 6.2 Retry Policy
- **Estratégia:** Exponential backoff
- **Max Retries:** 3
- **Initial Delay:** 1s
- **Max Delay:** 10s
- **Biblioteca:** axios-retry

### 6.3 Bulkhead
- **Connection Pool:** 20 conexões por serviço
- **Thread Pool:** Limitado por CPU cores
- **Queue Size:** 100 requisições

### 6.4 Timeout
- **API Gateway:** 30s
- **Service-to-Service:** 10s
- **Database:** 5s
- **Cache:** 1s

### 6.5 Fallback
- **Cache:** Retornar dados em cache se serviço falhar
- **Default Values:** Valores padrão para dados não críticos
- **Graceful Degradation:** Funcionalidade reduzida

## 7. Segurança

### 7.1 Autenticação
- **Método:** JWT (JSON Web Tokens)
- **Algoritmo:** RS256 (asymmetric)
- **Expiration:** Access token 15min, Refresh token 7 dias
- **Storage:** HttpOnly cookies (refresh) + Memory (access)

### 7.2 Autorização
- **Modelo:** RBAC (Role-Based Access Control)
- **Roles:** ADMIN, MERCHANT, VIEWER
- **Permissions:** Granulares por recurso

### 7.3 Comunicação
- **External:** TLS 1.3
- **Internal:** mTLS (mutual TLS) entre serviços
- **Certificates:** Let's Encrypt + cert-manager

### 7.4 Secrets Management
- **Development:** .env files (não commitados)
- **Production:** Kubernetes Secrets ou HashiCorp Vault
- **Rotation:** Automática a cada 90 dias

### 7.5 API Security
- **Rate Limiting:** 100 req/min por IP
- **CORS:** Whitelist de origens
- **Input Validation:** Zod schemas
- **SQL Injection:** Prisma (prepared statements)
- **XSS:** Sanitização de inputs

## 8. Escalabilidade

### 8.1 Horizontal Scaling
```yaml
# Kubernetes HPA (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: transactions-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: transactions-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 8.2 Database Scaling
- **Read Replicas:** 2 réplicas para leitura
- **Connection Pooling:** PgBouncer
- **Partitioning:** Por data (monthly partitions)
- **Indexing:** Índices otimizados

### 8.3 Cache Strategy
- **L1 Cache:** In-memory (Node.js)
- **L2 Cache:** Redis (distributed)
- **TTL:** 5 minutos para queries frequentes
- **Invalidation:** Event-driven

## 9. Deployment

### 9.1 Containerização
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 9.2 Orquestração
- **Local:** Docker Compose
- **Production:** Kubernetes (K8s)
- **Service Mesh:** Istio (opcional)

### 9.3 CI/CD Pipeline
```yaml
# GitHub Actions / GitLab CI
stages:
  - lint
  - test
  - build
  - deploy

lint:
  - npm run lint
  - npm run format:check

test:
  - npm run test:unit
  - npm run test:integration
  - npm run test:e2e

build:
  - docker build -t service:$VERSION .
  - docker push registry/service:$VERSION

deploy:
  - kubectl apply -f k8s/
  - kubectl rollout status deployment/service
```

## 10. Monitoramento e Observabilidade

### 10.1 Métricas (Prometheus)
```typescript
// Métricas customizadas
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const transactionsCreated = new Counter({
  name: 'transactions_created_total',
  help: 'Total number of transactions created'
});

const consolidationDuration = new Histogram({
  name: 'consolidation_duration_seconds',
  help: 'Duration of consolidation process'
});
```

### 10.2 Logs (ELK Stack)
```typescript
// Structured logging
logger.info('Transaction created', {
  transactionId: 'txn_123',
  amount: 1000,
  type: 'CREDIT',
  userId: 'user_456',
  correlationId: 'req_789'
});
```

### 10.3 Traces (Jaeger)
```typescript
// Distributed tracing
const span = tracer.startSpan('create-transaction');
span.setTag('transaction.id', transactionId);
span.setTag('transaction.amount', amount);
// ... operação
span.finish();
```

### 10.4 Alertas
- **Latência > 500ms (p95):** Warning
- **Error rate > 1%:** Critical
- **CPU > 80%:** Warning
- **Memory > 90%:** Critical
- **Disk > 85%:** Warning

## 11. Disaster Recovery

### 11.1 Backup Strategy
- **Frequency:** A cada 6 horas
- **Retention:** 30 dias
- **Type:** Full + Incremental
- **Storage:** S3-compatible (MinIO/AWS S3)
- **Encryption:** AES-256

### 11.2 Recovery Procedures
- **RTO (Recovery Time Objective):** 15 minutos
- **RPO (Recovery Point Objective):** 5 minutos
- **Automated:** Scripts de restore
- **Tested:** Mensalmente

## 12. Considerações de Performance

### 12.1 Otimizações
- **Database Indexes:** Em campos de busca frequente
- **Query Optimization:** EXPLAIN ANALYZE
- **N+1 Queries:** Eager loading com Prisma
- **Pagination:** Cursor-based para grandes datasets
- **Compression:** Gzip para responses

### 12.2 Benchmarks Esperados
- **Transactions API:** 1000 req/s (p95 < 200ms)
- **Consolidation API:** 500 req/s (p95 < 500ms)
- **Reporting API:** 2000 req/s (p95 < 100ms) - cached
- **Daily Consolidation:** 100k transactions em < 5min

## 13. Tecnologias e Justificativas

| Tecnologia | Justificativa |
|------------|---------------|
| **Node.js + TypeScript** | Performance, type-safety, ecossistema rico, async I/O |
| **NestJS** | Arquitetura modular, DI, decorators, enterprise-ready |
| **PostgreSQL** | ACID, confiabilidade, JSON support, open-source |
| **Redis** | Cache distribuído, pub/sub, alta performance |
| **RabbitMQ** | Message broker confiável, dead letter queues, patterns |
| **Prisma** | Type-safe ORM, migrations, developer experience |
| **Docker** | Portabilidade, isolamento, reprodutibilidade |
| **Kubernetes** | Orquestração, auto-scaling, self-healing |
| **Prometheus + Grafana** | Métricas, alertas, visualização, open-source |
| **ELK Stack** | Logs centralizados, análise, busca full-text |
| **Jaeger** | Distributed tracing, performance analysis |

## 14. Próximos Passos

1. ✅ Arquitetura definida
2. ⏭️ Criar diagramas detalhados (C4, sequência, fluxos)
3. ⏭️ Documentar ADRs (Architectural Decision Records)
4. ⏭️ Definir estrutura de pastas
5. ⏭️ Especificar contratos de API (OpenAPI)
6. ⏭️ Planejar estratégia de testes
7. ⏭️ Estimar custos de infraestrutura