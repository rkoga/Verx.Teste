# Diagramas de Arquitetura

## 1. Diagrama de Sequência - Criar Lançamento

```mermaid
sequenceDiagram
    actor User as Comerciante
    participant Gateway as API Gateway
    participant TxnAPI as Transactions API
    participant TxnDB as Transactions DB
    participant MQ as Message Broker
    participant ConsSvc as Consolidation Service
    
    User->>Gateway: POST /transactions
    Note over User,Gateway: {amount, type, date, description}
    
    Gateway->>Gateway: Validate JWT
    Gateway->>Gateway: Rate Limiting Check
    
    Gateway->>TxnAPI: Forward Request
    
    TxnAPI->>TxnAPI: Validate Input
    TxnAPI->>TxnAPI: Create Transaction Entity
    
    TxnAPI->>TxnDB: INSERT transaction
    TxnDB-->>TxnAPI: Transaction Saved
    
    TxnAPI->>MQ: Publish TransactionCreated Event
    Note over TxnAPI,MQ: Event: {id, amount, type, date}
    
    TxnAPI-->>Gateway: 201 Created
    Gateway-->>User: Transaction Created
    
    MQ->>ConsSvc: Consume Event (async)
    ConsSvc->>ConsSvc: Update Pending Consolidation
    Note over ConsSvc: Aguarda job agendado
```

## 2. Diagrama de Sequência - Consolidação Diária

```mermaid
sequenceDiagram
    participant Scheduler as Cron Job
    participant ConsSvc as Consolidation Service
    participant ConsDB as Consolidation DB
    participant TxnDB as Transactions DB
    participant MQ as Message Broker
    participant RepSvc as Reporting Service
    participant Cache as Redis Cache
    
    Note over Scheduler: 00:00 - Trigger Daily Job
    
    Scheduler->>ConsSvc: Execute Daily Consolidation
    
    ConsSvc->>ConsSvc: Calculate Target Date (D-1)
    ConsSvc->>ConsDB: Check if Already Processed
    
    alt Already Processed
        ConsDB-->>ConsSvc: Consolidation Exists
        ConsSvc->>ConsSvc: Skip (Idempotent)
    else Not Processed
        ConsDB-->>ConsSvc: Not Found
        
        ConsSvc->>TxnDB: Query Transactions for D-1
        Note over ConsSvc,TxnDB: WHERE date = D-1 AND status = ACTIVE
        TxnDB-->>ConsSvc: List of Transactions
        
        ConsSvc->>ConsSvc: Calculate Balance
        Note over ConsSvc: Balance = Previous + Credits - Debits
        
        ConsSvc->>ConsDB: Get Previous Day Balance
        ConsDB-->>ConsSvc: Previous Balance
        
        ConsSvc->>ConsSvc: Compute Final Balance
        
        ConsSvc->>ConsDB: INSERT Consolidation
        Note over ConsSvc,ConsDB: {date, balance, credits, debits}
        ConsDB-->>ConsSvc: Saved
        
        ConsSvc->>MQ: Publish ConsolidationCompleted Event
        
        MQ->>RepSvc: Consume Event
        RepSvc->>RepSvc: Update Read Model
        RepSvc->>Cache: Invalidate Related Caches
        
        ConsSvc-->>Scheduler: Success
    end
```

## 3. Diagrama de Sequência - Consultar Relatório

```mermaid
sequenceDiagram
    actor User as Comerciante
    participant Gateway as API Gateway
    participant RepAPI as Reporting API
    participant Cache as Redis Cache
    participant RepDB as Reporting DB
    
    User->>Gateway: GET /reports/daily/2026-05-25
    
    Gateway->>Gateway: Validate JWT
    Gateway->>RepAPI: Forward Request
    
    RepAPI->>Cache: Check Cache
    Note over RepAPI,Cache: Key: report:daily:2026-05-25
    
    alt Cache Hit
        Cache-->>RepAPI: Cached Report
        RepAPI-->>Gateway: 200 OK (from cache)
    else Cache Miss
        Cache-->>RepAPI: Not Found
        
        RepAPI->>RepDB: Query Materialized View
        RepDB-->>RepAPI: Report Data
        
        RepAPI->>Cache: Store in Cache (TTL: 5min)
        RepAPI-->>Gateway: 200 OK
    end
    
    Gateway-->>User: Report Data
```

## 4. Diagrama de Fluxo - Processamento de Lançamento

```mermaid
flowchart TD
    Start([Usuário envia lançamento]) --> Validate{Validar Dados}
    
    Validate -->|Inválido| Error1[Retornar 400 Bad Request]
    Error1 --> End1([Fim])
    
    Validate -->|Válido| Auth{Autenticado?}
    
    Auth -->|Não| Error2[Retornar 401 Unauthorized]
    Error2 --> End2([Fim])
    
    Auth -->|Sim| RateLimit{Rate Limit OK?}
    
    RateLimit -->|Excedido| Error3[Retornar 429 Too Many Requests]
    Error3 --> End3([Fim])
    
    RateLimit -->|OK| CreateEntity[Criar Transaction Entity]
    CreateEntity --> ValidateBusiness{Validar Regras de Negócio}
    
    ValidateBusiness -->|Falha| Error4[Retornar 422 Unprocessable]
    Error4 --> End4([Fim])
    
    ValidateBusiness -->|OK| SaveDB[Salvar no Banco]
    SaveDB --> DBSuccess{Sucesso?}
    
    DBSuccess -->|Erro| Retry{Retry < 3?}
    Retry -->|Sim| SaveDB
    Retry -->|Não| Error5[Retornar 500 Internal Error]
    Error5 --> End5([Fim])
    
    DBSuccess -->|Sucesso| PublishEvent[Publicar TransactionCreated Event]
    PublishEvent --> EventSuccess{Evento Publicado?}
    
    EventSuccess -->|Erro| LogError[Log Error mas não falha]
    EventSuccess -->|Sucesso| LogSuccess[Log Success]
    
    LogError --> Return201[Retornar 201 Created]
    LogSuccess --> Return201
    
    Return201 --> End6([Fim])
```

## 5. Diagrama de Fluxo - Consolidação Diária

```mermaid
flowchart TD
    Start([Job Agendado 00:00]) --> CalcDate[Calcular Data D-1]
    CalcDate --> CheckExists{Consolidação já existe?}
    
    CheckExists -->|Sim| CheckStatus{Status?}
    CheckStatus -->|Processada| Skip[Skip - Idempotente]
    Skip --> End1([Fim])
    
    CheckStatus -->|Erro| Reprocess[Marcar para Reprocessamento]
    Reprocess --> QueryTxns
    
    CheckExists -->|Não| QueryTxns[Buscar Transações D-1]
    QueryTxns --> HasTxns{Tem Transações?}
    
    HasTxns -->|Não| CreateEmpty[Criar Consolidação Vazia]
    CreateEmpty --> End2([Fim])
    
    HasTxns -->|Sim| GetPrevBalance[Buscar Saldo D-2]
    GetPrevBalance --> CalcBalance[Calcular Saldo]
    
    CalcBalance --> ValidateCalc{Validar Cálculo}
    ValidateCalc -->|Erro| LogCalcError[Log Erro de Cálculo]
    LogCalcError --> Retry{Retry < 3?}
    Retry -->|Sim| CalcBalance
    Retry -->|Não| MarkError[Marcar como Erro]
    MarkError --> Alert[Enviar Alerta]
    Alert --> End3([Fim])
    
    ValidateCalc -->|OK| SaveCons[Salvar Consolidação]
    SaveCons --> SaveSuccess{Sucesso?}
    
    SaveSuccess -->|Erro| RetryDB{Retry < 3?}
    RetryDB -->|Sim| SaveCons
    RetryDB -->|Não| MarkError
    
    SaveSuccess -->|Sucesso| PublishEvent[Publicar ConsolidationCompleted]
    PublishEvent --> UpdateMetrics[Atualizar Métricas]
    UpdateMetrics --> End4([Fim - Sucesso])
```

## 6. Diagrama de Componentes - Transactions Service

```mermaid
graph TB
    subgraph "Transactions Service"
        subgraph "Presentation Layer"
            Controller[Transaction Controller]
            Middleware[Middlewares]
            Validator[Input Validators]
        end
        
        subgraph "Application Layer"
            CreateCmd[Create Transaction Command]
            ListQuery[List Transactions Query]
            GetQuery[Get Transaction Query]
            CancelCmd[Cancel Transaction Command]
            Handler[Command/Query Handlers]
        end
        
        subgraph "Domain Layer"
            TxnEntity[Transaction Entity]
            TxnVO[Value Objects]
            TxnEvents[Domain Events]
            TxnRules[Business Rules]
            TxnRepo[Transaction Repository Interface]
        end
        
        subgraph "Infrastructure Layer"
            PrismaRepo[Prisma Repository]
            EventPublisher[Event Publisher]
            DBConnection[Database Connection]
        end
    end
    
    Controller --> Middleware
    Middleware --> Validator
    Validator --> Handler
    Handler --> CreateCmd
    Handler --> ListQuery
    Handler --> GetQuery
    Handler --> CancelCmd
    
    CreateCmd --> TxnEntity
    CreateCmd --> TxnRules
    CreateCmd --> TxnRepo
    
    TxnEntity --> TxnVO
    TxnEntity --> TxnEvents
    
    TxnRepo --> PrismaRepo
    PrismaRepo --> DBConnection
    
    TxnEvents --> EventPublisher
    
    style Controller fill:#e1f5ff
    style Handler fill:#fff4e1
    style TxnEntity fill:#e8f5e9
    style PrismaRepo fill:#f3e5f5
```

## 7. Diagrama de Deployment - Ambiente Local (Docker Compose)

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Application Containers"
            Gateway[API Gateway<br/>nginx:alpine<br/>Port: 80]
            TxnSvc[Transactions Service<br/>node:20-alpine<br/>Port: 3001]
            ConsSvc[Consolidation Service<br/>node:20-alpine<br/>Port: 3002]
            RepSvc[Reporting Service<br/>node:20-alpine<br/>Port: 3003]
        end
        
        subgraph "Data Containers"
            Postgres[(PostgreSQL 15<br/>Port: 5432)]
            Redis[(Redis 7<br/>Port: 6379)]
            RabbitMQ[RabbitMQ<br/>Port: 5672, 15672]
        end
        
        subgraph "Observability Containers"
            Prometheus[Prometheus<br/>Port: 9090]
            Grafana[Grafana<br/>Port: 3000]
            Jaeger[Jaeger<br/>Port: 16686]
        end
    end
    
    Gateway --> TxnSvc
    Gateway --> ConsSvc
    Gateway --> RepSvc
    
    TxnSvc --> Postgres
    TxnSvc --> Redis
    TxnSvc --> RabbitMQ
    
    ConsSvc --> Postgres
    ConsSvc --> RabbitMQ
    
    RepSvc --> Postgres
    RepSvc --> Redis
    RepSvc --> RabbitMQ
    
    TxnSvc -.->|metrics| Prometheus
    ConsSvc -.->|metrics| Prometheus
    RepSvc -.->|metrics| Prometheus
    
    TxnSvc -.->|traces| Jaeger
    ConsSvc -.->|traces| Jaeger
    RepSvc -.->|traces| Jaeger
    
    Prometheus --> Grafana
    
    style Gateway fill:#4CAF50
    style TxnSvc fill:#2196F3
    style ConsSvc fill:#FF9800
    style RepSvc fill:#9C27B0
    style Postgres fill:#336791
    style Redis fill:#DC382D
    style RabbitMQ fill:#FF6600
```

## 8. Diagrama de Deployment - Ambiente Kubernetes

```mermaid
graph TB
    subgraph "Kubernetes Cluster"
        subgraph "Ingress"
            Ingress[Ingress Controller<br/>NGINX/Traefik]
        end
        
        subgraph "Application Namespace"
            subgraph "Transactions Deployment"
                TxnPod1[Txn Pod 1]
                TxnPod2[Txn Pod 2]
                TxnSvc[Txn Service<br/>ClusterIP]
            end
            
            subgraph "Consolidation Deployment"
                ConsPod1[Cons Pod 1]
                ConsPod2[Cons Pod 2]
                ConsSvc[Cons Service<br/>ClusterIP]
            end
            
            subgraph "Reporting Deployment"
                RepPod1[Rep Pod 1]
                RepPod2[Rep Pod 2]
                RepSvc[Rep Service<br/>ClusterIP]
            end
        end
        
        subgraph "Data Namespace"
            PostgresStateful[PostgreSQL<br/>StatefulSet]
            RedisStateful[Redis<br/>StatefulSet]
            RabbitStateful[RabbitMQ<br/>StatefulSet]
            
            PVC1[(PVC - Postgres)]
            PVC2[(PVC - Redis)]
            PVC3[(PVC - RabbitMQ)]
        end
        
        subgraph "Monitoring Namespace"
            PromDeploy[Prometheus<br/>Deployment]
            GrafanaDeploy[Grafana<br/>Deployment]
            JaegerDeploy[Jaeger<br/>Deployment]
        end
        
        subgraph "ConfigMaps & Secrets"
            ConfigMap[ConfigMaps]
            Secrets[Secrets]
        end
    end
    
    Ingress --> TxnSvc
    Ingress --> ConsSvc
    Ingress --> RepSvc
    
    TxnSvc --> TxnPod1
    TxnSvc --> TxnPod2
    
    ConsSvc --> ConsPod1
    ConsSvc --> ConsPod2
    
    RepSvc --> RepPod1
    RepSvc --> RepPod2
    
    TxnPod1 --> PostgresStateful
    TxnPod2 --> PostgresStateful
    ConsPod1 --> PostgresStateful
    ConsPod2 --> PostgresStateful
    RepPod1 --> PostgresStateful
    RepPod2 --> PostgresStateful
    
    TxnPod1 --> RedisStateful
    TxnPod2 --> RedisStateful
    RepPod1 --> RedisStateful
    RepPod2 --> RedisStateful
    
    TxnPod1 --> RabbitStateful
    TxnPod2 --> RabbitStateful
    ConsPod1 --> RabbitStateful
    ConsPod2 --> RabbitStateful
    RepPod1 --> RabbitStateful
    RepPod2 --> RabbitStateful
    
    PostgresStateful --> PVC1
    RedisStateful --> PVC2
    RabbitStateful --> PVC3
    
    TxnPod1 -.-> ConfigMap
    TxnPod1 -.-> Secrets
    ConsPod1 -.-> ConfigMap
    ConsPod1 -.-> Secrets
    RepPod1 -.-> ConfigMap
    RepPod1 -.-> Secrets
    
    TxnPod1 -.->|metrics| PromDeploy
    ConsPod1 -.->|metrics| PromDeploy
    RepPod1 -.->|metrics| PromDeploy
    
    PromDeploy --> GrafanaDeploy
    
    style Ingress fill:#4CAF50
    style TxnPod1 fill:#2196F3
    style TxnPod2 fill:#2196F3
    style ConsPod1 fill:#FF9800
    style ConsPod2 fill:#FF9800
    style RepPod1 fill:#9C27B0
    style RepPod2 fill:#9C27B0
```

## 9. Diagrama de Estados - Transaction

```mermaid
stateDiagram-v2
    [*] --> Draft: Create
    
    Draft --> Active: Validate & Save
    Draft --> [*]: Discard
    
    Active --> Cancelled: Cancel Request
    Active --> Consolidated: Daily Consolidation
    
    Cancelled --> [*]: Archive
    Consolidated --> [*]: Archive
    
    note right of Active
        Transaction is valid
        and can be consolidated
    end note
    
    note right of Cancelled
        Soft deleted
        Not included in future
        consolidations
    end note
    
    note right of Consolidated
        Included in a
        daily consolidation
        Cannot be cancelled
    end note
```

## 10. Diagrama de Estados - Consolidation

```mermaid
stateDiagram-v2
    [*] --> Pending: Job Triggered
    
    Pending --> Processing: Start Processing
    
    Processing --> Completed: Success
    Processing --> Failed: Error
    Processing --> Pending: Retry
    
    Failed --> Processing: Manual Retry
    Failed --> Cancelled: Give Up
    
    Completed --> Reprocessing: Manual Reprocess
    Reprocessing --> Completed: Success
    Reprocessing --> Failed: Error
    
    Cancelled --> [*]
    Completed --> [*]: Archive
    
    note right of Processing
        Fetching transactions
        Calculating balance
        Saving results
    end note
    
    note right of Failed
        Max retries exceeded
        Requires manual intervention
        Alert sent
    end note
    
    note right of Completed
        Balance calculated
        Event published
        Read model updated
    end note
```

## 11. Diagrama de Contexto de Integração

```mermaid
graph TB
    subgraph "External Systems"
        User[Comerciante<br/>Web/Mobile App]
        Admin[Administrador<br/>Admin Panel]
        Monitor[Equipe Ops<br/>Monitoring Tools]
    end
    
    subgraph "Cash Flow System"
        Gateway[API Gateway]
        
        subgraph "Core Services"
            TxnSvc[Transactions<br/>Service]
            ConsSvc[Consolidation<br/>Service]
            RepSvc[Reporting<br/>Service]
        end
        
        subgraph "Infrastructure"
            DB[(Database)]
            Cache[(Cache)]
            MQ[Message<br/>Broker]
        end
        
        subgraph "Observability"
            Logs[Logs]
            Metrics[Metrics]
            Traces[Traces]
        end
    end
    
    subgraph "Future Integrations"
        Bank[Banking<br/>System]
        ERP[ERP<br/>System]
        BI[BI<br/>Tools]
    end
    
    User -->|HTTPS| Gateway
    Admin -->|HTTPS| Gateway
    
    Gateway --> TxnSvc
    Gateway --> ConsSvc
    Gateway --> RepSvc
    
    TxnSvc --> DB
    TxnSvc --> Cache
    TxnSvc --> MQ
    
    ConsSvc --> DB
    ConsSvc --> MQ
    
    RepSvc --> DB
    RepSvc --> Cache
    RepSvc --> MQ
    
    TxnSvc -.-> Logs
    TxnSvc -.-> Metrics
    TxnSvc -.-> Traces
    
    ConsSvc -.-> Logs
    ConsSvc -.-> Metrics
    ConsSvc -.-> Traces
    
    RepSvc -.-> Logs
    RepSvc -.-> Metrics
    RepSvc -.-> Traces
    
    Monitor -.->|Read| Logs
    Monitor -.->|Read| Metrics
    Monitor -.->|Read| Traces
    
    Gateway -.->|Future| Bank
    Gateway -.->|Future| ERP
    RepSvc -.->|Future| BI
    
    style User fill:#4CAF50
    style Admin fill:#FF9800
    style Monitor fill:#9C27B0
    style Gateway fill:#2196F3
    style Bank fill:#E0E0E0
    style ERP fill:#E0E0E0
    style BI fill:#E0E0E0
```

## 12. Diagrama de Resiliência - Circuit Breaker

```mermaid
stateDiagram-v2
    [*] --> Closed: Initial State
    
    Closed --> Open: Failure Threshold Exceeded<br/>50% failures in 10 requests
    
    Open --> HalfOpen: Timeout Elapsed<br/>60 seconds
    
    HalfOpen --> Closed: Success<br/>Request succeeds
    HalfOpen --> Open: Failure<br/>Request fails
    
    note right of Closed
        Normal operation
        All requests pass through
        Monitoring failures
    end note
    
    note right of Open
        Circuit is open
        Requests fail fast
        No calls to service
        Return cached data or error
    end note
    
    note right of HalfOpen
        Testing if service recovered
        Allow 1 request through
        Decide based on result
    end note
```

## 13. Diagrama de Dados - Modelo Conceitual

```mermaid
erDiagram
    MERCHANT ||--o{ TRANSACTION : creates
    MERCHANT {
        uuid id PK
        string name
        string email
        timestamp created_at
    }
    
    TRANSACTION ||--o{ TRANSACTION_CATEGORY : has
    TRANSACTION {
        uuid id PK
        decimal amount
        enum type
        date transaction_date
        string description
        enum status
        timestamp created_at
        timestamp updated_at
        timestamp cancelled_at
    }
    
    TRANSACTION_CATEGORY {
        uuid id PK
        string name
        string description
    }
    
    TRANSACTION ||--o{ DAILY_CONSOLIDATION : included_in
    DAILY_CONSOLIDATION {
        uuid id PK
        date consolidation_date
        decimal opening_balance
        decimal total_credits
        decimal total_debits
        decimal closing_balance
        enum status
        int transaction_count
        timestamp processed_at
        timestamp created_at
    }
    
    DAILY_CONSOLIDATION ||--o{ CONSOLIDATION_VERSION : has
    CONSOLIDATION_VERSION {
        uuid id PK
        uuid consolidation_id FK
        int version
        decimal closing_balance
        string reason
        timestamp created_at
    }
    
    MERCHANT ||--o{ DAILY_CONSOLIDATION : owns
```

## 14. Legenda de Cores e Símbolos

### Cores dos Diagramas
- 🟢 **Verde (#4CAF50):** Entrada/Gateway/Usuário
- 🔵 **Azul (#2196F3):** Serviços de Aplicação
- 🟠 **Laranja (#FF9800):** Processamento/Jobs
- 🟣 **Roxo (#9C27B0):** Relatórios/Leitura
- 🔴 **Vermelho (#DC382D):** Cache/Redis
- 🟤 **Marrom (#336791):** Banco de Dados
- ⚫ **Cinza (#E0E0E0):** Integrações Futuras

### Símbolos
- `-->` : Comunicação síncrona (REST)
- `-.->` : Comunicação assíncrona (Events)
- `==>` : Fluxo de dados
- `[*]` : Estado inicial/final
- `()` : Cilindro = Banco de Dados
- `[]` : Retângulo = Serviço/Componente