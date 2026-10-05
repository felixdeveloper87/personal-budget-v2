export interface CategoryBudget {
  id: number;
  category: string;
  year: number;
  month: number;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  exceeded: boolean;
}

export interface CategoryBudgetRequest {
  category: string;
  year: number;
  month: number;
  limitAmount: number;
}
