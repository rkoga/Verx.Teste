# Guia de Testes - Sistema de Controle de Fluxo de Caixa

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 20+ instalado
- curl e jq instalados (para testes de API)
- Git Bash ou terminal Unix-like (Windows users)

## 🚀 Setup Rápido

### 1. Iniciar Infraestrutura e Serviços

```bash
# Dar permissão de execução aos scripts
chmod +x scripts/*.sh

# Executar script de setup completo
./scripts/test-services.sh
```

Este script irá:
- ✅ Iniciar PostgreSQL, Redis e RabbitMQ via Docker
- ✅ Instalar dependências de todos os serviços
- ✅ Gerar Prisma Clients
- ✅ Executar migrations do banco de dados
- ✅ Iniciar Transactions Service (porta 3001)
- ✅ Iniciar Consolidation Service (porta 3002)
- ✅ Executar health checks

### 2. Testar APIs

```bash
# Executar testes de API
./scripts/test-api.sh
```

Este script irá testar:
- ✅ Health checks de ambos os serviços
- ✅ Criação de transações (crédito e débito)
- ✅ Busca de transação por ID
- ✅ Listagem de transações com filtros
- ✅ Idempotência (tentativa de duplicação)
- ✅ Consultas de consolidação

## 🧪 Testes Manuais

### Transactions Service (Porta 3001)

#### 1. Health Check
```bash
curl http://localhost:3001/api/v1/health
```

#### 2. Criar Transação de Crédito
```bash
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 1500.00,
    "type": "CREDIT",
    "date": "2026-05-26",
    "description": "Venda de produto X",
    "categoryId": "cat_sales"
  }'
```

#### 3. Criar Transação de Débito
```bash
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440001",
    "amount": 500.00,
    "type": "DEBIT",
    "date": "2026-05-26",
    "description": "Compra de material",
    "categoryId": "cat_expenses"
  }'
```

#### 4. Listar Transações
```bash
# Listar todas
curl http://localhost:3001/api/v1/transactions?page=1&limit=10

# Filtrar por tipo
curl http://localhost:3001/api/v1/transactions?type=CREDIT

# Filtrar por data
curl "http://localhost:3001/api/v1/transactions?startDate=2026-05-01&endDate=2026-05-31"
```

#### 5. Buscar Transação por ID
```bash
curl http://localhost:3001/api/v1/transactions/{transaction_id}
```


### Consolidation Service (Porta 3002)

#### 1. Health Check
```bash
curl http://localhost:3002/api/v1/health
```

#### 2. Buscar Saldo de um Dia Específico
```bash
curl http://localhost:3002/api/v1/consolidation/balance/merchant_123/2026-05-26
```

#### 3. Buscar Histórico de Saldos
```bash
curl "http://localhost:3002/api/v1/consolidation/balance/merchant_123?startDate=2026-05-01&endDate=2026-05-31"
```

#### 4. Buscar Resumo Consolidado
```bash
curl "http://localhost:3002/api/v1/consolidation/summary/merchant_123?startDate=2026-05-01&endDate=2026-05-31"
```

## 📚 Documentação Swagger

Acesse a documentação interativa das APIs:

- **Transactions API**: http://localhost:3001/api/docs
- **Consolidation API**: http://localhost:3002/api/docs

## 🔍 Verificar Logs

```bash
# Logs do Transactions Service
tail -f logs/transactions.log

# Logs do Consolidation Service
tail -f logs/consolidation.log

# Logs do Docker
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f rabbitmq
```

## 🗄️ Acessar Banco de Dados

### Via Prisma Studio

```bash
# Transactions Database
cd services/transactions
npx prisma studio

# Consolidation Database
cd services/consolidation
npx prisma studio
```

### Via psql

```bash
# Transactions Database
docker-compose exec postgres psql -U cashflow_user -d cashflow_transactions

# Consolidation Database
docker-compose exec postgres psql -U cashflow_user -d cashflow_consolidation

# Reporting Database
docker-compose exec postgres psql -U cashflow_user -d cashflow_reporting
```

## 🧹 Limpeza

### Parar Serviços

```bash
# Parar serviços Node.js
if [ -f .pids ]; then
  while read pid; do
    kill $pid 2>/dev/null || true
  done < .pids
  rm .pids
fi

# Parar containers Docker
docker-compose down
```

### Limpar Banco de Dados

```bash
# Resetar banco de dados do Transactions
cd services/transactions
npx prisma migrate reset

# Resetar banco de dados do Consolidation
cd services/consolidation
npx prisma migrate reset
```

### Limpar Tudo

```bash
# Parar e remover containers, volumes e redes
docker-compose down -v

# Remover node_modules
rm -rf node_modules
rm -rf shared/node_modules
rm -rf services/*/node_modules

# Remover logs
rm -rf logs/*.log
```

## 🐛 Troubleshooting

### Erro: "Port already in use"

```bash
# Verificar processos usando as portas
lsof -i :3001  # Transactions
lsof -i :3002  # Consolidation
lsof -i :5432  # PostgreSQL

# Matar processo específico
kill -9 <PID>
```

### Erro: "Cannot connect to database"

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Verificar logs
docker-compose logs postgres
```

### Erro: "Prisma Client not generated"

```bash
# Gerar Prisma Client
cd services/transactions
npx prisma generate

cd services/consolidation
npx prisma generate
```

### Erro: "Migration failed"

```bash
# Resetar e recriar migrations
cd services/transactions
npx prisma migrate reset
npx prisma migrate dev --name init
```

## 📊 Cenários de Teste

### Cenário 1: Fluxo Completo de Transação

1. Criar transação de crédito
2. Criar transação de débito
3. Listar transações
4. Verificar saldo consolidado
5. Verificar histórico

### Cenário 2: Teste de Idempotência

1. Criar transação com idempotency key
2. Tentar criar mesma transação novamente
3. Verificar que retorna 409 Conflict

### Cenário 3: Teste de Cancelamento

1. Criar transação de débito
2. Cancelar transação
3. Verificar status alterado
4. Tentar cancelar novamente (deve falhar)

### Cenário 4: Teste de Consolidação

1. Criar múltiplas transações em um dia
2. Aguardar consolidação automática (ou triggerar manualmente)
3. Verificar saldo consolidado
4. Verificar que opening balance do dia seguinte = closing balance do dia anterior

## 🎯 Métricas de Sucesso

- ✅ Todos os health checks retornam 200 OK
- ✅ Transações são criadas com sucesso
- ✅ Idempotência funciona corretamente
- ✅ Listagem e filtros funcionam
- ✅ Consolidação calcula saldos corretamente
- ✅ APIs respondem em < 200ms (média)
- ✅ Sem erros nos logs

## 📝 Notas

- Os serviços usam `merchant_123` como merchant ID padrão (placeholder)
- Autenticação JWT ainda não está implementada
- Event publishing (RabbitMQ) ainda não está implementado
- Testes automatizados (Jest) ainda não estão implementados

## 🔗 Links Úteis

- [README.md](README.md) - Documentação geral
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Status da implementação
- [docs/](docs/) - Documentação técnica detalhada

---

Made with Bob 🤖