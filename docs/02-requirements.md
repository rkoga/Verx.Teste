# Requisitos Funcionais e Não Funcionais

## 1. Requisitos Funcionais

### 1.1 Serviço de Controle de Lançamentos

#### RF01 - Registrar Lançamento
**Descrição:** O sistema deve permitir o registro de lançamentos financeiros (débitos e créditos).

**Critérios de Aceite:**
- Deve aceitar: valor, tipo (débito/crédito), data, descrição, categoria (opcional)
- Valor deve ser numérico positivo
- Data não pode ser futura
- Descrição é obrigatória (mínimo 3 caracteres)
- Deve retornar ID único do lançamento criado
- Deve registrar timestamp de criação

**Prioridade:** Alta  
**Complexidade:** Média

#### RF02 - Consultar Lançamentos
**Descrição:** O sistema deve permitir consulta de lançamentos com filtros.

**Critérios de Aceite:**
- Filtros disponíveis: período (data início/fim), tipo, categoria
- Suporte a paginação (limite e offset)
- Ordenação por data (crescente/decrescente)
- Retornar total de registros encontrados
- Formato de resposta padronizado (JSON)

**Prioridade:** Alta  
**Complexidade:** Baixa

#### RF03 - Consultar Lançamento por ID
**Descrição:** O sistema deve permitir buscar um lançamento específico pelo ID.

**Critérios de Aceite:**
- Retornar todos os detalhes do lançamento
- Retornar 404 se não encontrado
- Incluir metadados (criado em, atualizado em)

**Prioridade:** Média  
**Complexidade:** Baixa

#### RF04 - Cancelar Lançamento
**Descrição:** O sistema deve permitir cancelamento de lançamentos (soft delete).

**Critérios de Aceite:**
- Lançamento não é deletado fisicamente
- Status muda para "cancelado"
- Registra quem e quando cancelou
- Lançamentos cancelados não entram em consolidações futuras
- Não permite cancelar lançamento já consolidado

**Prioridade:** Média  
**Complexidade:** Média

#### RF05 - Categorizar Lançamentos
**Descrição:** O sistema deve permitir categorização de lançamentos.

**Critérios de Aceite:**
- Categorias pré-definidas: Vendas, Fornecedores, Despesas Operacionais, Impostos, Outros
- Permitir criar categorias customizadas
- Categoria é opcional no lançamento
- Relatórios podem agrupar por categoria

**Prioridade:** Baixa  
**Complexidade:** Baixa

### 1.2 Serviço de Consolidado Diário

#### RF06 - Processar Consolidação Diária
**Descrição:** O sistema deve processar automaticamente a consolidação diária dos lançamentos.

**Critérios de Aceite:**
- Execução automática via job agendado (ex: 00:00)
- Processa lançamentos do dia anterior (D-1)
- Calcula: Saldo Anterior + Créditos - Débitos = Saldo Final
- Armazena resultado da consolidação
- Marca consolidação como "processada"
- Permite reprocessamento manual se necessário

**Prioridade:** Alta  
**Complexidade:** Alta

#### RF07 - Consultar Saldo Consolidado
**Descrição:** O sistema deve permitir consulta do saldo consolidado por período.

**Critérios de Aceite:**
- Consulta por data específica
- Consulta por período (data início/fim)
- Retorna: data, saldo inicial, total créditos, total débitos, saldo final
- Retorna status da consolidação (processada, pendente, erro)

**Prioridade:** Alta  
**Complexidade:** Média

#### RF08 - Gerar Relatório Consolidado
**Descrição:** O sistema deve gerar relatórios consolidados com detalhamento.

**Critérios de Aceite:**
- Relatório diário com breakdown por categoria
- Relatório mensal agregado
- Formato JSON para integração
- Incluir métricas: maior crédito, maior débito, média diária

**Prioridade:** Média  
**Complexidade:** Média

#### RF09 - Reprocessar Consolidação
**Descrição:** O sistema deve permitir reprocessamento de consolidações.

**Critérios de Aceite:**
- Apenas usuários autorizados podem reprocessar
- Mantém histórico de versões da consolidação
- Marca versão anterior como "reprocessada"
- Recalcula saldo com lançamentos atuais

**Prioridade:** Baixa  
**Complexidade:** Alta

### 1.3 Requisitos de Auditoria

#### RF10 - Rastreabilidade de Operações
**Descrição:** O sistema deve manter log de todas as operações críticas.

**Critérios de Aceite:**
- Registrar: usuário, timestamp, operação, dados antes/depois
- Logs imutáveis
- Retenção mínima de 7 anos (compliance)

**Prioridade:** Alta  
**Complexidade:** Média

## 2. Requisitos Não Funcionais

### 2.1 Performance (RNF01)

**Descrição:** O sistema deve atender aos seguintes critérios de performance:

**Critérios:**
- **Latência API Lançamentos:** < 200ms (p95)
- **Latência API Consolidação:** < 500ms (p95)
- **Throughput Consolidação:** 50 requisições/segundo em picos
- **Perda Máxima:** 5% de requisições em picos
- **Processamento Batch:** Consolidação de 100k lançamentos em < 5 minutos

**Estratégias:**
- Cache de consultas frequentes (Redis)
- Índices otimizados no banco de dados
- Processamento assíncrono via filas
- Connection pooling
- Rate limiting para proteção

### 2.2 Disponibilidade (RNF02)

**Descrição:** O sistema deve garantir alta disponibilidade.

**Critérios:**
- **SLA Serviço Lançamentos:** 99.9% (uptime mensal)
- **SLA Serviço Consolidação:** 99.5% (uptime mensal)
- **Independência:** Lançamentos não pode ficar indisponível se Consolidação cair
- **Recovery Time Objective (RTO):** < 15 minutos
- **Recovery Point Objective (RPO):** < 5 minutos

**Estratégias:**
- Arquitetura de microserviços desacoplados
- Health checks e auto-healing
- Replicação de banco de dados
- Backups automáticos a cada 6 horas
- Circuit breaker entre serviços

### 2.3 Escalabilidade (RNF03)

**Descrição:** O sistema deve escalar horizontalmente.

**Critérios:**
- **Auto-scaling:** Baseado em CPU (>70%) e memória (>80%)
- **Mínimo de instâncias:** 2 por serviço (HA)
- **Máximo de instâncias:** 10 por serviço
- **Escala de dados:** Suportar 10 milhões de lançamentos/mês
- **Crescimento:** Preparado para 3x de crescimento anual

**Estratégias:**
- Containerização com Docker
- Orquestração com Kubernetes (ou Docker Swarm)
- Load balancing
- Particionamento de dados (sharding) se necessário
- Arquitetura stateless

### 2.4 Segurança (RNF04)

**Descrição:** O sistema deve implementar controles de segurança robustos.

**Critérios:**
- **Autenticação:** JWT com refresh tokens
- **Autorização:** RBAC (Role-Based Access Control)
- **Criptografia em trânsito:** TLS 1.3
- **Criptografia em repouso:** AES-256 para dados sensíveis
- **Rate Limiting:** 100 req/min por IP
- **Proteção DDoS:** Cloudflare ou similar
- **Secrets Management:** Variáveis de ambiente ou Vault

**Estratégias:**
- API Gateway com autenticação centralizada
- Validação de input (sanitização)
- OWASP Top 10 compliance
- Logs de segurança (SIEM)
- Penetration testing periódico

### 2.5 Observabilidade (RNF05)

**Descrição:** O sistema deve ser completamente observável.

**Critérios:**
- **Logs:** Estruturados (JSON), centralizados
- **Métricas:** Latência, throughput, erros, recursos
- **Traces:** Distributed tracing entre serviços
- **Alertas:** Configurados para SLOs críticos
- **Dashboards:** Tempo real e histórico

**Estratégias:**
- Logging: Winston + ELK Stack (Elasticsearch, Logstash, Kibana)
- Métricas: Prometheus + Grafana
- Tracing: Jaeger ou OpenTelemetry
- APM: New Relic ou Datadog (opcional)
- Health checks: /health e /ready endpoints

### 2.6 Manutenibilidade (RNF06)

**Descrição:** O sistema deve ser fácil de manter e evoluir.

**Critérios:**
- **Cobertura de Testes:** > 80%
- **Documentação:** APIs documentadas (OpenAPI/Swagger)
- **Code Quality:** SonarQube score > 80%
- **Padrões:** Clean Code, SOLID, DDD
- **CI/CD:** Pipeline automatizado

**Estratégias:**
- Testes unitários (Jest)
- Testes de integração (Supertest)
- Testes E2E (Playwright ou Cypress)
- Linting (ESLint) e formatação (Prettier)
- Git flow com code review obrigatório

### 2.7 Portabilidade (RNF07)

**Descrição:** O sistema deve ser portável entre ambientes.

**Critérios:**
- **Containerização:** Docker
- **Orquestração:** Kubernetes-ready
- **Cloud-agnostic:** Funciona em AWS, GCP, Azure
- **Configuração:** 12-factor app
- **Banco de dados:** PostgreSQL (open-source)

**Estratégias:**
- Docker Compose para desenvolvimento local
- Helm charts para Kubernetes
- Variáveis de ambiente para configuração
- Abstração de serviços cloud-specific

### 2.8 Conformidade (RNF08)

**Descrição:** O sistema deve atender requisitos regulatórios.

**Critérios:**
- **LGPD:** Proteção de dados pessoais
- **Auditoria:** Logs imutáveis de 7 anos
- **Backup:** Retenção de 90 dias
- **Integridade:** Checksums e validações
- **Privacidade:** Anonimização de dados sensíveis

**Estratégias:**
- Política de retenção de dados
- Criptografia de PII (Personally Identifiable Information)
- Consent management
- Data masking em ambientes não-produtivos

## 3. Restrições Técnicas

### 3.1 Tecnologias Obrigatórias
- **Backend:** Node.js 20+ com TypeScript 5+
- **Banco de Dados:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Message Broker:** RabbitMQ ou Apache Kafka
- **Containerização:** Docker

### 3.2 Tecnologias Recomendadas
- **Framework:** NestJS ou Express
- **ORM:** Prisma ou TypeORM
- **Validação:** Zod ou Joi
- **Testes:** Jest + Supertest
- **Documentação:** Swagger/OpenAPI

### 3.3 Limitações
- Orçamento inicial limitado (preferir open-source)
- Equipe pequena (2-3 desenvolvedores)
- Prazo de 3 meses para MVP
- Infraestrutura on-premise ou cloud híbrida

## 4. Casos de Uso Prioritários

### Alta Prioridade
1. Registrar lançamento (RF01)
2. Consultar lançamentos (RF02)
3. Processar consolidação diária (RF06)
4. Consultar saldo consolidado (RF07)

### Média Prioridade
5. Consultar lançamento por ID (RF03)
6. Cancelar lançamento (RF04)
7. Gerar relatório consolidado (RF08)
8. Rastreabilidade de operações (RF10)

### Baixa Prioridade
9. Categorizar lançamentos (RF05)
10. Reprocessar consolidação (RF09)

## 5. Matriz de Rastreabilidade

| Requisito | Domínio | Serviço | Prioridade | Dependências |
|-----------|---------|---------|------------|--------------|
| RF01 | Transactions | transactions-service | Alta | - |
| RF02 | Transactions | transactions-service | Alta | RF01 |
| RF03 | Transactions | transactions-service | Média | RF01 |
| RF04 | Transactions | transactions-service | Média | RF01 |
| RF05 | Transactions | transactions-service | Baixa | RF01 |
| RF06 | Consolidation | consolidation-service | Alta | RF01 |
| RF07 | Consolidation | consolidation-service | Alta | RF06 |
| RF08 | Consolidation | consolidation-service | Média | RF06 |
| RF09 | Consolidation | consolidation-service | Baixa | RF06 |
| RF10 | Shared | audit-service | Alta | - |

## 6. Critérios de Aceitação do Sistema

### 6.1 Funcional
- ✅ Todos os requisitos de alta prioridade implementados
- ✅ Testes de aceitação passando (> 95%)
- ✅ APIs documentadas e funcionais

### 6.2 Não Funcional
- ✅ Performance dentro dos SLAs definidos
- ✅ Disponibilidade > 99.5% em produção
- ✅ Cobertura de testes > 80%
- ✅ Zero vulnerabilidades críticas (OWASP)

### 6.3 Operacional
- ✅ Deploy automatizado funcionando
- ✅ Monitoramento configurado
- ✅ Documentação completa (README, ADRs, APIs)
- ✅ Runbook de operações criado