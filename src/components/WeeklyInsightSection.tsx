import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, CalendarCheck2, TrendingUp, Lightbulb } from "lucide-react";
import { Task } from "../types";

interface WeeklyInsightSectionProps {
  tasks: Task[];
  darkMode: boolean;
}

export const WeeklyInsightSection: React.FC<WeeklyInsightSectionProps> = ({
  tasks,
  darkMode,
}) => {
  const [insightText, setInsightText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper to remove any technical or markdown symbols
  const sanitizeText = (raw: string): string => {
    // Strip markdown formatting symbols like *, #, %, _, `, ~, {, }, [, ], ^, <, >, |, @, =, +
    const cleaned = raw
      .replace(/[*#%_`~{}\[\]\^<>|@=+\\\/]/g, "") // remove symbols including %
      .replace(/\s+/g, " ")
      .trim();

    // Ensure it splits cleanly into sentences and take exactly up to 3 sentences
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
    const topThree = sentences.slice(0, 3).map((s) => s.trim()).join(" ");

    return topThree || cleaned;
  };

  const fetchWeeklyInsight = async () => {
    setIsLoading(true);
    try {
      const completed = tasks.filter((t) => t.completed);
      const totalCount = tasks.length;
      const completedCount = completed.length;

      const categoryCounts: Record<string, number> = {};
      tasks.forEach((t) => {
        categoryCounts[t.category] = (categoryCounts[t.category] || 0) + (t.completed ? 1 : 0);
      });

      const topCat = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "General";

      const payload = {
        totalTasks: totalCount,
        completedTasks: completedCount,
        topCategory: topCat,
        highPriorityCompleted: tasks.filter((t) => t.priority === "P1" && t.completed).length,
      };

      const promptText = `Analyze these task completion stats and provide a 3-sentence productivity summary: ${JSON.stringify(payload)}. Strictly write exactly three sentences in standard plain English without using any technical symbols, percent signs, asterisks, brackets, or markdown formatting.`;

      const res = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "weekly_insight",
          prompt: promptText,
          contextData: payload,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setInsightText(sanitizeText(data.result));
      } else {
        setInsightText(getFallbackInsight());
      }
    } catch (error) {
      console.error("Weekly insight fetch error:", error);
      setInsightText(getFallbackInsight());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackInsight = (): string => {
    const completedCount = tasks.filter((t) => t.completed).length;
    return `Your productivity momentum shows steady progress across your primary projects this week. Completing ${completedCount} key objectives has created strong positive momentum for your upcoming focus goals. Maintaining this consistent daily focus window will ensure your high priority targets remain on track.`;
  };

  useEffect(() => {
    if (!insightText) {
      fetchWeeklyInsight();
    }
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-3xl border relative overflow-hidden transition-all duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/15 ${
        darkMode
          ? "bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-purple-950/30 border-indigo-500/20 text-zinc-100 backdrop-blur-md"
          : "bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 border-indigo-200 text-zinc-900 shadow-sm"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-tight text-white">
                Weekly Insight
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                Gemini Intelligence
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Three-sentence executive analysis of your weekly productivity patterns
            </p>
          </div>
        </div>

        <button
          onClick={fetchWeeklyInsight}
          disabled={isLoading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          title="Regenerate Weekly Insight"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
          <span>{isLoading ? "Analyzing..." : "Refresh Insight"}</span>
        </button>
      </div>

      <div className={`p-4 rounded-2xl border ${
        darkMode 
          ? "bg-zinc-950/60 border-white/5 text-zinc-200" 
          : "bg-white/80 border-indigo-100 text-zinc-800 shadow-inner"
      }`}>
        {isLoading ? (
          <div className="flex items-center space-x-3 py-3">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
            <p className="text-xs text-zinc-400 font-mono">
              Gemini is evaluating your task completion velocity and weekly focus trends...
            </p>
          </div>
        ) : (
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-sm leading-relaxed font-sans font-medium text-zinc-200">
              {insightText}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
