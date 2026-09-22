import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Task, 
  ScheduleEvent, 
  Habit, 
  WorkoutLog, 
  MealPlanItem, 
  BillItem, 
  GoalItem, 
  UserOrbitProfile 
} from "../../types";
import { OrbitScoreBanner } from "../OrbitScoreBanner";
import { DailyDigest } from "../DailyDigest";
import { DailyInsightCard } from "../DailyInsightCard";
import { TaskQuickLookModal } from "../TaskQuickLookModal";
import { TaskAnalyticsWidget } from "../TaskAnalyticsWidget";
import { WeeklyInsightSection } from "../WeeklyInsightSection";
import { WelcomeHeader } from "../WelcomeHeader";
import { getCategoryBadgeStyle } from "./TasksView";
import { 
  Sparkles, 
  CheckSquare, 
  CalendarDays, 
  Flame, 
  Dumbbell, 
  Utensils, 
  CreditCard, 
  ArrowRight, 
  Plus, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Eye,
  Maximize2,
  Minimize2,
  Compass,
  Flame as FireIcon 
} from "lucide-react";

interface DashboardViewProps {
  profile: UserOrbitProfile;
  harmonyScore: number;
  tasks: Task[];
  schedule: ScheduleEvent[];
  habits: Habit[];
  workouts: WorkoutLog[];
  meals: MealPlanItem[];
  bills: BillItem[];
  goals: GoalItem[];
  onToggleTask: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDeleteTask?: (id: string) => void;
  onAddSubtasksToTask?: (taskId: string, subtasks: { id: string; title: string; completed: boolean; estimatedMinutes?: number }[]) => void;
  onToggleHabit: (id: string) => void;
  onToggleMeal: (id: string) => void;
  onOpenQuickAdd: () => void;
  onOpenCopilot: () => void;
  onNavigateTab: (tab: any) => void;
  darkMode: boolean;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  harmonyScore,
  tasks,
  schedule,
  habits,
  workouts,
  meals,
  bills,
  goals,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onAddSubtasksToTask,
  onToggleHabit,
  onToggleMeal,
  onOpenQuickAdd,
  onOpenCopilot,
  onNavigateTab,
  darkMode,
  isFocusMode = false,
  onToggleFocusMode,
}) => {
  const [quickLookTask, setQuickLookTask] = useState<Task | null>(null);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const highPriorityTasks = tasks.filter((t) => t.priority === "P1");
  const todaySchedule = schedule.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalCaloriesConsumed = meals
    .filter((m) => m.consumed)
    .reduce((acc, m) => acc + m.calories, 0);

  const totalProteinConsumed = meals
    .filter((m) => m.consumed)
    .reduce((acc, m) => acc + m.proteinGrams, 0);

  const upcomingBills = bills.filter((b) => b.status === "upcoming" || b.status === "unpaid");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      {/* Welcome Header Component */}
      <WelcomeHeader
        profile={profile}
        darkMode={darkMode}
        isFocusMode={isFocusMode}
        onToggleFocusMode={onToggleFocusMode}
      />

      {/* Gemini AI Daily Digest Component */}
      <DailyDigest
        profile={profile}
        harmonyScore={harmonyScore}
        tasks={tasks}
        schedule={schedule}
        habits={habits}
        workouts={workouts}
        meals={meals}
        goals={goals}
        darkMode={darkMode}
        onNavigateTab={onNavigateTab}
        onToggleTask={onToggleTask}
        onToggleHabit={onToggleHabit}
      />

      {/* AI Daily Insight Card */}
      <DailyInsightCard harmonyScore={harmonyScore} darkMode={darkMode} />

      {/* Gemini AI Weekly Insight Section */}
      <WeeklyInsightSection tasks={tasks} darkMode={darkMode} />

      {/* Life Harmony Index Gauge */}
      <OrbitScoreBanner
        score={harmonyScore}
        tasks={tasks}
        habits={habits}
        meals={meals}
        workouts={workouts}
        goals={goals}
        onOpenCopilot={onOpenCopilot}
        darkMode={darkMode}
      />

      {/* Grid Section: Today's Timeline & Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Timeline / Schedule */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className={`lg:col-span-7 p-6 rounded-3xl border transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/15 ${
            darkMode ? "bg-zinc-900/40 border-white/5 text-zinc-100 backdrop-blur-md" : "bg-white border-zinc-200 text-zinc-900 shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-base text-white">Today's Timeline</h2>
            </div>
            <button
              onClick={() => onNavigateTab("schedule")}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaySchedule.slice(0, 5).map((evt) => (
              <div
                key={evt.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  evt.isFocusBlock
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : darkMode
                    ? "bg-zinc-900/60 border-white/5"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    evt.isFocusBlock ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-300"
                  }`}>
                    {evt.startTime}
                  </div>
                  <div>
                    <h3 className="text-xs font-medium flex items-center gap-2 text-zinc-200">
                      {evt.title}
                      {evt.isFocusBlock && (
                        <span className="text-[9px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                          Focus Block
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{evt.startTime} - {evt.endTime}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-medium px-2 py-1 rounded-lg bg-zinc-800/80 text-zinc-400 border border-white/5">
                    {evt.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Top Priority Action Checklist */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className={`lg:col-span-5 p-6 rounded-3xl border transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/15 ${
            darkMode ? "bg-zinc-900/40 border-white/5 text-zinc-100 backdrop-blur-md" : "bg-white border-zinc-200 text-zinc-900 shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-base text-white">Top Priorities</h2>
            </div>
            <button
              onClick={() => onNavigateTab("tasks")}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all hover:border-indigo-500/40 ${
                  t.completed
                    ? "opacity-50 line-through bg-zinc-900/20 border-white/5"
                    : darkMode
                    ? "bg-zinc-900/60 border-white/5"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button 
                    onClick={() => onToggleTask(t.id)}
                    className="text-indigo-400 shrink-0 hover:scale-105 transition-transform"
                    title="Toggle completion"
                  >
                    {t.completed ? <CheckCircle2 className="w-5 h-5 fill-indigo-500 text-white" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div 
                    onClick={() => setQuickLookTask(t)}
                    className="flex-1 min-w-0 cursor-pointer group"
                    title="Quick Look"
                  >
                    <p className="text-xs font-medium text-zinc-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        t.priority === "P1" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {t.priority}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getCategoryBadgeStyle(t.category)}`}>
                        <span className="w-1 h-1 rounded-full bg-current opacity-80" />
                        {t.category}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">{t.estimatedMinutes}m est.</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setQuickLookTask(t)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 transition-colors shrink-0 ml-2"
                  title="Quick Look"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Task Analytics & Gemini Insights Widget */}
      <TaskAnalyticsWidget tasks={tasks} darkMode={darkMode} />

      {/* Lower Cards: Habits, Fuel/Nutrition, Bills */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Habits Checklist */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className={`p-6 rounded-3xl border transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/15 ${
            darkMode ? "bg-zinc-900/40 border-white/5 text-zinc-100 backdrop-blur-md" : "bg-white border-zinc-200 text-zinc-900 shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-base text-white">Daily Habits</h3>
            </div>
            <button onClick={() => onNavigateTab("habits")} className="text-xs text-indigo-400 font-medium">
              All
            </button>
          </div>

          <div className="space-y-2">
            {habits.slice(0, 4).map((h) => (
              <div
                key={h.id}
                onClick={() => onToggleHabit(h.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  h.completedToday
                    ? "bg-amber-500/10 border-amber-500/30"
                    : darkMode
                    ? "bg-zinc-900/60 border-white/5"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className={`w-4 h-4 ${h.completedToday ? "text-amber-400 fill-amber-400" : "text-zinc-600"}`} />
                  <span className="text-xs font-medium text-zinc-200 line-clamp-1">{h.title}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 shrink-0">
                  <FireIcon className="w-3 h-3 fill-amber-400" /> {h.streakCount}d
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Nutrition Bar */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className={`p-6 rounded-3xl border transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/15 ${
            darkMode ? "bg-zinc-900/40 border-white/5 text-zinc-100 backdrop-blur-md" : "bg-white border-zinc-200 text-zinc-900 shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-base text-white">Nutrition & Fuel</h3>
            </div>
            <button onClick={() => onNavigateTab("meals")} className="text-xs text-indigo-400 font-medium">
              Meals
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Calories</span>
                <span className="text-zinc-200">{totalCaloriesConsumed} / {profile.dailyCalorieTarget} kcal</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalCaloriesConsumed / profile.dailyCalorieTarget) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Protein</span>
                <span className="text-zinc-200">{totalProteinConsumed}g / {profile.proteinTargetGrams}g</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalProteinConsumed / profile.proteinTargetGrams) * 100, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 pt-1 font-mono">
              {totalProteinConsumed >= profile.proteinTargetGrams ? "Daily protein target hit!" : "Keep fueling for optimal cognitive energy."}
            </p>
          </div>
        </motion.div>

        {/* Upcoming Bills Alert */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className={`p-6 rounded-3xl border transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/15 ${
            darkMode ? "bg-zinc-900/40 border-white/5 text-zinc-100 backdrop-blur-md" : "bg-white border-zinc-200 text-zinc-900 shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-base text-white">Bills & Finance</h3>
            </div>
            <button onClick={() => onNavigateTab("bills")} className="text-xs text-indigo-400 font-medium">
              Finance
            </button>
          </div>

          <div className="space-y-2">
            {upcomingBills.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs font-medium"
              >
                <div>
                  <p className="line-clamp-1 text-zinc-200">{b.name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Due {b.dueDate}</p>
                </div>
                <span className="font-mono font-bold text-indigo-400">₱{b.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Task Quick Look Modal */}
      <TaskQuickLookModal
        task={quickLookTask}
        isOpen={Boolean(quickLookTask)}
        onClose={() => setQuickLookTask(null)}
        onToggleTask={onToggleTask}
        onToggleSubtask={(taskId, subtaskId) => {
          if (onToggleSubtask) onToggleSubtask(taskId, subtaskId);
          setQuickLookTask((prev) =>
            prev && prev.id === taskId
              ? {
                  ...prev,
                  subtasks: prev.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                  ),
                }
              : prev
          );
        }}
        onDeleteTask={onDeleteTask}
        onAddSubtask={(taskId, title) => {
          if (onAddSubtasksToTask) {
            onAddSubtasksToTask(taskId, [{ id: `sub-${Date.now()}`, title, completed: false }]);
          }
          setQuickLookTask((prev) =>
            prev && prev.id === taskId
              ? {
                  ...prev,
                  subtasks: [...prev.subtasks, { id: `sub-${Date.now()}`, title, completed: false }],
                }
              : prev
          );
        }}
        darkMode={darkMode}
      />
    </motion.div>
  );
};
