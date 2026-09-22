import React, { useState, useMemo } from "react";
import { BillItem } from "../types";
import { 
  Calculator, 
  TrendingDown, 
  Zap, 
  Flame, 
  Snowflake, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  DollarSign,
  PieChart,
  Sparkles
} from "lucide-react";

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  apr: number; // percentage, e.g., 24%
  minPayment: number;
}

interface DebtPaydownCalculatorCardProps {
  bills: BillItem[];
  darkMode: boolean;
}

export const DebtPaydownCalculatorCard: React.FC<DebtPaydownCalculatorCardProps> = ({
  bills,
  darkMode,
}) => {
  // Strategy: snowball (lowest balance first) vs avalanche (highest APR first)
  const [strategy, setStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [extraPayment, setExtraPayment] = useState<number>(2000);

  // Form state for adding custom debt
  const [newDebtName, setNewDebtName] = useState("");
  const [newDebtBalance, setNewDebtBalance] = useState<number | "">(25000);
  const [newDebtApr, setNewDebtApr] = useState<number | "">(24);
  const [newDebtMinPayment, setNewDebtMinPayment] = useState<number | "">(1500);
  const [showAddForm, setShowAddForm] = useState(false);

  // Initial list of debts
  const [debts, setDebts] = useState<DebtItem[]>([
    { id: "d1", name: "Credit Card A (BPI)", balance: 35000, apr: 24.0, minPayment: 1800 },
    { id: "d2", name: "Personal Loan (BDO)", balance: 85000, apr: 14.5, minPayment: 3200 },
    { id: "d3", name: "Store Installment Card", balance: 12000, apr: 18.0, minPayment: 1000 },
  ]);

  // Sync / Import debts from app's Bills list with 'Debt' category
  const handleImportBills = () => {
    const debtBills = bills.filter((b) => b.category === "Debt");
    if (debtBills.length === 0) return;

    const imported: DebtItem[] = debtBills.map((b, idx) => ({
      id: `imported-${Date.now()}-${idx}`,
      name: b.name,
      balance: b.amount * 10, // estimated balance baseline
      apr: 21.0, // standard default credit APR
      minPayment: Math.max(500, Math.round(b.amount)),
    }));

    setDebts((prev) => {
      // Avoid exact name duplicates
      const existingNames = new Set(prev.map((d) => d.name.toLowerCase()));
      const filteredNew = imported.filter((d) => !existingNames.has(d.name.toLowerCase()));
      return [...prev, ...filteredNew];
    });
  };

  const handleAddDebt = () => {
    if (!newDebtName.trim()) return;
    const newDebt: DebtItem = {
      id: `debt-${Date.now()}`,
      name: newDebtName.trim(),
      balance: Number(newDebtBalance) || 10000,
      apr: Number(newDebtApr) || 18,
      minPayment: Number(newDebtMinPayment) || 500,
    };
    setDebts((prev) => [...prev, newDebt]);
    setNewDebtName("");
    setNewDebtBalance(25000);
    setNewDebtApr(24);
    setNewDebtMinPayment(1500);
    setShowAddForm(false);
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Amortization Engine Simulator function
  const simulatePayoff = (
    debtList: DebtItem[],
    strat: "avalanche" | "snowball",
    monthlyExtra: number
  ) => {
    if (debtList.length === 0) {
      return {
        totalMonths: 0,
        totalInterestPaid: 0,
        totalPrincipal: 0,
        payoffOrder: [],
        monthByMonthHistory: [],
      };
    }

    // Clone debts for mutation in loop
    let activeDebts = debtList.map((d) => ({ ...d, currentBalance: d.balance }));
    const totalPrincipal = debtList.reduce((acc, d) => acc + d.balance, 0);

    let monthCount = 0;
    let totalInterestPaid = 0;
    const payoffOrder: { name: string; monthPaidOff: number; interestPaid: number }[] = [];
    const maxMonthsLimit = 360; // 30-year safety ceiling

    // Sort order based on strategy
    const getTargetDebtIndex = (list: typeof activeDebts) => {
      const unpaidIndices = list
        .map((d, idx) => ({ idx, ...d }))
        .filter((d) => d.currentBalance > 0.01);

      if (unpaidIndices.length === 0) return -1;

      if (strat === "avalanche") {
        // Highest APR first
        unpaidIndices.sort((a, b) => b.apr - a.apr);
      } else {
        // Lowest balance first (Snowball)
        unpaidIndices.sort((a, b) => a.currentBalance - b.currentBalance);
      }
      return unpaidIndices[0].idx;
    };

    while (monthCount < maxMonthsLimit) {
      const unpaidCount = activeDebts.filter((d) => d.currentBalance > 0.01).length;
      if (unpaidCount === 0) break;

      monthCount++;

      // 1. Accrue monthly interest on remaining balances
      activeDebts.forEach((d) => {
        if (d.currentBalance > 0.01) {
          const monthlyRate = d.apr / 100 / 12;
          const interest = d.currentBalance * monthlyRate;
          totalInterestPaid += interest;
          d.currentBalance += interest;
        }
      });

      // 2. Calculate minimum payments across all debts
      let totalPoolAvailable = monthlyExtra;

      // Apply minimum payments
      activeDebts.forEach((d) => {
        if (d.currentBalance > 0.01) {
          const payAmt = Math.min(d.currentBalance, d.minPayment);
          d.currentBalance -= payAmt;
          if (d.currentBalance <= 0.01) {
            d.currentBalance = 0;
            payoffOrder.push({
              name: d.name,
              monthPaidOff: monthCount,
              interestPaid: Math.round(totalInterestPaid),
            });
          }
        }
      });

      // 3. Roll extra cash plus freed minimum payments onto priority target debt
      let remainingExtra = totalPoolAvailable;
      while (remainingExtra > 0) {
        const targetIdx = getTargetDebtIndex(activeDebts);
        if (targetIdx === -1) break;

        const target = activeDebts[targetIdx];
        const payAmt = Math.min(target.currentBalance, remainingExtra);
        target.currentBalance -= payAmt;
        remainingExtra -= payAmt;

        if (target.currentBalance <= 0.01) {
          target.currentBalance = 0;
          if (!payoffOrder.some((p) => p.name === target.name)) {
            payoffOrder.push({
              name: target.name,
              monthPaidOff: monthCount,
              interestPaid: Math.round(totalInterestPaid),
            });
          }
        }
      }
    }

    return {
      totalMonths: monthCount,
      totalInterestPaid: Math.round(totalInterestPaid),
      totalPrincipal,
      payoffOrder,
    };
  };

  // Perform simulation calculations memoized
  const simulationResults = useMemo(() => {
    const selectedStratResult = simulatePayoff(debts, strategy, extraPayment);
    const snowballResult = simulatePayoff(debts, "snowball", extraPayment);
    const avalancheResult = simulatePayoff(debts, "avalanche", extraPayment);
    const minOnlyResult = simulatePayoff(debts, "avalanche", 0);

    return {
      current: selectedStratResult,
      snowball: snowballResult,
      avalanche: avalancheResult,
      minOnly: minOnlyResult,
    };
  }, [debts, strategy, extraPayment]);

  const totalBalance = debts.reduce((acc, d) => acc + d.balance, 0);
  const totalMinPayment = debts.reduce((acc, d) => acc + d.minPayment, 0);

  const formatYearsMonths = (totalM: number) => {
    if (totalM <= 0) return "0 Months";
    const yrs = Math.floor(totalM / 12);
    const mos = totalM % 12;
    if (yrs === 0) return `${mos} Month${mos > 1 ? "s" : ""}`;
    if (mos === 0) return `${yrs} Year${yrs > 1 ? "s" : ""}`;
    return `${yrs} Yr${yrs > 1 ? "s" : ""} ${mos} Mo${mos > 1 ? "s" : ""}`;
  };

  const getPayoffDateStr = (totalM: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + totalM);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const interestSavingsVsMinOnly = Math.max(
    0,
    simulationResults.minOnly.totalInterestPaid - simulationResults.current.totalInterestPaid
  );

  const monthsSavedVsMinOnly = Math.max(
    0,
    simulationResults.minOnly.totalMonths - simulationResults.current.totalMonths
  );

  return (
    <div
      className={`p-6 rounded-3xl border transition-all ${
        darkMode
          ? "bg-slate-900 border-slate-800 shadow-xl text-white"
          : "bg-white border-slate-200 shadow-md text-slate-900"
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Calculator className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight">
                Debt Paydown Calculator & Strategy Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Snowball vs Avalanche
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate payoff timelines, compare strategy interest savings, and optimize debt-freedom dates.
            </p>
          </div>
        </div>

        {/* Sync from Bills Button */}
        <button
          onClick={handleImportBills}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Import Debt Bills ({bills.filter((b) => b.category === "Debt").length})</span>
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Debt Principal
          </span>
          <span className="text-xl font-black font-mono text-rose-400">
            ₱{totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            {debts.length} active liability accounts
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Estimated Payoff Date
          </span>
          <span className="text-xl font-black font-mono text-emerald-400">
            {getPayoffDateStr(simulationResults.current.totalMonths)}
          </span>
          <span className="text-[10px] text-emerald-300/80 block mt-1 font-mono font-bold">
            {formatYearsMonths(simulationResults.current.totalMonths)} ({simulationResults.current.totalMonths} mos)
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Interest Expense
          </span>
          <span className="text-xl font-black font-mono text-amber-400">
            ₱{simulationResults.current.totalInterestPaid.toLocaleString("en-US")}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">
            Over full amortization lifecycle
          </span>
        </div>

        <div className={`p-4 rounded-2xl border ${darkMode ? "bg-emerald-950/20 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Interest Saved vs Min-Only
          </span>
          <span className="text-xl font-black font-mono text-emerald-400">
            ₱{interestSavingsVsMinOnly.toLocaleString("en-US")}
          </span>
          <span className="text-[10px] text-emerald-300 block mt-1 font-mono font-bold">
            Shaves off {formatYearsMonths(monthsSavedVsMinOnly)}
          </span>
        </div>
      </div>

      {/* Controls: Strategy Selector & Extra Monthly Payment Slider */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
        {/* Strategy Selector Toggle */}
        <div className="md:col-span-7">
          <label className="block text-xs font-bold text-slate-300 mb-2">
            Paydown Strategy Algorithm
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setStrategy("avalanche")}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                strategy === "avalanche"
                  ? "bg-amber-500/20 border-amber-500 text-white shadow-md"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Flame className={`w-5 h-5 shrink-0 mt-0.5 ${strategy === "avalanche" ? "text-amber-400" : "text-slate-500"}`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black">Debt Avalanche</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-mono font-bold">
                    Mathematically Optimal
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Targets highest interest rate (APR %) first to minimize total interest cost.
                </p>
              </div>
            </button>

            <button
              onClick={() => setStrategy("snowball")}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                strategy === "snowball"
                  ? "bg-indigo-500/20 border-indigo-500 text-white shadow-md"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Snowflake className={`w-5 h-5 shrink-0 mt-0.5 ${strategy === "snowball" ? "text-indigo-400" : "text-slate-500"}`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black">Debt Snowball</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 font-mono font-bold">
                    Psychological Wins
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Targets lowest balance account first to build quick momentum and clear accounts.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Extra Payment Slider & Input */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">
                Extra Monthly Paydown Boost
              </label>
              <span className="text-xs font-mono font-black text-amber-400">
                +₱{extraPayment.toLocaleString("en-US")} / mo
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              Monthly budget surplus added on top of total minimum payments (₱{totalMinPayment.toLocaleString("en-US")}).
            </p>
            <input
              type="range"
              min="0"
              max="20000"
              step="500"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2">
            <span>+₱0</span>
            <span>+₱5,000</span>
            <span>+₱10,000</span>
            <span>+₱20,000</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Accounts Ledger Table + Payoff Strategy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Debt Accounts List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
              <span>Liability Account Balances</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {debts.length} Accounts
              </span>
            </h3>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? "Cancel" : "Add Debt"}</span>
            </button>
          </div>

          {/* Add Debt Inline Form */}
          {showAddForm && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 animate-fade-in space-y-3">
              <h4 className="text-xs font-bold text-amber-300">Add New Liability / Credit Account</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Account Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Citibank Visa Credit Card"
                    value={newDebtName}
                    onChange={(e) => setNewDebtName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Current Outstanding Balance (₱)</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={newDebtBalance}
                    onChange={(e) => setNewDebtBalance(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Interest Rate (APR % per year)</label>
                  <input
                    type="number"
                    placeholder="24"
                    step="0.1"
                    value={newDebtApr}
                    onChange={(e) => setNewDebtApr(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Minimum Monthly Payment (₱)</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={newDebtMinPayment}
                    onChange={(e) => setNewDebtMinPayment(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleAddDebt}
                disabled={!newDebtName.trim()}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs font-mono transition-all"
              >
                Save Account to Calculator
              </button>
            </div>
          )}

          {/* List of Accounts */}
          {debts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-slate-200">Zero Debt Recorded!</p>
              <p className="text-[11px] text-slate-500">Add debt accounts or click "Import Debt Bills" above.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {debts.map((d, index) => {
                const percentOfTotal = totalBalance > 0 ? (d.balance / totalBalance) * 100 : 0;

                return (
                  <div
                    key={d.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      darkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-white truncate">
                          {d.name}
                        </span>
                        <span className="font-mono font-black text-xs text-rose-400 shrink-0">
                          ₱{d.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1.5">
                        <span>
                          APR: <strong className="text-amber-400">{d.apr}%</strong> • Min: ₱{d.minPayment.toLocaleString("en-US")}
                        </span>
                        <span>{percentOfTotal.toFixed(1)}% of total</span>
                      </div>

                      {/* Visual Balance Proportion Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500/80 rounded-full"
                          style={{ width: `${Math.min(100, percentOfTotal)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteDebt(d.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                      title="Remove Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Strategy Comparison & Payoff Order */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className={`p-5 rounded-2xl border h-full flex flex-col justify-between ${
            darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
          }`}>
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="font-extrabold text-xs text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Strategy Comparison & Sequence
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                  {strategy === "avalanche" ? "Avalanche Mode" : "Snowball Mode"}
                </span>
              </div>

              {/* Head-to-head Strategy Matrix */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className={`p-3 rounded-xl border text-center ${
                  strategy === "avalanche"
                    ? "bg-amber-500/20 border-amber-500/50"
                    : "bg-slate-900 border-slate-800 opacity-70"
                }`}>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-0.5">
                    Avalanche (APR)
                  </span>
                  <span className="text-xs font-black font-mono text-amber-400 block">
                    {formatYearsMonths(simulationResults.avalanche.totalMonths)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ₱{simulationResults.avalanche.totalInterestPaid.toLocaleString("en-US")} int.
                  </span>
                </div>

                <div className={`p-3 rounded-xl border text-center ${
                  strategy === "snowball"
                    ? "bg-indigo-500/20 border-indigo-500/50"
                    : "bg-slate-900 border-slate-800 opacity-70"
                }`}>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-0.5">
                    Snowball (Balance)
                  </span>
                  <span className="text-xs font-black font-mono text-indigo-400 block">
                    {formatYearsMonths(simulationResults.snowball.totalMonths)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ₱{simulationResults.snowball.totalInterestPaid.toLocaleString("en-US")} int.
                  </span>
                </div>
              </div>

              {/* Payoff Sequence Order List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Target Knockout Order:
                </span>

                {debts.length === 0 ? (
                  <p className="text-xs text-slate-500">No active debts to order.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {/* Sort debts according to chosen strategy priority order */}
                    {[...debts]
                      .sort((a, b) => strategy === "avalanche" ? b.apr - a.apr : a.balance - b.balance)
                      .map((d, idx) => (
                        <div
                          key={d.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-slate-200 truncate max-w-[140px]">
                              {d.name}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-amber-400 font-bold">
                            {strategy === "avalanche" ? `${d.apr}% APR` : `₱${d.balance.toLocaleString("en-US")}`}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Insight Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Adding <strong>+₱{extraPayment.toLocaleString("en-US")}</strong> extra per month saves{" "}
                <strong className="text-emerald-400 font-bold">₱{interestSavingsVsMinOnly.toLocaleString("en-US")}</strong> in total interest!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
