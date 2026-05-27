# Guia Rápido - Iniciar Serviços Manualmente

## ✅ Pré-requisitos Verificados
- ✓ Docker rodando
- ✓ Infraestrutura iniciada (PostgreSQL, Redis, RabbitMQ)
- ✓ Bancos de dados criados (transactions, consolidation, reporting)
- ✓ Arquivos .env configurados
- ✓ Dependências instaladas (npm install)
- ✓ Prisma Clients gerados

## 🚀 Iniciar Serviços

### Opção 1: Usar o Script Automatizado
```powershell
.\start-all-services.ps1
```

### Opção 2: Iniciar Manualmente (3 terminais separados)

#### Terminal 1 - Transactions Service
```powershell
cd services/transactions
npm run dev
```
Porta: **3001**

#### Terminal 2 - Consolidation Service
```powershell
cd services/consolidation
npm run dev
```
Porta: **3002**

#### Terminal 3 - Reporting Service
```powershell
cd services/reporting
npm run dev
```
Porta: **3003**

## 🔍 Verificar Status

### Health Checks
```powershell
# Transactions
curl http://localhost:3001/health

# Consolidation
curl http://localhost:3002/health

# Reporting
curl http://localhost:3003/health
```

### Swagger Documentation
- Transactions: http://localhost:3001/api-docs
- Consolidation: http://localhost:3002/api-docs

## 🧪 Testar API

Execute o script de testes:
```powershell
.\test-api.ps1
```

Ou teste manualmente:
```powershell
# Criar transação
curl -X POST http://localhost:3001/transactions `
  -H "Content-Type: application/json" `
  -d '{
    "amount": 100.50,
    "type": "CREDIT",
    "description": "Venda de produto"
  }'
```

## 📊 Monitoramento

### Infraestrutura
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Jaeger**: http://localhost:16686

### Logs
Os serviços exibem logs no console. Nível de log configurado: `debug`

## ⚠️ Troubleshooting

### Porta já em uso
```powershell
# Verificar processo usando a porta
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess

# Parar processo
Stop-Process -Id <PID>
```

### Erro de conexão com banco
```powershell
# Verificar se PostgreSQL está rodando
docker ps | Select-String postgres

# Verificar logs do container
docker logs cashflow-postgres
```

### Prisma Client não encontrado
```powershell
cd services/<service-name>
npx prisma generate
```

### Migrações pendentes
```powershell
cd services/<service-name>
npx prisma migrate deploy
```

## 🛑 Parar Serviços

### Parar serviços Node.js
Pressione `Ctrl+C` em cada terminal

### Parar infraestrutura Docker
```powershell
docker-compose down
```

### Parar e remover volumes (⚠️ apaga dados)
```powershell
docker-compose down -v
```

## 📝 Notas

- Os serviços usam **hot reload** em modo desenvolvimento
- Alterações no código são refletidas automaticamente
- Logs são exibidos em tempo real no console
- Use `Ctrl+C` para parar cada serviço

---

*Made with ❤️ by Bob - AI Software Engineer*