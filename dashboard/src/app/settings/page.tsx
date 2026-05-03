"use client";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center"><Cog6ToothIcon className="w-6 h-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Settings</h1><p className="text-white/60">Configure your CreatorOS</p></div>
      </div>
      <div className="glass-card p-6 animate-fade-in stagger-1">
        <h2 className="text-lg font-semibold text-white mb-4">API Configuration</h2>
        <div className="space-y-4">
          <div><label className="block text-sm text-white/70 mb-2">Claude API Key</label><input type="password" placeholder="sk-ant-..." className="glass-input w-full px-4 py-3" /></div>
          <div><label className="block text-sm text-white/70 mb-2">YouTube API Key</label><input type="password" placeholder="AIza..." className="glass-input w-full px-4 py-3" /></div>
          <div><label className="block text-sm text-white/70 mb-2">Notion API Key</label><input type="password" placeholder="ntn_..." className="glass-input w-full px-4 py-3" /></div>
        </div>
      </div>
      <div className="glass-card p-6 animate-fade-in stagger-2">
        <h2 className="text-lg font-semibold text-white mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-white">Default Language</p><p className="text-sm text-white/50">For script generation</p></div><select className="glass-input px-4 py-2"><option value="hinglish">Hinglish</option><option value="hindi">Hindi</option><option value="english">English</option></select></div>
          <div className="flex items-center justify-between"><div><p className="text-white">Default Video Duration</p><p className="text-sm text-white/50">Target length for scripts</p></div><select className="glass-input px-4 py-2"><option value="short">Short (5-8 min)</option><option value="medium">Medium (10-15 min)</option><option value="long">Long (20+ min)</option></select></div>
        </div>
      </div>
    </div>
  );
}
