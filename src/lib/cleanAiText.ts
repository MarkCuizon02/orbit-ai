/**
 * Utility function to strip raw Markdown headers (###), bold syntax (**),
 * italic asterisks (*), code block ticks, and formatting artifacts from Gemini AI outputs.
 * Returns clean, professional prose sentences.
 */
export function cleanAiText(rawText: string): string {
  if (!rawText) return "";

  return rawText
    // Remove Markdown header markers e.g. ###, ##, #
    .replace(/#{1,6}\s*/g, "")
    // Remove bold syntax **text** -> text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    // Remove single asterisk or underscore italics
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    // Remove inline code ticks
    .replace(/`{1,3}/g, "")
    // Clean bullet symbols like * or - at start of lines if desired, or keep neat standard bullet dots
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    // Normalize multiple consecutive blank lines down to 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
