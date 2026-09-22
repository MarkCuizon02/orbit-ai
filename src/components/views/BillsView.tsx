import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { BillItem } from "../../types";
import { BudgetVisualization } from "../BudgetVisualization";
import { MonthlySavingsTargetCard } from "../MonthlySavingsTargetCard";
import { BudgetForecastCard } from "../BudgetForecastCard";
import { BudgetTrendChart } from "../BudgetTrendChart";
import { AIExpenseAnalyzerCard } from "../AIExpenseAnalyzerCard";
import { BillsCalendarCard } from "../BillsCalendarCard";
import { DebtPaydownCalculatorCard } from "../DebtPaydownCalculatorCard";
import { EmergencyFundCard } from "../EmergencyFundCard";
import { 
  CreditCard, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Trash2, 
  AlertCircle, 
  RefreshCw,
  BellRing,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Repeat,
  Info,
  Zap,
  Home,
  Tv,
  ShieldCheck,
  Landmark,
  Tag
} from "lucide-react";

interface BillsViewProps {
  bills: BillItem[];
  monthlyIncome?: number;
  onUpdateMonthlyIncome?: (income: number) => void;
  onAddBill: (b: Omit<BillItem, "id" | "status">) => void;
  onToggleBillStatus: (id: string) => void;
  onToggleBillRecurring?: (id: string) => void;
  onDeleteBill: (id: string) => void;
  onOpenQuickAdd: () => void;
  onTriggerToast?: (title: string, desc?: string, type?: "success" | "ai" | "streak" | "warning") => void;
  darkMode: boolean;
}

// Motion variants for staggered entrance animation
const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    x: -20,
    transition: { duration: 0.18 },
  },
};

// Category icon and styling configuration map
const getCategoryConfig = (category: string) => {
  const lower = (category || "").toLowerCase();
  if (lower.includes("utilit")) {
    return {
      icon: Zap,
      badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
      boxClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
  }
  if (lower.includes("hous") || lower.includes("rent")) {
    return {
      icon: Home,
      badgeClass: "bg-sky-500/15 text-sky-300 border-sky-500/40",
      boxClass: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    };
  }
  if (lower.includes("subscrip")) {
    return {
      icon: Tv,
      badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/40",
      boxClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    };
  }
  if (lower.includes("insur")) {
    return {
      icon: ShieldCheck,
      badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
      boxClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
  }
  if (lower.includes("debt") || lower.includes("credit") || lower.includes("loan")) {
    return {
      icon: Landmark,
      badgeClass: "bg-rose-500/15 text-rose-300 border-rose-500/40",
      boxClass: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    };
  }
  return {
    icon: Tag,
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-500/40",
    boxClass: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
};

export const BillsView: React.FC<BillsViewProps> = ({
  bills,
  monthlyIncome = 225000,
  onUpdateMonthlyIncome,
  onAddBill,
  onToggleBillStatus,
  onToggleBillRecurring,
  onDeleteBill,
  onOpenQuickAdd,
  onTriggerToast,
  darkMode,
}) => {
  const totalMonthlySpend = bills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = bills.filter((b) => b.status === "paid").reduce((acc, b) => acc + b.amount, 0);
  const totalUpcoming = bills.filter((b) => b.status !== "paid").reduce((acc, b) => acc + b.amount, 0);

  // Calculate days remaining for due date logic
  const calculateDaysRemaining = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr + "T00:00:00");
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Identify unpaid bills due within the next 3 days (or overdue)
  const dueSoonBills = bills
    .filter((b) => b.status !== "paid")
    .map((b) => ({
      ...b,
      diffDays: calculateDaysRemaining(b.dueDate),
    }))
    .filter((b) => b.diffDays <= 3)
    .sort((a, b) => a.diffDays - b.diffDays);

  const handleTriggerAlertToast = (bill: BillItem & { diffDays: number }) => {
    if (!onTriggerToast) return;
    if (bill.diffDays >= 0 && bill.diffDays <= 3) {
      const dayLabel =
        bill.diffDays === 0
          ? "is due TODAY"
          : bill.diffDays === 1
          ? "is due TOMORROW"
          : `is due in ${bill.diffDays} days (${bill.dueDate})`;

      onTriggerToast(
        `Upcoming Bill Alert: ${bill.name}`,
        `₱${bill.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${dayLabel}.`,
        "warning"
      );
    } else if (bill.diffDays < 0) {
      onTriggerToast(
        `Overdue Bill Alert: ${bill.name}`,
        `₱${bill.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} was due on ${bill.dueDate} (${Math.abs(bill.diffDays)} day${Math.abs(bill.diffDays) > 1 ? "s" : ""} ago).`,
        "warning"
      );
    }
  };

  const handleNotifyAllDueSoon = () => {
    if (dueSoonBills.length === 0 && onTriggerToast) {
      onTriggerToast("All Bills Clear!", "No upcoming bills due within the next 3 days.", "success");
      return;
    }

    dueSoonBills.forEach((bill, index) => {
      setTimeout(() => {
        handleTriggerAlertToast(bill);
      }, index * 350);
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <span>Bills & Subscriptions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track recurring expenses, renewal dates, autopay statuses, and monthly financial obligations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNotifyAllDueSoon}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border shadow-sm ${
              dueSoonBills.length > 0
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                : "bg-slate-800/60 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <BellRing className={`w-3.5 h-3.5 ${dueSoonBills.length > 0 ? "animate-bounce text-amber-400" : ""}`} />
            <span>Check Due Alerts ({dueSoonBills.length})</span>
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 3-Day Upcoming Deadline Alert Banner */}
      {dueSoonBills.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 text-white shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm md:text-base text-amber-200 tracking-tight">
                    {dueSoonBills.length} Bill{dueSoonBills.length > 1 ? "s" : ""} Due Within Next 3 Days!
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/30 text-amber-300 border border-amber-400/40">
                    Urgent Action
                  </span>
                </div>
                <p className="text-xs text-amber-100/70 mt-1 max-w-2xl">
                  Automated deadline monitor detected approaching bills. Settle these payments now to maintain your credit score and avoid late penalty charges.
                </p>
              </div>
            </div>

            <button
              onClick={handleNotifyAllDueSoon}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono transition-all shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center gap-2"
            >
              <BellRing className="w-4 h-4" />
              <span>Broadcast Toast Alerts</span>
            </button>
          </div>

          {/* Quick List of Urgent Bills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 relative z-10">
            {dueSoonBills.map((b) => (
              <div
                key={`urgent-${b.id}`}
                className="p-3 rounded-2xl bg-zinc-950/70 border border-amber-500/30 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-extrabold text-white truncate max-w-[150px]">{b.name}</p>
                  <p className="text-[10px] text-amber-300 font-mono font-bold">
                    ₱{b.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-extrabold border ${
                    b.diffDays < 0
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : b.diffDays === 0
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}>
                    {b.diffDays < 0
                      ? `Overdue (${Math.abs(b.diffDays)}d)`
                      : b.diffDays === 0
                      ? "Due Today!"
                      : b.diffDays === 1
                      ? "Due Tomorrow"
                      : `In ${b.diffDays} Days`}
                  </span>

                  <button
                    onClick={() => handleTriggerAlertToast(b)}
                    title="Test Toast Alert"
                    className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 transition-colors"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onToggleBillStatus(b.id)}
                    title="Mark as Paid"
                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-400">Total Monthly</span>
          </div>
          <p className="text-2xl font-black">₱{totalMonthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-400">Total Fixed Obligations</p>
        </div>

        <div className={`p-5 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">Paid so far</span>
          </div>
          <p className="text-2xl font-black">₱{totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-400">Settled Expenses</p>
        </div>

        <div className={`p-5 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">Upcoming Due</span>
          </div>
          <p className="text-2xl font-black">₱{totalUpcoming.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-slate-400">Pending Approaching Payments</p>
        </div>
      </div>

      {/* AI Expense Analyzer & Smart Categorizer Card */}
      <AIExpenseAnalyzerCard
        bills={bills}
        onAddBill={onAddBill}
        onTriggerToast={onTriggerToast}
        darkMode={darkMode}
      />

      {/* Mini-Calendar View for Payment Deadlines & Status */}
      <BillsCalendarCard
        bills={bills}
        onToggleBillStatus={onToggleBillStatus}
        darkMode={darkMode}
      />

      {/* Debt Paydown Strategy & Amortization Calculator */}
      <DebtPaydownCalculatorCard
        bills={bills}
        darkMode={darkMode}
      />

      {/* Emergency Reserve & Liquidity Cushion Tracking Card */}
      <EmergencyFundCard
        bills={bills}
        monthlyIncome={monthlyIncome}
        darkMode={darkMode}
      />

      {/* Recharts Budget Visualization Component */}
      <BudgetVisualization
        bills={bills}
        monthlyIncome={monthlyIncome}
        onUpdateMonthlyIncome={onUpdateMonthlyIncome}
        darkMode={darkMode}
      />

      {/* Monthly Savings Target Progress Card */}
      <MonthlySavingsTargetCard
        bills={bills}
        monthlyIncome={monthlyIncome}
        darkMode={darkMode}
        onTriggerToast={onTriggerToast}
      />

      {/* Budget Forecast & Cashflow Projection Card */}
      <BudgetForecastCard
        bills={bills}
        monthlyIncome={monthlyIncome}
        darkMode={darkMode}
      />

      {/* 6-Month Budget Trend Line Chart */}
      <BudgetTrendChart
        bills={bills}
        monthlyIncome={monthlyIncome}
        darkMode={darkMode}
      />

      {/* Bills & Subscriptions List */}
      <div className={`p-6 rounded-3xl border ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-extrabold text-base flex items-center gap-2">
              <span>Recurring Expense Ledger</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono font-normal">
                Auto-Renewal Smart Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-400" />
              <span>Bills marked as <strong>Recurring</strong> automatically create next month's entry when marked as paid.</span>
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono shrink-0">
            {bills.filter(b => b.status !== "paid").length} Unpaid
          </span>
        </div>

        <motion.div
          className="space-y-3"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {bills.map((bill) => {
              const diffDays = calculateDaysRemaining(bill.dueDate);
              const isUnpaid = bill.status !== "paid";
              const isDueWithin3Days = isUnpaid && diffDays <= 3;
              const isRecurring = bill.isRecurring !== undefined 
                ? bill.isRecurring 
                : bill.recurringFrequency !== "One-time";
              const catConfig = getCategoryConfig(bill.category);
              const CategoryIcon = catConfig.icon;

              return (
                <motion.div
                  key={bill.id}
                  variants={listItemVariants}
                  layout
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    bill.status === "paid"
                      ? "bg-slate-100/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-70"
                      : isDueWithin3Days
                      ? "bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/40 shadow-sm"
                      : darkMode
                      ? "bg-slate-800/40 border-slate-800"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onToggleBillStatus(bill.id)}
                    className="shrink-0"
                    title={bill.status === "paid" ? "Mark as Unpaid" : "Mark as Paid"}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${bill.status === "paid" ? "text-emerald-400 fill-emerald-400" : "text-slate-500 hover:text-emerald-400 transition-colors"}`} />
                  </button>

                  {/* Category Visual Icon Box */}
                  <div className={`p-2.5 rounded-xl border shrink-0 ${catConfig.boxClass}`} title={bill.category}>
                    <CategoryIcon className="w-4 h-4" />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold flex items-center gap-2 flex-wrap">
                      <span>{bill.name}</span>

                      {/* Category Badge Pill */}
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold font-mono border flex items-center gap-1 ${catConfig.badgeClass}`}>
                        <CategoryIcon className="w-2.5 h-2.5" />
                        <span>{bill.category}</span>
                      </span>
                      
                      {/* Recurring Toggle Pill */}
                      <button
                        onClick={() => onToggleBillRecurring?.(bill.id)}
                        title={isRecurring ? "Click to set as One-Time expense" : "Click to mark as Recurring bill"}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold font-mono border flex items-center gap-1 transition-all ${
                          isRecurring
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"
                            : "bg-slate-700/40 border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500"
                        }`}
                      >
                        <Repeat className={`w-2.5 h-2.5 ${isRecurring ? "text-emerald-400 animate-spin-slow" : "text-slate-400"}`} />
                        <span>{isRecurring ? "Recurring" : "One-time"}</span>
                      </button>

                      {bill.autoPay && (
                        <span className="text-[9px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.2 rounded flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5" /> AutoPay
                        </span>
                      )}

                      {isDueWithin3Days && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold border flex items-center gap-1 ${
                          diffDays < 0
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : diffDays === 0
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}>
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {diffDays < 0
                            ? `Overdue (${Math.abs(diffDays)}d)`
                            : diffDays === 0
                            ? "Due Today!"
                            : diffDays === 1
                            ? "Due Tomorrow!"
                            : `Due in ${diffDays} days`}
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Due {bill.dueDate} • {bill.category} • {bill.recurringFrequency} {isRecurring && "• Auto-rolls next month"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-extrabold text-sm text-indigo-400">
                    ₱{bill.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => onDeleteBill(bill.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Bill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      </div>
    </div>
  );
};
