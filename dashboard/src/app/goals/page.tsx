"use client";

import { useState, useEffect } from "react";

interface Metric { name: string; now: number | string; day30: number | string; day90: number | string; icon: string; color: string; }

export default function GoalsPage() {
  const [youtubeData, setYoutubeData] = useState<{ subscribers: number } | null>(null);
  useEffect(() => { fetch("/api/youtube").then(r => r.json()).then(d => setYoutubeData(d.channel)).catch(() => {}); }, []);

  const metrics: Metric[] = [
    { name: "YouTube Subscribers", now: youtubeData?.subscribers || 359, day30: 500, day90: 1000, icon: "👥", color: "red" },
    { name: "Watch Hours", now: 430, day30: 1500, day90: 3000, icon: "⏱️", color: "blue" },
    { name: "Videos Published", now: 0, day30: 8, day90: 24, icon: "🎬", color: "purple" },
    { name: "Reels Published", now: 0, day30: 16, day90: 48, icon: "⚡", color: "pink" },
    { name: "Telegram Members", now: 0, day30: 50, day90: 200, icon: "📱", color: "cyan" },
    { name: "Revenue (pre-AdSense)", now: "₹0", day30: "₹5K", day90: "₹30K", icon: "💰", color: "green" },
    { name: "N8N Workflows", now: 0, day30: 5, day90: 12, icon: "🔧", color: "orange" },
    { name: "RAG Docs Indexed", now: 0, day30: 50, day90: 200, icon: "📚", color: "indigo" },
  ];

  const stages = [
    { num: 1, title: "Foundation", timeline: "Month 1-3", target: "YPP Qualified", items: ["500 subscribers", "3,000 watch hours", "8 long-form videos", "16 reels/shorts", "Telegram community started", "First ₹5K revenue"] },
    { num: 2, title: "Monetization", timeline: "Month 4-8", target: "₹50K+ MRR", items: ["AdSense enabled", "2,000+ subscribers", "Paid templates/workflows", "Affiliate partnerships", "Telegram premium tier", "First brand deals"] },
    { num: 3, title: "Scale", timeline: "Month 9-18", target: "₹1L+ MRR", items: ["English UI added", "Hindi creator partners", "5,000+ subscribers", "Investor-ready MRR", "Global distribution", "Team expansion"] },
  ];

  return (
    <div style={{ width: "100%" }} className="animate-fadeIn">
      {/* Page Header */}
      <header style={{ marginBottom: "16px" }}>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-3">
          <span>🚀</span> Goals & Roadmap
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">Track your journey to ₹1L+ MRR</p>
      </header>

      {/* The One Rule */}
      <div className="rule-card">
        <div style={{ fontSize: "28px", lineHeight: 1, flexShrink: 0 }}>✨</div>
        <div>
          <h3 className="text-base font-bold text-[var(--system-orange)] mb-1">The One Rule</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Works for Anshuman → Document it → Sell it → Then scale it.</strong><br />
            Ship stage 1 before planning stage 3. Every workflow built = one video. Every video = one step toward YPP + revenue.
          </p>
        </div>
      </div>

      {/* Progress Tracker */}
      <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2" style={{ marginBottom: "12px" }}>
        <span>📊</span> Progress Tracker
      </h2>
      <div className="grid grid-cols-4 gap-3" style={{ marginBottom: "20px" }}>
        {metrics.map((m) => (
          <div key={m.name} className={`metric-card ${m.color}`}>
            <div className="icon">{m.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[var(--text-tertiary)] mb-1 truncate">{m.name}</div>
              <div className="text-xl font-bold text-[var(--text-primary)] mb-1">{m.now}</div>
              <div className="text-xs text-[var(--text-tertiary)]">30d: {m.day30} | 90d: {m.day90}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Growth Roadmap */}
      <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2" style={{ marginBottom: "12px" }}>
        <span>🗺️</span> Growth Roadmap
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {stages.map((stage) => {
          const gradients = ["from-indigo-500 to-purple-500", "from-purple-500 to-pink-500", "from-cyan-500 to-emerald-500"];
          const bgGradients = ["from-indigo-500/10 to-purple-500/10", "from-purple-500/10 to-pink-500/10", "from-cyan-500/10 to-emerald-500/10"];
          return (
            <div key={stage.num} className={`stage-card stage-${stage.num}`}>
              <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[stage.num - 1]} flex items-center justify-center font-bold text-white text-base shadow-lg flex-shrink-0`}>
                  {stage.num}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm">{stage.title}</h4>
                  <span className="text-xs text-[var(--text-tertiary)]">{stage.timeline}</span>
                </div>
              </div>
              <div className={`text-xs font-semibold py-1.5 px-3 rounded-lg bg-gradient-to-r ${bgGradients[stage.num - 1]} text-[var(--text-primary)]`} style={{ marginBottom: "12px" }}>
                Target: {stage.target}
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {stage.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-[var(--system-green)] text-xs">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
