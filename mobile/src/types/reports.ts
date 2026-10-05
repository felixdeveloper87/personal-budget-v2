export interface ReportCategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface ReportPaymentMethodBreakdown {
  name: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface ReportTransactionItem {
  id: number;
  paymentDate: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: number;
  paymentMethodName?: string | null;
  accountName?: string | null;
}

export interface Report {
  period: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  averageExpense: number;
  installmentExpenseTotal: number;
  recurringExpenseTotal: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  incomeCategories: ReportCategoryBreakdown[];
  expenseCategories: ReportCategoryBreakdown[];
  paymentMethods: ReportPaymentMethodBreakdown[];
  topIncome: ReportTransactionItem[];
  topExpenses: ReportTransactionItem[];
}
