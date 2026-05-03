"use client";

import { useState, useEffect } from "react";

interface Video { title: string; views: number; likes: number; comments: number; thumbnail: string; engagement_rate: number; }
interface Channel { name: string; subscribers: number; total_views: number; video_count: number; }
interface AiInsight { category: string; title: string; insight: string; action: string; impact: string; emoji: string; }

export default function InsightsPage() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<AiInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsCachedAt, setInsightsCachedAt] = useState<number | null>(null);
  const [insightsCached, setInsightsCached] = useState(false);

  useEffect(() => {
    fetch("/api/youtube")
      .then((r) => r.json())
      .then((d) => {
        setChannel(d.channel || null);
        setVideos(Array.isArray(d.videos) ? d.videos : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load AI insights
    setInsightsLoading(true);
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => {
        setAiInsights(d.insights || []);
        setInsightsCachedAt(d.generatedAt || null);
        setInsightsCached(d.cached || false);
      })
      .catch(console.error)
      .finally(() => setInsightsLoading(false));
  }, []);

  const fmt = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  const subs = channel?.subscribers || 359;
  const totalViews = channel?.total_views || 9600;
  const videoCount = channel?.video_count || 12;
  const watchHours = 430;
  const avgViews = videoCount > 0 ? Math.round(totalViews / videoCount) : 0;
  const subsProgress = Math.min((subs / 500) * 100, 100);
  const hoursProgress = Math.min((watchHours / 4000) * 100, 100);
  const yppProgress = Math.min((subsProgress + hoursProgress) / 2, 100);

  const topVideo = videos.length > 0
    ? videos.reduce((a, b) => (a.views > b.views ? a : b))
    : null;

  const totalLikes = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const avgEngagement = videos.length > 0
    ? (videos.reduce((s, v) => s + (v.engagement_rate || 0), 0) / videos.length).toFixed(1)
    : "0";

  const metrics = [
    { label: "Subscribers", value: fmt(subs), sub: `${500 - subs} to YPP`, emoji: "👥", color: "#ef4444", bar: subsProgress, barColor: "#ef4444" },
    { label: "Total Views", value: fmt(totalViews), sub: "all time", emoji: "👁️", color: "#8b5cf6", bar: 65, barColor: "#8b5cf6" },
    { label: "Watch Hours", value: fmt(watchHours), sub: `${3000 - watchHours} to YPP`, emoji: "⏱️", color: "#f97316", bar: hoursProgress, barColor: "#f97316" },
    { label: "Videos Published", value: videoCount.toString(), sub: "on channel", emoji: "🎬", color: "#06b6d4", bar: Math.min((videoCount / 24) * 100, 100), barColor: "#06b6d4" },
    { label: "Avg Views/Video", value: fmt(avgViews), sub: "per video", emoji: "📊", color: "#10b981", bar: Math.min((avgViews / 5000) * 100, 100), barColor: "#10b981" },
    { label: "Total Likes", value: fmt(totalLikes), sub: "all videos", emoji: "❤️", color: "#ec4899", bar: Math.min((totalLikes / 1000) * 100, 100), barColor: "#ec4899" },
  ];

  const goals = [
    { name: "YouTube Partner Program", current: subs, target: 500, unit: "subs", emoji: "🎯", pct: subsProgress },
    { name: "Watch Hours (YPP)", current: watchHours, target: 4000, unit: "hrs", emoji: "⏱️", pct: hoursProgress },
    { name: "30-Day Video Goal", current: 0, target: 8, unit: "videos", emoji: "🎬", pct: 0 },
    { name: "Revenue Goal (Month 1)", current: 0, target: 5000, unit: "₹", emoji: "💰", pct: 0 },
    { name: "Telegram Community", current: 0, target: 200, unit: "members", emoji: "✈️", pct: 0 },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📈</div>
          <p style={{ color: "#94a3b8" }}>Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "white", marginBottom: "6px" }}>
          📈 Insights &amp; Analytics
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>Deep-dive into your channel performance and growth trajectory</p>
      </div>

      {/* AI Insights Panel — Claude powered, 24h cached */}
      <div style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.08))",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: "20px",
        padding: "24px",
        marginBottom: "28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h2 style={{ color: "#f8fafc", fontWeight: 700, fontSize: "18px", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🤖</span> AI-Powered Daily Insights
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              {insightsCachedAt
                ? `${insightsCached ? "Reusing today's insights" : "Fresh insights"} · Generated ${new Date(insightsCachedAt).toLocaleString()} · Refreshes in 24h`
                : "Claude analyzes your channel data once per day"}
            </p>
          </div>
          {insightsCached && (
            <span style={{ padding: "4px 12px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "20px", color: "#10b981", fontSize: "11px", fontWeight: 600 }}>
              ✓ Cached · Saving API credits
            </span>
          )}
        </div>

        {insightsLoading && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ width: "36px", height: "36px", border: "3px solid rgba(139,92,246,0.3)", borderTop: "3px solid #8b5cf6", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Claude is analyzing your channel data...</p>
          </div>
        )}

        {!insightsLoading && aiInsights.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
            {aiInsights.map((ins, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: "16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{ins.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#f8fafc", fontWeight: 600, fontSize: "13px", margin: 0 }}>{ins.title}</p>
                    <span style={{
                      display: "inline-block", padding: "1px 8px",
                      background: ins.impact === "High" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                      border: `1px solid ${ins.impact === "High" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                      borderRadius: "10px", color: ins.impact === "High" ? "#fca5a5" : "#fcd34d",
                      fontSize: "10px", fontWeight: 600, marginTop: "3px",
                    }}>
                      {ins.impact} Impact · {ins.category}
                    </span>
                  </div>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5", margin: "0 0 10px" }}>{ins.insight}</p>
                <div style={{ background: "rgba(139,92,246,0.1)", borderRadius: "8px", padding: "8px 12px" }}>
                  <p style={{ color: "#c4b5fd", fontSize: "12px", fontWeight: 500, margin: 0 }}>
                    ⚡ Do today: {ins.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!insightsLoading && aiInsights.length === 0 && (
          <p style={{ color: "#64748b", textAlign: "center", padding: "20px 0" }}>
            No insights yet — check back after your YouTube data is loaded
          </p>
        )}
      </div>

      {/* YPP Progress Banner */}
      <div style={{
        padding: "24px 28px",
        background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 50%, rgba(6,182,212,0.1) 100%)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: "20px",
        marginBottom: "28px",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        flexWrap: "wrap"
      }}>
        <span style={{ fontSize: "48px" }}>🏆</span>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: "18px", marginBottom: "6px" }}>
            YouTube Partner Program — {yppProgress.toFixed(0)}% Complete
          </div>
          <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "14px" }}>
            Need {500 - subs} more subscribers &amp; {3000 - watchHours} more watch hours
          </div>
          <div style={{ height: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${yppProgress}%`,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
              borderRadius: "6px",
              transition: "width 1s ease"
            }} />
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#818cf8", fontSize: "32px", fontWeight: 800 }}>{yppProgress.toFixed(0)}%</div>
          <div style={{ color: "#64748b", fontSize: "12px" }}>Overall progress</div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "18px",
            padding: "22px",
            transition: "transform 0.2s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "28px" }}>{m.emoji}</span>
              <span style={{
                fontSize: "11px", fontWeight: 600, padding: "4px 10px",
                borderRadius: "20px",
                background: `${m.color}22`,
                color: m.color,
                border: `1px solid ${m.color}44`
              }}>{m.sub}</span>
            </div>
            <div style={{ fontSize: "30px", fontWeight: 800, color: "white", marginBottom: "4px" }}>{m.value}</div>
            <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px" }}>{m.label}</div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${m.bar}%`,
                background: `linear-gradient(90deg, ${m.barColor}, ${m.barColor}99)`,
                borderRadius: "3px"
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Goals + Top Video */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* Goals */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "20px",
          padding: "24px"
        }}>
          <h3 style={{ color: "white", fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>🎯 Goal Tracker</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {goals.map((g) => (
              <div key={g.name}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 500, color: "#e2e8f0" }}>
                    <span>{g.emoji}</span> {g.name}
                  </span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{g.current} / {g.target} {g.unit}</span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${g.pct}%`,
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    borderRadius: "4px",
                    minWidth: g.pct > 0 ? "8px" : "0"
                  }} />
                </div>
                <div style={{ textAlign: "right", fontSize: "11px", color: "#475569", marginTop: "4px" }}>{g.pct.toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top performer + avg engagement */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Top Video */}
          <div style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: "20px",
            padding: "22px",
            flex: 1
          }}>
            <h3 style={{ color: "white", fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>🏅 Top Performer</h3>
            {topVideo ? (
              <>
                <p style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 500, marginBottom: "12px", lineHeight: 1.4 }}>{topVideo.title}</p>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#34d399", fontSize: "22px", fontWeight: 700 }}>{fmt(topVideo.views)}</div>
                    <div style={{ color: "#64748b", fontSize: "11px" }}>Views</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#f472b6", fontSize: "22px", fontWeight: 700 }}>{fmt(topVideo.likes || 0)}</div>
                    <div style={{ color: "#64748b", fontSize: "11px" }}>Likes</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#818cf8", fontSize: "22px", fontWeight: 700 }}>{topVideo.engagement_rate?.toFixed(1) || "0"}%</div>
                    <div style={{ color: "#64748b", fontSize: "11px" }}>Eng. Rate</div>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ color: "#64748b", fontSize: "13px" }}>No video data yet</p>
            )}
          </div>

          {/* Avg Engagement */}
          <div style={{
            background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.1))",
            border: "1px solid rgba(236,72,153,0.25)",
            borderRadius: "20px",
            padding: "22px",
          }}>
            <h3 style={{ color: "white", fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>💫 Avg Engagement</h3>
            <div style={{ fontSize: "40px", fontWeight: 800, color: "#f472b6", marginBottom: "4px" }}>{avgEngagement}%</div>
            <p style={{ color: "#94a3b8", fontSize: "12px" }}>across {videoCount} videos</p>
          </div>
        </div>
      </div>

      {/* Video performance table */}
      {videos.length > 0 && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "20px",
          padding: "24px"
        }}>
          <h3 style={{ color: "white", fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>📋 All Videos Performance</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[...videos].sort((a, b) => b.views - a.views).slice(0, 8).map((v, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "14px 16px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)"
              }}>
                <span style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: i === 0 ? "linear-gradient(135deg,#fbbf24,#f97316)" : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "12px", fontWeight: 700, flexShrink: 0
                }}>#{i + 1}</span>
                <p style={{ flex: 1, color: "#e2e8f0", fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</p>
                <div style={{ display: "flex", gap: "20px", flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#818cf8", fontWeight: 600, fontSize: "14px" }}>{fmt(v.views)}</div>
                    <div style={{ color: "#475569", fontSize: "11px" }}>views</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#f472b6", fontWeight: 600, fontSize: "14px" }}>{fmt(v.likes || 0)}</div>
                    <div style={{ color: "#475569", fontSize: "11px" }}>likes</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#34d399", fontWeight: 600, fontSize: "14px" }}>{(v.engagement_rate || 0).toFixed(1)}%</div>
                    <div style={{ color: "#475569", fontSize: "11px" }}>eng.</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
