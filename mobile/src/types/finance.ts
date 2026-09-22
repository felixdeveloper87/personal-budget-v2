export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: Array<{
    category: string;
    income: number;
    expense: number;
  }>;
}

export interface Transaction {
  id: number;
  dateTime: string;
  transactionDate?: string | null;
  paymentDate?: string | null;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: number;
  paymentMethodName?: string | null;
  accountName?: string | null;
  status?: "PLANNED" | "PENDING" | "CLEARED" | "RECONCILED";
  installmentPlanId?: number | null;
  recurringTransactionId?: number | null;
  isInstallment?: boolean;
  isRecurring?: boolean;
}

export interface InstallmentTransaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  installmentNumber: number;
}

export interface InstallmentPlan {
  id: number;
  totalInstallments: number;
  totalAmount: number;
  installmentValue: number;
  purchaseDate?: string | null;
  accountId?: number | null;
  accountName?: string | null;
  paymentMethodId?: number | null;
  paymentMethodName?: string | null;
  transactions: InstallmentTransaction[];
}

export interface FinancialAccount {
  id: number;
  name: string;
  currency: string;
  currentBalance: number;
  active: boolean;
}

export interface CreateTransactionRequest {
  dateTime: string;
  transactionDate: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: number;
  paymentMethodId: number | null;
  accountId: number;
  status: "CLEARED";
}
