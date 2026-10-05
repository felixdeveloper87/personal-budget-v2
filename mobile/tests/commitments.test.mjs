import assert from "node:assert/strict";
import test from "node:test";
import { commitmentSummary, installmentMonths, planProgress, planTitle } from "../src/features/commitments/commitmentSummary.ts";
import { parseAmount, validDate } from "../src/features/commitments/format.ts";

const now = new Date(2026, 9, 5, 12);
const transaction = (id, date, amount = 30) => ({ id, date, amount, description: "Laptop (Parcela 1/3)", category: "Shopping", installmentNumber: id });
const plan = (id, transactions, overrides = {}) => ({ id, transactions, totalInstallments: 3, totalAmount: 90, installmentValue: 30, ...overrides });
const rule = (id, amount, overrides = {}) => ({ id, amount, active: true, type: "EXPENSE", description: "Rent", dayOfMonth: 1, ...overrides });

test("monthly commitment excludes income, cancelled rules and completed plans", () => {
  const result = commitmentSummary([
    rule(1, 100), rule(2, 50, { active: false }), rule(3, 300, { type: "INCOME" }),
  ], [
    plan(1, [transaction(1, "2026-10-01"), transaction(2, "2026-11-01")]),
    plan(2, [transaction(3, "2026-10-01", 80)]),
    plan(3, [transaction(4, "2026-12-01", 70)]),
  ], now);
  assert.equal(result.fixedMonthly, 100);
  assert.equal(result.fixedIncome, 300);
  assert.equal(result.installmentsMonthly, 30);
  assert.equal(result.total, 130);
  assert.equal(result.remaining, 100);
  assert.equal(result.activePlans.length, 2);
  assert.equal(result.completedPlans.length, 1);
});

test("fixed rules sort by due day and an empty plan remains active", () => {
  const result = commitmentSummary([rule(1, 10, { dayOfMonth: 20 }), rule(2, 30, { dayOfMonth: 1 }), rule(3, 40, { dayOfMonth: 1 })], [plan(1, [])], now);
  assert.deepEqual(result.activeRules.map((item) => item.id), [3, 2, 1]);
  assert.equal(result.activePlans.length, 1);
  assert.equal(planProgress(plan(1, [], { totalInstallments: 0 }), now).progress, 0);
});

test("monthly statements agree with summary and cross the year boundary", () => {
  const plans = [plan(1, [transaction(1, "2026-09-01"), transaction(2, "2026-10-01"), transaction(3, "2027-01-01")]), plan(2, [transaction(4, "2026-10-15", 50)])];
  const months = installmentMonths(plans, now);
  assert.deepEqual(months.map((month) => month.key), ["2026-10", "2027-01"]);
  assert.equal(months[0].total, commitmentSummary([], plans, now).installmentsMonthly);
  assert.deepEqual(months[0].items.map((item) => item.transaction.id), [2, 4]);
  assert.equal(installmentMonths([], now)[0].total, 0);
});

test("progress follows local scheduled dates and never exceeds 100%", () => {
  const progress = planProgress(plan(1, [transaction(2, "2026-11-01"), transaction(1, "2026-10-01")]), now);
  assert.equal(progress.elapsed.length, 1);
  assert.equal(progress.upcoming[0].id, 2);
  assert.equal(progress.progress, 1 / 3);
  assert.equal(progress.completed, false);
  assert.equal(planProgress(plan(1, [transaction(1, "2026-01-01"), transaction(2, "2026-02-01")], { totalInstallments: 1 }), now).progress, 1);
});

test("plan titles remove only installment suffixes", () => {
  assert.equal(planTitle(plan(1, [transaction(1, "2026-11-01")])), "Laptop");
  assert.equal(planTitle(plan(1, [])), "Parcelamento");
  assert.equal(planTitle(plan(1, [{ ...transaction(1, "2026-11-01"), description: "Laptop (Installment 2/3)" }])), "Laptop");
});

test("editor validates real calendar dates and decimal amounts", () => {
  assert.equal(validDate("2028-02-29"), true);
  for (const value of ["2026-02-29", "2026-04-31", "2026-00-05", "2026-10-00", "05/10/2026"]) assert.equal(validDate(value), false);
  assert.equal(parseAmount("12,50"), 12.5);
  assert.equal(parseAmount("12.50"), 12.5);
  for (const value of ["", "12abc", "Infinity", "1.2.3", "1,000.50"]) assert.equal(Number.isNaN(parseAmount(value)), true);
});
