import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  BrainCircuit, 
  Dumbbell, 
  Utensils, 
  Wallet, 
  Target, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2 
} from "lucide-react";
import { Task, Habit, MealPlanItem, WorkoutLog, GoalItem } from "../types";

interface OrbitScoreBannerProps {
  score: number;
  tasks: Task[];
  habits: Habit[];
  meals: MealPlanItem[];
  workouts: WorkoutLog[];
  goals: GoalItem[];
  onOpenCopilot: () => void;
  darkMode: boolean;
}

export const OrbitScoreBanner: React.FC<OrbitScoreBannerProps> = ({
  score,
  tasks,
  habits,
  meals,
  workouts,
  goals,
  onOpenCopilot,
  darkMode,
}) => {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completedHabits = habits.filter((h) => h.completedToday).length;
  const consumedMeals = meals.filter((m) => m.consumed).length;
  const hasWorkout = workouts.length > 0;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "from-emerald-500 to-teal-500 text-emerald-400";
    if (s >= 60) return "from-indigo-500 to-purple-500 text-indigo-400";
    return "from-amber-500 to-orange-500 text-amber-400";
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`p-6 md:p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden shadow-2xl hover:border-indigo-500/40 hover:shadow-indigo-500/15 ${
        darkMode 
          ? "bg-zinc-900/40 border-white/5 text-zinc-100 backdrop-blur-md" 
          : "bg-white border-zinc-200 text-zinc-900 shadow-xl"
      }`}
    >
      {/* Background Decorative Radial Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Score Ring Gauge */}
        <div className="md:col-span-5 flex items-center space-x-5">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="7"
                className="text-zinc-800/80 dark:text-zinc-800"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#orbitGradient)"
                strokeWidth="7"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                fill="transparent"
              />
              <defs>
                <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black tracking-tight">{score}</span>
              <span className="block text-[9px] uppercase font-bold text-zinc-400 font-mono">Score</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 font-mono">Orbit Life Harmony</span>
            </div>
            <h2 className="text-xl font-light tracking-tight text-white mt-1">
              {score >= 85 ? "Optimal Momentum" : score >= 70 ? "High Focus Alignment" : "Building Rhythm"}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Calculated across 5 core pillars of daily operational performance.
            </p>
          </div>
        </div>

        {/* 5 Core Pillars Grid */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400 font-mono">{completedTasks}/{tasks.length}</span>
            </div>
            <p className="text-xs font-semibold truncate">Tasks</p>
            <p className="text-[10px] text-zinc-400 font-mono">Productivity</p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold text-purple-400 font-mono">{completedHabits}/{habits.length}</span>
            </div>
            <p className="text-xs font-semibold truncate">Habits</p>
            <p className="text-[10px] text-zinc-400 font-mono">Consistency</p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 font-mono">{consumedMeals}/{meals.length}</span>
            </div>
            <p className="text-xs font-semibold truncate">Nutrition</p>
            <p className="text-[10px] text-zinc-400 font-mono">Fuel</p>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 font-mono">{hasWorkout ? "Done" : "Pending"}</span>
            </div>
            <p className="text-xs font-semibold truncate">Fitness</p>
            <p className="text-[10px] text-zinc-400 font-mono">Energy</p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <Target className="w-4 h-4 text-pink-400" />
              <span className="text-[10px] font-bold text-pink-400 font-mono">{goals.length} Active</span>
            </div>
            <p className="text-xs font-semibold truncate">Goals</p>
            <p className="text-[10px] text-zinc-400 font-mono">Trajectory</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
