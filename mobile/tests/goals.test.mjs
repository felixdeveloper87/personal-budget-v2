import assert from "node:assert/strict";
import test from "node:test";
import { breakEven, goalsSummary, monthlyBalance, monthsUntil, parseGoalAmount, parseGoalDate } from "../src/features/goals/goalUtils.ts";

const goal = (id, targetAmount, currentAmount, overrides = {}) => ({ id, name: "Trip", targetAmount, currentAmount, remainingAmount: Math.max(0, targetAmount - currentAmount), progressPercentage: Math.min(100, currentAmount / targetAmount * 100), archived: false, color: "#820ad1", ...overrides });
const tx = (type, amount, dateTime, overrides = {}) => ({ id: 1, type, amount, dateTime, category: "Other", description: "Test", ...overrides });

test("summary separates completed goals and excludes archived amounts", () => {
  const result = goalsSummary([goal(1, 100, 25), goal(2, 100, 150), goal(3, 500, 400, { archived: true })]);
  assert.equal(result.saved, 175);
  assert.equal(result.target, 200);
  assert.equal(result.remaining, 25);
  assert.equal(result.progress, 87.5);
  assert.deepEqual(result.open.map((item) => item.id), [1]);
  assert.deepEqual(result.completed.map((item) => item.id), [2]);
});

test("empty and overfunded summaries have bounded progress", () => {
  assert.equal(goalsSummary([]).progress, 0);
  const result = goalsSummary([goal(1, 100, 150)]);
  assert.equal(result.remaining, 0);
  assert.equal(result.progress, 100);
});

test("contribution pace follows the web's 30-day periods and overdue cutoff", () => {
  const now = new Date(2026, 9, 5, 12);
  assert.equal(monthsUntil(null, now), null);
  assert.equal(monthsUntil("2026-10-05", now), 0);
  assert.equal(monthsUntil("2026-10-06", now), 1);
  assert.equal(monthsUntil("2026-12-05", now), 3);
});

test("monthly cash flow uses payment date before activity date, including scheduled entries", () => {
  const balance = monthlyBalance([
    tx("INCOME", 200, "2026-10-01T12:00:00"),
    tx("EXPENSE", 50, "2026-09-30T12:00:00", { paymentDate: "2026-10-05" }),
    tx("EXPENSE", 80, "2026-10-02T12:00:00", { paymentDate: "2026-11-01" }),
    tx("EXPENSE", 30, "2026-10-30T12:00:00", { status: "PLANNED" }),
    tx("INCOME", 999, "2025-10-01T12:00:00"),
  ], new Date(2026, 9, 5));
  assert.equal(balance, 120);
  assert.equal(monthlyBalance([tx("INCOME", 0.3, "2026-10-01"), tx("EXPENSE", 0.1, "2026-10-01"), tx("EXPENSE", 0.2, "2026-10-01")], new Date(2026, 9, 5)), 0);
});

test("break-even excludes Tuesdays and handles a zero earning-day month end", () => {
  assert.deepEqual(breakEven(-100, new Date(2026, 2, 30)), { gap: 100, earningDays: 1, dailyTarget: 100 });
  assert.deepEqual(breakEven(-100, new Date(2026, 2, 31)), { gap: 100, earningDays: 0, dailyTarget: 100 });
  assert.equal(breakEven(200, new Date(2026, 9, 5)).dailyTarget, 0);
});

test("form accepts decimal commas and validates leap dates", () => {
  assert.equal(parseGoalAmount("123,45"), 123.45);
  assert.equal(parseGoalAmount("0"), 0);
  for (const value of ["", "-1", "12abc", "1,234.50", "Infinity"]) assert.ok(Number.isNaN(parseGoalAmount(value)));
  assert.equal(parseGoalDate("29/02/2028"), "2028-02-29");
  for (const value of ["29/02/2026", "31/04/2026", "00/10/2026", "05/00/2026", "2026-10-05"]) assert.equal(parseGoalDate(value), null);
});
