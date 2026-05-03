"use client";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"><ChartBarIcon className="w-6 h-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Analytics</h1><p className="text-white/60">Track your content performance</p></div>
      </div>
      <div className="glass-card p-8 text-center animate-fade-in stagger-1"><ChartBarIcon className="w-16 h-16 text-white/20 mx-auto mb-4" /><h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2><p className="text-white/60 max-w-md mx-auto">Advanced analytics dashboard with content performance tracking.</p></div>
    </div>
  );
}
