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
} from "../types";
import { 
  INITIAL_PROFILE, 
  INITIAL_TASKS, 
  INITIAL_SCHEDULE, 
  INITIAL_HABITS, 
  INITIAL_WORKOUTS, 
  INITIAL_MEALS, 
  INITIAL_BILLS, 
  INITIAL_NOTES, 
  INITIAL_GOALS 
} from "./mockData";

const STORAGE_KEYS = {
  PROFILE: "orbit_ai_profile_v1",
  TASKS: "orbit_ai_tasks_v1",
  SCHEDULE: "orbit_ai_schedule_v1",
  HABITS: "orbit_ai_habits_v1",
  WORKOUTS: "orbit_ai_workouts_v1",
  MEALS: "orbit_ai_meals_v1",
  BILLS: "orbit_ai_bills_v1",
  NOTES: "orbit_ai_notes_v1",
  GOALS: "orbit_ai_goals_v1",
};

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error("Error reading storage key:", key, e);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving storage key:", key, e);
  }
}

export const OrbitStorage = {
  getProfile: (): UserOrbitProfile => loadStoredData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE),
  saveProfile: (p: UserOrbitProfile) => saveStoredData(STORAGE_KEYS.PROFILE, p),

  getTasks: (): Task[] => loadStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS),
  saveTasks: (tasks: Task[]) => saveStoredData(STORAGE_KEYS.TASKS, tasks),

  getSchedule: (): ScheduleEvent[] => loadStoredData(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE),
  saveSchedule: (events: ScheduleEvent[]) => saveStoredData(STORAGE_KEYS.SCHEDULE, events),

  getHabits: (): Habit[] => loadStoredData(STORAGE_KEYS.HABITS, INITIAL_HABITS),
  saveHabits: (habits: Habit[]) => saveStoredData(STORAGE_KEYS.HABITS, habits),

  getWorkouts: (): WorkoutLog[] => loadStoredData(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS),
  saveWorkouts: (workouts: WorkoutLog[]) => saveStoredData(STORAGE_KEYS.WORKOUTS, workouts),

  getMeals: (): MealPlanItem[] => loadStoredData(STORAGE_KEYS.MEALS, INITIAL_MEALS),
  saveMeals: (meals: MealPlanItem[]) => saveStoredData(STORAGE_KEYS.MEALS, meals),

  getBills: (): BillItem[] => loadStoredData(STORAGE_KEYS.BILLS, INITIAL_BILLS),
  saveBills: (bills: BillItem[]) => saveStoredData(STORAGE_KEYS.BILLS, bills),

  getNotes: (): NoteItem[] => loadStoredData(STORAGE_KEYS.NOTES, INITIAL_NOTES),
  saveNotes: (notes: NoteItem[]) => saveStoredData(STORAGE_KEYS.NOTES, notes),

  getGoals: (): GoalItem[] => loadStoredData(STORAGE_KEYS.GOALS, INITIAL_GOALS),
  saveGoals: (goals: GoalItem[]) => saveStoredData(STORAGE_KEYS.GOALS, goals),

  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.BILLS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
  }
};

export function calculateHarmonyScore(
  tasks: Task[], 
  habits: Habit[], 
  meals: MealPlanItem[], 
  workouts: WorkoutLog[], 
  goals: GoalItem[]
): number {
  let score = 0;
  
  // 1. Task Completion (25%)
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskRatio = tasks.length > 0 ? completedTasks / tasks.length : 0.8;
  score += Math.min(taskRatio * 25, 25);

  // 2. Habit Streaks (25%)
  const completedHabitsToday = habits.filter(h => h.completedToday).length;
  const habitRatio = habits.length > 0 ? completedHabitsToday / habits.length : 0.8;
  score += Math.min(habitRatio * 25, 25);

  // 3. Nutrition / Calorie Tracking (20%)
  const consumedMeals = meals.filter(m => m.consumed).length;
  const mealRatio = meals.length > 0 ? consumedMeals / meals.length : 0.7;
  score += Math.min(mealRatio * 20, 20);

  // 4. Fitness / Active Movement (15%)
  const hasWorkoutToday = workouts.length > 0;
  score += hasWorkoutToday ? 15 : 8;

  // 5. Goals Momentum (15%)
  const avgGoalProgress = goals.length > 0 
    ? goals.reduce((acc, g) => acc + (g.currentValue / g.targetValue), 0) / goals.length 
    : 0.6;
  score += Math.min(avgGoalProgress * 15, 15);

  return Math.round(Math.min(Math.max(score, 10), 100));
}
