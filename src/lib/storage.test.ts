import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import { calculateHarmonyScore, loadStoredData, OrbitStorage, saveStoredData } from "./storage";
import {
  INITIAL_PROFILE, INITIAL_TASKS, INITIAL_SCHEDULE, INITIAL_HABITS, INITIAL_WORKOUTS,
  INITIAL_MEALS, INITIAL_BILLS, INITIAL_NOTES, INITIAL_GOALS,
} from "./mockData";

let entries: Map<string, string>;
let originalStorage: PropertyDescriptor | undefined;
beforeEach(() => {
  entries = new Map();
  originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  } });
  mock.method(console, "error", () => {});
});
afterEach(() => {
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  else Reflect.deleteProperty(globalThis, "localStorage");
  mock.restoreAll();
});

const collections = [
  { key: "tasks", defaults: INITIAL_TASKS, get: OrbitStorage.getTasks },
  { key: "schedule", defaults: INITIAL_SCHEDULE, get: OrbitStorage.getSchedule },
  { key: "habits", defaults: INITIAL_HABITS, get: OrbitStorage.getHabits },
  { key: "workouts", defaults: INITIAL_WORKOUTS, get: OrbitStorage.getWorkouts },
  { key: "meals", defaults: INITIAL_MEALS, get: OrbitStorage.getMeals },
  { key: "bills", defaults: INITIAL_BILLS, get: OrbitStorage.getBills },
  { key: "notes", defaults: INITIAL_NOTES, get: OrbitStorage.getNotes },
  { key: "goals", defaults: INITIAL_GOALS, get: OrbitStorage.getGoals },
];

test("missing and corrupt data return independent deep copies without overwriting raw storage", () => {
  const fallback = [{ nested: { name: "default" } }];
  for (const raw of [undefined, "", "{broken", "null", "{}", '"wrong"']) {
    entries.clear();
    if (raw !== undefined) entries.set("test", raw);
    const result = loadStoredData("test", fallback);
    assert.deepEqual(result, fallback);
    assert.notEqual(result, fallback);
    result[0].nested.name = "mutated";
    assert.equal(fallback[0].nested.name, "default");
    assert.equal(entries.get("test"), raw);
  }
});

test("valid falsy values and empty arrays are preserved", () => {
  for (const value of [0, false, "", [], null]) {
    entries.set("test", JSON.stringify(value));
    assert.deepEqual(loadStoredData("test", value), value);
  }
});

test("every collection round-trips defaults and accepts an intentional empty list", () => {
  for (const collection of collections) {
    const key = `orbit_ai_${collection.key}_v1`;
    entries.set(key, JSON.stringify(collection.defaults));
    assert.deepEqual(collection.get(), collection.defaults);
    entries.set(key, "[]");
    assert.deepEqual(collection.get(), []);
    entries.set(key, "[null]");
    assert.deepEqual(collection.get(), collection.defaults);
  }
});

test("profile rejects null and wrong fields while preserving valid extra fields", () => {
  const key = "orbit_ai_profile_v1";
  for (const invalid of [null, [], {}, { ...INITIAL_PROFILE, monthlyBudget: "100" }, { ...INITIAL_PROFILE, sleepHours: -1 }]) {
    entries.set(key, JSON.stringify(invalid));
    assert.deepEqual(OrbitStorage.getProfile(), INITIAL_PROFILE);
  }
  const profile = { ...INITIAL_PROFILE, name: "New name", customPreference: true };
  entries.set(key, JSON.stringify(profile));
  assert.deepEqual(OrbitStorage.getProfile(), profile);
});

test("collection validation rejects malformed nested data and accepts absent optional fields", () => {
  const { scheduledTime, notes, ...task } = INITIAL_TASKS[0];
  entries.set("orbit_ai_tasks_v1", JSON.stringify([task]));
  assert.deepEqual(OrbitStorage.getTasks(), [task]);
  for (const invalid of [{ ...task, tags: [null] }, { ...task, subtasks: [{}] }, { ...task, completed: "true" }]) {
    entries.set("orbit_ai_tasks_v1", JSON.stringify([invalid]));
    assert.deepEqual(OrbitStorage.getTasks(), INITIAL_TASKS);
  }
  entries.set("orbit_ai_habits_v1", JSON.stringify([{ ...INITIAL_HABITS[0], historyMap: { today: "yes" } }]));
  assert.deepEqual(OrbitStorage.getHabits(), INITIAL_HABITS);
});

test("mutating default collections and profiles does not affect future loads", () => {
  const tasks = OrbitStorage.getTasks();
  tasks[0].subtasks[0].title = "Changed";
  tasks.push(tasks[0]);
  const profile = OrbitStorage.getProfile();
  profile.name = "Changed";
  assert.deepEqual(OrbitStorage.getTasks(), INITIAL_TASKS);
  assert.deepEqual(OrbitStorage.getProfile(), INITIAL_PROFILE);
});

test("valid light workouts and omitted optional schedule fields remain loadable", () => {
  const { notes, ...workout } = INITIAL_WORKOUTS[0];
  const lightWorkout = { ...workout, intensity: "Light", exercises: [] };
  entries.set("orbit_ai_workouts_v1", JSON.stringify([lightWorkout]));
  assert.deepEqual(OrbitStorage.getWorkouts(), [lightWorkout]);
  const { isFocusBlock, completed, ...schedule } = INITIAL_SCHEDULE[0];
  entries.set("orbit_ai_schedule_v1", JSON.stringify([schedule]));
  assert.deepEqual(OrbitStorage.getSchedule(), [schedule]);
});

test("unavailable storage and read/write failures do not escape", () => {
  mock.method(localStorage, "getItem", () => { throw new Error("Blocked"); });
  assert.deepEqual(OrbitStorage.getTasks(), INITIAL_TASKS);
  mock.method(localStorage, "setItem", () => { throw new Error("Quota"); });
  assert.doesNotThrow(() => OrbitStorage.saveTasks([]));
  Reflect.deleteProperty(globalThis, "localStorage");
  assert.deepEqual(OrbitStorage.getProfile(), INITIAL_PROFILE);
  assert.doesNotThrow(() => OrbitStorage.resetToDefaults());
});

test("unserializable saves do not replace existing data", () => {
  entries.set("test", "existing");
  saveStoredData("test", undefined);
  assert.equal(entries.get("test"), "existing");
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  saveStoredData("test", circular);
  assert.equal(entries.get("test"), "existing");
});

test("reset only removes owned keys and continues after a removal failure", () => {
  for (const key of ["profile", ...collections.map((collection) => collection.key)]) entries.set(`orbit_ai_${key}_v1`, "old");
  entries.set("unrelated", "keep");
  const attempted: string[] = [];
  mock.method(localStorage, "removeItem", (key: string) => {
    attempted.push(key);
    if (key === "orbit_ai_tasks_v1") throw new Error("Blocked key");
    entries.delete(key);
  });
  assert.doesNotThrow(() => OrbitStorage.resetToDefaults());
  assert.equal(attempted.length, 9);
  assert.equal(entries.get("unrelated"), "keep");
  assert.equal(entries.get("orbit_ai_tasks_v1"), "old");
  assert.equal(entries.has("orbit_ai_goals_v1"), false);
});

test("reset reloads fresh defaults for every owned key", () => {
  for (const collection of collections) entries.set(`orbit_ai_${collection.key}_v1`, "[]");
  entries.set("orbit_ai_profile_v1", JSON.stringify({ ...INITIAL_PROFILE, name: "Other" }));
  OrbitStorage.resetToDefaults();
  assert.deepEqual(OrbitStorage.getProfile(), INITIAL_PROFILE);
  for (const collection of collections) assert.deepEqual(collection.get(), collection.defaults);
});

test("harmony score preserves empty baseline, weights and bounds", () => {
  assert.equal(calculateHarmonyScore([], [], [], [], []), 71);
  assert.equal(calculateHarmonyScore(
    INITIAL_TASKS.map((task) => ({ ...task, completed: true })),
    INITIAL_HABITS.map((habit) => ({ ...habit, completedToday: true })),
    INITIAL_MEALS.map((meal) => ({ ...meal, consumed: true })), INITIAL_WORKOUTS,
    INITIAL_GOALS.map((goal) => ({ ...goal, currentValue: goal.targetValue })),
  ), 100);
});

test("invalid goal targets and non-finite or negative progress yield a finite bounded score", () => {
  for (const [currentValue, targetValue] of [[0, 0], [10, 0], [10, -1], [NaN, 100], [100, Infinity], [-100, 100]]) {
    const goals = [{ ...INITIAL_GOALS[0], currentValue, targetValue }];
    assert.equal(calculateHarmonyScore([], [], [], [], goals), 62);
  }
});

test("over-completed goals cannot mask incomplete goals", () => {
  const goals = [
    { ...INITIAL_GOALS[0], currentValue: 1000, targetValue: 100 },
    { ...INITIAL_GOALS[0], currentValue: 0, targetValue: 100 },
  ];
  assert.equal(calculateHarmonyScore([], [], [], [], goals), 70);
});