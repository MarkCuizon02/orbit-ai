import React, { useState, useEffect } from "react";
import { 
  Task, 
  ScheduleEvent, 
  Habit, 
  WorkoutLog, 
  MealPlanItem, 
  BillItem, 
  NoteItem, 
  GoalItem, 
  UserOrbitProfile 
} from "./types";
import { OrbitStorage, calculateHarmonyScore } from "./lib/storage";
import { autoArchiveOldItems } from "./lib/archiver";
import { Navigation, NavTab } from "./components/Navigation";
import { CommandPalette } from "./components/CommandPalette";
import { OrbitCopilotDrawer } from "./components/OrbitCopilotDrawer";
import { ToastSystem, ToastMessage } from "./components/ToastSystem";
import { LandingPage } from "./components/LandingPage";
import { AuthModal, AuthMode } from "./components/AuthModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { subscribeToAuth, logoutUser } from "./auth";
import { subscribeUserCollection, getUserProfile } from "./firestore";
import { User } from "firebase/auth";
import { Zap, Minimize2, Maximize2 } from "lucide-react";

import { DashboardView } from "./components/views/DashboardView";
import { TasksView } from "./components/views/TasksView";
import { ScheduleView } from "./components/views/ScheduleView";
import { HabitsView } from "./components/views/HabitsView";
import { FitnessView } from "./components/views/FitnessView";
import { MealsView } from "./components/views/MealsView";
import { BillsView } from "./components/views/BillsView";
import { NotesView } from "./components/views/NotesView";
import { GoalsView } from "./components/views/GoalsView";

export default function App() {
  const [viewMode, setViewMode] = useState<"landing" | "workspace">("landing");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>(undefined);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Core Orbit OS State
  const [profile, setProfile] = useState<UserOrbitProfile>(OrbitStorage.getProfile());
  const [tasks, setTasks] = useState<Task[]>(OrbitStorage.getTasks());
  const [schedule, setSchedule] = useState<ScheduleEvent[]>(OrbitStorage.getSchedule());
  const [habits, setHabits] = useState<Habit[]>(OrbitStorage.getHabits());
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(OrbitStorage.getWorkouts());
  const [meals, setMeals] = useState<MealPlanItem[]>(OrbitStorage.getMeals());
  const [bills, setBills] = useState<BillItem[]>(OrbitStorage.getBills());
  const [notes, setNotes] = useState<NoteItem[]>(OrbitStorage.getNotes());
  const [goals, setGoals] = useState<GoalItem[]>(OrbitStorage.getGoals());

  // Firebase Auth Subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or sync user profile
        const remoteProfile = await getUserProfile(user.uid);
        if (remoteProfile) {
          setProfile((prev) => ({
            ...prev,
            ...remoteProfile,
            name: remoteProfile.name || user.displayName || prev.name,
            email: user.email || prev.email,
          }));
        } else {
          setProfile((prev) => ({
            ...prev,
            name: user.displayName || user.email?.split("@")[0] || prev.name,
            email: user.email || prev.email,
          }));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Subscriptions when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const unsubTasks = subscribeUserCollection<Task>("tasks", currentUser.uid, (remoteTasks) => {
      if (remoteTasks.length > 0) setTasks(remoteTasks);
    });
    const unsubSchedule = subscribeUserCollection<ScheduleEvent>("schedule", currentUser.uid, (remoteEvents) => {
      if (remoteEvents.length > 0) setSchedule(remoteEvents);
    });
    const unsubHabits = subscribeUserCollection<Habit>("habits", currentUser.uid, (remoteHabits) => {
      if (remoteHabits.length > 0) setHabits(remoteHabits);
    });

    return () => {
      unsubTasks();
      unsubSchedule();
      unsubHabits();
    };
  }, [currentUser]);

  // UI Drawer / Modal States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to storage on change
  useEffect(() => { OrbitStorage.saveTasks(tasks); }, [tasks]);
  useEffect(() => { OrbitStorage.saveSchedule(schedule); }, [schedule]);
  useEffect(() => { OrbitStorage.saveHabits(habits); }, [habits]);
  useEffect(() => { OrbitStorage.saveWorkouts(workouts); }, [workouts]);
  useEffect(() => { OrbitStorage.saveMeals(meals); }, [meals]);
  useEffect(() => { OrbitStorage.saveBills(bills); }, [bills]);
  useEffect(() => { OrbitStorage.saveNotes(notes); }, [notes]);
  useEffect(() => { OrbitStorage.saveGoals(goals); }, [goals]);

  // Dark Mode Root Class Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Cmd+K / Ctrl+K & Esc keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode]);

  // Background Auto-Archive Utility (> 30 Days Old Tasks & Schedule Events)
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = autoArchiveOldItems(tasks, schedule, 30);
      if (result.hasChanges) {
        setTasks(result.updatedTasks);
        setSchedule(result.updatedSchedule);
        const totalArchived = result.archivedTasksCount + result.archivedScheduleCount;
        addToast(
          "Auto-Archived (>30d)",
          `Moved ${totalArchived} older item${totalArchived > 1 ? "s" : ""} to archive state to keep workspace views clean.`,
          "ai"
        );
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const harmonyScore = calculateHarmonyScore(tasks, habits, meals, workouts, goals);

  const addToast = (title: string, description?: string, type: "success" | "ai" | "streak" | "warning" = "success") => {
    const newToast: ToastMessage = { id: `t-${Date.now()}`, title, description, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  // Automated Notification Alert for Bills due within 3 days
  useEffect(() => {
    const timer = setTimeout(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      bills.forEach((bill) => {
        if (bill.status === "paid") return;
        const due = new Date(bill.dueDate + "T00:00:00");
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 3) {
          const dayText =
            diffDays === 0
              ? "is due TODAY"
              : diffDays === 1
              ? "is due TOMORROW"
              : `is due in ${diffDays} days (${bill.dueDate})`;

          addToast(
            `Upcoming Bill Alert: ${bill.name}`,
            `₱${bill.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${dayText}.`,
            "warning"
          );
        } else if (diffDays < 0) {
          addToast(
            `Overdue Bill Alert: ${bill.name}`,
            `₱${bill.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} was due on ${bill.dueDate} (${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago).`,
            "warning"
          );
        }
      });
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  const handleResetData = () => {
    OrbitStorage.resetToDefaults();
    setProfile(OrbitStorage.getProfile());
    setTasks(OrbitStorage.getTasks());
    setSchedule(OrbitStorage.getSchedule());
    setHabits(OrbitStorage.getHabits());
    setWorkouts(OrbitStorage.getWorkouts());
    setMeals(OrbitStorage.getMeals());
    setBills(OrbitStorage.getBills());
    setNotes(OrbitStorage.getNotes());
    setGoals(OrbitStorage.getGoals());
    addToast("Orbit Workspace Reset", "Loaded default sample data");
  };

  // Entity Handlers
  const handleAddTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTasks((prev) => [newTask, ...prev]);
    addToast("Task Added", taskData.title);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextVal = !t.completed;
          if (nextVal) addToast("Task Completed", t.title, "streak");
          return { ...t, completed: nextVal };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addToast("Task Deleted");
  };

  const handleUnarchiveTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, archived: false } : t)));
    addToast("Task Restored", "Restored from archive to active list");
  };

  const handleUnarchiveScheduleEvent = (id: string) => {
    setSchedule((prev) => prev.map((s) => (s.id === id ? { ...s, archived: false } : s)));
    addToast("Schedule Event Restored", "Restored from archive");
  };

  const handleReorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSub = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return { ...t, subtasks: updatedSub };
        }
        return t;
      })
    );
  };

  const handleAddSubtasksToTask = (taskId: string, subtasks: any[]) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, subtasks: [...t.subtasks, ...subtasks] };
        }
        return t;
      })
    );
    addToast("AI Subtasks Generated", "Added 4 subtasks");
  };

  const handleAddScheduleEvent = (evtData: Omit<ScheduleEvent, "id">) => {
    const newEvt: ScheduleEvent = {
      ...evtData,
      id: `evt-${Date.now()}`,
    };
    setSchedule((prev) => [...prev, newEvt]);
    addToast("Schedule Event Added", evtData.title);
  };

  const handleDeleteScheduleEvent = (id: string) => {
    setSchedule((prev) => prev.filter((e) => e.id !== id));
    addToast("Event Removed");
  };

  const handleAutoFillGaps = () => {
    const todayIso = new Date().toISOString().split("T")[0];
    const newFocusBlock: ScheduleEvent = {
      id: `evt-autofill-${Date.now()}`,
      title: "🧠 Orbit AI Focus Block: High Impact Execution",
      startTime: "14:00",
      endTime: "15:30",
      category: "Work",
      isFocusBlock: true,
      completed: false,
      date: todayIso,
    };
    setSchedule((prev) => [...prev, newFocusBlock]);
    addToast("Orbit Focus Gap Auto-Filled", "Added 90m Focus Block at 2:00 PM", "ai");
  };

  const handleAddHabit = (habitData: Omit<Habit, "id" | "completedToday" | "historyMap">) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      completedToday: false,
      historyMap: {},
    };
    setHabits((prev) => [...prev, newHabit]);
    addToast("Habit Created", habitData.title);
  };

  const handleToggleHabit = (id: string) => {
    const todayIso = new Date().toISOString().split("T")[0];
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextVal = !h.completedToday;
          const updatedHistory = { ...h.historyMap, [todayIso]: nextVal };
          const nextStreak = nextVal ? h.streakCount + 1 : Math.max(h.streakCount - 1, 0);
          if (nextVal) addToast("Habit Streak!", `${nextStreak} day streak for ${h.title}`, "streak");
          return {
            ...h,
            completedToday: nextVal,
            streakCount: nextStreak,
            historyMap: updatedHistory,
          };
        }
        return h;
      })
    );
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    addToast("Habit Deleted");
  };

  const handleAddWorkout = (wData: Omit<WorkoutLog, "id">) => {
    const newW: WorkoutLog = {
      ...wData,
      id: `wo-${Date.now()}`,
    };
    setWorkouts((prev) => [newW, ...prev]);
    addToast("Workout Logged", `${wData.title} (${wData.caloriesBurned} kcal)`);
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    addToast("Workout Deleted");
  };

  const handleAddMeal = (mData: Omit<MealPlanItem, "id" | "consumed">) => {
    const newM: MealPlanItem = {
      ...mData,
      id: `meal-${Date.now()}`,
      consumed: false,
    };
    setMeals((prev) => [...prev, newM]);
    addToast("Meal Added", mData.name);
  };

  const handleToggleMeal = (id: string) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextVal = !m.consumed;
          if (nextVal) addToast("Meal Logged", `${m.name} (${m.calories} kcal)`);
          return { ...m, consumed: nextVal };
        }
        return m;
      })
    );
  };

  const handleDeleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
    addToast("Meal Removed");
  };

  const handleAddBill = (bData: Omit<BillItem, "id" | "status">) => {
    const newB: BillItem = {
      ...bData,
      id: `bill-${Date.now()}`,
      status: "upcoming",
      isRecurring: bData.isRecurring !== undefined ? bData.isRecurring : bData.recurringFrequency !== "One-time",
    };
    setBills((prev) => [...prev, newB]);
    addToast("Bill Expense Added", `${bData.name} (₱${bData.amount})`);
  };

  const calculateNextMonthDueDate = (currentDueDate: string): string => {
    const parts = currentDueDate.split("-");
    if (parts.length !== 3) return currentDueDate;
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let day = parseInt(parts[2], 10);

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }

    const daysInTargetMonth = new Date(year, month, 0).getDate();
    const validDay = Math.min(day, daysInTargetMonth);

    const yyyy = year.toString();
    const mm = month < 10 ? `0${month}` : `${month}`;
    const dd = validDay < 10 ? `0${validDay}` : `${validDay}`;

    return `${yyyy}-${mm}-${dd}`;
  };

  const handleToggleBillStatus = (id: string) => {
    setBills((prev) => {
      const targetBill = prev.find((b) => b.id === id);
      if (!targetBill) return prev;

      const nextStatus: BillItem["status"] = targetBill.status === "paid" ? "upcoming" : "paid";
      const isRecurring = targetBill.isRecurring !== undefined
        ? targetBill.isRecurring
        : targetBill.recurringFrequency !== "One-time";

      let nextMonthBill: BillItem | null = null;

      if (nextStatus === "paid" && isRecurring) {
        const nextDueDate = calculateNextMonthDueDate(targetBill.dueDate);
        const alreadyExists = prev.some(
          (b) => b.name === targetBill.name && b.dueDate === nextDueDate
        );

        if (!alreadyExists) {
          nextMonthBill = {
            id: `bill-${Date.now()}`,
            name: targetBill.name,
            amount: targetBill.amount,
            dueDate: nextDueDate,
            category: targetBill.category,
            recurringFrequency: targetBill.recurringFrequency,
            status: "upcoming",
            autoPay: targetBill.autoPay,
            isRecurring: true,
          };
        }
      }

      if (nextStatus === "paid") {
        if (nextMonthBill) {
          addToast(
            "Bill Settled & Next Entry Created",
            `Paid ${targetBill.name}. Auto-created next month's entry due on ${nextMonthBill.dueDate} (Recurring).`,
            "ai"
          );
        } else {
          addToast("Bill Marked Paid", `Settled payment for ${targetBill.name}.`, "success");
        }
      }

      const updated = prev.map((b) => (b.id === id ? { ...b, status: nextStatus } : b));
      return nextMonthBill ? [...updated, nextMonthBill] : updated;
    });
  };

  const handleToggleBillRecurring = (id: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const currentRec = b.isRecurring !== undefined ? b.isRecurring : b.recurringFrequency !== "One-time";
          const nextRec = !currentRec;
          addToast(
            nextRec ? "Recurring Renewal Enabled" : "Set as One-Time Expense",
            `${b.name} is now ${nextRec ? "set to auto-create next month's entry upon payment" : "a single one-off bill"}.`,
            nextRec ? "success" : "warning"
          );
          return {
            ...b,
            isRecurring: nextRec,
            recurringFrequency: nextRec ? "Monthly" : "One-time",
          };
        }
        return b;
      })
    );
  };

  const handleDeleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    addToast("Bill Removed");
  };

  const handleAddNote = (nData: Omit<NoteItem, "id" | "updatedAt">) => {
    const newN: NoteItem = {
      ...nData,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setNotes((prev) => [newN, ...prev]);
    addToast("Note Saved", nData.title);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    addToast("Note Deleted");
  };

  const handleAddGoal = (gData: Omit<GoalItem, "id">) => {
    const newG: GoalItem = {
      ...gData,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newG]);
    addToast("Goal Objective Created", gData.title);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    addToast("Goal Deleted");
  };

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updatedM = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          return { ...g, milestones: updatedM };
        }
        return g;
      })
    );
    addToast("Goal Milestone Updated");
  };

  if (viewMode === "landing") {
    return (
      <>
        <LandingPage
          onOpenAuth={(mode, plan) => {
            setAuthMode(mode);
            setSelectedPlan(plan);
            setAuthModalOpen(true);
          }}
          onLaunchDemoWorkspace={() => {
            setViewMode("workspace");
            addToast("Demo Workspace Activated", "Welcome to Orbit AI", "ai");
          }}
        />

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          selectedPlan={selectedPlan}
          onClose={() => setAuthModalOpen(false)}
          onSuccessLogin={(userData) => {
            setProfile((prev) => ({
              ...prev,
              name: userData.name,
              email: userData.email,
              avatarUrl: userData.avatarUrl || prev.avatarUrl,
            }));
            setAuthModalOpen(false);
            setViewMode("workspace");
            addToast(`Welcome ${userData.name}!`, "Authenticated into Orbit AI", "streak");
          }}
        />

        <ToastSystem
          toasts={toasts}
          onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col md:flex-row ${
      darkMode ? "bg-[#050506] text-[#E4E4E7]" : "bg-zinc-100 text-zinc-900"
    }`}>
      {/* Navigation Sidebar & Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        harmonyScore={harmonyScore}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onResetData={handleResetData}
        onReturnToLanding={() => setViewMode("landing")}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onLogout={async () => {
          await logoutUser();
          addToast("Signed Out", "Logged out from Firebase Auth");
        }}
        userName={profile.name}
        avatarUrl={profile.avatarUrl}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => {
          const nextVal = !isFocusMode;
          setIsFocusMode(nextVal);
          if (nextVal) {
            addToast("Focus Mode Activated", "Non-essential sidebar elements hidden. Press ESC to exit.", "success");
          } else {
            addToast("Focus Mode Disabled", "Standard executive workspace view restored.");
          }
        }}
      />

      {/* Main Operating System View Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Focus Mode Sticky Banner Indicator */}
        {isFocusMode && (
          <div className="sticky top-0 z-40 bg-zinc-950/90 border-b border-indigo-500/30 backdrop-blur-md px-4 md:px-6 py-2.5 flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Focus Mode Active
                </span>
                <span className="text-xs text-zinc-400 hidden md:inline">
                  (Zero-distraction layout • Press ESC or click Exit Focus Mode)
                </span>
              </div>
            </div>
            <button
              id="exit-focus-mode-banner-btn"
              onClick={() => setIsFocusMode(false)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-98"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Focus Mode</span>
            </button>
          </div>
        )}

        <main className={`flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto w-full transition-all duration-300 ${
          isFocusMode ? "max-w-none px-4 md:px-12" : "max-w-7xl mx-auto"
        }`}>
          {activeTab === "dashboard" && (
            <DashboardView
              profile={profile}
              harmonyScore={harmonyScore}
              tasks={tasks}
              schedule={schedule}
              habits={habits}
              workouts={workouts}
              meals={meals}
              bills={bills}
              goals={goals}
              onToggleTask={handleToggleTask}
              onToggleSubtask={handleToggleSubtask}
              onDeleteTask={handleDeleteTask}
              onAddSubtasksToTask={handleAddSubtasksToTask}
              onToggleHabit={handleToggleHabit}
              onToggleMeal={handleToggleMeal}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onNavigateTab={setActiveTab}
              darkMode={darkMode}
              isFocusMode={isFocusMode}
              onToggleFocusMode={() => {
                const nextVal = !isFocusMode;
                setIsFocusMode(nextVal);
                if (nextVal) {
                  addToast("Focus Mode Activated", "Non-essential elements hidden for maximum concentration.", "success");
                } else {
                  addToast("Focus Mode Disabled", "Standard workspace layout restored.");
                }
              }}
            />
          )}

        {activeTab === "tasks" && (
          <TasksView
            tasks={tasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUnarchiveTask={handleUnarchiveTask}
            onReorderTasks={handleReorderTasks}
            onToggleSubtask={handleToggleSubtask}
            onAddSubtasksToTask={handleAddSubtasksToTask}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            darkMode={darkMode}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleView
            schedule={schedule}
            onAddScheduleEvent={handleAddScheduleEvent}
            onDeleteScheduleEvent={handleDeleteScheduleEvent}
            onUnarchiveScheduleEvent={handleUnarchiveScheduleEvent}
            onAutoFillGaps={handleAutoFillGaps}
            onTriggerToast={(title, desc, type) => addToast(title, desc, type || "success")}
            darkMode={darkMode}
          />
        )}

        {activeTab === "habits" && (
          <HabitsView
            habits={habits}
            onAddHabit={handleAddHabit}
            onToggleHabit={handleToggleHabit}
            onDeleteHabit={handleDeleteHabit}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            darkMode={darkMode}
          />
        )}

        {activeTab === "fitness" && (
          <FitnessView
            workouts={workouts}
            onAddWorkout={handleAddWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            darkMode={darkMode}
          />
        )}

        {activeTab === "meals" && (
          <MealsView
            meals={meals}
            profile={profile}
            onAddMeal={handleAddMeal}
            onToggleMeal={handleToggleMeal}
            onDeleteMeal={handleDeleteMeal}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            darkMode={darkMode}
          />
        )}

        {activeTab === "bills" && (
          <BillsView
            bills={bills}
            monthlyIncome={profile.monthlyBudget}
            onUpdateMonthlyIncome={(inc) => {
              setProfile((prev) => ({ ...prev, monthlyBudget: inc }));
              addToast("Income Benchmark Updated", `Monthly income baseline set to ₱${inc.toLocaleString()}`, "streak");
            }}
            onAddBill={handleAddBill}
            onToggleBillStatus={handleToggleBillStatus}
            onToggleBillRecurring={handleToggleBillRecurring}
            onDeleteBill={handleDeleteBill}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onTriggerToast={(title, desc, type) => addToast(title, desc, type || "warning")}
            darkMode={darkMode}
          />
        )}

        {activeTab === "notes" && (
          <NotesView
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onAddTaskFromNote={(title) => handleAddTask({
              title,
              priority: "P2",
              category: "Work",
              estimatedMinutes: 30,
              completed: false,
              dueDate: new Date().toISOString().split("T")[0],
              tags: ["note-extracted"],
              subtasks: [],
            })}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            darkMode={darkMode}
          />
        )}

        {activeTab === "goals" && (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onToggleMilestone={handleToggleMilestone}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            darkMode={darkMode}
          />
        )}
      </main>
      </div>

      {/* Quick Capture Command Palette */}
      <CommandPalette
        isOpen={isQuickAddOpen}
        initialType={activeTab === "notes" ? "note" : undefined}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={handleAddTask}
        onAddHabit={handleAddHabit}
        onAddWorkout={handleAddWorkout}
        onAddMeal={handleAddMeal}
        onAddBill={handleAddBill}
        onAddNote={handleAddNote}
        onAddGoal={handleAddGoal}
        onAskCopilot={(prompt) => {
          setIsCopilotOpen(true);
        }}
        darkMode={darkMode}
      />

      {/* Orbit AI Copilot Assistant Drawer */}
      <OrbitCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onAddTaskFromAi={(title, category) => handleAddTask({
          title,
          priority: "P1",
          category: category as any,
          estimatedMinutes: 30,
          completed: false,
          dueDate: new Date().toISOString().split("T")[0],
          tags: ["ai-copilot"],
          subtasks: [],
        })}
        darkMode={darkMode}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        selectedPlan={selectedPlan}
        onClose={() => setAuthModalOpen(false)}
        onSuccessLogin={(userData) => {
          setProfile((prev) => ({
            ...prev,
            name: userData.name,
            email: userData.email,
            avatarUrl: userData.avatarUrl || prev.avatarUrl,
          }));
          setAuthModalOpen(false);
          addToast(`Authenticated as ${userData.name}`, "Credentials synchronized with Firebase", "success");
          if (userData.isNewUser) {
            setIsOnboardingOpen(true);
          }
        }}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        userId={currentUser?.uid}
        initialName={profile.name}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(onboardingData) => {
          setProfile((prev) => ({
            ...prev,
            name: onboardingData.name,
            role: onboardingData.role,
            goals: onboardingData.goals,
            sleepSchedule: onboardingData.sleepSchedule,
            workingHours: onboardingData.workingHours,
            preferredProductivityTime: onboardingData.preferredProductivityTime,
            planningStyle: onboardingData.planningStyle,
          }));
          setIsOnboardingOpen(false);
          addToast("Onboarding Completed", "Profile and preferences saved to Firestore", "streak");
        }}
      />

      {/* Toast System Notifications */}
      <ToastSystem
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
