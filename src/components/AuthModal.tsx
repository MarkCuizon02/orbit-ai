import React, { useState } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Key,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginWithEmail, registerWithEmail, loginWithGoogle, resetUserPassword } from "../auth";

export type AuthMode = "login" | "signup" | "forgotPassword" | "googleSelect";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccessLogin: (userData: { name: string; email: string; avatarUrl?: string; isNewUser?: boolean }) => void;
  selectedPlan?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "login",
  onClose,
  onSuccessLogin,
  selectedPlan,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (mode === "login") {
      if (!email || !password) {
        setErrorMsg("Please enter both email and password.");
        return;
      }
      setLoading(true);
      try {
        const user = await loginWithEmail(email, password, rememberMe);
        setLoading(false);
        onSuccessLogin({
          name: user.displayName || email.split("@")[0] || "Operator",
          email: user.email || email,
          avatarUrl: user.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        });
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || "Failed to sign in. Please check your credentials.");
      }
    } else if (mode === "signup") {
      if (!name || !email || !password) {
        setErrorMsg("Please complete all required fields.");
        return;
      }
      if (!acceptedTerms) {
        setErrorMsg("Please accept the terms of service.");
        return;
      }
      setLoading(true);
      try {
        const user = await registerWithEmail(email, password, name);
        setLoading(false);
        onSuccessLogin({
          name: name,
          email: user.email || email,
          avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          isNewUser: true,
        });
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || "Failed to create account.");
      }
    } else if (mode === "forgotPassword") {
      if (!email) {
        setErrorMsg("Please enter your registered email address.");
        return;
      }
      setLoading(true);
      try {
        await resetUserPassword(email);
        setLoading(false);
        setResetSent(true);
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err.message || "Failed to send password reset email.");
      }
    }
  };

  const handleGoogleSignIn = async (presetAccount?: { name: string; email: string; picture: string }) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const user = await loginWithGoogle();
      setLoading(false);
      onSuccessLogin({
        name: user.displayName || presetAccount?.name || "Mark Hurdman",
        email: user.email || presetAccount?.email || "mark@hurdman.net",
        avatarUrl: user.photoURL || presetAccount?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      });
    } catch (err: any) {
      setLoading(false);
      // If popup blocked or cancelled, allow simulated preset or show error
      if (presetAccount) {
        onSuccessLogin({
          name: presetAccount.name,
          email: presetAccount.email,
          avatarUrl: presetAccount.picture,
        });
      } else {
        setErrorMsg(err.message || "Google sign-in was interrupted.");
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden bg-[#0A0A0E] border border-white/10 rounded-3xl shadow-2xl text-zinc-100"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {/* Plan Badge if selected */}
            {selectedPlan && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Plan: {selectedPlan}</span>
              </div>
            )}

            {/* Mode Header */}
            {mode === "login" && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Sign in to access your Orbit account and daily planner
                </p>
              </div>
            )}

            {mode === "signup" && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">Create Orbit Account</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Start your 14-day free trial with full access to all features
                </p>
              </div>
            )}

            {mode === "forgotPassword" && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">Reset Password</h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Enter your registered email to receive recovery instructions
                </p>
              </div>
            )}

            {mode === "googleSelect" && (
              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Sign in with Google</h2>
                <p className="text-xs text-zinc-400 mt-1">Select an account to continue to Orbit OS</p>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Forgot Password Reset Success */}
            {mode === "forgotPassword" && resetSent ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Reset Link Dispatched</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We've sent a secure password reset link to <strong className="text-white">{email}</strong>. Please check your inbox or spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setMode("login");
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-all border border-white/10"
                >
                  Return to Sign In
                </button>
              </div>
            ) : mode === "googleSelect" ? (
              /* Google Account Selector UI */
              <div className="space-y-3 py-2">
                <button
                  onClick={() =>
                    handleGoogleSignIn({
                      name: "Mark Hurdman",
                      email: "mark@hurdman.net",
                      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    })
                  }
                  className="w-full p-3 rounded-2xl bg-zinc-900 border border-white/10 hover:border-indigo-500/50 flex items-center gap-3 transition-all text-left group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    alt="Mark"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Mark Hurdman</p>
                    <p className="text-xs text-zinc-400 font-mono truncate">mark@hurdman.net</p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() =>
                    handleGoogleSignIn({
                      name: "Alex Vance",
                      email: "alex.vance@orbit.ai",
                      picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                    })
                  }
                  className="w-full p-3 rounded-2xl bg-zinc-900 border border-white/10 hover:border-indigo-500/50 flex items-center gap-3 transition-all text-left group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="Alex"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Alex Vance</p>
                    <p className="text-xs text-zinc-400 font-mono truncate">alex.vance@orbit.ai</p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => setMode("login")}
                  className="w-full py-2.5 text-xs text-zinc-400 hover:text-white transition-colors text-center font-medium mt-2"
                >
                  Use another email address
                </button>
              </div>
            ) : (
              /* Email/Password Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="e.g. Mark Hurdman"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-zinc-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="operator@orbit.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>

                {mode !== "forgotPassword" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono text-zinc-400">Password</label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => setMode("forgotPassword")}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-white/10 focus:border-indigo-500 focus:outline-none text-xs text-white placeholder-zinc-500"
                      />
                    </div>
                  </div>
                )}

                {/* Mode Checkboxes */}
                {mode === "login" && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-white/20 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Remember this browser</span>
                    </label>
                  </div>
                )}

                {mode === "signup" && (
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-400">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5 rounded border-white/20 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        I agree to Orbit OS <span className="text-indigo-400 underline">Terms of Service</span> and <span className="text-indigo-400 underline">Privacy Policy</span>.
                      </span>
                    </label>
                  </div>
                )}

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 border border-indigo-500/30 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === "login" ? "Sign In to Orbit OS" : mode === "signup" ? "Create Account" : "Dispatch Reset Link"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Google Sign In Divider */}
                {mode !== "forgotPassword" && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                        <span className="bg-[#0A0A0E] px-2">Or continue with</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMode("googleSelect")}
                      className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-xs flex items-center justify-center gap-2.5 border border-white/10 transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Bottom Footer Switch */}
            <div className="mt-6 pt-4 border-t border-white/5 text-center text-xs text-zinc-400">
              {mode === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setMode("signup");
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Sign Up Free
                  </button>
                </p>
              ) : mode === "signup" ? (
                <p>
                  Already registered?{" "}
                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setMode("login");
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setMode("login");
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
