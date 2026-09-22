import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BillItem } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Wallet,
  Calculator,
  Compass,
  ArrowRight,
  Zap,
  Info,
  RefreshCw,
  ShieldCheck,
  PiggyBank,
  PieChart as PieIcon,
  Sliders,
} from "lucide-react";

interface BudgetForecastCardProps {
  bills: BillItem[];
  monthlyIncome?: number;
  darkMode?: boolean;
}

export const BudgetForecastCard: React.FC<BudgetForecastCardProps> = ({
  bills,
  monthlyIncome = 225000,
  darkMode = true,
}) => {
  const [discretionaryBuffer, setDiscretionaryBuffer] = useState<number>(15); // Default 15% buffer
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAiAdvice, setLoadingAiAdvice] = useState<boolean>(false);

  // Date calculations for remaining days in month
  const now = new Date();
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

  // Financial metrics
  const totalFixedExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaidExpenses = bills.filter((b) => b.status === "paid").reduce((acc, b) => acc + b.amount, 0);
  const totalPendingExpenses = bills.filter((b) => b.status !== "paid").reduce((acc, b) => acc + b.amount, 0);

  // Buffer calculation
  const bufferAmount = (monthlyIncome * discretionaryBuffer) / 100;
  
  // Forecast calculations
  const projectedDisposableSurplus = monthlyIncome - totalFixedExpenses;
  const netProjectedLiquidSurplus = projectedDisposableSurplus - bufferAmount;
  const currentCashInAccount = monthlyIncome - totalPaidExpenses;
  const dailyDisposableAllowance = Math.max(0, netProjectedLiquidSurplus / daysRemaining);

  // Recommended allocations (50/30/20 benchmark)
  const targetSavings20Percent = monthlyIncome * 0.20;

  // Formatting helper for PHP
  const formatPHP = (val: number) => {
    return `₱${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleFetchAiForecast = async () => {
    setLoadingAiAdvice(true);
    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "daily_insight",
          prompt: `User Monthly Income: ₱${monthlyIncome}, Total Fixed Bills: ₱${totalFixedExpenses}, Net Disposable Income: ₱${projectedDisposableSurplus}, Days Remaining: ${daysRemaining}. Generate a 2-sentence executive financial forecast advice for the user's cashflow in PHP.`,
        }),
      });
      const data = await response.json();
      if (data.success && data.result) {
        setAiAdvice(data.result.replace(/^Quote:.*\n?/i, "").replace(/^Tip:\s*/i, "").trim());
      } else {
        setAiAdvice(
          `At your current rate, you will hold a net surplus of ${formatPHP(projectedDisposableSurplus)} at month-end. Allocating ${formatPHP(targetSavings20Percent)} into automated savings ensures optimal wealth building.`
        );
      }
    } catch (err) {
      console.warn("AI Forecast fetch fallback:", err);
      setAiAdvice(
        `Your projected month-end surplus is ${formatPHP(projectedDisposableSurplus)}. Maintaining a daily flex budget of ${formatPHP(dailyDisposableAllowance)} will keep your liquid reserves fully protected.`
      );
    } finally {
      setLoadingAiAdvice(false);
    }
  };

  const getSurplusStatusBadge = () => {
    const surplusRatio = (projectedDisposableSurplus / monthlyIncome) * 100;
    if (surplusRatio >= 50) {
      return {
        label: "Exceptional Cashflow",
        bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
      };
    } else if (surplusRatio >= 25) {
      return {
        label: "Healthy Runway",
        bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />,
      };
    } else if (surplusRatio >= 10) {
      return {
        label: "Moderate Margin",
        bg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" />,
      };
    } else {
      return {
        label: "Tight Liquidity Alert",
        bg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
        icon: <TrendingDown className="w-3.5 h-3.5 text-rose-400" />,
      };
    }
  };

  const statusBadge = getSurplusStatusBadge();

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
      {/* Background Accent Gradients */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-tight flex items-center gap-2">
              <span>Month-End Budget & Cashflow Forecast</span>
            </h2>
            <p className="text-xs text-slate-400">
              Projected remaining disposable income, daily spending velocity, and savings targets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusBadge.bg}`}>
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </span>

          <button
            onClick={handleFetchAiForecast}
            disabled={loadingAiAdvice}
            className="px-3 py-1.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            title="Generate AI Financial Trajectory"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${loadingAiAdvice ? "animate-spin" : ""}`} />
            <span>{loadingAiAdvice ? "Analyzing..." : "AI Trajectory"}</span>
          </button>
        </div>
      </div>

      {/* AI Advice Callout (If active) */}
      <AnimatePresence>
        {aiAdvice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/30 to-zinc-950/60 border border-indigo-500/30 relative z-10 space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" /> AI Executive Cashflow Forecast
              </span>
              <button
                onClick={() => setAiAdvice(null)}
                className="text-[10px] text-zinc-400 hover:text-white underline"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs leading-relaxed text-zinc-200">{aiAdvice}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Forecast Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 relative z-10">
        {/* Main Projected Net Disposable Income Card */}
        <div className="md:col-span-7 p-5 rounded-3xl bg-zinc-950/70 border border-emerald-500/30 flex flex-col justify-between space-y-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              <span>Projected End-of-Month Surplus</span>
              <span className="flex items-center gap-1 text-zinc-400">
                <Calendar className="w-3 h-3 text-indigo-400" /> {daysRemaining} days left
              </span>
            </div>
            <div className="mt-2">
              <span className="text-3xl md:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                {formatPHP(projectedDisposableSurplus)}
              </span>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                Net remaining income after settling all ₱{totalFixedExpenses.toLocaleString()} fixed recurring bills.
              </p>
            </div>
          </div>

          {/* Daily Velocity Rate */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Daily Safe Spending Velocity
                </span>
                <span className="text-xs text-zinc-300">
                  Allowable spend per remaining day ({daysRemaining} days)
                </span>
              </div>
            </div>
            <span className="text-base font-extrabold font-mono text-emerald-300">
              {formatPHP(dailyDisposableAllowance)}<span className="text-[10px] text-zinc-400 font-normal">/day</span>
            </span>
          </div>
        </div>

        {/* Current Cash vs Pending Bills Breakdown */}
        <div className="md:col-span-5 grid grid-cols-1 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                Current Cash in Account
              </span>
              <Wallet className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-2xl font-black font-mono text-white mt-1">
              {formatPHP(currentCashInAccount)}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">
              Income ({formatPHP(monthlyIncome)}) - Settled ({formatPHP(totalPaidExpenses)})
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                Pending Overhead Due
              </span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-black font-mono text-amber-300 mt-1">
              {formatPHP(totalPendingExpenses)}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">
              Approaching obligations remaining this month
            </span>
          </div>
        </div>
      </div>

      {/* Discretionary Spending Slider Simulation & 50/30/20 Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Interactive Buffer Simulator */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-zinc-950/50 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-zinc-200">
                Simulate Discretionary Flex Spending Buffer
              </span>
            </div>
            <span className="text-xs font-mono font-extrabold text-indigo-400">
              {discretionaryBuffer}% ({formatPHP(bufferAmount)})
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={40}
            step={5}
            value={discretionaryBuffer}
            onChange={(e) => setDiscretionaryBuffer(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
          />

          {/* Animated Visual Meter for Buffer Allocation */}
          <div className="space-y-1">
            <div className="w-full h-2.5 rounded-full bg-zinc-800 overflow-hidden border border-white/5 relative">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${(discretionaryBuffer / 40) * 100}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-zinc-400">Buffer Reserved:</span>
            <span className="font-bold text-amber-300">{formatPHP(bufferAmount)}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-white/5">
            <span className="text-zinc-400">Net Buffer-Adjusted Liquidity:</span>
            <span className={`font-extrabold ${netProjectedLiquidSurplus >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {formatPHP(netProjectedLiquidSurplus)}
            </span>
          </div>
        </div>

        {/* 20% Wealth & Savings Target */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
            <span className="flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-indigo-400" />
              <span>Recommended 20% Savings Target</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">50/30/20 Rule</span>
          </div>

          <div>
            <span className="text-2xl font-black font-mono text-white">
              {formatPHP(targetSavings20Percent)}
            </span>
            <p className="text-[11px] text-zinc-400 mt-1">
              Target monthly allocation to emergency funds, investments, or high-yield savings.
            </p>
          </div>

          {/* Feasibility Animated Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-zinc-400">Surplus Coverage</span>
              <span className="text-emerald-400 font-bold">
                {Math.min(100, Math.round((projectedDisposableSurplus / targetSavings20Percent) * 100))}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden border border-white/5 relative">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(100, (projectedDisposableSurplus / targetSavings20Percent) * 100)}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 14, delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
              />
            </div>
          </div>

          <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">Savings Feasibility:</span>
            <span className={projectedDisposableSurplus >= targetSavings20Percent ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {projectedDisposableSurplus >= targetSavings20Percent ? "Fully Attainable" : "Partial Capacity"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
