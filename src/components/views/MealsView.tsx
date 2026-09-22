import React, { useState } from "react";
import { MealPlanItem, UserOrbitProfile } from "../../types";
import { 
  Utensils, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ShoppingBag, 
  Trash2, 
  Apple, 
  Flame 
} from "lucide-react";

interface MealsViewProps {
  meals: MealPlanItem[];
  profile: UserOrbitProfile;
  onAddMeal: (m: Omit<MealPlanItem, "id" | "consumed">) => void;
  onToggleMeal: (id: string) => void;
  onDeleteMeal: (id: string) => void;
  onOpenQuickAdd: () => void;
  darkMode: boolean;
}

export const MealsView: React.FC<MealsViewProps> = ({
  meals,
  profile,
  onAddMeal,
  onToggleMeal,
  onDeleteMeal,
  onOpenQuickAdd,
  darkMode,
}) => {
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [aiRecipeResult, setAiRecipeResult] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const totalCalories = meals.filter((m) => m.consumed).reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.filter((m) => m.consumed).reduce((acc, m) => acc + m.proteinGrams, 0);
  const totalCarbs = meals.filter((m) => m.consumed).reduce((acc, m) => acc + m.carbsGrams, 0);
  const totalFat = meals.filter((m) => m.consumed).reduce((acc, m) => acc + m.fatGrams, 0);

  // Auto-gather ingredients from all meals
  const allIngredients = Array.from(
    new Set(meals.flatMap((m) => m.ingredients || []))
  );

  const handleGenerateRecipe = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "meal_plan",
          prompt: `Generate a 550 calorie meal recipe with at least 45g protein for lunch or dinner. Include exact macros and ingredient list.`,
        }),
      });

      const data = await response.json();
      setAiRecipeResult(data.result || "Recipe generated.");
    } catch (err) {
      console.error("AI Recipe error:", err);
      setAiRecipeResult("### 🥗 High Protein Salmon Quinoa Bowl\n- **Calories:** 580 kcal | **Protein:** 45g | **Carbs:** 50g | **Fat:** 18g\n- **Ingredients:** Wild Salmon, Quinoa, Sweet Potato, Spinach, Tahini Dressing.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Utensils className="w-6 h-6 text-pink-500" />
            <span>Meals & Nutrition</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Macro-targeted meal planning, calorie tracking, and automated grocery list generator.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGroceryModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Auto Grocery List</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Macro Target Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex justify-between items-center text-xs font-bold mb-1">
            <span className="text-slate-400">Calories</span>
            <span>{totalCalories}/{profile.dailyCalorieTarget}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 rounded-full" style={{ width: `${Math.min((totalCalories / profile.dailyCalorieTarget) * 100, 100)}%` }} />
          </div>
        </div>

        <div className={`p-4 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex justify-between items-center text-xs font-bold mb-1">
            <span className="text-indigo-400">Protein</span>
            <span>{totalProtein}g/{profile.proteinTargetGrams}g</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((totalProtein / profile.proteinTargetGrams) * 100, 100)}%` }} />
          </div>
        </div>

        <div className={`p-4 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex justify-between items-center text-xs font-bold mb-1">
            <span className="text-amber-400">Carbs</span>
            <span>{totalCarbs}g/{profile.carbsTargetGrams}g</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((totalCarbs / profile.carbsTargetGrams) * 100, 100)}%` }} />
          </div>
        </div>

        <div className={`p-4 rounded-3xl border ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex justify-between items-center text-xs font-bold mb-1">
            <span className="text-emerald-400">Fats</span>
            <span>{totalFat}g/{profile.fatTargetGrams}g</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((totalFat / profile.fatTargetGrams) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* AI Recipe Generator Banner */}
      <div className={`p-6 rounded-3xl border bg-gradient-to-br from-pink-950/40 via-slate-900 to-slate-900 border-pink-500/30 text-slate-100 shadow-xl space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
            <h2 className="font-extrabold text-base text-pink-400">Orbit AI Recipe & Nutrition Engine</h2>
          </div>
          <button
            onClick={handleGenerateRecipe}
            disabled={loadingAi}
            className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs"
          >
            {loadingAi ? "Generating..." : "Suggest High-Protein Meal"}
          </button>
        </div>

        {aiRecipeResult && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-pink-500/20 text-xs space-y-2">
            <div className="whitespace-pre-wrap leading-relaxed">{aiRecipeResult}</div>
          </div>
        )}
      </div>

      {/* Meal Items List by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["Breakfast", "Lunch", "Dinner", "Snack"].map((mType) => {
          const matching = meals.filter((m) => m.mealType === mType);

          return (
            <div
              key={mType}
              className={`p-6 rounded-3xl border ${
                darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <h2 className="font-extrabold text-base mb-4 border-b pb-2 border-slate-200/50 dark:border-slate-800">
                {mType}
              </h2>

              <div className="space-y-3">
                {matching.length === 0 ? (
                  <p className="text-xs text-slate-500">No {mType.toLowerCase()} logged.</p>
                ) : (
                  matching.map((meal) => (
                    <div
                      key={meal.id}
                      onClick={() => onToggleMeal(meal.id)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        meal.consumed
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : darkMode
                          ? "bg-slate-800/40 border-slate-800"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className={`w-5 h-5 ${meal.consumed ? "text-emerald-400 fill-emerald-400" : "text-slate-500"}`} />
                        <div>
                          <p className="text-xs font-bold">{meal.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {meal.calories} kcal • {meal.proteinGrams}g P / {meal.carbsGrams}g C / {meal.fatGrams}g F
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMeal(meal.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grocery Modal */}
      {showGroceryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
            darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <h2 className="font-extrabold text-lg">Auto-Gathered Grocery Checklist</h2>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Gathered directly from your active meal plan ingredients:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
              {allIngredients.length === 0 ? (
                <p className="text-xs text-slate-500">No ingredients specified in meals yet.</p>
              ) : (
                allIngredients.map((ing, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    <span>{ing}</span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowGroceryModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Close Checklist
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
