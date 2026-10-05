import React, { useRef, useState } from "react";
import { Task, Category, PriorityLevel } from "../../types";
import { inferCategoryFromTitle } from "../../lib/tagger";
import { TaskQuickLookModal } from "../TaskQuickLookModal";
import { TaskAnalyticsWidget } from "../TaskAnalyticsWidget";
import { 
  CheckSquare, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  List, 
  Kanban, 
  Clock, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Filter,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Archive,
  RotateCcw,
  Eye,
  BarChart3
} from "lucide-react";

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (t: Omit<Task, "id" | "createdAt">) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUnarchiveTask?: (id: string) => void;
  onReorderTasks?: (newTasks: Task[]) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtasksToTask: (taskId: string, subtasks: { id: string; title: string; completed: boolean; estimatedMinutes?: number }[]) => void;
  onOpenQuickAdd: () => void;
  darkMode: boolean;
}

export const getCategoryBadgeStyle = (category: string) => {
  switch (category) {
    case "Work":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30";
    case "Personal":
      return "bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30";
    case "Health":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30";
    case "Finance":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30";
    case "Learning":
      return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30";
    case "Nutrition":
      return "bg-lime-500/15 text-lime-600 dark:text-lime-300 border border-lime-500/30";
    case "Fitness":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30";
    default:
      return "bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/30";
  }
};

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUnarchiveTask,
  onReorderTasks,
  onToggleSubtask,
  onAddSubtasksToTask,
  onOpenQuickAdd,
  darkMode,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "analytics">("list");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);
  const [quickLookTaskId, setQuickLookTaskId] = useState<string | null>(null);
  const quickLookTask = tasks.find((task) => task.id === quickLookTaskId) ?? null;
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  // New task quick input state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<Category>("Work");
  const [isCategoryManual, setIsCategoryManual] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>("P2");

  const quickInferred = inferCategoryFromTitle(newTaskTitle);

  const handleTitleChange = (val: string) => {
    setNewTaskTitle(val);
    if (!isCategoryManual) {
      const inferred = inferCategoryFromTitle(val);
      setNewTaskCategory(inferred.category);
    }
  };

  const archivedCount = tasks.filter((t) => t.archived).length;

  const filteredTasks = tasks.filter((t) => {
    const matchesArchived = showArchived ? Boolean(t.archived) : !t.archived;
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesPriority = selectedPriority === "All" || t.priority === selectedPriority;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesArchived && matchesCategory && matchesPriority && matchesSearch;
  });

  // Task Reorder Up/Down logic
  const reorderVisibleTasks = (taskId: string, targetId: string) => {
    if (!onReorderTasks || taskId === targetId) return;
    const currentIndex = filteredTasks.findIndex((task) => task.id === taskId);
    const targetIndex = filteredTasks.findIndex((task) => task.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;

    const reordered = [...filteredTasks];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    const visibleIds = new Set(filteredTasks.map((task) => task.id));
    let visibleIndex = 0;
    onReorderTasks(tasks.map((task) => visibleIds.has(task.id) ? reordered[visibleIndex++] : task));
  };

  const handleMoveTask = (taskId: string, direction: "up" | "down") => {
    const currentIndex = filteredTasks.findIndex((t) => t.id === taskId);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredTasks.length) return;
    reorderVisibleTasks(taskId, filteredTasks[targetIndex].id);
  };

  // Drag & Drop handlers
  const resetDrag = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!onReorderTasks) {
      e.preventDefault();
      return;
    }
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!draggedTaskId || !onReorderTasks) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragOverTaskId) {
      setDragOverTaskId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedTaskId) reorderVisibleTasks(draggedTaskId, targetId);
    resetDrag();
  };

  const handleKanbanColumnDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedTask = filteredTasks.find((task) => task.id === draggedTaskId);
    if (!draggedTask || !onReorderTasks) {
      resetDrag();
      return;
    }
    const currentColumn = draggedTask.completed ? "done" : draggedTask.priority === "P1" ? "todo" : "inprogress";
    if (currentColumn === columnId) {
      resetDrag();
      return;
    }

    const updated = tasks.map((t) => {
      if (t.id === draggedTaskId) {
        if (columnId === "done") {
          return { ...t, completed: true };
        } else if (columnId === "todo") {
          return { ...t, completed: false, priority: "P1" as PriorityLevel };
        } else if (columnId === "inprogress") {
          return { ...t, completed: false, priority: "P2" as PriorityLevel };
        }
      }
      return t;
    });

    if (onReorderTasks) {
      onReorderTasks(updated);
    }

    resetDrag();
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const inferred = inferCategoryFromTitle(newTaskTitle);
    const categoryToUse = newTaskCategory;
    const autoTags = Array.from(new Set([
      categoryToUse.toLowerCase(),
      ...inferred.matchedKeywords
    ]));

    onAddTask({
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      category: categoryToUse,
      estimatedMinutes: 30,
      completed: false,
      dueDate: new Date().toISOString().split("T")[0],
      tags: autoTags,
      subtasks: [],
    });

    setNewTaskTitle("");
    setNewTaskCategory("Work");
    setNewTaskPriority("P2");
    setIsCategoryManual(false);
    newTaskInputRef.current?.focus();
  };

  const handleAiBreakdown = async (task: Task) => {
    setLoadingAiId(task.id);
    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "breakdown_task",
          prompt: task.title,
        }),
      });

      const data = await response.json();
      const resultText = data.result || "";

      // Extract lines from AI result to generate subtasks
      const lines = resultText
        .split("\n")
        .map((l: string) => l.replace(/^[0-9+*-.\s]+/, "").trim())
        .filter((l: string) => l.length > 5 && !l.startsWith("#"));

      const generatedSubtasks = lines.slice(0, 4).map((line: string, idx: number) => ({
        id: `gen-sub-${Date.now()}-${idx}`,
        title: line,
        completed: false,
        estimatedMinutes: 15,
      }));

      if (generatedSubtasks.length > 0) {
        onAddSubtasksToTask(task.id, generatedSubtasks);
        setExpandedTaskId(task.id);
      }
    } catch (err) {
      console.error("Task AI breakdown error:", err);
    } finally {
      setLoadingAiId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-500" />
            <span>Tasks & Priorities</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Intelligently organized action items with AI auto-breakdown and priority matrix.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="p-1 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "list" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "kanban" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "analytics" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form onSubmit={handleQuickSubmit} className={`p-4 rounded-2xl border shadow-sm flex flex-col gap-2 ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        {!isCategoryManual && newTaskTitle.trim() && quickInferred.matchedKeywords.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-mono">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span className="flex items-center gap-1.5">
              Auto-categorized as
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getCategoryBadgeStyle(quickInferred.category)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {quickInferred.category}
              </span>
              (keywords: {quickInferred.matchedKeywords.join(", ")})
            </span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={newTaskInputRef}
            aria-label="Task title"
            type="text"
            placeholder="Add a new priority task (e.g. Schedule doctor checkup, Pay rent, Cook dinner)..."
            value={newTaskTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="min-w-0 flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center space-x-2">
            <select
              aria-label="Task category"
              value={newTaskCategory}
              onChange={(e) => {
                setNewTaskCategory(e.target.value as Category);
                setIsCategoryManual(true);
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Finance">Finance</option>
              <option value="Learning">Learning</option>
              <option value="Nutrition">Nutrition</option>
              <option value="Fitness">Fitness</option>
            </select>
            <select
              aria-label="Task priority"
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as PriorityLevel)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="P1">P1 High</option>
              <option value="P2">P2 Med</option>
              <option value="P3">P3 Low</option>
            </select>
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      </form>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          <span className="text-slate-400 flex items-center gap-1 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {["All", "Work", "Personal", "Health", "Finance", "Learning", "Nutrition", "Fitness"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : cat === "All"
                  ? "bg-slate-200/60 dark:bg-slate-800 text-slate-400 hover:text-slate-200"
                  : `${getCategoryBadgeStyle(cat)} opacity-80 hover:opacity-100`
              }`}
            >
              {cat !== "All" && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
              {cat}
            </button>
          ))}

          {archivedCount > 0 && (
            <button
              onClick={() => setShowArchived((prev) => !prev)}
              className={`px-3 py-1 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                showArchived
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-slate-200/60 dark:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>{showArchived ? "Archived View" : `Archive (${archivedCount})`}</span>
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Filter tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
        />
      </div>

      {showArchived && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-400" />
            <span>Showing auto-archived tasks older than 30 days. These items are kept preserved to maintain optimal view performance.</span>
          </div>
          <button
            onClick={() => setShowArchived(false)}
            className="text-[11px] font-bold underline hover:text-white"
          >
            Back to Active
          </button>
        </div>
      )}

      {/* Render View: ANALYTICS MODE */}
      {viewMode === "analytics" && (
        <TaskAnalyticsWidget tasks={tasks} darkMode={darkMode} />
      )}

      {/* Render View: LIST MODE */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className={`p-8 text-center rounded-3xl border ${
              darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"
            }`}>
              <CheckSquare className="w-10 h-10 mx-auto text-indigo-500/50 mb-2" />
              <p className="font-bold text-sm">No tasks matching filters</p>
              <p className="text-xs text-slate-500 mt-1">Add a new task using the capture bar above.</p>
            </div>
          ) : (
            filteredTasks.map((t, idx) => {
              const isExpanded = expandedTaskId === t.id;
              const isAiLoading = loadingAiId === t.id;
              const isDragging = draggedTaskId === t.id;
              const isDragOver = dragOverTaskId === t.id;

              return (
                <div
                  key={t.id}
                  onDragOver={(e) => handleDragOver(e, t.id)}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragOverTaskId(null);
                  }}
                  onDrop={(e) => handleDrop(e, t.id)}
                  className={`p-4 rounded-2xl border transition-all duration-150 ${
                    isDragging ? "opacity-30 border-dashed border-indigo-500" : ""
                  } ${
                    isDragOver ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/5" : ""
                  } ${
                    t.completed
                      ? "opacity-60 bg-slate-100/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
                      : darkMode
                      ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0 w-full sm:w-auto flex-1">
                      {/* Drag Handle */}
                      <button
                        type="button"
                        draggable={Boolean(onReorderTasks)}
                        disabled={!onReorderTasks}
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onDragEnd={resetDrag}
                        aria-label={`Drag to reorder ${t.title}`}
                        className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-indigo-400 shrink-0"
                        title="Drag to reorder task"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onToggleTask(t.id)}
                        className="mt-0.5 text-indigo-500 shrink-0"
                      >
                        {t.completed ? <CheckCircle2 className="w-5 h-5 fill-indigo-500 text-white" /> : <Circle className="w-5 h-5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickLookTaskId(t.id)}
                        className="min-w-0 flex-1 text-left cursor-pointer group"
                        aria-label={`Quick look: ${t.title}`}
                      >
                        <span className={`block text-sm font-bold truncate group-hover:text-indigo-400 transition-colors ${t.completed ? "line-through text-slate-500" : ""}`}>
                          {t.title}
                        </span>

                        <span className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            t.priority === "P1" ? "bg-rose-500/20 text-rose-400" : t.priority === "P2" ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"
                          }`}>
                            {t.priority}
                          </span>

                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${getCategoryBadgeStyle(t.category)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                            {t.category}
                          </span>

                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t.estimatedMinutes}m
                          </span>

                          {t.subtasks && t.subtasks.length > 0 && (
                            <span className="text-[10px] text-indigo-400 font-semibold">
                              {t.subtasks.filter((s) => s.completed).length}/{t.subtasks.length} subtasks
                            </span>
                          )}
                        </span>
                      </button>
                    </div>

                    {/* Up / Down Controls & Actions */}
                    <div className="flex flex-wrap items-center gap-1 shrink-0">
                      <button
                        onClick={() => setQuickLookTaskId(t.id)}
                        aria-label={`Quick look: ${t.title}`}
                        className="p-1.5 rounded-lg bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Quick Look"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="hidden sm:inline">Quick Look</span>
                      </button>

                      <div className="flex items-center space-x-0.5 mr-1 border-r border-slate-200 dark:border-slate-800 pr-1">
                        <button
                          onClick={() => handleMoveTask(t.id, "up")}
                          disabled={!onReorderTasks || idx === 0}
                          aria-label={`Move ${t.title} up`}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 transition-all"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveTask(t.id, "down")}
                          disabled={!onReorderTasks || idx === filteredTasks.length - 1}
                          aria-label={`Move ${t.title} down`}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 transition-all"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleAiBreakdown(t)}
                        disabled={isAiLoading}
                        className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Auto-Breakdown Task with Orbit AI"
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isAiLoading ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">AI Breakdown</span>
                      </button>

                      {t.subtasks && t.subtasks.length > 0 && (
                        <button
                          onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}

                      {t.archived && onUnarchiveTask && (
                        <button
                          onClick={() => onUnarchiveTask(t.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-all"
                          title="Restore task to active list"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Restore</span>
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtasks Accordion */}
                  {isExpanded && t.subtasks && t.subtasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 space-y-2 pl-8">
                      {t.subtasks.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => onToggleSubtask(t.id, st.id)}
                          className="flex items-center space-x-2 text-xs cursor-pointer text-slate-400 hover:text-slate-200"
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${st.completed ? "text-indigo-500 fill-indigo-500 text-white" : "text-slate-600"}`} />
                          <span className={st.completed ? "line-through opacity-60" : ""}>{st.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Render View: KANBAN MODE */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: "todo", title: "To Do (High Priority)", tasksList: filteredTasks.filter((t) => !t.completed && t.priority === "P1") },
            { id: "inprogress", title: "In Progress / Medium", tasksList: filteredTasks.filter((t) => !t.completed && t.priority !== "P1") },
            { id: "done", title: "Completed", tasksList: filteredTasks.filter((t) => t.completed) },
          ].map((col) => (
            <div
              key={col.id}
              onDragOver={(e) => {
                if (draggedTaskId && onReorderTasks) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }
              }}
              onDrop={(e) => handleKanbanColumnDrop(e, col.id)}
              className={`p-4 rounded-3xl border space-y-3 min-h-[280px] transition-all ${
                darkMode ? "bg-slate-900/60 border-slate-800" : "bg-slate-100/50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between font-extrabold text-sm border-b pb-2 border-slate-200/50 dark:border-slate-800">
                <span>{col.title}</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-mono">
                  {col.tasksList.length}
                </span>
              </div>

              <div className="space-y-3">
                {col.tasksList.map((t) => (
                  <div
                    key={t.id}
                    draggable={Boolean(onReorderTasks)}
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    onDragEnd={resetDrag}
                    className={`p-3.5 rounded-2xl border shadow-sm space-y-2 cursor-grab active:cursor-grabbing hover:border-indigo-500/50 transition-all ${
                      darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="w-3.5 h-3.5 text-slate-500" />
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          t.priority === "P1" ? "bg-rose-500/20 text-rose-400" : "bg-indigo-500/20 text-indigo-400"
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <button onClick={() => onToggleTask(t.id)} className="text-slate-400 hover:text-indigo-400">
                        {t.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuickLookTaskId(t.id)}
                      className="w-full text-left cursor-pointer group"
                      aria-label={`Quick look: ${t.title}`}
                    >
                      <span className="text-xs font-bold line-clamp-2 group-hover:text-indigo-400 transition-colors">{t.title}</span>
                    </button>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/30 dark:border-slate-800/60">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${getCategoryBadgeStyle(t.category)}`}>
                        <span className="w-1 h-1 rounded-full bg-current opacity-80" />
                        {t.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{t.estimatedMinutes}m</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickLookTaskId(t.id);
                          }}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                          title="Quick Look"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Look Modal */}
      <TaskQuickLookModal
        key={quickLookTask?.id ?? "closed"}
        task={quickLookTask}
        isOpen={Boolean(quickLookTask)}
        onClose={() => setQuickLookTaskId(null)}
        onToggleTask={onToggleTask}
        onToggleSubtask={onToggleSubtask}
        onDeleteTask={onDeleteTask}
        onAddSubtask={(taskId, title) => {
          onAddSubtasksToTask(taskId, [{ id: `sub-${crypto.randomUUID()}`, title, completed: false }]);
        }}
        darkMode={darkMode}
      />
    </div>
  );
};
