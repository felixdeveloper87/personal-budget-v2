import assert from "node:assert/strict";
import test from "node:test";

import { getVariableSpending } from "../src/utils/variableSpending.ts";

const expense = (amount, overrides = {}) => ({
  id: 1,
  type: "EXPENSE",
  amount,
  dateTime: "2026-10-01T12:00:00",
  category: "Food",
  description: "Groceries",
  ...overrides,
});

test("averages over elapsed calendar days, including days with no purchases", () => {
  const result = getVariableSpending([expense(100), expense(38)], new Date(2026, 9, 3));
  assert.equal(result.spent, 138);
  assert.equal(result.dailyAverage, 46);
  assert.equal(result.projection, 1426);
  assert.equal(result.share, 3 / 31);
});

test("excludes fixed payments and installments identified by flags or IDs", () => {
  const result = getVariableSpending([
    expense(138),
    expense(500, { isInstallment: true }),
    expense(500, { installmentPlanId: 0 }),
    expense(500, { isRecurring: true }),
    expense(500, { recurringTransactionId: 10 }),
    expense(1000, { type: "INCOME" }),
  ], new Date(2026, 9, 3));
  assert.equal(result.spent, 138);
});

test("uses purchase dates and excludes future, planned, invalid and other-month entries", () => {
  const result = getVariableSpending([
    expense(138, { transactionDate: "2026-10-03", paymentDate: "2026-11-10" }),
    expense(500, { transactionDate: "2026-09-30" }),
    expense(500, { transactionDate: "2026-10-04" }),
    expense(500, { transactionDate: "2025-10-01" }),
    expense(500, { status: "PLANNED" }),
    expense(500, { dateTime: "invalid" }),
    expense(Number.NaN),
  ], new Date(2026, 9, 3));
  assert.equal(result.spent, 138);
});

test("handles empty data without a fabricated projection or filled bar", () => {
  const result = getVariableSpending([], new Date(2026, 9, 3));
  assert.equal(result.spent, 0);
  assert.equal(result.dailyAverage, 0);
  assert.equal(result.projection, 0);
  assert.equal(result.share, 0);
});

test("projection equals actual spend at month-end and accounts for leap years", () => {
  const result = getVariableSpending([
    expense(290, { transactionDate: "2028-02-01" }),
  ], new Date(2028, 1, 29));
  assert.equal(result.dailyAverage, 10);
  assert.equal(result.projection, 290);
  assert.equal(result.share, 1);
  assert.equal(result.daysInMonth, 29);
});

test("sums currency in cents", () => {
  assert.equal(getVariableSpending([expense(0.1), expense(0.2)], new Date(2026, 9, 1)).spent, 0.3);
});
