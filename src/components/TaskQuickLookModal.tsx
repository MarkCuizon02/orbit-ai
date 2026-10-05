import React, { useEffect, useRef, useState } from "react";
import { Task } from "../types";
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Tag,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  FileText
} from "lucide-react";

interface TaskQuickLookModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask?: (id: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  darkMode: boolean;
}

export const TaskQuickLookModal: React.FC<TaskQuickLookModalProps> = ({
  task,
  isOpen,
  onClose,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onAddSubtask,
  darkMode,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !task) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen, task?.id]);

  if (!isOpen || !task) return null;

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !onAddSubtask) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
    subtaskInputRef.current?.focus();
  };

  const priorityStyles = {
    P1: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    P2: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    P3: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  }[task.priority];

  const categoryBadgeColors = {
    Work: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Personal: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    Health: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Finance: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Learning: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    Nutrition: "bg-lime-500/10 text-lime-400 border-lime-500/30",
    Fitness: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  }[task.category] || "bg-slate-500/10 text-slate-400 border-slate-500/30";

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = task.subtasks.length;
  const subtaskProgress = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-quick-look-title"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onClose();
          }
          if (event.key !== "Tab") return;
          const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'
          ));
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (!first || !last) {
            event.preventDefault();
            return;
          }
          if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === event.currentTarget)) {
            event.preventDefault();
            first.focus();
          }
        }}
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-500/5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Quick Look
            </span>
          </div>

          <button
            aria-label="Close quick look"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Status */}
          <div className="flex items-start space-x-3.5">
            <button
              onClick={() => onToggleTask(task.id)}
              className="mt-0.5 text-indigo-500 shrink-0 hover:scale-110 transition-transform"
              title="Toggle task completion"
            >
              {task.completed ? (
                <CheckCircle2 className="w-6 h-6 fill-indigo-500 text-white" />
              ) : (
                <Circle className="w-6 h-6 text-slate-400 hover:text-indigo-400" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <h2 id="task-quick-look-title" className={`text-lg font-bold leading-snug break-words ${task.completed ? "line-through text-slate-500" : ""}`}>
                {task.title}
              </h2>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityStyles}`}>
                  Priority {task.priority}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${categoryBadgeColors}`}>
                  {task.category}
                </span>
                {task.archived && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30">
                    Archived
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Estimate</p>
                <p className="font-bold">{task.estimatedMinutes} mins</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Due Date</p>
                <p className="font-bold">{task.dueDate || "Today"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
              <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Subtasks</p>
                <p className="font-bold">{completedSubtasksCount} / {totalSubtasksCount}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Notes
              </p>
              <p className="text-xs p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/30 text-slate-300 border border-slate-200/30 dark:border-slate-800 whitespace-pre-wrap">
                {task.notes}
              </p>
            </div>
          )}

          {/* Subtasks Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Subtasks ({completedSubtasksCount}/{totalSubtasksCount})
              </p>
              {totalSubtasksCount > 0 && (
                <span className="text-[10px] font-mono font-bold text-indigo-400">
                  {subtaskProgress}%
                </span>
              )}
            </div>

            {totalSubtasksCount > 0 && (
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            )}

            <div className="space-y-2">
              {task.subtasks.map((st) => (
                <button
                  type="button"
                  key={st.id}
                  aria-pressed={st.completed}
                  onClick={() => onToggleSubtask(task.id, st.id)}
                  className="w-full text-left flex items-center space-x-2.5 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-slate-500/5 hover:bg-slate-500/10 cursor-pointer transition-all text-xs"
                >
                  <span className="text-indigo-400 shrink-0">
                    {st.completed ? (
                      <CheckCircle2 className="w-4 h-4 fill-indigo-500 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400" />
                    )}
                  </span>
                  <span className={`min-w-0 flex-1 break-words ${st.completed ? "line-through text-slate-500" : ""}`}>
                    {st.title}
                  </span>
                  {st.estimatedMinutes && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {st.estimatedMinutes}m
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Add Subtask Form */}
            {onAddSubtask && (
              <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 pt-1">
                <input
                  ref={subtaskInputRef}
                  aria-label="Subtask title"
                  type="text"
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="min-w-0 flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800 bg-slate-500/5 flex items-center justify-between">
          {onDeleteTask && (
            <button
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Task
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
