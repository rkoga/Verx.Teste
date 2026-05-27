# 🚀 Guia de Inicialização do Ambiente - Cash Flow System

Este guia fornece instruções passo a passo para iniciar todo o ambiente do sistema.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ Node.js 20+ 
- ✅ Docker Desktop
- ✅ PostgreSQL (ou usar via Docker)
- ✅ Git

---

## 🐳 Passo 1: Iniciar Docker Desktop

### Windows
1. Abra o Docker Desktop
2. Aguarde até que o status mostre "Docker Desktop is running"
3. Verifique com: `docker ps`

### Verificação
```powershell
docker --version
docker ps
```

**Saída esperada**: Lista de containers (pode estar vazia inicialmente)

---

## 🗄️ Passo 2: Iniciar Infraestrutura (Bancos de Dados)

### Opção A: Usar Docker Compose (Recomendado)

```powershell
# Iniciar todos os serviços de infraestrutura
docker-compose up -d

# Verificar se os containers estão rodando
docker-compose ps

# Ver logs
docker-compose logs -f
```

**Serviços iniciados:**
- PostgreSQL (porta 5432) - com 3 databases:
  * transactions
  * consolidation
  * reporting
- Redis (porta 6379)
- RabbitMQ (portas 5672, 15672)
- Prometheus (porta 9090)
- Grafana (porta 3000)
- Jaeger (portas 6831, 16686)

### Opção B: Iniciar apenas o banco de dados

```powershell
# Iniciar apenas PostgreSQL
docker-compose up -d postgres

# Verificar
docker ps | Select-String postgres
```

### Opção C: PostgreSQL Local (sem Docker)

Se você já tem PostgreSQL instalado localmente:

```powershell
# Conectar ao PostgreSQL
psql -U postgres

# Criar os bancos de dados
CREATE DATABASE transactions_db;
CREATE DATABASE consolidation_db;
CREATE DATABASE reporting_db;

# Sair
\q
```

---

## 🔧 Passo 3: Configurar Variáveis de Ambiente

### Transactions Service

Crie/edite `services/transactions/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transactions_db?schema=public"

# Server
PORT=3001
NODE_ENV=development

# RabbitMQ
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# Redis
REDIS_URL="redis://localhost:6379"

# Logging
LOG_LEVEL=debug
```

### Consolidation Service

Crie/edite `services/consolidation/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/consolidation_db?schema=public"

# Server
PORT=3002
NODE_ENV=development

# RabbitMQ
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# Redis
REDIS_URL="redis://localhost:6379"

# Logging
LOG_LEVEL=debug
```

### Reporting Service

Crie/edite `services/reporting/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/reporting_db?schema=public"

# Server
PORT=3003
NODE_ENV=development

# Redis
REDIS_URL="redis://localhost:6379"

# Logging
LOG_LEVEL=debug
```

---

## 📊 Passo 4: Executar Migrações do Banco de Dados

### Transactions Service

```powershell
cd services/transactions

# Gerar Prisma Client (se ainda não foi feito)
npx prisma generate

# Criar e aplicar migração
npx prisma migrate dev --name init

# Verificar status
npx prisma migrate status

# Voltar ao diretório raiz
cd ../..
```

### Consolidation Service

```powershell
cd services/consolidation

# Gerar Prisma Client
npx prisma generate

# Criar e aplicar migração
npx prisma migrate dev --name init

# Verificar status
npx prisma migrate status

# Voltar ao diretório raiz
cd ../..
```

### Reporting Service

```powershell
cd services/reporting

# Gerar Prisma Client
npx prisma generate

# Criar e aplicar migração
npx prisma migrate dev --name init

# Verificar status
npx prisma migrate status

# Voltar ao diretório raiz
cd ../..
```

---

## 🚀 Passo 5: Iniciar os Serviços

### Opção A: Iniciar todos em terminais separados (Recomendado para desenvolvimento)

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

**Terminal 3 - Reporting Service:**
```powershell
cd services/reporting
npm run dev
```

### Opção B: Usar script automatizado

Crie um arquivo `start-all-services.ps1`:

```powershell
# Start all services in separate windows
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/transactions; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/consolidation; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/reporting; npm run dev"

Write-Host "All services started in separate windows!" -ForegroundColor Green
```

Execute:
```powershell
.\start-all-services.ps1
```

---

## ✅ Passo 6: Verificar se os Serviços Estão Rodando

### Health Checks

```powershell
# Transactions Service
curl http://localhost:3001/health

# Consolidation Service
curl http://localhost:3002/health

# Reporting Service
curl http://localhost:3003/health
```

**Saída esperada para cada um:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-26T16:00:00.000Z"
}
```

### Swagger Documentation

Abra no navegador:
- Transactions: http://localhost:3001/api-docs
- Consolidation: http://localhost:3002/api-docs

---

## 🧪 Passo 7: Testar a API

### Criar uma Transação

```powershell
# PowerShell
$body = @{
    amount = 100.50
    type = "CREDIT"
    description = "Test transaction"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/transactions" -Method Post -Body $body -ContentType "application/json"
```

### Listar Transações

```powershell
curl http://localhost:3001/transactions
```

### Obter Saldo Consolidado

```powershell
curl http://localhost:3002/consolidation/balance/2026-05-26
```

### Obter Relatório

```powershell
curl http://localhost:3003/api/transactions
```

---

## 🔍 Passo 8: Monitoramento e Observabilidade

### Prometheus
- URL: http://localhost:9090
- Métricas disponíveis em: http://localhost:3001/metrics

### Grafana
- URL: http://localhost:3000
- Login padrão: admin/admin
- Dashboards pré-configurados disponíveis

### RabbitMQ Management
- URL: http://localhost:15672
- Login: guest/guest
- Visualize filas e mensagens

### Jaeger UI
- URL: http://localhost:16686
- Visualize traces distribuídos

---

## 🛠️ Comandos Úteis

### Docker

```powershell
# Ver logs de um serviço específico
docker-compose logs -f postgres-transactions

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart postgres-transactions

# Ver uso de recursos
docker stats
```

### Prisma

```powershell
# Abrir Prisma Studio (GUI para banco de dados)
cd services/transactions
npx prisma studio

# Resetar banco de dados (CUIDADO: apaga dados)
npx prisma migrate reset

# Aplicar migrações em produção
npx prisma migrate deploy

# Gerar SQL das migrações
npx prisma migrate diff
```

### NPM

```powershell
# Instalar dependências de todos os serviços
npm install

# Limpar node_modules e reinstalar
Remove-Item -Recurse -Force node_modules
npm install

# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit
```

---

## 🐛 Troubleshooting

### Problema: Docker não está rodando
**Solução:**
1. Abra Docker Desktop
2. Aguarde inicialização completa
3. Verifique com `docker ps`

### Problema: Porta já em uso
**Solução:**
```powershell
# Verificar o que está usando a porta
netstat -ano | findstr :3001

# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

### Problema: Erro de conexão com banco de dados
**Solução:**
1. Verifique se o container PostgreSQL está rodando: `docker ps`
2. Verifique a string de conexão no .env
3. Teste conexão: `psql -h localhost -p 5432 -U postgres -d transactions_db`

### Problema: Prisma Client não encontrado
**Solução:**
```powershell
cd services/transactions
npx prisma generate
npm run build
```

### Problema: Erro ao executar migrações
**Solução:**
```powershell
# Resetar e recriar
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Problema: RabbitMQ não conecta
**Solução:**
1. Verifique se o container está rodando: `docker ps | Select-String rabbitmq`
2. Verifique logs: `docker-compose logs rabbitmq`
3. Reinicie: `docker-compose restart rabbitmq`

---

## 📝 Checklist de Inicialização

Use este checklist para garantir que tudo está funcionando:

- [ ] Docker Desktop está rodando
- [ ] Containers de infraestrutura iniciados (`docker-compose up -d`)
- [ ] Arquivos .env criados para cada serviço
- [ ] Prisma Client gerado para cada serviço
- [ ] Migrações executadas para cada serviço
- [ ] Transactions Service rodando (porta 3001)
- [ ] Consolidation Service rodando (porta 3002)
- [ ] Reporting Service rodando (porta 3003)
- [ ] Health checks respondendo OK
- [ ] Swagger docs acessíveis
- [ ] Teste de criação de transação bem-sucedido
- [ ] Prometheus acessível (porta 9090)
- [ ] Grafana acessível (porta 3000)
- [ ] RabbitMQ Management acessível (porta 15672)

---

## 🎯 Próximos Passos

Após inicializar o ambiente:

1. **Testar Fluxo Completo**
   - Criar transações
   - Verificar consolidação
   - Consultar relatórios

2. **Configurar Observabilidade**
   - Importar dashboards do Grafana
   - Configurar alertas
   - Testar tracing

3. **Executar Testes**
   - Testes unitários
   - Testes de integração
   - Testes e2e

4. **Documentação**
   - Revisar documentação da API
   - Criar guias de uso
   - Documentar casos de uso

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs dos serviços
2. Consulte a seção de Troubleshooting
3. Revise a documentação em `/docs`
4. Verifique o BUILD_SUCCESS_SUMMARY.md

---

*Guia criado por Bob - Your AI Software Engineer*
*Última atualização: 26/05/2026*