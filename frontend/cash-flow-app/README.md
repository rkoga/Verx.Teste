# 💰 Cash Flow System - Frontend Angular

Frontend MVP para o Sistema de Controle de Fluxo de Caixa.

## 🎯 Sobre o Projeto

Aplicação Angular standalone (sem módulos) com duas telas principais:
- **Transações**: Criar, listar, filtrar e cancelar transações
- **Dashboard**: Visualizar métricas, saldos consolidados e histórico

**Características:**
- ✅ Angular 17+ com Standalone Components
- ✅ Angular Material para UI
- ✅ Sem autenticação (MVP simplificado)
- ✅ Integração com 3 APIs backend
- ✅ Responsivo (mobile, tablet, desktop)

## 🚀 Pré-requisitos

- Node.js 20+
- npm 10+
- Backend APIs rodando (portas 3001, 3002, 3003)

## 📦 Instalação

```bash
# Instalar dependências
npm install
```

## 🏃 Executar Aplicação

### Modo Desenvolvimento

```bash
npm start
```

A aplicação estará disponível em: **http://localhost:4200**

### Build para Produção

```bash
npm run build
```

Os arquivos de build estarão em `dist/cash-flow-app/`

## 🔌 APIs Backend

O frontend se conecta com as seguintes APIs:

| Serviço | URL | Porta |
|---------|-----|-------|
| Transactions | http://localhost:3001 | 3001 |
| Consolidation | http://localhost:3002 | 3002 |
| Reporting | http://localhost:3003 | 3003 |

**Importante:** Certifique-se de que todos os serviços backend estão rodando antes de iniciar o frontend.

### Iniciar Backend

Na raiz do projeto principal:

```powershell
.\start-all-services.ps1
```

## 📱 Funcionalidades

### Tela de Transações (`/transactions`)

**Criar Transação:**
1. Preencha o formulário com:
   - Valor (R$)
   - Tipo (Crédito ou Débito)
   - Data
   - Descrição
   - Categoria (opcional)
2. Clique em "Salvar Transação"

**Listar e Filtrar:**
- Visualize todas as transações em uma tabela
- Filtre por data início/fim
- Filtre por tipo (Crédito/Débito)
- Navegue entre páginas

**Cancelar Transação:**
- Clique no botão de cancelar (ícone X vermelho)
- Confirme a ação

### Tela de Dashboard (`/dashboard`)

**Métricas Principais:**
- Saldo Atual
- Total de Créditos
- Total de Débitos

**Filtros de Período:**
- Selecione data início e fim
- Use atalhos rápidos: Hoje, 7 dias, 30 dias, 90 dias

**Resumo do Período:**
- Visualize estatísticas consolidadas
- Veja a variação do saldo

**Histórico de Saldos:**
- Lista de saldos diários
- Detalhes de abertura, créditos, débitos e fechamento

## 🎨 Estrutura do Projeto

```
src/
├── app/
│   ├── components/          # Componentes compartilhados
│   │   ├── header/         # Cabeçalho com navegação
│   │   └── loading/        # Componente de loading
│   │
│   ├── models/             # Interfaces TypeScript
│   │   ├── transaction.model.ts
│   │   ├── balance.model.ts
│   │   └── dashboard.model.ts
│   │
│   ├── services/           # Serviços HTTP
│   │   ├── transaction.service.ts
│   │   ├── consolidation.service.ts
│   │   └── reporting.service.ts
│   │
│   ├── pages/              # Páginas da aplicação
│   │   ├── transactions/   # Página de transações
│   │   └── dashboard/      # Página de dashboard
│   │
│   ├── app.component.*     # Componente raiz
│   ├── app.config.ts       # Configuração da aplicação
│   └── app.routes.ts       # Rotas da aplicação
│
├── environments/           # Configurações de ambiente
│   ├── environment.ts      # Desenvolvimento
│   └── environment.prod.ts # Produção
│
└── styles.scss            # Estilos globais
```

## 🔧 Configuração

### Alterar URLs das APIs

Edite o arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrls: {
    transactions: 'http://localhost:3001',
    consolidation: 'http://localhost:3002',
    reporting: 'http://localhost:3003'
  }
};
```

## 🧪 Testes

### Testes Unitários

```bash
npm test
```

### Testes E2E

```bash
npm run e2e
```

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia servidor de desenvolvimento |
| `npm run build` | Build para produção |
| `npm test` | Executa testes unitários |
| `npm run watch` | Build em modo watch |
| `npm run lint` | Executa linter |

## 🐛 Troubleshooting

### Erro de CORS

Se encontrar erros de CORS, verifique se os serviços backend estão configurados para aceitar requisições do frontend (porta 4200).

### APIs não respondem

1. Verifique se os serviços backend estão rodando:
   ```powershell
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   curl http://localhost:3003/health
   ```

2. Se não estiverem rodando, inicie-os:
   ```powershell
   cd ../../
   .\start-all-services.ps1
   ```

### Erro ao instalar dependências

Limpe o cache do npm e reinstale:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Tecnologias Utilizadas

- **Angular 17.3** - Framework frontend
- **Angular Material 17.3** - Biblioteca de componentes UI
- **TypeScript 5.4** - Linguagem de programação
- **RxJS 7.8** - Programação reativa
- **SCSS** - Pré-processador CSS

## 🎯 Próximos Passos (Futuro)

- [ ] Adicionar autenticação JWT
- [ ] Implementar gráficos com Chart.js
- [ ] Adicionar exportação de relatórios (CSV, PDF)
- [ ] Implementar testes E2E com Cypress
- [ ] Adicionar internacionalização (i18n)
- [ ] Implementar PWA
- [ ] Adicionar notificações em tempo real

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a documentação do backend em `../../README.md`
2. Consulte o plano do MVP em `../MVP_ANGULAR_SIMPLE.md`
3. Verifique os logs do console do navegador (F12)

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando Angular**
