# Architectural Decision Records (ADRs)

## ADR-001: Adoção de Arquitetura de Microserviços Event-Driven

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Arquitetura

### Contexto
Precisamos definir o estilo arquitetural para o sistema de controle de fluxo de caixa que atenda aos requisitos de:
- Independência entre serviço de lançamentos e consolidação
- Alta disponibilidade (99.9% para lançamentos)
- Escalabilidade para 50 req/s em picos
- Tolerância a falhas

### Decisão
Adotaremos uma **arquitetura de microserviços event-driven** com os seguintes serviços:
1. Transactions Service (write model)
2. Consolidation Service (processor)
3. Reporting Service (read model)

Comunicação assíncrona via message broker (RabbitMQ) para desacoplamento.

### Consequências

**Positivas:**
- ✅ Desacoplamento total entre serviços
- ✅ Escalabilidade independente por serviço
- ✅ Resiliência: falha em um serviço não afeta outros
- ✅ Facilita evolução independente
- ✅ Permite CQRS para otimização de leitura/escrita

**Negativas:**
- ❌ Complexidade operacional aumentada
- ❌ Eventual consistency entre serviços
- ❌ Necessidade de distributed tracing
- ❌ Overhead de infraestrutura (mais containers)

**Mitigações:**
- Usar Docker Compose para simplificar desenvolvimento local
- Implementar health checks e circuit breakers
- Documentação clara de APIs e eventos
- Monitoramento robusto (Prometheus + Grafana)

---

## ADR-002: Escolha de Node.js com TypeScript

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Desenvolvimento

### Contexto
Precisamos escolher a stack tecnológica para implementar os microserviços, considerando:
- Experiência da equipe
- Performance para I/O intensivo
- Ecossistema de bibliotecas
- Type safety
- Facilidade de contratação

### Decisão
Utilizaremos **Node.js 20 LTS com TypeScript 5+** para todos os serviços.

**Frameworks:**
- NestJS para Transactions e Consolidation (estrutura modular)
- Express para Reporting (lightweight para reads)

### Consequências

**Positivas:**
- ✅ Excelente performance para I/O assíncrono
- ✅ Type safety com TypeScript reduz bugs
- ✅ Ecossistema npm rico
- ✅ Single language (JavaScript) para frontend e backend
- ✅ Facilita contratação (linguagem popular)
- ✅ NestJS oferece DI, decorators, modularidade

**Negativas:**
- ❌ Single-threaded (mitigado com clustering)
- ❌ Menos performático que Go/Rust para CPU-intensive
- ❌ Tipagem não é nativa (requer compilação)

**Alternativas Consideradas:**
- Java + Spring Boot: Mais verboso, maior consumo de memória
- Python + FastAPI: Performance inferior para alta concorrência
- Go: Curva de aprendizado, menos bibliotecas

---

## ADR-003: PostgreSQL como Banco de Dados Principal

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Arquitetura

### Contexto
Precisamos escolher o banco de dados que atenda:
- Transações ACID (dados financeiros)
- Suporte a queries complexas
- Confiabilidade e maturidade
- Open-source (sem custos de licença)
- Suporte a JSON (flexibilidade)

### Decisão
Utilizaremos **PostgreSQL 15+** como banco de dados principal para todos os serviços.

**Estratégia:**
- Database per service (cada serviço tem seu schema)
- Prisma como ORM para type-safety
- Migrations versionadas

### Consequências

**Positivas:**
- ✅ ACID completo (essencial para finanças)
- ✅ Excelente performance para reads e writes
- ✅ Suporte a JSON/JSONB (flexibilidade)
- ✅ Índices avançados (B-tree, GiST, GIN)
- ✅ Replicação nativa (read replicas)
- ✅ Open-source (sem custos de licença)
- ✅ Comunidade ativa e madura

**Negativas:**
- ❌ Escalabilidade horizontal limitada (vs NoSQL)
- ❌ Requer tuning para alta performance

**Alternativas Consideradas:**
- MySQL: Menos features avançadas
- MongoDB: Sem ACID completo (não adequado para finanças)
- CockroachDB: Complexidade adicional, menos maduro

---

## ADR-004: RabbitMQ como Message Broker

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Arquitetura

### Contexto
Precisamos um message broker para comunicação assíncrona entre serviços que ofereça:
- Garantia de entrega (at-least-once)
- Dead Letter Queues
- Facilidade de operação
- Performance adequada (50 req/s)

### Decisão
Utilizaremos **RabbitMQ** como message broker principal.

**Padrões:**
- Topic Exchange para eventos de domínio
- Dead Letter Queues para mensagens com falha
- Prefetch count para controle de throughput

### Consequências

**Positivas:**
- ✅ Confiável e maduro (usado em produção há anos)
- ✅ Suporte a múltiplos padrões (pub/sub, routing, etc)
- ✅ Dead Letter Queues nativas
- ✅ Management UI para debugging
- ✅ Plugins para monitoring (Prometheus)
- ✅ Menor complexidade operacional que Kafka

**Negativas:**
- ❌ Menor throughput que Kafka (suficiente para nosso caso)
- ❌ Não é ideal para event sourcing completo

**Alternativas Consideradas:**
- Apache Kafka: Overkill para 50 req/s, maior complexidade
- Redis Pub/Sub: Sem garantia de entrega
- AWS SQS: Vendor lock-in

---

## ADR-005: Redis para Cache Distribuído

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Arquitetura

### Contexto
Precisamos de cache para:
- Reduzir latência de queries frequentes
- Diminuir carga no banco de dados
- Melhorar performance de relatórios
- Session storage (futuro)

### Decisão
Utilizaremos **Redis 7+** como cache distribuído.

**Estratégias:**
- Cache-aside pattern
- TTL de 5 minutos para queries
- Invalidação via eventos

### Consequências

**Positivas:**
- ✅ Extremamente rápido (in-memory)
- ✅ Suporte a estruturas de dados complexas
- ✅ Pub/Sub nativo
- ✅ Persistência opcional
- ✅ Clustering para HA

**Negativas:**
- ❌ Limitado pela memória disponível
- ❌ Requer estratégia de eviction

**Alternativas Consideradas:**
- Memcached: Menos features
- In-memory cache: Não distribuído

---

## ADR-006: CQRS Pattern para Separação de Leitura/Escrita

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Arquitetura

### Contexto
Temos requisitos diferentes para:
- **Writes:** Validação rigorosa, consistência forte
- **Reads:** Performance, queries complexas, agregações

### Decisão
Implementaremos **CQRS (Command Query Responsibility Segregation)**:
- **Write Model:** Transactions Service (comandos)
- **Read Model:** Reporting Service (queries otimizadas)
- Sincronização via eventos

### Consequências

**Positivas:**
- ✅ Otimização independente de reads e writes
- ✅ Escalabilidade diferenciada
- ✅ Queries complexas sem impactar writes
- ✅ Materialized views para performance

**Negativas:**
- ❌ Eventual consistency
- ❌ Complexidade adicional
- ❌ Sincronização de dados

**Mitigações:**
- Documentar claramente o delay de sincronização
- Implementar retry e idempotência
- Monitorar lag entre write e read models

---

## ADR-007: Prisma como ORM

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Desenvolvimento

### Contexto
Precisamos de um ORM que ofereça:
- Type safety com TypeScript
- Migrations automáticas
- Query builder intuitivo
- Performance adequada

### Decisão
Utilizaremos **Prisma** como ORM para todos os serviços.

### Consequências

**Positivas:**
- ✅ Type-safe queries (auto-completion)
- ✅ Migrations declarativas
- ✅ Prisma Studio para debugging
- ✅ Excelente DX (Developer Experience)
- ✅ Suporte a múltiplos bancos

**Negativas:**
- ❌ Menos maduro que TypeORM
- ❌ Queries complexas podem ser verbosas

**Alternativas Consideradas:**
- TypeORM: Mais maduro, mas menos type-safe
- Sequelize: API menos intuitiva
- Knex: Muito low-level

---

## ADR-008: Docker para Containerização

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de DevOps

### Contexto
Precisamos garantir:
- Portabilidade entre ambientes
- Isolamento de dependências
- Facilidade de deployment
- Reprodutibilidade

### Decisão
Utilizaremos **Docker** para containerizar todos os serviços.

**Estratégias:**
- Multi-stage builds para otimização
- Docker Compose para desenvolvimento local
- Kubernetes-ready para produção

### Consequências

**Positivas:**
- ✅ Portabilidade total (dev = prod)
- ✅ Isolamento de dependências
- ✅ Facilita CI/CD
- ✅ Ecossistema maduro

**Negativas:**
- ❌ Overhead de recursos (mínimo)
- ❌ Curva de aprendizado inicial

---

## ADR-009: Prometheus + Grafana para Observabilidade

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de DevOps

### Contexto
Precisamos de observabilidade completa:
- Métricas de performance
- Alertas proativos
- Dashboards visuais
- Open-source

### Decisão
Stack de observabilidade:
- **Prometheus:** Coleta de métricas
- **Grafana:** Visualização e dashboards
- **Jaeger:** Distributed tracing
- **ELK Stack:** Logs centralizados

### Consequências

**Positivas:**
- ✅ Stack open-source completa
- ✅ Integração nativa com Kubernetes
- ✅ Comunidade ativa
- ✅ Dashboards prontos disponíveis

**Negativas:**
- ❌ Múltiplas ferramentas para gerenciar
- ❌ Requer configuração inicial

**Alternativas Consideradas:**
- Datadog/New Relic: Custos elevados
- CloudWatch: Vendor lock-in AWS

---

## ADR-010: JWT para Autenticação

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Segurança

### Contexto
Precisamos de autenticação que seja:
- Stateless (escalável)
- Segura
- Padrão da indústria
- Suporte a refresh tokens

### Decisão
Utilizaremos **JWT (JSON Web Tokens)** com:
- Algoritmo RS256 (asymmetric)
- Access token: 15 minutos
- Refresh token: 7 dias
- HttpOnly cookies para refresh tokens

### Consequências

**Positivas:**
- ✅ Stateless (não requer session storage)
- ✅ Escalável horizontalmente
- ✅ Padrão da indústria
- ✅ Suporte em todas as linguagens

**Negativas:**
- ❌ Não pode ser revogado facilmente
- ❌ Payload visível (não criptografado)

**Mitigações:**
- Tokens de curta duração
- Blacklist para revogação (Redis)
- Não armazenar dados sensíveis no payload

---

## ADR-011: Soft Delete para Auditoria

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Negócio

### Contexto
Dados financeiros requerem:
- Auditoria completa
- Rastreabilidade
- Compliance (7 anos de retenção)
- Impossibilidade de deleção real

### Decisão
Implementaremos **soft delete** para todas as entidades críticas:
- Campo `deleted_at` (nullable)
- Campo `status` (ACTIVE, CANCELLED, etc)
- Queries filtram automaticamente deletados

### Consequências

**Positivas:**
- ✅ Auditoria completa
- ✅ Recuperação de dados possível
- ✅ Compliance com regulações
- ✅ Histórico preservado

**Negativas:**
- ❌ Banco de dados cresce continuamente
- ❌ Queries mais complexas (filtrar deletados)

**Mitigações:**
- Particionamento de tabelas por data
- Archive de dados antigos (>7 anos)
- Índices parciais (WHERE deleted_at IS NULL)

---

## ADR-012: Idempotência em Operações Críticas

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Arquitetura

### Contexto
Em sistemas distribuídos com mensageria:
- Mensagens podem ser entregues múltiplas vezes
- Network failures podem causar retries
- Precisamos garantir consistência

### Decisão
Implementaremos **idempotência** em todas as operações críticas:
- Idempotency keys em APIs
- Event deduplication no consumer
- Unique constraints no banco

### Consequências

**Positivas:**
- ✅ Segurança contra duplicação
- ✅ Permite retries seguros
- ✅ Consistência de dados

**Negativas:**
- ❌ Complexidade adicional
- ❌ Armazenamento de keys processadas

**Implementação:**
```typescript
// Exemplo de idempotency key
interface CreateTransactionRequest {
  idempotencyKey: string; // UUID gerado pelo cliente
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  // ...
}
```

---

## ADR-013: Versionamento de APIs

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Arquitetura

### Contexto
APIs precisam evoluir sem quebrar clientes existentes.

### Decisão
Utilizaremos **versionamento via URL path**:
- `/api/v1/transactions`
- `/api/v2/transactions`

**Regras:**
- Versão major para breaking changes
- Manter 2 versões simultâneas
- Deprecation notice de 6 meses

### Consequências

**Positivas:**
- ✅ Clareza para clientes
- ✅ Múltiplas versões simultâneas
- ✅ Fácil de implementar

**Negativas:**
- ❌ Duplicação de código (temporária)
- ❌ Manutenção de múltiplas versões

**Alternativas Consideradas:**
- Header versioning: Menos explícito
- Query parameter: Não RESTful

---

## ADR-014: Estratégia de Testes

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Qualidade

### Contexto
Precisamos garantir qualidade com:
- Testes automatizados
- Cobertura adequada
- Feedback rápido
- Confiança para deploy

### Decisão
Pirâmide de testes:
1. **Unitários (70%):** Jest, isolados, rápidos
2. **Integração (20%):** Supertest, com DB de teste
3. **E2E (10%):** Playwright, cenários críticos

**Meta de cobertura:** 80%

### Consequências

**Positivas:**
- ✅ Feedback rápido (unitários)
- ✅ Confiança em refactoring
- ✅ Documentação viva (testes)
- ✅ Redução de bugs em produção

**Negativas:**
- ❌ Tempo de desenvolvimento inicial maior
- ❌ Manutenção de testes

---

## ADR-015: Monorepo vs Multirepo

**Status:** Aceito  
**Data:** 2026-05-26  
**Decisores:** Equipe de Desenvolvimento

### Contexto
Precisamos decidir a organização do código:
- 3 microserviços
- Código compartilhado (shared kernel)
- Facilidade de desenvolvimento

### Decisão
Utilizaremos **Monorepo** com estrutura:
```
cash-flow-system/
├── services/
│   ├── transactions/
│   ├── consolidation/
│   └── reporting/
├── shared/
│   ├── domain/
│   └── infrastructure/
├── docs/
└── docker-compose.yml
```

### Consequências

**Positivas:**
- ✅ Código compartilhado fácil
- ✅ Refactoring cross-service simplificado
- ✅ Single CI/CD pipeline
- ✅ Versionamento sincronizado

**Negativas:**
- ❌ Repositório maior
- ❌ Builds podem ser mais lentos

**Ferramentas:**
- Nx ou Turborepo para build otimizado
- Workspaces do npm

---

## Resumo de Decisões

| ADR | Decisão | Status | Impacto |
|-----|---------|--------|---------|
| 001 | Microserviços Event-Driven | ✅ Aceito | Alto |
| 002 | Node.js + TypeScript | ✅ Aceito | Alto |
| 003 | PostgreSQL | ✅ Aceito | Alto |
| 004 | RabbitMQ | ✅ Aceito | Médio |
| 005 | Redis | ✅ Aceito | Médio |
| 006 | CQRS | ✅ Aceito | Alto |
| 007 | Prisma ORM | ✅ Aceito | Médio |
| 008 | Docker | ✅ Aceito | Alto |
| 009 | Prometheus + Grafana | ✅ Aceito | Médio |
| 010 | JWT | ✅ Aceito | Alto |
| 011 | Soft Delete | ✅ Aceito | Médio |
| 012 | Idempotência | ✅ Aceito | Alto |
| 013 | Versionamento de APIs | ✅ Aceito | Baixo |
| 014 | Estratégia de Testes | ✅ Aceito | Alto |
| 015 | Monorepo | ✅ Aceito | Médio |

## Próximas Decisões Pendentes

1. **ADR-016:** Estratégia de CI/CD (GitHub Actions vs GitLab CI)
2. **ADR-017:** Kubernetes vs Docker Swarm para produção
3. **ADR-018:** Estratégia de backup e disaster recovery
4. **ADR-019:** Política de rate limiting detalhada
5. **ADR-020:** Estratégia de feature flags