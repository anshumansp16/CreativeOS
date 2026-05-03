"use client";

import { useState, useEffect } from "react";
import { RocketLaunchIcon, ChartBarIcon, CurrencyRupeeIcon, UserGroupIcon, PlayCircleIcon, ClockIcon, DocumentTextIcon, BoltIcon, CheckCircleIcon, ArrowTrendingUpIcon, SparklesIcon, FireIcon } from "@heroicons/react/24/outline";

interface Metric { name: string; now: number | string; day30: number | string; day90: number | string; icon: React.ElementType; color: string; }
interface Stage { title: string; timeline: string; target: string; items: string[]; color: string; }

export default function GoalsPage() {
  const [youtubeData, setYoutubeData] = useState<{ subscribers: number } | null>(null);
  useEffect(() => { fetch("/api/youtube").then(r => r.json()).then(d => setYoutubeData(d.channel)).catch(() => {}); }, []);

  const metrics: Metric[] = [
    { name: "YouTube Subscribers", now: youtubeData?.subscribers || 359, day30: 500, day90: 1000, icon: UserGroupIcon, color: "red" },
    { name: "Watch Hours", now: 430, day30: 1500, day90: 3000, icon: ClockIcon, color: "blue" },
    { name: "Videos Published", now: 0, day30: 8, day90: 24, icon: PlayCircleIcon, color: "purple" },
    { name: "Reels Published", now: 0, day30: 16, day90: 48, icon: BoltIcon, color: "pink" },
    { name: "Telegram Members", now: 0, day30: 50, day90: 200, icon: UserGroupIcon, color: "cyan" },
    { name: "Revenue (pre-AdSense)", now: "₹0", day30: "₹5K", day90: "₹30K", icon: CurrencyRupeeIcon, color: "green" },
    { name: "N8N Workflows Built", now: 0, day30: 5, day90: 12, icon: DocumentTextIcon, color: "orange" },
    { name: "RAG Docs Indexed", now: 0, day30: 50, day90: 200, icon: ChartBarIcon, color: "indigo" },
  ];

  const stages: Stage[] = [
    { title: "Stage 1: Foundation", timeline: "Month 1-3", target: "YPP Qualified", color: "indigo", items: ["500 subscribers", "3,000 watch hours", "8 long-form videos", "16 reels/shorts", "Telegram community started", "First ₹5K revenue"] },
    { title: "Stage 2: Monetization", timeline: "Month 4-8", target: "₹50K+ MRR", color: "purple", items: ["AdSense enabled", "2,000+ subscribers", "Paid templates/workflows", "Affiliate partnerships", "Telegram premium tier", "First brand deals"] },
    { title: "Stage 3: Scale", timeline: "Month 9-18", target: "₹1L+ MRR", color: "cyan", items: ["English UI added", "Hindi creator partners", "5,000+ subscribers", "Investor-ready MRR", "Global distribution", "Team expansion"] },
  ];

  const getProgress = (now: number | string, target: number | string): number => {
    const nowNum = typeof now === 'string' ? parseFloat(now.replace(/[₹K,]/g, '')) || 0 : now;
    const targetNum = typeof target === 'string' ? parseFloat(target.replace(/[₹K,]/g, '')) || 1 : target;
    return Math.min(100, Math.round((nowNum / targetNum) * 100));
  };

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    blue: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
    purple: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
    pink: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/30" },
    cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
    green: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    orange: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
    indigo: { bg: "bg-indigo-500/20", text: "text-indigo-400", border: "border-indigo-500/30" },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"><RocketLaunchIcon className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-white">Goals & Roadmap</h1><p className="text-white/60">Track your journey to ₹1L+ MRR</p></div>
        </div>
      </div>

      <div className="glass-card p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-6 h-6 text-yellow-400" /></div>
          <div><h2 className="text-lg font-bold text-yellow-400 mb-2">The One Rule</h2><p className="text-white/80 leading-relaxed"><span className="font-semibold text-white">Works for Anshuman → Document it → Sell it → Then scale it.</span><br />Ship stage 1 before planning stage 3. Every workflow built = one video. Every video = one step toward YPP + revenue.</p></div>
        </div>
      </div>

      <div className="animate-fade-in stagger-1">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><ChartBarIcon className="w-5 h-5 text-indigo-400" />Progress Tracker</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => {
            const c = colorClasses[m.color]; const p = getProgress(m.now, m.day30); const Icon = m.icon;
            return (
              <div key={m.name} className={`glass-card p-5 ${c.border} animate-fade-in`} style={{animationDelay:`${i*0.05}s`}}>
                <div className="flex items-center gap-3 mb-3"><div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${c.text}`} /></div><p className="text-sm text-white/60 truncate">{m.name}</p></div>
                <div className="space-y-2">
                  <div className="flex items-end justify-between"><span className={`text-2xl font-bold ${c.text}`}>{m.now}</span><span className="text-xs text-white/40">Now</span></div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className={`h-full ${c.bg.replace('/20','/60')} rounded-full`} style={{width:`${p}%`}}/></div>
                  <div className="flex justify-between text-xs"><span className="text-white/50">30d: <span className="text-white/70">{m.day30}</span></span><span className="text-white/50">90d: <span className="text-white/70">{m.day90}</span></span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="animate-fade-in stagger-2">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><ArrowTrendingUpIcon className="w-5 h-5 text-purple-400" />Growth Roadmap</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stages.map((s, i) => {
            const c = colorClasses[s.color];
            return (
              <div key={s.title} className={`glass-card p-6 ${c.border} animate-fade-in`} style={{animationDelay:`${i*0.1}s`}}>
                <div className="flex items-center gap-3 mb-4"><div className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center font-bold ${c.text}`}>{i+1}</div><div><h3 className="font-semibold text-white">{s.title}</h3><p className="text-xs text-white/50">{s.timeline}</p></div></div>
                <div className={`px-3 py-2 rounded-lg ${c.bg} mb-4`}><p className={`text-sm font-semibold ${c.text}`}>Target: {s.target}</p></div>
                <ul className="space-y-2">{s.items.map((item, j) => <li key={j} className="flex items-start gap-2 text-sm text-white/70"><CheckCircleIcon className={`w-4 h-4 ${c.text} mt-0.5 flex-shrink-0`} />{item}</li>)}</ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-6 animate-fade-in stagger-3">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FireIcon className="w-5 h-5 text-orange-400" />YPP Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><div className="flex justify-between mb-2"><span className="text-sm text-white/70">Subscribers</span><span className="text-sm font-medium text-white">{youtubeData?.subscribers || 359} / 500</span></div><div className="h-4 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full" style={{width:`${((youtubeData?.subscribers||359)/500)*100}%`}}/></div><p className="text-xs text-white/50 mt-1">{500-(youtubeData?.subscribers||359)} more needed for YPP</p></div>
          <div><div className="flex justify-between mb-2"><span className="text-sm text-white/70">Watch Hours</span><span className="text-sm font-medium text-white">430 / 3,000</span></div><div className="h-4 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{width:`${(430/3000)*100}%`}}/></div><p className="text-xs text-white/50 mt-1">2,570 more hours needed for YPP</p></div>
        </div>
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"><p className="text-sm text-white/80"><span className="font-semibold text-indigo-400">Strategy:</span> Focus on 8 long-form videos (10-15 min each) + 16 shorts in the next 30 days.</p></div>
      </div>

      <div className="glass-card p-6 animate-fade-in stagger-4">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CurrencyRupeeIcon className="w-5 h-5 text-green-400" />Revenue Roadmap (Pre-AdSense)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5"><p className="text-xs text-white/50 mb-1">30 Days</p><p className="text-2xl font-bold text-green-400">₹5,000</p><ul className="mt-2 space-y-1 text-xs text-white/60"><li>• N8N templates: ₹2,000</li><li>• Consulting: ₹2,000</li><li>• Telegram tips: ₹1,000</li></ul></div>
          <div className="p-4 rounded-xl bg-white/5"><p className="text-xs text-white/50 mb-1">90 Days</p><p className="text-2xl font-bold text-green-400">₹30,000</p><ul className="mt-2 space-y-1 text-xs text-white/60"><li>• Template bundles: ₹10,000</li><li>• Affiliate: ₹8,000</li><li>• Consulting: ₹7,000</li><li>• Community: ₹5,000</li></ul></div>
          <div className="p-4 rounded-xl bg-white/5"><p className="text-xs text-white/50 mb-1">6 Months</p><p className="text-2xl font-bold text-green-400">₹50,000+</p><ul className="mt-2 space-y-1 text-xs text-white/60"><li>• AdSense: ₹15,000</li><li>• Products: ₹20,000</li><li>• Brand deals: ₹10,000</li><li>• Community: ₹5,000</li></ul></div>
        </div>
      </div>
    </div>
  );
}
