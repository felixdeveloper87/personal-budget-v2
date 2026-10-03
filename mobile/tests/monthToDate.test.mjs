import assert from "node:assert/strict";
import test from "node:test";

import { getMonthToDateComparison } from "../src/utils/monthToDate.ts";

const income = (amount, transactionDate, overrides = {}) => ({
  id: 1,
  type: "INCOME",
  amount,
  dateTime: `${transactionDate}T12:00:00`,
  transactionDate,
  category: "Salary",
  description: "Pay",
  ...overrides,
});

test("compares day 1..N of this month with day 1..N of last month", () => {
  const result = getMonthToDateComparison([
    income(100, "2026-10-02"),
    income(50, "2026-10-04"),
    income(80, "2026-09-03"),
    income(900, "2026-09-25"),
  ], "INCOME", new Date(2026, 9, 3));
  assert.deepEqual(result, { current: 100, previous: 80 });
});

test("clamps to last month's length and crosses the year boundary", () => {
  const march = getMonthToDateComparison([income(10, "2027-02-28")], "INCOME", new Date(2027, 2, 31));
  assert.equal(march.previous, 10);
  const january = getMonthToDateComparison([income(20, "2025-12-05")], "INCOME", new Date(2026, 0, 5));
  assert.equal(january.previous, 20);
});

test("ignores other types and planned entries", () => {
  const result = getMonthToDateComparison([
    income(100, "2026-09-01"),
    income(500, "2026-09-01", { type: "EXPENSE" }),
    income(500, "2026-09-01", { status: "PLANNED" }),
  ], "INCOME", new Date(2026, 9, 3));
  assert.equal(result.previous, 100);
});
