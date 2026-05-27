# 🔐 Credenciais Padrão do Sistema

Este documento centraliza todas as credenciais padrão utilizadas no ambiente de desenvolvimento do Cash Flow System.

⚠️ **IMPORTANTE**: Estas credenciais são apenas para desenvolvimento local. **NUNCA** use em produção!

---

## 📊 Banco de Dados

### PostgreSQL
- **Host**: localhost
- **Porta**: 5432
- **Usuário**: `cashflow`
- **Senha**: `cashflow123`
- **Databases**:
  - `transactions` - Serviço de Transações
  - `consolidation` - Serviço de Consolidação
  - `reporting` - Serviço de Relatórios

**String de Conexão (exemplo)**:
```
postgresql://cashflow:cashflow123@localhost:5432/transactions?schema=public
```

---

## 💬 Message Broker

### RabbitMQ
- **Host**: localhost
- **Porta AMQP**: 5672
- **Porta Management UI**: 15672
- **Usuário**: `admin`
- **Senha**: `admin123`
- **Management UI**: http://localhost:15672

**String de Conexão**:
```
amqp://admin:admin123@localhost:5672
```

---

## 🗄️ Cache

### Redis
- **Host**: localhost
- **Porta**: 6379
- **Senha**: (sem senha no ambiente de desenvolvimento)

**String de Conexão**:
```
redis://localhost:6379
```

---

## 📈 Monitoramento

### Grafana
- **URL**: http://localhost:3000
- **Usuário**: `admin`
- **Senha**: `admin`

### Prometheus
- **URL**: http://localhost:9090
- **Autenticação**: Não requer

### Jaeger
- **URL**: http://localhost:16686
- **Autenticação**: Não requer

---

## 🔑 Aplicação

### JWT Secret (Desenvolvimento)
```
your-secret-key-change-in-production
```

⚠️ **Altere esta chave antes de fazer deploy em produção!**

---

## 🐳 Docker Compose

As credenciais acima são configuradas automaticamente quando você usa:

```bash
docker-compose up -d
```

---

## 📝 Variáveis de Ambiente

### Transactions Service (.env)
```env
DATABASE_URL="postgresql://cashflow:cashflow123@localhost:5432/transactions?schema=public"
RABBITMQ_URL="amqp://admin:admin123@localhost:5672"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-change-in-production
```

### Consolidation Service (.env)
```env
DATABASE_URL="postgresql://cashflow:cashflow123@localhost:5432/consolidation?schema=public"
RABBITMQ_URL="amqp://admin:admin123@localhost:5672"
```

### Reporting Service (.env)
```env
DATABASE_URL="postgresql://cashflow:cashflow123@localhost:5432/reporting?schema=public"
REDIS_URL="redis://localhost:6379"
```

---

## 🔒 Segurança em Produção

Antes de fazer deploy em produção, você DEVE:

- [ ] Alterar TODAS as senhas padrão
- [ ] Usar senhas fortes e únicas
- [ ] Armazenar credenciais em um gerenciador de secrets (AWS Secrets Manager, Azure Key Vault, etc)
- [ ] Habilitar SSL/TLS para todas as conexões
- [ ] Configurar firewalls e grupos de segurança
- [ ] Implementar rotação de credenciais
- [ ] Usar variáveis de ambiente ou secrets do Kubernetes
- [ ] Nunca commitar credenciais no Git

---

## 📚 Referências

- [docker-compose.yml](docker-compose.yml) - Configuração dos containers
- [.env.example](.env.example) - Template de variáveis de ambiente
- [README.md](README.md) - Documentação principal

---

**Última atualização**: 27/05/2026  
**Versão**: 1.0.0

---

*Este documento deve ser mantido atualizado sempre que houver mudanças nas credenciais padrão.*