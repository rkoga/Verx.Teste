# 🚀 Guia de Inicialização dos Serviços

**Data**: 26/05/2026  
**Status**: ⚠️ Problema de Conexão Prisma Identificado

---

## 🎯 Situação Atual

### ✅ O que está funcionando
- Docker containers rodando (PostgreSQL, Redis, RabbitMQ)
- Bancos de dados criados e tabelas sincronizadas
- Código compila sem erros
- Rotas mapeadas corretamente

### ❌ Problema Identificado

**Erro**: `PrismaClientInitializationError: Can't reach database server at localhost:5432`

**Causa Raiz**: O Prisma Client embute a URL do datasource no momento da geração. Mesmo alterando o `.env` para usar `127.0.0.1`, o client já gerado ainda usa `localhost`.

---

## 🔧 Soluções Disponíveis

### Solução 1: Usar Docker Compose para TUDO (Recomendado)

Esta é a solução mais robusta - rodar os serviços Node.js também em containers Docker.

**Vantagens**:
- Todos os serviços na mesma rede Docker
- Usa nomes de serviço em vez de localhost
- Ambiente consistente

**Passos**:

1. **Atualizar .env para usar nomes de serviço Docker**:

```env
# services/transactions/.env
DATABASE_URL="postgresql://cashflow:cashflow123@postgres:5432/transactions?schema=public"
RABBITMQ_URL="amqp://admin:admin123@rabbitmq:5672"
REDIS_HOST=redis
```

2. **Build das imagens Docker**:

```powershell
docker-compose build transactions-service
docker-compose build consolidation-service
docker-compose build reporting-service
```

3. **Iniciar todos os serviços**:

```powershell
docker-compose up -d
```

4. **Verificar**:

```powershell
docker-compose ps
docker-compose logs -f transactions-service
```

### Solução 2: Adicionar Entry no hosts (Windows)

Força `localhost` a resolver para `127.0.0.1`.

**Passos**:

1. Abra o Notepad como Administrador

2. Abra o arquivo: `C:\Windows\System32\drivers\etc\hosts`

3. Adicione a linha:

```
127.0.0.1 localhost
```

4. Salve e feche

5. Reinicie os serviços

### Solução 3: Usar PostgreSQL Local (sem Docker)

Instalar PostgreSQL diretamente no Windows.

**Passos**:

1. Baixe PostgreSQL 16 para Windows

2. Instale com usuário `postgres` e senha `postgres`

3. Crie os bancos:

```sql
CREATE DATABASE transactions;
CREATE DATABASE consolidation;
CREATE DATABASE reporting;
```

4. Atualize .env:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/transactions?schema=public"
```

5. Execute migrações e inicie serviços

### Solução 4: Usar WSL2 (Windows Subsystem for Linux)

Rodar tudo no WSL2 onde a rede funciona melhor.

**Passos**:

1. Instale WSL2 se não tiver

2. Clone o projeto no WSL2

3. Instale Node.js no WSL2

4. Execute tudo de dentro do WSL2

---

## 📊 Comparação das Soluções

| Solução | Dificuldade | Tempo | Recomendado |
|---------|-------------|-------|-------------|
| Docker Compose | Fácil | 5 min | ⭐⭐⭐⭐⭐ |
| Hosts File | Fácil | 2 min | ⭐⭐⭐ |
| PostgreSQL Local | Média | 15 min | ⭐⭐ |
| WSL2 | Média | 10 min | ⭐⭐⭐⭐ |

---

## 🐳 Solução Recomendada: Docker Compose Completo

### Passo 1: Atualizar arquivos .env

**services/transactions/.env**:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://cashflow:cashflow123@postgres:5432/transactions?schema=public"
RABBITMQ_URL="amqp://admin:admin123@rabbitmq:5672"
REDIS_HOST=redis
REDIS_PORT=6379
LOG_LEVEL=debug
JWT_SECRET=your-secret-key-change-in-production
```

**services/consolidation/.env**:
```env
NODE_ENV=development
PORT=3002
DATABASE_URL="postgresql://cashflow:cashflow123@postgres:5432/consolidation?schema=public"
RABBITMQ_URL="amqp://admin:admin123@rabbitmq:5672"
REDIS_HOST=redis
REDIS_PORT=6379
LOG_LEVEL=debug
CONSOLIDATION_CRON=0 0 * * *
```

**services/reporting/.env**:
```env
NODE_ENV=development
PORT=3003
DATABASE_URL="postgresql://cashflow:cashflow123@postgres:5432/reporting?schema=public"
REDIS_URL=redis://redis:6379
LOG_LEVEL=debug
CORS_ORIGIN=*
```

### Passo 2: Regenerar Prisma Clients

```powershell
cd services/transactions
npx prisma generate
cd ../consolidation
npx prisma generate
cd ../reporting
npx prisma generate
cd ../..
```

### Passo 3: Build das Imagens

```powershell
docker-compose build
```

### Passo 4: Iniciar Tudo

```powershell
docker-compose up -d
```

### Passo 5: Verificar

```powershell
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f transactions-service

# Testar health
curl http://localhost:3001/api/v1/health
curl http://localhost:3002/api/v1/health
curl http://localhost:3003/api/v1/health
```

---

## 🔍 Diagnóstico do Problema

### Por que acontece?

1. **Prisma gera código estático**: O Prisma Client é gerado com base no schema.prisma e no .env no momento da geração
2. **Windows Docker networking**: No Windows, `localhost` dentro de um container Node.js não resolve corretamente para o host
3. **Cache do Prisma**: Mesmo regenerando, o Prisma pode usar cache

### Como evitar no futuro?

1. **Sempre use Docker Compose para desenvolvimento**
2. **Use nomes de serviço em vez de localhost/127.0.0.1**
3. **Documente a configuração de rede claramente**

---

## 📝 Checklist de Troubleshooting

Se os serviços não iniciarem:

- [ ] Docker Desktop está rodando?
- [ ] Containers de infraestrutura estão healthy?
- [ ] Arquivos .env existem e estão corretos?
- [ ] Prisma Clients foram gerados?
- [ ] Migrações foram executadas?
- [ ] Portas 3001, 3002, 3003 estão livres?
- [ ] Firewall não está bloqueando?

---

## 🎓 Lições Aprendidas

1. **Prisma + Docker no Windows**: Requer atenção especial à configuração de rede
2. **localhost vs 127.0.0.1**: Podem se comportar diferentemente no Windows
3. **Docker Compose é a solução**: Para ambientes de desenvolvimento consistentes
4. **Documentação é crucial**: Problemas de ambiente devem ser bem documentados

---

## 🚀 Próximos Passos

### Opção A: Continuar com Docker Compose (Recomendado)

1. Atualizar .env files
2. Regenerar Prisma Clients
3. Build e start com docker-compose
4. Testar APIs

### Opção B: Continuar sem Docker para serviços

1. Adicionar entry no hosts file
2. Reiniciar serviços
3. Testar se conecta

### Opção C: Documentar e entregar

1. Documentar o problema encontrado
2. Fornecer todas as soluções
3. Deixar para o usuário escolher a abordagem

---

## 📚 Recursos Adicionais

- [Prisma Connection Issues](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)
- [Docker Networking](https://docs.docker.com/network/)
- [NestJS with Docker](https://docs.nestjs.com/recipes/prisma#docker)

---

**Criado por Bob - AI Software Engineer**  
**Última atualização**: 26/05/2026 13:36