"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VideoTrayPanel from "@/components/VideoTrayPanel";
import { saveToLibrary } from "@/hooks/useContentLibrary";

type ContentType = "linkedin" | "twitter" | "hashtags";

const TYPE_CONFIG: Record<ContentType, { label: string; emoji: string; color: string; placeholder: string }> = {
  linkedin: { label: "LinkedIn Post", emoji: "💼", color: "#0a66c2", placeholder: "e.g., How I automated my workflow using n8n" },
  twitter: { label: "Twitter/X Thread", emoji: "🐦", color: "#1da1f2", placeholder: "e.g., 5 AI tools Indian developers need in 2025" },
  hashtags: { label: "YouTube Hashtags", emoji: "#️⃣", color: "#ff0000", placeholder: "e.g., Claude AI tutorial for beginners" },
};

function GeneratePageInner() {
  const searchParams = useSearchParams();
  const [type, setType] = useState<ContentType>((searchParams.get("type") as ContentType) || "linkedin");
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = searchParams.get("topic");
    const ty = searchParams.get("type") as ContentType;
    if (t) setTopic(decodeURIComponent(t));
    if (ty && TYPE_CONFIG[ty]) setType(ty);
  }, [searchParams]);

  const generate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type }),
      });
      const data = await res.json();
      const result = data.content || data.error || "";
      setContent(result);
      if (data.content) {
        saveToLibrary(type, topic, data.content, { contentType: type });
      }
    } catch (e) {
      setContent("Error: " + String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cfg = TYPE_CONFIG[type];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
        <div>
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#f8fafc", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span>🚀</span> Social Content Generator
            </h1>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
              Generate platform-optimized content · English · SEO + Ranking algorithm aware
            </p>
          </div>

          {/* Type tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {(Object.entries(TYPE_CONFIG) as [ContentType, typeof TYPE_CONFIG[ContentType]][]).map(([t, cfg]) => (
              <button
                key={t}
                onClick={() => { setType(t); setContent(""); }}
                style={{
                  padding: "8px 18px",
                  background: type === t ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${type === t ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "10px",
                  color: type === t ? "#c4b5fd" : "#94a3b8",
                  fontWeight: type === t ? 600 : 400,
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {cfg.emoji} {cfg.label}
              </button>
            ))}
          </div>

          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
          }}>
            <label style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
              Video Topic (English)
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <input
                type="text"
                placeholder={cfg.placeholder}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{
                  flex: 1, padding: "12px 16px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
                  color: "#f8fafc", fontSize: "15px", outline: "none",
                }}
                onKeyDown={(e) => e.key === "Enter" && generate()}
              />
              <button
                onClick={generate}
                disabled={isLoading || !topic.trim()}
                style={{
                  padding: "10px 24px",
                  background: isLoading || !topic.trim() ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  border: "none", borderRadius: "10px", color: "#fff",
                  fontWeight: 600, cursor: isLoading || !topic.trim() ? "not-allowed" : "pointer",
                  fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
                  minWidth: "170px", justifyContent: "center",
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    Generating...
                  </>
                ) : `${cfg.emoji} Generate ${cfg.label}`}
              </button>
            </div>
          </div>

          {content && (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "16px",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 20px",
                background: "rgba(139,92,246,0.1)",
                borderBottom: "1px solid rgba(139,92,246,0.2)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ color: "#c4b5fd", fontWeight: 600, fontSize: "14px" }}>{cfg.emoji} {cfg.label}</span>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: "6px 14px", background: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.07)",
                    border: `1px solid ${copied ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.12)"}`,
                    borderRadius: "8px", color: copied ? "#10b981" : "#94a3b8",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
              <div style={{ padding: "20px" }}>
                <pre style={{
                  whiteSpace: "pre-wrap", fontFamily: type === "hashtags" ? "'Geist Mono', monospace" : "inherit",
                  fontSize: "14px", lineHeight: "1.7", color: "#e2e8f0", margin: 0,
                }}>
                  {content}
                </pre>
              </div>
            </div>
          )}

          {!content && !isLoading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <span style={{ fontSize: "56px", display: "block", marginBottom: "16px" }}>{cfg.emoji}</span>
              <h3 style={{ color: "#f8fafc", fontWeight: 600, margin: "0 0 8px" }}>Generate {cfg.label}</h3>
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Enter a topic or pick from your Video Tray →</p>
            </div>
          )}
        </div>

        <div style={{ paddingTop: "80px" }}>
          <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px" }}>
            📌 Your Video Tray
          </p>
          <VideoTrayPanel compact />
        </div>
      </div>

      <style>{`input::placeholder { color: #4b5563; }`}</style>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense>
      <GeneratePageInner />
    </Suspense>
  );
}
