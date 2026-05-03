"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, LightBulbIcon, DocumentTextIcon, ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon, ChartBarIcon, FolderIcon, PlayCircleIcon, RocketLaunchIcon
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Goals & Roadmap", href: "/goals", icon: RocketLaunchIcon },
  { name: "YouTube Studio", href: "/youtube", icon: PlayCircleIcon },
  { name: "Idea Generator", href: "/ideas", icon: LightBulbIcon },
  { name: "Script Generator", href: "/scripts", icon: DocumentTextIcon },
  { name: "Description Generator", href: "/descriptions", icon: ChatBubbleBottomCenterTextIcon },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  { name: "Library", href: "/library", icon: FolderIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 p-4 flex flex-col z-50">
      <div className="flex items-center gap-3 px-3 py-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <div>
          <h1 className="font-bold text-white text-lg">CreatorOS</h1>
          <p className="text-xs text-white/50">AI Content Studio</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-white/10">
        <p className="px-3 text-xs text-white/40">© 2026 CreatorOS</p>
      </div>
    </aside>
  );
}
