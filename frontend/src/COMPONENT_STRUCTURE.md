# 🏗️ Estrutura de Componentes - Personal Budget App

## 📁 Nova Organização por Responsabilidade

### **📂 components/ui/**
**Componentes de interface reutilizáveis**
- `Button/` - Botões customizados
- `Card/` - Cards e containers
- `Modal/` - Modais e overlays
- `Input/` - Campos de entrada
- `Badge/` - Badges e tags
- `Loading/` - Estados de carregamento

### **📂 components/forms/**
**Formulários e inputs específicos**
- `TransactionForm/` - Formulário de transações
- `AuthForms/` - Login e registro
- `SearchForm/` - Formulários de busca

### **📂 components/charts/**
**Gráficos e visualizações**
- `BalanceChart/` - Gráfico de saldo
- `CategoryPie/` - Gráfico de pizza por categoria
- `ExpenseChart/` - Gráfico de despesas
- `IncomeChart/` - Gráfico de receitas
- `SummaryChart/` - Gráfico de resumo

### **📂 components/layout/**
**Componentes de layout e estrutura**
- `Header/` - Cabeçalho da aplicação
- `Footer/` - Rodapé
- `Sidebar/` - Barra lateral (se houver)
- `DashboardSection/` - Seções do dashboard
- `Layout/` - Layout principal

### **📂 components/auth/**
**Componentes de autenticação**
- `AuthPage/` - Página de autenticação
- `LoginForm/` - Formulário de login
- `RegisterForm/` - Formulário de registro
- `AuthHeader/` - Header de autenticação

### **📂 components/transactions/**
**Componentes específicos de transações**
- `TransactionList/` - Lista de transações
- `RecentTransactions/` - Transações recentes
- `TransactionCard/` - Card individual de transação
- `TransactionFilters/` - Filtros de transação

## 🎯 **Princípios da Nova Estrutura**

### **1. Separação por Responsabilidade**
- **UI**: Componentes visuais reutilizáveis
- **Forms**: Lógica de formulários
- **Charts**: Visualizações de dados
- **Layout**: Estrutura da aplicação
- **Auth**: Autenticação
- **Transactions**: Domínio específico

### **2. Barrel Exports**
Cada pasta terá um `index.ts` para exports limpos:
```typescript
// components/ui/index.ts
export { Button } from './Button'
export { Card } from './Card'
export { Modal } from './Modal'
```

### **3. Nomenclatura Consistente**
- **PascalCase** para componentes
- **camelCase** para arquivos de utilitários
- **kebab-case** para pastas
- Prefixos claros: `Transaction`, `Auth`, `Chart`

### **4. Hierarquia Clara**
```
components/
├── ui/           # Reutilizáveis
├── forms/        # Formulários
├── charts/       # Visualizações
├── layout/       # Estrutura
├── auth/         # Autenticação
└── transactions/ # Domínio específico
```

## 📋 **Plano de Migração**

1. ✅ Criar nova estrutura de pastas
2. 🔄 Mover componentes para pastas apropriadas
3. 🔄 Criar barrel exports
4. 🔄 Atualizar imports
5. 🔄 Remover arquivos desnecessários
6. 🔄 Documentar componentes

## 🚀 **Benefícios**

- **Manutenção mais fácil** - Encontrar componentes rapidamente
- **Reutilização** - Componentes UI claramente separados
- **Escalabilidade** - Estrutura preparada para crescimento
- **Onboarding** - Novos devs entendem a organização
- **Imports limpos** - `import { Button } from '@/components/ui'`

