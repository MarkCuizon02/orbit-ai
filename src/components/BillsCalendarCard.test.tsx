import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BillsCalendarCard } from "./BillsCalendarCard";
import type { BillItem } from "../types";

beforeEach(() => {
  mock.timers.enable({ apis: ["Date"], now: new Date(2026, 9, 7) });
});
afterEach(() => mock.timers.reset());

const bill = (overrides: Partial<BillItem> = {}): BillItem => ({
  id: "bill", name: "Electricity", amount: 100, dueDate: "2026-10-07",
  category: "Utilities", recurringFrequency: "Monthly", status: "unpaid", autoPay: false,
  ...overrides,
});

const renderCalendar = (bills: BillItem[], darkMode = true) => renderToStaticMarkup(
  <BillsCalendarCard bills={bills} darkMode={darkMode} onToggleBillStatus={() => {}} />,
);

test("today is initially selected with a local readable date and bill totals", () => {
  const markup = renderCalendar([bill(), bill({ id: "paid", name: "Internet", amount: 50, status: "paid" })]);
  assert.match(markup, /aria-label="Wed, October 7, 2026: 2 bills, ₱150\.00" aria-pressed="true" aria-current="date"/);
  assert.match(markup, /2 bills · ₱150\.00 total/);
  assert.match(markup, /₱100\.00 outstanding/);
  assert.match(markup, /Due today/);
  assert.match(markup, /Mark as unpaid: Internet/);
  assert.match(markup, /Mark as paid: Electricity/);
});

test("empty months and empty dates have distinct informative states", () => {
  const markup = renderCalendar([]);
  assert.match(markup, /No bills scheduled for October 2026/);
  assert.match(markup, /No bills due on this date/);
  assert.match(markup, /Wed, October 7, 2026 has no scheduled payments/);
  assert.match(markup, /0 bills · ₱0\.00 total/);
  assert.doesNotMatch(markup, /Hover or Click|Clear Pin/);
});

test("only the visible month contributes to the month summary", () => {
  const markup = renderCalendar([bill({ amount: 123.45 }), bill({ id: "next", amount: 999, dueDate: "2026-11-07" })]);
  assert.match(markup, /₱123\.45/);
  assert.doesNotMatch(markup, /₱999\.00|₱1,122\.45/);
  assert.equal((markup.match(/aria-pressed="(?:true|false)" aria-current=|aria-pressed="(?:true|false)" class="h-20/g) || []).length, 31);
});

test("light mode uses readable text and recurring details are explicit", () => {
  const markup = renderCalendar([bill({ autoPay: true })], false);
  assert.match(markup, /text-slate-900/);
  assert.match(markup, /text-amber-700/);
  assert.match(markup, /Recurring/);
  assert.match(markup, /Auto-pay/);
  assert.doesNotMatch(markup, /generates next month/);
});

test("one-time non-recurring bills are not labeled recurring", () => {
  const markup = renderCalendar([bill({ recurringFrequency: "One-time", isRecurring: false })]);
  assert.doesNotMatch(markup, /> Recurring</);
  assert.match(markup, /One-time/);
});