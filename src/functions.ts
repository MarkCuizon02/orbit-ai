import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export async function callCloudFunction<TData, TResult>(functionName: string, data: TData): Promise<TResult> {
  const callable = httpsCallable<TData, TResult>(functions, functionName);
  const result = await callable(data);
  return result.data;
}

// Pre-defined Orbit AI Cloud Function Triggers
export async function triggerAIParsing(rawInput: string) {
  try {
    return await callCloudFunction<{ input: string }, any>("parseTaskWithGemini", { input: rawInput });
  } catch (e) {
    console.warn("Cloud function fallback to client-side parsing:", e);
    return null;
  }
}
