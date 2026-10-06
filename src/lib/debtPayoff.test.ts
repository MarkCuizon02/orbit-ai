import assert from "node:assert/strict";
import { test } from "node:test";
import { importDebtBills, isValidDebt, simulatePayoff, type DebtItem } from "./debtPayoff";
import type { BillItem } from "../types";

const debt = (id: string, balance: number, minPayment: number, apr = 0): DebtItem =>
  ({ id, name: id, balance, minPayment, apr });

test("rolls unused and freed minimums into a fixed monthly budget", () => {
  const debts = [debt("small", 50, 100), debt("large", 350, 100)];
  const result = simulatePayoff(debts, "snowball", 0);
  assert.equal(result.totalMonths, 2);
  assert.equal(result.remainingBalance, 0);
  assert.equal(simulatePayoff(debts, "avalanche", 0, false).totalMonths, 4);
  assert.equal(debts[0].balance, 50);
});

test("accrues monthly interest and records each account independently", () => {
  const result = simulatePayoff([
    { ...debt("first", 100, 101, 12), name: "Same name" },
    { ...debt("second", 100, 1, 24), name: "Same name" },
  ], "avalanche", 101);
  assert.equal(result.totalMonths, 1);
  assert.equal(result.totalInterestPaid, 3);
  assert.deepEqual(result.payoffOrder.map((entry) => entry.interestPaid), [1, 2]);
  assert.deepEqual(result.payoffOrder.map((entry) => entry.id), ["first", "second"]);
});

test("avalanche and snowball prioritize different accounts", () => {
  const debts = [debt("small", 100, 1), debt("high-apr", 200, 1, 24)];
  assert.equal(simulatePayoff(debts, "snowball", 200).payoffOrder[0].id, "small");
  assert.equal(simulatePayoff(debts, "avalanche", 200).payoffOrder[0].id, "high-apr");
});

test("does not claim a payoff when the 360-month horizon is exhausted", () => {
  const result = simulatePayoff([debt("growing", 1000, 1, 24)], "avalanche", 0);
  assert.equal(result.totalMonths, 360);
  assert.equal(result.paidOff, false);
  assert.ok(result.remainingBalance > 1000);
  assert.deepEqual(result.payoffOrder, []);
});

test("handles empty accounts and cent-sized balances without phantom interest", () => {
  assert.deepEqual(simulatePayoff([], "avalanche", 2000), {
    totalMonths: 0, totalInterestPaid: 0, totalPrincipal: 0,
    payoffOrder: [], remainingBalance: 0, paidOff: true,
  });
  assert.equal(simulatePayoff([debt("cent", 0.01, 0.01)], "snowball", 0).totalMonths, 1);
});

test("rounds each minimum to cents and cascades extra across same-name accounts", () => {
  const result = simulatePayoff([
    { ...debt("first", 150, 99.999), name: "Same" },
    { ...debt("second", 150, 99.999), name: "Same" },
  ], "avalanche", 100);
  assert.equal(result.totalMonths, 1);
  assert.deepEqual(result.payoffOrder.map((entry) => entry.id), ["first", "second"]);
});

test("a payoff in month 360 is still a completed plan", () => {
  const result = simulatePayoff([debt("long", 360, 1)], "avalanche", 0);
  assert.equal(result.totalMonths, 360);
  assert.equal(result.paidOff, true);
});

test("rejects invalid inputs while accepting a zero-percent APR", () => {
  assert.equal(isValidDebt(debt("valid", 100, 10, 0)), true);
  for (const invalid of [debt("negative", -1, 10), debt("blank", 0, 10), debt("nan", NaN, 10),
    debt("infinity", 100, Infinity), debt("apr", 100, 10, -1), debt("zero-payment", 100, 0)]) {
    assert.equal(isValidDebt(invalid), false);
    assert.throws(() => simulatePayoff([invalid], "avalanche", 0), RangeError);
  }
  assert.throws(() => simulatePayoff([], "avalanche", NaN), RangeError);
});

test("imports monthly debt estimates once, including duplicates within a batch", () => {
  const bill = (id: string, name: string, amount = 100): BillItem => ({
    id, name, amount, category: "Debt", dueDate: "2026-10-07",
    recurringFrequency: "Monthly", status: "unpaid", autoPay: false,
  });
  const bills = [bill("one", " Card "), bill("two", "card"), bill("three", ""),
    bill("four", "Invalid", -1), { ...bill("five", "Annual"), recurringFrequency: "Yearly" as const }];
  const result = importDebtBills([], bills);
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { ...debt("imported-one", 1000, 100, 21), name: "Card" });
  assert.equal(result[0].name, "Card");
  assert.equal(importDebtBills(result, bills).length, 1);
  assert.equal(importDebtBills(result, [bill("one", "Renamed")]).length, 1);
});