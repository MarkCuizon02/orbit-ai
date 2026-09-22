import React, { useState } from "react";
import heroBgImg from "../assets/images/orbit_hero_bg_1784814165571.jpg";
import aiDemoImg from "../assets/images/orbit_ai_demo_1784814184489.jpg";
import featureBgImg from "../assets/images/orbit_feature_bg_1784814199320.jpg";
import { 
  Sparkles, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  BrainCircuit, 
  CheckSquare, 
  CalendarDays, 
  Flame, 
  Utensils, 
  Dumbbell, 
  CreditCard, 
  Target, 
  Search, 
  ChevronDown, 
  Lock, 
  Globe, 
  Cpu, 
  BarChart3, 
  Play, 
  Star, 
  Layers, 
  Compass, 
  Sliders, 
  Users, 
  Clock, 
  Bot, 
  Check, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Video,
  Film,
  Download,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Orbit3DWorld } from "./landing/Orbit3DWorld";
import { Motion3DCard } from "./landing/Motion3DCard";
import { AuthMode } from "./AuthModal";

interface LandingPageProps {
  onOpenAuth: (mode: AuthMode, plan?: string) => void;
  onLaunchDemoWorkspace: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onLaunchDemoWorkspace,
}) => {
  // Scroll World 3D Motion Hooks
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // 3D Motion transforms for sections based on scroll
  const heroRotateX = useTransform(smoothScroll, [0, 0.2], ["0deg", "12deg"]);
  const heroScale = useTransform(smoothScroll, [0, 0.2], [1, 0.94]);
  const heroY = useTransform(smoothScroll, [0, 0.2], [0, 60]);

  const telemetryY = useTransform(smoothScroll, [0.05, 0.25], [40, 0]);
  const pillarsRotateY = useTransform(smoothScroll, [0.15, 0.35], ["-8deg", "0deg"]);
  const simulatorScale = useTransform(smoothScroll, [0.25, 0.45], [0.92, 1]);
  const previewRotateX = useTransform(smoothScroll, [0.55, 0.75], ["10deg", "0deg"]);
  const pricingY = useTransform(smoothScroll, [0.75, 0.9], [50, 0]);

  // Section 4 Copilot Simulator State
  const [copilotPrompt, setCopilotPrompt] = useState("Schedule my quiet focus time and plan my healthy meals for today");
  const [isSimulatingAI, setIsSimulatingAI] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(
    "Your Day Is Planned: Set aside 9:00 AM - 11:30 AM for focus time. Updated meal plan with healthy salmon bowl & protein shake."
  );

  // Section 5 Chaos vs Harmony Slider State
  const [chaosLevel, setChaosLevel] = useState(30); // 0 = Pure Harmony, 100 = Total Chaos

  // Section 6 Interactive Calculator State
  const [calcSleep, setCalcSleep] = useState(7.5);
  const [calcWorkouts, setCalcWorkouts] = useState(4);
  const [calcDeepWork, setCalcDeepWork] = useState(6);
  const [calcHabitStreak, setCalcHabitStreak] = useState(12);

  const calculateScore = () => {
    let base = 50;
    base += Math.min(calcSleep * 4, 30);
    base += Math.min(calcWorkouts * 3, 15);
    base += Math.min(calcDeepWork * 2, 12);
    base += Math.min(calcHabitStreak * 0.8, 15);
    return Math.min(Math.round(base), 99);
  };

  // Section 8 Live Preview Simulator Tab State
  const [previewTab, setPreviewTab] = useState<"dashboard" | "tasks" | "schedule" | "habits" | "nutrition">("dashboard");

  // Section 10 ROI Simulator State
  const [teamSize, setTeamSize] = useState(1);
  const [hourlyValue, setHourlyValue] = useState(750);

  // Section 13 Pricing State
  const [annualBilling, setAnnualBilling] = useState(true);

  // Section 14 FAQ Search & Accordion State
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleRunCopilot = (promptText: string) => {
    setCopilotPrompt(promptText);
    setIsSimulatingAI(true);
    setAiResult(null);
    setTimeout(() => {
      setIsSimulatingAI(false);
      setAiResult(
        `Finished organizing for "${promptText}". Updated your schedule, balanced your daily meals, and prioritized your top tasks.`
      );
    }, 1200);
  };

  const faqItems = [
    {
      q: "Is my personal information safe and private?",
      a: "Yes! All your personal tasks, habits, meals, and notes remain completely private on your device. We never sell or share your data with anyone.",
    },
    {
      q: "Can I connect my online calendar?",
      a: "Yes! Orbit connects easily with Google Calendar, Outlook, and fitness apps so your schedule stays up to date in one place.",
    },
    {
      q: "Does Orbit work on my phone and computer?",
      a: "Yes! Orbit works smoothly on any device including iPhones, Android phones, Mac, and Windows computers.",
    },
    {
      q: "What is the Life Balance Score?",
      a: "It is a simple daily percentage score showing how well you are keeping up with your tasks, habits, exercise, and rest.",
    },
    {
      q: "Can I save or export my notes and tasks?",
      a: "Yes! You can download or export all your information with a single click whenever you like.",
    },
    {
      q: "How does the 14-day free trial work?",
      a: "You get complete access to all Orbit features for 14 full days without needing a credit card.",
    },
  ];

  const filteredFaqs = faqItems.filter(
    (item) =>
      item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050508] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* ============================================================ */}
      {/* SECTION 1: HERO HEADER & 3D INTERACTIVE PARTICLE CANVAS */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex flex-col justify-between pt-6 pb-16 px-4 md:px-8 border-b border-white/5 overflow-hidden">
        {/* Background Visual Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 mix-blend-screen">
          <img
            src={heroBgImg}
            alt="Orbit Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-110 saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/80 via-[#050508]/60 to-[#050508]" />
        </div>

        {/* Background 3D World Scene */}
        <Orbit3DWorld />

        {/* Top Floating Glass Navigation Header */}
        <nav className="relative z-20 max-w-7xl mx-auto w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onLaunchDemoWorkspace()}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                ORBIT
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">All-In-One Life Assistant</span>
              </div>
            </div>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-8 text-xs font-medium text-zinc-400">
            <a href="#pillars" className="hover:text-white transition-colors">Features</a>
            <a href="#simulator" className="hover:text-white transition-colors">Assistant</a>
            <a href="#preview" className="hover:text-white transition-colors">Preview</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenAuth("login")}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth("signup")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 border border-indigo-500/30 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>

        {/* Hero Central Content */}
        <motion.div 
          style={{ rotateX: heroRotateX, scale: heroScale, y: heroY }}
          className="relative z-10 max-w-5xl mx-auto text-center mt-12 md:mt-20 space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Orbit • Your Personal Daily Life Helper</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white"
          >
            Organize Your Tasks, Habits, Meals & Schedule in <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">One Simple Place</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Stop juggling multiple confusing apps. Orbit brings together your daily task list, calendar, habit tracker, healthy meal planner, and workout logs into one easy-to-use dashboard.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => onOpenAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 border border-indigo-400/30 transition-all flex items-center justify-center gap-2 group hover:scale-105"
            >
              <span>Launch Your Orbit Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onLaunchDemoWorkspace}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm border border-white/10 backdrop-blur-md transition-all flex items-center justify-center gap-2 hover:border-white/20"
            >
              <Play className="w-4 h-4 fill-indigo-400 text-indigo-400" />
              <span>Instant Interactive Demo</span>
            </button>
          </motion.div>

          {/* Micro Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Private & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>No Credit Card Needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>4.9/5 Rating (12k+ Users)</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="relative z-10 text-center mt-12 animate-bounce">
          <a href="#telemetry" className="inline-flex items-center justify-center p-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors">
            <ChevronDown className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: LIVE TELEMETRY & GLOBAL OPERATIONS TICKER */}
      {/* ============================================================ */}
      <section id="telemetry" className="py-8 bg-[#08080C]/90 backdrop-blur-md border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-md">
              <p className="text-2xl md:text-3xl font-mono font-bold text-white">99.99%</p>
              <p className="text-xs text-zinc-500 font-mono uppercase mt-1">Global System Uptime</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-md">
              <p className="text-2xl md:text-3xl font-mono font-bold text-indigo-400">4,280,102</p>
              <p className="text-xs text-zinc-500 font-mono uppercase mt-1">AI Actions Executed Today</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-md">
              <p className="text-2xl md:text-3xl font-mono font-bold text-emerald-400">&lt;12ms</p>
              <p className="text-xs text-zinc-500 font-mono uppercase mt-1">Mean AI Latency</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-md">
              <p className="text-2xl md:text-3xl font-mono font-bold text-purple-400">142</p>
              <p className="text-xs text-zinc-500 font-mono uppercase mt-1">Countries Active</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3: THE 5 CORE PILLARS 3D SHOWCASE GRID */}
      {/* ============================================================ */}
      <section id="pillars" className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>The 5 Core Life Pillars</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Designed for Whole-Life Optimization.
          </h2>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            High performers don't just track tasks—they balance physical energy, habits, nutrition, and strategic focus.
          </p>
        </motion.div>

        <motion.div 
          style={{ rotateY: pillarsRotateY }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {[
            {
              icon: <CheckSquare className="w-6 h-6 text-indigo-400" />,
              title: "Tasks & Priorities",
              desc: "Eisenhower Matrix auto-sorting (P1-P4) with time estimates and deep focus tracking.",
              badge: "Productivity",
              glow: "indigo" as const,
            },
            {
              icon: <Flame className="w-6 h-6 text-amber-400" />,
              title: "Habits & Routines",
              desc: "Daily streak engine, frequency triggers, and momentum scoring.",
              badge: "Consistency",
              glow: "amber" as const,
            },
            {
              icon: <Utensils className="w-6 h-6 text-emerald-400" />,
              title: "Nutrition Fuel",
              desc: "Calorie & macro tracker (Protein, Carbs, Fats) for sustainable physical energy.",
              badge: "Health",
              glow: "emerald" as const,
            },
            {
              icon: <Dumbbell className="w-6 h-6 text-purple-400" />,
              title: "Fitness & Energy",
              desc: "Workout logging, set counts, strength volume, and fatigue management.",
              badge: "Vitality",
              glow: "purple" as const,
            },
            {
              icon: <Target className="w-6 h-6 text-pink-400" />,
              title: "Long-Term Goals",
              desc: "Quarterly trajectory milestones mapped directly to daily task execution.",
              badge: "Trajectory",
              glow: "rose" as const,
            },
          ].map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <Motion3DCard glowColor={pillar.glow} depth={15} className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      {pillar.icon}
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                      {pillar.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{pillar.desc}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                  <span>Pillar 0{idx + 1}</span>
                  <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">Active →</span>
                </div>
              </Motion3DCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: LIVE HOLOGRAPHIC AI COPILOT SIMULATOR */}
      {/* ============================================================ */}
      <section id="simulator" className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>Smart Assistant Engine</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Test Drive Orbit AI Right Now.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Experience instant life optimization. Click any prompt or type your custom instruction to see Orbit AI restructure your day in real-time.
            </p>

            {/* Quick Sample Prompt Chips */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-mono text-zinc-500 uppercase">Try sample instructions:</p>
              {[
                "Schedule my deep work block and log 180g protein for today",
                "I have an urgent P1 project due at 5pm. Clear low-priority noise.",
                "Plan a 45-minute HIIT workout and auto-calculate daily calories.",
              ].map((sample, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 4 }}
                  onClick={() => handleRunCopilot(sample)}
                  className="w-full text-left p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-indigo-500/50 text-xs text-zinc-300 transition-all flex items-center justify-between group backdrop-blur-md"
                >
                  <span className="truncate pr-2">"{sample}"</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Interactive AI Sandbox Window */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <Motion3DCard glowColor="purple" depth={20} className="p-6 md:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-zinc-500 ml-2">Orbit Copilot Terminal v3.5</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  Ready
                </span>
              </div>

              {/* Input field */}
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={copilotPrompt}
                    onChange={(e) => setCopilotPrompt(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-zinc-900 border border-white/10 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-zinc-500 resize-none font-mono"
                  />
                  <button
                    onClick={() => handleRunCopilot(copilotPrompt)}
                    disabled={isSimulatingAI}
                    className="absolute right-3 bottom-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                  >
                    {isSimulatingAI ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Run AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Result Box */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 min-h-[100px] flex items-center">
                  {isSimulatingAI ? (
                    <div className="flex items-center gap-3 text-xs text-indigo-300 font-mono animate-pulse">
                      <Bot className="w-5 h-5 text-indigo-400" />
                      <span>Synthesizing life schedule & optimizing macro metrics...</span>
                    </div>
                  ) : aiResult ? (
                    <div className="space-y-2 text-xs font-mono text-zinc-300">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Execution Complete</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">{aiResult}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </Motion3DCard>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: BEFORE & AFTER TRANSFORMATION */}
      {/* ============================================================ */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span>Interactive Comparison</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            From Messy & Scattered to Calm & Organized.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Drag the slider to compare typical daily chaos with the clean simplicity of Orbit.
          </p>
        </motion.div>

        {/* Chaos vs Harmony Interactive Controls */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8 p-8 rounded-3xl bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-rose-400 flex items-center gap-1.5">
              <span>⚠️ Scattered & Unorganized ({chaosLevel}%)</span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span>✨ Orbit Simple Harmony ({100 - chaosLevel}%)</span>
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={chaosLevel}
            onChange={(e) => setChaosLevel(Number(e.target.value))}
            className="w-full h-3 rounded-lg bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 appearance-none cursor-pointer accent-indigo-500"
          />

          {/* Transformation Display Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chaos Card */}
            <div
              style={{ opacity: chaosLevel / 100 + 0.2 }}
              className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/30 text-rose-200 transition-all backdrop-blur-md"
            >
              <h3 className="text-lg font-bold text-rose-400 mb-3">Without Orbit</h3>
              <ul className="space-y-2 text-xs text-rose-200/80">
                <li>• Juggling 5 different apps every day</li>
                <li>• Forgetting habits and skipping workouts</li>
                <li>• Feeling overwhelmed by long to-do lists</li>
                <li>• Losing track of daily goals and schedule</li>
              </ul>
            </div>

            {/* Orbit Harmony Card */}
            <div
              style={{ opacity: (100 - chaosLevel) / 100 + 0.2 }}
              className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 transition-all backdrop-blur-md"
            >
              <h3 className="text-lg font-bold text-emerald-400 mb-3">With Orbit</h3>
              <ul className="space-y-2 text-xs text-emerald-200/80">
                <li>• 1 clean dashboard for everything</li>
                <li>• Clear daily balance score</li>
                <li>• Automatic daily schedule suggestions</li>
                <li>• Integrated meal, exercise & habit tracker</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6: INTERACTIVE ORBIT HARMONY SCORE CALCULATOR */}
      {/* ============================================================ */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daily Balance Score</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              See Your Daily Life Balance Score.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Adjust your daily habits below to preview your estimated Orbit score.
            </p>

            {/* Sliders */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Nightly Sleep:</span>
                  <span className="text-white font-bold">{calcSleep} hours</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={10}
                  step={0.5}
                  value={calcSleep}
                  onChange={(e) => setCalcSleep(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Weekly Workouts:</span>
                  <span className="text-white font-bold">{calcWorkouts} sessions</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={7}
                  value={calcWorkouts}
                  onChange={(e) => setCalcWorkouts(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Focus Hours Per Day:</span>
                  <span className="text-white font-bold">{calcDeepWork} hours</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={calcDeepWork}
                  onChange={(e) => setCalcDeepWork(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Active Habit Streak:</span>
                  <span className="text-white font-bold">{calcHabitStreak} days</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={calcHabitStreak}
                  onChange={(e) => setCalcHabitStreak(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800"
                />
              </div>
            </div>
          </motion.div>

          {/* Interactive Score Ring Gauge Display */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 flex items-center justify-center"
          >
            <div className="p-8 rounded-3xl bg-zinc-900/80 border border-white/10 text-center relative overflow-hidden max-w-sm w-full backdrop-blur-xl shadow-2xl">
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center my-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-zinc-800"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="url(#calcScoreGradient)"
                    strokeWidth="10"
                    strokeDasharray="427"
                    strokeDashoffset={427 - (427 * calculateScore()) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                    fill="transparent"
                  />
                  <defs>
                    <linearGradient id="calcScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-white">{calculateScore()}</span>
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Balance Score</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mt-2">
                {calculateScore() >= 85 ? "Great Balance" : calculateScore() >= 70 ? "Good Rhythm" : "Room to Grow"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {calculateScore() >= 85
                  ? "Excellent daily routine!"
                  : "Keep tracking daily habits to reach your goal."}
              </p>

              <button
                onClick={() => onOpenAuth("signup")}
                className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all border border-indigo-500/30"
              >
                Start Free Trial
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7: EVERYTHING YOU NEED IN ONE APP */}
      {/* ============================================================ */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Key Features</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Everything You Need, Simplified.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Designed to be fast, friendly, and easy to use for everyone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Private & Safe Storage", desc: "Your personal notes and tasks stay private on your device.", icon: <Lock className="w-5 h-5 text-indigo-400" />, glow: "indigo" as const },
            { title: "Smart Task Priorities", desc: "Organizes your tasks automatically so you always know what to do next.", icon: <BrainCircuit className="w-5 h-5 text-purple-400" />, glow: "purple" as const },
            { title: "Healthy Meal Planner", desc: "Track calories, protein, and daily nutrition with ease.", icon: <Utensils className="w-5 h-5 text-emerald-400" />, glow: "emerald" as const },
            { title: "Quick Shortcuts", desc: "Add new tasks or check your schedule in seconds.", icon: <Zap className="w-5 h-5 text-amber-400" />, glow: "amber" as const },
            { title: "Workout & Fitness Tracker", desc: "Log exercise sessions, sets, and rest times easily.", icon: <Dumbbell className="w-5 h-5 text-pink-400" />, glow: "rose" as const },
            { title: "Personal Expense Helper", desc: "Keep track of upcoming bills and subscription due dates.", icon: <CreditCard className="w-5 h-5 text-blue-400" />, glow: "indigo" as const },
            { title: "Calendar & Focus Planner", desc: "Reserve quiet focus time in your daily schedule.", icon: <CalendarDays className="w-5 h-5 text-teal-400" />, glow: "emerald" as const },
            { title: "Encrypted Notes", desc: "Keep your thoughts, plans, and journal entries secure.", icon: <ShieldCheck className="w-5 h-5 text-rose-400" />, glow: "rose" as const },
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Motion3DCard glowColor={item.glow} depth={12} className="p-5 h-full space-y-2">
                <div className="p-2.5 rounded-xl bg-white/5 w-fit border border-white/10">{item.icon}</div>
                <h3 className="text-sm font-bold text-white pt-2">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </Motion3DCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8: LIVE INTERACTIVE WORKSPACE WALKTHROUGH SIMULATOR */}
      {/* ============================================================ */}
      <section id="preview" className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Interactive Preview</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Explore the Orbit Interface.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Click the tabs below to preview real views inside Orbit right now.
          </p>

          {/* Interactive Preview Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "tasks", label: "Tasks" },
              { id: "schedule", label: "Schedule" },
              { id: "habits", label: "Habits" },
              { id: "nutrition", label: "Nutrition" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPreviewTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  previewTab === tab.id
                    ? "bg-indigo-600 text-white border-indigo-500/50 shadow-md shadow-indigo-600/30"
                    : "bg-zinc-900/80 text-zinc-400 border-white/5 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mockup Frame */}
        <motion.div 
          style={{ rotateX: previewRotateX }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-4 md:p-6 rounded-3xl bg-zinc-950/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-zinc-500 ml-2">Orbit Workspace Simulator</span>
            </div>
            <button
              onClick={onLaunchDemoWorkspace}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Launch Full Screen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Render Simulated Preview Tab Content */}
          <div className="p-6 rounded-2xl bg-[#08080A]/90 border border-white/5 min-h-[300px]">
            {previewTab === "dashboard" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Good Morning!</h4>
                    <p className="text-xs text-zinc-400">3 Priority Tasks today • Life Score: 88%</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono">
                    High Focus Day
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-xs">
                    <p className="text-zinc-500 font-mono">Tasks</p>
                    <p className="text-lg font-bold text-white">5 Completed</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-xs">
                    <p className="text-zinc-500 font-mono">Protein</p>
                    <p className="text-lg font-bold text-emerald-400">142g / 180g</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-xs">
                    <p className="text-zinc-500 font-mono">Habits</p>
                    <p className="text-lg font-bold text-amber-400">14 Day Streak</p>
                  </div>
                </div>
              </div>
            )}

            {previewTab === "tasks" && (
              <div className="space-y-2">
                {[
                  { title: "Finalize Project Presentation", p: "High", est: "90m" },
                  { title: "Review Weekly Progress", p: "Medium", est: "30m" },
                  { title: "Log Lunch Nutrition", p: "Low", est: "5m" },
                ].map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-zinc-200">{t.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">{t.p}</span>
                      <span className="text-zinc-500 font-mono text-[10px]">{t.est}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {previewTab === "schedule" && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex justify-between">
                  <span className="font-bold text-indigo-300">09:00 - 11:30 | Focus Work Session</span>
                  <span className="text-[10px] text-amber-400 font-mono">Reserved</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 flex justify-between">
                  <span className="text-zinc-300">14:00 - 15:00 | Team Check-in</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Calendar</span>
                </div>
              </div>
            )}

            {previewTab === "habits" && (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 flex justify-between items-center">
                  <span className="text-zinc-200">20-Minute Morning Walk</span>
                  <span className="text-amber-400 font-mono font-bold">🔥 18 Days</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 flex justify-between items-center">
                  <span className="text-zinc-200">Drink 8 Glasses of Water</span>
                  <span className="text-amber-400 font-mono font-bold">🔥 12 Days</span>
                </div>
              </div>
            )}

            {previewTab === "nutrition" && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono text-zinc-400 mb-1">
                    <span>Protein Target</span>
                    <span className="text-white">165g / 180g (91%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[91%]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9: 3D ECOSYSTEM & INTEGRATIONS NETWORK */}
      {/* ============================================================ */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Easy Connections</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Connects With Your Favorite Apps.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Sync smoothly with Google Calendar, Apple Health, Strava, Spotify, Notion, Slack, and Outlook.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {["Google Calendar", "Apple Health", "Strava", "Spotify", "Notion", "Slack", "Microsoft Outlook", "GitHub"].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-zinc-300">{item}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 10: INTERACTIVE TIME SAVINGS CALCULATOR */}
      {/* ============================================================ */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Time Savings Calculator</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Reclaim Hours Every Single Week.
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              By combining task management and daily scheduling in one place, Orbit helps you save up to 14 hours every week.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400">Number of Users:</span>
                  <span className="text-white font-bold">{teamSize} {teamSize === 1 ? "Person" : "People"}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400">Estimated Hourly Value:</span>
                  <span className="text-white font-bold">₱{hourlyValue.toLocaleString()}/hr</span>
                </div>
                <input
                  type="range"
                  min={250}
                  max={2500}
                  step={50}
                  value={hourlyValue}
                  onChange={(e) => setHourlyValue(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-zinc-800"
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <div className="p-8 rounded-3xl bg-zinc-900/80 border border-indigo-500/30 text-center space-y-4 backdrop-blur-xl shadow-2xl">
              <p className="text-xs font-mono text-zinc-400 uppercase">Estimated Annual Time Value Saved</p>
              <p className="text-4xl md:text-6xl font-extrabold text-emerald-400 font-mono">
                ₱{(teamSize * 14 * 50 * hourlyValue).toLocaleString()}
              </p>
              <p className="text-xs text-zinc-400 font-mono">
                Based on saving 14 hours per week at ₱{hourlyValue.toLocaleString()}/hr over 50 weeks.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 11: PRIVACY & SAFETY */}
      {/* ============================================================ */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-zinc-950/90 via-zinc-900/90 to-indigo-950/60 border border-white/10 relative overflow-hidden backdrop-blur-xl shadow-2xl"
        >
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Complete Privacy</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Your Data Stays Private and Safe.
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              Orbit protects your personal notes, schedule, and health metrics. We never share or sell your personal details to anyone.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 12: CUSTOMER REVIEWS */}
      {/* ============================================================ */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>User Reviews</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Loved by Busy Professionals, Students & Athletes.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Elena Rostova",
              role: "Design Director",
              text: "Orbit replaced three separate apps for me in one day. My daily routine is so much calmer and organized now.",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              glow: "amber" as const,
            },
            {
              name: "David Chen",
              role: "Small Business Owner",
              text: "Having my calendar, habits, and daily tasks in one simple layout saved me hours every week. I can finally relax in the evening.",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
              glow: "indigo" as const,
            },
            {
              name: "Sarah Jenkins",
              role: "Marathon Runner & Teacher",
              text: "Tracking meals, daily exercise, and my work schedule in a single simple interface keeps my energy steady all day long.",
              avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
              glow: "emerald" as const,
            },
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Motion3DCard glowColor={item.glow} depth={15} className="p-6 h-full space-y-4">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">"{item.text}"</p>
                <div className="flex items-center space-x-3 pt-2 border-t border-white/5">
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20" />
                  <div>
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{item.role}</p>
                  </div>
                </div>
              </Motion3DCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 13: SIMPLE PRICING */}
      {/* ============================================================ */}
      <section id="pricing" className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simple Pricing</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Choose the Right Plan for You.
          </h2>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-mono ${!annualBilling ? "text-white font-bold" : "text-zinc-500"}`}>Monthly</span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 rounded-full bg-indigo-600 p-1 flex items-center transition-colors"
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${annualBilling ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <span className={`text-xs font-mono flex items-center gap-1.5 ${annualBilling ? "text-white font-bold" : "text-zinc-500"}`}>
              Annual Billing <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">Save 20%</span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Motion3DCard glowColor="indigo" depth={15} className="p-8 h-full flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Free Starter</h3>
                <p className="text-xs text-zinc-400">Essential task management & habit tracking for individuals.</p>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-4xl font-extrabold text-white">₱0</span>
                  <span className="text-xs text-zinc-500">/ free forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Full Tasks & To-Do Lists</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Daily Habit Tracker</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Basic Calendar View</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Safe Local Storage</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth("signup", "Starter Free")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all"
              >
                Start Free
              </button>
            </Motion3DCard>
          </motion.div>

          {/* Pro Plan (Featured) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Motion3DCard glowColor="purple" depth={25} className="p-8 h-full flex flex-col justify-between space-y-6 relative border-2 border-indigo-500">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-white">Pro Plan</h3>
                <p className="text-xs text-zinc-400">Unlocks smart assistant help, nutrition tracking & daily balance score.</p>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-4xl font-extrabold text-white">₱{annualBilling ? "749" : "899"}</span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> <strong>Smart Assistant Helper</strong></li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Unlimited Tasks, Habits & Workouts</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Nutrition & Calorie Planner</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Daily Balance Score & Progress</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Quick Keyboard Shortcuts</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth("signup", "Pro Plan")}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition-all border border-indigo-400/30"
              >
                Start 14-Day Free Trial
              </button>
            </Motion3DCard>
          </motion.div>

          {/* Team Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Motion3DCard glowColor="emerald" depth={15} className="p-8 h-full flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Team Plan</h3>
                <p className="text-xs text-zinc-400">For teams and families wanting shared productivity and schedules.</p>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-4xl font-extrabold text-white">₱{annualBilling ? "1,999" : "2,499"}</span>
                  <span className="text-xs text-zinc-500">/ user / mo</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Everything in Pro Plan</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Shared Family/Team Dashboards</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Priority Support</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Custom Group Schedules</li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth("signup", "Team Plan")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all"
              >
                Contact Sales
              </button>
            </Motion3DCard>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 14: FAQ ACCORDION */}
      {/* ============================================================ */}
      <section id="faq" className="py-24 px-4 md:px-8 max-w-4xl mx-auto border-b border-white/5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions.
          </h2>
          <p className="text-zinc-400 text-sm">Everything you need to know about Orbit.</p>

          {/* Instant Search input */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search questions..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-zinc-500 font-mono"
            />
          </div>
        </motion.div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-2xl bg-zinc-900/60 border border-white/5 overflow-hidden backdrop-blur-md"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between hover:text-indigo-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 text-xs text-zinc-400 font-sans leading-relaxed border-t border-white/5 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 15: GRAND FINALE CTA */}
      {/* ============================================================ */}
      <section className="py-28 px-4 md:px-8 max-w-5xl mx-auto text-center relative overflow-hidden z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-xl shadow-indigo-500/20">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Ready to Organize Your Life?
          </h2>

          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of people who brought clarity and balance into their daily routine with Orbit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenAuth("signup")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 border border-indigo-400/30 transition-all hover:scale-105"
            >
              Start Free 14-Day Trial
            </button>
            <button
              onClick={onLaunchDemoWorkspace}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm border border-white/10 backdrop-blur-md transition-all"
            >
              Try Live Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5 text-center text-xs text-zinc-500 font-mono relative z-10">
        <p>© {new Date().getFullYear()} Orbit Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
