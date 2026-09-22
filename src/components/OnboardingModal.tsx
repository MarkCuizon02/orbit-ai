import React, { useState } from "react";
import { 
  Sparkles, 
  Check, 
  User, 
  Briefcase, 
  Target, 
  Moon, 
  Clock, 
  Sun, 
  Layout, 
  ArrowRight, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { saveUserProfile, OnboardingData } from "../firestore";

interface OnboardingModalProps {
  isOpen: boolean;
  userId?: string;
  initialName?: string;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  userId,
  initialName = "",
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialName || "");
  const [role, setRole] = useState("Operator");
  const [goals, setGoals] = useState<string[]>(["Deep Work Mastery", "Health & Energy"]);
  const [sleepSchedule, setSleepSchedule] = useState("23:00 - 07:00 (8 hrs)");
  const [workingHours, setWorkingHours] = useState("09:00 - 18:00");
  const [preferredProductivityTime, setPreferredProductivityTime] = useState("Morning (08:00 - 12:00)");
  const [planningStyle, setPlanningStyle] = useState("Time-Blocking & AI Copilot");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    const data: OnboardingData = {
      name: name || "Operator",
      role,
      goals,
      sleepSchedule,
      workingHours,
      preferredProductivityTime,
      planningStyle,
    };

    if (userId) {
      try {
        await saveUserProfile(userId, data);
      } catch (e) {
        console.warn("Could not save onboarding to Firestore:", e);
      }
    }

    setIsSubmitting(false);
    onComplete(data);
  };

  const availableGoals = [
    "Deep Work Mastery",
    "Health & Macro Fuel",
    "Habit Consistency",
    "Financial Discipline",
    "Goal Milestone Tracking",
    "Stress & Recovery",
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-[#09090D] border border-white/10 rounded-3xl p-6 md:p-8 text-zinc-100 shadow-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Progress indicator */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Orbit AI Onboarding</h3>
                <p className="text-[10px] text-zinc-400 font-mono">Step {step} of 3</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1.5 rounded-full transition-all ${
                    s <= step ? "bg-indigo-500" : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Name, Role & Goals */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Who are you?</h2>
                <p className="text-xs text-zinc-400 mt-1">Configure your operator persona and high-level objectives.</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mark Hurdman"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Primary Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Executive, Founder, Software Engineer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Core Life Goals</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableGoals.map((g) => {
                    const selected = goals.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGoal(g)}
                        className={`p-2.5 rounded-xl text-xs text-left font-medium flex items-center justify-between border transition-all ${
                          selected
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                            : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20"
                        }`}
                      >
                        <span className="truncate pr-1">{g}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <span>Continue to Rhythm & Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Sleep & Work Rhythm */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Sleep & Work Schedule</h2>
                <p className="text-xs text-zinc-400 mt-1">Orbit AI uses these boundaries to protect your energy windows.</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Target Sleep Schedule</label>
                <div className="relative">
                  <Moon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={sleepSchedule}
                    onChange={(e) => setSleepSchedule(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Standard Working Hours</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Peak Productivity Window</label>
                <div className="relative">
                  <Sun className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <select
                    value={preferredProductivityTime}
                    onChange={(e) => setPreferredProductivityTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                    <option value="Afternoon (13:00 - 17:00)">Afternoon (13:00 - 17:00)</option>
                    <option value="Evening (18:00 - 22:00)">Evening (18:00 - 22:00)</option>
                    <option value="Night Owl (22:00 - 02:00)">Night Owl (22:00 - 02:00)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs border border-white/10"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="w-2/3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <span>Planning Preferences</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Planning Style & Final Sync */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Planning & AI Style</h2>
                <p className="text-xs text-zinc-400 mt-1">Select your preferred execution methodology.</p>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Planning Methodology</label>
                <div className="space-y-2">
                  {[
                    "Time-Blocking & AI Copilot",
                    "Eisenhower Priority Matrix (P1-P4)",
                    "Kanban Flow & Sprint Goals",
                    "Minimalist Daily Top 3",
                  ].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setPlanningStyle(style)}
                      className={`w-full p-3 rounded-xl text-xs text-left font-medium flex items-center justify-between border transition-all ${
                        planningStyle === style
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                          : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layout className="w-4 h-4 text-indigo-400" />
                        <span>{style}</span>
                      </div>
                      {planningStyle === style && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs border border-white/10"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={isSubmitting}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 border border-indigo-400/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Onboarding & Sync</span>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
