import React, { useState } from "react";
import { WorkoutLog, ExerciseSet } from "../../types";
import { 
  Dumbbell, 
  Plus, 
  Sparkles, 
  Flame, 
  Clock, 
  Trash2, 
  Activity, 
  Trophy, 
  ChevronRight 
} from "lucide-react";

interface FitnessViewProps {
  workouts: WorkoutLog[];
  onAddWorkout: (w: Omit<WorkoutLog, "id">) => void;
  onDeleteWorkout: (id: string) => void;
  onOpenQuickAdd: () => void;
  darkMode: boolean;
}

export const FitnessView: React.FC<FitnessViewProps> = ({
  workouts,
  onAddWorkout,
  onDeleteWorkout,
  onOpenQuickAdd,
  darkMode,
}) => {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiWorkoutResult, setAiWorkoutResult] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const totalCaloriesBurned = workouts.reduce((acc, w) => acc + w.caloriesBurned, 0);
  const totalDurationMinutes = workouts.reduce((acc, w) => acc + w.durationMinutes, 0);

  const handleGenerateWorkout = async () => {
    if (!aiPrompt.trim() && loadingAi) return;
    setLoadingAi(true);

    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "workout_plan",
          prompt: aiPrompt || "Generate a 30-minute high-intensity upper body hypertrophy workout.",
        }),
      });

      const data = await response.json();
      setAiWorkoutResult(data.result || "Workout generated.");
    } catch (err) {
      console.error("AI Workout generator error:", err);
      setAiWorkoutResult("### 🏋️ 30-Min Upper Body Workout Routine\n1. Incline Dumbbell Press — 4 Sets x 10 Reps\n2. Lat Pulldowns — 4 Sets x 12 Reps\n3. Lateral Raises — 3 Sets x 15 Reps\n4. Plank Hold — 3 Sets x 45 Sec");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleApplyAiWorkout = () => {
    if (!aiWorkoutResult) return;
    onAddWorkout({
      title: "AI Generated " + (aiPrompt || "Full Body Workout"),
      type: "Strength",
      durationMinutes: 35,
      caloriesBurned: 320,
      intensity: "High",
      exercises: [
        { id: "e1", exerciseName: "Dumbbell Bench Press", sets: 4, reps: 10, weightLbs: 60 },
        { id: "e2", exerciseName: "Lat Pulldown", sets: 4, reps: 10, weightLbs: 135 },
      ],
      date: new Date().toISOString().split("T")[0],
    });

    setAiWorkoutResult(null);
    setAiPrompt("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-emerald-500" />
            <span>Fitness & Workouts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track exercises, sets, volume load, and generate AI workout plans.
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Log Workout</span>
        </button>
      </div>

      {/* Fitness Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">Target: 4x/wk</span>
          </div>
          <p className="text-2xl font-black">{workouts.length}</p>
          <p className="text-xs text-slate-400">Workouts Logged</p>
        </div>

        <div className={`p-5 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-bold text-rose-400">Energy Burn</span>
          </div>
          <p className="text-2xl font-black">{totalCaloriesBurned} <span className="text-xs font-medium text-slate-400">kcal</span></p>
          <p className="text-xs text-slate-400">Calories Burned</p>
        </div>

        <div className={`p-5 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-400">Time Under Tension</span>
          </div>
          <p className="text-2xl font-black">{totalDurationMinutes} <span className="text-xs font-medium text-slate-400">mins</span></p>
          <p className="text-xs text-slate-400">Total Active Duration</p>
        </div>
      </div>

      {/* AI Workout Generator Box */}
      <div className={`p-6 rounded-3xl border bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30 text-slate-100 shadow-xl space-y-4`}>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h2 className="font-extrabold text-base text-emerald-400">Orbit AI Custom Workout Generator</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="e.g. 30-min HIIT cardio or Upper Body Hypertrophy with dumbbells..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-slate-950/60 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleGenerateWorkout}
            disabled={loadingAi}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50 shrink-0"
          >
            {loadingAi ? "Generating..." : "Generate Routine"}
          </button>
        </div>

        {aiWorkoutResult && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 text-xs space-y-3">
            <div className="whitespace-pre-wrap font-sans leading-relaxed">{aiWorkoutResult}</div>
            <button
              onClick={handleApplyAiWorkout}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log this AI Workout</span>
            </button>
          </div>
        )}
      </div>

      {/* Workouts History List */}
      <div className={`p-6 rounded-3xl border ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <h2 className="font-extrabold text-base mb-4">Logged Workouts</h2>

        <div className="space-y-4">
          {workouts.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No workouts logged yet today.</p>
          ) : (
            workouts.map((w) => (
              <div
                key={w.id}
                className={`p-4 rounded-2xl border space-y-3 ${
                  darkMode ? "bg-slate-800/40 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{w.title}</h3>
                      <p className="text-[10px] text-slate-400">
                        {w.type} • {w.durationMinutes} mins • {w.caloriesBurned} kcal
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteWorkout(w.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {w.exercises && w.exercises.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
                    {w.exercises.map((ex) => (
                      <div key={ex.id} className="p-2.5 rounded-xl bg-slate-200/40 dark:bg-slate-900/60 text-xs flex justify-between items-center">
                        <span className="font-semibold">{ex.exerciseName}</span>
                        <span className="text-[11px] font-mono text-emerald-400">
                          {ex.sets}x{ex.reps} {ex.weightLbs ? `@ ${ex.weightLbs}lbs` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
