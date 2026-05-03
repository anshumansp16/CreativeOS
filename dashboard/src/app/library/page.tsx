"use client";
import { FolderIcon } from "@heroicons/react/24/outline";

export default function LibraryPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"><FolderIcon className="w-6 h-6 text-white" /></div>
        <div><h1 className="text-2xl font-bold text-white">Content Library</h1><p className="text-white/60">All your generated content in one place</p></div>
      </div>
      <div className="glass-card p-8 text-center animate-fade-in stagger-1"><FolderIcon className="w-16 h-16 text-white/20 mx-auto mb-4" /><h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2><p className="text-white/60 max-w-md mx-auto">Your content library will store all generated scripts, ideas, and more.</p></div>
    </div>
  );
}
