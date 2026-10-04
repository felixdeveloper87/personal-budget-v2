import type { HouseholdPayment } from "@/types/household";

export function sortHouseholdPayments(payments: HouseholdPayment[]) {
  return [...payments].sort((a, b) => b.settlementDate.localeCompare(a.settlementDate) || b.id - a.id);
}

export function mergeHouseholdPayments(current: HouseholdPayment[], incoming: HouseholdPayment[]) {
  return sortHouseholdPayments([...new Map([...current, ...incoming].map((item) => [item.id, item])).values()]);
}

export function groupHouseholdPayments(payments: HouseholdPayment[]) {
  const months = new Map<string, HouseholdPayment[]>();
  for (const payment of sortHouseholdPayments(payments)) {
    const month = payment.settlementDate.slice(0, 7);
    const entries = months.get(month) ?? [];
    entries.push(payment);
    months.set(month, entries);
  }
  return [...months].map(([month, data]) => ({ month, data }));
}

export const paymentStatuses = {
  CONFIRMED: { label: "Confirmado", ink: "#1E8A5A", background: "#E3F4EB" },
  PENDING: { label: "Pendente", ink: "#8A5A00", background: "#FBF1DC" },
  REJECTED: { label: "Recusado", ink: "#C2412D", background: "#FBE7E3" },
  CANCELLED: { label: "Cancelado", ink: "#6B6B76", background: "#ECECF1" },
} satisfies Record<HouseholdPayment["status"], { label: string; ink: string; background: string }>;
