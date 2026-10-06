import React, { useState } from "react";
import type { BillItem } from "../types";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Repeat,
  RefreshCw
} from "lucide-react";

const formatDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const formatDateLabel = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short", month: "long", day: "numeric", year: "numeric",
  });
};

const formatAmount = (amount: number) =>
  `₱${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface BillsCalendarCardProps {
  bills: BillItem[];
  onToggleBillStatus: (id: string) => void;
  darkMode: boolean;
}

export const BillsCalendarCard: React.FC<BillsCalendarCardProps> = ({
  bills,
  onToggleBillStatus,
  darkMode,
}) => {
  // Current view date state (year and month index 0-11)
  const today = new Date();
  const todayStr = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const [currentDate, setCurrentDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);
  const mutedText = darkMode ? "text-slate-400" : "text-slate-600";
  const strongText = darkMode ? "text-slate-100" : "text-slate-900";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigation handlers
  const navigateMonth = (offset: number) => {
    const nextDate = new Date(year, month + offset, 1);
    setCurrentDate(nextDate);
    setSelectedDateStr(formatDateKey(nextDate.getFullYear(), nextDate.getMonth(), 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(todayStr);
  };

  // Calendar matrix calculations
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map bills by date key "YYYY-MM-DD"
  const billsByDateMap: Record<string, BillItem[]> = {};
  bills.forEach((b) => {
    if (!billsByDateMap[b.dueDate]) {
      billsByDateMap[b.dueDate] = [];
    }
    billsByDateMap[b.dueDate].push(b);
  });

  // Calculate stats for current visible month
  const currentMonthPrefix = `${year}-${month + 1 < 10 ? "0" + (month + 1) : month + 1}`;
  const monthBills = bills.filter((b) => b.dueDate.startsWith(currentMonthPrefix));
  const monthPaidTotal = monthBills.filter((b) => b.status === "paid").reduce((acc, b) => acc + b.amount, 0);
  const monthUpcomingTotal = monthBills.filter((b) => b.status !== "paid").reduce((acc, b) => acc + b.amount, 0);

  const activeDateBills = billsByDateMap[selectedDateStr] || [];
  const selectedTotal = activeDateBills.reduce((total, bill) => total + bill.amount, 0);
  const selectedOutstanding = activeDateBills.filter((bill) => bill.status !== "paid")
    .reduce((total, bill) => total + bill.amount, 0);

  return (
    <div
      className={`p-6 rounded-3xl border transition-all ${
        darkMode
          ? "bg-slate-900 border-slate-800 shadow-xl text-slate-100"
          : "bg-white border-slate-200 shadow-md text-slate-900"
      }`}
    >
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight">
                Bill Payment Calendar
              </h2>
              <span aria-live="polite" className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 border border-indigo-500/40 ${darkMode ? "text-indigo-300" : "text-indigo-700"}`}>
                {monthNames[month]} {year}
              </span>
            </div>
          </div>
        </div>

        {/* Month Navigation & Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => navigateMonth(-1)}
              aria-label="Previous month"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              title="Show today's bills"
              className="px-2.5 py-1 text-xs font-mono font-bold text-indigo-300 hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth(1)}
              aria-label="Next month"
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Financial Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          darkMode ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
        }`}>
          <span className={`text-xs font-medium ${mutedText}`}>Month Total:</span>
          <span className={`text-xs font-mono font-extrabold ${darkMode ? "text-indigo-400" : "text-indigo-700"}`}>
            {formatAmount(monthPaidTotal + monthUpcomingTotal)}
          </span>
        </div>

        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          darkMode ? "bg-emerald-950/20 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"
        }`}>
          <span className={`text-xs font-medium flex items-center gap-1 ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Paid Total:
          </span>
          <span className={`text-xs font-mono font-extrabold ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
            {formatAmount(monthPaidTotal)}
          </span>
        </div>

        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          darkMode ? "bg-amber-950/20 border-amber-500/30" : "bg-amber-50 border-amber-200"
        }`}>
          <span className={`text-xs font-medium flex items-center gap-1 ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Outstanding:
          </span>
          <span className={`text-xs font-mono font-extrabold ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
            {formatAmount(monthUpcomingTotal)}
          </span>
        </div>
      </div>

      {/* Grid Layout: Calendar Grid + Interactive Side Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols on lg) */}
        <div className="lg:col-span-7 min-w-0">
          {monthBills.length === 0 && (
            <p role="status" className={`text-xs mb-3 ${mutedText}`}>No bills scheduled for {monthNames[month]} {year}.</p>
          )}
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className={`text-[11px] font-mono font-bold uppercase tracking-wider py-1 ${mutedText}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset tiles for first week */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div
                key={`blank-${i}`}
                aria-hidden="true"
                className="h-20 rounded-xl bg-slate-800/10 border border-transparent"
              />
            ))}

            {/* Day tiles */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = formatDateKey(year, month, dayNum);
              const dayBills = billsByDateMap[dateKey] || [];
              const isToday = dateKey === todayStr;

              const hasPaid = dayBills.some((b) => b.status === "paid");
              const hasUpcoming = dayBills.some((b) => b.status !== "paid");
              const isSelected = selectedDateStr === dateKey;
              const dayTotal = dayBills.reduce((acc, b) => acc + b.amount, 0);

              return (
                <button
                  key={dateKey}
                  type="button"
                  aria-label={`${formatDateLabel(dateKey)}: ${dayBills.length} bill${dayBills.length === 1 ? "" : "s"}, ${formatAmount(dayTotal)}`}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  onClick={() => setSelectedDateStr(dateKey)}
                  className={`h-20 min-w-0 p-1 rounded-xl border transition-colors cursor-pointer relative flex flex-col items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                    isSelected
                      ? "bg-indigo-600/30 border-indigo-500 shadow-md ring-2 ring-indigo-500/50"
                      : isToday
                      ? "bg-indigo-500/10 border-indigo-500/60"
                      : dayBills.length > 0
                      ? hasUpcoming
                        ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                        : "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
                      : darkMode
                      ? "bg-slate-800/20 border-slate-800/80 hover:bg-slate-800/50"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {/* Top row: Date number & indicators */}
                  <div className="flex flex-wrap w-full items-center justify-center sm:justify-between gap-0.5">
                    <span
                      className={`text-xs font-mono font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        isToday
                          ? "bg-indigo-500 text-white font-extrabold"
                          : strongText
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Status Pill Dots */}
                    {dayBills.length > 0 && (
                      <div aria-hidden="true" className="hidden sm:flex items-center gap-1">
                        {hasPaid && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                        {hasUpcoming && (
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom row: Bill count / Total Badge */}
                  {dayBills.length > 0 ? (
                    <div className="mt-1 min-w-0 w-full">
                      <span className={`block text-[9px] font-mono text-center ${mutedText}`}>{dayBills.length} {dayBills.length === 1 ? "bill" : "bills"}</span>
                      <div
                        title={formatAmount(dayTotal)}
                        className={`hidden sm:block text-[9px] font-mono font-bold px-0.5 py-0.5 rounded-md truncate text-center ${
                          hasUpcoming
                            ? `bg-amber-500/20 border border-amber-500/30 ${darkMode ? "text-amber-300" : "text-amber-800"}`
                            : `bg-emerald-500/20 border border-emerald-500/30 ${darkMode ? "text-emerald-300" : "text-emerald-800"}`
                        }`}
                      >
                        ₱{dayTotal >= 1000 ? `${(dayTotal / 1000).toFixed(1)}k` : dayTotal}
                      </div>
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}
                </button>
              );
            })}
            {Array.from({ length: 42 - firstDayOfWeek - daysInMonth }).map((_, index) => (
              <div key={`trailing-${index}`} aria-hidden="true" className="h-20 rounded-xl bg-slate-800/10" />
            ))}
          </div>

          {/* Legend */}
          <div className={`flex flex-wrap items-center gap-3 mt-4 text-[11px] font-mono ${mutedText}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Paid Bill</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Outstanding</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Today</span>
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Bill Details Inspector (5 cols on lg) */}
        <div className="lg:col-span-5 min-w-0 flex flex-col">
          <div
            className={`p-5 rounded-2xl border h-full flex flex-col justify-between ${
              darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div>
              <div className={`flex items-center justify-between pb-3 mb-3 border-b ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 shrink-0 text-indigo-400" />
                  <h3 aria-live="polite" className={`font-extrabold text-sm ${strongText}`}>
                    {formatDateLabel(selectedDateStr)}
                  </h3>
                </div>
              </div>

              <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs mb-4 ${mutedText}`}>
                <span>{activeDateBills.length} {activeDateBills.length === 1 ? "bill" : "bills"} · {formatAmount(selectedTotal)} total</span>
                <span>{formatAmount(selectedOutstanding)} outstanding</span>
              </div>
              {activeDateBills.length === 0 ? (
                <div role="status" className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/60" />
                  <p className={`text-xs font-bold ${strongText}`}>No bills due on this date</p>
                  <p className={`text-[11px] ${mutedText}`}>
                    {formatDateLabel(selectedDateStr)} has no scheduled payments.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {activeDateBills.map((bill) => {
                    const isPaid = bill.status === "paid";
                    const isRecurring =
                      bill.isRecurring !== undefined
                        ? bill.isRecurring
                        : bill.recurringFrequency !== "One-time";

                    return (
                      <div
                        key={bill.id}
                        className={`p-3.5 rounded-lg border flex flex-wrap items-center justify-between gap-3 transition-colors ${
                          isPaid
                            ? darkMode ? "bg-emerald-950/20 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"
                            : darkMode ? "bg-amber-950/20 border-amber-500/30" : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <div className="flex flex-1 min-w-0 items-center gap-3">
                          <button
                            onClick={() => onToggleBillStatus(bill.id)}
                            aria-label={`${isPaid ? "Mark as unpaid" : "Mark as paid"}: ${bill.name}`}
                            aria-pressed={isPaid}
                            className="shrink-0 p-1 rounded focus-visible:outline-2 focus-visible:outline-indigo-500"
                            title={isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                          >
                            <CheckCircle2
                              className={`w-5 h-5 ${
                                isPaid
                                  ? "text-emerald-500"
                                  : "text-slate-500 hover:text-emerald-400 transition-colors"
                              }`}
                            />
                          </button>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`font-extrabold text-xs break-words [overflow-wrap:anywhere] ${strongText}`}>
                                {bill.name}
                              </span>
                              {isRecurring && (
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1 ${darkMode ? "text-emerald-400" : "text-emerald-800"}`}>
                                  <Repeat className="w-2.5 h-2.5" /> Recurring
                                </span>
                              )}
                              {bill.autoPay && (
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1 ${darkMode ? "text-indigo-400" : "text-indigo-800"}`}>
                                  <RefreshCw className="w-2.5 h-2.5" /> Auto-pay
                                </span>
                              )}
                            </div>

                            <p className={`text-[10px] mt-0.5 ${mutedText}`}>
                              {bill.category} • {bill.recurringFrequency}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`font-mono font-extrabold text-xs block ${strongText}`}>
                            {formatAmount(bill.amount)}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase ${
                              isPaid ? (darkMode ? "text-emerald-400" : "text-emerald-700") : (darkMode ? "text-amber-400" : "text-amber-700")
                            }`}
                          >
                            {isPaid ? "Paid" : bill.dueDate < todayStr ? "Overdue" : bill.dueDate === todayStr ? "Due today" : bill.status === "unpaid" ? "Unpaid" : "Upcoming"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
