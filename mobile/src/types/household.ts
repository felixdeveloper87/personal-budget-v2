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
  cleaningRotation?: HouseholdCleaningRotation;
}

export interface HouseholdCleaningDuty {
  key: string;
  label: string;
  schedule: string | null;
  completed: boolean;
  canToggle: boolean;
  completedAt: string | null;
}

export interface HouseholdCleaningAssignment {
  id: number;
  weekStart: string;
  weekEnd: string;
  assignedMemberId: number;
  assignedMemberName: string;
  status: "PENDING" | "UPCOMING" | "COMPLETED" | "MISSED";
  canComplete: boolean;
  completedAt: string | null;
  duties: HouseholdCleaningDuty[];
}

export interface HouseholdCleaningRotation {
  configured: boolean;
  active: boolean;
  canManage: boolean;
  startDate: string | null;
  participantMemberIds: number[];
  currentWeek: HouseholdCleaningAssignment | null;
  upcomingWeeks: HouseholdCleaningAssignment[];
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
  attachments?: HouseholdProof[];
  attachmentCount?: number;
}

export interface HouseholdProof {
  id: number;
  originalFilename: string;
  status: "AVAILABLE" | "EXPIRED" | "REMOVED";
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

export interface CreateHouseholdSettlementRequest {
  toMemberId: number;
  amount: number;
  settlementDate: string;
}

export interface HouseholdSettlementCreatedResponse {
  recordId: number;
  page: HouseholdPageResponse;
}
