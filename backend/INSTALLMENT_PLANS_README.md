# Sistema de Parcelamento de Despesas

## Visão Geral

Esta funcionalidade permite que usuários parcelam suas despesas em múltiplas transações mensais automáticas. Por exemplo, ao comprar um produto de R$ 300 em 3x, o sistema criará automaticamente 3 transações de R$ 100 com datas incrementadas mensalmente.

## Estrutura de Dados

### Tabelas

#### `installment_plan`
Armazena informações gerais sobre o plano de parcelamento:
- `id`: Identificador único do plano
- `total_installments`: Quantidade total de parcelas (ex: 3)
- `total_amount`: Valor total do plano (ex: 300.00)
- `installment_value`: Valor de cada parcela (ex: 100.00)
- `user_id`: Referência ao usuário dono do plano

#### `transactions` (colunas adicionadas)
- `installment_plan_id`: Referência ao plano (se a transação for uma parcela)
- `installment_number`: Número da parcela (1, 2, 3, etc.)

### Relacionamentos
- **InstallmentPlan** → **Transaction**: Um plano tem várias transações (1:N)
- **Transaction** → **InstallmentPlan**: Uma transação pode estar associada a um plano (N:1, opcional)

## API Endpoints

### 1. Criar Plano de Parcelamento
**POST** `/api/installment-plans`

**Request Body:**
```json
{
  "totalInstallments": 3,
  "installmentValue": 100.00,
  "category": "Eletrônicos",
  "description": "Notebook Dell",
  "startDate": "2025-10-15"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "totalInstallments": 3,
  "totalAmount": 300.00,
  "installmentValue": 100.00,
  "transactions": [
    {
      "id": 101,
      "description": "Notebook Dell (Parcela 1/3)",
      "amount": 100.00,
      "category": "Eletrônicos",
      "date": "2025-10-15",
      "installmentNumber": 1
    },
    {
      "id": 102,
      "description": "Notebook Dell (Parcela 2/3)",
      "amount": 100.00,
      "category": "Eletrônicos",
      "date": "2025-11-15",
      "installmentNumber": 2
    },
    {
      "id": 103,
      "description": "Notebook Dell (Parcela 3/3)",
      "amount": 100.00,
      "category": "Eletrônicos",
      "date": "2025-12-15",
      "installmentNumber": 3
    }
  ]
}
```

### 2. Listar Todos os Planos
**GET** `/api/installment-plans`

**Response:** (200 OK)
```json
[
  {
    "id": 1,
    "totalInstallments": 3,
    "totalAmount": 300.00,
    "installmentValue": 100.00,
    "transactions": [...]
  }
]
```

### 3. Buscar Plano Específico
**GET** `/api/installment-plans/{id}`

**Response:** (200 OK) - Retorna o mesmo formato do POST

### 4. Deletar Plano
**DELETE** `/api/installment-plans/{id}`

**Response:** (204 No Content)

**Nota:** Ao deletar um plano, todas as transações associadas são automaticamente deletadas devido ao `CascadeType.ALL` e `orphanRemoval = true`.

## Regras de Negócio

1. **Tipo de Transação**: Parcelamentos sempre são criados como **EXPENSE** (despesa)
2. **Data de Início**: Se não fornecida, usa a data atual
3. **Incremento de Datas**: Cada parcela tem data incrementada em 1 mês
4. **Segurança**: Usuários só podem acessar/modificar seus próprios planos
5. **Cálculo do Total**: `totalAmount = installmentValue × totalInstallments`

## Como Usar

### 1. Migração do Banco de Dados

Execute o script de migração:
```bash
psql -U postgres -d personalbudget -f backend/migration-installment-plans.sql
```

Ou, se estiver usando Hibernate com `spring.jpa.hibernate.ddl-auto=update`, as tabelas serão criadas automaticamente.

### 2. Criar um Parcelamento (Frontend)

```typescript
// Exemplo de chamada API
const createInstallmentPlan = async (planData) => {
  const response = await fetch('http://localhost:8080/api/installment-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      totalInstallments: 3,
      installmentValue: 100.00,
      category: 'Eletrônicos',
      description: 'Notebook Dell',
      startDate: '2025-10-15'
    })
  });
  
  return await response.json();
};
```

### 3. Listar Transações de um Parcelamento

As transações aparecem automaticamente na lista geral de transações com indicadores de parcelamento:

```json
{
  "id": 101,
  "description": "Notebook Dell (Parcela 1/3)",
  "type": "EXPENSE",
  "category": "Eletrônicos",
  "amount": 100.00,
  "date": "2025-10-15",
  "installmentPlanId": 1,
  "isInstallment": true
}
```

## Estrutura de Arquivos

```
backend/src/main/java/com/example/budget/
├── model/
│   ├── InstallmentPlan.java          # Entidade JPA
│   └── Transaction.java               # Atualizado com relacionamento
├── repository/
│   └── InstallmentPlanRepository.java # Interface JPA
├── dto/
│   ├── CreateInstallmentPlanRequest.java  # DTO de criação
│   ├── InstallmentPlanDTO.java            # DTO de resposta
│   └── TransactionSearchDTO.java          # Atualizado com info de parcelamento
├── service/
│   └── InstallmentPlanService.java    # Lógica de negócio
└── controller/
    └── InstallmentPlanController.java # Endpoints REST
```

## Exemplos de Uso

### Caso 1: Compra Parcelada em 3x
```json
POST /api/installment-plans
{
  "totalInstallments": 3,
  "installmentValue": 150.00,
  "category": "Roupas",
  "description": "Jaqueta de Couro",
  "startDate": "2025-10-01"
}
```
Resultado: 3 transações de R$ 150 em 01/10, 01/11 e 01/12

### Caso 2: Parcelamento em 12x
```json
POST /api/installment-plans
{
  "totalInstallments": 12,
  "installmentValue": 50.00,
  "category": "Assinaturas",
  "description": "Plano de Academia",
  "startDate": "2025-01-01"
}
```
Resultado: 12 transações mensais de R$ 50 ao longo do ano

## Futuras Melhorias

1. ✅ Adicionar campo para tipo de transação (permitir receitas parceladas)
2. ✅ Permitir edição de parcelas individuais
3. ✅ Notificações de parcelas vencendo
4. ✅ Relatório de parcelas em aberto vs pagas
5. ✅ Juros e taxas de parcelamento

## Segurança

- Todos os endpoints requerem autenticação JWT
- Validação de propriedade: usuários só acessam seus próprios planos
- Validação de dados: valores positivos, número de parcelas > 0

