"use client";

import { useState, useEffect } from "react";
import { useVideoTray } from "@/context/VideoTrayContext";
import { saveToLibrary } from "@/hooks/useContentLibrary";

interface IdeaResult {
  title: string;
  hook: string;
  category?: string;
  searchDemand: "High" | "Medium" | "Low";
  competition: "Low" | "Medium" | "High";
  successProbability: number;
  estimatedViews: string;
  targetAudience: string;
  whyNow: string;
  seoKeywords: string[];
  trendScore: number;
  source?: "trend" | "calendar" | "creative" | "launch";
}

const demandColor: Record<string, string> = {
  High: "#10b981",
  Medium: "#f59e0b",
  Low: "#6b7280",
};
const competitionColor: Record<string, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#ef4444",
};

function IdeasPageInner() {
  const [ideas, setIdeas] = useState<IdeaResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { addToTray, removeFromTrayByTitle, isInTray } = useVideoTray();

  const fetchIdeas = async (force = false) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ideas", {
        method: force ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        ...(force ? { body: JSON.stringify({ forceRefresh: true }) } : {}),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setIdeas(data.ideas || []);
      setCachedAt(data.generatedAt);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const getProbabilityColor = (p: number) =>
    p >= 75 ? "#10b981" : p >= 55 ? "#f59e0b" : "#ef4444";

  const handleTray = (idea: IdeaResult) => {
    if (isInTray(idea.title)) {
      removeFromTrayByTitle(idea.title);
    } else {
      addToTray({
        title: idea.title,
        searchDemand: idea.searchDemand,
        competition: idea.competition,
        successProbability: idea.successProbability,
        estimatedViews: idea.estimatedViews,
        seoKeywords: idea.seoKeywords,
      });
      // Auto-save the idea to Library
      const content = [
        `Hook: ${idea.hook}`,
        `Category: ${idea.category || ""}`,
        `Target Audience: ${idea.targetAudience}`,
        `Why Now: ${idea.whyNow}`,
        `Search Demand: ${idea.searchDemand} | Competition: ${idea.competition}`,
        `Success Probability: ${idea.successProbability}%`,
        `Estimated Views: ${idea.estimatedViews}`,
        `SEO Keywords: ${idea.seoKeywords?.join(", ")}`,
      ].filter(Boolean).join("\n");
      saveToLibrary("idea", idea.title, content, {
        successProbability: idea.successProbability,
        estimatedViews: idea.estimatedViews,
        searchDemand: idea.searchDemand,
        competition: idea.competition,
        seoKeywords: idea.seoKeywords,
      });
    }
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#f8fafc", margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "32px" }}>💡</span>
            Idea Generator
          </h1>
          <p style={{ color: "#94a3b8", margin: "8px 0 0", fontSize: "15px" }}>
            AI-researched ideas from live HN, GitHub, Product Hunt &amp; YouTube trends
          </p>
          {cachedAt && (
            <p style={{ color: "#6b7280", fontSize: "12px", margin: "4px 0 0" }}>
              Last generated: {new Date(cachedAt).toLocaleString()} · refreshes every 6h
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => fetchIdeas(true)}
            disabled={isLoading}
            style={{
              padding: "10px 20px",
              background: isLoading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #8b5cf6, #6366f1)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {isLoading ? (
              <>
                <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                Researching...
              </>
            ) : (
              "🔄 Refresh Ideas"
            )}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.1))",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: "14px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <span style={{ fontSize: "24px" }}>🎯</span>
        <div>
          <p style={{ color: "#c4b5fd", margin: 0, fontWeight: 600, fontSize: "14px" }}>
            Live intelligence from 4 sources
          </p>
          <p style={{ color: "#94a3b8", margin: "2px 0 0", fontSize: "13px" }}>
            Pulls real-time data from <strong style={{ color: "#f472b6" }}>Hacker News</strong> trending, <strong style={{ color: "#34d399" }}>GitHub</strong> new starred repos, <strong style={{ color: "#f59e0b" }}>Product Hunt</strong> recent launches, and <strong style={{ color: "#ef4444" }}>YouTube</strong> India trends — then Claude finds content gaps and ranks by success probability. Refreshes every 6h.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#fca5a5" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && ideas.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: "48px", height: "48px", border: "3px solid rgba(139,92,246,0.3)", borderTop: "3px solid #8b5cf6", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#94a3b8", fontSize: "16px" }}>Scanning Hacker News, GitHub launches, Product Hunt &amp; YouTube trends...</p>
          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "8px" }}>Claude is finding content gaps with high demand &amp; low competition</p>
        </div>
      )}

      {/* Ideas list */}
      {ideas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {ideas.map((idea, i) => {
            const inTray = isInTray(idea.title);
            const expanded = expandedId === i;
            return (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${inTray ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "16px",
                  padding: "20px 24px",
                  transition: "border-color 0.2s",
                  cursor: "pointer",
                }}
                onClick={() => setExpandedId(expanded ? null : i)}
              >
                {/* Row 1: Title + Probability + Tray */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "12px" }}>
                  <div style={{
                    minWidth: "36px", height: "36px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "15px",
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: "16px", margin: "0 0 8px" }}>
                      {idea.title}
                    </h3>
                    {/* Badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                      {idea.category && (
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.3)" }}>
                          {idea.category}
                        </span>
                      )}
                      {idea.source === "launch" && (
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)" }}>
                          🚀 New Launch
                        </span>
                      )}
                      {idea.source === "calendar" && (
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" }}>
                          📅 Calendar
                        </span>
                      )}
                      {idea.source === "creative" && (
                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "rgba(236,72,153,0.15)", color: "#f472b6", border: "1px solid rgba(236,72,153,0.3)" }}>
                          ✨ Creative
                        </span>
                      )}
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: `${demandColor[idea.searchDemand]}20`, color: demandColor[idea.searchDemand], border: `1px solid ${demandColor[idea.searchDemand]}40` }}>
                        📈 {idea.searchDemand} Demand
                      </span>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: `${competitionColor[idea.competition]}20`, color: competitionColor[idea.competition], border: `1px solid ${competitionColor[idea.competition]}40` }}>
                        ⚔️ {idea.competition} Competition
                      </span>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
                        👁️ {idea.estimatedViews} views
                      </span>
                      {/* Probability ring */}
                      <span style={{
                        padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
                        background: `${getProbabilityColor(idea.successProbability)}20`,
                        color: getProbabilityColor(idea.successProbability),
                        border: `1px solid ${getProbabilityColor(idea.successProbability)}40`,
                      }}>
                        🎯 {idea.successProbability}% success
                      </span>
                    </div>
                  </div>
                  {/* Tray button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTray(idea); }}
                    style={{
                      padding: "8px 16px",
                      background: inTray ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${inTray ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.15)"}`,
                      borderRadius: "8px",
                      color: inTray ? "#c4b5fd" : "#94a3b8",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {inTray ? "✅ In Tray" : "➕ Add to Tray"}
                  </button>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hook</p>
                        <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0, fontStyle: "italic" }}>&ldquo;{idea.hook}&rdquo;</p>
                      </div>
                      <div>
                        <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Why Now</p>
                        <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0 }}>{idea.whyNow}</p>
                      </div>
                      <div>
                        <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Target Audience</p>
                        <p style={{ color: "#e2e8f0", fontSize: "14px", margin: 0 }}>{idea.targetAudience}</p>
                      </div>
                      <div>
                        <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>SEO Keywords</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {(idea.seoKeywords || []).map((kw, ki) => (
                            <span key={ki} style={{ padding: "2px 8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "6px", color: "#a5b4fc", fontSize: "11px" }}>
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <p style={{ color: "#64748b", fontSize: "12px", margin: "12px 0 0", textAlign: "right" }}>
                  {expanded ? "▲ Less" : "▼ View details"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && ideas.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <span style={{ fontSize: "64px", display: "block", marginBottom: "16px" }}>🔍</span>
          <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: "20px", margin: "0 0 8px" }}>Researching YouTube Trends</h3>
          <p style={{ color: "#94a3b8" }}>Click &ldquo;Refresh Ideas&rdquo; to analyze the latest trends for Indian audience</p>
        </div>
      )}

    </div>
  );
}

export default function IdeasPage() {
  return <IdeasPageInner />;
}
