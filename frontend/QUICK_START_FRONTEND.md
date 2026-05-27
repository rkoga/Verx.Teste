# 🚀 Quick Start - Frontend Angular

Guia rápido para iniciar o frontend do Cash Flow System.

## ⚡ Início Rápido (3 passos)

### 1️⃣ Certifique-se que o Backend está rodando

Na raiz do projeto principal 

```powershell
# Iniciar todos os serviços backend
.\start-all-services.ps1

# Verificar se estão rodando
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### 2️⃣ Instalar dependências (primeira vez apenas)

```powershell
cd frontend/cash-flow-app
npm install
```

### 3️⃣ Iniciar o Frontend

```powershell
npm start
```

**Pronto!** Acesse: **http://localhost:4200**

---

## 📱 Como Usar

### Tela de Transações

1. Acesse http://localhost:4200/transactions (página inicial)
2. Preencha o formulário para criar uma transação
3. Visualize a lista de transações abaixo
4. Use os filtros para buscar transações específicas

### Tela de Dashboard

1. Clique em "Dashboard" no menu superior
2. Visualize as métricas principais (Saldo, Créditos, Débitos)
3. Use os filtros de período para análises específicas
4. Veja o histórico de saldos diários

---

## 🔧 Comandos Úteis

```powershell
# Iniciar em modo desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test

# Verificar erros de lint
npm run lint
```

---

## 🐛 Problemas Comuns

### ❌ Erro: "Cannot GET /api/..."

**Solução:** Backend não está rodando. Execute:
```powershell
cd ../../
.\start-all-services.ps1
```

### ❌ Erro: "CORS policy"

**Solução:** Verifique se os serviços backend estão configurados para aceitar requisições da porta 4200.

### ❌ Página em branco

**Solução:** 
1. Abra o console do navegador (F12)
2. Verifique se há erros
3. Certifique-se que executou `npm install`

---

## 📂 Estrutura Rápida

```
cash-flow-app/
├── src/app/
│   ├── pages/
│   │   ├── transactions/    # Tela de transações
│   │   └── dashboard/       # Tela de dashboard
│   ├── services/            # Serviços HTTP
│   ├── models/              # Interfaces TypeScript
│   └── components/          # Componentes compartilhados
└── README.md                # Documentação completa
```

---

## 🎯 Próximos Passos

1. ✅ Criar algumas transações de teste
2. ✅ Visualizar o dashboard
3. ✅ Testar os filtros
4. ✅ Explorar as funcionalidades

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **[README.md](cash-flow-app/README.md)** - Documentação completa do frontend
- **[MVP_ANGULAR_SIMPLE.md](MVP_ANGULAR_SIMPLE.md)** - Plano detalhado do MVP
- **[../README.md](../README.md)** - Documentação do projeto completo

---

**Dúvidas?** Verifique os logs do console (F12) ou a documentação completa.