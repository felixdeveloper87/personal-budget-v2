# 🔄 Guia de Migração - Nova Estrutura de Componentes

## 📋 **Imports que Precisam ser Atualizados**

### **Antes (Estrutura Antiga):**
```typescript
// ❌ Imports antigos
import { FormCard } from '../components/cards'
import { TransactionForm } from '../components/TransactionForm'
import { BalanceChart } from '../components/BalanceChart'
import { Header } from '../components/Header'
import { AuthPage } from '../components/AuthPage'
import { TransactionList } from '../components/TransactionList'
```

### **Depois (Nova Estrutura):**
```typescript
// ✅ Imports novos
import { FormCard } from '@/components/ui'
import { TransactionForm } from '@/components/forms'
import { BalanceChart } from '@/components/charts'
import { Header } from '@/components/layout'
import { AuthPage } from '@/components/auth'
import { TransactionList } from '@/components/transactions'
```

## 🗂️ **Mapeamento de Componentes**

| Componente | Pasta Antiga | Pasta Nova | Categoria |
|------------|--------------|------------|-----------|
| `FormCard` | `components/cards/` | `components/ui/` | UI |
| `TransactionForm` | `components/TransactionForm/` | `components/forms/` | Forms |
| `BalanceChart` | `components/` | `components/charts/` | Charts |
| `Header` | `components/` | `components/layout/` | Layout |
| `AuthPage` | `components/` | `components/auth/` | Auth |
| `TransactionList` | `components/` | `components/transactions/` | Transactions |

## 🔧 **Arquivos que Precisam ser Atualizados**

### **1. Sections:**
- `sections/AddTransactionSection.tsx`
- `sections/ChartsSection.tsx`
- `sections/AllTransactionsSection.tsx`
- `sections/SummarySection.tsx`
- `sections/PeriodNavigatorSection.tsx`

### **2. Pages:**
- `pages/Dashboard.tsx`
- `pages/LandingPage.tsx`

### **3. App:**
- `App.tsx`

## 🚀 **Comandos para Atualizar Imports**

```bash
# Buscar todos os imports que precisam ser atualizados
grep -r "from.*components/" src/ --include="*.tsx" --include="*.ts"

# Exemplo de substituição em massa (usar com cuidado)
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|from.*components/cards|from @/components/ui|g'
```

## ⚠️ **Cuidados na Migração**

1. **Verificar imports relativos** - Alguns podem usar `../` ou `./`
2. **Testar após cada mudança** - Verificar se não quebrou nada
3. **Atualizar barrel exports** - Garantir que todos os exports estão corretos
4. **Verificar TypeScript** - Rodar `npm run type-check` após mudanças

## 📝 **Checklist de Migração**

- [ ] Atualizar imports em `sections/`
- [ ] Atualizar imports em `pages/`
- [ ] Atualizar imports em `App.tsx`
- [ ] Verificar se todos os componentes estão exportados
- [ ] Testar a aplicação
- [ ] Verificar se não há erros de TypeScript
- [ ] Remover arquivos desnecessários

