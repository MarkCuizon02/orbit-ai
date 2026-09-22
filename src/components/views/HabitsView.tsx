import React, { useState } from "react";
import { Habit } from "../../types";
import { 
  Flame, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Sun, 
  Moon, 
  Clock, 
  Award, 
  Flame as FireIcon,
  Check,
  TrendingUp
} from "lucide-react";

interface HabitsViewProps {
  habits: Habit[];
  onAddHabit: (h: Omit<Habit, "id" | "completedToday" | "historyMap">) => void;
  onToggleHabit: (id: string) => void;
  onDeleteHabit: (id: string) => void;
  onOpenQuickAdd: () => void;
  darkMode: boolean;
}

// Generate array of last 7 days ending today
const getLast7Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Mon"
    const dayInitial = dayName.charAt(0);
    dates.push({ iso, dayName, dayInitial, isToday: i === 0 });
  }
  return dates;
};

// Calculate habit completion over last 7 days
const get7DayHabitStats = (habit: Habit) => {
  const last7Days = getLast7Days();
  let completedCount = 0;

  const dayDetails = last7Days.map(({ iso, dayName, dayInitial, isToday }) => {
    let completed = false;
    if (isToday) {
      completed = habit.completedToday || Boolean(habit.historyMap?.[iso]);
    } else {
      completed = Boolean(habit.historyMap?.[iso]);
    }
    if (completed) completedCount++;
    return { iso, dayName, dayInitial, isToday, completed };
  });

  const percentage = Math.round((completedCount / 7) * 100);
  return { completedCount, percentage, dayDetails };
};

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit,
  onOpenQuickAdd,
  darkMode,
}) => {
  const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);

  const morningHabits = habits.filter((h) => h.timeOfDay === "Morning");
  const eveningHabits = habits.filter((h) => h.timeOfDay === "Evening");
  const otherHabits = habits.filter((h) => h.timeOfDay !== "Morning" && h.timeOfDay !== "Evening");

  const handleFetchCoachAdvice = async () => {
    setLoadingCoach(true);
    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          prompt: "Analyze my habit streaks and give me 3 high-impact behavioral science tips to keep my morning & evening routines bulletproof.",
        }),
      });

      const data = await response.json();
      setCoachAdvice(data.result || "Focus on atomic habit stacking: pair a new habit with an established trigger!");
    } catch (err) {
      console.error("Habit coach error:", err);
      setCoachAdvice("Tip: Tie your morning hydration directly to turning off your alarm. Habit stacking builds bulletproof momentum!");
    } finally {
      setLoadingCoach(false);
    }
  };

  const renderHabitCard = (h: Habit, themeColor: "amber" | "indigo" | "emerald") => {
    const { completedCount, percentage, dayDetails } = get7DayHabitStats(h);

    const themeStyles = {
      amber: {
        activeBg: "bg-amber-500/10 border-amber-500/30 text-amber-200",
        iconColor: "text-amber-400 fill-amber-400",
        barFill: "bg-gradient-to-r from-amber-500 to-amber-400",
        badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        dotDone: "bg-amber-400 text-slate-950 font-bold",
        textColor: "text-amber-400",
      },
      indigo: {
        activeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-200",
        iconColor: "text-indigo-400 fill-indigo-400",
        barFill: "bg-gradient-to-r from-indigo-500 to-indigo-400",
        badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        dotDone: "bg-indigo-400 text-slate-950 font-bold",
        textColor: "text-indigo-400",
      },
      emerald: {
        activeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
        iconColor: "text-emerald-400 fill-emerald-400",
        barFill: "bg-gradient-to-r from-emerald-500 to-emerald-400",
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        dotDone: "bg-emerald-400 text-slate-950 font-bold",
        textColor: "text-emerald-400",
      },
    }[themeColor];

    return (
      <div
        key={h.id}
        onClick={() => onToggleHabit(h.id)}
        className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
          h.completedToday
            ? themeStyles.activeBg
            : darkMode
            ? "bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300"
            : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800"
        }`}
      >
        {/* Main Habit Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleHabit(h.id);
              }}
              className="focus:outline-none"
            >
              <CheckCircle2
                className={`w-5 h-5 transition-transform active:scale-95 ${
                  h.completedToday ? themeStyles.iconColor : "text-slate-500 hover:text-slate-400"
                }`}
              />
            </button>
            <div>
              <p className={`text-xs font-bold ${h.completedToday ? "line-through opacity-80" : ""}`}>
                {h.title}
              </p>
              <p className="text-[10px] text-slate-400">{h.category} • {h.frequency}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] ${themeStyles.badgeBg}`}>
              <FireIcon className="w-3.5 h-3.5 fill-current" /> {h.streakCount}d streak
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteHabit(h.id);
              }}
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              title="Delete Habit"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 7-Day Progress Bar & Stats */}
        <div className="space-y-1.5 pt-1 border-t border-slate-200/40 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-slate-400" />
              7-Day Consistency
            </span>
            <span className={`font-bold font-mono ${themeStyles.textColor}`}>
              {percentage}% ({completedCount}/7)
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${themeStyles.barFill}`}
              style={{ width: `${Math.max(percentage, 4)}%` }}
            />
          </div>

          {/* 7-Day Matrix Indicators */}
          <div className="flex items-center justify-between pt-1">
            {dayDetails.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-0.5" title={`${day.dayName}: ${day.completed ? "Completed" : "Missed"}`}>
                <div
                  className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center transition-all ${
                    day.completed
                      ? themeStyles.dotDone
                      : day.isToday
                      ? "border border-dashed border-indigo-400 text-indigo-400"
                      : darkMode
                      ? "bg-slate-800 text-slate-500"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {day.completed ? <Check className="w-3 h-3 stroke-[3]" /> : day.dayInitial}
                </div>
                <span className={`text-[8px] font-mono ${day.isToday ? "text-indigo-400 font-bold" : "text-slate-500"}`}>
                  {day.dayName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            <span>Habits & Routines</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build unshakeable daily rituals with 7-day consistency tracking and behavioral coaching.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleFetchCoachAdvice}
            disabled={loadingCoach}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Sparkles className={`w-4 h-4 fill-slate-950 ${loadingCoach ? "animate-spin" : ""}`} />
            <span>AI Habit Coach</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* AI Habit Coach Advice Box */}
      {coachAdvice && (
        <div className="p-5 rounded-3xl border bg-amber-500/10 border-amber-500/30 text-amber-200 space-y-2 animate-fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-300">Orbit Habit Coach Insights</h3>
          </div>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{coachAdvice}</p>
        </div>
      )}

      {/* Ritual Stack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Ritual Stack */}
        <div className={`p-6 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center space-x-2 mb-4 border-b pb-3 border-slate-200/50 dark:border-slate-800">
            <Sun className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-base">Morning Ritual Stack</h2>
          </div>

          <div className="space-y-4">
            {morningHabits.length === 0 ? (
              <p className="text-xs text-slate-500">No morning habits configured.</p>
            ) : (
              morningHabits.map((h) => renderHabitCard(h, "amber"))
            )}
          </div>
        </div>

        {/* Evening Ritual Stack */}
        <div className={`p-6 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center space-x-2 mb-4 border-b pb-3 border-slate-200/50 dark:border-slate-800">
            <Moon className="w-5 h-5 text-indigo-400" />
            <h2 className="font-extrabold text-base">Evening Ritual Stack</h2>
          </div>

          <div className="space-y-4">
            {eveningHabits.length === 0 ? (
              <p className="text-xs text-slate-500">No evening habits configured.</p>
            ) : (
              eveningHabits.map((h) => renderHabitCard(h, "indigo"))
            )}
          </div>
        </div>
      </div>

      {/* Anytime & General Habits */}
      {otherHabits.length > 0 && (
        <div className={`p-6 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <h2 className="font-extrabold text-base mb-4">Anytime Habits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherHabits.map((h) => renderHabitCard(h, "emerald"))}
          </div>
        </div>
      )}
    </div>
  );
};

