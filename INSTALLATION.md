# Guia de Instalação - Sistema de Controle de Fluxo de Caixa

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **npm** >= 10.0.0 (vem com Node.js)
- **Docker** >= 24.0.0 ([Download](https://www.docker.com/))
- **Docker Compose** >= 2.20.0 ([Download](https://docs.docker.com/compose/install/))
- **Git** ([Download](https://git-scm.com/))

### Verificar Instalações

```bash
node --version    # Deve mostrar v20.x.x ou superior
npm --version     # Deve mostrar 10.x.x ou superior
docker --version  # Deve mostrar 24.x.x ou superior
docker-compose --version  # Deve mostrar 2.x.x ou superior
```

## 🚀 Instalação Rápida (Recomendado)

### Opção 1: Script Automatizado (Linux/Mac)

```bash
# 1. Dar permissão de execução ao script
chmod +x scripts/setup.sh

# 2. Executar o script
./scripts/setup.sh
```

O script irá:
- ✅ Verificar pré-requisitos
- ✅ Copiar .env.example para .env
- ✅ Instalar todas as dependências
- ✅ Iniciar serviços de infraestrutura
- ✅ Gerar Prisma Client
- ✅ Rodar migrations do banco

### Opção 2: Instalação Manual (Windows/Todos OS)

#### Passo 1: Configurar Variáveis de Ambiente

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

#### Passo 2: Instalar Dependências

```bash
# Instalar dependências do root
npm install

# Instalar dependências do shared
cd shared
npm install
cd ..

# Instalar dependências do transactions service
cd services/transactions
npm install
cd ../..
```

#### Passo 3: Iniciar Infraestrutura

```bash
# Iniciar PostgreSQL, Redis e RabbitMQ
docker-compose up -d postgres redis rabbitmq

# Aguardar serviços iniciarem (30 segundos)
# Windows (PowerShell)
Start-Sleep -Seconds 30

# Linux/Mac
sleep 30
```

#### Passo 4: Configurar Banco de Dados

```bash
cd services/transactions

# Gerar Prisma Client
npx prisma generate

# Rodar migrations
npx prisma migrate dev --name init

cd ../..
```

## ✅ Verificar Instalação

### 1. Verificar Serviços Docker

```bash
docker-compose ps
```

Você deve ver:
- ✅ postgres (healthy)
- ✅ redis (healthy)
- ✅ rabbitmq (healthy)

### 2. Testar Conexões

```bash
# Testar PostgreSQL
docker-compose exec postgres psql -U cashflow -d transactions -c "SELECT 1"

# Testar Redis
docker-compose exec redis redis-cli ping
# Deve retornar: PONG

# Testar RabbitMQ
curl http://localhost:15672
# Deve abrir a interface de gerenciamento
```

### 3. Iniciar Transactions Service

```bash
cd services/transactions
npm run dev
```

Aguarde a mensagem:
```
🚀 Transactions Service is running on: http://localhost:3001
📚 API Documentation: http://localhost:3001/api/docs
```

### 4. Testar Health Check

Em outro terminal:

```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "service": "transactions-service",
  "timestamp": "2026-05-26T12:00:00.000Z",
  "uptime": 5.123
}
```

## 🌐 Acessar Serviços

Após a instalação, você pode acessar:

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Transactions API** | http://localhost:3001 | - |
| **API Documentation** | http://localhost:3001/api/docs | - |
| **Health Check** | http://localhost:3001/health | - |
| **PostgreSQL** | localhost:5432 | cashflow / cashflow123 |
| **RabbitMQ Management** | http://localhost:15672 | admin / admin123 |
| **Redis** | localhost:6379 | - |
| **RabbitMQ Management** | http://localhost:15672 | guest / guest |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin / admin |
| **Jaeger** | http://localhost:16686 | - |

## 🔧 Comandos Úteis

### Gerenciar Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f postgres

# Reiniciar um serviço
docker-compose restart postgres

# Remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

### Gerenciar Banco de Dados

```bash
cd services/transactions

# Abrir Prisma Studio (GUI para o banco)
npx prisma studio

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Resetar banco de dados (CUIDADO: apaga dados)
npx prisma migrate reset

# Gerar Prisma Client
npx prisma generate
```

### Desenvolvimento

```bash
# Iniciar em modo desenvolvimento (com hot reload)
cd services/transactions
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm run start:prod

# Rodar testes
npm test

# Rodar testes com coverage
npm run test:cov

# Lint
npm run lint

# Format
npm run format
```

## 🐛 Troubleshooting

### Problema: Porta já em uso

```bash
# Verificar o que está usando a porta
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001

# Matar o processo
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

### Problema: Docker não inicia

```bash
# Verificar status do Docker
docker info

# Reiniciar Docker
# Windows: Reiniciar Docker Desktop
# Linux: sudo systemctl restart docker
```

### Problema: Erro ao conectar no banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres

# Verificar conexão
docker-compose exec postgres psql -U cashflow -d transactions -c "SELECT 1"
```

### Problema: Prisma Client não encontrado

```bash
cd services/transactions
npx prisma generate
```

### Problema: Migrations falhando

```bash
cd services/transactions

# Resetar banco (CUIDADO: apaga dados)
npx prisma migrate reset

# Ou criar nova migration
npx prisma migrate dev --name fix_migration
```

### Problema: Dependências não instaladas

```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules
rm -rf node_modules
rm -rf shared/node_modules
rm -rf services/transactions/node_modules

# Reinstalar
npm install
cd shared && npm install && cd ..
cd services/transactions && npm install && cd ../..
```

## 🔄 Reinstalação Completa

Se algo der muito errado, você pode fazer uma reinstalação completa:

```bash
# 1. Parar e remover todos os containers e volumes
docker-compose down -v

# 2. Remover node_modules
rm -rf node_modules
rm -rf shared/node_modules
rm -rf services/transactions/node_modules

# 3. Remover .env
rm .env

# 4. Executar setup novamente
./scripts/setup.sh  # Linux/Mac
# Ou seguir instalação manual para Windows
```

## 📚 Próximos Passos

Após a instalação bem-sucedida:

1. ✅ Explore a **API Documentation**: http://localhost:3001/api/docs
2. ✅ Teste os **endpoints** usando Postman ou curl
3. ✅ Acesse o **Prisma Studio**: `npx prisma studio`
4. ✅ Veja os **logs** em tempo real: `docker-compose logs -f`
5. ✅ Configure o **Grafana** com dashboards personalizados

## 🆘 Suporte

Se encontrar problemas:

1. Verifique a seção **Troubleshooting** acima
2. Consulte a **documentação** em `docs/`
3. Veja os **logs** dos serviços: `docker-compose logs`
4. Abra uma **issue** no repositório

## 📝 Notas Importantes

- ⚠️ **Não use em produção** sem configurar secrets adequadamente
- ⚠️ **Altere as senhas** no arquivo `.env` antes de deploy
- ⚠️ **Faça backup** do banco de dados regularmente
- ⚠️ **Configure SSL/TLS** para comunicação segura em produção

---

**Última atualização:** 26/05/2026
**Versão:** 1.0.0