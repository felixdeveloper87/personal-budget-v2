import type { AuthResponse, AuthUser } from "@/types/auth";
import type { SavingsGoal, SavingsGoalRequest } from "@/types/goals";
import type { CategoryBudget, CategoryBudgetRequest } from "@/types/planning";
import type { Report } from "@/types/reports";
import { toLocalIsoDate } from "@/utils/period";
import type {
  CreateHouseholdExpenseRequest,
  CreateHouseholdSettlementRequest,
  HouseholdExpenseCreatedResponse,
  HouseholdExpenseHistory,
  HouseholdPaymentHistory,
  HouseholdPageResponse,
  HouseholdSettlementCreatedResponse,
} from "@/types/household";
import type {
  CreateTransactionRequest,
  AccountDetails,
  AccountActivityPage,
  AccountTransferRequest,
  FinancialAccount,
  FinancialAccountRequest,
  InstallmentPlan,
  MonthlySummary,
  Transaction,
  RecurringTransaction,
  UpdateRecurringTransactionRequest,
  UpdateInstallmentPlanRequest,
} from "@/types/finance";

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "https://api.personalbudget.co.uk/api"
).replace(/\/$/, "");

interface RequestOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(requestOptions.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = "Não foi possível concluir a solicitação.";
    try {
      const body = (await response.json()) as Record<string, unknown>;
      const apiMessage = body.error ?? body.message;
      if (typeof apiMessage === "string" && apiMessage.trim()) {
        message = apiMessage;
      }
    } catch {
      // Keep the friendly fallback when the server returns no JSON body.
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });

  return {
    id: response.userId,
    name: response.name,
    email: response.email,
    token: response.token,
    plan: response.plan === "PREMIUM" ? "PREMIUM" : "STANDARD",
    admin: response.admin === true,
  };
}

export async function getMonthlySummary(
  token: string,
  date = new Date(),
): Promise<MonthlySummary> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return request<MonthlySummary>(`/summary/month?year=${year}&month=${month}`, {
    token,
  });
}

export async function listTransactions(token: string): Promise<Transaction[]> {
  return request<Transaction[]>("/transactions", { token });
}

export interface CreditCardPaymentMethod {
  id: number;
  name: string;
  type: "CASH" | "DEBIT_CARD" | "CREDIT_CARD" | "BANK_TRANSFER";
  issuer?: string | null;
  active: boolean;
  statementClosingDay?: number | null;
  paymentDay?: number | null;
  creditLimit?: number | null;
  settlementAccountName?: string | null;
}

export async function listPaymentMethods(token: string): Promise<CreditCardPaymentMethod[]> {
  return request<CreditCardPaymentMethod[]>("/payment-methods", { token });
}

export async function listInstallmentPlans(token: string): Promise<InstallmentPlan[]> {
  return request<InstallmentPlan[]>("/installment-plans", { token });
}

export async function listRecurringTransactions(token: string): Promise<RecurringTransaction[]> {
  return request<RecurringTransaction[]>("/recurring-transactions", { token });
}

export async function updateRecurringTransaction(token: string, id: number, payload: UpdateRecurringTransactionRequest): Promise<RecurringTransaction> {
  const { applyFrom, ...body } = payload;
  return request<RecurringTransaction>(`/recurring-transactions/${id}?applyFrom=${applyFrom}`, {
    token, method: "PUT", body: JSON.stringify(body),
  });
}

export async function cancelRecurringTransaction(token: string, id: number): Promise<RecurringTransaction> {
  return request<RecurringTransaction>(`/recurring-transactions/${id}`, { token, method: "DELETE" });
}

export async function updateInstallmentPlan(token: string, id: number, payload: UpdateInstallmentPlanRequest): Promise<InstallmentPlan> {
  return request<InstallmentPlan>(`/installment-plans/${id}`, { token, method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteInstallmentPlan(token: string, id: number): Promise<void> {
  return request<void>(`/installment-plans/${id}`, { token, method: "DELETE" });
}

interface TransactionFilters {
  type?: "income" | "expense";
  startDate?: string;
  endDate?: string;
}

export async function listSavingsGoals(token: string): Promise<SavingsGoal[]> {
  return request<SavingsGoal[]>("/goals", { token });
}

export async function createSavingsGoal(token: string, goal: SavingsGoalRequest): Promise<SavingsGoal> {
  return request<SavingsGoal>("/goals", { token, method: "POST", body: JSON.stringify(goal) });
}

export async function updateSavingsGoal(token: string, id: number, goal: SavingsGoalRequest): Promise<SavingsGoal> {
  return request<SavingsGoal>(`/goals/${id}`, { token, method: "PUT", body: JSON.stringify(goal) });
}

export async function contributeToSavingsGoal(token: string, id: number, amount: number): Promise<SavingsGoal> {
  return request<SavingsGoal>(`/goals/${id}/contributions`, {
    token, method: "POST", body: JSON.stringify({ amount, contributionDate: toLocalIsoDate(new Date()) }),
  });
}

export async function archiveSavingsGoal(token: string, id: number): Promise<void> {
  return request<void>(`/goals/${id}`, { token, method: "DELETE" });
}

export async function listCategoryBudgets(token: string, date: Date): Promise<CategoryBudget[]> {
  return request<CategoryBudget[]>(`/planning/budgets?year=${date.getFullYear()}&month=${date.getMonth() + 1}`, { token });
}

export async function upsertCategoryBudget(token: string, budget: CategoryBudgetRequest): Promise<CategoryBudget> {
  return request<CategoryBudget>("/planning/budgets", { token, method: "PUT", body: JSON.stringify(budget) });
}

export async function deleteCategoryBudget(token: string, id: number): Promise<void> {
  return request<void>(`/planning/budgets/${id}`, { token, method: "DELETE" });
}

export async function getReport(token: string, period: "week" | "month", date: Date): Promise<Report> {
  return request<Report>(`/reports?period=${period}&date=${toLocalIsoDate(date)}`, { token });
}

export async function searchTransactions(
  token: string,
  filters: TransactionFilters,
): Promise<Transaction[]> {
  const params = new URLSearchParams();

  if (filters.type) params.set("type", filters.type);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);

  return request<Transaction[]>(`/transactions/search?${params.toString()}`, { token });
}

export async function listAccounts(token: string): Promise<FinancialAccount[]> {
  return request<FinancialAccount[]>("/accounts", { token });
}

export async function getAccountDetails(token: string, id: number): Promise<AccountDetails> {
  return request<AccountDetails>(`/accounts/${id}`, { token });
}

export async function updateAccount(
  token: string,
  id: number,
  account: FinancialAccountRequest,
): Promise<FinancialAccount> {
  return request<FinancialAccount>(`/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(account),
    token,
  });
}

export async function archiveAccount(token: string, id: number): Promise<void> {
  await request<void>(`/accounts/${id}`, { method: "DELETE", token });
}

export async function getAccountActivityPage(
  token: string,
  id: number,
  page: number,
  size = 10,
): Promise<AccountActivityPage> {
  return request<AccountActivityPage>(`/accounts/${id}/activity?page=${page}&size=${size}`, { token });
}

export async function createAccountTransfer(
  token: string,
  transfer: AccountTransferRequest,
): Promise<void> {
  await request<unknown>("/accounts/transfers", {
    method: "POST",
    body: JSON.stringify(transfer),
    token,
  });
}

export async function getHouseholdPage(token: string): Promise<HouseholdPageResponse> {
  return request<HouseholdPageResponse>("/households/current", { token });
}

export async function updateHouseholdCleaningDuty(
  token: string,
  householdId: number,
  assignmentId: number,
  dutyKey: string,
  completed: boolean,
): Promise<HouseholdPageResponse> {
  return request<HouseholdPageResponse>(
    `/households/${householdId}/cleaning-assignments/${assignmentId}/duties/${encodeURIComponent(dutyKey)}`,
    { method: "PATCH", token, body: JSON.stringify({ completed }) },
  );
}

export async function getHouseholdExpenseHistory(
  token: string,
  householdId: number,
  page = 0,
): Promise<HouseholdExpenseHistory> {
  return request<HouseholdExpenseHistory>(`/households/${householdId}/expenses?page=${page}`, { token });
}

export async function getHouseholdPaymentHistory(
  token: string,
  householdId: number,
  page = 0,
): Promise<HouseholdPaymentHistory> {
  return request<HouseholdPaymentHistory>(`/households/${householdId}/settlements?page=${page}`, { token });
}

export async function createHouseholdSettlement(
  token: string,
  householdId: number,
  settlement: CreateHouseholdSettlementRequest,
): Promise<HouseholdSettlementCreatedResponse> {
  return request<HouseholdSettlementCreatedResponse>(`/households/${householdId}/settlements`, {
    method: "POST",
    body: JSON.stringify(settlement),
    token,
  });
}

export async function createHouseholdExpense(
  token: string,
  householdId: number,
  expense: CreateHouseholdExpenseRequest,
): Promise<HouseholdExpenseCreatedResponse> {
  return request<HouseholdExpenseCreatedResponse>(`/households/${householdId}/expenses`, {
    method: "POST",
    body: JSON.stringify(expense),
    token,
  });
}

export interface HouseholdAttachmentFile {
  uri: string;
  name: string;
  type: string;
}

export async function getHouseholdProofImage(
  token: string,
  householdId: number,
  attachmentId: number,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/households/${householdId}/attachments/${attachmentId}/content`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "image/jpeg,image/png,image/webp" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    throw new ApiError(response.status === 410
      ? "Este comprovante expirou e não está mais disponível."
      : "Não foi possível abrir o comprovante. Tente novamente.", response.status);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string"
      ? resolve(reader.result)
      : reject(new Error("Não foi possível ler a imagem."));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(blob);
  });
}

export async function uploadHouseholdExpenseAttachments(
  token: string,
  householdId: number,
  expenseId: number,
  files: HouseholdAttachmentFile[],
): Promise<HouseholdPageResponse> {
  const form = new FormData();
  files.forEach((file) => {
    form.append("files", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
  });

  const response = await fetch(
    `${API_BASE_URL}/households/${householdId}/expenses/${expenseId}/attachments`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: form,
    },
  );

  if (!response.ok) {
    let message = "Não foi possível enviar o comprovante.";
    try {
      const body = (await response.json()) as Record<string, unknown>;
      const apiMessage = body.error ?? body.message;
      if (typeof apiMessage === "string" && apiMessage.trim()) message = apiMessage;
    } catch {
      // Keep the friendly fallback when the server returns no JSON body.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as HouseholdPageResponse;
}

export async function createTransaction(
  token: string,
  transaction: CreateTransactionRequest,
): Promise<Transaction> {
  return request<Transaction>("/transactions", {
    body: JSON.stringify(transaction),
    method: "POST",
    token,
  });
}
