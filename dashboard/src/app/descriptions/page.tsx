"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VideoTrayPanel from "@/components/VideoTrayPanel";
import { saveToLibrary } from "@/hooks/useContentLibrary";

function DescriptionGeneratorInner() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState(searchParams.get("topic") || "");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = searchParams.get("topic");
    if (t) setTopic(decodeURIComponent(t));
  }, [searchParams]);

  const generateDescription = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/descriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      const result = data.description || data.error || "";
      setDescription(result);
      if (data.description) {
        saveToLibrary("description", topic, data.description);
      }
    } catch (e) {
      setDescription("Error: " + String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
        <div>
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#f8fafc", margin: "0 0 8px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span>💬</span> Description Gen
            </h1>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
              SEO-optimized YouTube descriptions · English only · Tags + Chapters included
            </p>
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
                placeholder="e.g., n8n automation tutorial for beginners India"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{
                  flex: 1, padding: "12px 16px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
                  color: "#f8fafc", fontSize: "15px", outline: "none",
                }}
                onKeyDown={(e) => e.key === "Enter" && generateDescription()}
              />
              <button
                onClick={generateDescription}
                disabled={isLoading || !topic.trim()}
                style={{
                  padding: "10px 24px",
                  background: isLoading || !topic.trim() ? "rgba(16,185,129,0.3)" : "linear-gradient(135deg, #059669, #10b981)",
                  border: "none", borderRadius: "10px", color: "#fff",
                  fontWeight: 600, cursor: isLoading || !topic.trim() ? "not-allowed" : "pointer",
                  fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
                  minWidth: "180px", justifyContent: "center",
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    Generating...
                  </>
                ) : "💬 Generate Description"}
              </button>
            </div>
          </div>

          {description && (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: "16px",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 20px",
                background: "rgba(16,185,129,0.1)",
                borderBottom: "1px solid rgba(16,185,129,0.2)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ color: "#6ee7b7", fontWeight: 600, fontSize: "14px" }}>💬 YouTube Description</span>
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
                  whiteSpace: "pre-wrap", fontFamily: "'Geist Mono', monospace",
                  fontSize: "13px", lineHeight: "1.7", color: "#e2e8f0", margin: 0,
                }}>
                  {description}
                </pre>
              </div>
            </div>
          )}

          {!description && !isLoading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <span style={{ fontSize: "56px", display: "block", marginBottom: "16px" }}>💬</span>
              <h3 style={{ color: "#f8fafc", fontWeight: 600, margin: "0 0 8px" }}>Ready to write your description?</h3>
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Enter topic above or pick from your Video Tray →</p>
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

export default function DescriptionsPage() {
  return (
    <Suspense>
      <DescriptionGeneratorInner />
    </Suspense>
  );
}
