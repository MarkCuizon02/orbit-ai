import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, Sparkles, AlertTriangle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "ai" | "streak" | "warning";
  title: string;
  description?: string;
}

interface ToastSystemProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastSystem: React.FC<ToastSystemProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    toasts.forEach((t) => {
      if (t.type === "streak" || t.title.includes("Goal") || t.title.includes("Completed")) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"],
        });
      }
    });
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-6 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl border shadow-xl bg-slate-900/90 text-white backdrop-blur-md flex items-start justify-between gap-3 animate-bounce-subtle ${
            toast.type === "warning"
              ? "border-amber-500/50 shadow-amber-500/10"
              : "border-indigo-500/30"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 shrink-0">
              {toast.type === "ai" ? (
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              ) : toast.type === "warning" ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold">{toast.title}</p>
              {toast.description && <p className="text-[11px] text-slate-300 mt-0.5">{toast.description}</p>}
            </div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
