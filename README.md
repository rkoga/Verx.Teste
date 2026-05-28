# 💰 Cash Flow Control System

Sistema completo de controle de fluxo de caixa construído com arquitetura de microserviços, seguindo os princípios de Domain-Driven Design (DDD), Clean Architecture e CQRS.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)]()
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Início Rápido](#-início-rápido)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Serviços](#-serviços)
- [Documentação](#-documentação)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Testes](#-testes)
- [Monitoramento](#-monitoramento)
- [Contribuindo](#-contribuindo)

---

## 🎯 Visão Geral

O Cash Flow Control System é uma solução para gerenciamento de fluxo de caixa que permite:

- ✅ Registro e controle de transações financeiras (créditos e débitos)
- ✅ Consolidação diária automática de saldos
- ✅ Relatórios e dashboards em tempo real
- ✅ Arquitetura escalável e resiliente
- ✅ Cache distribuído para alta performance
- ✅ Processamento assíncrono de eventos


## 🏗️ Arquitetura

### Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        API Gateway                          │
│                     (Futuro - Opcional)                     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│ Transactions │      │Consolidation │     │  Reporting   │
│   Service    │      │   Service    │     │   Service    │
│  (Port 3001) │      │ (Port 3002)  │     │ (Port 3003)  │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   PostgreSQL     │
                    │   (Port 5432)    │
                    │                  │
                    │ • transactions   │
                    │ • consolidation  │
                    │ • reporting      │
                    └──────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│   RabbitMQ   │      │    Redis     │     │  Prometheus  │
│ (Port 5672)  │      │ (Port 6379)  │     │ (Port 9090)  │
└──────────────┘      └──────────────┘     └──────────────┘
```

### Padrões Arquiteturais

- **Domain-Driven Design (DDD)**: Modelagem rica do domínio
- **Clean Architecture**: Separação clara de responsabilidades
- **CQRS**: Separação de comandos e consultas
- **Event-Driven**: Comunicação assíncrona via eventos
- **Repository Pattern**: Abstração de acesso a dados
- **Value Objects**: Objetos imutáveis para conceitos do domínio

---

## 🛠️ Tecnologias

### Core
- **Node.js** 20+ - Runtime JavaScript
- **TypeScript** 5.3+ - Superset tipado do JavaScript
- **NestJS** 10.3 - Framework para Transactions e Consolidation
- **Express** 4.18 - Framework para Reporting

### Banco de Dados
- **PostgreSQL** 16 - Banco de dados relacional
- **Prisma** 5.8 - ORM moderno para TypeScript

### Mensageria e Cache
- **RabbitMQ** 3.12 - Message broker
- **Redis** 7.2 - Cache distribuído

### Observabilidade
- **Prometheus** - Coleta de métricas
- **Grafana** - Visualização de métricas
- **Jaeger** - Distributed tracing

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração local

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+
- Docker Desktop
- Git

### Instalação Rápida

```powershell
# 1. Clone o repositório
git clone <repository-url>

# 2. Instale as dependências
npm install

# 3. Inicie o Docker Desktop
# Aguarde até que esteja completamente iniciado

# 4. Configure os bancos de dados
.\setup-databases.ps1

# 5. Inicie todos os serviços
.\start-all-services.ps1

# 6. Teste a API
.\test-api.ps1
```

### Verificação

Após iniciar os serviços, verifique se estão rodando:

```powershell
# Health checks
curl http://localhost:3001/health  # Transactions
curl http://localhost:3002/health  # Consolidation
curl http://localhost:3003/health  # Reporting
```

---

## 📁 Estrutura do Projeto

```
cash-flow-system/
├── docs/                           # Documentação completa
│   ├── 00-executive-summary.md
│   ├── 01-domain-mapping.md
│   ├── 02-requirements.md
│   ├── 03-target-architecture.md
│   ├── 04-architecture-diagrams.md
│   ├── 05-architectural-decisions.md
│   ├── 06-project-structure.md
│   ├── 07-implementation-guide.md
│   └── 08-transition-architecture.md
│
├── infrastructure/                 # Configurações de infraestrutura
│   └── docker/
│       ├── grafana/
│       ├── postgres/
│       └── prometheus/
│
├── services/                       # Microserviços
│   ├── transactions/              # Serviço de Transações
│   │   ├── src/
│   │   │   ├── domain/           # Camada de Domínio
│   │   │   ├── application/      # Camada de Aplicação
│   │   │   └── infrastructure/   # Camada de Infraestrutura
│   │   ├── prisma/
│   │   └── package.json
│   │
│   ├── consolidation/             # Serviço de Consolidação
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── prisma/
│   │   └── package.json
│   │
│   └── reporting/                 # Serviço de Relatórios
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   └── infrastructure/
│       ├── prisma/
│       └── package.json
│
├── shared/                         # Código compartilhado
│   └── src/
│       ├── domain/
│       ├── infrastructure/
│       └── types/
│
├── scripts/                        # Scripts utilitários
├── postman/                        # Coleção Postman
├── docker-compose.yml             # Orquestração Docker
├── setup-databases.ps1            # Script de setup de DB
├── start-all-services.ps1         # Script de inicialização
├── test-api.ps1                   # Script de testes
└── README.md                      # Este arquivo
```

---

## 🎯 Serviços

### 1. Transactions Service (Port 3001)

Gerencia todas as transações financeiras do sistema.

**Responsabilidades:**
- Criar transações (crédito/débito)
- Publicar eventos de domínio

**Endpoints principais:**
- `POST /transactions` - Criar transação
- `GET /transactions/:id` - Buscar transação
- `GET /transactions` - Listar transações

### 2. Consolidation Service (Port 3002)

Consolida saldos diários e processa eventos de transações.

**Responsabilidades:**
- Consolidar saldos diários
- Processar eventos de transações
- Calcular totais de créditos e débitos
- Executar jobs agendados

**Endpoints principais:**
- `GET /consolidation/balance/:date` - Saldo do dia
- `GET /consolidation/balance/` - Histórico de saldos
- `GET /consolidation/summary/` - Resumo financeiro

### 3. Reporting Service (Port 3003)

Fornece relatórios e dashboards para análise financeira.

**Responsabilidades:**
- Gerar relatórios de transações
- Fornecer dados para dashboards
- Implementar cache de consultas
- Agregar dados financeiros

**Endpoints principais:**
- `GET /api/transactions` - Relatório de transações
- `GET /api/transactions/:id` - Detalhes da transação
- `GET /api/balance/` - Saldo do merchant
- `GET /api/dashboard/` - Dados do dashboard

---

## 📚 Documentação

### Documentos Principais

- **[START_ENVIRONMENT.md](START_ENVIRONMENT.md)** - Guia completo de inicialização (485 linhas)
- **[BUILD_SUCCESS_SUMMARY.md](BUILD_SUCCESS_SUMMARY.md)** - Resumo do build (438 linhas)
- **[INSTALLATION.md](INSTALLATION.md)** - Guia de instalação
- **[CREDENTIALS.md](CREDENTIALS.md)** - Credenciais padrão do sistema
- **[DOCKER-SETUP.md](DOCKER-SETUP.md)** - Configuração Docker
- **[TESTING.md](TESTING.md)** - Guia de testes
- **[QUICK_START.md](QUICK_START.md)** - Início rápido

### Documentação dos Serviços

- **[services/reporting/README.md](services/reporting/README.md)** - Reporting Service (257 linhas)
- **[services/reporting/SETUP.md](services/reporting/SETUP.md)** - Setup do Reporting (267 linhas)
- **[services/reporting/MIGRATIONS_GUIDE.md](services/reporting/MIGRATIONS_GUIDE.md)** - Guia de migrações (382 linhas)

### Documentação Arquitetural

Veja a pasta `/docs` para documentação completa da arquitetura.

---

## 🔧 Scripts Disponíveis

### Scripts PowerShell

```powershell
# Setup completo do banco de dados
.\setup-databases.ps1

# Iniciar todos os serviços
.\start-all-services.ps1

# Testar a API
.\test-api.ps1
```

### Scripts NPM (Raiz)

```bash
# Instalar dependências de todos os serviços
npm install

# Build de todos os serviços
npm run build

# Limpar node_modules
npm run clean
```

### Scripts por Serviço

```bash
# Transactions Service
cd services/transactions
npm run dev          # Modo desenvolvimento
npm run build        # Build para produção
npm run start:prod   # Iniciar em produção
npm test             # Executar testes

# Consolidation Service
cd services/consolidation
npm run dev
npm run build
npm run start:prod
npm test

# Reporting Service
cd services/reporting
npm run dev
npm run build
npm run start:prod
npm test
```

### Scripts Prisma

```bash
# Gerar Prisma Client
npx prisma generate

# Criar migração
npx prisma migrate dev --name <nome>

# Aplicar migrações
npx prisma migrate deploy

# Abrir Prisma Studio
npx prisma studio

# Verificar status das migrações
npx prisma migrate status
```

---

## 🧪 Testes

### Testes Unitários

```bash
# Executar todos os testes
npm test

# Executar com coverage
npm run test:cov

# Executar em modo watch
npm run test:watch
```

### Testes de Integração

```bash
# Executar testes e2e
npm run test:e2e
```

### Testes da API

```powershell
# Script automatizado de testes
.\test-api.ps1

# Ou manualmente com curl
curl -X POST http://localhost:3001/transactions -H "Content-Type: application/json" -d "{\"amount\":100,\"type\":\"CREDIT\",\"description\":\"Test\"}"
```

### Coleção Postman

Importe a coleção em `postman/Cash-Flow-System.postman_collection.json` para testar todos os endpoints.

---

## 📊 Monitoramento

### Prometheus

- **URL**: http://localhost:9090
- **Métricas**: http://localhost:3001/metrics

### Grafana

- **URL**: http://localhost:3000
- **Login**: admin/admin
- **Dashboards**: Pré-configurados em `infrastructure/docker/grafana/dashboards/`

### RabbitMQ Management

- **URL**: http://localhost:15672
- **Login**: admin/admin123
- **Funcionalidades**: Visualizar filas, exchanges, mensagens

### Jaeger UI

- **URL**: http://localhost:16686
- **Funcionalidades**: Visualizar traces distribuídos

---

## 🐳 Docker

### Iniciar Infraestrutura

```bash
# Iniciar todos os serviços
docker-compose up -d

# Iniciar apenas banco de dados
docker-compose up -d postgres

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

### Containers Disponíveis

- `postgres` - PostgreSQL com 3 databases (porta 5432)
  - transactions
  - consolidation
  - reporting
- `redis` - Redis (porta 6379)
- `rabbitmq` - RabbitMQ (portas 5672, 15672)
- `transactions-service` - Transactions Service (porta 3001)
- `consolidation-service` - Consolidation Service (porta 3002)
- `reporting-service` - Reporting Service (porta 3003)
- `prometheus` - Prometheus (porta 9090)
- `grafana` - Grafana (porta 3000)
- `jaeger` - Jaeger (portas 6831, 16686)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👥 Autores

- **Rafael Koga**

---

## 🙏 Agradecimentos

- NestJS Team
- Prisma Team
- Comunidade Open Source

---

## 📞 Suporte

Para suporte, consulte:
- Documentação em `/docs`
- Issues no GitHub
- [START_ENVIRONMENT.md](START_ENVIRONMENT.md) para troubleshooting

---

**Status**: ✅ Produção Ready  
**Última Atualização**: 26/05/2026  
**Versão**: 1.0.0