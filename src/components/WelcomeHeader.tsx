import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Sunrise, Sunset, Sparkles, Maximize2, Minimize2, Compass, Calendar } from "lucide-react";
import { UserOrbitProfile } from "../types";

interface WelcomeHeaderProps {
  profile: UserOrbitProfile;
  darkMode: boolean;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  profile,
  darkMode,
  isFocusMode = false,
  onToggleFocusMode,
}) => {
  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good morning",
        subtext: "Ready to conquer your daily objectives and maintain optimal momentum?",
        icon: <Sunrise className="w-5 h-5 text-amber-400" />,
        badge: "Morning Routine",
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good afternoon",
        subtext: "Stay focused on high-priority goals and keep your momentum building.",
        icon: <Sun className="w-5 h-5 text-amber-300" />,
        badge: "Peak Productivity",
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        greeting: "Good evening",
        subtext: "Review today's achievements and wind down for restorative focus.",
        icon: <Sunset className="w-5 h-5 text-orange-400" />,
        badge: "Evening Wind Down",
      };
    } else {
      return {
        greeting: "Good night",
        subtext: "Rest up and recharge for another high-impact day tomorrow.",
        icon: <Moon className="w-5 h-5 text-indigo-300" />,
        badge: "Rest & Recovery",
      };
    }
  };

  const { greeting, subtext, icon, badge } = getGreetingData();

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className={`p-5 md:p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/15 ${
        darkMode
          ? "bg-zinc-900/60 border-white/10 text-zinc-100"
          : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
      }`}
    >
      <div className="flex items-start md:items-center space-x-4">
        <div className="relative shrink-0">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 p-1 rounded-xl bg-zinc-900 border border-white/10 shadow-sm">
            {icon}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>{greeting}, {profile.name}</span>
            </h1>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              {badge}
            </span>
            {isFocusMode && (
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Focus Active
              </span>
            )}
          </div>

          <p className="text-xs md:text-sm text-zinc-400 max-w-xl">
            {isFocusMode
              ? "Zero-distraction workspace view active. Press ESC or click Exit to restore sidebar."
              : subtext}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{formattedDate}</span>
        </div>

        {onToggleFocusMode && (
          <button
            id="focus-mode-toggle-dashboard-btn"
            onClick={onToggleFocusMode}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border shadow-lg active:scale-95 ${
              isFocusMode
                ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-emerald-400 shadow-emerald-500/20"
                : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/30 shadow-indigo-500/20"
            }`}
            title="Toggle Focus Mode (Press Esc to exit)"
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Focus Mode</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};
