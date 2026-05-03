"use client";

import { MagnifyingGlassIcon, BellIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <header className="fixed top-0 left-64 right-0 h-16 glass border-b border-white/10 px-6 flex items-center justify-between z-40">
      <div className="relative">
        <MagnifyingGlassIcon className="w-5 h-5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Search..." className="glass-input pl-10 pr-4 py-2 w-80 text-sm" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/50">{today}</span>
        <button className="relative p-2 rounded-xl hover:bg-white/5">
          <BellIcon className="w-5 h-5 text-white/60" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>
        <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <PlusIcon className="w-4 h-4" /> New Content
        </button>
      </div>
    </header>
  );
}
