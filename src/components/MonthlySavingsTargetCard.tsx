import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BillItem } from "../types";
import {
  Target,
  PiggyBank,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Zap,
} from "lucide-react";

interface MonthlySavingsTargetCardProps {
  bills: BillItem[];
  monthlyIncome?: number;
  darkMode?: boolean;
  onTriggerToast?: (title: string, desc?: string, type?: "success" | "ai" | "streak" | "warning") => void;
}

export const MonthlySavingsTargetCard: React.FC<MonthlySavingsTargetCardProps> = ({
  bills,
  monthlyIncome = 225000,
  darkMode = true,
  onTriggerToast,
}) => {
  // Load saved target percentage from localStorage or default to 20%
  const [targetPercentage, setTargetPercentage] = useState<number>(() => {
    const saved = localStorage.getItem("orbit_monthly_savings_target_pct");
    return saved ? Number(saved) : 20;
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempPercentage, setTempPercentage] = useState<number>(targetPercentage);

  useEffect(() => {
    localStorage.setItem("orbit_monthly_savings_target_pct", targetPercentage.toString());
  }, [targetPercentage]);

  const currentIncome = monthlyIncome > 0 ? monthlyIncome : 225000;
  const totalFixedExpenses = bills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaidExpenses = bills.filter((b) => b.status === "paid").reduce((acc, b) => acc + b.amount, 0);

  // Financial calculations
  const targetSavingsAmount = (currentIncome * targetPercentage) / 100;
  const projectedDisposableSurplus = currentIncome - totalFixedExpenses;
  const currentCashInAccount = currentIncome - totalPaidExpenses;

  // Progress calculations based on projected disposable surplus vs target amount
  const progressPercentage = targetSavingsAmount > 0
    ? Math.min(100, Math.max(0, (projectedDisposableSurplus / targetSavingsAmount) * 100))
    : 0;

  const actualSavingsRatio = currentIncome > 0
    ? (projectedDisposableSurplus / currentIncome) * 100
    : 0;

  const savingsShortfall = targetSavingsAmount - projectedDisposableSurplus;

  const formatPHP = (val: number) => {
    return `₱${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleApplyPreset = (pct: number) => {
    setTargetPercentage(pct);
    setTempPercentage(pct);
    setIsEditing(false);
    onTriggerToast?.(
      "Savings Target Updated",
      `Monthly savings target set to ${pct}% of income (${formatPHP((currentIncome * pct) / 100)}).`,
      "success"
    );
  };

  const handleSaveCustomTarget = () => {
    const validPct = Math.min(80, Math.max(1, tempPercentage));
    setTargetPercentage(validPct);
    setIsEditing(false);
    onTriggerToast?.(
      "Target Goal Updated",
      `Monthly savings target adjusted to ${validPct}% (${formatPHP((currentIncome * validPct) / 100)}).`,
      "success"
    );
  };

  const getProgressHealth = () => {
    if (progressPercentage >= 100) {
      return {
        label: "Target Fully Achieved",
        color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        barGradient: "from-emerald-500 via-teal-400 to-cyan-400",
        icon: <Award className="w-4 h-4 text-emerald-400" />,
        tip: `Fantastic job! Your projected net surplus of ${formatPHP(projectedDisposableSurplus)} surpasses your ${targetPercentage}% target.`,
      };
    } else if (progressPercentage >= 75) {
      return {
        label: "Near Goal Milestone",
        color: "text-indigo-300 bg-indigo-500/15 border-indigo-500/30",
        barGradient: "from-indigo-500 via-purple-500 to-indigo-400",
        icon: <TrendingUp className="w-4 h-4 text-indigo-400" />,
        tip: `You are at ${progressPercentage.toFixed(0)}% of your savings goal. Trim minor subscriptions to reach 100%.`,
      };
    } else if (progressPercentage >= 50) {
      return {
        label: "Moderate Progress",
        color: "text-amber-300 bg-amber-500/15 border-amber-500/30",
        barGradient: "from-amber-500 via-orange-400 to-yellow-400",
        icon: <Zap className="w-4 h-4 text-amber-400" />,
        tip: `Projected surplus covers ${progressPercentage.toFixed(0)}% of target. Shortfall: ${formatPHP(savingsShortfall)}.`,
      };
    } else {
      return {
        label: "Action Required",
        color: "text-rose-300 bg-rose-500/15 border-rose-500/30",
        barGradient: "from-rose-500 via-red-500 to-orange-500",
        icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
        tip: `Fixed bills swallow high income. Review recurring expenses to free up liquidity toward your ${targetPercentage}% target.`,
      };
    }
  };

  const health = getProgressHealth();

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
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg tracking-tight flex items-center gap-2">
              <span>Monthly Savings Target</span>
            </h2>
            <p className="text-xs text-slate-400">
              Set your income target percentage and monitor monthly goal completion.
            </p>
          </div>
        </div>

        {/* Milestone Badge & Edit Control */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-[11px] font-mono font-bold px-3 py-1.5 rounded-2xl border flex items-center gap-1.5 ${health.color}`}>
            {health.icon}
            <span>{health.label}</span>
          </span>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all active:scale-95"
            title="Adjust Savings Target Percentage"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target: {targetPercentage}%</span>
          </button>
        </div>
      </div>

      {/* Target Setting Controls (Expandable) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-2xl bg-zinc-950/80 border border-indigo-500/40 relative z-10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" /> Adjust Target Income Percentage
              </span>
              <span className="text-xs font-mono font-black text-emerald-400">
                {tempPercentage}% = {formatPHP((currentIncome * tempPercentage) / 100)}/mo
              </span>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={tempPercentage}
              onChange={(e) => setTempPercentage(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {[10, 15, 20, 25, 30, 40, 50].map((preset) => (
                  <button
                    key={`preset-${preset}`}
                    onClick={() => handleApplyPreset(preset)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all ${
                      targetPercentage === preset
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "bg-white/5 hover:bg-white/10 text-zinc-300"
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCustomTarget}
                  className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Save Target
                </button>
                <button
                  onClick={() => {
                    setTempPercentage(targetPercentage);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white text-xs transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Target Progress Display */}
      <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Goal Target: {targetPercentage}% of Monthly Income
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl md:text-3xl font-extrabold font-mono text-emerald-400">
                {formatPHP(targetSavingsAmount)}
              </span>
              <span className="text-xs text-zinc-400">
                / month target
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">
              Projected Disposable Surplus
            </span>
            <span className="text-xl md:text-2xl font-black font-mono text-white mt-0.5 block">
              {formatPHP(projectedDisposableSurplus)}
            </span>
            <span className="text-[10px] font-mono text-indigo-400 font-bold">
              {actualSavingsRatio.toFixed(1)}% of total income
            </span>
          </div>
        </div>

        {/* Visual Progress Bar Component */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" /> Savings Target Completion
            </span>
            <span className="font-black text-emerald-400 text-sm font-mono">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="w-full h-4 rounded-full bg-zinc-800/80 overflow-hidden p-0.5 border border-white/10 relative shadow-inner">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 14, mass: 0.8 }}
              className={`h-full rounded-full bg-gradient-to-r ${health.barGradient} relative shadow-md`}
            >
              {/* Shine highlight */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="absolute inset-0 bg-white/25 rounded-full blur-[1px]"
              />
            </motion.div>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
            <span>₱0.00</span>
            <span>Target Goal ({formatPHP(targetSavingsAmount)})</span>
          </div>
        </div>

        {/* Income Distribution Visual Stack */}
        <div className="space-y-1.5 pt-3 border-t border-white/5">
          <div className="flex justify-between text-[11px] font-mono font-semibold text-zinc-400">
            <span>Income Allocation Breakdown</span>
            <span className="text-zinc-300">{actualSavingsRatio.toFixed(1)}% Available Surplus</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5 flex gap-0.5 p-0.5">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(100, (totalFixedExpenses / currentIncome) * 100)}%` }}
              transition={{ type: "spring", stiffness: 40, damping: 12, delay: 0.1 }}
              className="h-full bg-rose-500/80 rounded-l-full"
              title={`Fixed Bills: ${((totalFixedExpenses / currentIncome) * 100).toFixed(1)}%`}
            />
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(100 - (totalFixedExpenses / currentIncome) * 100, Math.max(0, actualSavingsRatio))}%` }}
              transition={{ type: "spring", stiffness: 40, damping: 12, delay: 0.25 }}
              className="h-full bg-emerald-400/90 rounded-r-full"
              title={`Net Surplus: ${actualSavingsRatio.toFixed(1)}%`}
            />
          </div>

          <div className="flex justify-between text-[9px] font-mono text-zinc-500 pt-0.5">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" /> Fixed Overhead ({((totalFixedExpenses / currentIncome) * 100).toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Liquid Surplus ({actualSavingsRatio.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Tip / Insight Footer */}
        <p className="text-xs text-zinc-300 flex items-start gap-2 pt-2 border-t border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{health.tip}</span>
        </p>
      </div>
    </motion.div>
  );
};
