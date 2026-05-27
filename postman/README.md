# Postman Collection - Cash Flow System

## 📦 Importar Collection

### Opção 1: Importar via Arquivo
1. Abra o Postman
2. Clique em **Import** (canto superior esquerdo)
3. Selecione o arquivo `Cash-Flow-System.postman_collection.json`
4. Clique em **Import**

### Opção 2: Importar via Link (se disponível)
```
https://raw.githubusercontent.com/seu-repo/cash-flow-system/main/postman/Cash-Flow-System.postman_collection.json
```

## 🔧 Configuração

### Variáveis da Collection

A collection já vem com as seguintes variáveis configuradas:

| Variável | Valor Padrão | Descrição |
|----------|--------------|-----------|
| `transactions_url` | `http://localhost:3001/api/v1` | URL base do Transactions Service |
| `consolidation_url` | `http://localhost:3002/api/v1` | URL base do Consolidation Service |

### Variáveis Dinâmicas

As seguintes variáveis são geradas automaticamente pelos scripts:

- `idempotency_key` - UUID único para cada transação
- `transaction_id` - ID da última transação criada
- `current_date` - Data atual (YYYY-MM-DD)
- `start_date` - Data de início (30 dias atrás)
- `end_date` - Data de fim (hoje)

## 📋 Requests Disponíveis

### Transactions Service (9 requests)

#### 1. Health Check
- **Método**: GET
- **Endpoint**: `/health`
- **Descrição**: Verifica se o serviço está rodando

#### 2. Create Credit Transaction
- **Método**: POST
- **Endpoint**: `/transactions`
- **Descrição**: Cria uma transação de crédito
- **Features**:
  - ✅ Gera UUID automático para idempotency
  - ✅ Usa data atual
  - ✅ Salva transaction_id para uso posterior
  - ✅ Testes automáticos incluídos

#### 3. Create Debit Transaction
- **Método**: POST
- **Endpoint**: `/transactions`
- **Descrição**: Cria uma transação de débito
- **Features**:
  - ✅ Gera UUID automático
  - ✅ Testes automáticos

#### 4. Test Idempotency (Duplicate)
- **Método**: POST
- **Endpoint**: `/transactions`
- **Descrição**: Tenta criar transação duplicada
- **Resultado Esperado**: 409 Conflict
- **Features**:
  - ✅ Usa mesmo idempotency_key
  - ✅ Valida erro 409

#### 5. Get Transaction by ID
- **Método**: GET
- **Endpoint**: `/transactions/:id`
- **Descrição**: Busca transação específica
- **Features**:
  - ✅ Usa transaction_id salvo anteriormente

#### 6. List All Transactions
- **Método**: GET
- **Endpoint**: `/transactions`
- **Descrição**: Lista todas as transações com paginação
- **Query Params**:
  - `page`: 1
  - `limit`: 20

#### 7. List Transactions - Filter by Type
- **Método**: GET
- **Endpoint**: `/transactions`
- **Descrição**: Filtra transações por tipo
- **Query Params**:
  - `type`: CREDIT ou DEBIT

#### 8. List Transactions - Filter by Date
- **Método**: GET
- **Endpoint**: `/transactions`
- **Descrição**: Filtra transações por período
- **Query Params**:
  - `startDate`: Data inicial
  - `endDate`: Data final

#### 9. Cancel Transaction
- **Método**: PATCH
- **Endpoint**: `/transactions/:id/cancel`
- **Descrição**: Cancela uma transação
- **Body**:
  ```json
  {
    "reason": "Cliente solicitou cancelamento"
  }
  ```

### Consolidation Service (4 requests)

#### 1. Health Check
- **Método**: GET
- **Endpoint**: `/health`
- **Descrição**: Verifica se o serviço está rodando

#### 2. Get Daily Balance
- **Método**: GET
- **Endpoint**: `/consolidation/balance/:merchantId/:date`
- **Descrição**: Busca saldo de um dia específico
- **Features**:
  - ✅ Usa data atual automaticamente
  - ✅ Trata 404 (balance não existe ainda)

#### 3. Get Balance History
- **Método**: GET
- **Endpoint**: `/consolidation/balance/:merchantId`
- **Descrição**: Busca histórico de saldos
- **Query Params**:
  - `startDate`: Últimos 30 dias (automático)
  - `endDate`: Hoje (automático)

#### 4. Get Summary
- **Método**: GET
- **Endpoint**: `/consolidation/summary/:merchantId`
- **Descrição**: Busca resumo consolidado
- **Features**:
  - ✅ Calcula período automaticamente
  - ✅ Retorna métricas agregadas

## 🧪 Testes Automáticos

Cada request inclui testes automáticos que validam:

### Transactions Service
- ✅ Status codes corretos (200, 201, 409, etc)
- ✅ Estrutura da resposta
- ✅ Tipos de dados
- ✅ Valores esperados
- ✅ Idempotência

### Consolidation Service
- ✅ Status codes
- ✅ Estrutura de saldos
- ✅ Presença de campos obrigatórios
- ✅ Tipos de arrays

## 🚀 Como Usar

### Fluxo Básico de Teste

1. **Iniciar Serviços**
   ```bash
   # Seguir guia em QUICK_START.md
   ```

2. **Executar Health Checks**
   - Transactions Service → Health Check
   - Consolidation Service → Health Check

3. **Criar Transações**
   - Create Credit Transaction
   - Create Debit Transaction

4. **Testar Idempotência**
   - Test Idempotency (deve retornar 409)

5. **Consultar Transações**
   - Get Transaction by ID
   - List All Transactions
   - List Transactions - Filter by Type
   - List Transactions - Filter by Date

6. **Cancelar Transação**
   - Cancel Transaction

7. **Consultar Consolidação**
   - Get Daily Balance
   - Get Balance History
   - Get Summary

### Executar Collection Completa

1. Clique com botão direito na collection
2. Selecione **Run collection**
3. Configure:
   - Iterations: 1
   - Delay: 500ms (entre requests)
4. Clique em **Run Cash Flow System**

### Executar Folder Específico

1. Clique com botão direito no folder (ex: "Transactions Service")
2. Selecione **Run folder**
3. Veja os resultados dos testes

## 📊 Visualizar Resultados

Após executar a collection:

1. **Test Results**: Mostra quantos testes passaram/falharam
2. **Response Time**: Tempo de resposta de cada request
3. **Status Codes**: Códigos HTTP retornados
4. **Test Scripts**: Detalhes de cada teste

## 🔄 Variáveis de Ambiente (Opcional)

Para diferentes ambientes, crie environments:

### Development
```json
{
  "transactions_url": "http://localhost:3001/api/v1",
  "consolidation_url": "http://localhost:3002/api/v1"
}
```

### Staging
```json
{
  "transactions_url": "https://staging-api.cashflow.com/transactions/v1",
  "consolidation_url": "https://staging-api.cashflow.com/consolidation/v1"
}
```

### Production
```json
{
  "transactions_url": "https://api.cashflow.com/transactions/v1",
  "consolidation_url": "https://api.cashflow.com/consolidation/v1
}
```

## 🐛 Troubleshooting

### Erro: "Could not get response"
- ✅ Verifique se os serviços estão rodando
- ✅ Confirme as portas (3001, 3002)
- ✅ Verifique firewall/antivírus

### Erro: 404 Not Found
- ✅ Verifique as URLs base nas variáveis
- ✅ Confirme que os endpoints estão corretos
- ✅ Verifique logs dos serviços

### Erro: 500 Internal Server Error
- ✅ Verifique logs dos serviços
- ✅ Confirme que o banco de dados está rodando
- ✅ Verifique migrations foram executadas

### Testes Falhando
- ✅ Execute requests individualmente
- ✅ Verifique variáveis estão sendo setadas
- ✅ Confirme ordem de execução (alguns dependem de outros)

## 📝 Notas

- **Idempotency Keys**: São gerados automaticamente usando `{{$guid}}`
- **Datas**: São calculadas dinamicamente nos pre-request scripts
- **Transaction ID**: É salvo automaticamente após criar uma transação
- **Merchant ID**: Usa valor padrão `merchant_123` (placeholder)

## 🔗 Links Úteis

- [Documentação Postman](https://learning.postman.com/docs/getting-started/introduction/)
- [Swagger UI - Transactions](http://localhost:3001/api/docs)
- [Swagger UI - Consolidation](http://localhost:3002/api/docs)
- [TESTING.md](../TESTING.md) - Guia completo de testes
- [QUICK_START.md](../QUICK_START.md) - Guia de início rápido

---

Made with Bob 🤖