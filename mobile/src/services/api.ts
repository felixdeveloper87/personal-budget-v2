import type { AuthResponse, AuthUser } from "@/types/auth";
import type {
  CreateTransactionRequest,
  FinancialAccount,
  InstallmentPlan,
  MonthlySummary,
  Transaction,
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

export async function listInstallmentPlans(token: string): Promise<InstallmentPlan[]> {
  return request<InstallmentPlan[]>("/installment-plans", { token });
}

interface TransactionFilters {
  type?: "income" | "expense";
  startDate?: string;
  endDate?: string;
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
