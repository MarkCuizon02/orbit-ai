# Day 5: Code Literacy — Supporting Document & Recording Script

**Repository:** orbit-ai  
**File:** [src/lib/tagger.ts](src/lib/tagger.ts)  
**Function:** `inferCategoryFromTitle`  
**Location:** [src/lib/tagger.ts#L51-L109](src/lib/tagger.ts#L51-L109)  
**Line Count:** 59 lines (Meets the 50–100 line range limit)

---

## 1. Intro Section: Usage Location & Parameters

### A. Where the Function is Used / Called in the Codebase

1. **[src/components/views/TasksView.tsx](src/components/views/TasksView.tsx)**
   - **Import:** [src/components/views/TasksView.tsx#L3](src/components/views/TasksView.tsx#L3) — `import { inferCategoryFromTitle } from "../../lib/tagger";`
   - **Call Site 1 (Reactive badge preview):** [src/components/views/TasksView.tsx#L95](src/components/views/TasksView.tsx#L95) — `const quickInferred = inferCategoryFromTitle(newTaskTitle);` generates real-time category hints and confidence scores next to the task input field.
   - **Call Site 2 (Dynamic onChange auto-tagger):** [src/components/views/TasksView.tsx#L100](src/components/views/TasksView.tsx#L100) — In `handleTitleChange`, if the user has not manually overridden the category, typing "Run 5km" automatically updates the selected category dropdown to "Fitness".
   - **Call Site 3 (Submit-time metadata generation):** [src/components/views/TasksView.tsx#L200](src/components/views/TasksView.tsx#L200) — In `handleQuickSubmit`, runs inference on task submission to extract `matchedKeywords` and combine them with the category as search tags on the newly created `Task` object.

2. **[src/components/CommandPalette.tsx](src/components/CommandPalette.tsx)**
   - **Import:** [src/components/CommandPalette.tsx#L26](src/components/CommandPalette.tsx#L26) — `import { inferCategoryFromTitle } from "../lib/tagger";`
   - **Call Site 1 (Live preview in global CMD+K launcher):** [src/components/CommandPalette.tsx#L67](src/components/CommandPalette.tsx#L67) — `const heuristicResult = inferCategoryFromTitle(taskTitle);` computes category and confidence to display an intelligent chip preview in the modal.
   - **Call Site 2 (Typing listener):** [src/components/CommandPalette.tsx#L72](src/components/CommandPalette.tsx#L72) — Updates `taskCategory` state unless `isCategoryManuallySelected` is true.
   - **Call Site 3 (Submission auto-tagging):** [src/components/CommandPalette.tsx#L158](src/components/CommandPalette.tsx#L158) — Populates the `tags` array on new tasks created through the Command Palette.

---

### B. Parameters Accepted by the Function

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | Yes | N/A | The raw text title or phrase of the task/event entered by the user (e.g. `"Doctor appointment at 3pm"` or `"Prepare Q3 financial deck"`). |

**Return Value:**

```typescript
{
  category: Category;          // One of: "Work" | "Personal" | "Health" | "Finance" | "Learning" | "Nutrition" | "Fitness"
  confidence: number;        // Normalized score from 0.0 to 1.0 (0% to 100%)
  matchedKeywords: string[]; // De-duplicated array of matched keywords that informed the decision
}
```

---

## 2. Line-by-Line Code Literacy Breakdown

| Line Reference | Exact Code Snippet | Engineer Explanation |
| :--- | :--- | :--- |
| [Line 51](src/lib/tagger.ts#L51) | `export function inferCategoryFromTitle(title: string): {` | Declares and exports the named function `inferCategoryFromTitle`, accepting a single string parameter `title` and defining an inline TypeScript return object type. |
| [Line 52](src/lib/tagger.ts#L52) | `category: Category;` | Defines the `category` property of the return type, typed as the `Category` union representing all 7 domain categories in Orbit AI. |
| [Line 53](src/lib/tagger.ts#L53) | `confidence: number;` | Defines the `confidence` property of the return type, a floating point number between 0 and 1 indicating certainty. |
| [Line 54](src/lib/tagger.ts#L54) | `matchedKeywords: string[];` | Defines the `matchedKeywords` property of the return type, an array of unique string keywords that matched the input. |
| [Line 55](src/lib/tagger.ts#L55) | `} {` | Closes the return type annotation definition and opens the function execution body. |
| [Line 56](src/lib/tagger.ts#L56) | `const normalized = title.toLowerCase().trim();` | Sanitizes and normalizes the incoming title string by converting all characters to lowercase and stripping leading/trailing whitespace. |
| [Line 57](src/lib/tagger.ts#L57) | `if (!normalized) {` | Guard clause checking whether the normalized string is falsy or completely empty after trimming. |
| [Line 58](src/lib/tagger.ts#L58) | `return { category: "Work", confidence: 0, matchedKeywords: [] };` | Fast exit for empty input, returning default category "Work" with zero confidence and an empty match list without doing unnecessary regex or loops. |
| [Line 59](src/lib/tagger.ts#L59) | `}` | Closes the empty input guard clause block. |
| [Line 60](src/lib/tagger.ts#L60) | *(empty line)* | Clean code spacing separating input validation from token extraction. |
| [Line 61](src/lib/tagger.ts#L61) | `// Split into token words, stripping non-alphanumeric punctuation` | Developer comment explaining the subsequent tokenization regular expression. |
| [Line 62](src/lib/tagger.ts#L62) | `const words = normalized.split(/[^a-z0-9]+/);` | Tokenizes the string into an array of isolated alphanumeric words using a negated regex character class (`[^a-z0-9]+`), stripping spaces and punctuation. |
| [Line 63](src/lib/tagger.ts#L63) | *(empty line)* | Clean code spacing separating tokenization from score dictionary setup. |
| [Line 64](src/lib/tagger.ts#L64) | `const categoryScores: Record<Category, { score: number; matches: string[] }> = {` | Initializes the scoring accumulator dictionary typed with `Record<Category, ...>`, mapping each category to its current numeric score and array of matching keywords. |
| [Line 65](src/lib/tagger.ts#L65) | `Work: { score: 0, matches: [] },` | Sets the baseline accumulator entry for the "Work" category. |
| [Line 66](src/lib/tagger.ts#L66) | `Health: { score: 0, matches: [] },` | Sets the baseline accumulator entry for the "Health" category. |
| [Line 67](src/lib/tagger.ts#L67) | `Fitness: { score: 0, matches: [] },` | Sets the baseline accumulator entry for the "Fitness" category. |
| [Line 68](src/lib/tagger.ts#L68) | `Nutrition: { score: 0, matches: [] },` | Sets the baseline accumulator entry for the "Nutrition" category. |
| [Line 69](src/lib/tagger.ts#L69) | `Finance: { score: 0, matches: [] },` | Sets the baseline accumulator entry for the "Finance" category. |
| [Line 70](src/lib/tagger.ts#L70) | `Learning: { score: 0, matches: [] },` | Sets the baseline accumulator entry for the "Learning" category. |
| [Line 71](src/lib/tagger.ts#L71) | `Personal: { score: 0, matches: [] },` | Sets the baseline accumulator entry for the "Personal" category. |
| [Line 72](src/lib/tagger.ts#L72) | `};` | Closes the `categoryScores` dictionary initialization. |
| [Line 73](src/lib/tagger.ts#L73) | *(empty line)* | Clean code spacing separating accumulator setup from the evaluation loop. |
| [Line 74](src/lib/tagger.ts#L74) | `for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {` | Iterates through each category and keyword list in `CATEGORY_KEYWORDS` using `Object.entries` cast to typed tuples. |
| [Line 75](src/lib/tagger.ts#L75) | `for (const keyword of keywords) {` | Inner loop iterating through each individual keyword string defined for that category. |
| [Line 76](src/lib/tagger.ts#L76) | `// Exact word match gets highest weight (3)` | Explanatory comment outlining the heuristic weight strategy for exact word matches. |
| [Line 77](src/lib/tagger.ts#L77) | `if (words.includes(keyword)) {` | Checks whether the tokenized words array contains the exact keyword as a distinct standalone token. |
| [Line 78](src/lib/tagger.ts#L78) | `categoryScores[cat].score += 3;` | Awards a high-weight score of +3 to the category because an exact whole word matched. |
| [Line 79](src/lib/tagger.ts#L79) | `categoryScores[cat].matches.push(keyword);` | Adds the matched keyword to the category's `matches` tracking array. |
| [Line 80](src/lib/tagger.ts#L80) | `}` | Closes the exact word match branch. |
| [Line 81](src/lib/tagger.ts#L81) | `// Substring match for longer words gets weight (1)` | Explanatory comment for the fallback heuristic for partial/substring matches. |
| [Line 82](src/lib/tagger.ts#L82) | `else if (keyword.length > 3 && normalized.includes(keyword)) {` | Evaluates if the keyword has more than 3 characters (avoiding false positives with short abbreviations) and exists as a substring within `normalized`. |
| [Line 83](src/lib/tagger.ts#L83) | `categoryScores[cat].score += 1;` | Awards a lower weight of +1 for a partial substring match. |
| [Line 84](src/lib/tagger.ts#L84) | `categoryScores[cat].matches.push(keyword);` | Adds the matched substring keyword to the category's `matches` tracking array. |
| [Line 85](src/lib/tagger.ts#L85) | `}` | Closes the substring matching condition branch. |
| [Line 86](src/lib/tagger.ts#L86) | `}` | Closes the inner keyword iteration loop. |
| [Line 87](src/lib/tagger.ts#L87) | `}` | Closes the outer category iteration loop. |
| [Line 88](src/lib/tagger.ts#L88) | *(empty line)* | Clean code spacing separating scoring from winner selection. |
| [Line 89](src/lib/tagger.ts#L89) | `let topCategory: Category = "Work";` | Initializes the winning category variable `topCategory` defaulting to "Work". |
| [Line 90](src/lib/tagger.ts#L90) | `let maxScore = 0;` | Initializes `maxScore` variable to 0 to track the highest score recorded across all categories. |
| [Line 91](src/lib/tagger.ts#L91) | `let topMatches: string[] = [];` | Initializes `topMatches` array to store the matched keywords belonging to the winning category. |
| [Line 92](src/lib/tagger.ts#L92) | *(empty line)* | Clean code spacing before the reduction loop. |
| [Line 93](src/lib/tagger.ts#L93) | `for (const [cat, { score, matches }] of Object.entries(categoryScores) as [Category, { score: number; matches: string[] }][]) {` | Iterates over each scored category in `categoryScores` using typed object entries. |
| [Line 94](src/lib/tagger.ts#L94) | `if (score > maxScore) {` | Evaluates whether the current category's accumulated score strictly exceeds the running `maxScore`. |
| [Line 95](src/lib/tagger.ts#L95) | `maxScore = score;` | Updates `maxScore` with the new higher score. |
| [Line 96](src/lib/tagger.ts#L96) | `topCategory = cat;` | Updates `topCategory` with the category key associated with this new maximum score. |
| [Line 97](src/lib/tagger.ts#L97) | `topMatches = matches;` | Replaces `topMatches` with the keywords that contributed to the winning category. |
| [Line 98](src/lib/tagger.ts#L98) | `}` | Closes the maximum score condition block. |
| [Line 99](src/lib/tagger.ts#L99) | `}` | Closes the reduction loop over categories. |
| [Line 100](src/lib/tagger.ts#L100) | *(empty line)* | Clean code spacing separating score reduction from confidence calculation. |
| [Line 101](src/lib/tagger.ts#L101) | `// Calculate confidence from 0 to 1` | Comment clarifying the confidence normalization formula. |
| [Line 102](src/lib/tagger.ts#L102) | `const confidence = maxScore > 0 ? Math.min(1, maxScore / 5) : 0;` | Calculates normalized confidence: if `maxScore > 0`, divides by 5 (scaling factor where 5+ points yields 100% confidence) and caps at 1 using `Math.min`; otherwise 0. |
| [Line 103](src/lib/tagger.ts#L103) | *(empty line)* | Clean code spacing before the final return statement. |
| [Line 104](src/lib/tagger.ts#L104) | `return {` | Begins the return of the structured result object. |
| [Line 105](src/lib/tagger.ts#L105) | `category: topCategory,` | Sets the `category` property to the winning category (`topCategory`). |
| [Line 106](src/lib/tagger.ts#L106) | `confidence,` | Sets the `confidence` property to the normalized confidence float. |
| [Line 107](src/lib/tagger.ts#L107) | `matchedKeywords: Array.from(new Set(topMatches)),` | Removes any duplicate keywords in `topMatches` using an ES6 `Set` and converts it back into an array using `Array.from`. |
| [Line 108](src/lib/tagger.ts#L108) | `};` | Closes the returned object literal. |
| [Line 109](src/lib/tagger.ts#L109) | `}` | Closes the `inferCategoryFromTitle` function definition. |

---

## 3. Video Recording Script & Delivery Guidance

### Setup Checklist

- **View:** VS Code code editor only. Do NOT open the browser or click around the UI.
- **Font Zoom:** Set VS Code editor zoom to at least 100% or 120% so line numbers and text are crisp and easy to read.
- **Audio:** Test microphone input beforehand to ensure clear sound without background hiss.
- **Target Duration:** 10–15 minutes (hard cap is 30 minutes).

### Step-by-Step Script

#### Step 1: Context & Call Sites (First 2–3 minutes)

1. Open [src/components/views/TasksView.tsx](src/components/views/TasksView.tsx).
2. Point out line 3 showing `import { inferCategoryFromTitle } from "../../lib/tagger";`.
3. Scroll to [src/components/views/TasksView.tsx#L95](src/components/views/TasksView.tsx#L95) and [src/components/views/TasksView.tsx#L100](src/components/views/TasksView.tsx#L100):
   > *"Here in TasksView, as the user types into the task input field, `inferCategoryFromTitle` is called on every keystroke. It evaluates the title, and if the user hasn't explicitly selected a category, it dynamically auto-assigns the category dropdown to the inferred category."*
4. Open [src/components/CommandPalette.tsx](src/components/CommandPalette.tsx).
5. Point out line 26 and line 67:
   > *"Similarly, in our global Command Palette, `inferCategoryFromTitle` powers the live heuristic chip tag preview in the quick-add modal."*

#### Step 2: Function Signature & Parameters (1 minute)

1. Open [src/lib/tagger.ts](src/lib/tagger.ts) and navigate to [src/lib/tagger.ts#L51](src/lib/tagger.ts#L51).
2. Highlight lines 51 through 55:
   > *"The function accepts a single parameter: `title: string`. It returns an object containing the inferred `category` (one of the 7 supported categories), a numeric `confidence` score between 0 and 1, and an array of `matchedKeywords`."*

#### Step 3: Line-by-Line Code Walkthrough (8–10 minutes)

1. Walk through lines 56–59 (Sanitization & empty check):
   > *"First, we convert the title to lowercase and trim whitespace. If the string is empty, we exit early with a safe default ('Work') and 0 confidence."*
2. Walk through lines 61–62 (Regex tokenization):
   > *"At line 62, we tokenize the title using `split(/[^a-z0-9]+/)`. This breaks strings like 'doctor, checkup!' into clean word tokens `['doctor', 'checkup']`."*
3. Walk through lines 64–72 (Score dictionary):
   > *"Lines 64 to 72 initialize an accumulator dictionary tracking score and match lists for all seven categories."*
4. Walk through lines 74–87 (Weighted keyword matching):
   > *"Lines 74 to 87 iterate through our keyword dictionary. Line 77 awards 3 points for exact whole-word matches, while line 82 awards 1 point for substring matches on words longer than 3 characters."*
5. Walk through lines 89–99 (Max score determination):
   > *"Lines 89 to 99 perform a standard reduction to find which category scored the highest."*
6. Walk through lines 101–108 (Confidence calculation & deduplication):
   > *"At line 102, we normalize confidence using `Math.min(1, maxScore / 5)`. Finally, at line 107, we deduplicate matched keywords using `Array.from(new Set(topMatches))` and return the result object."*
