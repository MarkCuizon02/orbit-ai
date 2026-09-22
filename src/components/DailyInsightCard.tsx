import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Quote, RefreshCw, Copy, Check, Lightbulb, Zap, TrendingUp, Award } from "lucide-react";

interface DailyInsightCardProps {
  harmonyScore: number;
  darkMode?: boolean;
}

interface InsightData {
  quote: string;
  author: string;
  tip: string;
  theme: "high" | "medium" | "building";
}

const getFallbackInsight = (score: number): InsightData => {
  if (score >= 80) {
    return {
      quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      tip: "Your harmony score is at a peak " + score + "%. Capitalize on this momentum by tackling your highest-leverage P1 task in an uninterrupted 90-minute focus block.",
      theme: "high",
    };
  } else if (score >= 50) {
    return {
      quote: "It's not that I'm so smart, it's just that I stay with problems longer.",
      author: "Albert Einstein",
      tip: "You're holding steady at " + score + "% harmony. Completing 2 small subtasks and logging your daily hydration will propel your score into the top tier today.",
      theme: "medium",
    };
  } else {
    return {
      quote: "Small daily improvements over time lead to stunning results.",
      author: "Robin Sharma",
      tip: "Your score is at " + score + "%. Start small: complete 1 easy habit and take a 10-minute mindfulness break to build instant momentum.",
      theme: "building",
    };
  }
};

export const DailyInsightCard: React.FC<DailyInsightCardProps> = ({
  harmonyScore,
  darkMode = true,
}) => {
  const [insight, setInsight] = useState<InsightData>(() => getFallbackInsight(harmonyScore));
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update fallback insight when harmony score changes significantly
  useEffect(() => {
    setInsight(getFallbackInsight(harmonyScore));
  }, [harmonyScore]);

  const handleFetchAiInsight = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "daily_insight",
          prompt: `User Orbit Harmony Score: ${harmonyScore}%. Generate an inspiring executive quote (with author) and 1 actionable productivity tip tailored to this score.`,
        }),
      });

      const data = await response.json();
      if (data.success && data.result) {
        // Parse result or format cleanly
        const text: string = data.result;
        // Check if response contains quote/author or lines
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        let quoteText = lines[0] || insight.quote;
        let authorText = "Orbit AI Coach";
        let tipText = lines.slice(1).join(" ") || insight.tip;

        if (quoteText.includes("—") || quoteText.includes("-")) {
          const parts = quoteText.split(/—|-/);
          quoteText = parts[0].replace(/^["'“”]+|["'“”]+$/g, "").trim();
          authorText = parts[1]?.trim() || "Orbit AI";
        }

        setInsight({
          quote: quoteText.replace(/^Quote:?\s*/i, "").replace(/^["'“”]+|["'“”]+$/g, ""),
          author: authorText,
          tip: tipText.replace(/^Tip:?\s*/i, "").replace(/^Productivity Tip:?\s*/i, ""),
          theme: harmonyScore >= 80 ? "high" : harmonyScore >= 50 ? "medium" : "building",
        });
      }
    } catch (err) {
      console.warn("AI Insight fetch fallback:", err);
      setInsight(getFallbackInsight(harmonyScore));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const fullText = `"${insight.quote}" — ${insight.author}\n\n💡 Daily Productivity Tip: ${insight.tip}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getBadgeStyle = () => {
    if (insight.theme === "high") {
      return {
        bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        icon: <Award className="w-3.5 h-3.5 text-emerald-400" />,
        label: `${harmonyScore}% Harmony Momentum`,
      };
    } else if (insight.theme === "medium") {
      return {
        bg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
        icon: <Zap className="w-3.5 h-3.5 text-indigo-400" />,
        label: `${harmonyScore}% Harmony Balance`,
      };
    } else {
      return {
        bg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" />,
        label: `${harmonyScore}% Building Focus`,
      };
    }
  };

  const badge = getBadgeStyle();

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-3xl border relative overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/15 ${
        darkMode
          ? "bg-gradient-to-br from-zinc-900/80 via-zinc-900/40 to-indigo-950/30 border-white/10 text-zinc-100"
          : "bg-white border-zinc-200 text-zinc-900 shadow-md"
      }`}
    >
      {/* Decorative Radial Background */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              <span>Daily AI Insight & Inspiration</span>
            </h3>
            <p className="text-xs text-zinc-400">Contextual wisdom based on your Orbit Harmony score.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${badge.bg}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </span>

          <button
            onClick={handleFetchAiInsight}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            title="Refresh AI Insight"
            aria-label="Refresh AI Insight"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all active:scale-95"
            title="Copy Quote & Tip"
            aria-label="Copy Quote & Tip"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Card Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10 pt-1">
        {/* Quote Block */}
        <div className="md:col-span-7 p-4 rounded-2xl bg-zinc-950/60 border border-white/5 flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-2.5">
            <Quote className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 rotate-180 opacity-80" />
            <p className="text-xs md:text-sm italic font-medium leading-relaxed text-zinc-200">
              "{insight.quote}"
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono font-bold text-indigo-300">— {insight.author}</span>
          </div>
        </div>

        {/* Actionable Tip Block */}
        <div className="md:col-span-5 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Today's High-Impact Tip</span>
          </div>
          <p className="text-xs leading-relaxed text-zinc-300">
            {insight.tip}
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Score-driven focus</span>
            <span className="text-emerald-400 font-bold">Orbit Optimized</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
