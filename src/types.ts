export type PriorityLevel = "P1" | "P2" | "P3";

export type Category = 
  | "Work"
  | "Personal"
  | "Health"
  | "Finance"
  | "Learning"
  | "Nutrition"
  | "Fitness";

export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface Task {
  id: string;
  title: string;
  priority: PriorityLevel;
  category: Category;
  estimatedMinutes: number;
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
  tags: string[];
  subtasks: TaskSubtask[];
  notes?: string;
  createdAt: string;
  archived?: boolean;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  category: Category;
  taskId?: string;
  location?: string;
  isFocusBlock?: boolean;
  completed?: boolean;
  date: string; // YYYY-MM-DD
  archived?: boolean;
  isExternalCalendar?: boolean;
  externalSource?: string;
  attendees?: string[];
  meetUrl?: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: "daily" | "weekly";
  category: Category;
  streakCount: number;
  completedToday: boolean;
  historyMap: Record<string, boolean>; // YYYY-MM-DD -> boolean
  iconName: string;
  timeOfDay: "Morning" | "Afternoon" | "Evening" | "Anytime";
  targetCountPerWeek: number;
}

export interface ExerciseSet {
  id: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weightLbs?: number;
}

export interface WorkoutLog {
  id: string;
  title: string;
  type: "Strength" | "Cardio" | "HIIT" | "Yoga" | "Pilates";
  durationMinutes: number;
  caloriesBurned: number;
  intensity: "Light" | "Moderate" | "High" | "Extreme";
  exercises: ExerciseSet[];
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface MealPlanItem {
  id: string;
  name: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  ingredients: string[];
  consumed: boolean;
  date: string; // YYYY-MM-DD
}

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  category: "Utilities" | "Housing" | "Subscription" | "Insurance" | "Debt" | "Other";
  recurringFrequency: "Monthly" | "Yearly" | "Weekly" | "One-time";
  status: "paid" | "unpaid" | "upcoming";
  autoPay: boolean;
  isRecurring?: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: Category;
  tags: string[];
  updatedAt: string;
  isPinned: boolean;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  description: string;
  timeframe: "Q3 2026" | "Q4 2026" | "Year 2026" | "Long-Term";
  category: Category;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g. "lbs", "books", "USD", "%"
  milestones: GoalMilestone[];
  linkedTaskIds: string[];
  color: string;
}

export interface OrbitAiMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  actionType?: "schedule" | "task" | "workout" | "meal" | "general";
  payload?: any;
}

export interface UserOrbitProfile {
  name: string;
  email?: string;
  avatarUrl: string;
  dailyCalorieTarget: number;
  proteinTargetGrams: number;
  carbsTargetGrams: number;
  fatTargetGrams: number;
  waterIntakeOz: number;
  waterTargetOz: number;
  sleepHours: number;
  sleepTargetHours: number;
  monthlyBudget: number;
}
