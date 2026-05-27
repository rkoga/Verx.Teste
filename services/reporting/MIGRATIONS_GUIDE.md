# Guia de Migrations - Reporting Service

## 📋 Visão Geral

Este guia explica como configurar e executar as migrations do banco de dados do Reporting Service.

## 🎯 Pré-requisitos

### 1. PostgreSQL Rodando
```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Se não estiver, iniciar com Docker Compose
docker-compose up -d postgres
```

### 2. Arquivo .env Configurado
O arquivo `.env` deve conter:
```env
DATABASE_URL=postgresql://cashflow:cashflow123@localhost:5432/reporting_db
```

## 🚀 Métodos de Setup

### Método 1: Script Automatizado (Recomendado)

#### Windows (PowerShell)
```powershell
cd services/reporting
.\setup-database.ps1
```

#### Linux/Mac (Bash)
```bash
cd services/reporting
chmod +x setup-database.sh
./setup-database.sh
```

O script automaticamente:
- ✅ Verifica se PostgreSQL está rodando
- ✅ Cria o banco de dados `reporting_db`
- ✅ Gera o Prisma Client
- ✅ Executa as migrations
- ✅ Verifica as tabelas criadas

---

### Método 2: Passo a Passo Manual

#### Passo 1: Verificar PostgreSQL
```bash
# Testar conexão
psql -h localhost -U cashflow -d postgres -c "SELECT version();"

# Se falhar, iniciar PostgreSQL
docker-compose up -d postgres
```

#### Passo 2: Criar Banco de Dados
```bash
# Conectar ao PostgreSQL
psql -h localhost -U cashflow -d postgres

# Criar banco (dentro do psql)
CREATE DATABASE reporting_db;

# Verificar
\l

# Sair
\q
```

Ou via comando único:
```bash
PGPASSWORD=cashflow123 psql -h localhost -U cashflow -d postgres -c "CREATE DATABASE reporting_db;"
```

#### Passo 3: Gerar Prisma Client
```bash
cd services/reporting
npx prisma generate
```

Saída esperada:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

#### Passo 4: Executar Migrations
```bash
npx prisma migrate dev --name init
```

Saída esperada:
```
Applying migration `20240126000000_init`
The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20240126000000_init/
    └─ migration.sql

✔ Generated Prisma Client
```

#### Passo 5: Verificar Tabelas Criadas
```bash
# Via psql
psql -h localhost -U cashflow -d reporting_db -c "\dt"

# Ou via Prisma Studio
npx prisma studio
```

Tabelas esperadas:
- ✅ `transaction_read_models`
- ✅ `daily_balance_read_models`
- ✅ `merchant_statistics`
- ✅ `category_summaries`
- ✅ `_prisma_migrations`

---

## 📊 Estrutura das Tabelas

### 1. transaction_read_models
```sql
CREATE TABLE "transaction_read_models" (
  "id" TEXT PRIMARY KEY,
  "merchantId" TEXT NOT NULL,
  "merchantName" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "categoryName" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL,
  "cancelReason" TEXT,
  "transactionDate" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- Índices otimizados
CREATE INDEX idx_merchant_date ON transaction_read_models(merchantId, transactionDate);
CREATE INDEX idx_merchant_type_date ON transaction_read_models(merchantId, type, transactionDate);
CREATE INDEX idx_merchant_status_date ON transaction_read_models(merchantId, status, transactionDate);
CREATE INDEX idx_category_date ON transaction_read_models(categoryId, transactionDate);
CREATE INDEX idx_date ON transaction_read_models(transactionDate);
```

### 2. daily_balance_read_models
```sql
CREATE TABLE "daily_balance_read_models" (
  "id" TEXT PRIMARY KEY,
  "merchantId" TEXT NOT NULL,
  "merchantName" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "openingBalance" DECIMAL(15,2) NOT NULL,
  "totalCredits" DECIMAL(15,2) NOT NULL,
  "totalDebits" DECIMAL(15,2) NOT NULL,
  "closingBalance" DECIMAL(15,2) NOT NULL,
  "transactionCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  UNIQUE(merchantId, date)
);

-- Índices
CREATE INDEX idx_merchant_date ON daily_balance_read_models(merchantId, date);
CREATE INDEX idx_date ON daily_balance_read_models(date);
```

### 3. merchant_statistics
```sql
CREATE TABLE "merchant_statistics" (
  "id" TEXT PRIMARY KEY,
  "merchantId" TEXT UNIQUE NOT NULL,
  "merchantName" TEXT NOT NULL,
  "currentBalance" DECIMAL(15,2) NOT NULL,
  "totalCreditsMonth" DECIMAL(15,2) NOT NULL,
  "totalDebitsMonth" DECIMAL(15,2) NOT NULL,
  "totalTransactionsMonth" INTEGER NOT NULL,
  "averageTransactionValue" DECIMAL(15,2) NOT NULL,
  "lastTransactionDate" TIMESTAMP,
  "lastUpdated" TIMESTAMP NOT NULL
);
```

### 4. category_summaries
```sql
CREATE TABLE "category_summaries" (
  "id" TEXT PRIMARY KEY,
  "merchantId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "categoryName" TEXT NOT NULL,
  "month" DATE NOT NULL,
  "totalCredits" DECIMAL(15,2) NOT NULL,
  "totalDebits" DECIMAL(15,2) NOT NULL,
  "transactionCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL,
  UNIQUE(merchantId, categoryId, month)
);
```

---

## 🔧 Comandos Úteis do Prisma

### Gerar Client
```bash
npx prisma generate
```

### Criar Nova Migration
```bash
npx prisma migrate dev --name nome_da_migration
```

### Aplicar Migrations em Produção
```bash
npx prisma migrate deploy
```

### Resetar Banco de Dados (CUIDADO!)
```bash
npx prisma migrate reset
```

### Abrir Prisma Studio (GUI)
```bash
npx prisma studio
```
Acesse: http://localhost:5555

### Ver Status das Migrations
```bash
npx prisma migrate status
```

### Formatar Schema
```bash
npx prisma format
```

---

## 🐛 Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"
**Solução**: Verifique se o arquivo `.env` existe e contém `DATABASE_URL`
```bash
cat .env  # Linux/Mac
type .env  # Windows
```

### Erro: "Can't reach database server"
**Solução**: Verifique se PostgreSQL está rodando
```bash
docker ps | grep postgres
docker-compose up -d postgres
```

### Erro: "Database 'reporting_db' does not exist"
**Solução**: Crie o banco manualmente
```bash
PGPASSWORD=cashflow123 psql -h localhost -U cashflow -d postgres -c "CREATE DATABASE reporting_db;"
```

### Erro: "Migration failed"
**Solução**: Verifique os logs e tente resetar
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Erro: "Port 5432 already in use"
**Solução**: Outro PostgreSQL está rodando
```bash
# Parar outros PostgreSQL
docker stop $(docker ps -q --filter ancestor=postgres)

# Ou mudar a porta no .env
DATABASE_URL=postgresql://cashflow:cashflow123@localhost:5433/reporting_db
```

---

## 📝 Boas Práticas

### 1. Sempre Fazer Backup Antes de Migrations
```bash
pg_dump -h localhost -U cashflow reporting_db > backup.sql
```

### 2. Testar Migrations em Desenvolvimento Primeiro
```bash
# Desenvolvimento
npx prisma migrate dev

# Produção (depois de testar)
npx prisma migrate deploy
```

### 3. Versionar Migrations no Git
```bash
git add prisma/migrations/
git commit -m "Add initial migration"
```

### 4. Documentar Mudanças no Schema
Sempre adicione comentários no `schema.prisma`:
```prisma
/// Modelo de leitura para transações
/// Otimizado com índices para queries comuns
model TransactionReadModel {
  // ...
}
```

---

## 🔄 Sincronização com Outros Serviços

O Reporting Service consome dados dos outros serviços. Para popular os read models:

### 1. Via Event Sourcing (Futuro)
```typescript
// Escutar eventos do RabbitMQ
// TransactionCreated -> Atualizar TransactionReadModel
// DailyBalanceCalculated -> Atualizar DailyBalanceReadModel
```

### 2. Via Batch Job (Atual)
```bash
# Script para sincronizar dados
node scripts/sync-read-models.js
```

### 3. Via API (Manual)
```bash
# Copiar dados do Transactions Service
curl http://localhost:3001/api/v1/transactions | \
  jq '.data[]' | \
  # Processar e inserir no Reporting DB
```

---

## ✅ Checklist de Validação

Após executar as migrations, verifique:

- [ ] PostgreSQL está rodando
- [ ] Banco `reporting_db` foi criado
- [ ] 4 tabelas principais foram criadas
- [ ] Índices foram criados corretamente
- [ ] Prisma Client foi gerado
- [ ] Prisma Studio abre sem erros
- [ ] Serviço inicia sem erros de conexão

---

## 📚 Recursos Adicionais

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Schema Prisma Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs postgres`
2. Consulte o troubleshooting acima
3. Abra uma issue no repositório
4. Contate o time de desenvolvimento

---

**Última atualização**: 2024-01-26  
**Versão**: 1.0.0