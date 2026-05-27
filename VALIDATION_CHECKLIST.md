# ✅ Checklist de Validação - Cash Flow System

## 📋 Pré-requisitos

### Software Necessário
- [ ] Docker Desktop instalado e rodando
- [ ] Node.js 20+ instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Git instalado (`git --version`)

### Verificar Instalações
```bash
# Verificar Node.js
node --version  # Deve ser >= 20.0.0

# Verificar npm
npm --version   # Deve ser >= 10.0.0

# Verificar Docker
docker --version
docker-compose --version

# Verificar se Docker está rodando
docker info
```

## 🐳 Fase 1: Infraestrutura Docker

### 1.1 Iniciar Serviços
```bash
# No diretório raiz do projeto
docker-compose up -d postgres redis rabbitmq
```

**Validações:**
- [ ] Comando executou sem erros
- [ ] 3 containers foram criados

### 1.2 Verificar Status
```bash
docker-compose ps
```

**Esperado:**
```
NAME                    STATUS
postgres                Up (healthy)
redis                   Up (healthy)
rabbitmq                Up (healthy)
```

**Validações:**
- [ ] PostgreSQL está UP e healthy
- [ ] Redis está UP e healthy
- [ ] RabbitMQ está UP e healthy

### 1.3 Testar Conexões
```bash
# Testar PostgreSQL
docker-compose exec postgres pg_isready -U cashflow_user

# Testar Redis
docker-compose exec redis redis-cli ping

# Testar RabbitMQ (via browser)
# Abrir: http://localhost:15672
# User: guest / Password: guest
```

**Validações:**
- [ ] PostgreSQL responde "accepting connections"
- [ ] Redis responde "PONG"
- [ ] RabbitMQ UI está acessível

## 📦 Fase 2: Dependências

### 2.1 Shared Module
```bash
cd shared
npm install
```

**Validações:**
- [ ] Comando executou sem erros
- [ ] Pasta `node_modules` foi criada
- [ ] Arquivo `package-lock.json` foi criado

### 2.2 Transactions Service
```bash
cd ../services/transactions
npm install
```

**Validações:**
- [ ] Comando executou sem erros
- [ ] Pasta `node_modules` foi criada
- [ ] Sem vulnerabilidades críticas

### 2.3 Consolidation Service
```bash
cd ../consolidation
npm install
cd ../../..
```

**Validações:**
- [ ] Comando executou sem erros
- [ ] Pasta `node_modules` foi criada

## 🗄️ Fase 3: Banco de Dados

### 3.1 Gerar Prisma Client - Transactions
```bash
cd services/transactions
npx prisma generate
```

**Validações:**
- [ ] Comando executou sem erros
- [ ] Mensagem "Generated Prisma Client" apareceu
- [ ] Pasta `.prisma/client` foi criada em `node_modules`

### 3.2 Executar Migrations - Transactions
```bash
npx prisma migrate dev --name init
```

**Validações:**
- [ ] Comando executou sem erros
- [ ] Migrations foram aplicadas
- [ ] Tabelas foram criadas (merchants, categories, transactions)

### 3.3 Verificar Tabelas - Transactions
```bash
npx prisma studio
# Ou via psql:
docker-compose exec postgres psql -U cashflow_user -d cashflow_transactions -c "\dt"
```

**Validações:**
- [ ] Tabela `merchants` existe
- [ ] Tabela `categories` existe
- [ ] Tabela `transactions` existe

### 3.4 Gerar Prisma Client - Consolidation
```bash
cd ../consolidation
npx prisma generate
```

**Validações:**
- [ ] Comando executou sem erros
- [ ] Prisma Client gerado

### 3.5 Executar Migrations - Consolidation
```bash
npx prisma migrate dev --name init
```

**Validações:**
- [ ] Comando executou sem erros
- [ ] Migrations foram aplicadas

### 3.6 Verificar Tabelas - Consolidation
```bash
docker-compose exec postgres psql -U cashflow_user -d cashflow_consolidation -c "\dt"
```

**Validações:**
- [ ] Tabela `daily_balances` existe
- [ ] Tabela `consolidation_logs` existe

## 🚀 Fase 4: Iniciar Serviços

### 4.1 Transactions Service

**Terminal 1:**
```bash
cd services/transactions
npm run dev
```

**Validações:**
- [ ] Serviço iniciou sem erros
- [ ] Mensagem "Transactions Service is running on: http://localhost:3001" apareceu
- [ ] Mensagem "API Documentation: http://localhost:3001/api/docs" apareceu
- [ ] Prisma conectou ao banco de dados

**Logs Esperados:**
```
🚀 Transactions Service is running on: http://localhost:3001
📚 API Documentation: http://localhost:3001/api/docs
Prisma connected to database
```

### 4.2 Consolidation Service

**Terminal 2:**
```bash
cd services/consolidation
npm run dev
```

**Validações:**
- [ ] Serviço iniciou sem erros
- [ ] Mensagem "Consolidation Service is running on: http://localhost:3002" apareceu
- [ ] Prisma conectou ao banco de dados

**Logs Esperados:**
```
🚀 Consolidation Service is running on: http://localhost:3002
📚 API Documentation: http://localhost:3002/api/docs
Prisma connected to consolidation database
```

## 🧪 Fase 5: Testes de API

### 5.1 Health Checks

**Terminal 3:**
```bash
# Transactions Service
curl http://localhost:3001/api/v1/health

# Consolidation Service
curl http://localhost:3002/api/v1/health
```

**Validações:**
- [ ] Transactions retorna status 200
- [ ] Consolidation retorna status 200
- [ ] Ambos retornam JSON com `status: "ok"`

### 5.2 Swagger UI

**Abrir no navegador:**
- http://localhost:3001/api/docs
- http://localhost:3002/api/docs

**Validações:**
- [ ] Swagger UI do Transactions carrega
- [ ] Swagger UI do Consolidation carrega
- [ ] Endpoints estão listados
- [ ] Schemas estão visíveis

### 5.3 Criar Transação

```bash
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "test-001",
    "amount": 1500.00,
    "type": "CREDIT",
    "date": "2026-05-26",
    "description": "Test transaction",
    "categoryId": "cat_test"
  }'
```

**Validações:**
- [ ] Retorna status 201
- [ ] Retorna JSON com transaction ID
- [ ] Transaction tem todos os campos esperados

### 5.4 Listar Transações

```bash
curl http://localhost:3001/api/v1/transactions?page=1&limit=10
```

**Validações:**
- [ ] Retorna status 200
- [ ] Retorna objeto com `data`, `total`, `page`, `limit`
- [ ] Array `data` contém a transação criada

### 5.5 Testar Idempotência

```bash
# Tentar criar mesma transação novamente
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "test-001",
    "amount": 1500.00,
    "type": "CREDIT",
    "date": "2026-05-26",
    "description": "Duplicate",
    "categoryId": "cat_test"
  }'
```

**Validações:**
- [ ] Retorna status 409 (Conflict)
- [ ] Mensagem de erro menciona "already exists"

## 📊 Fase 6: Verificações Finais

### 6.1 Verificar Logs

**Validações:**
- [ ] Sem erros nos logs do Transactions Service
- [ ] Sem erros nos logs do Consolidation Service
- [ ] Queries SQL aparecem nos logs (modo development)

### 6.2 Verificar Banco de Dados

```bash
# Verificar transação foi salva
docker-compose exec postgres psql -U cashflow_user -d cashflow_transactions \
  -c "SELECT id, amount, type, description FROM transactions LIMIT 5;"
```

**Validações:**
- [ ] Transação aparece no banco
- [ ] Dados estão corretos

### 6.3 Verificar Recursos

```bash
# Verificar uso de memória/CPU
docker stats --no-stream
```

**Validações:**
- [ ] Containers não estão usando recursos excessivos
- [ ] PostgreSQL < 500MB RAM
- [ ] Redis < 100MB RAM

## 🎯 Checklist de Sucesso Final

### Infraestrutura
- [ ] ✅ Docker Desktop rodando
- [ ] ✅ PostgreSQL UP e acessível
- [ ] ✅ Redis UP e acessível
- [ ] ✅ RabbitMQ UP e acessível

### Dependências
- [ ] ✅ Shared module instalado
- [ ] ✅ Transactions service instalado
- [ ] ✅ Consolidation service instalado

### Banco de Dados
- [ ] ✅ Prisma Clients gerados
- [ ] ✅ Migrations executadas
- [ ] ✅ Tabelas criadas corretamente

### Serviços
- [ ] ✅ Transactions Service rodando (porta 3001)
- [ ] ✅ Consolidation Service rodando (porta 3002)
- [ ] ✅ Ambos conectados ao banco

### APIs
- [ ] ✅ Health checks funcionando
- [ ] ✅ Swagger UI acessível
- [ ] ✅ Criar transação funciona
- [ ] ✅ Listar transações funciona
- [ ] ✅ Idempotência funciona

### Documentação
- [ ] ✅ README.md lido
- [ ] ✅ QUICK_START.md seguido
- [ ] ✅ TESTING.md consultado
- [ ] ✅ Postman collection importada

## 🐛 Problemas Comuns

### Erro: "Port already in use"
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erro: "Cannot connect to database"
```bash
# Reiniciar PostgreSQL
docker-compose restart postgres

# Verificar logs
docker-compose logs postgres
```

### Erro: "Prisma Client not generated"
```bash
cd services/transactions
npx prisma generate
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas

- Todos os checkboxes devem estar marcados para validação completa
- Se algum passo falhar, consulte a seção de troubleshooting
- Logs detalhados estão em `logs/` (se scripts foram usados)
- Para suporte, consulte a documentação em `docs/`

---

**Status da Validação:**
- Data: _______________
- Validado por: _______________
- Resultado: [ ] ✅ Sucesso  [ ] ❌ Falhou  [ ] ⚠️ Parcial

Made with Bob 🤖