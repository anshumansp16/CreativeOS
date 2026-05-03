"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useVideoTray, VideoTrayItem } from "@/context/VideoTrayContext";
import { saveToLibrary } from "@/hooks/useContentLibrary";

type GenerateType = "script" | "description" | "linkedin" | "twitter" | "hashtags";
type SortKey = "added" | "probability" | "demand" | "competition" | "views";
type FilterKey = "all" | "High" | "Medium" | "Low";

const GENERATE_OPTIONS: { type: GenerateType; label: string; emoji: string; color: string }[] = [
  { type: "script",      label: "Script Outline",  emoji: "📝", color: "#6366f1" },
  { type: "description", label: "YT Description",  emoji: "💬", color: "#10b981" },
  { type: "linkedin",    label: "LinkedIn Post",    emoji: "💼", color: "#0a66c2" },
  { type: "twitter",     label: "Twitter Thread",   emoji: "🐦", color: "#1da1f2" },
  { type: "hashtags",    label: "Hashtags",         emoji: "#️⃣", color: "#ef4444" },
];

const demandRank = { High: 3, Medium: 2, Low: 1 } as Record<string, number>;
const compRank   = { Low: 3, Medium: 2, High: 1 } as Record<string, number>;

export default function VideoTrayPage() {
  const { tray, removeFromTray, clearTray } = useVideoTray();
  const router = useRouter();
  const [generating, setGenerating] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { type: GenerateType; content: string }>>({});

  // Sort & filter state
  const [sortBy,   setSortBy]   = useState<SortKey>("added");
  const [sortDir,  setSortDir]  = useState<"desc" | "asc">("desc");
  const [filterDemand,  setFilterDemand]  = useState<FilterKey>("all");
  const [filterComp,    setFilterComp]    = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    let list = [...tray];
    // filter
    if (filterDemand !== "all") list = list.filter(i => i.searchDemand === filterDemand);
    if (filterComp   !== "all") list = list.filter(i => i.competition  === filterComp);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q));
    }
    // sort
    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === "added")       diff = (a.addedAt ?? 0) - (b.addedAt ?? 0);
      if (sortBy === "probability") diff = (a.successProbability ?? 0) - (b.successProbability ?? 0);
      if (sortBy === "demand")      diff = (demandRank[a.searchDemand ?? ""] ?? 0) - (demandRank[b.searchDemand ?? ""] ?? 0);
      if (sortBy === "competition") diff = (compRank[a.competition ?? ""] ?? 0) - (compRank[b.competition ?? ""] ?? 0);
      if (sortBy === "views") {
        const parse = (v?: string) => parseInt((v || "0").replace(/[^0-9]/g, "")) || 0;
        diff = parse(a.estimatedViews) - parse(b.estimatedViews);
      }
      return sortDir === "desc" ? -diff : diff;
    });
    return list;
  }, [tray, sortBy, sortDir, filterDemand, filterComp, search]);

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(key); setSortDir("desc"); }
  }

  const handleGenerate = async (item: VideoTrayItem, type: GenerateType) => {
    const key = `${item.id}-${type}`;
    setGenerating(key);
    try {
      const endpoint = type === "script" ? "/api/scripts" : type === "description" ? "/api/descriptions" : "/api/generate";
      const body = type === "script" ? { topic: item.title, style: "educational" }
        : type === "description" ? { topic: item.title }
        : { topic: item.title, type };
      const res  = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      const content = data.script || data.description || data.content || data.error || "Error";
      setResults(prev => ({ ...prev, [key]: { type, content } }));
      // Auto-save to Library
      const libType = type === "script" ? "script" : type === "description" ? "description" : type;
      if (!data.error) saveToLibrary(libType as Parameters<typeof saveToLibrary>[0], item.title, content);
    } catch (e) {
      setResults(prev => ({ ...prev, [key]: { type, content: "Error: " + String(e) } }));
    } finally {
      setGenerating(null);
    }
  };

  const handleNavigate = (item: VideoTrayItem, type: GenerateType) => {
    const topic  = encodeURIComponent(item.title);
    const routes: Record<GenerateType, string> = {
      script: `/scripts?topic=${topic}`, description: `/descriptions?topic=${topic}`,
      linkedin: `/generate?type=linkedin&topic=${topic}`, twitter: `/generate?type=twitter&topic=${topic}`,
      hashtags: `/generate?type=hashtags&topic=${topic}`,
    };
    router.push(routes[type]);
  };

  if (tray.length === 0) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#f8fafc", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span>🎬</span> Video Tray
        </h1>
        <p style={{ color: "#94a3b8", margin: "0 0 48px", fontSize: "14px" }}>Manage videos you&apos;re working on</p>
        <div style={{ textAlign: "center", padding: "80px 40px", background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "20px" }}>
          <span style={{ fontSize: "64px", display: "block", marginBottom: "16px" }}>🎬</span>
          <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: "20px", margin: "0 0 8px" }}>Your tray is empty</h3>
          <p style={{ color: "#94a3b8", margin: "0 0 24px" }}>Go to the Idea Generator and click &ldquo;Add to Tray&rdquo; on any idea you want to work on.</p>
          <button onClick={() => router.push("/ideas")}
            style={{ padding: "12px 28px", background: "linear-gradient(135deg, #8b5cf6, #6366f1)", border: "none", borderRadius: "12px", color: "#fff", fontWeight: 600, fontSize: "15px", cursor: "pointer" }}>
            💡 Open Idea Generator
          </button>
        </div>
      </div>
    );
  }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} style={{
      padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
      background: sortBy === k ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${sortBy === k ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
      color: sortBy === k ? "#c4b5fd" : "#64748b",
    }}>
      {label} {sortBy === k ? (sortDir === "desc" ? "↓" : "↑") : ""}
    </button>
  );

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#f8fafc", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span>🎬</span> Video Tray
            <span style={{ background: "rgba(139,92,246,0.25)", color: "#c4b5fd", borderRadius: "20px", padding: "3px 12px", fontSize: "16px" }}>{tray.length}</span>
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>Generate content for each video</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => router.push("/ideas")} style={{ padding: "9px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>
            + Add Ideas
          </button>
          <button onClick={() => { if (confirm("Clear all?")) clearTray(); }} style={{ padding: "9px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", color: "#fca5a5", fontSize: "13px", cursor: "pointer" }}>
            🗑 Clear All
          </button>
        </div>
      </div>

      {/* Controls bar */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "14px 18px", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search tray..."
          style={{ flex: 1, minWidth: 160, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "7px 12px", color: "#f1f5f9", fontSize: "13px", outline: "none" }} />

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ color: "#475569", fontSize: "11px", fontWeight: 600 }}>SORT</span>
          <SortBtn k="added" label="Recent" />
          <SortBtn k="probability" label="Success %" />
          <SortBtn k="demand" label="Demand" />
          <SortBtn k="competition" label="Competition" />
          <SortBtn k="views" label="Est. Views" />
        </div>

        {/* Filter demand */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#475569", fontSize: "11px", fontWeight: 600 }}>DEMAND</span>
          {(["all","High","Medium","Low"] as FilterKey[]).map(v => (
            <button key={v} onClick={() => setFilterDemand(v)} style={{
              padding: "5px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
              background: filterDemand === v ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${filterDemand === v ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)"}`,
              color: filterDemand === v ? "#34d399" : "#64748b",
            }}>{v === "all" ? "All" : v}</button>
          ))}
        </div>

        {/* Filter competition */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "#475569", fontSize: "11px", fontWeight: 600 }}>COMP</span>
          {(["all","Low","Medium","High"] as FilterKey[]).map(v => (
            <button key={v} onClick={() => setFilterComp(v)} style={{
              padding: "5px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer",
              background: filterComp === v ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${filterComp === v ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
              color: filterComp === v ? "#818cf8" : "#64748b",
            }}>{v === "all" ? "All" : v}</button>
          ))}
        </div>

        {/* Result count */}
        {(filterDemand !== "all" || filterComp !== "all" || search) && (
          <span style={{ color: "#64748b", fontSize: "12px", marginLeft: "auto" }}>
            {sorted.length} of {tray.length} shown
          </span>
        )}
      </div>

      {/* No results */}
      {sorted.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          No items match the current filter.
        </div>
      )}

      {/* Videos */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {sorted.map((item) => (
          <VideoCard key={item.id} item={item} generating={generating} results={results}
            onGenerate={handleGenerate} onNavigate={handleNavigate} onRemove={removeFromTray} />
        ))}
      </div>
    </div>
  );
}

function VideoCard({
  item, generating, results, onGenerate, onNavigate, onRemove
}: {
  item: VideoTrayItem;
  generating: string | null;
  results: Record<string, { type: GenerateType; content: string }>;
  onGenerate: (item: VideoTrayItem, type: GenerateType) => Promise<void>;
  onNavigate: (item: VideoTrayItem, type: GenerateType) => void;
  onRemove: (id: string) => void;
}) {
  const [activeResult, setActiveResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const demandColor = item.searchDemand === "High" ? "#10b981" : item.searchDemand === "Medium" ? "#f59e0b" : "#6b7280";
  const compColor = item.competition === "Low" ? "#10b981" : item.competition === "Medium" ? "#f59e0b" : "#ef4444";
  const probColor = (item.successProbability || 0) >= 75 ? "#10b981" : (item.successProbability || 0) >= 55 ? "#f59e0b" : "#ef4444";

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "18px",
      overflow: "hidden",
    }}>
      {/* Video header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px", margin: "0 0 10px", lineHeight: 1.4 }}>
              {item.title}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {item.searchDemand && (
                <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: `${demandColor}20`, color: demandColor, border: `1px solid ${demandColor}40` }}>
                  📈 {item.searchDemand} Demand
                </span>
              )}
              {item.competition && (
                <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: `${compColor}20`, color: compColor, border: `1px solid ${compColor}40` }}>
                  ⚔️ {item.competition} Competition
                </span>
              )}
              {item.successProbability && (
                <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: `${probColor}20`, color: probColor, border: `1px solid ${probColor}40` }}>
                  🎯 {item.successProbability}% success
                </span>
              )}
              {item.estimatedViews && (
                <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "11px", background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
                  👁️ {item.estimatedViews}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "20px", padding: "4px", flexShrink: 0, lineHeight: 1 }}
            title="Remove from tray"
          >
            ×
          </button>
        </div>
      </div>

      {/* Generate buttons */}
      <div style={{ padding: "16px 24px", display: "flex", flexWrap: "wrap", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        {GENERATE_OPTIONS.map((opt) => {
          const key = `${item.id}-${opt.type}`;
          const isGenerating = generating === key;
          const hasResult = !!results[key];
          return (
            <button
              key={opt.type}
              onClick={() => {
                if (hasResult) {
                  setActiveResult(activeResult === key ? null : key);
                } else {
                  onGenerate(item, opt.type);
                  setActiveResult(key);
                }
              }}
              disabled={isGenerating}
              style={{
                padding: "8px 16px",
                background: hasResult
                  ? `${opt.color}25`
                  : activeResult === key
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${hasResult ? opt.color + "50" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "10px",
                color: hasResult ? opt.color : "#94a3b8",
                fontSize: "13px",
                fontWeight: hasResult ? 600 : 400,
                cursor: isGenerating ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s",
              }}
            >
              {isGenerating ? (
                <>
                  <span style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  Generating...
                </>
              ) : (
                <>{opt.emoji} {opt.label} {hasResult ? "✓" : ""}</>
              )}
            </button>
          );
        })}
        <button
          onClick={() => onNavigate(item, "script")}
          style={{
            padding: "8px 16px",
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.08)",
            borderRadius: "10px",
            color: "#64748b",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          ↗ Open full page
        </button>
      </div>

      {/* Result panel */}
      {activeResult && results[activeResult] && (
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
              {GENERATE_OPTIONS.find(o => `${item.id}-${o.type}` === activeResult)?.label}
            </span>
            <button
              onClick={() => handleCopy(activeResult, results[activeResult].content)}
              style={{
                padding: "5px 12px",
                background: copied === activeResult ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${copied === activeResult ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "8px",
                color: copied === activeResult ? "#10b981" : "#94a3b8",
                fontSize: "11px", fontWeight: 600, cursor: "pointer",
              }}
            >
              {copied === activeResult ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
          <pre style={{
            whiteSpace: "pre-wrap",
            fontFamily: "'Geist Mono', monospace",
            fontSize: "12.5px",
            lineHeight: "1.65",
            color: "#e2e8f0",
            margin: 0,
            background: "rgba(0,0,0,0.2)",
            padding: "16px",
            borderRadius: "10px",
            maxHeight: "300px",
            overflowY: "auto",
          }}>
            {results[activeResult].content}
          </pre>
        </div>
      )}
    </div>
  );
}
