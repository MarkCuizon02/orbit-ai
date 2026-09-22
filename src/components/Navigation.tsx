import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  Flame, 
  Dumbbell, 
  Utensils, 
  CreditCard, 
  FileText, 
  Target, 
  Sparkles, 
  Plus, 
  Moon, 
  Sun, 
  Search,
  Compass,
  Zap,
  RotateCcw,
  Globe,
  LogOut,
  Maximize2,
  Minimize2,
  Menu,
  X
} from "lucide-react";

export type NavTab = 
  | "dashboard" 
  | "tasks" 
  | "schedule" 
  | "habits" 
  | "fitness" 
  | "meals" 
  | "bills" 
  | "notes" 
  | "goals";

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  harmonyScore: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenQuickAdd: () => void;
  onOpenCopilot: () => void;
  onResetData: () => void;
  onReturnToLanding?: () => void;
  onOpenOnboarding?: () => void;
  onLogout?: () => void;
  userName: string;
  avatarUrl: string;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  harmonyScore,
  darkMode,
  setDarkMode,
  onOpenQuickAdd,
  onOpenCopilot,
  onResetData,
  onReturnToLanding,
  onOpenOnboarding,
  onLogout,
  userName,
  avatarUrl,
  isFocusMode = false,
  onToggleFocusMode,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "tasks", label: "Tasks & Priorities", icon: <CheckSquare className="w-5 h-5" /> },
    { id: "schedule", label: "Schedule & Blocks", icon: <CalendarDays className="w-5 h-5" /> },
    { id: "habits", label: "Habits & Routines", icon: <Flame className="w-5 h-5" /> },
    { id: "fitness", label: "Fitness & Workouts", icon: <Dumbbell className="w-5 h-5" /> },
    { id: "meals", label: "Meals & Nutrition", icon: <Utensils className="w-5 h-5" /> },
    { id: "bills", label: "Bills & Subscriptions", icon: <CreditCard className="w-5 h-5" /> },
    { id: "notes", label: "Notes & Reflection", icon: <FileText className="w-5 h-5" /> },
    { id: "goals", label: "Long-Term Goals", icon: <Target className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex flex-col ${isFocusMode ? "w-20" : "w-64"} border-r transition-all duration-300 ${
        darkMode ? "bg-[#08080A] border-white/5 text-zinc-200" : "bg-white border-zinc-200 text-zinc-800"
      } shrink-0`}>
        {/* Brand Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold shrink-0">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            {!isFocusMode && (
              <div>
                <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  ORBIT AI
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-[10px] uppercase font-semibold tracking-widest text-zinc-500">System Active</p>
                </div>
              </div>
            )}
          </div>

          {onToggleFocusMode && (
            <button
              id="focus-mode-toggle-sidebar-btn"
              onClick={onToggleFocusMode}
              className={`p-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                isFocusMode 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30" 
                  : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border-white/5"
              }`}
              title={isFocusMode ? "Exit Focus Mode" : "Focus Mode (Hides non-essentials & expands view)"}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4 text-emerald-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Non-essential: Orbit Life Harmony Score Indicator (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <div className="p-4 mx-3 my-3 rounded-2xl bg-zinc-900/40 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Orbit Score
              </span>
              <span className="text-xs font-bold text-emerald-400">{harmonyScore}%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${harmonyScore}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 font-mono">
              {harmonyScore >= 80 ? "Optimal Momentum" : harmonyScore >= 60 ? "Balanced Pace" : "Room to Optimize"}
            </p>
          </div>
        )}

        {/* Orbit AI Copilot Button */}
        <div className="px-3 mb-3 mt-3">
          <button
            id="orbit-ai-copilot-trigger"
            onClick={onOpenCopilot}
            className={`w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all border border-indigo-500/30 active:scale-98 ${
              isFocusMode ? "px-2" : "px-3 justify-between"
            }`}
            title="Orbit AI Copilot (Cmd+K)"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              {!isFocusMode && <span>Orbit AI Copilot</span>}
            </span>
            {!isFocusMode && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Cmd+K</span>}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                title={isFocusMode ? item.label : undefined}
                className={`w-full flex items-center gap-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 border ${
                  isFocusMode ? "justify-center px-2" : "px-3"
                } ${
                  isActive
                    ? "bg-white/10 text-white border-white/15 font-semibold shadow-sm"
                    : darkMode
                    ? "text-zinc-400 border-transparent hover:text-white hover:bg-white/5"
                    : "text-zinc-600 border-transparent hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <span className={isActive ? "text-indigo-400" : "text-zinc-500"}>{item.icon}</span>
                {!isFocusMode && <span className="flex-1 text-left">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Actions Footer */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* Non-essential: Product Landing link hidden in Focus Mode */}
          {!isFocusMode && onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-between transition-all border border-white/5"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Product Landing Site</span>
              </span>
              <LogOut className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          )}

          <div className={`flex items-center ${isFocusMode ? "justify-center flex-col gap-2" : "justify-between"}`}>
            <div 
              onClick={onOpenOnboarding} 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              title="Click to re-run Onboarding & Preferences"
            >
              <img 
                src={avatarUrl} 
                alt={userName} 
                className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20 shrink-0" 
              />
              {!isFocusMode && (
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold truncate text-zinc-200">{userName}</p>
                  <p className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
                    <span>Edit Profile</span>
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button
                id="theme-toggle-btn"
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
              {onLogout && (
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className={`md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md transition-colors ${
        darkMode ? "bg-[#08080A]/95 border-white/10 text-zinc-100" : "bg-white/95 border-zinc-200 text-zinc-900"
      }`}>
        <div className="flex items-center space-x-3">
          {/* Hamburger Menu Toggle Icon */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl transition-all border shrink-0 active:scale-95 ${
              isMobileMenuOpen 
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/30" 
                : darkMode
                ? "bg-white/5 text-zinc-300 hover:text-white border-white/10"
                : "bg-zinc-100 text-zinc-700 hover:text-zinc-900 border-zinc-200"
            }`}
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            className="flex items-center space-x-2 cursor-pointer active:opacity-80" 
            onClick={() => {
              setActiveTab("dashboard");
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
              ORBIT AI
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              className={`p-2 rounded-xl text-xs font-semibold transition-all border active:scale-95 ${
                isFocusMode
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-white/5 text-zinc-400 border-white/10"
              }`}
              title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
            >
              {isFocusMode ? <Minimize2 className="w-4 h-4 text-emerald-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onOpenCopilot}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 active:scale-95"
            title="Orbit AI Copilot"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 active:scale-95"
            title="Quick Add Task/Habit"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 border border-white/5 active:scale-95"
            title="Toggle Dark/Light Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Collapsible Sidebar Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            />

            {/* Sliding Drawer Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className={`fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] flex flex-col border-r shadow-2xl md:hidden overflow-hidden ${
                darkMode ? "bg-[#08080C] border-white/10 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/30">
                <div 
                  className="flex items-center space-x-3 cursor-pointer" 
                  onClick={() => { 
                    setActiveTab("dashboard"); 
                    setIsMobileMenuOpen(false); 
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/30 text-white font-bold shrink-0">
                    <Compass className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div>
                    <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                      ORBIT AI
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <p className="text-[10px] uppercase font-semibold tracking-widest text-zinc-400">System Active</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Banner & Orbit Score */}
              <div className="p-4 bg-indigo-500/5 border-b border-white/5 space-y-3">
                <div 
                  onClick={() => { 
                    onOpenOnboarding?.(); 
                    setIsMobileMenuOpen(false); 
                  }} 
                  className="flex items-center space-x-3 cursor-pointer p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                  title="Edit Profile & Preferences"
                >
                  <img 
                    src={avatarUrl} 
                    alt={userName} 
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30 shrink-0" 
                  />
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-bold truncate text-zinc-100">{userName}</p>
                    <p className="text-[11px] text-indigo-400 font-mono flex items-center gap-1">
                      <span>Edit Profile & Goals</span>
                    </p>
                  </div>
                </div>

                {/* Orbit Score Bar */}
                <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Orbit Harmony
                    </span>
                    <span className="text-xs font-bold text-emerald-400">{harmonyScore}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                      style={{ width: `${harmonyScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Copilot & Quick Add Action Grid */}
              <div className="p-3 grid grid-cols-2 gap-2 border-b border-white/5 bg-zinc-900/20">
                <button
                  onClick={() => { 
                    onOpenCopilot(); 
                    setIsMobileMenuOpen(false); 
                  }}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>AI Copilot</span>
                </button>
                <button
                  onClick={() => { 
                    onOpenQuickAdd(); 
                    setIsMobileMenuOpen(false); 
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Quick Capture</span>
                </button>
              </div>

              {/* Complete Navigation Items (All 9 Tabs) */}
              <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                <p className="px-3 pb-2 text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500">
                  Workspace Modules
                </p>
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`mobile-drawer-nav-tab-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 min-h-[44px] py-2.5 px-3.5 rounded-2xl font-medium text-sm transition-all duration-150 border active:scale-98 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-500/50 font-semibold shadow-lg shadow-indigo-500/25"
                          : darkMode
                          ? "text-zinc-300 border-transparent hover:text-white hover:bg-white/5"
                          : "text-zinc-700 border-transparent hover:text-zinc-900 hover:bg-zinc-100"
                      }`}
                    >
                      <span className={isActive ? "text-white" : "text-indigo-400"}>{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-white/10 space-y-2.5 bg-zinc-950/60">
                {onReturnToLanding && (
                  <button
                    onClick={() => { 
                      onReturnToLanding(); 
                      setIsMobileMenuOpen(false); 
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-medium text-xs flex items-center justify-between border border-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>Product Landing Page</span>
                    </span>
                    <LogOut className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white border border-white/5 transition-colors"
                  >
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    <span>{darkMode ? "Light Theme" : "Dark Theme"}</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => { 
                        onLogout(); 
                        setIsMobileMenuOpen(false); 
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Streamlined quick switch) */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 border-t backdrop-blur-md transition-colors ${
        darkMode ? "bg-[#08080C]/90 border-white/10 text-zinc-300" : "bg-white/90 border-zinc-200 text-zinc-600"
      }`}>
        {[
          { id: "dashboard", label: "Orbit", icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: "tasks", label: "Tasks", icon: <CheckSquare className="w-5 h-5" /> },
          { id: "schedule", label: "Calendar", icon: <CalendarDays className="w-5 h-5" /> },
          { id: "habits", label: "Habits", icon: <Flame className="w-5 h-5" /> },
          { id: "goals", label: "Goals", icon: <Target className="w-5 h-5" /> },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as NavTab);
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium py-1 px-3.5 rounded-xl transition-all ${
                isActive ? "text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
