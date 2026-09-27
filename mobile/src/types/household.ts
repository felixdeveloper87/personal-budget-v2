export interface HouseholdMonthSummary {
  month: string;
  spend: number;
  expenseCount: number;
}

export interface HouseholdDebt {
  fromMemberId: number;
  fromMemberName: string;
  toMemberId: number;
  toMemberName: string;
  amount: number;
}

export interface HouseholdHeroData {
  id: number;
  name: string;
  currency: string;
  currentMemberId: number;
  currentUserBalance: number;
  monthSpend: number;
  monthSummaries: HouseholdMonthSummary[];
  members: Array<{ id: number; name: string }>;
  debts: HouseholdDebt[];
  expenses: HouseholdExpense[];
}

export interface HouseholdExpense {
  id: number;
  description: string;
  category: string;
  amount: number;
  expenseDate: string;
  payerMemberId: number;
  payerName: string;
}

export interface HouseholdExpenseHistory {
  expenses: HouseholdExpense[];
  page: number;
  hasMore: boolean;
}

export interface HouseholdPageResponse {
  household: HouseholdHeroData | null;
  pendingInvitations: Array<{
    id: number;
    householdId: number;
    householdName: string;
    invitedByName: string;
    createdAt: string;
  }>;
}

export interface CreateHouseholdExpenseRequest {
  description: string;
  category: string;
  amount: number;
  expenseDate: string;
  participantMemberIds: number[];
}

export interface HouseholdExpenseCreatedResponse {
  recordId: number;
  page: HouseholdPageResponse;
}
