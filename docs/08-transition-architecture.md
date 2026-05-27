# Arquitetura de Transição

## 1. Contexto

Este documento descreve a estratégia de transição de um possível sistema legado para a arquitetura alvo de microserviços. Mesmo que este seja um projeto greenfield (novo), é importante documentar como seria a migração caso houvesse um sistema anterior.

## 2. Cenários de Migração

### 2.1 Cenário 1: Sistema Monolítico Existente

**Situação Atual (Hipotética):**
- Aplicação monolítica em PHP/Java
- Banco de dados único (MySQL/Oracle)
- Lógica de negócio acoplada
- Interface web tradicional (server-side rendering)

**Desafios:**
- Dados históricos precisam ser migrados
- Sistema precisa continuar operando durante migração
- Usuários não podem perceber interrupção
- Integridade de dados deve ser mantida

### 2.2 Cenário 2: Planilhas Excel/Sistemas Manuais

**Situação Atual (Hipotética):**
- Controle manual via planilhas Excel
- Cálculos manuais de saldo
- Sem histórico estruturado
- Propenso a erros humanos

**Desafios:**
- Dados não estruturados
- Falta de validações
- Histórico incompleto
- Necessidade de limpeza de dados

## 3. Estratégia de Migração (Strangler Fig Pattern)

### 3.1 Visão Geral

Utilizaremos o **Strangler Fig Pattern** para migração gradual:

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 1: Coexistência                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────────────────┐    │
│  │   Sistema    │         │   Novo Sistema           │    │
│  │   Legado     │◄───────►│   (Microserviços)        │    │
│  │              │  Sync   │                          │    │
│  └──────────────┘         └──────────────────────────┘    │
│         │                            │                     │
│         └────────────┬───────────────┘                     │
│                      │                                     │
│                      ▼                                     │
│              ┌──────────────┐                             │
│              │  API Gateway │                             │
│              │  (Roteamento)│                             │
│              └──────────────┘                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FASE 2: Migração Gradual                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────────────────┐    │
│  │   Sistema    │         │   Novo Sistema           │    │
│  │   Legado     │         │   (Microserviços)        │    │
│  │  (Reduzido)  │         │   (Expandido)            │    │
│  └──────────────┘         └──────────────────────────┘    │
│         │                            │                     │
│         └────────────┬───────────────┘                     │
│                      │                                     │
│                      ▼                                     │
│              ┌──────────────┐                             │
│              │  API Gateway │                             │
│              │  (90% novo)  │                             │
│              └──────────────┘                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FASE 3: Completa                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ┌──────────────────────────┐                  │
│              │   Novo Sistema           │                  │
│              │   (Microserviços)        │                  │
│              │   100% Operacional       │                  │
│              └──────────────────────────┘                  │
│                         │                                   │
│                         ▼                                   │
│              ┌──────────────┐                              │
│              │  API Gateway │                              │
│              └──────────────┘                              │
│                                                             │
│  Sistema Legado: Descomissionado ✓                         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Fases da Migração

#### Fase 1: Preparação (Semanas 1-2)

**Objetivos:**
- Análise do sistema legado
- Mapeamento de dados
- Definição de estratégia de sincronização
- Setup de ambiente de transição

**Atividades:**
1. **Análise de Dados:**
   - Inventário de tabelas/entidades
   - Identificação de relacionamentos
   - Análise de qualidade de dados
   - Definição de regras de limpeza

2. **Infraestrutura:**
   - Setup de ambiente de staging
   - Configuração de ferramentas de migração
   - Preparação de scripts de ETL

3. **Documentação:**
   - Mapeamento de campos (legado → novo)
   - Regras de transformação
   - Plano de rollback

**Entregáveis:**
- ✅ Documento de mapeamento de dados
- ✅ Scripts de ETL
- ✅ Ambiente de staging configurado
- ✅ Plano de rollback

#### Fase 2: Migração de Dados Históricos (Semanas 3-4)

**Objetivos:**
- Migrar dados históricos
- Validar integridade
- Garantir consistência

**Processo:**

```sql
-- Exemplo de migração de transações
INSERT INTO new_system.transactions (
  id,
  amount,
  type,
  date,
  description,
  status,
  created_at
)
SELECT
  CONCAT('legacy_', id) as id,
  ABS(amount) as amount,
  CASE 
    WHEN amount > 0 THEN 'CREDIT'
    ELSE 'DEBIT'
  END as type,
  transaction_date as date,
  COALESCE(description, 'Migrated from legacy') as description,
  'CONSOLIDATED' as status,
  created_at
FROM legacy_system.lancamentos
WHERE deleted_at IS NULL
  AND transaction_date < CURRENT_DATE;
```

**Validações:**
```typescript
// Script de validação
async function validateMigration() {
  // 1. Contar registros
  const legacyCount = await legacyDB.count('lancamentos');
  const newCount = await newDB.count('transactions');
  
  console.log(`Legacy: ${legacyCount}, New: ${newCount}`);
  
  // 2. Validar somas
  const legacySum = await legacyDB.sum('lancamentos', 'amount');
  const newSum = await newDB.sum('transactions', 'amount');
  
  console.log(`Legacy Sum: ${legacySum}, New Sum: ${newSum}`);
  
  // 3. Validar amostra aleatória
  const sample = await legacyDB.random('lancamentos', 100);
  for (const record of sample) {
    const migrated = await newDB.findById('transactions', `legacy_${record.id}`);
    assert.equal(migrated.amount, Math.abs(record.amount));
  }
  
  console.log('✅ Validation passed');
}
```

**Entregáveis:**
- ✅ Dados históricos migrados
- ✅ Relatório de validação
- ✅ Backup completo

#### Fase 3: Dual-Write (Semanas 5-6)

**Objetivos:**
- Escrever em ambos os sistemas simultaneamente
- Manter sincronização
- Validar novo sistema em produção

**Implementação:**

```typescript
// Adapter para dual-write
class DualWriteTransactionService {
  constructor(
    private legacyService: LegacyTransactionService,
    private newService: NewTransactionService,
    private logger: Logger
  ) {}

  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    try {
      // 1. Escrever no sistema legado (principal)
      const legacyResult = await this.legacyService.create(data);
      
      try {
        // 2. Escrever no novo sistema (secundário)
        const newResult = await this.newService.create({
          ...data,
          legacyId: legacyResult.id
        });
        
        // 3. Validar consistência
        this.validateConsistency(legacyResult, newResult);
        
        return legacyResult; // Retorna resultado do legado
      } catch (error) {
        // Falha no novo sistema não impede operação
        this.logger.error('Failed to write to new system', error);
        this.alertOps('Dual-write failure', error);
        
        return legacyResult; // Continua com legado
      }
    } catch (error) {
      // Falha no legado é crítica
      this.logger.error('Failed to write to legacy system', error);
      throw error;
    }
  }

  private validateConsistency(legacy: any, newRecord: any) {
    if (Math.abs(legacy.amount - newRecord.amount) > 0.01) {
      this.alertOps('Inconsistency detected', { legacy, newRecord });
    }
  }
}
```

**Monitoramento:**
- Taxa de sucesso de dual-write
- Latência adicional
- Inconsistências detectadas
- Alertas automáticos

**Entregáveis:**
- ✅ Dual-write implementado
- ✅ Monitoramento configurado
- ✅ Relatório de consistência

#### Fase 4: Shadow Mode (Semanas 7-8)

**Objetivos:**
- Novo sistema processa requisições em paralelo
- Comparar resultados
- Ganhar confiança

**Implementação:**

```typescript
// Shadow mode interceptor
class ShadowModeInterceptor {
  async intercept(request: Request): Promise<Response> {
    // 1. Processar no sistema legado (produção)
    const legacyResponse = await this.legacySystem.process(request);
    
    // 2. Processar no novo sistema (shadow)
    this.processInShadow(request).catch(error => {
      this.logger.error('Shadow processing failed', error);
    });
    
    // 3. Retornar resposta do legado
    return legacyResponse;
  }

  private async processInShadow(request: Request) {
    const startTime = Date.now();
    
    try {
      const shadowResponse = await this.newSystem.process(request);
      const duration = Date.now() - startTime;
      
      // Comparar resultados
      this.compareResults(request, shadowResponse);
      
      // Registrar métricas
      this.metrics.recordShadowLatency(duration);
      this.metrics.incrementShadowSuccess();
    } catch (error) {
      this.metrics.incrementShadowFailure();
      throw error;
    }
  }

  private compareResults(request: Request, shadowResponse: Response) {
    // Comparação assíncrona
    // Não bloqueia resposta ao usuário
  }
}
```

**Métricas:**
- Taxa de sucesso do shadow
- Diferenças detectadas
- Performance comparativa
- Cobertura de casos de uso

**Entregáveis:**
- ✅ Shadow mode operacional
- ✅ Dashboard de comparação
- ✅ Relatório de divergências

#### Fase 5: Cutover Gradual (Semanas 9-10)

**Objetivos:**
- Migrar tráfego gradualmente
- Monitorar impacto
- Rollback rápido se necessário

**Estratégia de Roteamento:**

```typescript
// Feature flag para controle de tráfego
class TrafficRouter {
  async route(request: Request): Promise<Response> {
    const userId = request.user.id;
    const rolloutPercentage = await this.featureFlags.get('new-system-rollout');
    
    // Decisão baseada em hash do userId
    const userBucket = this.hashUserId(userId) % 100;
    
    if (userBucket < rolloutPercentage) {
      // Rotear para novo sistema
      return this.newSystem.process(request);
    } else {
      // Rotear para sistema legado
      return this.legacySystem.process(request);
    }
  }

  private hashUserId(userId: string): number {
    // Hash consistente para mesmo usuário sempre ir para mesmo sistema
    return simpleHash(userId);
  }
}
```

**Cronograma de Rollout:**
- Semana 9.1: 10% do tráfego → novo sistema
- Semana 9.2: 25% do tráfego → novo sistema
- Semana 9.3: 50% do tráfego → novo sistema
- Semana 10.1: 75% do tráfego → novo sistema
- Semana 10.2: 100% do tráfego → novo sistema

**Critérios de Go/No-Go:**
- ✅ Error rate < 0.1%
- ✅ Latência P95 < 500ms
- ✅ Zero perda de dados
- ✅ Feedback positivo dos usuários

**Entregáveis:**
- ✅ 100% do tráfego no novo sistema
- ✅ Sistema legado em standby
- ✅ Plano de rollback testado

#### Fase 6: Descomissionamento (Semanas 11-12)

**Objetivos:**
- Desativar sistema legado
- Arquivar dados
- Liberar recursos

**Atividades:**
1. **Período de Observação:**
   - 2 semanas com novo sistema 100%
   - Monitoramento intensivo
   - Sem incidentes críticos

2. **Backup Final:**
   - Backup completo do sistema legado
   - Armazenamento de longo prazo
   - Documentação de acesso

3. **Desativação:**
   - Desligar aplicação legada
   - Manter banco de dados read-only
   - Documentar processo de recuperação

4. **Limpeza:**
   - Remover código legado
   - Atualizar documentação
   - Celebrar! 🎉

**Entregáveis:**
- ✅ Sistema legado desativado
- ✅ Dados arquivados
- ✅ Documentação atualizada
- ✅ Post-mortem da migração

## 4. Sincronização de Dados

### 4.1 Change Data Capture (CDC)

Para manter sincronização em tempo real durante dual-write:

```typescript
// CDC usando Debezium ou similar
class CDCSync {
  async syncChanges() {
    // Escutar mudanças no banco legado
    this.debezium.on('change', async (change) => {
      switch (change.operation) {
        case 'INSERT':
          await this.newSystem.create(this.transform(change.after));
          break;
        case 'UPDATE':
          await this.newSystem.update(change.after.id, this.transform(change.after));
          break;
        case 'DELETE':
          await this.newSystem.softDelete(change.before.id);
          break;
      }
    });
  }

  private transform(legacyRecord: any): NewRecord {
    // Transformação de dados
    return {
      id: `legacy_${legacyRecord.id}`,
      amount: Math.abs(legacyRecord.valor),
      type: legacyRecord.valor > 0 ? 'CREDIT' : 'DEBIT',
      // ... outros campos
    };
  }
}
```

### 4.2 Reconciliação Periódica

```typescript
// Job de reconciliação (executa a cada hora)
class ReconciliationJob {
  async reconcile() {
    const lastSync = await this.getLastSyncTimestamp();
    
    // Buscar mudanças desde último sync
    const legacyChanges = await this.legacyDB.getChangesSince(lastSync);
    
    for (const change of legacyChanges) {
      const newRecord = await this.newDB.findByLegacyId(change.id);
      
      if (!newRecord) {
        // Registro faltando - criar
        await this.newDB.create(this.transform(change));
        this.metrics.incrementMissingRecords();
      } else if (!this.isConsistent(change, newRecord)) {
        // Inconsistência - corrigir
        await this.newDB.update(newRecord.id, this.transform(change));
        this.metrics.incrementInconsistencies();
      }
    }
    
    await this.updateLastSyncTimestamp();
  }
}
```

## 5. Plano de Rollback

### 5.1 Triggers de Rollback

**Automático:**
- Error rate > 5% por 5 minutos
- Latência P95 > 2s por 10 minutos
- Perda de dados detectada

**Manual:**
- Decisão da equipe de operações
- Feedback negativo crítico de usuários
- Bug crítico descoberto

### 5.2 Procedimento de Rollback

```bash
#!/bin/bash
# rollback.sh

echo "🔄 Iniciando rollback..."

# 1. Redirecionar tráfego para legado
kubectl patch ingress cashflow-ingress -p '{"spec":{"rules":[{"host":"api.cashflow.com","http":{"paths":[{"path":"/","backend":{"serviceName":"legacy-service","servicePort":80}}]}}]}}'

# 2. Parar novos writes no novo sistema
kubectl scale deployment transactions-service --replicas=0

# 3. Validar que legado está respondendo
curl -f http://legacy-service/health || exit 1

# 4. Notificar equipe
./notify-team.sh "Rollback completed. Legacy system active."

echo "✅ Rollback concluído"
```

### 5.3 Tempo de Rollback

- **Target:** < 5 minutos
- **Testado:** Mensalmente em staging
- **Documentado:** Runbook detalhado

## 6. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados durante migração | Baixa | Crítico | Backups frequentes, validação contínua |
| Inconsistência entre sistemas | Média | Alto | Reconciliação automática, alertas |
| Performance degradada | Média | Médio | Load testing, shadow mode |
| Bugs no novo sistema | Alta | Alto | Testes extensivos, rollout gradual |
| Resistência dos usuários | Baixa | Médio | Treinamento, comunicação clara |
| Downtime não planejado | Baixa | Crítico | HA, redundância, plano de DR |

## 7. Comunicação

### 7.1 Stakeholders

- **Usuários Finais:** Comunicação 2 semanas antes, durante e após
- **Equipe Técnica:** Daily standups durante migração
- **Gestão:** Relatórios semanais de progresso
- **Suporte:** Treinamento antes do cutover

### 7.2 Canais

- Email para usuários
- Slack para equipe técnica
- Dashboard de status público
- Hotline de suporte dedicada

## 8. Métricas de Sucesso

### 8.1 Técnicas

- ✅ Zero perda de dados
- ✅ Downtime < 1 hora total
- ✅ Error rate < 0.1%
- ✅ Latência P95 < 500ms
- ✅ 100% dos dados migrados

### 8.2 Negócio

- ✅ Satisfação dos usuários > 90%
- ✅ Tempo de processamento reduzido em 50%
- ✅ Custos operacionais reduzidos em 30%
- ✅ Capacidade de escalar 10x

## 9. Lições Aprendidas (Template)

Após a migração, documentar:

1. **O que funcionou bem:**
   - [A preencher]

2. **O que poderia ser melhorado:**
   - [A preencher]

3. **Surpresas/Descobertas:**
   - [A preencher]

4. **Recomendações para futuras migrações:**
   - [A preencher]

## 10. Conclusão

A estratégia de transição usando Strangler Fig Pattern permite:
- ✅ Migração gradual e segura
- ✅ Rollback rápido se necessário
- ✅ Validação contínua
- ✅ Mínimo impacto aos usuários
- ✅ Aprendizado incremental

**Duração Total Estimada:** 12 semanas

**Próximos Passos:**
1. Aprovar plano de migração
2. Alocar recursos
3. Iniciar Fase 1 (Preparação)