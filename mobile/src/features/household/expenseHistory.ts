import type { HouseholdExpense } from "@/types/household";

export function getExpenseAttachmentCount(expense: HouseholdExpense) {
  return expense.attachmentCount ?? expense.attachments?.filter((attachment) => attachment.status === "AVAILABLE").length ?? 0;
}

export function getExpenseShare(expense: HouseholdExpense, currentMemberId: number) {
  if (expense.currentUserShare !== undefined) return expense.currentUserShare;
  if (expense.shares === undefined) return undefined;
  return expense.shares.find((share) => share.memberId === currentMemberId)?.amount ?? null;
}

export function sortHouseholdExpenses(expenses: HouseholdExpense[]) {
  return [...expenses].sort((a, b) => b.expenseDate.localeCompare(a.expenseDate) || b.id - a.id);
}

export function mergeHouseholdExpenses(current: HouseholdExpense[], incoming: HouseholdExpense[]) {
  return sortHouseholdExpenses([...new Map([...current, ...incoming].map((item) => [item.id, item])).values()]);
}

export function groupHouseholdExpenses(expenses: HouseholdExpense[]) {
  const months = new Map<string, HouseholdExpense[]>();
  for (const expense of sortHouseholdExpenses(expenses)) {
    const month = expense.expenseDate.slice(0, 7);
    const entries = months.get(month) ?? [];
    entries.push(expense);
    months.set(month, entries);
  }
  return [...months].map(([month, data]) => ({ month, data }));
}

export function expenseMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })
    .format(new Date(year, monthNumber - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function expenseDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(year, month - 1, day));
}
