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
  CONFIRMED: { label: "Confirmado", ink: "#326548", background: "#E3EDDA" },
  PENDING: { label: "Pendente", ink: "#80652D", background: "#F2E9D5" },
  REJECTED: { label: "Recusado", ink: "#A44735", background: "#F3E3DC" },
  CANCELLED: { label: "Cancelado", ink: "#52656A", background: "#EBEDE5" },
} satisfies Record<HouseholdPayment["status"], { label: string; ink: string; background: string }>;
