# Mapeamento de Domínios Funcionais e Capacidades de Negócio

## 1. Visão Geral do Sistema

Sistema de controle de fluxo de caixa para comerciantes, permitindo o registro de lançamentos financeiros (débitos e créditos) e a geração de relatórios consolidados diários.

## 2. Domínios Funcionais Identificados

### 2.1 Domínio de Lançamentos (Transactions Domain)

**Responsabilidade Principal:** Gerenciar todos os lançamentos financeiros do comerciante.

**Capacidades de Negócio:**
- **Registrar Lançamentos:** Criar novos débitos e créditos
- **Validar Transações:** Garantir integridade dos dados financeiros
- **Consultar Histórico:** Buscar lançamentos por período, tipo, categoria
- **Categorizar Transações:** Organizar lançamentos por categorias de negócio
- **Editar/Cancelar Lançamentos:** Permitir correções (com auditoria)

**Entidades Principais:**
- `Transaction` (Lançamento)
- `TransactionType` (Débito/Crédito)
- `Category` (Categoria)
- `Merchant` (Comerciante)

**Regras de Negócio:**
- Todo lançamento deve ter: valor, tipo, data, descrição
- Valores devem ser positivos (tipo define débito/crédito)
- Data não pode ser futura
- Lançamentos não podem ser deletados, apenas cancelados (auditoria)

### 2.2 Domínio de Consolidação (Consolidation Domain)

**Responsabilidade Principal:** Processar e consolidar saldos diários.

**Capacidades de Negócio:**
- **Calcular Saldo Diário:** Processar todos os lançamentos do dia
- **Gerar Relatórios:** Criar relatórios de saldo consolidado
- **Processar em Lote:** Lidar com alto volume de transações
- **Manter Histórico:** Armazenar consolidações históricas
- **Reprocessar Períodos:** Recalcular saldos quando necessário

**Entidades Principais:**
- `DailyConsolidation` (Consolidado Diário)
- `ConsolidationStatus` (Status do processamento)
- `BalanceSnapshot` (Snapshot de saldo)

**Regras de Negócio:**
- Consolidação processa lançamentos de D-1 (dia anterior)
- Saldo = Saldo Anterior + Créditos - Débitos
- Consolidação deve ser idempotente (reprocessamento seguro)
- Máximo 5% de perda de requisições em picos (50 req/s)

### 2.3 Domínio Compartilhado (Shared Kernel)

**Responsabilidade Principal:** Elementos comuns entre domínios.

**Componentes:**
- **Value Objects:** Money, Date, MerchantId
- **Domain Events:** TransactionCreated, ConsolidationCompleted
- **Common Types:** Result, Error, ValidationError

## 3. Bounded Contexts e Relacionamentos

```
┌─────────────────────────────────────────────────────────────────┐
│                    CASH FLOW SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐         ┌──────────────────────┐    │
│  │  Transactions BC     │         │  Consolidation BC    │    │
│  │  (Upstream)          │────────▶│  (Downstream)        │    │
│  │                      │  Events │                      │    │
│  │ Entities:            │         │ Entities:            │    │
│  │ - Transaction        │         │ - DailyConsolidation │    │
│  │ - Category           │         │ - BalanceSnapshot    │    │
│  │ - Merchant           │         │                      │    │
│  │                      │         │ Aggregates:          │    │
│  │ Services:            │         │ - Daily balance      │    │
│  │ - Create transaction │         │ - Period reports     │    │
│  │ - List transactions  │         │                      │    │
│  │ - Validate entry     │         │ Services:            │    │
│  └──────────────────────┘         │ - Process daily      │    │
│           │                        │ - Generate report    │    │
│           │                        └──────────────────────┘    │
│           │                                 │                  │
│           └────────────┬────────────────────┘                  │
│                        │                                       │
│                 ┌──────▼──────┐                               │
│                 │ Shared       │                               │
│                 │ Kernel       │                               │
│                 │              │                               │
│                 │ - Money      │                               │
│                 │ - Events     │                               │
│                 │ - Types      │                               │
│                 └──────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Padrões de Integração

### 4.1 Event-Driven Architecture
- **Transactions BC** publica eventos quando lançamentos são criados
- **Consolidation BC** consome eventos de forma assíncrona
- Garante desacoplamento e resiliência

### 4.2 CQRS (Command Query Responsibility Segregation)
- **Write Model:** Otimizado para comandos (criar lançamentos)
- **Read Model:** Otimizado para consultas (relatórios consolidados)

## 5. Capacidades de Negócio Mapeadas

| Capacidade | Domínio | Prioridade | Complexidade |
|------------|---------|------------|--------------|
| Registrar lançamentos | Transactions | Alta | Média |
| Validar transações | Transactions | Alta | Baixa |
| Consultar histórico | Transactions | Média | Baixa |
| Calcular saldo diário | Consolidation | Alta | Alta |
| Gerar relatórios | Consolidation | Alta | Média |
| Processar em lote | Consolidation | Alta | Alta |
| Categorizar transações | Transactions | Baixa | Baixa |
| Reprocessar períodos | Consolidation | Média | Média |

## 6. Fluxos de Negócio Principais

### 6.1 Fluxo de Registro de Lançamento
1. Comerciante envia lançamento via API
2. Sistema valida dados (valor, data, tipo)
3. Lançamento é persistido
4. Evento `TransactionCreated` é publicado
5. Resposta de sucesso é retornada

### 6.2 Fluxo de Consolidação Diária
1. Job agendado inicia processamento (ex: 00:00)
2. Sistema busca lançamentos do dia anterior
3. Calcula saldo: Saldo Anterior + Créditos - Débitos
4. Persiste consolidação diária
5. Evento `ConsolidationCompleted` é publicado
6. Relatório fica disponível para consulta

## 7. Requisitos de Domínio

### 7.1 Invariantes
- Saldo consolidado deve ser consistente com lançamentos
- Não pode haver gaps em consolidações diárias
- Lançamentos não podem ser deletados (soft delete apenas)

### 7.2 Políticas de Negócio
- Consolidação processa apenas dias completos (D-1)
- Reprocessamento deve manter histórico de versões
- Categorias são opcionais mas recomendadas

## 8. Glossário Ubíquo (Ubiquitous Language)

| Termo | Definição |
|-------|-----------|
| **Lançamento** | Registro de entrada ou saída financeira |
| **Débito** | Saída de dinheiro (despesa) |
| **Crédito** | Entrada de dinheiro (receita) |
| **Consolidação** | Processo de cálculo do saldo diário |
| **Saldo Diário** | Resultado financeiro do dia (créditos - débitos) |
| **Comerciante** | Usuário do sistema que registra lançamentos |
| **Categoria** | Classificação de lançamentos (ex: vendas, fornecedores) |
| **Snapshot** | Foto do saldo em um momento específico |

## 9. Contextos de Integração Externa

### 9.1 Potenciais Integrações Futuras
- Sistema de contabilidade
- Bancos (conciliação bancária)
- ERP/CRM
- Sistemas de pagamento
- Ferramentas de BI

### 9.2 Anti-Corruption Layer
- Adaptadores para sistemas legados
- Tradução de modelos externos para domínio interno
- Proteção do core domain