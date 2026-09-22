import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from "recharts";
import { Task, Category, PriorityLevel } from "../types";
import { 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BrainCircuit, 
  Zap,
  Target,
  Layers
} from "lucide-react";

interface TaskAnalyticsWidgetProps {
  tasks: Task[];
  darkMode: boolean;
}

export const TaskAnalyticsWidget: React.FC<TaskAnalyticsWidgetProps> = ({
  tasks,
  darkMode,
}) => {
  const [activeTab, setActiveTab] = useState<"category" | "priority" | "focustime">("category");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Compute Task Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalEstMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  const completedEstMinutes = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  const p1Tasks = tasks.filter((t) => t.priority === "P1");
  const p1Completed = p1Tasks.filter((t) => t.completed).length;

  // Recharts Data: Category Breakdown
  const categoryData = useMemo(() => {
    const categories: Category[] = ["Work", "Personal", "Health", "Finance", "Learning", "Nutrition", "Fitness"];
    
    return categories
      .map((cat) => {
        const catTasks = tasks.filter((t) => t.category === cat);
        const total = catTasks.length;
        const completed = catTasks.filter((t) => t.completed).length;
        const totalMin = catTasks.reduce((s, t) => s + (t.estimatedMinutes || 0), 0);
        const completedMin = catTasks.filter((t) => t.completed).reduce((s, t) => s + (t.estimatedMinutes || 0), 0);
        
        return {
          name: cat,
          total,
          completed,
          pending: total - completed,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          totalMin,
          completedMin,
        };
      })
      .filter((d) => d.total > 0 || true); // Show categories or populated ones
  }, [tasks]);

  // Recharts Data: Priority Distribution
  const priorityData = useMemo(() => {
    const priorities: PriorityLevel[] = ["P1", "P2", "P3"];
    return priorities.map((p) => {
      const pTasks = tasks.filter((t) => t.priority === p);
      const total = pTasks.length;
      const completed = pTasks.filter((t) => t.completed).length;
      const totalMin = pTasks.reduce((s, t) => s + (t.estimatedMinutes || 0), 0);
      const completedMin = pTasks.filter((t) => t.completed).reduce((s, t) => s + (t.estimatedMinutes || 0), 0);

      return {
        priority: p === "P1" ? "P1 High" : p === "P2" ? "P2 Med" : "P3 Low",
        code: p,
        total,
        completed,
        pending: total - completed,
        totalMin,
        completedMin,
      };
    });
  }, [tasks]);

  // Recharts Data: Pie Chart Colors
  const CATEGORY_COLORS: Record<string, string> = {
    Work: "#6366f1",     // Indigo
    Personal: "#a855f7", // Purple
    Health: "#10b981",   // Emerald
    Finance: "#f59e0b",  // Amber
    Learning: "#06b6d4", // Cyan
    Nutrition: "#84cc16",// Lime
    Fitness: "#f43f5e",  // Rose
  };

  // Pie Data for Workload Distribution
  const pieData = useMemo(() => {
    return categoryData
      .filter((c) => c.total > 0)
      .map((c) => ({
        name: c.name,
        value: c.total,
        minutes: c.totalMin,
        color: CATEGORY_COLORS[c.name] || "#64748b",
      }));
  }, [categoryData]);

  // Function to fetch AI Task Analytics from Gemini via server
  const fetchGeminiAnalytics = async () => {
    setIsLoadingAi(true);
    try {
      const summaryPayload = {
        totalTasks,
        completedTasks,
        completionRate: `${completionRate}%`,
        totalMinutes: totalEstMinutes,
        completedMinutes: completedEstMinutes,
        p1Rate: p1Tasks.length ? `${p1Completed}/${p1Tasks.length}` : "N/A",
        categoryBreakdown: categoryData.map((c) => `${c.name}: ${c.completed}/${c.total} completed (${c.totalMin}m)`).join(", "),
      };

      const promptText = `Analyze this user task dataset and produce 3 crisp executive paragraphs on task completion patterns, category velocity, and 2 concrete strategies to improve focus efficiency today: ${JSON.stringify(summaryPayload)}`;

      const res = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "task_analytics",
          prompt: promptText,
          contextData: summaryPayload,
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setAiInsight(data.result);
      } else {
        generateDefaultInsight();
      }
    } catch (err) {
      console.error("Task analytics error:", err);
      generateDefaultInsight();
    } finally {
      setIsLoadingAi(false);
    }
  };

  const generateDefaultInsight = () => {
    const topCategory = [...categoryData].sort((a, b) => b.total - a.total)[0];
    const topCatName = topCategory ? topCategory.name : "Work";

    setAiInsight(
      `Your current task workload is heavily concentrated in ${topCatName} (${topCategory?.total || 0} tasks). You have completed ${completedTasks} out of ${totalTasks} total tasks (${completionRate}% overall throughput).\n\nKey Patterns:\n- High-Priority Execution: ${p1Completed}/${p1Tasks.length} P1 tasks fulfilled.\n- Focus Time Velocity: ${completedEstMinutes} out of ${totalEstMinutes} planned focus minutes achieved.\n\nRecommended Action: Protect a 45-minute morning focus window specifically for remaining P1 items in ${topCatName} to unlock peak momentum.`
    );
  };

  useEffect(() => {
    if (!aiInsight) {
      fetchGeminiAnalytics();
    }
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-3xl border transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/15 ${
        darkMode
          ? "bg-zinc-900/40 border-white/5 text-zinc-100 backdrop-blur-md"
          : "bg-white border-zinc-200 text-zinc-900 shadow-md"
      }`}
    >
      {/* Widget Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-white flex items-center gap-2">
                Task Analytics & Productivity Trends
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <BrainCircuit className="w-3 h-3 text-indigo-400" />
                  Gemini AI Powered
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Visual completion velocity, workload distribution, and AI optimization patterns
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-950/60 p-1 rounded-2xl border border-white/5 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("category")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "category"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Category</span>
          </button>
          <button
            onClick={() => setActiveTab("priority")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "priority"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Priority</span>
          </button>
          <button
            onClick={() => setActiveTab("focustime")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "focustime"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>Workload %</span>
          </button>
        </div>
      </div>

      {/* Top Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <div className="p-3.5 rounded-2xl border bg-zinc-900/60 border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Overall Throughput</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1">
              {completionRate}%
              <span className="text-[10px] text-zinc-500 font-sans">({completedTasks}/{totalTasks})</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border bg-zinc-900/60 border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Focus Time Completed</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-white">
              {completedEstMinutes}m
              <span className="text-xs text-zinc-500 font-sans ml-1">/ {totalEstMinutes}m</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">
              {totalEstMinutes > 0 ? `${Math.round((completedEstMinutes / totalEstMinutes) * 100)}% time achieved` : "No estimated time"}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border bg-zinc-900/60 border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>P1 Priority Rate</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-white">
              {p1Tasks.length > 0 ? Math.round((p1Completed / p1Tasks.length) * 100) : 100}%
              <span className="text-xs text-zinc-500 font-sans ml-1">({p1Completed}/{p1Tasks.length})</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">High priority tasks fulfilled</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border bg-zinc-900/60 border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Category Velocity</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-bold text-white truncate">
              {categoryData.find((c) => c.completed > 0)?.name || "Active"}
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
              Top completing category
            </p>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-zinc-950/70 p-4 rounded-2xl border border-white/5 mb-6">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "category" ? (
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    borderRadius: "12px",
                    color: "#f4f4f5",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="completed" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="pending" name="Pending Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            ) : activeTab === "priority" ? (
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="priority" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    borderRadius: "12px",
                    color: "#f4f4f5",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="completedMin" name="Completed Focus Minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} />
                <Bar dataKey="totalMin" name="Total Planned Focus Minutes" fill="#3f3f46" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: "No tasks", value: 1, color: "#3f3f46" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#3f3f46",
                    borderRadius: "12px",
                    color: "#f4f4f5",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any) => [`${val} tasks`, name]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gemini AI Executive Insights Section */}
      <div className="p-4 rounded-2xl border bg-indigo-950/30 border-indigo-500/20 text-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <h3 className="font-semibold text-xs text-indigo-200 uppercase tracking-wider font-mono">
              Gemini Productivity Intelligence & Patterns
            </h3>
          </div>
          <button
            onClick={fetchGeminiAnalytics}
            disabled={isLoadingAi}
            className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-mono transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh AI Insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? "animate-spin" : ""}`} />
            <span>{isLoadingAi ? "Analyzing..." : "Refresh Insights"}</span>
          </button>
        </div>

        {isLoadingAi ? (
          <div className="py-4 text-center space-y-2">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-indigo-400 border-t-transparent" />
            <p className="text-xs text-indigo-300/80 font-mono">Generating deep productivity pattern analysis...</p>
          </div>
        ) : (
          <div className="text-xs leading-relaxed space-y-2 text-indigo-100/90 font-sans whitespace-pre-line">
            {aiInsight}
          </div>
        )}
      </div>
    </motion.div>
  );
};
