import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { BillItem } from "../types";
import { 
  ShieldCheck, 
  PiggyBank, 
  Target, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Calendar,
  Lock,
  ArrowUpRight
} from "lucide-react";

interface EmergencyFundCardProps {
  bills: BillItem[];
  monthlyIncome?: number;
  darkMode: boolean;
}

export const EmergencyFundCard: React.FC<EmergencyFundCardProps> = ({
  bills,
  monthlyIncome = 225000,
  darkMode,
}) => {
  // Current saved balance in emergency fund
  const [currentSaved, setCurrentSaved] = useState<number>(185000);
  // Selected target duration in months (3 to 6 months recommended)
  const [monthsTarget, setMonthsTarget] = useState<number>(6);
  // Optional deposit modal / quick input state
  const [showDepositInput, setShowDepositInput] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number | "">(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(15000);

  // Calculate monthly baseline obligations from bills
  const monthlyExpenses = useMemo(() => {
    const total = bills.reduce((acc, b) => acc + b.amount, 0);
    return total > 0 ? total : 45000; // fallback default
  }, [bills]);

  // Target Fund Calculation = Monthly Expenses * Selected Months Target
  const targetAmount = useMemo(() => {
    return monthlyExpenses * monthsTarget;
  }, [monthlyExpenses, monthsTarget]);

  // Progress percentage (capped at 100% for bar, but store real float)
  const rawProgress = targetAmount > 0 ? (currentSaved / targetAmount) * 100 : 0;
  const clampedProgress = Math.min(100, Math.max(0, rawProgress));

  // Months of safety buffer unlocked currently
  const monthsCovered = monthlyExpenses > 0 ? (currentSaved / monthlyExpenses) : 0;

  // Remaining gap to reach target goal
  const remainingGap = Math.max(0, targetAmount - currentSaved);

  // Estimated months to reach goal based on monthly contribution
  const monthsToReachGoal = monthlyContribution > 0 && remainingGap > 0 
    ? Math.ceil(remainingGap / monthlyContribution) 
    : 0;

  const handleAddDeposit = () => {
    const amt = Number(depositAmount);
    if (!isNaN(amt) && amt > 0) {
      setCurrentSaved((prev) => prev + amt);
      setDepositAmount(10000);
      setShowDepositInput(false);
    }
  };

  // Status tier naming
  const getFundStatusTier = () => {
    if (monthsCovered >= 6) return { name: "Fort Knox Fortress", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/40" };
    if (monthsCovered >= 3) return { name: "Solid Security Cushion", color: "text-indigo-400", bg: "bg-indigo-500/20 border-indigo-500/40" };
    if (monthsCovered >= 1) return { name: "Starter Safety Buffer", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/40" };
    return { name: "Building Baseline", color: "text-rose-400", bg: "bg-rose-500/20 border-rose-500/40" };
  };

  const statusTier = getFundStatusTier();

  return (
    <div
      className={`p-6 rounded-3xl border transition-all ${
        darkMode
          ? "bg-slate-900 border-slate-800 shadow-xl text-white"
          : "bg-white border-slate-200 shadow-md text-slate-900"
      }`}
    >
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight">
                Emergency Fund Tracker
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusTier.bg} ${statusTier.color}`}>
                {statusTier.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              3 to 6 months liquidity cushion based on current bill obligations (₱{monthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}/mo).
            </p>
          </div>
        </div>

        {/* Deposit Quick Action */}
        <button
          onClick={() => setShowDepositInput(!showDepositInput)}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-mono transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>{showDepositInput ? "Cancel" : "Deposit Funds"}</span>
        </button>
      </div>

      {/* Deposit Input Inline Popover */}
      {showDepositInput && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 mb-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
              <span>Add Capital to Emergency Fund</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              Current: ₱{currentSaved.toLocaleString("en-US")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">₱</span>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="10000"
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono font-bold"
              />
            </div>
            <button
              onClick={handleAddDeposit}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-mono transition-all"
            >
              Confirm Savings
            </button>
          </div>
        </div>
      )}

      {/* Progress & Target Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column: Progress Meter & Animated Bar */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Current Liquidity Reserve
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                ₱{currentSaved.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Goal ({monthsTarget} Months)
              </span>
              <span className="text-lg font-black font-mono text-slate-200">
                ₱{targetAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Animated Progress Bar Container */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-300">
                {clampedProgress.toFixed(1)}% Achieved
              </span>
              <span className="text-slate-400">
                {monthsCovered.toFixed(1)} Months Covered
              </span>
            </div>

            <div className="w-full h-4 rounded-full bg-slate-800/80 p-0.5 border border-slate-700/60 relative overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 relative"
                initial={{ width: 0 }}
                animate={{ width: `${clampedProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Subtle highlight sheen */}
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
              </motion.div>
            </div>

            {/* Target Duration Selector Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono font-bold text-slate-400">
                Set Target Multiplier:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                {[3, 4, 5, 6].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonthsTarget(m)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold transition-all ${
                      monthsTarget === m
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {m} Mos
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Goal Timeline & Recommendations */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className={`p-4 rounded-2xl border h-full flex flex-col justify-between ${
            darkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  Target Goal Projection
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {remainingGap <= 0 ? "Goal Fully Funded!" : `₱${remainingGap.toLocaleString("en-US")} to go`}
                </span>
              </div>

              {/* Monthly Contribution Controller */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Monthly Deposit Speed:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₱{monthlyContribution.toLocaleString("en-US")} / mo
                  </span>
                </div>

                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Payoff Timeline Box */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Fully Funded In:</span>
                </div>
                <span className="font-mono font-black text-emerald-400">
                  {remainingGap <= 0
                    ? "Complete 🎉"
                    : `${monthsToReachGoal} Month${monthsToReachGoal > 1 ? "s" : ""}`}
                </span>
              </div>
            </div>

            {/* Bottom Tip */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Financial planners recommend keeping emergency reserves in high-yield liquid accounts.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Buffer Milestones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          monthsCovered >= 1
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
            : "bg-slate-800/20 border-slate-800 text-slate-500"
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${monthsCovered >= 1 ? "text-emerald-400" : "text-slate-600"}`} />
            <div>
              <span className="text-xs font-extrabold block">1 Month Buffer</span>
              <span className="text-[10px] font-mono">₱{(monthlyExpenses * 1).toLocaleString("en-US")}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold">
            {monthsCovered >= 1 ? "Unlocked" : "In Progress"}
          </span>
        </div>

        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          monthsCovered >= 3
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
            : "bg-slate-800/20 border-slate-800 text-slate-500"
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${monthsCovered >= 3 ? "text-emerald-400" : "text-slate-600"}`} />
            <div>
              <span className="text-xs font-extrabold block">3 Months Core</span>
              <span className="text-[10px] font-mono">₱{(monthlyExpenses * 3).toLocaleString("en-US")}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold">
            {monthsCovered >= 3 ? "Unlocked" : "In Progress"}
          </span>
        </div>

        <div className={`p-3 rounded-2xl border flex items-center justify-between ${
          monthsCovered >= 6
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
            : "bg-slate-800/20 border-slate-800 text-slate-500"
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${monthsCovered >= 6 ? "text-emerald-400" : "text-slate-600"}`} />
            <div>
              <span className="text-xs font-extrabold block">6 Months Fortress</span>
              <span className="text-[10px] font-mono">₱{(monthlyExpenses * 6).toLocaleString("en-US")}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold">
            {monthsCovered >= 6 ? "Unlocked" : "In Progress"}
          </span>
        </div>
      </div>
    </div>
  );
};
