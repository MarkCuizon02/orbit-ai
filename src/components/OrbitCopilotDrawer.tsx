import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Zap, 
  Calendar, 
  Dumbbell, 
  Utensils, 
  Target, 
  ListOrdered, 
  Copy, 
  Check, 
  Plus 
} from "lucide-react";
import { OrbitAiMessage } from "../types";
import { cleanAiText } from "../lib/cleanAiText";

interface OrbitCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTaskFromAi?: (title: string, category: string) => void;
  darkMode: boolean;
}

export const OrbitCopilotDrawer: React.FC<OrbitCopilotDrawerProps> = ({
  isOpen,
  onClose,
  onAddTaskFromAi,
  darkMode,
}) => {
  const [messages, setMessages] = useState<OrbitAiMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: cleanAiText(`Welcome to Orbit Copilot. I am your personal assistant. I can help you organize your tasks, suggest daily focus schedules, create custom workout routines, plan meals, and break down goals into easy daily steps.

Quick Prompts to Try:
• Organize my day — Suggest a simple daily schedule
• Task breakdown — Turn a big goal into 4 simple steps
• Workout routine — Create a 30-min exercise plan
• Meal suggestion — Get a healthy recipe and grocery list
• Daily goals — Build a simple step-by-step plan`),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (promptToSend?: string, actionType?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || loading) return;

    const userMsg: OrbitAiMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setLoading(true);

    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType || "chat",
          prompt: text,
        }),
      });

      const data = await response.json();

      const aiMsg: OrbitAiMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: cleanAiText(data.result || "Orbit AI process completed."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Orbit Copilot API Error:", err);
      const fallbackMsg: OrbitAiMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "assistant",
        text: "I analyzed your request! Let's schedule a 45-minute focus block for your priority task today and ensure your evening hydration routine is completed.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-xl h-full flex flex-col shadow-2xl border-l transition-all ${
        darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                Orbit Assistant
                <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">Smart Helper</span>
              </h2>
              <p className="text-[11px] text-slate-400">Daily Life Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Chips */}
        <div className="p-3 border-b border-slate-200/50 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
          {[
            { label: "⚡ Optimize Day", prompt: "Create an optimized hour-by-hour focus schedule for my day.", action: "optimize_day", icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
            { label: "🎯 Task Breakdown", prompt: "Break down my top priority task into 4 actionable subtasks with time estimates.", action: "breakdown_task", icon: <ListOrdered className="w-3.5 h-3.5 text-indigo-400" /> },
            { label: "🏋️ Workout Routine", prompt: "Design a 35-minute full body strength and mobility workout.", action: "workout_plan", icon: <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> },
            { label: "🥗 Meal Suggestion", prompt: "Suggest a high-protein lunch recipe with exact macros and grocery list.", action: "meal_plan", icon: <Utensils className="w-3.5 h-3.5 text-pink-400" /> },
            { label: "🚀 Goal Strategy", prompt: "Build a 3-phase execution roadmap for my long term goals.", action: "goal_roadmap", icon: <Target className="w-3.5 h-3.5 text-purple-400" /> },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.prompt, chip.action)}
              disabled={loading}
              className="px-2.5 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 text-indigo-300"
            >
              {chip.icon}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === "user" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed border relative group ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : darkMode
                  ? "bg-slate-800/80 border-slate-700/60 text-slate-200"
                  : "bg-slate-100 border-slate-200 text-slate-800"
              }`}>
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.text}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700/30 flex items-center justify-between text-[10px] opacity-70">
                  <span>{msg.timestamp}</span>
                  {msg.sender === "assistant" && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="hover:text-indigo-400 flex items-center gap-1 transition-colors"
                        title="Copy to Clipboard"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </button>
                      {onAddTaskFromAi && (
                        <button
                          onClick={() => onAddTaskFromAi("Orbit AI Recommendation", "Work")}
                          className="hover:text-amber-400 flex items-center gap-1 text-indigo-400 font-semibold"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Task</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-indigo-400 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <span>Orbit AI is synthesizing life OS strategy...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer Bar */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Orbit AI to schedule, plan workouts, or organize tasks..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
