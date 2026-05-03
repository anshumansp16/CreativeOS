"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, BellIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const [today, setToday] = useState("");

  // Set date only on client to avoid hydration mismatch
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    }));
  }, []);

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: "260px",
      right: 0,
      height: "64px",
      background: "rgba(13,13,32,0.9)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      zIndex: 40,
    }}>
      {/* Search */}
      <div style={{ position: "relative" }}>
        <MagnifyingGlassIcon style={{
          width: "16px", height: "16px", color: "#64748b",
          position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)"
        }} />
        <input
          type="text"
          placeholder="Search anything..."
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            paddingLeft: "40px", paddingRight: "16px",
            paddingTop: "9px", paddingBottom: "9px",
            width: "280px",
            fontSize: "13px",
            color: "white",
            outline: "none",
          }}
        />
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {today && <span style={{ fontSize: "13px", color: "#64748b" }}>{today}</span>}

        <button style={{
          position: "relative", padding: "9px",
          borderRadius: "12px", background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <BellIcon style={{ width: "18px", height: "18px", color: "#94a3b8" }} />
          <span style={{
            position: "absolute", top: "6px", right: "6px",
            width: "8px", height: "8px", borderRadius: "50%",
            background: "#6366f1", border: "2px solid #0d0d20"
          }} />
        </button>

        <button style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "9px 20px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", borderRadius: "12px",
          color: "white", fontSize: "13px", fontWeight: 600,
          cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.4)"
        }}>
          <SparklesIcon style={{ width: "15px", height: "15px" }} />
          New Content
        </button>
      </div>
    </header>
  );
}
