import type { SavingsGoal } from "../../types/goals";
import type { Transaction } from "../../types/finance";

export const GOAL_COLORS = ["#820ad1", "#1e8a5a", "#2563eb", "#d97706", "#c2412d", "#0e9aa7"];
export const GOAL_COLOR_NAMES = ["Roxo", "Verde", "Azul", "Âmbar", "Vermelho", "Turquesa"];
export const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
export const dateLabel = (value: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));

export function goalsSummary(goals: SavingsGoal[]) {
  const active = goals.filter((goal) => !goal.archived);
  const saved = active.reduce((sum, goal) => sum + Number(goal.currentAmount), 0);
  const target = active.reduce((sum, goal) => sum + Number(goal.targetAmount), 0);
  return {
    active, saved, target,
    remaining: Math.max(0, target - saved),
    progress: target > 0 ? Math.min(100, Math.max(0, saved / target * 100)) : 0,
    open: active.filter((goal) => goal.progressPercentage < 100),
    completed: active.filter((goal) => goal.progressPercentage >= 100),
  };
}

// Match the web's 30-day contribution pace, including overdue targets.
export function monthsUntil(targetDate?: string | null, now = new Date()) {
  if (!targetDate) return null;
  const days = (new Date(`${targetDate}T00:00:00`).getTime() - now.getTime()) / 86_400_000;
  return days <= 0 ? 0 : Math.max(1, Math.ceil(days / 30));
}

export function monthlyBalance(transactions: Transaction[], now = new Date()) {
  let cents = 0;
  for (const tx of transactions) {
    const source = tx.paymentDate || tx.transactionDate || tx.dateTime;
    const date = new Date(source.length === 10 ? `${source}T00:00:00` : source);
    if (date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth()) continue;
    cents += Math.round(Number(tx.amount) * 100) * (tx.type === "INCOME" ? 1 : -1);
  }
  return cents / 100;
}

export function breakEven(balance: number, now = new Date()) {
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  let earningDays = 0;
  // Same earning calendar as the web panel: Tuesdays are excluded.
  while (cursor <= end) {
    if (cursor.getDay() !== 2) earningDays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }
  const gap = Math.max(0, -balance);
  return { gap, earningDays, dailyTarget: earningDays > 0 ? gap / earningDays : gap };
}

export function parseGoalAmount(value: string) {
  const text = value.trim().replace(",", ".");
  return /^\d+(\.\d{1,2})?$/.test(text) ? Number(text) : NaN;
}

export function parseGoalDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return `${year}-${month}-${day}`;
}

export function goalDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length <= 2 ? digits : digits.length <= 4 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
