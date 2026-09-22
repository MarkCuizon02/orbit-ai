import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { BillItem } from "../types";
import {
  PieChart as PieIcon,
  Wallet,
  TrendingUp,
  Percent,
  ShieldCheck,
  AlertTriangle,
  Edit3,
  Check,
  X,
  ArrowUpRight,
  Info,
} from "lucide-react";

interface BudgetVisualizationProps {
  bills: BillItem[];
  monthlyIncome?: number;
  darkMode?: boolean;
  onUpdateMonthlyIncome?: (newIncome: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#6366f1", // Indigo
  Utilities: "#06b6d4", // Cyan
  Subscription: "#a855f7", // Purple
  Insurance: "#10b981", // Emerald
  Debt: "#f59e0b", // Amber
  Other: "#f43f5e", // Rose
};

const DEFAULT_CATEGORY_COLOR = "#8b5cf6";

export const BudgetVisualization: React.FC<BudgetVisualizationProps> = ({
  bills,
  monthlyIncome = 225000,
  darkMode = true,
  onUpdateMonthlyIncome,
}) => {
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncomeInput, setTempIncomeInput] = useState(monthlyIncome.toString());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const currentIncome = monthlyIncome > 0 ? monthlyIncome : 225000;

  // Aggregate bills by category
  const categoryMap: Record<string, number> = {};
  let totalExpenses = 0;

  bills.forEach((bill) => {
    categoryMap[bill.category] = (categoryMap[bill.category] || 0) + bill.amount;
    totalExpenses += bill.amount;
  });

  const pieData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    value: categoryMap[cat],
    color: CATEGORY_COLORS[cat] || DEFAULT_CATEGORY_COLOR,
    percentageOfExpenses: totalExpenses > 0 ? (categoryMap[cat] / totalExpenses) * 100 : 0,
    percentageOfIncome: (categoryMap[cat] / currentIncome) * 100,
  }));

  const expenseRatio = currentIncome > 0 ? (totalExpenses / currentIncome) * 100 : 0;
  const remainingIncome = currentIncome - totalExpenses;

  // Currency Formatter for Philippine Peso
  const formatPHP = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleSaveIncome = () => {
    const parsed = parseFloat(tempIncomeInput);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateMonthlyIncome?.(parsed);
      setIsEditingIncome(false);
    }
  };

  const getRatioHealth = () => {
    if (expenseRatio <= 25) {
      return {
        label: "Optimal Budget Ratio",
        status: "exceptional",
        color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        barColor: "from-emerald-500 to-teal-400",
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        tip: "Your fixed expenses occupy less than 25% of your income. You have high liquidity for investments and savings.",
      };
    } else if (expenseRatio <= 40) {
      return {
        label: "Healthy Expense Balance",
        status: "healthy",
        color: "text-indigo-300 bg-indigo-500/15 border-indigo-500/30",
        barColor: "from-indigo-500 to-cyan-400",
        icon: <TrendingUp className="w-4 h-4 text-indigo-400" />,
        tip: "Your monthly overhead is well-balanced. Ensure 20% of remaining income flows directly into long-term savings.",
      };
    } else if (expenseRatio <= 60) {
      return {
        label: "Moderate Overhead Ratio",
        status: "moderate",
        color: "text-amber-300 bg-amber-500/15 border-amber-500/30",
        barColor: "from-amber-500 to-orange-400",
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        tip: "Overhead accounts for over 40% of income. Review recurring subscriptions for potential savings.",
      };
    } else {
      return {
        label: "High Fixed Expense Burden",
        status: "high",
        color: "text-rose-300 bg-rose-500/15 border-rose-500/30",
        barColor: "from-rose-500 to-red-600",
        icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
        tip: "Fixed expenses exceed 60% of monthly income. Consider prioritizing debt payoffs and optimizing fixed bills.",
      };
    }
  };

  const health = getRatioHealth();

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3.5 rounded-2xl bg-zinc-950/95 border border-white/10 shadow-xl backdrop-blur-md text-xs font-sans space-y-1 z-50">
          <div className="flex items-center gap-2 font-bold text-zinc-100">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.name}</span>
          </div>
          <p className="font-mono font-extrabold text-indigo-400 text-sm">
            {formatPHP(data.value)}
          </p>
          <div className="text-[11px] font-mono text-zinc-400 space-y-0.5 pt-1 border-t border-white/10">
            <p className="flex justify-between gap-3">
              <span>% of Total Expenses:</span>
              <strong className="text-zinc-200">{data.percentageOfExpenses.toFixed(1)}%</strong>
            </p>
            <p className="flex justify-between gap-3">
              <span>% of Monthly Income:</span>
              <strong className="text-emerald-400">{data.percentageOfIncome.toFixed(1)}%</strong>
            </p>
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
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-tight flex items-center gap-2">
              <span>Budget & Expense Allocation</span>
            </h2>
            <p className="text-xs text-slate-400">
              Recurring bills visual breakdown & income ratio analysis in Philippine Peso (PHP).
            </p>
          </div>
        </div>

        {/* Income Editor Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isEditingIncome ? (
            <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-2xl border border-indigo-500/40">
              <span className="text-xs font-mono font-bold pl-2 text-indigo-400">₱</span>
              <input
                type="number"
                value={tempIncomeInput}
                onChange={(e) => setTempIncomeInput(e.target.value)}
                className="w-28 bg-transparent text-xs font-mono font-bold text-white focus:outline-none px-1"
                placeholder="Monthly Income"
              />
              <button
                onClick={handleSaveIncome}
                className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Save Income"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setTempIncomeInput(currentIncome.toString());
                  setIsEditingIncome(false);
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingIncome(true)}
              className="px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-all active:scale-95"
              title="Click to edit baseline monthly income"
            >
              <Wallet className="w-3.5 h-3.5 text-indigo-400" />
              <span>Income: {formatPHP(currentIncome)}</span>
              <Edit3 className="w-3 h-3 text-zinc-500" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Income Percentage & Ratio Highlight Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 relative z-10">
        <div className="md:col-span-8 p-5 rounded-2xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Expense-to-Income Ratio
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl md:text-4xl font-extrabold font-mono text-emerald-400">
                  {expenseRatio.toFixed(1)}%
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  of Total Monthly Income
                </span>
              </div>
            </div>

            <div className={`self-start sm:self-auto px-3 py-1.5 rounded-2xl border text-xs font-mono font-bold flex items-center gap-2 ${health.color}`}>
              {health.icon}
              <span>{health.label}</span>
            </div>
          </div>

          {/* Progress Bar Visualizing Income Utilization */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
              <span>Fixed Recurring Overhead ({formatPHP(totalExpenses)})</span>
              <span>Available Liquidity ({formatPHP(remainingIncome)})</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden p-0.5 border border-white/5 flex">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${health.barColor} transition-all duration-500`}
                style={{ width: `${Math.min(expenseRatio, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-zinc-400 flex items-start gap-2 pt-1 border-t border-white/5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>{health.tip}</span>
          </p>
        </div>

        {/* Quick Numbers Column */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3">
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col justify-center">
            <span className="text-[10px] font-mono font-bold uppercase text-indigo-400">
              Total Monthly Income
            </span>
            <span className="text-lg md:text-xl font-extrabold font-mono text-white mt-1">
              {formatPHP(currentIncome)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-center">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
              Disposable Liquidity
            </span>
            <span className="text-lg md:text-xl font-extrabold font-mono text-emerald-300 mt-1">
              {formatPHP(remainingIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Visualization Grid: Pie Chart + Category Ledger Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        {/* Recharts Pie Chart Container */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-950/40 border border-white/5 relative min-h-[280px]">
          {pieData.length > 0 ? (
            <div className="w-full h-64 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveCategory(pieData[index].name)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={darkMode ? "#09090b" : "#ffffff"}
                        strokeWidth={2}
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Center Overlay Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                  {activeCategory || "Total Fixed"}
                </span>
                <span className="text-base font-extrabold font-mono text-white">
                  {activeCategory
                    ? formatPHP(categoryMap[activeCategory] || 0)
                    : formatPHP(totalExpenses)}
                </span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">
                  {activeCategory && totalExpenses > 0
                    ? `${(((categoryMap[activeCategory] || 0) / totalExpenses) * 100).toFixed(1)}% of expenses`
                    : `${expenseRatio.toFixed(1)}% of income`}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No active recurring bills found. Add expenses above to visualize budget allocation.
            </div>
          )}
        </div>

        {/* Category Breakdown Ledger */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-xs font-bold text-zinc-300">Expense Category Breakdown</span>
            <span className="text-[10px] font-mono text-zinc-500">% Income | Monthly Total</span>
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {pieData.map((item) => {
              const isHovered = activeCategory === item.name;
              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveCategory(item.name)}
                  onMouseLeave={() => setActiveCategory(null)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isHovered
                      ? "bg-white/10 border-indigo-500/50 shadow-md"
                      : "bg-zinc-950/40 border-white/5 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3.5 h-3.5 rounded-lg shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-100">{item.name}</p>
                      <p className="text-[10px] font-mono text-zinc-400">
                        {item.percentageOfExpenses.toFixed(1)}% of recurring expenses
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-extrabold font-mono text-indigo-300">
                      {formatPHP(item.value)}
                    </p>
                    <p className="text-[10px] font-mono text-emerald-400 font-semibold">
                      {item.percentageOfIncome.toFixed(1)}% of income
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
