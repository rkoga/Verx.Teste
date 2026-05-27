# Estrutura de Pastas e Organização do Código

## 1. Estrutura Geral do Monorepo

```
cash-flow-system/
├── .github/                          # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── security-scan.yml
├── services/                         # Microserviços
│   ├── transactions/
│   ├── consolidation/
│   └── reporting/
├── shared/                           # Código compartilhado
│   ├── domain/
│   ├── infrastructure/
│   └── types/
├── infrastructure/                   # IaC e configurações
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
├── docs/                            # Documentação
│   ├── 01-domain-mapping.md
│   ├── 02-requirements.md
│   ├── 03-target-architecture.md
│   ├── 04-architecture-diagrams.md
│   ├── 05-architectural-decisions.md
│   ├── 06-project-structure.md
│   └── api/
├── scripts/                         # Scripts utilitários
│   ├── setup.sh
│   ├── seed-db.sh
│   └── backup.sh
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml               # Desenvolvimento local
├── docker-compose.prod.yml          # Produção
├── package.json                     # Root package.json
├── tsconfig.json                    # TypeScript config base
├── nx.json                          # Nx configuration (opcional)
└── README.md                        # Documentação principal
```

## 2. Estrutura do Transactions Service

```
services/transactions/
├── src/
│   ├── main.ts                      # Entry point
│   ├── app.module.ts                # Root module (NestJS)
│   │
│   ├── application/                 # Application Layer (Use Cases)
│   │   ├── commands/
│   │   │   ├── create-transaction/
│   │   │   │   ├── create-transaction.command.ts
│   │   │   │   ├── create-transaction.handler.ts
│   │   │   │   └── create-transaction.handler.spec.ts
│   │   │   ├── cancel-transaction/
│   │   │   │   ├── cancel-transaction.command.ts
│   │   │   │   ├── cancel-transaction.handler.ts
│   │   │   │   └── cancel-transaction.handler.spec.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── queries/
│   │   │   ├── get-transaction/
│   │   │   │   ├── get-transaction.query.ts
│   │   │   │   ├── get-transaction.handler.ts
│   │   │   │   └── get-transaction.handler.spec.ts
│   │   │   ├── list-transactions/
│   │   │   │   ├── list-transactions.query.ts
│   │   │   │   ├── list-transactions.handler.ts
│   │   │   │   └── list-transactions.handler.spec.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── dtos/                    # Data Transfer Objects
│   │   │   ├── create-transaction.dto.ts
│   │   │   ├── transaction-response.dto.ts
│   │   │   └── list-transactions.dto.ts
│   │   │
│   │   └── application.module.ts
│   │
│   ├── domain/                      # Domain Layer (Business Logic)
│   │   ├── entities/
│   │   │   ├── transaction.entity.ts
│   │   │   ├── transaction.entity.spec.ts
│   │   │   ├── category.entity.ts
│   │   │   └── merchant.entity.ts
│   │   │
│   │   ├── value-objects/
│   │   │   ├── money.vo.ts
│   │   │   ├── money.vo.spec.ts
│   │   │   ├── transaction-type.vo.ts
│   │   │   ├── transaction-status.vo.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── events/
│   │   │   ├── transaction-created.event.ts
│   │   │   ├── transaction-cancelled.event.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── repositories/            # Repository Interfaces
│   │   │   ├── transaction.repository.interface.ts
│   │   │   └── category.repository.interface.ts
│   │   │
│   │   ├── services/                # Domain Services
│   │   │   ├── transaction-validator.service.ts
│   │   │   └── transaction-validator.service.spec.ts
│   │   │
│   │   └── domain.module.ts
│   │
│   ├── infrastructure/              # Infrastructure Layer
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   ├── migrations/
│   │   │   │   └── seed.ts
│   │   │   ├── repositories/
│   │   │   │   ├── prisma-transaction.repository.ts
│   │   │   │   ├── prisma-transaction.repository.spec.ts
│   │   │   │   └── prisma-category.repository.ts
│   │   │   └── database.module.ts
│   │   │
│   │   ├── messaging/
│   │   │   ├── rabbitmq/
│   │   │   │   ├── rabbitmq.publisher.ts
│   │   │   │   ├── rabbitmq.config.ts
│   │   │   │   └── rabbitmq.module.ts
│   │   │   └── events/
│   │   │       └── event-publisher.interface.ts
│   │   │
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   │   ├── transaction.controller.ts
│   │   │   │   ├── transaction.controller.spec.ts
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── index.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── logging.middleware.ts
│   │   │   │   └── rate-limit.middleware.ts
│   │   │   ├── filters/
│   │   │   │   ├── http-exception.filter.ts
│   │   │   │   └── validation-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   └── transform.interceptor.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── http.module.ts
│   │   │
│   │   ├── cache/
│   │   │   ├── redis.service.ts
│   │   │   ├── redis.service.spec.ts
│   │   │   └── cache.module.ts
│   │   │
│   │   └── infrastructure.module.ts
│   │
│   ├── shared/                      # Shared dentro do serviço
│   │   ├── decorators/
│   │   │   ├── api-response.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── utils/
│   │   │   ├── logger.util.ts
│   │   │   └── date.util.ts
│   │   └── constants/
│   │       └── app.constants.ts
│   │
│   └── config/                      # Configurações
│       ├── app.config.ts
│       ├── database.config.ts
│       ├── rabbitmq.config.ts
│       └── redis.config.ts
│
├── test/                            # Testes E2E
│   ├── app.e2e-spec.ts
│   ├── transaction.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example                     # Exemplo de variáveis
├── .env.test                        # Variáveis de teste
├── .eslintrc.js
├── .prettierrc
├── Dockerfile
├── Dockerfile.dev
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

## 3. Estrutura do Consolidation Service

```
services/consolidation/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── application/
│   │   ├── commands/
│   │   │   ├── process-consolidation/
│   │   │   │   ├── process-consolidation.command.ts
│   │   │   │   ├── process-consolidation.handler.ts
│   │   │   │   └── process-consolidation.handler.spec.ts
│   │   │   ├── reprocess-consolidation/
│   │   │   │   ├── reprocess-consolidation.command.ts
│   │   │   │   ├── reprocess-consolidation.handler.ts
│   │   │   │   └── reprocess-consolidation.handler.spec.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── queries/
│   │   │   ├── get-daily-balance/
│   │   │   │   ├── get-daily-balance.query.ts
│   │   │   │   ├── get-daily-balance.handler.ts
│   │   │   │   └── get-daily-balance.handler.spec.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── dtos/
│   │   │   ├── consolidation-response.dto.ts
│   │   │   └── daily-balance.dto.ts
│   │   │
│   │   └── application.module.ts
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── daily-consolidation.entity.ts
│   │   │   ├── daily-consolidation.entity.spec.ts
│   │   │   ├── balance-snapshot.entity.ts
│   │   │   └── consolidation-version.entity.ts
│   │   │
│   │   ├── value-objects/
│   │   │   ├── consolidation-status.vo.ts
│   │   │   ├── balance.vo.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── events/
│   │   │   ├── consolidation-completed.event.ts
│   │   │   ├── consolidation-failed.event.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── repositories/
│   │   │   ├── consolidation.repository.interface.ts
│   │   │   └── transaction.repository.interface.ts
│   │   │
│   │   ├── services/
│   │   │   ├── balance-calculator.service.ts
│   │   │   ├── balance-calculator.service.spec.ts
│   │   │   ├── idempotency.service.ts
│   │   │   └── idempotency.service.spec.ts
│   │   │
│   │   └── domain.module.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   ├── repositories/
│   │   │   │   ├── prisma-consolidation.repository.ts
│   │   │   │   └── prisma-transaction.repository.ts
│   │   │   └── database.module.ts
│   │   │
│   │   ├── messaging/
│   │   │   ├── consumers/
│   │   │   │   ├── transaction-created.consumer.ts
│   │   │   │   ├── transaction-created.consumer.spec.ts
│   │   │   │   ├── transaction-cancelled.consumer.ts
│   │   │   │   └── index.ts
│   │   │   ├── publishers/
│   │   │   │   └── consolidation-event.publisher.ts
│   │   │   └── messaging.module.ts
│   │   │
│   │   ├── schedulers/
│   │   │   ├── daily-consolidation.scheduler.ts
│   │   │   ├── daily-consolidation.scheduler.spec.ts
│   │   │   ├── retry-failed.scheduler.ts
│   │   │   └── schedulers.module.ts
│   │   │
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   │   ├── consolidation.controller.ts
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── index.ts
│   │   │   └── http.module.ts
│   │   │
│   │   └── infrastructure.module.ts
│   │
│   ├── shared/
│   │   ├── decorators/
│   │   ├── utils/
│   │   └── constants/
│   │
│   └── config/
│       ├── app.config.ts
│       ├── database.config.ts
│       ├── rabbitmq.config.ts
│       └── scheduler.config.ts
│
├── test/
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## 4. Estrutura do Reporting Service

```
services/reporting/
├── src/
│   ├── main.ts
│   ├── app.ts                       # Express app
│   │
│   ├── application/
│   │   ├── queries/
│   │   │   ├── get-daily-report/
│   │   │   │   ├── get-daily-report.query.ts
│   │   │   │   ├── get-daily-report.handler.ts
│   │   │   │   └── get-daily-report.handler.spec.ts
│   │   │   ├── get-monthly-report/
│   │   │   │   ├── get-monthly-report.query.ts
│   │   │   │   ├── get-monthly-report.handler.ts
│   │   │   │   └── get-monthly-report.handler.spec.ts
│   │   │   ├── get-summary/
│   │   │   │   ├── get-summary.query.ts
│   │   │   │   ├── get-summary.handler.ts
│   │   │   │   └── get-summary.handler.spec.ts
│   │   │   └── index.ts
│   │   │
│   │   └── dtos/
│   │       ├── daily-report.dto.ts
│   │       ├── monthly-report.dto.ts
│   │       └── summary.dto.ts
│   │
│   ├── domain/
│   │   ├── read-models/
│   │   │   ├── daily-report.model.ts
│   │   │   ├── monthly-summary.model.ts
│   │   │   └── category-breakdown.model.ts
│   │   │
│   │   ├── projections/
│   │   │   ├── daily-projection.ts
│   │   │   └── monthly-projection.ts
│   │   │
│   │   └── repositories/
│   │       └── report.repository.interface.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   ├── repositories/
│   │   │   │   └── prisma-report.repository.ts
│   │   │   ├── materialized-views/
│   │   │   │   ├── daily-report.view.sql
│   │   │   │   └── monthly-summary.view.sql
│   │   │   └── database.module.ts
│   │   │
│   │   ├── cache/
│   │   │   ├── redis.service.ts
│   │   │   └── cache.module.ts
│   │   │
│   │   ├── messaging/
│   │   │   ├── consumers/
│   │   │   │   ├── consolidation-completed.consumer.ts
│   │   │   │   └── index.ts
│   │   │   └── messaging.module.ts
│   │   │
│   │   └── http/
│   │       ├── routes/
│   │       │   ├── report.routes.ts
│   │       │   ├── health.routes.ts
│   │       │   └── index.ts
│   │       ├── middlewares/
│   │       │   ├── auth.middleware.ts
│   │       │   ├── cache.middleware.ts
│   │       │   └── error-handler.middleware.ts
│   │       └── controllers/
│   │           ├── report.controller.ts
│   │           └── health.controller.ts
│   │
│   ├── shared/
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   └── response.ts
│   │   └── constants/
│   │
│   └── config/
│       ├── app.config.ts
│       ├── database.config.ts
│       ├── redis.config.ts
│       └── rabbitmq.config.ts
│
├── test/
├── .env.example
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## 5. Estrutura do Shared (Código Compartilhado)

```
shared/
├── domain/                          # Domain compartilhado
│   ├── value-objects/
│   │   ├── money.vo.ts
│   │   ├── date-range.vo.ts
│   │   └── index.ts
│   │
│   ├── events/
│   │   ├── domain-event.interface.ts
│   │   ├── event-metadata.ts
│   │   └── index.ts
│   │
│   └── exceptions/
│       ├── domain.exception.ts
│       ├── validation.exception.ts
│       └── index.ts
│
├── infrastructure/                  # Infrastructure compartilhada
│   ├── logging/
│   │   ├── logger.interface.ts
│   │   ├── winston-logger.ts
│   │   └── index.ts
│   │
│   ├── monitoring/
│   │   ├── metrics.service.ts
│   │   ├── tracing.service.ts
│   │   └── index.ts
│   │
│   ├── security/
│   │   ├── jwt.service.ts
│   │   ├── encryption.service.ts
│   │   └── index.ts
│   │
│   └── utils/
│       ├── date.util.ts
│       ├── validation.util.ts
│       └── index.ts
│
├── types/                           # TypeScript types compartilhados
│   ├── api/
│   │   ├── request.types.ts
│   │   ├── response.types.ts
│   │   └── index.ts
│   │
│   ├── domain/
│   │   ├── transaction.types.ts
│   │   ├── consolidation.types.ts
│   │   └── index.ts
│   │
│   └── common/
│       ├── pagination.types.ts
│       ├── filter.types.ts
│       └── index.ts
│
├── package.json
└── tsconfig.json
```

## 6. Estrutura de Infrastructure (IaC)

```
infrastructure/
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── Dockerfile
│   ├── postgres/
│   │   ├── init.sql
│   │   └── Dockerfile
│   └── monitoring/
│       ├── prometheus/
│       │   └── prometheus.yml
│       └── grafana/
│           ├── dashboards/
│           └── datasources/
│
├── kubernetes/
│   ├── base/                        # Kustomize base
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secrets.yaml
│   │   └── kustomization.yaml
│   │
│   ├── services/
│   │   ├── transactions/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── hpa.yaml
│   │   │   └── kustomization.yaml
│   │   ├── consolidation/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   ├── cronjob.yaml
│   │   │   └── kustomization.yaml
│   │   └── reporting/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       └── kustomization.yaml
│   │
│   ├── data/
│   │   ├── postgres/
│   │   │   ├── statefulset.yaml
│   │   │   ├── service.yaml
│   │   │   ├── pvc.yaml
│   │   │   └── kustomization.yaml
│   │   ├── redis/
│   │   │   ├── statefulset.yaml
│   │   │   ├── service.yaml
│   │   │   └── kustomization.yaml
│   │   └── rabbitmq/
│   │       ├── statefulset.yaml
│   │       ├── service.yaml
│   │       └── kustomization.yaml
│   │
│   ├── monitoring/
│   │   ├── prometheus/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── configmap.yaml
│   │   ├── grafana/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   └── jaeger/
│   │       ├── deployment.yaml
│   │       └── service.yaml
│   │
│   ├── ingress/
│   │   ├── ingress.yaml
│   │   └── certificate.yaml
│   │
│   └── overlays/                    # Kustomize overlays
│       ├── development/
│       │   └── kustomization.yaml
│       ├── staging/
│       │   └── kustomization.yaml
│       └── production/
│           └── kustomization.yaml
│
└── terraform/                       # Opcional para cloud
    ├── aws/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── gcp/
    └── azure/
```

## 7. Convenções de Nomenclatura

### 7.1 Arquivos
- **Entities:** `*.entity.ts` (ex: `transaction.entity.ts`)
- **Value Objects:** `*.vo.ts` (ex: `money.vo.ts`)
- **DTOs:** `*.dto.ts` (ex: `create-transaction.dto.ts`)
- **Interfaces:** `*.interface.ts` (ex: `repository.interface.ts`)
- **Services:** `*.service.ts` (ex: `balance-calculator.service.ts`)
- **Controllers:** `*.controller.ts` (ex: `transaction.controller.ts`)
- **Modules:** `*.module.ts` (ex: `database.module.ts`)
- **Tests:** `*.spec.ts` (unit) ou `*.e2e-spec.ts` (e2e)

### 7.2 Classes e Interfaces
- **Classes:** PascalCase (ex: `Transaction`, `BalanceCalculator`)
- **Interfaces:** PascalCase com prefixo `I` (ex: `ITransactionRepository`)
- **Types:** PascalCase (ex: `TransactionType`)
- **Enums:** PascalCase (ex: `TransactionStatus`)

### 7.3 Variáveis e Funções
- **Variáveis:** camelCase (ex: `transactionId`, `dailyBalance`)
- **Constantes:** UPPER_SNAKE_CASE (ex: `MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Funções:** camelCase (ex: `calculateBalance`, `validateTransaction`)
- **Métodos privados:** prefixo `_` (ex: `_validateAmount`)

### 7.4 Diretórios
- **Kebab-case:** (ex: `daily-consolidation`, `balance-calculator`)
- **Plural para coleções:** (ex: `entities`, `services`, `controllers`)

## 8. Padrões de Importação

```typescript
// 1. Node.js built-in modules
import { readFile } from 'fs/promises';

// 2. External dependencies
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// 3. Shared modules (alias @shared)
import { Money } from '@shared/domain/value-objects';
import { Logger } from '@shared/infrastructure/logging';

// 4. Internal modules (relative paths)
import { Transaction } from '../entities/transaction.entity';
import { ITransactionRepository } from '../repositories/transaction.repository.interface';
```

## 9. Configuração de Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["shared/*"],
      "@app/*": ["src/*"],
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"]
    }
  }
}
```

## 10. Estrutura de Testes

```
test/
├── unit/                            # Testes unitários
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── services/
│   ├── application/
│   │   ├── commands/
│   │   └── queries/
│   └── infrastructure/
│
├── integration/                     # Testes de integração
│   ├── database/
│   ├── messaging/
│   └── http/
│
├── e2e/                            # Testes end-to-end
│   ├── transactions.e2e-spec.ts
│   ├── consolidation.e2e-spec.ts
│   └── reporting.e2e-spec.ts
│
├── fixtures/                       # Dados de teste
│   ├── transactions.fixture.ts
│   └── consolidations.fixture.ts
│
├── mocks/                          # Mocks
│   ├── repositories/
│   └── services/
│
└── helpers/                        # Helpers de teste
    ├── database.helper.ts
    └── auth.helper.ts
```

## 11. Documentação de APIs

```
docs/api/
├── openapi/
│   ├── transactions-api.yaml       # OpenAPI spec
│   ├── consolidation-api.yaml
│   └── reporting-api.yaml
│
├── postman/
│   ├── cash-flow.postman_collection.json
│   └── cash-flow.postman_environment.json
│
└── examples/
    ├── create-transaction.md
    ├── get-daily-balance.md
    └── generate-report.md
```

## 12. Scripts Úteis

```json
// package.json (root)
{
  "scripts": {
    "dev": "docker-compose up",
    "dev:build": "docker-compose up --build",
    "dev:down": "docker-compose down",
    
    "build": "npm run build --workspaces",
    "build:transactions": "npm run build -w services/transactions",
    "build:consolidation": "npm run build -w services/consolidation",
    "build:reporting": "npm run build -w services/reporting",
    
    "test": "npm run test --workspaces",
    "test:unit": "npm run test:unit --workspaces",
    "test:integration": "npm run test:integration --workspaces",
    "test:e2e": "npm run test:e2e --workspaces",
    "test:coverage": "npm run test:coverage --workspaces",
    
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "format": "prettier --write \"**/*.{ts,json,md}\"",
    
    "db:migrate": "npm run db:migrate --workspaces",
    "db:seed": "npm run db:seed --workspaces",
    "db:reset": "npm run db:reset --workspaces",
    
    "docker:build": "docker-compose -f docker-compose.prod.yml build",
    "docker:push": "docker-compose -f docker-compose.prod.yml push",
    
    "k8s:apply": "kubectl apply -k infrastructure/kubernetes/overlays/production",
    "k8s:delete": "kubectl delete -k infrastructure/kubernetes/overlays/production"
  }
}
```

## 13. Variáveis de Ambiente

```bash
# .env.example (root)

# Application
NODE_ENV=development
LOG_LEVEL=debug

# Transactions Service
TRANSACTIONS_PORT=3001
TRANSACTIONS_DB_URL=postgresql://user:pass@localhost:5432/transactions

# Consolidation Service
CONSOLIDATION_PORT=3002
CONSOLIDATION_DB_URL=postgresql://user:pass@localhost:5432/consolidation
CONSOLIDATION_CRON=0 0 * * *

# Reporting Service
REPORTING_PORT=3003
REPORTING_DB_URL=postgresql://user:pass@localhost:5432/reporting

# PostgreSQL
POSTGRES_USER=cashflow
POSTGRES_PASSWORD=secret
POSTGRES_DB=cashflow

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
JAEGER_PORT=16686
```

## 14. Boas Práticas

### 14.1 Organização de Código
- ✅ Seguir Clean Architecture (camadas bem definidas)
- ✅ Dependency Injection para desacoplamento
- ✅ Interfaces para abstrações
- ✅ Single Responsibility Principle

### 14.2 Testes
- ✅ Testes unitários para lógica de negócio
- ✅ Testes de integração para repositórios
- ✅ Testes E2E para fluxos críticos
- ✅ Mocks para dependências externas

### 14.3 Documentação
- ✅ README em cada serviço
- ✅ JSDoc para funções públicas
- ✅ OpenAPI para APIs
- ✅ ADRs para decisões importantes

### 14.4 Versionamento
- ✅ Semantic Versioning (semver)
- ✅ Conventional Commits
- ✅ Changelog automático
- ✅ Git tags para releases