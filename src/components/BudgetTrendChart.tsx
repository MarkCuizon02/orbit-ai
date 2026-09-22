import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { BillItem } from "../types";
import {
  TrendingUp,
  TrendingDown,
  LineChart as LineChartIcon,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  DollarSign,
  PieChart,
} from "lucide-react";

interface BudgetTrendChartProps {
  bills: BillItem[];
  monthlyIncome?: number;
  darkMode?: boolean;
}

interface MonthTrendPoint {
  month: string;
  fullMonth: string;
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
}

export const BudgetTrendChart: React.FC<BudgetTrendChartProps> = ({
  bills,
  monthlyIncome = 225000,
  darkMode = true,
}) => {
  const [selectedView, setSelectedView] = useState<"all" | "savings">("all");

  // Calculate current month's total fixed expenses from bills
  const currentTotalExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
  const baseIncome = monthlyIncome > 0 ? monthlyIncome : 225000;

  // Generate 6-Month Historical Data Points leading up to the current month (Jul 2026)
  const monthNames = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const fullMonthNames = [
    "February 2026",
    "March 2026",
    "April 2026",
    "May 2026",
    "June 2026",
    "July 2026 (Current)",
  ];

  // Variations simulating real historical trends leading to current bill state
  const historicalVariations = [
    { incomeFactor: 0.92, expenseFactor: 0.88 }, // Feb
    { incomeFactor: 0.95, expenseFactor: 0.91 }, // Mar
    { incomeFactor: 0.98, expenseFactor: 0.85 }, // Apr
    { incomeFactor: 1.00, expenseFactor: 0.94 }, // May
    { incomeFactor: 1.00, expenseFactor: 0.97 }, // Jun
    { incomeFactor: 1.00, expenseFactor: 1.00 }, // Jul (Current)
  ];

  const trendData: MonthTrendPoint[] = monthNames.map((month, idx) => {
    const varItem = historicalVariations[idx];
    const income = Math.round(baseIncome * varItem.incomeFactor);
    const expenses = idx === 5 ? currentTotalExpenses : Math.round(currentTotalExpenses * varItem.expenseFactor);
    const netSavings = Math.max(0, income - expenses);
    const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

    return {
      month,
      fullMonth: fullMonthNames[idx],
      income,
      expenses,
      netSavings,
      savingsRate,
    };
  });

  // Calculate summary statistics
  const total6MonthIncome = trendData.reduce((acc, d) => acc + d.income, 0);
  const total6MonthExpenses = trendData.reduce((acc, d) => acc + d.expenses, 0);
  const total6MonthSavings = total6MonthIncome - total6MonthExpenses;
  const avgSavingsRate = total6MonthIncome > 0 ? (total6MonthSavings / total6MonthIncome) * 100 : 0;

  // Growth comparing Feb to Jul
  const febExpenses = trendData[0].expenses;
  const julExpenses = trendData[5].expenses;
  const expenseGrowthPct = febExpenses > 0 ? ((julExpenses - febExpenses) / febExpenses) * 100 : 0;

  const formatPHP = (val: number) => {
    return `₱${val.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthTrendPoint = payload[0].payload;
      return (
        <div className="p-3.5 rounded-2xl bg-zinc-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-xs font-sans space-y-2 z-50">
          <p className="font-extrabold text-zinc-100 border-b border-white/10 pb-1 flex justify-between items-center gap-4">
            <span>{data.fullMonth}</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {data.savingsRate.toFixed(1)}% Saved
            </span>
          </p>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                Monthly Income:
              </span>
              <strong className="text-white">{formatPHP(data.income)}</strong>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Total Expenses:
              </span>
              <strong className="text-rose-300">{formatPHP(data.expenses)}</strong>
            </div>

            <div className="flex items-center justify-between gap-6 pt-1 border-t border-white/10">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Net Liquid Surplus:
              </span>
              <strong className="text-emerald-400 font-black">{formatPHP(data.netSavings)}</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-3xl border relative overflow-hidden backdrop-blur-md transition-all ${
        darkMode
          ? "bg-slate-900/80 border-slate-800 text-zinc-100 shadow-xl"
          : "bg-white border-slate-200 text-zinc-900 shadow-md"
      }`}
    >
      {/* Background Accent Lines */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-tight flex items-center gap-2">
              <span>6-Month Budget & Expense Trend</span>
            </h2>
            <p className="text-xs text-slate-400">
              Historical income vs. recurring expense trajectory in Philippine Peso (PHP).
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center bg-zinc-950/60 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setSelectedView("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedView === "all"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Income vs Expenses
          </button>
          <button
            onClick={() => setSelectedView("savings")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedView === "savings"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Net Savings Trajectory
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 relative z-10">
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
            6-Month Total Savings
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl md:text-2xl font-black font-mono text-emerald-400">
              {formatPHP(total6MonthSavings)}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +{avgSavingsRate.toFixed(1)}%
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">
            Accumulated liquid cash buffer over 6 months
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-indigo-400">
            Average Savings Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl md:text-2xl font-black font-mono text-indigo-300">
              {avgSavingsRate.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-indigo-400 font-bold">
              Target: 20%+
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">
            Consistent cashflow retained each month
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
            Expense Growth (Feb - Jul)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl md:text-2xl font-black font-mono ${expenseGrowthPct <= 15 ? "text-emerald-400" : "text-amber-300"}`}>
              {expenseGrowthPct >= 0 ? "+" : ""}{expenseGrowthPct.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-zinc-400 font-bold">
              6-mo shift
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">
            Controlled overhead expansion rate
          </span>
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="p-4 rounded-2xl bg-zinc-950/50 border border-white/5 relative z-10">
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#a1a1aa"
                tick={{ fontSize: 11, fontFamily: "monospace" }}
                axisLine={{ stroke: "#3f3f46" }}
                tickLine={false}
              />
              <YAxis
                stroke="#a1a1aa"
                tick={{ fontSize: 10, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `₱${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />

              {selectedView === "all" ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Monthly Income"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#incomeGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Total Expenses"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey="netSavings"
                  name="Net Liquid Surplus"
                  stroke="#34d399"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#savingsGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Footer */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 mt-2 border-t border-white/5 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
            <span className="text-zinc-300">Income Benchmark</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="text-zinc-300">Fixed Recurring Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            <span className="text-zinc-300">Net Surplus / Savings</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
