import React, { useState, useEffect } from "react";
import { BillItem } from "../types";
import { 
  Sparkles, 
  Brain, 
  Tag, 
  CheckCircle2, 
  Plus, 
  Search, 
  Bot, 
  ArrowRight, 
  History, 
  BarChart2, 
  DollarSign, 
  AlertCircle, 
  Repeat, 
  Zap,
  RefreshCw,
  Sliders
} from "lucide-react";

interface AIExpenseAnalyzerCardProps {
  bills: BillItem[];
  onAddBill: (b: Omit<BillItem, "id" | "status">) => void;
  onTriggerToast?: (title: string, desc?: string, type?: "success" | "ai" | "streak" | "warning") => void;
  darkMode: boolean;
}

interface AnalysisResult {
  category: "Utilities" | "Housing" | "Subscription" | "Insurance" | "Debt" | "Other";
  confidence: number;
  reasoning: string;
  isRecurring: boolean;
  suggestedFrequency: "Monthly" | "Yearly" | "Weekly" | "One-time";
  historyMatchCount?: number;
}

export const AIExpenseAnalyzerCard: React.FC<AIExpenseAnalyzerCardProps> = ({
  bills,
  onAddBill,
  onTriggerToast,
  darkMode,
}) => {
  const [billTitle, setBillTitle] = useState("");
  const [billAmount, setBillAmount] = useState<number | "">(1500);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedCategoryOverride, setSelectedCategoryOverride] = useState<string | null>(null);

  // Portfolio Audit state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [showAuditPanel, setShowAuditPanel] = useState(false);

  // Preset sample bill prompts for quick testing
  const samplePrompts = [
    "Meralco Power Bill",
    "Netflix HD Premium",
    "Condo Monthly Rent",
    "PLDT Fiber 200Mbps",
    "Generali Health Insurance",
    "BPI Credit Card Balance"
  ];

  // Auto-analyze when user types or picks a sample (debounced or explicit)
  const handleAnalyze = async (titleToAnalyze?: string) => {
    const title = titleToAnalyze !== undefined ? titleToAnalyze : billTitle;
    if (!title.trim()) return;

    setIsAnalyzing(true);
    setSelectedCategoryOverride(null);

    // Count historical matches for context UI
    const lower = title.trim().toLowerCase();
    const historyMatches = bills.filter(
      (b) => b.name.toLowerCase().includes(lower) || lower.includes(b.name.toLowerCase())
    );

    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_bill",
          prompt: title,
          contextData: {
            history: bills.map((b) => ({
              name: b.name,
              category: b.category,
              amount: b.amount,
              recurringFrequency: b.recurringFrequency,
            })),
          },
        }),
      });

      const data = await response.json();
      let parsed: AnalysisResult;

      try {
        let cleanText = data.result || "";
        cleanText = cleanText.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleanText);
      } catch (err) {
        // Fallback local rule categorization
        parsed = localCategorize(title, bills);
      }

      parsed.historyMatchCount = historyMatches.length;
      setResult(parsed);

      if (onTriggerToast) {
        onTriggerToast(
          `AI Suggestion: ${parsed.category}`,
          `Categorized "${title}" with ${parsed.confidence}% confidence based on semantic rules & ${historyMatches.length} historical records.`,
          "ai"
        );
      }
    } catch (error) {
      const fallback = localCategorize(title, bills);
      fallback.historyMatchCount = historyMatches.length;
      setResult(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Local categorization rule engine as instant backup/instant feedback
  const localCategorize = (title: string, history: BillItem[]): AnalysisResult => {
    const lower = title.toLowerCase();
    const match = history.find(
      (b) => b.name.toLowerCase().includes(lower) || lower.includes(b.name.toLowerCase())
    );

    if (match) {
      return {
        category: match.category,
        confidence: 98,
        reasoning: `Direct match found in your history ("${match.name}" tagged as ${match.category}).`,
        isRecurring: match.isRecurring !== undefined ? match.isRecurring : match.recurringFrequency !== "One-time",
        suggestedFrequency: match.recurringFrequency,
      };
    }

    if (/netflix|spotify|disney|hbo|youtube|apple|prime|chatgpt|gym|adobe|icloud|patreon/i.test(lower)) {
      return {
        category: "Subscription",
        confidence: 96,
        reasoning: "Recognized recurring digital entertainment or software subscription service.",
        isRecurring: true,
        suggestedFrequency: "Monthly",
      };
    }

    if (/meralco|electric|water|power|gas|pldt|globe|smart|telecom|internet|wifi|garbage|sewer|utility/i.test(lower)) {
      return {
        category: "Utilities",
        confidence: 95,
        reasoning: "Recognized household utility, electricity, or telecommunications provider.",
        isRecurring: true,
        suggestedFrequency: "Monthly",
      };
    }

    if (/rent|condo|apartment|mortgage|lease|landlord|hoa|housing|association/i.test(lower)) {
      return {
        category: "Housing",
        confidence: 97,
        reasoning: "Recognized residential rent, condo dues, or property lease obligation.",
        isRecurring: true,
        suggestedFrequency: "Monthly",
      };
    }

    if (/generali|axa|prudential|insurance|life|health|auto|hmo|car insurance|medical/i.test(lower)) {
      return {
        category: "Insurance",
        confidence: 94,
        reasoning: "Recognized health, life, or vehicle insurance protection provider.",
        isRecurring: true,
        suggestedFrequency: "Monthly",
      };
    }

    if (/credit card|bpi|bdo|loan|interest|debt|bank|car payment|statement/i.test(lower)) {
      return {
        category: "Debt",
        confidence: 92,
        reasoning: "Recognized credit card statement, bank loan, or liability payment.",
        isRecurring: true,
        suggestedFrequency: "Monthly",
      };
    }

    return {
      category: "Other",
      confidence: 85,
      reasoning: "General expense title; assigned standard default categorization.",
      isRecurring: true,
      suggestedFrequency: "Monthly",
    };
  };

  const handleAddSuggestedBill = () => {
    if (!billTitle.trim()) return;
    const finalCategory = (selectedCategoryOverride || result?.category || "Other") as BillItem["category"];
    const finalRecurring = result?.isRecurring ?? true;
    const finalFreq = result?.suggestedFrequency || "Monthly";

    // Default due date = 15th of current month or next 10 days
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const dueDateStr = today.toISOString().split("T")[0];

    onAddBill({
      name: billTitle.trim(),
      amount: Number(billAmount) || 1000,
      dueDate: dueDateStr,
      category: finalCategory,
      recurringFrequency: finalFreq,
      autoPay: false,
      isRecurring: finalRecurring,
    });

    if (onTriggerToast) {
      onTriggerToast(
        "Expense Created via AI",
        `Added "${billTitle}" (₱${Number(billAmount) || 1000}) under category "${finalCategory}".`,
        "success"
      );
    }

    setBillTitle("");
    setResult(null);
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setShowAuditPanel(true);

    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "audit_bills",
          prompt: "Audit current bills and subscription portfolio.",
          contextData: {
            bills: bills.map((b) => ({
              name: b.name,
              amount: b.amount,
              category: b.category,
              recurringFrequency: b.recurringFrequency,
              status: b.status,
            })),
          },
        }),
      });

      const data = await response.json();
      setAuditReport(data.result || "Audit completed.");
    } catch (err) {
      setAuditReport(
        "### 💳 Orbit Financial Audit\n- Essential Utilities & Housing make up the majority of fixed expenses.\n- All digital subscriptions are active. Consider reviewing unused services."
      );
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div
      className={`p-6 rounded-3xl border transition-all ${
        darkMode
          ? "bg-slate-900/90 border-slate-800 shadow-xl"
          : "bg-white border-slate-200 shadow-md"
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight">
                AI Expense Analyzer & Smart Categorizer
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Gemini 3.6
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Type a bill title to instantly predict category based on title semantics and historical bill data.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAudit}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-bold text-xs font-mono transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Portfolio AI Audit</span>
        </button>
      </div>

      {/* Quick Sample Prompts */}
      <div className="mb-4">
        <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Quick Try Examples:</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setBillTitle(sample);
                handleAnalyze(sample);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                billTitle === sample
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                  : "bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-slate-700/60"
              }`}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form & Analyze Button */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-6">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">
            New Bill Title
          </label>
          <div className="relative">
            <input
              type="text"
              value={billTitle}
              onChange={(e) => {
                setBillTitle(e.target.value);
                if (result) setResult(null); // Clear previous output when typing new title
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAnalyze();
              }}
              placeholder="e.g. Meralco Electric, Netflix HD, Condo Rent..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
              }`}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-[11px] font-bold text-slate-400 mb-1">
            Amount (₱)
          </label>
          <input
            type="number"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="1500"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-white"
                : "bg-slate-50 border-slate-300 text-slate-900"
            }`}
          />
        </div>

        <div className="md:col-span-3 flex items-end">
          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !billTitle.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>AI Categorize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Category Suggestion Output Box */}
      {result && (
        <div className="mt-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-white animate-fade-in relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-indigo-500/20">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                <Tag className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase tracking-wider block">
                  Suggested Category
                </span>
                <span className="text-base font-black text-white flex items-center gap-2">
                  {selectedCategoryOverride || result.category}
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                    {result.confidence}% Confidence
                  </span>
                </span>
              </div>
            </div>

            {/* History Match Indicator */}
            {result.historyMatchCount && result.historyMatchCount > 0 ? (
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Matched {result.historyMatchCount} History Records</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>Semantic Rule Inference</span>
              </span>
            )}
          </div>

          {/* AI Reasoning Text */}
          <p className="text-xs text-indigo-100/80 mb-3 flex items-start gap-2">
            <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>{result.reasoning}</span>
          </p>

          {/* Category Override Select & One-Click Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-indigo-500/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium shrink-0">Category:</span>
              <select
                value={selectedCategoryOverride || result.category}
                onChange={(e) => setSelectedCategoryOverride(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-indigo-500/40 text-xs text-white focus:outline-none"
              >
                <option value="Utilities">Utilities</option>
                <option value="Subscription">Subscription</option>
                <option value="Housing">Housing</option>
                <option value="Insurance">Insurance</option>
                <option value="Debt">Debt</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={handleAddSuggestedBill}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs font-mono transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bill to Ledger</span>
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Audit Drawer / Modal */}
      {showAuditPanel && (
        <div className="mt-5 p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 text-white animate-fade-in">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-sm text-indigo-200">
                AI Financial Portfolio Audit Report
              </h3>
            </div>
            <button
              onClick={() => setShowAuditPanel(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {isAuditing ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs text-slate-400">Analyzing recurring bills portfolio...</p>
            </div>
          ) : (
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
              {auditReport}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
