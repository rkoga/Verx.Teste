# 📱 Planejamento MVP Frontend - Cash Flow System

**Data**: 26/05/2026  
**Framework**: Angular 17+  
**Status**: Planejamento

---

## 🎯 Objetivo do MVP

Desenvolver uma aplicação Angular minimalista com duas telas principais:
1. **Tela de Lançamentos** - Criar e visualizar transações
2. **Tela de Relatórios** - Visualizar consolidados e dashboards

**Autenticação**: Mock (simulada, sem backend real)

---

## 📋 Escopo do MVP

### ✅ Funcionalidades Incluídas

#### Tela de Lançamentos
- ✅ Formulário para criar transação (crédito/débito)
- ✅ Lista de transações recentes
- ✅ Filtros básicos (data, tipo)
- ✅ Cancelar transação
- ✅ Validações de formulário

#### Tela de Relatórios
- ✅ Saldo consolidado do dia
- ✅ Gráfico de evolução de saldo
- ✅ Resumo de créditos e débitos
- ✅ Filtro por período
- ✅ Cards com métricas principais

#### Autenticação (Mock)
- ✅ Tela de login simulada
- ✅ Guard de rotas
- ✅ Token mock no localStorage
- ✅ Logout

### ❌ Funcionalidades Excluídas (Futuro)
- ❌ Autenticação real com JWT
- ❌ Gestão de usuários
- ❌ Permissões e roles
- ❌ Exportação de relatórios
- ❌ Notificações em tempo real
- ❌ Temas customizáveis
- ❌ Internacionalização (i18n)

---

## 🏗️ Arquitetura Frontend

### Estrutura de Pastas

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                      # Serviços singleton, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts    # Mock de autenticação
│   │   │   │   ├── api.service.ts     # Base para chamadas HTTP
│   │   │   │   └── notification.service.ts
│   │   │   └── models/
│   │   │       ├── transaction.model.ts
│   │   │       ├── balance.model.ts
│   │   │       └── user.model.ts
│   │   │
│   │   ├── features/                  # Módulos de funcionalidades
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.scss
│   │   │   │   └── auth.module.ts
│   │   │   │
│   │   │   ├── transactions/
│   │   │   │   ├── services/
│   │   │   │   │   └── transaction.service.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── transaction-form/
│   │   │   │   │   ├── transaction-list/
│   │   │   │   │   └── transaction-filters/
│   │   │   │   ├── pages/
│   │   │   │   │   └── transactions-page/
│   │   │   │   └── transactions.module.ts
│   │   │   │
│   │   │   └── reports/
│   │   │       ├── services/
│   │   │       │   └── report.service.ts
│   │   │       ├── components/
│   │   │       │   ├── balance-card/
│   │   │       │   ├── balance-chart/
│   │   │       │   ├── metrics-summary/
│   │   │       │   └── period-filter/
│   │   │       ├── pages/
│   │   │       │   └── reports-page/
│   │   │       └── reports.module.ts
│   │   │
│   │   ├── shared/                    # Componentes compartilhados
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── loading-spinner/
│   │   │   │   ├── error-message/
│   │   │   │   └── confirmation-dialog/
│   │   │   ├── directives/
│   │   │   │   └── currency-mask.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── currency-format.pipe.ts
│   │   │   │   └── date-format.pipe.ts
│   │   │   └── shared.module.ts
│   │   │
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   │       ├── _variables.scss
│   │       ├── _mixins.scss
│   │       └── _themes.scss
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
│
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── README.md
```

---

## 🎨 Design System

### Biblioteca de Componentes
**Escolha**: Angular Material 17+

**Justificativa**:
- ✅ Componentes prontos e testados
- ✅ Acessibilidade built-in
- ✅ Responsivo por padrão
- ✅ Temas customizáveis
- ✅ Boa documentação
- ✅ Integração nativa com Angular

### Componentes Principais
- `MatCard` - Cards de informação
- `MatTable` - Tabela de transações
- `MatFormField` - Campos de formulário
- `MatButton` - Botões
- `MatIcon` - Ícones
- `MatDialog` - Modais
- `MatSnackBar` - Notificações
- `MatDatepicker` - Seletor de data
- `MatSelect` - Dropdowns
- `MatChip` - Tags/badges

### Biblioteca de Gráficos
**Escolha**: Chart.js com ng2-charts

**Justificativa**:
- ✅ Leve e performático
- ✅ Fácil integração com Angular
- ✅ Gráficos responsivos
- ✅ Boa documentação
- ✅ Customizável

---

## 🔌 Integração com APIs

### Endpoints Utilizados

#### Transactions Service (http://localhost:3001)

```typescript
// Criar transação
POST /api/v1/transactions
Body: {
  idempotencyKey: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  date: string;
  description: string;
  categoryId: string;
}

// Listar transações
GET /api/v1/transactions?page=1&limit=10&merchantId=merchant_123

// Buscar transação
GET /api/v1/transactions/:id

// Cancelar transação
PATCH /api/v1/transactions/:id/cancel
```

#### Consolidation Service (http://localhost:3002)

```typescript
// Saldo do dia
GET /api/v1/consolidation/balance/:merchantId/:date

// Histórico de saldos
GET /api/v1/consolidation/balance/:merchantId?startDate=2024-01-01&endDate=2024-01-31

// Resumo consolidado
GET /api/v1/consolidation/summary/:merchantId?startDate=2024-01-01&endDate=2024-01-31
```

#### Reporting Service (http://localhost:3003)

```typescript
// Relatório de transações
GET /api/transactions?merchantId=merchant_123&startDate=2024-01-01&endDate=2024-01-31

// Dashboard
GET /api/dashboard/:merchantId?period=30
```

---

## 🔐 Autenticação Mock

### Implementação

```typescript
// auth.service.ts
export class AuthService {
  private readonly MOCK_USER = {
    id: 'user_123',
    name: 'João Silva',
    email: 'joao@example.com',
    merchantId: 'merchant_123',
    role: 'ADMIN'
  };

  private readonly MOCK_TOKEN = 'mock-jwt-token-12345';

  login(email: string, password: string): Observable<LoginResponse> {
    // Simular delay de rede
    return of({
      user: this.MOCK_USER,
      token: this.MOCK_TOKEN
    }).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getMerchantId(): string {
    return this.getCurrentUser()?.merchantId || 'merchant_123';
  }
}
```

### Auth Guard

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

---

## 📱 Telas Detalhadas

### 1. Tela de Login

**Rota**: `/login`

**Componentes**:
- Logo da aplicação
- Formulário de login (email + senha)
- Botão "Entrar"
- Mensagem de erro (se houver)

**Validações**:
- Email obrigatório e formato válido
- Senha obrigatória (mínimo 6 caracteres)

**Credenciais Mock**:
- Email: qualquer email válido
- Senha: qualquer senha com 6+ caracteres

**Fluxo**:
1. Usuário preenche email e senha
2. Clica em "Entrar"
3. Sistema valida formato
4. Simula chamada de API (500ms)
5. Salva token e user no localStorage
6. Redireciona para `/transactions`

---

### 2. Tela de Lançamentos

**Rota**: `/transactions`

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Header (Logo, Nome do Usuário, Logout)             │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Novo Lançamento                                 │ │
│ │ ┌─────────┐ ┌─────────┐ ┌──────────┐          │ │
│ │ │ Valor   │ │ Tipo    │ │ Data     │          │ │
│ │ └─────────┘ └─────────┘ └──────────┘          │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Descrição                                   │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ ┌─────────┐ ┌─────────┐                       │ │ │
│ │ │Categoria│ │[Salvar] │                       │ │ │
│ │ └─────────┘ └─────────┘                       │ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Lançamentos Recentes                            │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Filtros: [Data] [Tipo] [Buscar]            │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │                                                 │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Data  │ Descrição │ Tipo │ Valor │ Ações   │ │ │
│ │ ├───────┼───────────┼──────┼───────┼─────────┤ │ │
│ │ │26/05  │Venda X    │Créd. │1500,00│[Cancel] │ │ │
│ │ │26/05  │Compra Y   │Déb.  │ 500,00│[Cancel] │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ [< Anterior] Página 1 de 5 [Próxima >]         │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Funcionalidades**:

1. **Formulário de Novo Lançamento**:
   - Campo Valor (R$) - numérico, obrigatório
   - Campo Tipo - select (Crédito/Débito), obrigatório
   - Campo Data - datepicker, obrigatório
   - Campo Descrição - texto, obrigatório
   - Campo Categoria - select, obrigatório
   - Botão Salvar

2. **Lista de Transações**:
   - Tabela com paginação
   - Filtros por data e tipo
   - Busca por descrição
   - Ação de cancelar transação
   - Badge colorido para tipo (verde=crédito, vermelho=débito)

3. **Validações**:
   - Valor maior que zero
   - Data não pode ser futura
   - Descrição mínimo 3 caracteres
   - Categoria obrigatória

---

### 3. Tela de Relatórios

**Rota**: `/reports`

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ Header (Logo, Nome do Usuário, Logout)             │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Filtro de Período: [Data Início] [Data Fim]    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ │ Saldo    │ │ Créditos │ │ Débitos  │           │
│ │ R$ 5.000 │ │ R$ 8.000 │ │ R$ 3.000 │           │
│ └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Evolução do Saldo                               │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │         [Gráfico de Linha]                  │ │ │
│ │ │                                             │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Resumo por Categoria                            │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Categoria    │ Créditos │ Débitos │ Saldo  │ │ │
│ │ ├──────────────┼──────────┼─────────┼────────┤ │ │
│ │ │ Vendas       │  5.000   │    0    │ 5.000  │ │ │
│ │ │ Despesas     │     0    │ 2.000   │-2.000  │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Funcionalidades**:

1. **Filtro de Período**:
   - Data início (datepicker)
   - Data fim (datepicker)
   - Botão "Aplicar"
   - Opções rápidas: Hoje, Últimos 7 dias, Últimos 30 dias

2. **Cards de Métricas**:
   - Saldo atual (verde se positivo, vermelho se negativo)
   - Total de créditos (verde)
   - Total de débitos (vermelho)
   - Animação ao carregar

3. **Gráfico de Evolução**:
   - Gráfico de linha mostrando saldo ao longo do tempo
   - Eixo X: datas
   - Eixo Y: valores em R$
   - Tooltip ao passar o mouse

4. **Resumo por Categoria**:
   - Tabela com totais por categoria
   - Ordenação por valor
   - Cores diferentes para crédito/débito

---

## 🎨 Paleta de Cores

```scss
// _variables.scss
$primary-color: #1976d2;      // Azul principal
$accent-color: #ff4081;       // Rosa accent
$success-color: #4caf50;      // Verde (créditos)
$error-color: #f44336;        // Vermelho (débitos)
$warning-color: #ff9800;      // Laranja (avisos)
$info-color: #2196f3;         // Azul info

$background-color: #fafafa;   // Fundo claro
$card-background: #ffffff;    // Fundo dos cards
$text-primary: #212121;       // Texto principal
$text-secondary: #757575;     // Texto secundário
$border-color: #e0e0e0;       // Bordas
```

---

## 📦 Dependências

### package.json

```json
{
  "name": "cash-flow-frontend",
  "version": "1.0.0",
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint"
  },
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/material": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "chart.js": "^4.4.0",
    "ng2-charts": "^5.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.6.0",
    "zone.js": "^0.14.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "@types/jasmine": "^5.1.0",
    "jasmine-core": "^5.1.0",
    "karma": "^6.4.0",
    "karma-chrome-launcher": "^3.2.0",
    "karma-coverage": "^2.2.0",
    "karma-jasmine": "^5.1.0",
    "karma-jasmine-html-reporter": "^2.1.0",
    "typescript": "~5.2.0"
  }
}
```

---

## 🚀 Roadmap de Implementação

### Fase 1: Setup Inicial (2-3 horas)
- [ ] Criar projeto Angular
- [ ] Instalar Angular Material
- [ ] Configurar routing
- [ ] Configurar environments
- [ ] Criar estrutura de pastas
- [ ] Configurar SCSS global

### Fase 2: Core Module (2-3 horas)
- [ ] Criar models (Transaction, Balance, User)
- [ ] Implementar AuthService (mock)
- [ ] Implementar ApiService
- [ ] Criar AuthGuard
- [ ] Criar interceptors (auth, error)
- [ ] Implementar NotificationService

### Fase 3: Shared Module (2-3 horas)
- [ ] Criar HeaderComponent
- [ ] Criar LoadingSpinnerComponent
- [ ] Criar ErrorMessageComponent
- [ ] Criar ConfirmationDialogComponent
- [ ] Criar pipes (currency, date)
- [ ] Criar directives (currency mask)

### Fase 4: Auth Module (2 horas)
- [ ] Criar LoginComponent
- [ ] Implementar formulário de login
- [ ] Implementar validações
- [ ] Testar fluxo de autenticação

### Fase 5: Transactions Module (4-5 horas)
- [ ] Criar TransactionService
- [ ] Criar TransactionFormComponent
- [ ] Criar TransactionListComponent
- [ ] Criar TransactionFiltersComponent
- [ ] Criar TransactionsPageComponent
- [ ] Implementar CRUD de transações
- [ ] Implementar paginação
- [ ] Implementar filtros

### Fase 6: Reports Module (4-5 horas)
- [ ] Criar ReportService
- [ ] Criar BalanceCardComponent
- [ ] Criar BalanceChartComponent (Chart.js)
- [ ] Criar MetricsSummaryComponent
- [ ] Criar PeriodFilterComponent
- [ ] Criar ReportsPageComponent
- [ ] Implementar integração com APIs
- [ ] Implementar gráficos

### Fase 7: Testes e Ajustes (2-3 horas)
- [ ] Testes de integração com APIs
- [ ] Ajustes de responsividade
- [ ] Ajustes de UX
- [ ] Tratamento de erros
- [ ] Loading states
- [ ] Documentação

**Tempo Total Estimado**: 18-24 horas

---

## 🧪 Estratégia de Testes

### Testes Unitários
- Services (AuthService, TransactionService, ReportService)
- Components (lógica de negócio)
- Pipes e Directives

### Testes de Integração
- Fluxo de login
- Criação de transação
- Visualização de relatórios
- Navegação entre telas

### Testes E2E (Opcional)
- Fluxo completo de usuário
- Cypress ou Playwright

---

## 📝 Checklist de Entrega

### Funcional
- [ ] Login funciona (mock)
- [ ] Criar transação funciona
- [ ] Listar transações funciona
- [ ] Cancelar transação funciona
- [ ] Filtros funcionam
- [ ] Paginação funciona
- [ ] Relatórios carregam
- [ ] Gráficos renderizam
- [ ] Métricas calculam corretamente

### Técnico
- [ ] Código TypeScript sem erros
- [ ] Lint passa sem warnings
- [ ] Build de produção funciona
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Loading states implementados
- [ ] Error handling implementado
- [ ] Validações de formulário

### Documentação
- [ ] README.md com instruções
- [ ] Comentários no código
- [ ] Documentação de componentes

---

## 🎯 Critérios de Sucesso

1. ✅ Usuário consegue fazer login (mock)
2. ✅ Usuário consegue criar transações
3. ✅ Usuário consegue visualizar lista de transações
4. ✅ Usuário consegue cancelar transações
5. ✅ Usuário consegue filtrar transações
6. ✅ Usuário consegue visualizar relatórios
7. ✅ Usuário consegue ver gráficos
8. ✅ Aplicação é responsiva
9. ✅ Aplicação tem boa UX
10. ✅ Código está bem estruturado

---

## 📚 Referências

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [Chart.js](https://www.chartjs.org/)
- [RxJS](https://rxjs.dev/)

---

**Próximo Passo**: Criar projeto Angular e começar implementação
