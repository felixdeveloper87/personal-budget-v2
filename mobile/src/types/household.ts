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

export interface HouseholdMember {
  id: number;
  name: string;
  balance: number;
}

export interface HouseholdHeroData {
  id: number;
  name: string;
  currency: string;
  currentMemberId: number;
  currentUserBalance: number;
  monthSpend: number;
  monthSummaries: HouseholdMonthSummary[];
  members: HouseholdMember[];
  debts: HouseholdDebt[];
  expenses: HouseholdExpense[];
  settlements: HouseholdPayment[];
}

export interface HouseholdPayment {
  id: number;
  fromMemberId: number;
  fromMemberName: string;
  toMemberId: number;
  toMemberName: string;
  amount: number;
  settlementDate: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
}

export interface HouseholdPaymentHistory {
  payments: HouseholdPayment[];
  page: number;
  hasMore: boolean;
}

export interface HouseholdExpense {
  id: number;
  description: string;
  category: string;
  amount: number;
  expenseDate: string;
  payerMemberId: number;
  payerName: string;
  shares?: Array<{ memberId: number; amount: number }>;
  currentUserShare?: number | null;
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
