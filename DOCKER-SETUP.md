# Guia de Setup do Docker - Sistema de Fluxo de Caixa

## ✅ Status Atual
- Docker containers rodando com sucesso
- PostgreSQL: ✅ Healthy (porta 5432)
- Redis: ✅ Healthy (porta 6379)
- RabbitMQ: ✅ Healthy (portas 5672, 15672)

## 📋 Comandos Importantes

### Para executar comandos Prisma:

**❌ ERRADO** (tentando conectar localmente):
```bash
cd services/transactions
npx prisma migrate dev
```

**✅ CORRETO** (executar dentro do container):
```bash
# Opção 1: Executar comando único
docker exec cashflow-transactions npx prisma migrate dev

# Opção 2: Entrar no container e executar comandos
docker exec -it cashflow-transactions sh
npx prisma migrate dev
exit
```

### Migrations do Prisma

```bash
# Criar e aplicar migration
docker exec cashflow-transactions npx prisma migrate dev --name init

# Aplicar migrations pendentes
docker exec cashflow-transactions npx prisma migrate deploy

# Resetar banco de dados
docker exec cashflow-transactions npx prisma migrate reset

# Abrir Prisma Studio
docker exec -it cashflow-transactions npx prisma studio
```

### Gerenciar Containers

```bash
# Ver status dos containers
docker ps

# Ver logs de um serviço
docker logs cashflow-transactions -f
docker logs cashflow-postgres -f

# Parar todos os containers
docker-compose down

# Iniciar containers
docker-compose up -d

# Reiniciar um serviço específico
docker-compose restart transactions-service

# Reconstruir e iniciar
docker-compose up -d --build
```

### Acessar Banco de Dados

```bash
# Via Docker
docker exec -it cashflow-postgres psql -U cashflow -d transactions

# Via localhost (se precisar conectar de fora)
psql -h localhost -p 5432 -U cashflow -d transactions
# Senha: cashflow123
```

## 🔧 Variáveis de Ambiente

### Arquivo `.env` (raiz do projeto)
```env
DATABASE_URL=postgresql://cashflow:cashflow123@localhost:5432/transactions
TRANSACTIONS_DB_URL=postgresql://cashflow:cashflow123@postgres:5432/transactions
```

**Diferença:**
- `DATABASE_URL` → Para comandos locais (usa `localhost`)
- `TRANSACTIONS_DB_URL` → Para containers Docker (usa `postgres`)

### Arquivo `services/transactions/.env`
```env
DATABASE_URL=postgresql://cashflow:cashflow123@localhost:5432/transactions
```

## 📝 Próximos Passos

1. **Criar as migrations iniciais:**
   ```bash
   docker exec cashflow-transactions npx prisma migrate dev --name init
   ```

2. **Verificar se as tabelas foram criadas:**
   ```bash
   docker exec cashflow-postgres psql -U cashflow -d transactions -c "\dt"
   ```

3. **Iniciar o serviço de transações:**
   ```bash
   docker-compose up transactions-service -d
   ```

4. **Verificar logs:**
   ```bash
   docker logs cashflow-transactions -f
   ```

## 🐛 Troubleshooting

### Erro: "Can't reach database server at localhost:5432"
**Causa:** Tentando executar comando Prisma localmente
**Solução:** Execute dentro do container Docker

### Erro: "Environment variable not found: DATABASE_URL"
**Causa:** Arquivo `.env` não existe no diretório correto
**Solução:** Criar `services/transactions/.env` com DATABASE_URL

### Erro: "Port 5432 already in use"
**Causa:** PostgreSQL já está rodando localmente
**Solução:** Parar PostgreSQL local ou mudar porta no docker-compose.yml

## 🔗 URLs Úteis

- **RabbitMQ Management:** http://localhost:15672 (admin/admin123)
- **Grafana:** http://localhost:3000 (admin/admin)
- **Prometheus:** http://localhost:9090
- **Jaeger:** http://localhost:16686
- **Transactions API:** http://localhost:3001 (quando iniciado)

## ✅ Checklist de Validação

- [x] Docker instalado e rodando
- [x] Containers PostgreSQL, Redis e RabbitMQ iniciados
- [x] Variáveis de ambiente configuradas
- [x] Prisma Client gerado
- [ ] Migrations aplicadas
- [ ] Serviço de transações iniciado
- [ ] API respondendo em http://localhost:3001/health