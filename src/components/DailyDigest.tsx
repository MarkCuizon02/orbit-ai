import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  RefreshCw, 
  Sun, 
  CheckCircle2, 
  Calendar, 
  Flame, 
  Zap, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Compass, 
  BrainCircuit, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Award
} from "lucide-react";
import { 
  Task, 
  ScheduleEvent, 
  Habit, 
  WorkoutLog, 
  MealPlanItem, 
  GoalItem, 
  UserOrbitProfile 
} from "../types";
import { cleanAiText } from "../lib/cleanAiText";

interface DailyDigestProps {
  profile: UserOrbitProfile;
  harmonyScore: number;
  tasks: Task[];
  schedule: ScheduleEvent[];
  habits: Habit[];
  workouts: WorkoutLog[];
  meals: MealPlanItem[];
  goals: GoalItem[];
  darkMode?: boolean;
  onNavigateTab: (tab: any) => void;
  onToggleTask?: (id: string) => void;
  onToggleHabit?: (id: string) => void;
}

export const DailyDigest: React.FC<DailyDigestProps> = ({
  profile,
  harmonyScore,
  tasks,
  schedule,
  habits,
  workouts,
  meals,
  goals,
  darkMode = true,
  onNavigateTab,
  onToggleTask,
  onToggleHabit,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [digestContent, setDigestContent] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<"briefing" | "agenda" | "habits" | "insights">("briefing");

  // Filter today's metrics
  const todayTasks = tasks.filter((t) => !t.completed);
  const p1Tasks = todayTasks.filter((t) => t.priority === "P1");
  const todaySchedule = schedule.slice(0, 4);
  const habitsRemaining = habits.filter((h) => !h.completedToday);

  // Default fallback briefing generator
  const generateInitialBriefing = () => {
    const greeting = getGreeting();
    const taskCount = todayTasks.length;
    const p1Count = p1Tasks.length;
    const scheduleCount = schedule.length;
    const habitCount = habitsRemaining.length;

    const baseProse = `${greeting}, ${profile.name || "friend"}. Here is your daily briefing for today.

Your overall Orbit Score is sitting at ${harmonyScore}%, reflecting good balance across your goals and daily routines.

Key Priorities Today:
You currently have ${taskCount} active tasks remaining, including ${p1Count} top-priority item${p1Count === 1 ? "" : "s"}. ${
      p1Tasks.length > 0 ? `Your main focus should be on ${p1Tasks[0].title}.` : "All top-level priority items are currently clear."
    }

Schedule Overview:
You have ${scheduleCount} scheduled item${scheduleCount === 1 ? "" : "s"} today. We recommend taking an uninterrupted focus time block between 10:00 AM and 11:30 AM to get things done.

Habits & Health:
${
  habitCount > 0
    ? `You have ${habitCount} habit${habitCount === 1 ? "" : "s"} left to complete today to keep your streak going.`
    : "All habits for today are finished. Great job!"
}

Daily Recommendation:
Drink water, complete your main priority early, and take a 15-minute afternoon walk to stay energized.`;

    return cleanAiText(baseProse);
  };

  useEffect(() => {
    setDigestContent(generateInitialBriefing());
  }, [tasks, schedule, habits, harmonyScore]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleFetchGeminiDigest = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Analyze my daily Orbit environment and create a concise executive morning briefing.
Context:
- User Name: ${profile.name}
- Harmony Score: ${harmonyScore}%
- Tasks Remaining: ${todayTasks.map((t) => t.title).join(", ")}
- Top Priority (P1): ${p1Tasks.map((t) => t.title).join(", ")}
- Scheduled Events: ${schedule.map((s) => `${s.startTime} ${s.title}`).join(", ")}
- Habits Remaining: ${habitsRemaining.map((h) => h.title).join(", ")}

Generate a clean, inspiring, executive briefing without markdown symbols (do NOT use ###, #, or **). Write in clear, polished professional sentences.`;

      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "daily_digest",
          prompt,
          contextData: { harmonyScore, tasksCount: todayTasks.length, p1Count: p1Tasks.length },
        }),
      });

      const data = await response.json();
      if (data.result) {
        setDigestContent(cleanAiText(data.result));
      }
    } catch (err) {
      console.error("Failed to generate Gemini digest:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSpeech = () => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(digestContent);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`rounded-3xl border shadow-2xl overflow-hidden relative hover:border-indigo-500/40 hover:shadow-indigo-500/15 transition-all duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-indigo-950/40 border-indigo-500/30 text-zinc-100"
          : "bg-gradient-to-br from-white via-indigo-50/40 to-slate-100 border-indigo-200 text-zinc-900"
      }`}
    >
      {/* Top Banner Header */}
      <div className="p-6 md:p-8 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Morning Digest</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>{getGreeting()}, {profile.name || "there"}</span>
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 max-w-xl">
              Your daily schedule, habits, and priorities for {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSpeech}
              title="Listen to Briefing"
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                isSpeaking
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 animate-pulse"
                  : darkMode
                  ? "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-white/10"
                  : "bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200"
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
              <span className="hidden sm:inline">{isSpeaking ? "Mute Briefing" : "Read Aloud"}</span>
            </button>

            <button
              onClick={handleFetchGeminiDigest}
              disabled={isGenerating}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                isGenerating
                  ? "bg-indigo-500/50 text-white border-transparent cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/30 shadow-lg shadow-indigo-600/20 active:scale-95"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Analyzing..." : "Refresh Digest"}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs for Digest */}
        <div className="flex items-center gap-2 pt-6 overflow-x-auto no-scrollbar">
          {[
            { id: "briefing", label: "Executive Briefing", icon: <BrainCircuit className="w-3.5 h-3.5" /> },
            { id: "agenda", label: `Priorities (${todayTasks.length})`, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            { id: "habits", label: `Habit Momentum (${habitsRemaining.length})`, icon: <Flame className="w-3.5 h-3.5" /> },
            { id: "insights", label: "Trajectory & Energy", icon: <TrendingUp className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
                  : darkMode
                  ? "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-black/5 border border-transparent"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === "briefing" && (
            <motion.div
              key="briefing"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Executive Clean Sentence Prose Container */}
              <div className={`p-6 rounded-2xl border ${
                darkMode ? "bg-zinc-900/60 border-white/10 text-zinc-200" : "bg-white border-zinc-200 text-zinc-800 shadow-sm"
              }`}>
                <div className="flex items-center gap-2 mb-4 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Synthesized Executive Summary</span>
                </div>

                <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans">
                  {digestContent}
                </div>
              </div>

              {/* Quick Highlight Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  darkMode ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-200"
                }`}>
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-mono">Deep Focus Target</p>
                    <p className="text-sm font-bold text-white">90 Min Block</p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  darkMode ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-200"
                }`}>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-mono">Orbit Harmony</p>
                    <p className="text-sm font-bold text-emerald-400">{harmonyScore}% Aligned</p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  darkMode ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-200"
                }`}>
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 font-mono">P1 Action Count</p>
                    <p className="text-sm font-bold text-amber-300">{p1Tasks.length} Urgent Tasks</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "agenda" && (
            <motion.div
              key="agenda"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-200 uppercase font-mono tracking-wider">
                  Today's Priority Action Checklist
                </h3>
                <button
                  onClick={() => onNavigateTab("tasks")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono"
                >
                  <span>Open Full Task Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 text-zinc-500 text-xs font-mono">
                  All tasks cleared! Great job maintaining momentum today.
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        darkMode ? "bg-zinc-900/50 border-white/5 hover:border-white/20" : "bg-white border-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleTask && onToggleTask(task.id)}
                          className="w-5 h-5 rounded-md border border-white/20 hover:border-indigo-400 flex items-center justify-center transition-colors"
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </button>
                        <span className="text-xs font-semibold text-zinc-200">{task.title}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md font-bold ${
                          task.priority === "P1" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-indigo-500/20 text-indigo-300"
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-zinc-500">{task.estimatedMinutes}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "habits" && (
            <motion.div
              key="habits"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-200 uppercase font-mono tracking-wider">
                  Habit Streaks & Daily Triggers
                </h3>
                <button
                  onClick={() => onNavigateTab("habits")}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                >
                  <span>Manage Habits</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      habit.completedToday
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                        : darkMode
                        ? "bg-zinc-900/50 border-white/5"
                        : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-200">{habit.title}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">Streak: {habit.streakCount} days</p>
                    </div>

                    <button
                      onClick={() => onToggleHabit && onToggleHabit(habit.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                        habit.completedToday
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white"
                      }`}
                    >
                      {habit.completedToday ? "Done ✓" : "Mark Done"}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-zinc-200 uppercase font-mono tracking-wider">
                Quarterly Trajectory & Focus Balance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  darkMode ? "bg-zinc-900/50 border-white/5" : "bg-white border-zinc-200"
                }`}>
                  <p className="text-xs font-mono text-zinc-400">Target Goal Trajectory</p>
                  <p className="text-sm font-bold text-white">{goals[0]?.title || "Peak Performance Alignment"}</p>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[72%]" />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono pt-1">72% Milestone Completion Rate</p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  darkMode ? "bg-zinc-900/50 border-white/5" : "bg-white border-zinc-200"
                }`}>
                  <p className="text-xs font-mono text-zinc-400">Biological Energy & Rest Window</p>
                  <p className="text-sm font-bold text-emerald-400">Optimal Peak Window: 9:00 AM - 11:30 AM</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Cortisol levels peak early. Reserve heavy analytical tasks for morning hours and creative/collaborative work for late afternoon.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
