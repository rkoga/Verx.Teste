# 🚀 Guia de Início Rápido - Cash Flow System

## Para Windows (PowerShell)

### 1. Pré-requisitos

Certifique-se de ter instalado:
- ✅ [Docker Desktop](https://www.docker.com/products/docker-desktop)
- ✅ [Node.js 20+](https://nodejs.org/)
- ✅ [Git](https://git-scm.com/)

### 2. Iniciar Infraestrutura

```powershell
# Iniciar Docker Desktop primeiro!

# Iniciar serviços de infraestrutura
docker-compose up -d

# Aguardar 30 segundos para os serviços iniciarem
Start-Sleep -Seconds 30
```

### 3. Instalar Dependências

```powershell
# Módulo Shared
cd shared
npm install
cd ..

# Transactions Service
cd services/transactions
npm install
cd ../..

# Consolidation Service
cd services/consolidation
npm install
cd ../..
```

### 4. Configurar Banco de Dados

```powershell
# Transactions Service
cd services/transactions
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# Consolidation Service
cd services/consolidation
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

### 5. Iniciar Serviços

Abra **3 terminais separados**:

**Terminal 1 - Transactions Service:**
```powershell
cd services/transactions
npm run dev
```

**Terminal 2 - Consolidation Service:**
```powershell
cd services/consolidation
npm run dev
```

**Terminal 3 - Testes:**
```powershell
# Aguarde os serviços iniciarem (10-15 segundos)
# Depois execute os testes
```

### 6. Testar APIs

#### Health Checks

```powershell
# Transactions Service
curl http://localhost:3001/api/v1/health

# Consolidation Service
curl http://localhost:3002/api/v1/health
```

#### Criar Transação

```powershell
# Criar transação de crédito
$body = @{
    idempotencyKey = [guid]::NewGuid().ToString()
    amount = 1500.00
    type = "CREDIT"
    date = (Get-Date -Format "yyyy-MM-dd")
    description = "Venda de produto X"
    categoryId = "cat_sales"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/transactions" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

#### Listar Transações

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/transactions?page=1&limit=10"
```

### 7. Acessar Documentação

Abra no navegador:
- **Transactions API**: http://localhost:3001/api/docs
- **Consolidation API**: http://localhost:3002/api/docs

---

## Para Linux/Mac (Bash)

### Método Rápido (Script Automatizado)

```bash
# Dar permissão de execução
chmod +x scripts/*.sh

# Executar setup completo
./scripts/test-services.sh

# Executar testes de API
./scripts/test-api.sh
```

### Método Manual

```bash
# 1. Iniciar infraestrutura
docker-compose up -d postgres redis rabbitmq
sleep 30

# 2. Instalar dependências
cd shared && npm install && cd ..
cd services/transactions && npm install && cd ../..
cd services/consolidation && npm install && cd ../..

# 3. Configurar banco de dados
cd services/transactions
npx prisma generate
npx prisma migrate dev --name init
cd ../..

cd services/consolidation
npx prisma generate
npx prisma migrate dev --name init
cd ../..

# 4. Iniciar serviços (em terminais separados)
# Terminal 1:
cd services/transactions && npm run dev

# Terminal 2:
cd services/consolidation && npm run dev
```

---

## 🧪 Testes Rápidos

### Criar Transação de Crédito

```bash
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "'$(uuidgen)'",
    "amount": 1500.00,
    "type": "CREDIT",
    "date": "'$(date +%Y-%m-%d)'",
    "description": "Venda de produto X",
    "categoryId": "cat_sales"
  }'
```

### Criar Transação de Débito

```bash
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "idempotencyKey": "'$(uuidgen)'",
    "amount": 500.00,
    "type": "DEBIT",
    "date": "'$(date +%Y-%m-%d)'",
    "description": "Compra de material",
    "categoryId": "cat_expenses"
  }'
```

### Listar Transações

```bash
curl http://localhost:3001/api/v1/transactions?page=1&limit=10 | jq '.'
```

### Buscar Saldo Consolidado

```bash
curl http://localhost:3002/api/v1/consolidation/balance/merchant_123/$(date +%Y-%m-%d) | jq '.'
```

---

## 🔍 Verificar Status

### Verificar Serviços Docker

```bash
docker-compose ps
```

Deve mostrar:
- ✅ postgres (healthy)
- ✅ redis (healthy)
- ✅ rabbitmq (healthy)

### Verificar Serviços Node.js

```bash
# Transactions Service
curl http://localhost:3001/api/v1/health

# Consolidation Service
curl http://localhost:3002/api/v1/health
```

Ambos devem retornar:
```json
{
  "status": "ok",
  "service": "...",
  "timestamp": "..."
}
```

---

## 🛑 Parar Serviços

### Windows (PowerShell)

```powershell
# Parar serviços Node.js (Ctrl+C em cada terminal)

# Parar Docker
docker-compose down
```

### Linux/Mac (Bash)

```bash
# Parar serviços Node.js
if [ -f .pids ]; then
  while read pid; do kill $pid 2>/dev/null || true; done < .pids
  rm .pids
fi

# Parar Docker
docker-compose down
```

---

## 🐛 Problemas Comuns

### Erro: "Port already in use"

**Windows:**
```powershell
# Verificar processo na porta
netstat -ano | findstr :3001
netstat -ano | findstr :3002

# Matar processo
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Verificar e matar processo
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### Erro: "Cannot connect to database"

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

### Erro: "Prisma Client not generated"

```bash
cd services/transactions
npx prisma generate

cd services/consolidation
npx prisma generate
```

---

## 📚 Próximos Passos

1. ✅ Explore a documentação Swagger:
   - http://localhost:3001/api/docs
   - http://localhost:3002/api/docs

2. ✅ Leia o guia completo de testes: [TESTING.md](TESTING.md)

3. ✅ Veja o status da implementação: [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)

4. ✅ Consulte a documentação técnica: [docs/](docs/)

---

## 🎯 Checklist de Sucesso

- [ ] Docker Desktop está rodando
- [ ] PostgreSQL, Redis e RabbitMQ estão UP
- [ ] Dependências instaladas (npm install)
- [ ] Prisma Client gerado
- [ ] Migrations executadas
- [ ] Transactions Service rodando na porta 3001
- [ ] Consolidation Service rodando na porta 3002
- [ ] Health checks retornam 200 OK
- [ ] Consegue criar transações
- [ ] Consegue listar transações
- [ ] Swagger UI está acessível

---

Made with Bob 🤖