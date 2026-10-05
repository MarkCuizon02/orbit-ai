import React, { useEffect, useState } from "react";
import { 
  X, 
  Plus, 
  CheckSquare, 
  Flame, 
  Dumbbell, 
  Utensils, 
  CreditCard, 
  FileText, 
  Target, 
  Sparkles,
  Zap
} from "lucide-react";
import { 
  Task, 
  Habit, 
  WorkoutLog, 
  MealPlanItem, 
  BillItem, 
  NoteItem, 
  GoalItem, 
  Category, 
  PriorityLevel 
} from "../types";
import { inferCategoryFromTitle } from "../lib/tagger";

interface CommandPaletteProps {
  isOpen: boolean;
  initialType?: AddType;
  onClose: () => void;
  onAddTask: (t: Omit<Task, "id" | "createdAt">) => void;
  onAddHabit: (h: Omit<Habit, "id" | "completedToday" | "historyMap">) => void;
  onAddWorkout: (w: Omit<WorkoutLog, "id">) => void;
  onAddMeal: (m: Omit<MealPlanItem, "id" | "consumed">) => void;
  onAddBill: (b: Omit<BillItem, "id" | "status">) => void;
  onAddNote: (n: Omit<NoteItem, "id" | "updatedAt">) => void;
  onAddGoal: (g: Omit<GoalItem, "id">) => void;
  onAskCopilot: (prompt: string) => void;
  darkMode: boolean;
}

type AddType = "task" | "habit" | "workout" | "meal" | "bill" | "note" | "goal" | "ai";

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  initialType,
  onClose,
  onAddTask,
  onAddHabit,
  onAddWorkout,
  onAddMeal,
  onAddBill,
  onAddNote,
  onAddGoal,
  onAskCopilot,
  darkMode,
}) => {
  const [activeType, setActiveType] = useState<AddType>(initialType ?? "task");

  useEffect(() => {
    if (isOpen && initialType) setActiveType(initialType);
  }, [isOpen, initialType]);

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState<Category>("Work");
  const [isCategoryManuallySelected, setIsCategoryManuallySelected] = useState(false);
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>("P2");
  const [taskMinutes, setTaskMinutes] = useState(30);

  // Auto heuristic detection
  const heuristicResult = inferCategoryFromTitle(taskTitle);

  const handleTaskTitleChange = (val: string) => {
    setTaskTitle(val);
    if (!isCategoryManuallySelected) {
      const inferred = inferCategoryFromTitle(val);
      if (val.trim() && inferred.matchedKeywords.length > 0) {
        setTaskCategory(inferred.category);
      }
    }
  };

  // Habit form state
  const [habitTitle, setHabitTitle] = useState("");
  const [habitCategory, setHabitCategory] = useState<Category>("Health");
  const [habitTimeOfDay, setHabitTimeOfDay] = useState<"Morning" | "Afternoon" | "Evening" | "Anytime">("Morning");

  // Workout form state
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutType, setWorkoutType] = useState<"Strength" | "Cardio" | "HIIT" | "Yoga">("Strength");
  const [workoutDuration, setWorkoutDuration] = useState(30);

  // Meal form state
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Lunch");
  const [mealCalories, setMealCalories] = useState(500);

  // Bill form state
  const [billName, setBillName] = useState("");
  const [billAmount, setBillAmount] = useState(1500);
  const [billDueDate, setBillDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [billCategory, setBillCategory] = useState<"Utilities" | "Housing" | "Subscription" | "Insurance" | "Debt" | "Other">("Subscription");
  const [billIsRecurring, setBillIsRecurring] = useState(true);
  const [isCategorizingBill, setIsCategorizingBill] = useState(false);
  const [aiCategoryReasoning, setAiCategoryReasoning] = useState<string | null>(null);

  // Note form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Goal form state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState(100);

  // AI Prompt
  const [aiPrompt, setAiPrompt] = useState("");

  const handleAiCategorizeBill = async () => {
    if (!billName.trim()) return;
    setIsCategorizingBill(true);
    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_bill",
          prompt: billName.trim(),
          contextData: {},
        }),
      });
      const data = await response.json();
      let cleanText = (data.result || "").replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanText);
      if (parsed.category) {
        setBillCategory(parsed.category);
        setAiCategoryReasoning(`AI Auto-Categorized as "${parsed.category}" (${parsed.confidence}% confidence): ${parsed.reasoning}`);
      }
    } catch (e) {
      // Local fallback categorization
      const lower = billName.toLowerCase();
      let cat: any = "Other";
      if (/netflix|spotify|disney|hbo|youtube|apple|prime|chatgpt|gym|adobe|icloud|patreon/i.test(lower)) cat = "Subscription";
      else if (/meralco|electric|water|power|gas|pldt|globe|smart|telecom|internet|wifi|utility/i.test(lower)) cat = "Utilities";
      else if (/rent|condo|apartment|mortgage|lease|landlord|hoa|housing/i.test(lower)) cat = "Housing";
      else if (/insurance|generali|axa|prudential|health|life|hmo|car insurance/i.test(lower)) cat = "Insurance";
      else if (/credit card|loan|bpi|bdo|debt|interest/i.test(lower)) cat = "Debt";

      setBillCategory(cat);
      setAiCategoryReasoning(`AI Auto-Categorized as "${cat}" based on title semantics.`);
    } finally {
      setIsCategorizingBill(false);
    }
  };

  if (!isOpen) return null;

  const getTodayIso = () => new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeType === "note" && !noteTitle.trim()) return;
    if (activeType === "task" && taskTitle.trim()) {
      const inferred = inferCategoryFromTitle(taskTitle);
      const categoryToUse = taskCategory;
      const autoTags = Array.from(new Set([
        categoryToUse.toLowerCase(),
        ...inferred.matchedKeywords
      ]));

      onAddTask({
        title: taskTitle.trim(),
        priority: taskPriority,
        category: categoryToUse,
        estimatedMinutes: Number(taskMinutes) || 30,
        completed: false,
        dueDate: getTodayIso(),
        tags: autoTags,
        subtasks: [],
      });
      setTaskTitle("");
      setIsCategoryManuallySelected(false);
    } else if (activeType === "habit" && habitTitle.trim()) {
      onAddHabit({
        title: habitTitle.trim(),
        category: habitCategory,
        frequency: "daily",
        streakCount: 0,
        iconName: "Flame",
        timeOfDay: habitTimeOfDay,
        targetCountPerWeek: 7,
      });
      setHabitTitle("");
    } else if (activeType === "workout" && workoutTitle.trim()) {
      onAddWorkout({
        title: workoutTitle.trim(),
        type: workoutType,
        durationMinutes: Number(workoutDuration) || 30,
        caloriesBurned: workoutDuration * 8,
        intensity: "Moderate",
        exercises: [],
        date: getTodayIso(),
      });
      setWorkoutTitle("");
    } else if (activeType === "meal" && mealName.trim()) {
      onAddMeal({
        name: mealName.trim(),
        mealType,
        calories: Number(mealCalories) || 450,
        proteinGrams: Math.round(mealCalories * 0.06),
        carbsGrams: Math.round(mealCalories * 0.1),
        fatGrams: Math.round(mealCalories * 0.02),
        ingredients: [],
        date: getTodayIso(),
      });
      setMealName("");
    } else if (activeType === "bill" && billName.trim()) {
      onAddBill({
        name: billName.trim(),
        amount: Number(billAmount) || 25,
        dueDate: billDueDate,
        category: billCategory,
        recurringFrequency: billIsRecurring ? "Monthly" : "One-time",
        autoPay: false,
        isRecurring: billIsRecurring,
      });
      setBillName("");
      setAiCategoryReasoning(null);
    } else if (activeType === "note" && noteTitle.trim()) {
      onAddNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: "Personal",
        tags: ["quick-note"],
        isPinned: false,
      });
      setNoteTitle("");
      setNoteContent("");
    } else if (activeType === "goal" && goalTitle.trim()) {
      onAddGoal({
        title: goalTitle.trim(),
        description: "Orbit strategic objective",
        timeframe: "Q4 2026",
        category: "Personal",
        targetValue: Number(goalTarget) || 100,
        currentValue: 0,
        unit: "%",
        color: "indigo",
        milestones: [{ id: "m-new", title: "Setup core roadmap", completed: false }],
        linkedTaskIds: [],
      });
      setGoalTitle("");
    } else if (activeType === "ai" && aiPrompt.trim()) {
      onAskCopilot(aiPrompt.trim());
      setAiPrompt("");
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        id="command-palette-modal"
        className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden transition-all transform ${
          darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-indigo-500 animate-bounce" />
            <span className="font-bold text-base">Orbit Quick Capture</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1 p-2 overflow-x-auto border-b border-slate-200/50 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/40">
          {[
            { id: "task", label: "Task", icon: <CheckSquare className="w-4 h-4" /> },
            { id: "habit", label: "Habit", icon: <Flame className="w-4 h-4" /> },
            { id: "workout", label: "Workout", icon: <Dumbbell className="w-4 h-4" /> },
            { id: "meal", label: "Meal", icon: <Utensils className="w-4 h-4" /> },
            { id: "bill", label: "Bill", icon: <CreditCard className="w-4 h-4" /> },
            { id: "note", label: "Note", icon: <FileText className="w-4 h-4" /> },
            { id: "goal", label: "Goal", icon: <Target className="w-4 h-4" /> },
            { id: "ai", label: "Orbit AI", icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id as AddType)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeType === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : darkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {activeType === "task" && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-400">Task Title</label>
                  {taskTitle.trim() && heuristicResult.matchedKeywords.length > 0 && (
                    <span className="text-[10px] text-indigo-400 font-mono font-medium flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                      Auto-tagged: {heuristicResult.category} ({heuristicResult.matchedKeywords.slice(0, 2).join(", ")})
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., Schedule doctor checkup or Review project strategy..."
                  value={taskTitle}
                  onChange={(e) => handleTaskTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-400">Category</label>
                    {!isCategoryManuallySelected && heuristicResult.matchedKeywords.length > 0 && (
                      <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Auto</span>
                    )}
                  </div>
                  <select
                    value={taskCategory}
                    onChange={(e) => {
                      setTaskCategory(e.target.value as Category);
                      setIsCategoryManuallySelected(true);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs focus:outline-none"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Learning">Learning</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Fitness">Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs focus:outline-none"
                  >
                    <option value="P1">P1 — High</option>
                    <option value="P2">P2 — Medium</option>
                    <option value="P3">P3 — Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={taskMinutes}
                    onChange={(e) => setTaskMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeType === "habit" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Drink 20oz water after waking..."
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs"
                  >
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                    <option value="Nutrition">Nutrition</option>
                    <option value="Fitness">Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Time of Day</label>
                  <select
                    value={habitTimeOfDay}
                    onChange={(e) => setHabitTimeOfDay(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeType === "workout" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Workout Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 30-Min Upper Body Strength..."
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Type</label>
                  <select
                    value={workoutType}
                    onChange={(e) => setWorkoutType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Yoga">Yoga</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeType === "meal" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Meal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grilled Chicken Quinoa Salad..."
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Estimated Calories</label>
                  <input
                    type="number"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {activeType === "bill" && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-400">Bill / Subscription Name</label>
                  <button
                    type="button"
                    onClick={handleAiCategorizeBill}
                    disabled={isCategorizingBill || !billName.trim()}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-40"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{isCategorizingBill ? "Categorizing..." : "AI Auto-Categorize"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., Meralco Power, Netflix HD, Condo Rent..."
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={billCategory}
                    onChange={(e) => setBillCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Housing">Housing</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Debt">Debt</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Amount (₱)</label>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                />
              </div>

              {aiCategoryReasoning && (
                <p className="text-[11px] text-indigo-300 font-medium bg-indigo-500/10 border border-indigo-500/30 p-2 rounded-xl">
                  {aiCategoryReasoning}
                </p>
              )}

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={billIsRecurring}
                    onChange={(e) => setBillIsRecurring(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                  />
                  <span>Mark as <strong>Recurring Expense</strong> (Auto-creates next month's entry when paid)</span>
                </label>
              </div>
            </div>
          )}

          {activeType === "note" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Weekly Reflection Ideas..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Note Content</label>
                <textarea
                  rows={3}
                  placeholder="Key thoughts, scratchpad markdown, or reflections..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeType === "goal" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Goal Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Read 12 Books or Reach $10k Savings..."
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Numeric Value</label>
                <input
                  type="number"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                />
              </div>
            </div>
          )}

          {activeType === "ai" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Orbit AI Directive
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Optimize my afternoon focus schedule or auto-breakdown my project..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Orbit AI Copilot will analyze your life OS parameters and execute recommendations immediately.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={activeType === "note" && !noteTitle.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{activeType === "ai" ? "Ask Orbit AI" : `Add ${activeType}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
