import React, { useState } from "react";
import { GoalItem } from "../../types";
import { 
  Target, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Flag, 
  TrendingUp 
} from "lucide-react";

interface GoalsViewProps {
  goals: GoalItem[];
  onAddGoal: (g: Omit<GoalItem, "id">) => void;
  onDeleteGoal: (id: string) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onOpenQuickAdd: () => void;
  darkMode: boolean;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onDeleteGoal,
  onToggleMilestone,
  onOpenQuickAdd,
  darkMode,
}) => {
  const [roadmapResult, setRoadmapResult] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGenerateRoadmap = async (goal: GoalItem) => {
    setLoadingAi(true);
    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "goal_roadmap",
          prompt: `Goal: ${goal.title}\nTarget: ${goal.targetValue} ${goal.unit}\nDescription: ${goal.description}`,
        }),
      });

      const data = await response.json();
      setRoadmapResult(data.result || "Roadmap generated.");
    } catch (err) {
      console.error("AI Goal roadmap error:", err);
      setRoadmapResult("### 🚀 Strategic Goal Execution Roadmap\n- **Phase 1 (Foundation):** Establish baseline metrics and daily habit triggers.\n- **Phase 2 (Momentum):** Execute core 90-minute focus blocks.\n- **Phase 3 (Mastery):** Scale metrics and audit key KPIs.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-pink-500" />
            <span>Long-Term Goals & Vision</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Strategic OKRs, milestones, and AI-driven 3-phase execution roadmaps.
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* AI Roadmap Output */}
      {roadmapResult && (
        <div className="p-6 rounded-3xl border bg-indigo-950/40 border-indigo-500/30 text-indigo-100 space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-extrabold text-sm text-indigo-300">Orbit Strategic Goal Roadmap</h3>
          </div>
          <div className="whitespace-pre-wrap text-xs leading-relaxed font-sans">{roadmapResult}</div>
          <button
            onClick={() => setRoadmapResult(null)}
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Goals Cards */}
      <div className="space-y-6">
        {goals.map((goal) => {
          const progressPercent = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl border space-y-4 ${
                darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                      {goal.timeframe}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{goal.category}</span>
                  </div>
                  <h2 className="text-lg font-extrabold mt-1">{goal.title}</h2>
                  <p className="text-xs text-slate-400">{goal.description}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleGenerateRoadmap(goal)}
                    disabled={loadingAi}
                    className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${loadingAi ? "animate-spin" : ""}`} />
                    <span>AI Roadmap</span>
                  </button>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span>Progress</span>
                  <span className="text-indigo-400">{goal.currentValue} / {goal.targetValue} {goal.unit} ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Milestones List */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/80 space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Flag className="w-3.5 h-3.5" /> Key Milestones
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {goal.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => onToggleMilestone(goal.id, m.id)}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs cursor-pointer transition-all ${
                          m.completed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through"
                            : darkMode
                            ? "bg-slate-800/40 border-slate-800 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-800"
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${m.completed ? "text-emerald-400 fill-emerald-400" : "text-slate-500"}`} />
                        <span className="line-clamp-1">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
