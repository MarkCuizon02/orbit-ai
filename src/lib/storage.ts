import type {
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

type Validator = (value: unknown) => boolean;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isString: Validator = (value) => typeof value === "string";
const isBoolean: Validator = (value) => typeof value === "boolean";
const isNumber: Validator = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
const optional = (validate: Validator): Validator => (value) => value === undefined || validate(value);
const arrayOf = (validate: Validator): Validator => (value) => Array.isArray(value) && value.every(validate);
const oneOf = (...values: string[]): Validator => (value) => typeof value === "string" && values.includes(value);
const shape = (fields: Record<string, Validator>): Validator => (value) =>
  isRecord(value) && Object.entries(fields).every(([key, validate]) => validate(value[key]));
const strings = arrayOf(isString);
const category = oneOf("Work", "Personal", "Health", "Finance", "Learning", "Nutrition", "Fitness");
const subtask = shape({ id: isString, title: isString, completed: isBoolean, estimatedMinutes: optional(isNumber) });
const profile = shape({
  name: isString, email: optional(isString), avatarUrl: isString,
  dailyCalorieTarget: isNumber, proteinTargetGrams: isNumber, carbsTargetGrams: isNumber,
  fatTargetGrams: isNumber, waterIntakeOz: isNumber, waterTargetOz: isNumber,
  sleepHours: isNumber, sleepTargetHours: isNumber, monthlyBudget: isNumber,
});
const task = shape({
  id: isString, title: isString, priority: oneOf("P1", "P2", "P3"), category,
  estimatedMinutes: isNumber, completed: isBoolean, dueDate: isString,
  scheduledTime: optional(isString), tags: strings, subtasks: arrayOf(subtask),
  notes: optional(isString), createdAt: isString, archived: optional(isBoolean),
});
const schedule = shape({
  id: isString, title: isString, startTime: isString, endTime: isString, category, date: isString,
  taskId: optional(isString), location: optional(isString), isFocusBlock: optional(isBoolean),
  completed: optional(isBoolean), archived: optional(isBoolean), isExternalCalendar: optional(isBoolean),
  externalSource: optional(isString), attendees: optional(strings), meetUrl: optional(isString),
});
const habit = shape({
  id: isString, title: isString, frequency: oneOf("daily", "weekly"), category,
  streakCount: isNumber, completedToday: isBoolean,
  historyMap: (value) => isRecord(value) && Object.values(value).every(isBoolean),
  iconName: isString, timeOfDay: oneOf("Morning", "Afternoon", "Evening", "Anytime"), targetCountPerWeek: isNumber,
});
const workout = shape({
  id: isString, title: isString, type: oneOf("Strength", "Cardio", "HIIT", "Yoga", "Pilates"),
  durationMinutes: isNumber, caloriesBurned: isNumber, intensity: oneOf("Light", "Moderate", "High", "Extreme"),
  date: isString, notes: optional(isString),
  exercises: arrayOf(shape({ id: isString, exerciseName: isString, sets: isNumber, reps: isNumber, weightLbs: optional(isNumber) })),
});
const meal = shape({
  id: isString, name: isString, mealType: oneOf("Breakfast", "Lunch", "Dinner", "Snack"),
  calories: isNumber, proteinGrams: isNumber, carbsGrams: isNumber, fatGrams: isNumber,
  ingredients: strings, consumed: isBoolean, date: isString, notes: optional(isString),
});
const bill = shape({
  id: isString, name: isString, amount: isNumber, dueDate: isString,
  category: oneOf("Utilities", "Housing", "Subscription", "Insurance", "Debt", "Other"),
  recurringFrequency: oneOf("Monthly", "Yearly", "Weekly", "One-time"),
  status: oneOf("paid", "unpaid", "upcoming"), autoPay: isBoolean, isRecurring: optional(isBoolean),
});
const note = shape({
  id: isString, title: isString, content: isString, category, tags: strings, updatedAt: isString, isPinned: isBoolean,
});
const goal = shape({
  id: isString, title: isString, description: isString,
  timeframe: oneOf("Q3 2026", "Q4 2026", "Year 2026", "Long-Term"), category,
  targetValue: isNumber, currentValue: isNumber, unit: isString, linkedTaskIds: strings, color: isString,
  milestones: arrayOf(shape({ id: isString, title: isString, completed: isBoolean, targetDate: optional(isString) })),
});

const matchesFallbackType = (value: unknown, fallback: unknown) => {
  if (Array.isArray(fallback)) return Array.isArray(value);
  if (isRecord(fallback)) return isRecord(value);
  if (fallback === null) return value === null;
  return typeof value === typeof fallback && (typeof value !== "number" || Number.isFinite(value));
};

export function loadStoredData<T>(key: string, fallback: T, validate?: Validator): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return structuredClone(fallback);
    const parsed: unknown = JSON.parse(item);
    if (!(validate ? validate(parsed) : matchesFallbackType(parsed, fallback))) {
      throw new TypeError("Stored data has an invalid shape");
    }
    return parsed as T;
  } catch (e) {
    console.error("Error reading storage key:", key, e);
    return structuredClone(fallback);
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError("Stored data must be JSON serializable");
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.error("Error saving storage key:", key, e);
  }
}

export const OrbitStorage = {
  getProfile: (): UserOrbitProfile => loadStoredData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE, profile),
  saveProfile: (p: UserOrbitProfile) => saveStoredData(STORAGE_KEYS.PROFILE, p),

  getTasks: (): Task[] => loadStoredData(STORAGE_KEYS.TASKS, INITIAL_TASKS, arrayOf(task)),
  saveTasks: (tasks: Task[]) => saveStoredData(STORAGE_KEYS.TASKS, tasks),

  getSchedule: (): ScheduleEvent[] => loadStoredData(STORAGE_KEYS.SCHEDULE, INITIAL_SCHEDULE, arrayOf(schedule)),
  saveSchedule: (events: ScheduleEvent[]) => saveStoredData(STORAGE_KEYS.SCHEDULE, events),

  getHabits: (): Habit[] => loadStoredData(STORAGE_KEYS.HABITS, INITIAL_HABITS, arrayOf(habit)),
  saveHabits: (habits: Habit[]) => saveStoredData(STORAGE_KEYS.HABITS, habits),

  getWorkouts: (): WorkoutLog[] => loadStoredData(STORAGE_KEYS.WORKOUTS, INITIAL_WORKOUTS, arrayOf(workout)),
  saveWorkouts: (workouts: WorkoutLog[]) => saveStoredData(STORAGE_KEYS.WORKOUTS, workouts),

  getMeals: (): MealPlanItem[] => loadStoredData(STORAGE_KEYS.MEALS, INITIAL_MEALS, arrayOf(meal)),
  saveMeals: (meals: MealPlanItem[]) => saveStoredData(STORAGE_KEYS.MEALS, meals),

  getBills: (): BillItem[] => loadStoredData(STORAGE_KEYS.BILLS, INITIAL_BILLS, arrayOf(bill)),
  saveBills: (bills: BillItem[]) => saveStoredData(STORAGE_KEYS.BILLS, bills),

  getNotes: (): NoteItem[] => loadStoredData(STORAGE_KEYS.NOTES, INITIAL_NOTES, arrayOf(note)),
  saveNotes: (notes: NoteItem[]) => saveStoredData(STORAGE_KEYS.NOTES, notes),

  getGoals: (): GoalItem[] => loadStoredData(STORAGE_KEYS.GOALS, INITIAL_GOALS, arrayOf(goal)),
  saveGoals: (goals: GoalItem[]) => saveStoredData(STORAGE_KEYS.GOALS, goals),

  resetToDefaults: () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error("Error resetting storage key:", key, e);
      }
    }
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
  const completedTasks = tasks.filter(t => t.completed === true).length;
  const taskRatio = tasks.length > 0 ? completedTasks / tasks.length : 0.8;
  score += Math.min(taskRatio * 25, 25);

  // 2. Habit Streaks (25%)
  const completedHabitsToday = habits.filter(h => h.completedToday === true).length;
  const habitRatio = habits.length > 0 ? completedHabitsToday / habits.length : 0.8;
  score += Math.min(habitRatio * 25, 25);

  // 3. Nutrition / Calorie Tracking (20%)
  const consumedMeals = meals.filter(m => m.consumed === true).length;
  const mealRatio = meals.length > 0 ? consumedMeals / meals.length : 0.7;
  score += Math.min(mealRatio * 20, 20);

  // 4. Fitness / Active Movement (15%)
  const hasWorkoutToday = workouts.length > 0;
  score += hasWorkoutToday ? 15 : 8;

  // 5. Goals Momentum (15%)
  const avgGoalProgress = goals.length > 0 
    ? goals.reduce((acc, g) => {
        const progress = Number.isFinite(g.currentValue) && Number.isFinite(g.targetValue) && g.targetValue > 0
          ? Math.min(Math.max(g.currentValue / g.targetValue, 0), 1)
          : 0;
        return acc + progress / goals.length;
      }, 0)
    : 0.6;
  score += Math.min(avgGoalProgress * 15, 15);

  return Math.round(Math.min(Math.max(score, 10), 100));
}
