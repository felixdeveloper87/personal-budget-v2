import type { InstallmentPlan, RecurringTransaction } from "../../types/finance";

export function planTitle(plan: InstallmentPlan) {
  return plan.transactions[0]?.description
    .replace(/\s*\((?:Parcela|Installment)\s+\d+\/\d+\)\s*$/i, "").trim() || "Parcelamento";
}

// Dates represent the schedule, not confirmation that a payment was settled.
export function planProgress(plan: InstallmentPlan, now = new Date()) {
  const transactions = [...plan.transactions].sort((a, b) => a.date.localeCompare(b.date));
  const elapsed = transactions.filter((tx) => new Date(`${tx.date}T00:00:00`).getTime() < now.getTime());
  const upcoming = transactions.filter((tx) => new Date(`${tx.date}T00:00:00`).getTime() >= now.getTime());
  return {
    transactions, elapsed, upcoming,
    completed: transactions.length > 0 && upcoming.length === 0,
    progress: plan.totalInstallments > 0 ? Math.min(1, elapsed.length / plan.totalInstallments) : 0,
  };
}

export function commitmentSummary(recurring: RecurringTransaction[], plans: InstallmentPlan[], now = new Date()) {
  const activeRules = recurring.filter((item) => item.active)
    .sort((a, b) => a.dayOfMonth - b.dayOfMonth || b.amount - a.amount);
  const cancelledRules = recurring.filter((item) => !item.active)
    .sort((a, b) => a.description.localeCompare(b.description));
  const fixedMonthly = activeRules.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + Number(item.amount), 0);
  const fixedIncome = activeRules.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + Number(item.amount), 0);
  const activePlans = plans.filter((plan) => !planProgress(plan, now).completed);
  const completedPlans = plans.filter((plan) => planProgress(plan, now).completed);
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const installmentsMonthly = activePlans.flatMap((plan) => plan.transactions)
    .filter((tx) => tx.date.slice(0, 7) === monthKey).reduce((sum, tx) => sum + Number(tx.amount), 0);
  const remaining = activePlans.flatMap((plan) => planProgress(plan, now).upcoming)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const elapsed = plans.flatMap((plan) => planProgress(plan, now).elapsed)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  return { activeRules, cancelledRules, fixedMonthly, fixedIncome, activePlans, completedPlans, installmentsMonthly, remaining, elapsed, total: fixedMonthly + installmentsMonthly };
}

export function installmentMonths(plans: InstallmentPlan[], now = new Date()) {
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const months = new Map<string, { key: string; total: number; items: Array<{ plan: InstallmentPlan; transaction: InstallmentPlan["transactions"][number] }> }>();
  // Keep the current month available even when no installment is scheduled.
  months.set(currentKey, { key: currentKey, total: 0, items: [] });
  for (const plan of plans) {
    if (planProgress(plan, now).completed) continue;
    for (const transaction of plan.transactions) {
      const key = transaction.date.slice(0, 7);
      if (key < currentKey) continue;
      const month = months.get(key) ?? { key, total: 0, items: [] };
      month.total += Number(transaction.amount);
      month.items.push({ plan, transaction });
      months.set(key, month);
    }
  }
  return [...months.values()].sort((a, b) => a.key.localeCompare(b.key)).map((month) => ({
    ...month, items: month.items.sort((a, b) => a.transaction.date.localeCompare(b.transaction.date)),
  }));
}
