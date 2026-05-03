"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useVideoTray } from "@/context/VideoTrayContext";

const mainNavigation = [
  { name: "Dashboard", href: "/", emoji: "🏠" },
  { name: "Goals & Roadmap", href: "/goals", emoji: "🚀" },
  { name: "YouTube Studio", href: "/youtube", emoji: "📺" },
  { name: "Insights", href: "/insights", emoji: "📈" },
  { name: "Idea Generator", href: "/ideas", emoji: "💡" },
  { name: "Video Tray", href: "/tray", emoji: "🎬" },
  { name: "Script Generator", href: "/scripts", emoji: "📝" },
  { name: "Description Gen", href: "/descriptions", emoji: "💬" },
  { name: "Social Content", href: "/generate", emoji: "🚀" },
];

const secondaryNavigation = [
  { name: "Analytics", href: "/analytics", emoji: "📊" },
  { name: "Library", href: "/library", emoji: "📁" },
  { name: "Settings", href: "/settings", emoji: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { tray } = useVideoTray();

  const NavItem = ({ item }: { item: typeof mainNavigation[0] }) => {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    return (
      <Link
        href={item.href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 14px",
          borderRadius: "12px",
          textDecoration: "none",
          transition: "all 0.2s ease",
          background: isActive ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))" : "transparent",
          border: isActive ? "1px solid rgba(99,102,241,0.35)" : "1px solid transparent",
          color: isActive ? "#e0e7ff" : "#94a3b8",
        }}
      >
        <span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>{item.emoji}</span>
        <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 500, whiteSpace: "nowrap", flex: 1 }}>{item.name}</span>
        {isActive && (
          <span style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#818cf8", flexShrink: 0, boxShadow: "0 0 6px #818cf8"
          }} />
        )}
      </Link>
    );
  };

  return (
    <aside style={{
      position: "fixed",
      left: 0, top: 0,
      width: "260px",
      height: "100vh",
      background: "linear-gradient(180deg, #131329 0%, #0d0d20 100%)",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      padding: "20px 12px",
      display: "flex",
      flexDirection: "column",
      zIndex: 50,
      overflowY: "auto",
      boxSizing: "border-box",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 10px", marginBottom: "24px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "14px", flexShrink: 0,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(99,102,241,0.4)"
        }}>
          <span style={{ color: "white", fontWeight: 800, fontSize: "20px" }}>C</span>
        </div>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: "16px", lineHeight: 1.2 }}>CreatorOS</div>
          <div style={{ color: "#818cf8", fontSize: "11px", fontWeight: 500 }}>AI Content Studio</div>
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        <p style={{ padding: "0 10px", fontSize: "10px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Main</p>
        {mainNavigation.map((item) => <NavItem key={item.name} item={item} />)}

        <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "14px 8px" }} />

        <p style={{ padding: "0 10px", fontSize: "10px", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>More</p>
        {secondaryNavigation.map((item) => <NavItem key={item.name} item={item} />)}
      </nav>

      {/* Video Tray indicator */}
      {tray.length > 0 && (
        <Link href="/tray" style={{ textDecoration: "none" }}>
          <div style={{
            margin: "14px 0 0",
            padding: "12px 14px",
            background: "rgba(139,92,246,0.1)",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: "12px",
            cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "16px" }}>🎬</span>
              <span style={{ color: "#c4b5fd", fontSize: "12px", fontWeight: 600 }}>Video Tray</span>
              <span style={{ background: "rgba(139,92,246,0.4)", color: "#e9d5ff", borderRadius: "20px", padding: "1px 7px", fontSize: "10px", fontWeight: 700 }}>
                {tray.length}
              </span>
            </div>
            {tray.slice(0, 2).map((item) => (
              <p key={item.id} style={{ color: "#94a3b8", fontSize: "11px", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                · {item.title}
              </p>
            ))}
            {tray.length > 2 && (
              <p style={{ color: "#6b7280", fontSize: "10px", margin: "4px 0 0" }}>+{tray.length - 2} more · click to manage</p>
            )}
          </div>
        </Link>
      )}

      {/* Footer */}
      <div style={{ paddingTop: "16px", marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 14px", borderRadius: "12px",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)"
        }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 500 }}>All systems ready</span>
        </div>
        <p style={{ padding: "8px 10px 0", fontSize: "10px", color: "#334155" }}>v1.0.0 · Made with ❤️</p>
      </div>
    </aside>
  );
}
