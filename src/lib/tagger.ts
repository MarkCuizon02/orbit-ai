import { Category } from "../types";

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Work: [
    "project", "report", "deck", "slide", "meeting", "client", "email", "code",
    "dev", "review", "bug", "pr", "prs", "ticket", "sprint", "deploy", "presentation",
    "brief", "slack", "sync", "office", "work", "task", "strategy", "roadmap",
    "proposal", "launch", "invoice", "q1", "q2", "q3", "q4", "okr", "kpi", "standup",
    "feature", "design", "figma", "github", "refactor", "spec", "document"
  ],
  Health: [
    "doctor", "dentist", "meds", "medicine", "pill", "pills", "therapy", "checkup",
    "blood", "clinic", "health", "sleep", "vitamins", "vitamin", "hospital",
    "physio", "mental", "rest", "prescription", "appointment", "medication", "skincare"
  ],
  Fitness: [
    "workout", "gym", "run", "running", "jog", "jogging", "lift", "lifting",
    "cardio", "hiit", "squat", "bench", "treadmill", "exercise", "stretch",
    "stretching", "yoga", "walk", "walking", "training", "weights", "crossfit",
    "swim", "swimming", "marathon", "legs", "arms", "pushups", "pullups"
  ],
  Nutrition: [
    "meal", "cook", "cooking", "recipe", "dinner", "lunch", "breakfast", "snack",
    "grocery", "groceries", "calorie", "calories", "protein", "carbs", "fats",
    "diet", "water", "prep", "smoothie", "food", "eat", "eating", "macros",
    "chicken", "salad", "shake"
  ],
  Finance: [
    "bill", "pay", "payment", "bank", "budget", "tax", "taxes", "subscription",
    "expense", "transfer", "invest", "investing", "money", "salary", "audit",
    "credit", "card", "fee", "rent", "mortgage", "savings", "payroll", "receipt",
    "accounting", "statement", "stock", "crypto"
  ],
  Learning: [
    "read", "book", "course", "study", "studying", "lecture", "tutorial", "learn",
    "learning", "exam", "assignment", "paper", "research", "class", "quiz",
    "podcast", "chapter", "guide", "certification", "skill", "article", "thesis"
  ],
  Personal: [
    "home", "clean", "cleaning", "laundry", "family", "mom", "dad", "friend",
    "birthday", "gift", "party", "call", "vacuum", "trash", "dog", "cat", "pet",
    "vacation", "trip", "car", "wash", "fix", "repair", "hobby", "garden",
    "shopping", "flight", "hotel", "movie"
  ],
};

/**
 * Infer the category for a task title based on heuristic keyword matching.
 * Returns the detected Category, confidence score (0-1), and matched keywords.
 */
export function inferCategoryFromTitle(title: string): {
  category: Category;
  confidence: number;
  matchedKeywords: string[];
} {
  const normalized = title.toLowerCase().trim();
  if (!normalized) {
    return { category: "Work", confidence: 0, matchedKeywords: [] };
  }

  // Split into token words, stripping non-alphanumeric punctuation
  const words = normalized.split(/[^a-z0-9]+/);

  const categoryScores: Record<Category, { score: number; matches: string[] }> = {
    Work: { score: 0, matches: [] },
    Health: { score: 0, matches: [] },
    Fitness: { score: 0, matches: [] },
    Nutrition: { score: 0, matches: [] },
    Finance: { score: 0, matches: [] },
    Learning: { score: 0, matches: [] },
    Personal: { score: 0, matches: [] },
  };

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    for (const keyword of keywords) {
      // Exact word match gets highest weight (3)
      if (words.includes(keyword)) {
        categoryScores[cat].score += 3;
        categoryScores[cat].matches.push(keyword);
      } 
      // Substring match for longer words gets weight (1)
      else if (keyword.length > 3 && normalized.includes(keyword)) {
        categoryScores[cat].score += 1;
        categoryScores[cat].matches.push(keyword);
      }
    }
  }

  let topCategory: Category = "Work";
  let maxScore = 0;
  let topMatches: string[] = [];

  for (const [cat, { score, matches }] of Object.entries(categoryScores) as [Category, { score: number; matches: string[] }][]) {
    if (score > maxScore) {
      maxScore = score;
      topCategory = cat;
      topMatches = matches;
    }
  }

  // Calculate confidence from 0 to 1
  const confidence = maxScore > 0 ? Math.min(1, maxScore / 5) : 0;

  return {
    category: topCategory,
    confidence,
    matchedKeywords: Array.from(new Set(topMatches)),
  };
}
