import React, { useState } from "react";
import { BillItem } from "../types";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Tag,
  Repeat,
  RefreshCw,
  Info
} from "lucide-react";

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
  const [currentDate, setCurrentDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper formatting yyyy-mm-dd
  const formatDateKey = (y: number, m: number, d: number) => {
    const mm = m + 1 < 10 ? `0${m + 1}` : `${m + 1}`;
    const dd = d < 10 ? `0${d}` : `${d}`;
    return `${y}-${mm}-${dd}`;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateStr(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateStr(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(null);
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

  // Active date to display details for (either explicitly selected or currently hovered)
  const activeDetailDateStr = selectedDateStr || hoveredDateStr;
  const activeDateBills = activeDetailDateStr ? billsByDateMap[activeDetailDateStr] || [] : [];

  const todayStr = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div
      className={`p-6 rounded-3xl border transition-all ${
        darkMode
          ? "bg-slate-900 border-slate-800 shadow-xl"
          : "bg-white border-slate-200 shadow-md"
      }`}
    >
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight">
                Bill Payment Calendar
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {monthNames[month]} {year}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover or click dates to inspect scheduled payments and status breakdowns.
            </p>
          </div>
        </div>

        {/* Month Navigation & Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-mono font-bold text-indigo-300 hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
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
          <span className="text-xs text-slate-400 font-medium">Month Total:</span>
          <span className="text-xs font-mono font-extrabold text-indigo-400">
            ₱{(monthPaidTotal + monthUpcomingTotal).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          darkMode ? "bg-emerald-950/20 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"
        }`}>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Paid Total:
          </span>
          <span className="text-xs font-mono font-extrabold text-emerald-400">
            ₱{monthPaidTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          darkMode ? "bg-amber-950/20 border-amber-500/30" : "bg-amber-50 border-amber-200"
        }`}>
          <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Upcoming Total:
          </span>
          <span className="text-xs font-mono font-extrabold text-amber-400">
            ₱{monthUpcomingTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Grid Layout: Calendar Grid + Interactive Side Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols on lg) */}
        <div className="lg:col-span-7">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider py-1"
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
                className="h-16 rounded-xl bg-slate-800/10 border border-transparent"
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
              const isHovered = hoveredDateStr === dateKey;

              const dayTotal = dayBills.reduce((acc, b) => acc + b.amount, 0);

              return (
                <div
                  key={dateKey}
                  onMouseEnter={() => setHoveredDateStr(dateKey)}
                  onMouseLeave={() => setHoveredDateStr(null)}
                  onClick={() =>
                    setSelectedDateStr((prev) => (prev === dateKey ? null : dateKey))
                  }
                  className={`h-16 p-1.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                    isSelected
                      ? "bg-indigo-600/30 border-indigo-500 shadow-md ring-2 ring-indigo-500/50"
                      : isHovered
                      ? "bg-slate-800/80 border-indigo-400/60 scale-[1.02] z-10"
                      : isToday
                      ? "bg-indigo-950/40 border-indigo-500/60"
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
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        isToday
                          ? "bg-indigo-500 text-white font-extrabold"
                          : "text-slate-300"
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Status Pill Dots */}
                    {dayBills.length > 0 && (
                      <div className="flex items-center gap-1">
                        {hasPaid && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {hasUpcoming && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom row: Bill count / Total Badge */}
                  {dayBills.length > 0 ? (
                    <div className="mt-1">
                      <div
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md truncate text-center ${
                          hasUpcoming
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        ₱{dayTotal >= 1000 ? `${(dayTotal / 1000).toFixed(1)}k` : dayTotal}
                      </div>
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Paid Bill</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Upcoming Due</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Today</span>
              </span>
            </div>
            <span>Click any day to pin details</span>
          </div>
        </div>

        {/* Interactive Bill Details Inspector (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col">
          <div
            className={`p-5 rounded-2xl border h-full flex flex-col justify-between ${
              darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-extrabold text-sm text-slate-200">
                    {activeDetailDateStr ? (
                      <span>Schedule for {activeDetailDateStr}</span>
                    ) : (
                      <span>Date Inspector</span>
                    )}
                  </h3>
                </div>
                {selectedDateStr && (
                  <button
                    onClick={() => setSelectedDateStr(null)}
                    className="text-[10px] font-mono font-bold text-indigo-400 hover:underline"
                  >
                    Clear Pin
                  </button>
                )}
              </div>

              {!activeDetailDateStr ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <Info className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">
                    Hover or Click a Date on the Calendar
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Inspect specific due dates, view associated amount obligations, and toggle payment statuses instantly.
                  </p>
                </div>
              ) : activeDateBills.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/60" />
                  <p className="text-xs font-bold text-slate-300">No Bills Scheduled</p>
                  <p className="text-[11px] text-slate-500">
                    There are no bill due dates registered for {activeDetailDateStr}.
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
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isPaid
                            ? "bg-emerald-950/20 border-emerald-500/30 text-slate-300"
                            : "bg-amber-950/20 border-amber-500/30 text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onToggleBillStatus(bill.id)}
                            className="shrink-0"
                            title={isPaid ? "Mark as Unpaid" : "Mark as Paid"}
                          >
                            <CheckCircle2
                              className={`w-5 h-5 ${
                                isPaid
                                  ? "text-emerald-400 fill-emerald-400"
                                  : "text-slate-500 hover:text-emerald-400 transition-colors"
                              }`}
                            />
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-white">
                                {bill.name}
                              </span>
                              {isRecurring && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                  <Repeat className="w-2.5 h-2.5" /> Rec
                                </span>
                              )}
                              {bill.autoPay && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                                  <RefreshCw className="w-2.5 h-2.5" /> Auto
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {bill.category} • {bill.recurringFrequency}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-extrabold text-xs block text-white">
                            ₱{bill.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase ${
                              isPaid ? "text-emerald-400" : "text-amber-400"
                            }`}
                          >
                            {isPaid ? "Paid" : "Upcoming"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick helper footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono text-center">
              Clicking checkmarks toggles bill status & generates next month's entry if recurring.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
