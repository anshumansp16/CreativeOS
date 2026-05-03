"use client";

import { useState, useMemo } from "react";
import { useContentLibrary, LibraryItem, LibraryItemType } from "@/hooks/useContentLibrary";

const TYPE_META: Record<LibraryItemType, { label: string; emoji: string; color: string }> = {
  idea:        { label: "Idea",        emoji: "💡", color: "#f59e0b" },
  script:      { label: "Script",      emoji: "📝", color: "#8b5cf6" },
  description: { label: "Description", emoji: "💬", color: "#06b6d4" },
  linkedin:    { label: "LinkedIn",    emoji: "💼", color: "#3b82f6" },
  twitter:     { label: "Twitter",     emoji: "🐦", color: "#22d3ee" },
  hashtags:    { label: "Hashtags",    emoji: "#️⃣",  color: "#10b981" },
};

const ALL_TYPES: LibraryItemType[] = [
  "idea", "script", "description", "linkedin", "twitter", "hashtags",
];

function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function exportJSON(items: LibraryItem[]) {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `creatoros_library_${Date.now()}.json`;
  a.click();
}

export default function LibraryPage() {
  const { items, remove, clear } = useContentLibrary();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<LibraryItemType | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const visible = useMemo(() => {
    let list = items;
    if (filterType !== "all") list = list.filter((i) => i.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) => i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, filterType, search]);

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const t of ALL_TYPES) c[t] = items.filter((i) => i.type === t).length;
    return c;
  }, [items]);

  function handleCopy(id: string, content: string) {
    copyText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📁</span>
          Content Library
        </h1>
        <p style={{ color: "#64748b", marginTop: 6, fontSize: 14 }}>
          Everything you generate is auto-saved here. {items.length} items saved.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {ALL_TYPES.map((t) => (
          <div key={t} style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${counts[t] ? TYPE_META[t].color + "44" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{TYPE_META[t].emoji}</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{TYPE_META[t].label}</span>
            <span style={{
              background: TYPE_META[t].color + "33",
              color: TYPE_META[t].color,
              borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700,
            }}>{counts[t] || 0}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search titles, content..."
          style={{
            flex: 1, minWidth: 200, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
            padding: "10px 14px", color: "#f1f5f9", fontSize: 14, outline: "none",
          }}
        />
        {/* Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as LibraryItemType | "all")}
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "10px 14px", color: "#f1f5f9", fontSize: 14, outline: "none",
          }}
        >
          <option value="all">All Types ({counts.all})</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_META[t].emoji} {TYPE_META[t].label} ({counts[t]})</option>
          ))}
        </select>
        {/* Export */}
        <button
          onClick={() => exportJSON(items)}
          style={{
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: 10, padding: "10px 16px", color: "#22c55e", fontSize: 13,
            fontWeight: 600, cursor: "pointer",
          }}
        >
          ⬇ Export JSON
        </button>
        {/* Clear */}
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10, padding: "10px 16px", color: "#f87171", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}
          >🗑 Clear All</button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { clear(); setConfirmClear(false); }} style={{
              background: "#ef4444", border: "none", borderRadius: 10, padding: "10px 16px",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>Confirm Clear</button>
            <button onClick={() => setConfirmClear(false)} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "10px 16px", color: "#94a3b8", fontSize: 13, cursor: "pointer",
            }}>Cancel</button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div style={{
          textAlign: "center", padding: "64px 32px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Library is empty</h3>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Generate scripts, descriptions, ideas, or social posts — they auto-save here.
          </p>
        </div>
      )}

      {visible.length === 0 && items.length > 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          No results for "{search}" {filterType !== "all" ? `in ${filterType}` : ""}
        </div>
      )}

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map((item) => {
          const meta = TYPE_META[item.type];
          const isExpanded = expanded === item.id;
          const preview = item.content.slice(0, 160);
          return (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${isExpanded ? meta.color + "44" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 12,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
            >
              {/* Row header */}
              <div
                onClick={() => setExpanded(isExpanded ? null : item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", cursor: "pointer",
                }}
              >
                <span style={{
                  fontSize: 18, width: 32, height: 32,
                  background: meta.color + "20", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>{meta.emoji}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{
                      background: meta.color + "25", color: meta.color,
                      borderRadius: 6, padding: "1px 8px", fontSize: 10, fontWeight: 700,
                    }}>{meta.label.toUpperCase()}</span>
                    <span style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </span>
                  </div>
                  <p style={{
                    color: "#64748b", fontSize: 12, margin: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {isExpanded ? "" : preview + (item.content.length > 160 ? "…" : "")}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ color: "#475569", fontSize: 11 }}>{fmt(item.createdAt)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(item.id, item.content); }}
                    style={{
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6, padding: "4px 10px", color: copied === item.id ? "#22c55e" : "#94a3b8",
                      fontSize: 11, cursor: "pointer", fontWeight: 600,
                    }}
                  >{copied === item.id ? "✓ Copied" : "Copy"}</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                    style={{
                      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                      borderRadius: 6, padding: "4px 10px", color: "#f87171",
                      fontSize: 11, cursor: "pointer",
                    }}
                  >✕</button>
                  <span style={{ color: "#475569", fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{
                    background: "rgba(0,0,0,0.3)", borderRadius: 8,
                    padding: "14px 16px", fontSize: 13, color: "#cbd5e1",
                    lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word",
                    maxHeight: 500, overflowY: "auto",
                  }}>
                    {item.content}
                  </div>
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.entries(item.metadata).map(([k, v]) => (
                        <span key={k} style={{
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#64748b",
                        }}>
                          <span style={{ color: "#94a3b8" }}>{k}: </span>
                          {Array.isArray(v) ? v.join(", ") : String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => handleCopy(item.id, item.content)}
                    style={{
                      marginTop: 10,
                      background: copied === item.id ? "rgba(34,197,94,0.15)" : meta.color + "20",
                      border: `1px solid ${copied === item.id ? "#22c55e55" : meta.color + "44"}`,
                      borderRadius: 8, padding: "8px 16px",
                      color: copied === item.id ? "#22c55e" : meta.color,
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}
                  >{copied === item.id ? "✓ Copied to clipboard" : `Copy ${meta.label}`}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
