export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  targetDate?: string | null;
  color: string;
  archived: boolean;
}

export interface SavingsGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  color: string;
}
