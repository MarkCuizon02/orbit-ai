import type { BillItem } from "../types";

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
}

export type PayoffStrategy = "avalanche" | "snowball";

export const isValidDebt = (debt: Omit<DebtItem, "id">) =>
  debt.name.trim().length > 0 &&
  Number.isFinite(debt.balance) && debt.balance >= 0.01 &&
  Number.isFinite(debt.apr) && debt.apr >= 0 &&
  Number.isFinite(debt.minPayment) && debt.minPayment >= 0.01;

const roundMoney = (amount: number) => Math.round(amount * 100) / 100;
const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

export function importDebtBills(existing: DebtItem[], bills: BillItem[]): DebtItem[] {
  const names = new Set(existing.map((debt) => normalizeName(debt.name)));
  const ids = new Set(existing.map((debt) => debt.id));
  const imported: DebtItem[] = [];
  for (const bill of bills) {
    if (bill.category !== "Debt" || bill.recurringFrequency !== "Monthly" ||
        !Number.isFinite(bill.amount) || bill.amount <= 0) continue;
    const debt = {
      id: `imported-${bill.id}`,
      name: bill.name.trim(),
      balance: roundMoney(bill.amount * 10),
      apr: 21,
      minPayment: roundMoney(bill.amount),
    };
    const name = normalizeName(debt.name);
    if (!isValidDebt(debt) || names.has(name) || ids.has(debt.id)) continue;
    names.add(name);
    ids.add(debt.id);
    imported.push(debt);
  }
  return [...existing, ...imported];
}

export function simulatePayoff(
  debtList: DebtItem[],
  strategy: PayoffStrategy,
  monthlyExtra: number,
  rollOverMinimums = true,
) {
  if (!Number.isFinite(monthlyExtra) || monthlyExtra < 0 ||
      debtList.some((debt) => !isValidDebt(debt))) {
    throw new RangeError("Debt amounts must be finite and positive; APR and extra payment must be nonnegative.");
  }
  const activeDebts = debtList.map((debt) => ({
    ...debt,
    currentBalance: roundMoney(debt.balance),
    minPayment: roundMoney(debt.minPayment),
    interestPaid: 0,
  }));
  const totalPrincipal = roundMoney(activeDebts.reduce((total, debt) => total + debt.currentBalance, 0));
  const monthlyBudget = roundMoney(roundMoney(monthlyExtra) + activeDebts.reduce((total, debt) => total + debt.minPayment, 0));
  const payoffOrder: { id: string; name: string; monthPaidOff: number; interestPaid: number }[] = [];
  let totalMonths = 0;
  let totalInterestPaid = 0;

  const payDebt = (debt: typeof activeDebts[number], available: number) => {
    const payment = Math.min(debt.currentBalance, roundMoney(available));
    debt.currentBalance = roundMoney(debt.currentBalance - payment);
    if (debt.currentBalance === 0) {
      payoffOrder.push({ id: debt.id, name: debt.name, monthPaidOff: totalMonths, interestPaid: debt.interestPaid });
    }
    return payment;
  };

  while (totalMonths < 360 && activeDebts.some((debt) => debt.currentBalance > 0)) {
    totalMonths++;
    let remainingExtra = rollOverMinimums ? monthlyBudget : roundMoney(monthlyExtra);
    for (const debt of activeDebts) {
      if (debt.currentBalance === 0) continue;
      const interest = roundMoney(debt.currentBalance * debt.apr / 1200);
      debt.interestPaid = roundMoney(debt.interestPaid + interest);
      totalInterestPaid = roundMoney(totalInterestPaid + interest);
      debt.currentBalance = roundMoney(debt.currentBalance + interest);
      const payment = payDebt(debt, debt.minPayment);
      if (rollOverMinimums) remainingExtra = roundMoney(remainingExtra - payment);
    }
    while (remainingExtra > 0) {
      const target = activeDebts.filter((debt) => debt.currentBalance > 0)
        .sort((first, second) => strategy === "avalanche"
          ? second.apr - first.apr
          : first.currentBalance - second.currentBalance)[0];
      if (!target) break;
      remainingExtra = roundMoney(remainingExtra - payDebt(target, remainingExtra));
    }
  }

  const remainingBalance = roundMoney(activeDebts.reduce((total, debt) => total + debt.currentBalance, 0));
  return { totalMonths, totalInterestPaid, totalPrincipal, payoffOrder, remainingBalance, paidOff: remainingBalance === 0 };
}