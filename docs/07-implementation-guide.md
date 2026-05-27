# Guia de Implementação Consolidado

## 1. Especificação de APIs (OpenAPI)

### 1.1 Transactions API

```yaml
openapi: 3.0.3
info:
  title: Transactions API
  description: API para gerenciamento de lançamentos financeiros
  version: 1.0.0
  contact:
    name: Equipe de Desenvolvimento
    email: dev@cashflow.com

servers:
  - url: http://localhost:3001/api/v1
    description: Desenvolvimento
  - url: https://api.cashflow.com/v1
    description: Produção

tags:
  - name: Transactions
    description: Operações de lançamentos
  - name: Health
    description: Health checks

paths:
  /transactions:
    post:
      tags:
        - Transactions
      summary: Criar novo lançamento
      description: Registra um novo lançamento financeiro (débito ou crédito)
      operationId: createTransaction
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTransactionRequest'
            examples:
              credit:
                summary: Lançamento de crédito
                value:
                  idempotencyKey: "550e8400-e29b-41d4-a716-446655440000"
                  amount: 1500.00
                  type: "CREDIT"
                  date: "2026-05-26"
                  description: "Venda de produto X"
                  categoryId: "cat_123"
              debit:
                summary: Lançamento de débito
                value:
                  idempotencyKey: "550e8400-e29b-41d4-a716-446655440001"
                  amount: 500.00
                  type: "DEBIT"
                  date: "2026-05-26"
                  description: "Compra de material"
                  categoryId: "cat_456"
      responses:
        '201':
          description: Lançamento criado com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransactionResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '422':
          $ref: '#/components/responses/UnprocessableEntity'
        '429':
          $ref: '#/components/responses/TooManyRequests'
        '500':
          $ref: '#/components/responses/InternalServerError'

    get:
      tags:
        - Transactions
      summary: Listar lançamentos
      description: Lista lançamentos com filtros e paginação
      operationId: listTransactions
      security:
        - bearerAuth: []
      parameters:
        - name: startDate
          in: query
          description: Data inicial (formato YYYY-MM-DD)
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          description: Data final (formato YYYY-MM-DD)
          schema:
            type: string
            format: date
        - name: type
          in: query
          description: Tipo de lançamento
          schema:
            type: string
            enum: [CREDIT, DEBIT]
        - name: categoryId
          in: query
          description: ID da categoria
          schema:
            type: string
        - name: page
          in: query
          description: Número da página (começa em 1)
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: Itens por página
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: sortBy
          in: query
          description: Campo para ordenação
          schema:
            type: string
            enum: [date, amount, createdAt]
            default: date
        - name: sortOrder
          in: query
          description: Ordem de classificação
          schema:
            type: string
            enum: [asc, desc]
            default: desc
      responses:
        '200':
          description: Lista de lançamentos
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransactionListResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /transactions/{id}:
    get:
      tags:
        - Transactions
      summary: Buscar lançamento por ID
      operationId: getTransaction
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          description: ID do lançamento
          schema:
            type: string
      responses:
        '200':
          description: Lançamento encontrado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransactionResponse'
        '404':
          $ref: '#/components/responses/NotFound'
        '401':
          $ref: '#/components/responses/Unauthorized'

    delete:
      tags:
        - Transactions
      summary: Cancelar lançamento
      description: Cancela um lançamento (soft delete)
      operationId: cancelTransaction
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          description: ID do lançamento
          schema:
            type: string
      responses:
        '200':
          description: Lançamento cancelado
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransactionResponse'
        '404':
          $ref: '#/components/responses/NotFound'
        '422':
          description: Lançamento já consolidado (não pode ser cancelado)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /health:
    get:
      tags:
        - Health
      summary: Health check
      operationId: healthCheck
      responses:
        '200':
          description: Serviço saudável
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    CreateTransactionRequest:
      type: object
      required:
        - idempotencyKey
        - amount
        - type
        - date
        - description
      properties:
        idempotencyKey:
          type: string
          format: uuid
          description: Chave de idempotência (UUID)
        amount:
          type: number
          format: double
          minimum: 0.01
          description: Valor do lançamento (sempre positivo)
        type:
          type: string
          enum: [CREDIT, DEBIT]
          description: Tipo de lançamento
        date:
          type: string
          format: date
          description: Data do lançamento (não pode ser futura)
        description:
          type: string
          minLength: 3
          maxLength: 500
          description: Descrição do lançamento
        categoryId:
          type: string
          description: ID da categoria (opcional)

    TransactionResponse:
      type: object
      properties:
        id:
          type: string
          description: ID único do lançamento
        merchantId:
          type: string
          description: ID do comerciante
        amount:
          type: number
          format: double
        type:
          type: string
          enum: [CREDIT, DEBIT]
        date:
          type: string
          format: date
        description:
          type: string
        categoryId:
          type: string
          nullable: true
        status:
          type: string
          enum: [ACTIVE, CANCELLED, CONSOLIDATED]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        cancelledAt:
          type: string
          format: date-time
          nullable: true

    TransactionListResponse:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/TransactionResponse'
        pagination:
          $ref: '#/components/schemas/Pagination'

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer

    HealthResponse:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, unhealthy]
        timestamp:
          type: string
          format: date-time
        uptime:
          type: number
        database:
          type: string
          enum: [connected, disconnected]
        messageQueue:
          type: string
          enum: [connected, disconnected]

    ErrorResponse:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        statusCode:
          type: integer
        timestamp:
          type: string
          format: date-time
        path:
          type: string

  responses:
    BadRequest:
      description: Requisição inválida
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    
    Unauthorized:
      description: Não autorizado
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    
    NotFound:
      description: Recurso não encontrado
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    
    UnprocessableEntity:
      description: Entidade não processável (erro de validação)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    
    TooManyRequests:
      description: Muitas requisições (rate limit excedido)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    
    InternalServerError:
      description: Erro interno do servidor
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
```

### 1.2 Consolidation API (Resumida)

**Endpoints principais:**
- `GET /api/v1/consolidations/daily/:date` - Buscar consolidação de um dia
- `GET /api/v1/consolidations/period?startDate=X&endDate=Y` - Consolidação de período
- `POST /api/v1/consolidations/reprocess` - Reprocessar consolidação (admin)

### 1.3 Reporting API (Resumida)

**Endpoints principais:**
- `GET /api/v1/reports/daily/:date` - Relatório diário
- `GET /api/v1/reports/monthly/:yearMonth` - Relatório mensal
- `GET /api/v1/reports/summary` - Resumo geral
- `GET /api/v1/reports/categories` - Breakdown por categoria

---

## 2. Estratégia de Testes

### 2.1 Pirâmide de Testes

```
        /\
       /  \
      / E2E \      10% - Testes End-to-End
     /______\
    /        \
   /Integration\ 20% - Testes de Integração
  /____________\
 /              \
/  Unit Tests    \ 70% - Testes Unitários
/________________\
```

### 2.2 Testes Unitários (70% da cobertura)

**Objetivo:** Testar lógica de negócio isoladamente

**Ferramentas:**
- Jest (test runner)
- ts-jest (TypeScript support)

**O que testar:**
- ✅ Entities e Value Objects
- ✅ Domain Services
- ✅ Command/Query Handlers
- ✅ Validações de negócio
- ✅ Cálculos (ex: balance calculator)

**Exemplo:**
```typescript
// balance-calculator.service.spec.ts
describe('BalanceCalculatorService', () => {
  let service: BalanceCalculatorService;

  beforeEach(() => {
    service = new BalanceCalculatorService();
  });

  describe('calculateDailyBalance', () => {
    it('should calculate balance correctly with credits and debits', () => {
      const previousBalance = 1000;
      const credits = 500;
      const debits = 200;

      const result = service.calculateDailyBalance(
        previousBalance,
        credits,
        debits
      );

      expect(result).toBe(1300); // 1000 + 500 - 200
    });

    it('should handle zero transactions', () => {
      const previousBalance = 1000;
      const result = service.calculateDailyBalance(previousBalance, 0, 0);
      expect(result).toBe(1000);
    });

    it('should handle negative balance', () => {
      const previousBalance = 100;
      const credits = 0;
      const debits = 200;

      const result = service.calculateDailyBalance(
        previousBalance,
        credits,
        debits
      );

      expect(result).toBe(-100);
    });
  });
});
```

**Cobertura mínima:** 80% para domain layer

### 2.3 Testes de Integração (20% da cobertura)

**Objetivo:** Testar integração entre componentes

**Ferramentas:**
- Jest
- Supertest (HTTP testing)
- Testcontainers (Docker containers para testes)

**O que testar:**
- ✅ Repositories com banco de dados real
- ✅ Message consumers/publishers
- ✅ Cache (Redis)
- ✅ APIs internas

**Exemplo:**
```typescript
// prisma-transaction.repository.integration.spec.ts
describe('PrismaTransactionRepository (Integration)', () => {
  let repository: PrismaTransactionRepository;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Setup test database
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.TEST_DATABASE_URL }
      }
    });
    repository = new PrismaTransactionRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.transaction.deleteMany();
  });

  describe('create', () => {
    it('should persist transaction to database', async () => {
      const transaction = new Transaction({
        amount: 100,
        type: TransactionType.CREDIT,
        date: new Date('2026-05-26'),
        description: 'Test transaction'
      });

      const saved = await repository.create(transaction);

      expect(saved.id).toBeDefined();
      
      const found = await prisma.transaction.findUnique({
        where: { id: saved.id }
      });
      
      expect(found).toBeDefined();
      expect(found.amount).toBe(100);
    });
  });
});
```

### 2.4 Testes E2E (10% da cobertura)

**Objetivo:** Testar fluxos completos do usuário

**Ferramentas:**
- Jest
- Supertest
- Docker Compose (ambiente completo)

**O que testar:**
- ✅ Fluxos críticos de negócio
- ✅ Integração entre serviços
- ✅ Autenticação e autorização
- ✅ Error handling

**Exemplo:**
```typescript
// transaction-flow.e2e-spec.ts
describe('Transaction Flow (E2E)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create transaction and retrieve it', async () => {
    // Create transaction
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        idempotencyKey: uuidv4(),
        amount: 100,
        type: 'CREDIT',
        date: '2026-05-26',
        description: 'E2E Test Transaction'
      })
      .expect(201);

    const transactionId = createResponse.body.id;

    // Retrieve transaction
    const getResponse = await request(app.getHttpServer())
      .get(`/api/v1/transactions/${transactionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(getResponse.body.id).toBe(transactionId);
    expect(getResponse.body.amount).toBe(100);
  });

  it('should prevent duplicate transactions with same idempotency key', async () => {
    const idempotencyKey = uuidv4();

    // First request
    await request(app.getHttpServer())
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        idempotencyKey,
        amount: 100,
        type: 'CREDIT',
        date: '2026-05-26',
        description: 'Test'
      })
      .expect(201);

    // Second request with same key
    const response = await request(app.getHttpServer())
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        idempotencyKey,
        amount: 200, // Different amount
        type: 'DEBIT', // Different type
        date: '2026-05-26',
        description: 'Test 2'
      })
      .expect(200); // Returns existing transaction

    expect(response.body.amount).toBe(100); // Original amount
  });
});
```

### 2.5 Configuração de Testes

```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/main.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../../shared/$1',
    '^@app/(.*)$': '<rootDir>/src/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1'
  }
};
```

---

## 3. Segurança e Integração entre Serviços

### 3.1 Autenticação JWT

**Fluxo:**
```
1. Cliente → POST /auth/login (email, password)
2. API Gateway → Valida credenciais
3. API Gateway → Gera JWT (access + refresh tokens)
4. Cliente ← Retorna tokens
5. Cliente → Requisições com Authorization: Bearer <token>
6. API Gateway → Valida JWT
7. API Gateway → Forward para serviço com user context
```

**Estrutura do JWT:**
```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "role": "MERCHANT",
  "merchantId": "merchant_456",
  "iat": 1716724800,
  "exp": 1716725700
}
```

### 3.2 Comunicação entre Serviços

**Opção 1: Service-to-Service JWT**
```typescript
// Internal JWT for service communication
const internalToken = jwt.sign(
  {
    service: 'transactions-service',
    scope: ['read:consolidations']
  },
  INTERNAL_JWT_SECRET,
  { expiresIn: '5m' }
);
```

**Opção 2: mTLS (Mutual TLS)**
- Certificados para cada serviço
- Validação bidirecional
- Mais seguro, mas mais complexo

### 3.3 Rate Limiting

```typescript
// rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

export const rateLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:'
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'TooManyRequests',
      message: 'Rate limit exceeded',
      retryAfter: req.rateLimit.resetTime
    });
  }
});
```

### 3.4 Input Validation

```typescript
// create-transaction.dto.ts
import { z } from 'zod';

export const CreateTransactionSchema = z.object({
  idempotencyKey: z.string().uuid(),
  amount: z.number().positive().min(0.01),
  type: z.enum(['CREDIT', 'DEBIT']),
  date: z.string().date().refine(
    (date) => new Date(date) <= new Date(),
    'Date cannot be in the future'
  ),
  description: z.string().min(3).max(500),
  categoryId: z.string().optional()
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
```

### 3.5 Secrets Management

**Desenvolvimento:**
```bash
# .env (não commitado)
DATABASE_URL=postgresql://...
JWT_SECRET=dev-secret-key
REDIS_PASSWORD=dev-redis-pass
```

**Produção (Kubernetes):**
```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  database-url: <base64-encoded>
  jwt-secret: <base64-encoded>
  redis-password: <base64-encoded>
```

---

## 4. Estimativa de Custos de Infraestrutura

### 4.1 Cenário: AWS (Exemplo)

**Compute (ECS Fargate):**
- Transactions Service: 2 tasks × 0.5 vCPU × 1GB RAM = $30/mês
- Consolidation Service: 2 tasks × 0.5 vCPU × 1GB RAM = $30/mês
- Reporting Service: 2 tasks × 0.5 vCPU × 1GB RAM = $30/mês
- **Subtotal Compute:** $90/mês

**Database (RDS PostgreSQL):**
- db.t3.medium (2 vCPU, 4GB RAM) = $60/mês
- Storage: 100GB SSD = $11.50/mês
- Backup: 100GB = $9.50/mês
- **Subtotal Database:** $81/mês

**Cache (ElastiCache Redis):**
- cache.t3.micro (2 nodes para HA) = $25/mês
- **Subtotal Cache:** $25/mês

**Message Queue (Amazon MQ RabbitMQ):**
- mq.t3.micro (2 brokers para HA) = $40/mês
- **Subtotal MQ:** $40/mês

**Load Balancer (ALB):**
- Application Load Balancer = $22/mês
- Data transfer: ~$10/mês
- **Subtotal LB:** $32/mês

**Monitoring:**
- CloudWatch Logs: $5/mês
- CloudWatch Metrics: $3/mês
- **Subtotal Monitoring:** $8/mês

**Total Estimado (AWS):** ~$276/mês

### 4.2 Cenário: Self-Hosted (VPS)

**Servidor (Hetzner/DigitalOcean):**
- 4 vCPU, 8GB RAM, 160GB SSD = $40/mês
- Backup: $8/mês
- **Total:** $48/mês

**Observação:** Mais barato, mas requer mais trabalho operacional.

### 4.3 Cenário: Kubernetes (GKE/EKS)

**Cluster:**
- Control plane: $73/mês (GKE) ou $0 (EKS)
- Worker nodes: 3 × n1-standard-2 = $150/mês
- Load Balancer: $20/mês
- **Total:** ~$243/mês

### 4.4 Otimizações de Custo

- ✅ Usar spot instances para ambientes não-produtivos
- ✅ Auto-scaling para reduzir custos em horários de baixo tráfego
- ✅ Reserved instances para produção (desconto de 30-50%)
- ✅ Comprimir logs antes de armazenar
- ✅ Lifecycle policies para backups antigos

---

## 5. Monitoramento e Observabilidade

### 5.1 Métricas (Prometheus)

**Métricas de Aplicação:**
```typescript
// metrics.service.ts
import { Counter, Histogram, Gauge } from 'prom-client';

export class MetricsService {
  // Counters
  private transactionsCreated = new Counter({
    name: 'transactions_created_total',
    help: 'Total number of transactions created',
    labelNames: ['type', 'status']
  });

  private consolidationsProcessed = new Counter({
    name: 'consolidations_processed_total',
    help: 'Total number of consolidations processed',
    labelNames: ['status']
  });

  // Histograms
  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
  });

  private consolidationDuration = new Histogram({
    name: 'consolidation_duration_seconds',
    help: 'Duration of consolidation process',
    buckets: [1, 5, 10, 30, 60, 120, 300]
  });

  // Gauges
  private activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active database connections'
  });

  // Methods
  incrementTransactionsCreated(type: string, status: string) {
    this.transactionsCreated.inc({ type, status });
  }

  observeHttpDuration(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration);
  }
}
```

**Dashboards Grafana:**
- Dashboard de Performance (latência, throughput, erros)
- Dashboard de Negócio (transações/dia, saldo médio, categorias)
- Dashboard de Infraestrutura (CPU, memória, disco, rede)

### 5.2 Logs (ELK Stack)

**Structured Logging:**
```typescript
// logger.service.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'transactions-service',
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('Transaction created', {
  transactionId: 'txn_123',
  amount: 100,
  type: 'CREDIT',
  userId: 'user_456',
  correlationId: 'req_789'
});
```

### 5.3 Distributed Tracing (Jaeger)

```typescript
// tracing.service.ts
import { initTracer } from 'jaeger-client';

const tracer = initTracer({
  serviceName: 'transactions-service',
  sampler: {
    type: 'probabilistic',
    param: 0.1 // Sample 10% of traces
  },
  reporter: {
    agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
    agentPort: 6831
  }
});

// Usage in handler
const span = tracer.startSpan('create-transaction');
span.setTag('transaction.id', transactionId);
span.setTag('transaction.amount', amount);

try {
  // Business logic
  await this.repository.save(transaction);
  span.setTag('status', 'success');
} catch (error) {
  span.setTag('error', true);
  span.log({ event: 'error', message: error.message });
  throw error;
} finally {
  span.finish();
}
```

### 5.4 Alertas

**Prometheus Alerting Rules:**
```yaml
# alerts.yml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (threshold: 0.05)"

      - alert: HighLatency
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}s (threshold: 1s)"

      - alert: ConsolidationFailed
        expr: consolidations_processed_total{status="failed"} > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Consolidation process failed"
          description: "{{ $value }} consolidations failed"
```

---

## 6. Checklist de Implementação

### Fase 1: Setup Inicial (Semana 1)
- [ ] Criar estrutura de monorepo
- [ ] Configurar Docker Compose
- [ ] Setup de bancos de dados (PostgreSQL)
- [ ] Setup de Redis e RabbitMQ
- [ ] Configurar ESLint, Prettier, TypeScript
- [ ] Criar CI/CD pipeline básico

### Fase 2: Transactions Service (Semanas 2-3)
- [ ] Implementar domain layer (entities, VOs, events)
- [ ] Implementar repositories (Prisma)
- [ ] Implementar command handlers
- [ ] Implementar query handlers
- [ ] Criar controllers e rotas
- [ ] Implementar validações
- [ ] Adicionar testes unitários
- [ ] Adicionar testes de integração
- [ ] Configurar event publishing

### Fase 3: Consolidation Service (Semanas 4-5)
- [ ] Implementar domain layer
- [ ] Implementar balance calculator
- [ ] Criar event consumers
- [ ] Implementar job agendado (cron)
- [ ] Adicionar idempotência
- [ ] Implementar retry logic
- [ ] Adicionar testes
- [ ] Configurar alertas

### Fase 4: Reporting Service (Semana 6)
- [ ] Implementar read models
- [ ] Criar materialized views
- [ ] Implementar cache layer
- [ ] Criar APIs de consulta
- [ ] Adicionar testes
- [ ] Otimizar queries

### Fase 5: Observabilidade (Semana 7)
- [ ] Configurar Prometheus
- [ ] Criar dashboards Grafana
- [ ] Setup ELK Stack
- [ ] Implementar distributed tracing
- [ ] Configurar alertas
- [ ] Criar runbooks

### Fase 6: Segurança (Semana 8)
- [ ] Implementar autenticação JWT
- [ ] Adicionar rate limiting
- [ ] Configurar CORS
- [ ] Implementar input validation
- [ ] Security audit (OWASP)
- [ ] Penetration testing

### Fase 7: Documentação (Semana 9)
- [ ] Documentar APIs (OpenAPI)
- [ ] Criar README completo
- [ ] Documentar deployment
- [ ] Criar guias de troubleshooting
- [ ] Documentar arquitetura
- [ ] Criar ADRs

### Fase 8: Deploy e Testes (Semana 10-12)
- [ ] Deploy em ambiente de staging
- [ ] Testes de carga
- [ ] Testes de resiliência (chaos engineering)
- [ ] Ajustes de performance
- [ ] Deploy em produção
- [ ] Monitoramento pós-deploy

---

## 7. Métricas de Sucesso

### 7.1 Performance
- ✅ Latência P95 < 200ms (Transactions API)
- ✅ Latência P95 < 500ms (Consolidation API)
- ✅ Throughput > 50 req/s em picos
- ✅ Perda < 5% em picos

### 7.2 Disponibilidade
- ✅ Uptime > 99.9% (Transactions)
- ✅ Uptime > 99.5% (Consolidation)
- ✅ RTO < 15 minutos
- ✅ RPO < 5 minutos

### 7.3 Qualidade
- ✅ Cobertura de testes > 80%
- ✅ Zero vulnerabilidades críticas
- ✅ SonarQube score > 80%
- ✅ Documentação completa

### 7.4 Negócio
- ✅ 100% das consolidações processadas com sucesso
- ✅ Relatórios disponíveis em < 1 minuto após consolidação
- ✅ Zero perda de dados financeiros